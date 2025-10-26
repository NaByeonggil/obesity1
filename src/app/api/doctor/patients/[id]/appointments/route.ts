import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// 특정 환자의 진료 이력 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 의사 정보 조회
    const doctor = await prisma.users.findUnique({
      where: { email: session.user.email! }
    })

    if (!doctor || doctor.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: '의사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const patientId = params.id

    // 해당 환자의 예약 목록 조회 (이 의사의 예약만)
    const appointments = await prisma.appointments.findMany({
      where: {
        patientId: patientId,
        doctorId: doctor.id
      },
      include: {
        departments: {
          select: {
            name: true
          }
        },
        prescriptions: {
          select: {
            id: true,
            prescriptionNumber: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    // 응답 데이터 포맷
    const formattedAppointments = appointments.map(apt => {
      const date = new Date(apt.appointmentDate)
      const dateStr = date.toISOString().split('T')[0]
      const timeStr = date.toTimeString().slice(0, 5)

      return {
        id: apt.id,
        date: dateStr,
        time: timeStr,
        type: apt.type.toLowerCase() as 'online' | 'offline',
        status: apt.status.toLowerCase(),
        department: apt.departments?.name || '일반 진료',
        symptoms: apt.symptoms || '',
        hasPrescription: apt.prescriptions && apt.prescriptions.length > 0,
        prescriptionId: apt.prescriptions && apt.prescriptions.length > 0
          ? apt.prescriptions[0].id
          : undefined
      }
    })

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments
    })
  } catch (error) {
    console.error('환자 진료 이력 조회 오류:', error)
    return NextResponse.json(
      { error: '진료 이력 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
