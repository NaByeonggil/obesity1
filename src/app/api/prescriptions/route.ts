import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromAuthHeader } from '@/lib/auth'
import { PrescriptionStatus, UserRole } from '@prisma/client'

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
    const patientId = searchParams.get('patientId')

    let whereClause: any = {}

    // Role-based filtering
    if (payload.role === UserRole.PATIENT) {
      whereClause.appointment = {
        patientId: payload.userId
      }
    } else if (payload.role === UserRole.DOCTOR) {
      whereClause.appointment = {
        doctorId: payload.userId
      }
    }

    // Status filtering
    if (status) {
      whereClause.status = status as PrescriptionStatus
    }

    // Patient filtering (for doctors)
    if (patientId && payload.role === UserRole.DOCTOR) {
      whereClause.appointment = {
        ...whereClause.appointment,
        patientId
      }
    }

    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        appointment: {
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
                name: true
              }
            }
          }
        },
        medications: {
          include: {
            medication: true
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    })

    return NextResponse.json({ prescriptions })

  } catch (error) {
    console.error('Get prescriptions error:', error)
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
    if (!payload || payload.role !== UserRole.DOCTOR) {
      return NextResponse.json(
        { error: '의사만 처방전을 생성할 수 있습니다.' },
        { status: 403 }
      )
    }

    const {
      appointmentId,
      diagnosis,
      notes,
      medications
    } = await request.json()

    if (!appointmentId || !diagnosis || !medications || medications.length === 0) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // Check if appointment exists and belongs to doctor
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: payload.userId
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Generate prescription number
    const prescriptionNumber = `P${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create prescription with medications
    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNumber,
        appointmentId,
        diagnosis,
        notes,
        status: 'PENDING' as any,
        issuedAt: new Date(),
        medications: {
          create: medications.map((med: any) => ({
            medicationId: med.medicationId,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions
          }))
        }
      },
      include: {
        appointment: {
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
                name: true
              }
            }
          }
        },
        medications: {
          include: {
            medication: true
          }
        }
      }
    })

    return NextResponse.json({
      message: '처방전이 성공적으로 생성되었습니다.',
      prescription
    }, { status: 201 })

  } catch (error) {
    console.error('Create prescription error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}