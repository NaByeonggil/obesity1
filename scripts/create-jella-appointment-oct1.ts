import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createJellaAppointmentOct1() {
  try {
    console.log('🏥 젤라의원 10월 1일 예약 생성...\n')
    console.log('=' .repeat(80))

    // 1. junam670@gmail.com 사용자 찾기
    const patient = await prisma.users.findFirst({
      where: {
        email: 'junam670@gmail.com'
      }
    })

    if (!patient) {
      console.log('❌ junam670@gmail.com 사용자를 찾을 수 없습니다.')
      return
    }

    console.log(`✅ 환자 확인: ${patient.name} (${patient.id})`)
    console.log(`   이메일: ${patient.email}`)

    // 2. 젤라의원 의사 찾기
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
    console.log(`   병원: ${jellaDoctor.clinic}`)

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

    // 4. 10월 1일 예약 생성
    // 2025년 10월 1일 오후 2시로 설정 (한국 시간)
    const appointmentDate = new Date('2025-10-01T05:00:00.000Z') // UTC로 오후 2시 (KST 14:00)

    console.log(`\n📅 예약일시 설정:`)
    console.log(`   UTC: ${appointmentDate.toISOString()}`)
    console.log(`   한국시간: ${appointmentDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`)

    const appointment = await prisma.appointments.create({
      data: {
        id: `apt-jella-oct1-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        patientId: patient.id,
        doctorId: jellaDoctor.id,
        departmentId: department.id,
        appointmentDate: appointmentDate,
        type: 'OFFLINE',
        status: 'CONFIRMED',
        symptoms: '비만 상담 및 치료 - 10월 1일 예약',
        notes: '젤라의원 방문 예약',
        updatedAt: new Date()
      }
    })

    console.log('\n✅ 예약이 성공적으로 생성되었습니다!')
    console.log('=' .repeat(80))
    console.log('\n예약 정보:')
    console.log(`  - 예약 ID: ${appointment.id}`)
    console.log(`  - 환자: ${patient.name} (${patient.email})`)
    console.log(`  - 의사: ${jellaDoctor.name}`)
    console.log(`  - 병원: ${jellaDoctor.clinic}`)
    console.log(`  - 날짜: ${appointment.appointmentDate}`)
    console.log(`  - 한국시간: ${new Date(appointment.appointmentDate).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`)
    console.log(`  - 타입: ${appointment.type} (방문 진료)`)
    console.log(`  - 상태: ${appointment.status}`)
    console.log(`  - 증상: ${appointment.symptoms}`)

    // 5. 생성된 예약 확인
    const createdAppointment = await prisma.appointments.findUnique({
      where: { id: appointment.id },
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            name: true,
            clinic: true,
            specialization: true
          }
        },
        users_appointments_patientIdTousers: {
          select: {
            name: true,
            email: true
          }
        },
        departments: {
          select: {
            name: true,
            consultationType: true
          }
        }
      }
    })

    console.log('\n📊 DB 검증:')
    console.log('=' .repeat(80))
    if (createdAppointment) {
      console.log('✅ 예약이 DB에 정상적으로 저장되었습니다.')
      console.log(`  환자: ${createdAppointment.users_appointments_patientIdTousers?.name} (${createdAppointment.users_appointments_patientIdTousers?.email})`)
      console.log(`  의사: ${createdAppointment.users_appointments_doctorIdTousers?.name}`)
      console.log(`  병원: ${createdAppointment.users_appointments_doctorIdTousers?.clinic}`)
      console.log(`  부서: ${createdAppointment.departments?.name}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createJellaAppointmentOct1()