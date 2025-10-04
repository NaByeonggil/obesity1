import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - 예약 상태 업데이트 (의사: 승인/취소, 환자: 취소)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const appointmentId = params.id
    const body = await request.json()
    const { status, cancelReason } = body

    // 예약 조회
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // 권한 확인
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isPatient = user.id === appointment.patientId
    const isDoctor = user.id === appointment.doctorId

    if (!isPatient && !isDoctor) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this appointment' },
        { status: 403 }
      )
    }

    // 상태 변경 규칙
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: []
    }

    if (!allowedTransitions[appointment.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot change status from ${appointment.status} to ${status}` },
        { status: 400 }
      )
    }

    // 환자는 취소만 가능
    if (isPatient && status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Patients can only cancel appointments' },
        { status: 403 }
      )
    }

    // 예약 업데이트
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        ...(cancelReason && { notes: `${appointment.notes || ''}\n취소 사유: ${cancelReason}` }),
        updatedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          }
        },
        clinic: {
          select: {
            id: true,
            name: true,
            address: true,
            phoneNumber: true,
          }
        }
      }
    })

    // TODO: 실시간 알림 전송 (푸시 알림, 이메일 등)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAppointment.id,
        date: updatedAppointment.date.toISOString().split('T')[0],
        time: updatedAppointment.time,
        status: updatedAppointment.status,
        type: updatedAppointment.type,
        symptoms: updatedAppointment.symptoms,
        notes: updatedAppointment.notes,
        patient: {
          id: updatedAppointment.patient.id,
          name: updatedAppointment.patient.name,
          email: updatedAppointment.patient.email,
        },
        doctor: {
          id: updatedAppointment.doctor.id,
          name: updatedAppointment.doctor.name,
          specialization: updatedAppointment.doctor.specialization,
        },
        clinic: updatedAppointment.clinic ? {
          id: updatedAppointment.clinic.id,
          name: updatedAppointment.clinic.name,
          address: updatedAppointment.clinic.address,
          phoneNumber: updatedAppointment.clinic.phoneNumber,
        } : null,
        updatedAt: updatedAppointment.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Update appointment status error:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment status' },
      { status: 500 }
    )
  }
}
