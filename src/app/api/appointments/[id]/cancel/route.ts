import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const appointmentId = params.id

    // 예약 조회
    const appointment = await prisma.appointments.findUnique({
      where: { id: appointmentId },
      include: {
        users_appointments_patientIdTousers: true,
        users_appointments_doctorIdTousers: true,
        departments: true
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 - 환자 본인이거나 담당 의사만 취소 가능
    const isPatient = session.user.id === appointment.patientId
    const isDoctor = session.user.id === appointment.doctorId

    if (!isPatient && !isDoctor) {
      return NextResponse.json(
        { error: '예약을 취소할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 이미 취소된 예약인지 확인
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: '이미 취소된 예약입니다.' },
        { status: 400 }
      )
    }

    // 이미 완료된 예약인지 확인
    if (appointment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: '완료된 예약은 취소할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 예약 취소
    const updatedAppointment = await prisma.appointments.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        notes: appointment.notes
          ? `${appointment.notes}\n\n[취소] ${session.user.name}님이 ${new Date().toLocaleString('ko-KR')}에 예약을 취소했습니다.`
          : `[취소] ${session.user.name}님이 ${new Date().toLocaleString('ko-KR')}에 예약을 취소했습니다.`,
        updatedAt: new Date()
      },
      include: {
        users_appointments_patientIdTousers: true,
        users_appointments_doctorIdTousers: true,
        departments: true
      }
    })

    // 상대방에게 알림 생성
    const recipientId = isPatient ? appointment.doctorId : appointment.patientId
    const recipientName = isPatient
      ? appointment.users_appointments_doctorIdTousers?.name
      : appointment.users_appointments_patientIdTousers?.name

    await prisma.user_notifications.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId: recipientId,
        title: '예약 취소 알림',
        message: `${session.user.name}님이 ${appointment.departments?.name} 예약을 취소했습니다. (${new Date(appointment.appointmentDate).toLocaleDateString('ko-KR')} ${new Date(appointment.appointmentDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`,
        type: 'APPOINTMENT_CANCELLED',
        read: false,
        createdAt: new Date()
      }
    })

    console.log('✅ 예약 취소 완료:', {
      appointmentId,
      cancelledBy: session.user.name,
      role: isPatient ? 'PATIENT' : 'DOCTOR'
    })

    return NextResponse.json({
      success: true,
      message: '예약이 성공적으로 취소되었습니다.',
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('❌ 예약 취소 오류:', error)
    return NextResponse.json(
      { error: '예약 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
