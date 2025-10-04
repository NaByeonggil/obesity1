import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

// 처방전 목록 조회 (의사용)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Invalid token or unauthorized role' }, { status: 401 })
    }

    // 의사의 처방전 목록 조회
    const prescriptions = await prisma.prescriptions.findMany({
      where: {
        doctorId: session.user.id
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        appointments: {
          select: {
            id: true,
            type: true,
            status: true,
            appointmentDate: true,
            symptoms: true,
            departments: {
              select: {
                name: true
              }
            }
          }
        },
        prescription_medications: {
          include: {
            medications: {
              select: {
                name: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 처방전 통계 계산
    const totalPrescriptions = prescriptions.length
    const todayPrescriptions = prescriptions.filter(p => {
      const today = new Date()
      const prescriptionDate = new Date(p.issuedAt)
      return prescriptionDate.toDateString() === today.toDateString()
    }).length
    const pendingPrescriptions = prescriptions.filter(p => p.status === 'ISSUED').length
    const completedPrescriptions = prescriptions.filter(p => p.status === 'DISPENSED').length

    // 처방전 데이터 포맷팅
    const formattedPrescriptions = prescriptions.map(prescription => {
      const issuedDate = new Date(prescription.issuedAt)
      const validDate = new Date(prescription.validUntil)

      return {
        id: prescription.id,
        prescriptionNumber: prescription.prescriptionNumber,
        patient: prescription.users_prescriptions_patientIdTousers,
        appointment: prescription.appointments ? {
          id: prescription.appointments.id,
          type: prescription.appointments.type,
          status: prescription.appointments.status,
          date: prescription.appointments.appointmentDate.toLocaleDateString('ko-KR'),
          symptoms: prescription.appointments.symptoms,
          department: prescription.appointments.departments.name
        } : null,
        status: prescription.status,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        issuedAt: issuedDate.toLocaleDateString('ko-KR'),
        validUntil: validDate.toLocaleDateString('ko-KR'),
        totalPrice: prescription.totalPrice,
        medications: prescription.prescription_medications.map(pm => ({
          id: pm.id,
          name: pm.medications.name,
          description: pm.medications.description,
          dosage: pm.dosage,
          frequency: pm.frequency,
          duration: pm.duration,
          quantity: pm.quantity,
          price: pm.price,
          substituteAllowed: pm.substituteAllowed
        }))
      }
    })

    return NextResponse.json({
      success: true,
      prescriptions: formattedPrescriptions,
      stats: {
        totalPrescriptions,
        todayPrescriptions,
        pendingPrescriptions,
        completedPrescriptions
      }
    })

  } catch (error) {
    console.error('Prescription fetch error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// 새 처방전 생성 (비대면 진료 승인된 예약만 가능)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Invalid token or unauthorized role' }, { status: 401 })
    }

    // FormData 파싱
    const formData = await request.formData()
    const appointmentId = formData.get('appointmentId') as string
    const diagnosis = formData.get('diagnosis') as string
    const notes = formData.get('notes') as string
    const medicationsStr = formData.get('medications') as string
    const pdfFile = formData.get('pdfFile') as File | null

    const medications = medicationsStr ? JSON.parse(medicationsStr) : []

    // 예약 정보 확인 - 비대면 진료이면서 승인된 상태인지 검증
    const appointment = await prisma.appointments.findUnique({
      where: { id: appointmentId },
      include: {
        users_appointments_patientIdTousers: {
          select: { id: true, name: true }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ success: false, error: '예약을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (appointment.doctorId !== session.user.id) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 })
    }

    // 비대면 진료인지 확인
    if (appointment.type !== 'ONLINE') {
      return NextResponse.json({
        success: false,
        error: '처방전은 비대면 진료에서만 발행 가능합니다.'
      }, { status: 400 })
    }

    // 승인된 예약인지 확인
    if (appointment.status !== 'CONFIRMED') {
      return NextResponse.json({
        success: false,
        error: '승인된 예약에서만 처방전을 발행할 수 있습니다.'
      }, { status: 400 })
    }

    // 이미 처방전이 있는지 확인
    const existingPrescription = await prisma.prescriptions.findUnique({
      where: { appointmentId }
    })

    if (existingPrescription) {
      return NextResponse.json({
        success: false,
        error: '이미 처방전이 발행된 예약입니다.'
      }, { status: 400 })
    }

    // 처방전 번호 생성 (YYYYMMDD-HHMMSS-RRR 형식)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const prescriptionNumber = `${dateStr}-${timeStr}-${randomStr}`

    // 총 가격 계산
    const totalPrice = medications.reduce((sum: number, med: any) => sum + (med.price || 0), 0)

    // 유효기간 설정 (7일)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 7)

    // 처방전 ID 생성
    const prescriptionId = `presc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    // PDF 파일 저장 (업로드된 경우)
    let pdfPath: string | null = null
    if (pdfFile) {
      try {
        // public/prescriptions 디렉토리 생성
        const uploadDir = join(process.cwd(), 'public', 'prescriptions')
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // 파일명 생성 (처방전ID_환자명_날짜.pdf)
        const fileName = `${prescriptionId}_${appointment.users_appointments_patientIdTousers.name}_${dateStr}.pdf`
        const filePath = join(uploadDir, fileName)

        // 파일 저장
        const bytes = await pdfFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        pdfPath = `/prescriptions/${fileName}`
        console.log('PDF 파일 저장 완료:', pdfPath)
      } catch (error) {
        console.error('PDF 파일 저장 오류:', error)
        // PDF 저장 실패해도 처방전은 생성
      }
    }

    // 약물 정보 필터링 (빈 약물명 제거)
    const validMedications = medications.filter((med: any) => med.medicationId && med.medicationId.trim() !== '')

    // 처방전 생성
    const prescription = await prisma.prescriptions.create({
      data: {
        id: prescriptionId,
        prescriptionNumber,
        patientId: appointment.patientId,
        doctorId: session.user.id,
        appointmentId,
        diagnosis,
        notes: pdfPath ? `${notes}\n[첨부 PDF: ${pdfPath}]` : notes,
        totalPrice,
        validUntil,
        updatedAt: new Date(),
        ...(validMedications.length > 0 && {
          prescription_medications: {
            create: validMedications.map((med: any) => ({
              id: `pm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
              medicationId: med.medicationId,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              quantity: med.quantity,
              substituteAllowed: med.substituteAllowed || false,
              price: med.price || 0
            }))
          }
        })
      },
      include: {
        prescription_medications: {
          include: {
            medications: {
              select: {
                name: true,
                description: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: pdfPath
        ? '처방전이 성공적으로 발행되었습니다. (PDF 첨부 완료)'
        : '처방전이 성공적으로 발행되었습니다.',
      prescription: {
        id: prescription.id,
        prescriptionNumber: prescription.prescriptionNumber,
        diagnosis: prescription.diagnosis,
        totalPrice: prescription.totalPrice,
        validUntil: prescription.validUntil.toLocaleDateString('ko-KR'),
        pdfPath: pdfPath, // PDF 파일 경로 추가
        medications: prescription.prescription_medications.map((pm: any) => ({
          name: pm.medications.name,
          dosage: pm.dosage,
          frequency: pm.frequency,
          duration: pm.duration,
          quantity: pm.quantity
        }))
      }
    })

  } catch (error) {
    console.error('Prescription creation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// 처방전 상태 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Invalid token or unauthorized role' }, { status: 401 })
    }

    const body = await request.json()
    const { prescriptionId, status, notes } = body

    // 처방전 존재 확인 및 권한 검증
    const prescription = await prisma.prescriptions.findUnique({
      where: { id: prescriptionId }
    })

    if (!prescription) {
      return NextResponse.json({ success: false, error: '처방전을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (prescription.doctorId !== session.user.id) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 })
    }

    // 처방전 업데이트
    const updatedPrescription = await prisma.prescriptions.update({
      where: { id: prescriptionId },
      data: {
        status,
        notes: notes || prescription.notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '처방전이 업데이트되었습니다.',
      prescription: updatedPrescription
    })

  } catch (error) {
    console.error('Prescription update error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}