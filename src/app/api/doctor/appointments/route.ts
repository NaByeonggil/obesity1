import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - 의사의 예약 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json({ error: '의사만 접근 가능합니다' }, { status: 403 })
    }

    // 의사의 예약 목록 조회
    const appointments = await prisma.appointments.findMany({
      where: {
        doctorId: session.user.id
      },
      include: {
        users_appointments_patientIdTousers: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            consultationType: true
          }
        },
        prescriptions: {
          select: {
            id: true,
            prescriptionNumber: true,
            status: true,
            issuedAt: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    // 프론트엔드 형식으로 변환
    const formattedAppointments = appointments.map((appointment: any) => {
      const appointmentDate = new Date(appointment.appointmentDate)

      return {
        id: appointment.id,
        date: appointmentDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: appointmentDate.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        patient: {
          id: appointment.users_appointments_patientIdTousers?.id || '',
          name: appointment.users_appointments_patientIdTousers?.name || '환자',
          phone: appointment.users_appointments_patientIdTousers?.phone || '',
          email: appointment.users_appointments_patientIdTousers?.email || '',
          avatar: appointment.users_appointments_patientIdTousers?.avatar || ''
        },
        department: appointment.departments?.name || '일반',
        type: appointment.type === 'ONLINE' ? 'online' : 'offline',
        status: appointment.status?.toLowerCase() || 'pending',
        symptoms: appointment.symptoms || '',
        notes: appointment.notes || '',
        appointmentDate: appointment.appointmentDate,
        hasPrescription: !!appointment.prescriptions
      }
    })

    // 통계 데이터 계산
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = formattedAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.appointmentDate)
      return aptDate >= today && aptDate < tomorrow
    })

    const stats = {
      todayAppointments: todayAppointments.length,
      totalAppointments: formattedAppointments.length,
      pendingAppointments: formattedAppointments.filter((apt: any) => apt.status === 'pending').length,
      completedAppointments: formattedAppointments.filter((apt: any) => apt.status === 'completed').length
    }

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
      stats: stats
    })

  } catch (error) {
    console.error('예약 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '예약 조회에 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - 예약 상태 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json({ error: '의사만 접근 가능합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { appointmentId, status, notes } = body

    // 예약이 해당 의사의 것인지 확인
    const appointment = await prisma.appointments.findFirst({
      where: {
        id: appointmentId,
        doctorId: session.user.id
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다' }, { status: 404 })
    }

    // 예약 상태 업데이트
    const updatedAppointment = await prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        status: status.toUpperCase(),
        notes: notes || appointment.notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('예약 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, error: '예약 업데이트에 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}