import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createJellaAppointment() {
  try {
    console.log('🏥 젤라의원 테스트 예약 생성...\n')

    // 1. 젤라의원 의사 찾기
    const jellaDoctor = await prisma.users.findFirst({
      where: {
        clinic: '젤라의원',
        role: 'DOCTOR'
      }
    })

    if (!jellaDoctor) {
      console.log('❌ 젤라의원 의사를 찾을 수 없습니다.')
      return
    }

    console.log(`✅ 의사 확인: ${jellaDoctor.name} (${jellaDoctor.id})`)

    // 2. 테스트할 환자 찾기
    const patient = await prisma.users.findFirst({
      where: {
        role: 'PATIENT'
      }
    })

    if (!patient) {
      console.log('❌ 환자를 찾을 수 없습니다.')
      return
    }

    console.log(`✅ 환자 확인: ${patient.name} (${patient.id})`)

    // 3. 부서 찾기 (내과)
    const department = await prisma.departments.findFirst({
      where: {
        name: '내과'
      }
    })

    if (!department) {
      console.log('❌ 내과 부서를 찾을 수 없습니다.')
      return
    }

    console.log(`✅ 부서 확인: ${department.name} (${department.id})`)

    // 4. 예약 생성 (미래 날짜로 설정)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7) // 일주일 후

    const appointment = await prisma.appointments.create({
      data: {
        id: `apt-jella-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        patientId: patient.id,
        doctorId: jellaDoctor.id,
        departmentId: department.id,
        appointmentDate: futureDate,
        type: 'OFFLINE',
        status: 'CONFIRMED',
        symptoms: '비만 상담 및 치료',
        notes: '젤라의원 첫 방문',
        updatedAt: new Date()
      }
    })

    console.log('\n✅ 예약이 성공적으로 생성되었습니다!')
    console.log('예약 정보:')
    console.log(`- 예약 ID: ${appointment.id}`)
    console.log(`- 환자: ${patient.name}`)
    console.log(`- 의사: ${jellaDoctor.name} (${jellaDoctor.clinic})`)
    console.log(`- 날짜: ${appointment.appointmentDate}`)
    console.log(`- 타입: ${appointment.type}`)
    console.log(`- 상태: ${appointment.status}`)
    console.log(`- 증상: ${appointment.symptoms}`)

    // 5. 생성된 예약 확인
    const createdAppointment = await prisma.appointments.findUnique({
      where: { id: appointment.id },
      include: {
        users_appointments_doctorIdTousers: true,
        users_appointments_patientIdTousers: true,
        departments: true
      }
    })

    console.log('\n확인: 생성된 예약 조회 성공!')
    console.log(createdAppointment)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createJellaAppointment()