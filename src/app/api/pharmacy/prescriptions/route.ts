import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 약국의 처방전 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'pharmacy') {
      return NextResponse.json({ error: '약국만 접근 가능합니다' }, { status: 403 })
    }

    // 약국으로 전송된 처방전 목록 조회
    const prescriptions = await prisma.prescriptions.findMany({
      where: {
        pharmacyId: session.user.id
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
        users_prescriptions_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            clinic: true,
            specialization: true
          }
        },
        appointments: {
          include: {
            departments: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        prescription_medications: {
          include: {
            medications: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // 처방전 통계 계산
    const totalPrescriptions = prescriptions.length
    const pendingPrescriptions = prescriptions.filter(p => p.status === 'PENDING').length
    const dispensingPrescriptions = prescriptions.filter(p => p.status === 'DISPENSING').length
    const dispensedPrescriptions = prescriptions.filter(p => p.status === 'DISPENSED').length

    // 처방전 데이터 포맷팅
    const formattedPrescriptions = prescriptions.map(prescription => {
      // 날짜를 안전하게 처리
      const getISODate = (dateValue: any) => {
        if (!dateValue) return null
        try {
          const date = new Date(dateValue)
          return isNaN(date.getTime()) ? null : date.toISOString()
        } catch {
          return null
        }
      }

      return {
        id: prescription.id,
        prescriptionNumber: prescription.prescriptionNumber,
        patient: {
          id: prescription.users_prescriptions_patientIdTousers?.id || '',
          name: prescription.users_prescriptions_patientIdTousers?.name || '환자',
          phone: prescription.users_prescriptions_patientIdTousers?.phone || '',
          email: prescription.users_prescriptions_patientIdTousers?.email || ''
        },
        doctor: {
          id: prescription.users_prescriptions_doctorIdTousers?.id || '',
          name: prescription.users_prescriptions_doctorIdTousers?.name || '담당의',
          clinic: prescription.users_prescriptions_doctorIdTousers?.clinic || '',
          specialization: prescription.users_prescriptions_doctorIdTousers?.specialization || ''
        },
        department: {
          id: prescription.appointments?.departments?.id || '',
          name: prescription.appointments?.departments?.name || '일반'
        },
        status: prescription.status,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        issuedAt: getISODate(prescription.issuedAt),
        validUntil: getISODate(prescription.validUntil),
        totalPrice: prescription.totalPrice,
        medications: prescription.prescription_medications.map(pm => ({
          id: pm.id,
          medicationId: pm.medicationId,
          name: pm.medications.name,
          description: pm.medications.description,
          dosage: pm.dosage,
          frequency: pm.frequency,
          duration: pm.duration,
          quantity: pm.quantity,
          price: pm.price,
          substituteAllowed: pm.substituteAllowed,
          originalPrice: pm.medications.price
        }))
      }
    })

    return NextResponse.json({
      success: true,
      prescriptions: formattedPrescriptions,
      stats: {
        totalPrescriptions,
        pendingPrescriptions,
        dispensingPrescriptions,
        dispensedPrescriptions
      }
    })

  } catch (error) {
    console.error('처방전 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '처방전 조회에 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// 처방전 상태 업데이트 (조제 시작, 조제 완료 등)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'pharmacy') {
      return NextResponse.json({ error: '약국만 접근 가능합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { prescriptionId, status, copayment, substitutions } = body

    // 처방전 존재 확인 및 권한 검증
    const prescription = await prisma.prescriptions.findFirst({
      where: {
        id: prescriptionId,
        pharmacyId: session.user.id
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: '처방전을 찾을 수 없습니다' }, { status: 404 })
    }

    // 처방전 업데이트 데이터 준비
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // 조제 완료 시 본인 부담금 기록
    if (status === 'DISPENSED' && copayment !== undefined) {
      updateData.totalPrice = copayment
    }

    // 대체 조제 정보 기록 (notes에 추가)
    if (substitutions && substitutions.length > 0) {
      const substitutionNotes = substitutions.map((sub: any) =>
        `[대체조제] ${sub.originalMedication} → ${sub.substituteMedication}`
      ).join('\n')

      updateData.notes = prescription.notes
        ? `${prescription.notes}\n\n${substitutionNotes}`
        : substitutionNotes
    }

    // 처방전 업데이트
    const updatedPrescription = await prisma.prescriptions.update({
      where: { id: prescriptionId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: '처방전이 업데이트되었습니다',
      prescription: updatedPrescription
    })

  } catch (error) {
    console.error('처방전 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, error: '처방전 업데이트에 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}