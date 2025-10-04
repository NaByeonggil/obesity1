import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 비대면 진료 예약 생성 시작...')

    // 환자 정보 조회
    const patient = await prisma.users.findFirst({
      where: {
        email: 'junam670@gmail.com',
        role: 'patient'
      }
    })

    if (!patient) {
      console.error('❌ 환자를 찾을 수 없습니다.')
      return
    }

    console.log('✅ 환자 찾음:', patient.name, patient.id)

    // 의사 정보 조회
    const doctor = await prisma.users.findFirst({
      where: {
        role: 'doctor'
      }
    })

    if (!doctor) {
      console.error('❌ 의사를 찾을 수 없습니다.')
      return
    }

    console.log('✅ 의사 찾음:', doctor.name, doctor.id)

    // 비대면 진료 가능한 진료과 조회 (내과)
    const department = await prisma.departments.findFirst({
      where: {
        consultationType: {
          in: ['ONLINE', 'BOTH']
        }
      }
    })

    if (!department) {
      console.error('❌ 비대면 진료 가능한 진료과를 찾을 수 없습니다.')
      return
    }

    console.log('✅ 진료과 찾음:', department.name, department.id, 'Type:', department.consultationType)

    // 내일 오후 2시 예약 생성
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)

    // 비대면 진료 예약 생성
    const now = new Date()
    const onlineAppointment = await prisma.appointments.create({
      data: {
        id: `apt-online-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: department.id,
        type: 'ONLINE', // 비대면 진료
        status: 'PENDING',
        appointmentDate: tomorrow,
        symptoms: '감기 증상 (비대면 진료)',
        notes: `비대면 진료 예약
진료 방법: 화상 상담
증상: 목 아픔, 기침
환자명: ${patient.name}
연락처: ${patient.phone || '정보 없음'}
이메일: ${patient.email}`,
        createdAt: now,
        updatedAt: now
      }
    })

    console.log('✅ 비대면 진료 예약 생성 완료!')
    console.log('예약 ID:', onlineAppointment.id)
    console.log('예약 유형:', onlineAppointment.type)
    console.log('예약 일시:', onlineAppointment.appointmentDate)
    console.log('진료과:', department.name)
    console.log('의사:', doctor.name)

    // 생성된 예약 확인
    const createdAppointment = await prisma.appointments.findUnique({
      where: { id: onlineAppointment.id },
      include: {
        users_appointments_doctorIdTousers: true,
        users_appointments_patientIdTousers: true,
        departments: true
      }
    })

    console.log('\n📋 생성된 예약 전체 정보:')
    console.log(JSON.stringify(createdAppointment, null, 2))

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
