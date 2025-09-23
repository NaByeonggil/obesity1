import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromAuthHeader } from '@/lib/auth'
import { UserRole, PrescriptionStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromAuthHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== UserRole.PHARMACY) {
      return NextResponse.json(
        { error: '약국 계정만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (status) {
      whereClause.status = status as PrescriptionStatus
    }

    // 모든 처방전 가져오기 (최근 순으로)
    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            type: true
          }
        },
        medications: {
          include: {
            medication: {
              select: {
                id: true,
                name: true,
                category: true,
                manufacturer: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 처방전 데이터 포맷팅
    const formattedPrescriptions = prescriptions.map(prescription => {
      const totalPrice = prescription.medications.reduce(
        (sum, med) => sum + (med.medication.price * med.quantity),
        0
      )

      return {
        id: prescription.id,
        patientName: prescription.patient.name,
        patientPhone: prescription.patient.phone,
        doctorName: prescription.doctor.name,
        clinic: prescription.doctor.specialization || '전문의',
        receivedTime: prescription.createdAt,
        medications: prescription.medications.map(med => ({
          name: med.medication.name,
          quantity: med.quantity,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          price: med.medication.price,
          manufacturer: med.medication.manufacturer
        })),
        totalPrice,
        status: prescription.status,
        urgent: false, // 긴급 여부는 추후 추가 가능
        diagnosis: prescription.diagnosis,
        notes: prescription.notes
      }
    })

    return NextResponse.json({ prescriptions: formattedPrescriptions })

  } catch (error) {
    console.error('Get pharmacy prescriptions error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}