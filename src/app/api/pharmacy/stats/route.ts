import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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
        { error: '약국 계정만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 오늘 날짜 계산
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // 대기 중인 처방전 수 (PENDING 상태)
    const pendingPrescriptions = await prisma.prescriptions.count({
      where: {
        status: 'PENDING'
      }
    })

    // 총 고객 수 (처방전을 가진 고유 환자 수)
    const totalCustomers = await prisma.prescriptions.groupBy({
      by: ['patientId'],
      where: {
        status: {
          in: ['PENDING', 'DISPENSED', 'COMPLETED']
        }
      }
    })

    // 재고 부족 품목 수 (임시로 처방전에서 자주 사용되는 의약품 기준)
    const lowStockItems = await prisma.medications.count({
      where: {
        // 임시 조건: 재고 관리 기능이 없으므로 샘플 데이터로 계산
        name: {
          in: ['마운자로 2.5mg', '위고비 0.25mg', '삭센다 3ml']
        }
      }
    })

    // 오늘 완료된 처방전 수
    const completedToday = await prisma.prescriptions.count({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // 이번 달 신규 고객 수 (트렌드 계산용)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisMonthNewCustomers = await prisma.prescriptions.groupBy({
      by: ['patientId'],
      where: {
        createdAt: {
          gte: startOfMonth
        }
      },
      _min: {
        createdAt: true
      }
    })

    const newCustomersThisMonth = thisMonthNewCustomers.filter((customer: any) =>
      customer._min.createdAt && customer._min.createdAt >= startOfMonth
    ).length

    return NextResponse.json({
      stats: {
        pendingPrescriptions,
        totalCustomers: totalCustomers.length,
        lowStockItems,
        completedToday,
        trends: {
          newCustomersThisMonth
        }
      }
    })

  } catch (error) {
    console.error('Get pharmacy stats error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}