import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// 의사의 환자 목록 조회
export async function GET(req: NextRequest) {
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

    // 의사의 모든 예약에서 환자 목록 추출
    const appointments = await prisma.appointments.findMany({
      where: {
        doctorId: doctor.id
      },
      include: {
        users_appointments_patientIdTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        departments: {
          select: {
            name: true
          }
        },
        prescriptions: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    // 환자별로 정보 집계
    const patientMap = new Map()

    appointments.forEach(apt => {
      const patient = apt.users_appointments_patientIdTousers
      if (!patient) return

      if (!patientMap.has(patient.id)) {
        patientMap.set(patient.id, {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone || '',
          avatar: patient.avatar,
          totalAppointments: 0,
          completedAppointments: 0,
          prescriptionCount: 0,
          lastVisit: null,
          lastDepartment: null,
          lastSymptoms: null
        })
      }

      const patientData = patientMap.get(patient.id)
      patientData.totalAppointments++

      if (apt.status === 'COMPLETED') {
        patientData.completedAppointments++
      }

      if (apt.prescriptions && apt.prescriptions.length > 0) {
        patientData.prescriptionCount += apt.prescriptions.length
      }

      // 가장 최근 방문 정보 저장
      if (!patientData.lastVisit) {
        patientData.lastVisit = apt.appointmentDate.toISOString().split('T')[0]
        patientData.lastDepartment = apt.departments?.name
        patientData.lastSymptoms = apt.symptoms
      }
    })

    const patients = Array.from(patientMap.values())

    return NextResponse.json({
      success: true,
      patients
    })
  } catch (error) {
    console.error('환자 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '환자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
