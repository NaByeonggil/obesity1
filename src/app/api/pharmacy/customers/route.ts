import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET: 처방전을 전송받은 고객 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role?.toLowerCase() !== 'pharmacy') {
      return NextResponse.json(
        { error: '약국만 접근 가능합니다.' },
        { status: 403 }
      )
    }

    // 현재 약국으로 전송된 처방전들의 환자 정보를 조회
    const prescriptions = await prisma.prescriptions.findMany({
      where: {
        pharmacyId: session.user.id
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        prescription_medications: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    })

    // 환자별로 그룹화
    const customerMap = new Map<string, any>()

    prescriptions.forEach(prescription => {
      const patient = prescription.users_prescriptions_patientIdTousers
      if (!patient) return

      if (!customerMap.has(patient.id)) {
        customerMap.set(patient.id, {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          firstVisit: prescription.issuedAt,
          lastVisit: prescription.issuedAt,
          totalPrescriptions: 0,
          totalAmount: 0,
          prescriptions: []
        })
      }

      const customer = customerMap.get(patient.id)

      // 최초/최근 방문일 업데이트
      if (new Date(prescription.issuedAt) < new Date(customer.firstVisit)) {
        customer.firstVisit = prescription.issuedAt
      }
      if (new Date(prescription.issuedAt) > new Date(customer.lastVisit)) {
        customer.lastVisit = prescription.issuedAt
      }

      // 통계 업데이트
      customer.totalPrescriptions += 1
      customer.totalAmount += prescription.totalPrice

      // 처방전 내역 추가
      customer.prescriptions.push({
        id: prescription.id,
        prescriptionNumber: prescription.prescriptionNumber,
        issuedAt: prescription.issuedAt,
        status: prescription.status,
        totalPrice: prescription.totalPrice,
        diagnosis: prescription.diagnosis,
        medicationCount: prescription.prescription_medications.length
      })
    })

    // Map을 배열로 변환
    const customers = Array.from(customerMap.values())

    // 최근 방문일 기준으로 정렬
    customers.sort((a, b) =>
      new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    )

    return NextResponse.json({
      customers,
      total: customers.length
    })

  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { error: '고객 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
