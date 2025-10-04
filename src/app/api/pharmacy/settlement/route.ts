import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET: 일일 정산 내역 조회
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

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        { error: '날짜는 필수입니다.' },
        { status: 400 }
      )
    }

    // 선택한 날짜의 시작과 끝 시간
    const startOfDay = new Date(dateParam)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(dateParam)
    endOfDay.setHours(23, 59, 59, 999)

    // 해당 날짜의 처방전 조회
    const prescriptions = await prisma.prescriptions.findMany({
      where: {
        pharmacyId: session.user.id,
        issuedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            id: true,
            name: true
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

    // 본인 부담금 계산 (30%)
    const PATIENT_PAYMENT_RATE = 0.3
    const INSURANCE_PAYMENT_RATE = 0.7

    let totalAmount = 0
    let patientPayment = 0
    let insurancePayment = 0
    let completedCount = 0
    const uniquePatientIds = new Set<string>()

    const prescriptionList = prescriptions.map(prescription => {
      const totalPrice = prescription.totalPrice
      const patientPay = Math.round(totalPrice * PATIENT_PAYMENT_RATE)
      const insurancePay = Math.round(totalPrice * INSURANCE_PAYMENT_RATE)

      totalAmount += totalPrice
      patientPayment += patientPay
      insurancePayment += insurancePay

      if (prescription.status === 'DISPENSED' || prescription.status === 'COMPLETED') {
        completedCount++
      }

      if (prescription.users_prescriptions_patientIdTousers) {
        uniquePatientIds.add(prescription.users_prescriptions_patientIdTousers.id)
      }

      return {
        id: prescription.id,
        prescriptionNumber: prescription.prescriptionNumber,
        patientName: prescription.users_prescriptions_patientIdTousers?.name || '알 수 없음',
        issuedAt: prescription.issuedAt,
        status: prescription.status,
        totalPrice: totalPrice,
        patientPayment: patientPay,
        insurancePayment: insurancePay,
        medicationCount: prescription.prescription_medications.length
      }
    })

    const settlement = {
      date: dateParam,
      totalPrescriptions: prescriptions.length,
      completedPrescriptions: completedCount,
      totalAmount,
      patientPayment,
      insurancePayment,
      uniquePatients: uniquePatientIds.size,
      prescriptions: prescriptionList
    }

    // 월간 통계 계산
    const selectedDate = new Date(dateParam)
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999)

    const monthlyPrescriptions = await prisma.prescriptions.findMany({
      where: {
        pharmacyId: session.user.id,
        issuedAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        totalPrice: true,
        issuedAt: true
      }
    })

    const monthlyRevenue = monthlyPrescriptions.reduce((sum, p) => sum + p.totalPrice, 0)
    const daysInMonth = selectedDate.getDate() // 현재까지의 일수
    const averageDailyRevenue = daysInMonth > 0 ? monthlyRevenue / daysInMonth : 0

    // 일별 매출 집계
    const dailyRevenue = new Map<string, number>()
    monthlyPrescriptions.forEach(prescription => {
      const date = new Date(prescription.issuedAt).toISOString().split('T')[0]
      dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + prescription.totalPrice)
    })

    // 최고 매출일 찾기
    let topDay = { date: dateParam, revenue: 0 }
    dailyRevenue.forEach((revenue, date) => {
      if (revenue > topDay.revenue) {
        topDay = { date, revenue }
      }
    })

    const monthlyStats = {
      totalRevenue: monthlyRevenue,
      totalPrescriptions: monthlyPrescriptions.length,
      averageDailyRevenue,
      topDay
    }

    return NextResponse.json({
      settlement,
      monthlyStats
    })

  } catch (error) {
    console.error('Get settlement error:', error)
    return NextResponse.json(
      { error: '정산 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
