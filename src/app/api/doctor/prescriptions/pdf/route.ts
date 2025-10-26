import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PDF 처방전 다운로드
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json({ error: '의사만 접근 가능합니다' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const prescriptionId = searchParams.get('id')

    console.log('[Doctor PDF API] 처방전 ID:', prescriptionId)
    console.log('[Doctor PDF API] 의사 ID:', session.user.id)

    if (!prescriptionId) {
      return NextResponse.json({ error: '처방전 ID가 필요합니다' }, { status: 400 })
    }

    // 처방전 정보 조회
    const prescription = await prisma.prescriptions.findFirst({
      where: {
        id: prescriptionId,
        doctorId: session.user.id // 의사 본인의 처방전만 조회
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        appointments: {
          select: {
            type: true,
            appointmentDate: true
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
        },
        users_prescriptions_doctorIdTousers: {
          select: {
            name: true,
            clinic: true
          }
        }
      }
    })

    if (!prescription) {
      console.log('[Doctor PDF API] 처방전을 찾을 수 없음')
      // 권한 없이 모든 처방전 검색 (디버깅용)
      const anyPrescription = await prisma.prescriptions.findUnique({
        where: { id: prescriptionId }
      })
      if (anyPrescription) {
        console.log('[Doctor PDF API] 처방전은 존재하지만 doctorId 불일치')
        console.log('[Doctor PDF API] DB doctorId:', anyPrescription.doctorId)
      }
      return NextResponse.json({ error: '처방전을 찾을 수 없습니다' }, { status: 404 })
    }

    // 의사가 첨부한 PDF 파일이 있으면 그것을 반환
    if ((prescription as any).pdfFilePath) {
      console.log('[Doctor PDF API] 첨부 PDF 파일 발견:', (prescription as any).pdfFilePath)

      const fs = await import('fs')
      const path = await import('path')

      try {
        const pdfPath = (prescription as any).pdfFilePath
        const filePath = pdfPath.startsWith('http')
          ? pdfPath
          : path.join(process.cwd(), 'public', pdfPath)

        // URL인 경우 fetch로 다운로드
        if (pdfPath.startsWith('http')) {
          const response = await fetch(pdfPath)
          if (!response.ok) {
            throw new Error('PDF 파일 다운로드 실패')
          }
          const buffer = await response.arrayBuffer()

          return new NextResponse(buffer as any, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="prescription_${prescription.prescriptionNumber}.pdf"`
            }
          })
        }

        // 로컬 파일인 경우
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath)

          return new NextResponse(fileBuffer as any, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="prescription_${prescription.prescriptionNumber}.pdf"`
            }
          })
        } else {
          console.log('[Doctor PDF API] 첨부 파일을 찾을 수 없음, 데이터로 반환')
        }
      } catch (fileError) {
        console.error('[Doctor PDF API] 첨부 파일 로드 오류, 데이터로 반환:', fileError)
      }
    }

    // 첨부 PDF가 없거나 로드 실패한 경우 데이터 반환 (react-pdf로 생성용)
    const pdfData = {
      prescriptionNumber: prescription.prescriptionNumber,
      patientName: prescription.users_prescriptions_patientIdTousers?.name || '정보 없음',
      patientPhone: prescription.users_prescriptions_patientIdTousers?.phone || '정보 없음',
      patientEmail: prescription.users_prescriptions_patientIdTousers?.email || '정보 없음',
      doctorName: prescription.users_prescriptions_doctorIdTousers?.name || '정보 없음',
      clinicName: prescription.users_prescriptions_doctorIdTousers?.clinic || '정보 없음',
      diagnosis: prescription.diagnosis,
      notes: prescription.notes || '',
      medications: (prescription.prescription_medications || []).map(pm => ({
        medicationId: pm.medications?.name || pm.medicationId,
        dosage: pm.dosage,
        frequency: pm.frequency,
        duration: pm.duration,
        quantity: pm.quantity,
        price: pm.price || 0
      })),
      issuedAt: prescription.issuedAt.toISOString(),
      appointmentType: prescription.appointments?.type || 'OFFLINE'
    }

    return NextResponse.json({
      success: true,
      data: pdfData
    })

  } catch (error) {
    console.error('PDF 처방전 조회 오류:', error)
    return NextResponse.json(
      { error: 'PDF 처방전 조회에 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}