import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromAuthHeader } from '@/lib/auth'
import { AppointmentType, AppointmentStatus, UserRole } from '@prisma/client'

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
    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const doctorId = searchParams.get('doctorId')

    let whereClause: any = {}

    // Role-based filtering
    if (payload.role === UserRole.PATIENT) {
      whereClause.patientId = payload.userId
    } else if (payload.role === UserRole.DOCTOR) {
      whereClause.doctorId = payload.userId
    }

    // Status filtering
    if (status) {
      whereClause.status = status as AppointmentStatus
    }

    // Doctor filtering (for patients choosing doctors)
    if (doctorId) {
      whereClause.doctorId = doctorId
    }

    const appointments = await prisma.appointment.findMany({
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
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    return NextResponse.json({ appointments })

  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    if (!payload || payload.role !== UserRole.PATIENT) {
      return NextResponse.json(
        { error: '환자만 예약을 생성할 수 있습니다.' },
        { status: 403 }
      )
    }

    const {
      doctorId,
      departmentId,
      type,
      appointmentDate,
      symptoms,
      notes,
      personalInfo
    } = await request.json()

    if (!doctorId || !departmentId || !type || !appointmentDate) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // Validate appointment type
    if (!Object.values(AppointmentType).includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 예약 유형입니다.' },
        { status: 400 }
      )
    }

    // Check if doctor exists
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        role: UserRole.DOCTOR
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: '의사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      return NextResponse.json(
        { error: '진료과를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: payload.userId,
        doctorId,
        departmentId,
        type: type as AppointmentType,
        status: AppointmentStatus.PENDING,
        appointmentDate: new Date(appointmentDate),
        symptoms,
        notes,
        personalInfo: type === AppointmentType.ONLINE ? personalInfo : null
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
        }
      }
    })

    return NextResponse.json({
      message: '예약이 성공적으로 생성되었습니다.',
      appointment
    }, { status: 201 })

  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}