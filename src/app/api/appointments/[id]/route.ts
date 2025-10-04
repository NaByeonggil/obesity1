import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromAuthHeader } from '@/lib/auth'

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
type UserRole = 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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
            specialization: true,
            clinic: true,
            avatar: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            consultationType: true
          }
        },
        prescription: {
          select: {
            id: true,
            prescriptionNumber: true,
            status: true,
            issuedAt: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Check authorization
    if (payload.role === UserRole.PATIENT && appointment.patientId !== payload.userId) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    if (payload.role === UserRole.DOCTOR && appointment.doctorId !== payload.userId) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ appointment })

  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    const { status, notes } = await request.json()

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Check authorization based on role
    if (payload.role === UserRole.PATIENT && appointment.patientId !== payload.userId) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    if (payload.role === UserRole.DOCTOR && appointment.doctorId !== payload.userId) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // Validate status if provided
    if (status && !Object.values(AppointmentStatus).includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      )
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        updatedAt: new Date()
      },
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
            specialization: true,
            clinic: true,
            avatar: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            consultationType: true
          }
        },
        prescription: {
          select: {
            id: true,
            prescriptionNumber: true,
            status: true,
            issuedAt: true
          }
        }
      }
    })

    return NextResponse.json({
      message: '예약이 성공적으로 업데이트되었습니다.',
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}