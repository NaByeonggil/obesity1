import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromAuthHeader } from '@/lib/auth'
import { UserRole } from '@prisma/client'

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

    // 최근 완료된 예약의 환자들 가져오기 (중복 제거)
    const recentPatients = await prisma.appointment.findMany({
      where: {
        doctorId: payload.userId,
        status: 'COMPLETED'
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    })

    // 환자별로 그룹화하고 최근 방문일 계산
    const patientMap = new Map()

    recentPatients.forEach(appointment => {
      const patientId = appointment.patient.id
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: appointment.patient.id,
          name: appointment.patient.name,
          phone: appointment.patient.phone,
          avatar: appointment.patient.avatar,
          lastVisit: appointment.appointmentDate,
          lastSymptoms: appointment.symptoms,
          appointmentCount: 1
        })
      } else {
        const existing = patientMap.get(patientId)
        existing.appointmentCount += 1
        // 더 최근 방문이면 업데이트
        if (new Date(appointment.appointmentDate) > new Date(existing.lastVisit)) {
          existing.lastVisit = appointment.appointmentDate
          existing.lastSymptoms = appointment.symptoms
        }
      }
    })

    // Map을 배열로 변환하고 최근 방문 순으로 정렬
    const patients = Array.from(patientMap.values())
      .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
      .slice(0, 5) // 최대 5명만 반환

    return NextResponse.json({ patients })

  } catch (error) {
    console.error('Get recent patients error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}