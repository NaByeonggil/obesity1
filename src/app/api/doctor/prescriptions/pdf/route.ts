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
      return NextResponse.json({ error: '처방전을 찾을 수 없습니다' }, { status: 404 })
    }

    // PDF 데이터 형식으로 변환
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