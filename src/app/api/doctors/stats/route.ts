import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromAuthHeader } from '@/lib/auth'
import { UserRole, AppointmentStatus } from '@prisma/client'

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
    if (!payload || payload.role !== UserRole.DOCTOR) {
      return NextResponse.json(
        { error: '의사만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 오늘 날짜 계산
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // 이번 달 시작일 계산
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // 오늘 예약 수
    const todayAppointments = await prisma.appointment.count({
      where: {
        doctorId: payload.userId,
        appointmentDate: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // 총 환자 수 (이 의사에게 예약한 적이 있는 고유 환자 수)
    const totalPatients = await prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        doctorId: payload.userId
      }
    })

    // 대기 중인 예약 수
    const pendingAppointments = await prisma.appointment.count({
      where: {
        doctorId: payload.userId,
        status: AppointmentStatus.PENDING
      }
    })

    // 오늘 완료된 진료 수
    const completedToday = await prisma.appointment.count({
      where: {
        doctorId: payload.userId,
        status: AppointmentStatus.COMPLETED,
        appointmentDate: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // 이번 달 신규 환자 수 (트렌드 계산용)
    const thisMonthNewPatients = await prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        doctorId: payload.userId,
        createdAt: {
          gte: startOfMonth
        }
      },
      _min: {
        createdAt: true
      }
    })

    const newPatientsThisMonth = thisMonthNewPatients.filter(patient =>
      patient._min.createdAt && patient._min.createdAt >= startOfMonth
    ).length

    return NextResponse.json({
      stats: {
        todayAppointments,
        totalPatients: totalPatients.length,
        pendingAppointments,
        completedToday,
        trends: {
          newPatientsThisMonth
        }
      }
    })

  } catch (error) {
    console.error('Get doctor stats error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}