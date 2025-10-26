import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      doctorId,
      departmentName,
      clinicName,
      appointmentDate,
      appointmentTime,
      consultationType,
      consultationMethod, // 화상진료 or 전화진료
      symptoms,
      personalInfo
    } = body

    console.log('📝 예약 생성 요청:')
    console.log('  - departmentName:', departmentName)
    console.log('  - consultationType:', consultationType)
    console.log('  - consultationMethod:', consultationMethod)
    console.log('  - 전체 body:', JSON.stringify(body, null, 2))

    // 실제 데이터베이스 연동
    try {
      // 1. 해당 진료과 찾기 또는 생성
      let department = await prisma.departments.findFirst({
        where: { name: departmentName }
      })

      if (!department) {
        department = await prisma.departments.create({
          data: {
            id: `dept_${Date.now()}`,
            name: departmentName,
            description: `${departmentName} 진료과`,
            consultationType: consultationType,
            featured: false
          }
        })
      }

      // 2. 환자 정보 조회
      const patient = await prisma.users.findUnique({
        where: { email: session.user.email! }
      })

      if (!patient) {
        return NextResponse.json(
          { error: "환자 정보를 찾을 수 없습니다." },
          { status: 404 }
        )
      }

      // 3. 해당 진료과의 의사 찾기
      let doctor = await prisma.users.findFirst({
        where: {
          role: 'DOCTOR',
          specialization: {
            contains: departmentName
          }
        }
      })

      // 의사가 없으면 일반 의사 중 하나 선택
      if (!doctor) {
        doctor = await prisma.users.findFirst({
          where: { role: 'DOCTOR' }
        })
      }

      if (!doctor) {
        return NextResponse.json(
          { error: "담당 의사를 찾을 수 없습니다." },
          { status: 404 }
        )
      }

      // 4. 예약 생성
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`)

      // 진료 방식 메모 생성
      let consultationNote = consultationType === 'online' ? '비대면 진료\n' : '대면 진료\n'
      if (consultationType === 'online' && consultationMethod) {
        consultationNote += `진료 방법: ${consultationMethod === 'video' ? '화상진료' : '전화진료'}\n`
      }
      consultationNote += `환자 연락처: ${personalInfo.phoneNumber}`

      console.log('💾 데이터베이스 저장 정보:')
      console.log('  - type:', consultationType.toUpperCase())
      console.log('  - notes:', consultationNote)

      const appointment = await prisma.appointments.create({
        data: {
          id: `apt_${Date.now()}`,
          patientId: patient.id,
          doctorId: doctor.id,
          departmentId: department.id,
          type: consultationType.toUpperCase(),
          status: 'PENDING',
          appointmentDate: appointmentDateTime,
          symptoms: symptoms,
          notes: consultationNote,
          personalInfo: personalInfo,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          users_appointments_doctorIdTousers: true,
          departments: true
        }
      })

      // 5. 사용자 알림 생성 (환자 및 의사)
      // 환자 알림
      await prisma.user_notifications.create({
        data: {
          id: `notif_patient_${Date.now()}`,
          userId: patient.id,
          title: '예약 확정 알림',
          message: `${departmentName} 진료 예약이 확정되었습니다. (${appointmentDate} ${appointmentTime})`,
          type: 'APPOINTMENT_CONFIRMED',
          read: false,
          createdAt: new Date()
        }
      })

      // 의사 알림
      await prisma.user_notifications.create({
        data: {
          id: `notif_doctor_${Date.now()}`,
          userId: doctor.id,
          title: '새로운 예약',
          message: `${patient.name} 환자님의 ${departmentName} 진료 예약이 접수되었습니다. (${appointmentDate} ${appointmentTime})`,
          type: 'NEW_APPOINTMENT',
          read: false,
          createdAt: new Date()
        }
      })

      return NextResponse.json({
        message: "예약이 성공적으로 생성되었습니다.",
        appointment: {
          id: appointment.id,
          appointmentDate: appointment.appointmentDate.toISOString(),
          type: appointment.type,
          status: appointment.status,
          doctorName: doctor.name,
          doctorSpecialization: doctor.specialization,
          clinicName: doctor.clinic || clinicName,
          departmentName: department.name,
          symptoms: appointment.symptoms,
          personalInfo: appointment.personalInfo
        },
        success: true
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: "데이터베이스 오류가 발생했습니다." },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Appointment creation error:', error)
    return NextResponse.json(
      { error: "예약 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}