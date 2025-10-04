import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkJunamAppointment() {
  try {
    console.log('🔍 junam670@gmail.com 사용자 및 예약 확인\n')
    console.log('=' .repeat(80))

    // 1. 사용자 찾기
    console.log('\n📋 1. junam670@gmail.com 사용자 정보:')
    console.log('-' .repeat(80))

    const user = await prisma.users.findFirst({
      where: {
        email: 'junam670@gmail.com'
      }
    })

    if (!user) {
      console.log('❌ junam670@gmail.com 사용자를 찾을 수 없습니다.')

      // 모든 사용자 이메일 확인
      const allUsers = await prisma.users.findMany({
        where: {
          role: 'PATIENT'
        },
        select: {
          email: true,
          name: true
        }
      })

      console.log('\n등록된 환자 이메일 목록:')
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name})`)
      })
      return
    }

    console.log('\n✅ 사용자 발견:')
    console.log(`  - ID: ${user.id}`)
    console.log(`  - 이름: ${user.name}`)
    console.log(`  - 이메일: ${user.email}`)
    console.log(`  - 역할: ${user.role}`)

    // 2. 해당 사용자의 모든 예약 조회
    console.log('\n📋 2. 해당 사용자의 모든 예약:')
    console.log('-' .repeat(80))

    const userAppointments = await prisma.appointments.findMany({
      where: {
        patientId: user.id
      },
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            name: true,
            clinic: true,
            specialization: true
          }
        },
        departments: {
          select: {
            name: true,
            consultationType: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      }
    })

    console.log(`\n총 예약 수: ${userAppointments.length}개`)

    if (userAppointments.length > 0) {
      userAppointments.forEach((apt, index) => {
        console.log(`\n예약 ${index + 1}:`)
        console.log(`  - ID: ${apt.id}`)
        console.log(`  - 의사: ${apt.users_appointments_doctorIdTousers?.name}`)
        console.log(`  - 병원: ${apt.users_appointments_doctorIdTousers?.clinic}`)
        console.log(`  - 날짜: ${apt.appointmentDate}`)
        console.log(`  - 타입: ${apt.type}`)
        console.log(`  - 상태: ${apt.status}`)
        console.log(`  - 증상: ${apt.symptoms}`)
        console.log(`  - 생성일: ${apt.createdAt}`)
      })
    } else {
      console.log('❌ 예약이 없습니다.')
    }

    // 3. 젤라의원 예약 특별 확인
    console.log('\n📋 3. 젤라의원 예약 확인:')
    console.log('-' .repeat(80))

    const jellaAppointments = await prisma.appointments.findMany({
      where: {
        patientId: user.id,
        users_appointments_doctorIdTousers: {
          clinic: '젤라의원'
        }
      },
      include: {
        users_appointments_doctorIdTousers: true
      }
    })

    console.log(`\n젤라의원 예약 수: ${jellaAppointments.length}개`)

    if (jellaAppointments.length > 0) {
      jellaAppointments.forEach(apt => {
        console.log('\n젤라의원 예약 상세:')
        console.log(`  - 예약 ID: ${apt.id}`)
        console.log(`  - 환자 ID: ${apt.patientId}`)
        console.log(`  - 의사 ID: ${apt.doctorId}`)
        console.log(`  - 의사명: ${apt.users_appointments_doctorIdTousers?.name}`)
        console.log(`  - 병원: ${apt.users_appointments_doctorIdTousers?.clinic}`)
        console.log(`  - 예약일: ${apt.appointmentDate}`)
        const appointmentDate = new Date(apt.appointmentDate)
        console.log(`  - 예약일 (한국시간): ${appointmentDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`)
        console.log(`  - 상태: ${apt.status}`)
        console.log(`  - 타입: ${apt.type}`)
      })
    }

    // 4. 10월 1일 예약 확인
    console.log('\n📋 4. 10월 1일 예약 확인:')
    console.log('-' .repeat(80))

    // 10월 1일의 시작과 끝
    const oct1Start = new Date('2025-10-01T00:00:00.000Z')
    const oct1End = new Date('2025-10-01T23:59:59.999Z')

    const oct1Appointments = await prisma.appointments.findMany({
      where: {
        appointmentDate: {
          gte: oct1Start,
          lte: oct1End
        }
      },
      include: {
        users_appointments_patientIdTousers: {
          select: {
            email: true,
            name: true
          }
        },
        users_appointments_doctorIdTousers: {
          select: {
            name: true,
            clinic: true
          }
        }
      }
    })

    console.log(`\n10월 1일 총 예약: ${oct1Appointments.length}개`)

    oct1Appointments.forEach(apt => {
      console.log(`\n예약:`)
      console.log(`  - 환자: ${apt.users_appointments_patientIdTousers?.name} (${apt.users_appointments_patientIdTousers?.email})`)
      console.log(`  - 의사: ${apt.users_appointments_doctorIdTousers?.name}`)
      console.log(`  - 병원: ${apt.users_appointments_doctorIdTousers?.clinic}`)
      console.log(`  - 날짜: ${apt.appointmentDate}`)
    })

    // 5. 필드명 확인
    console.log('\n📋 5. DB 스키마 필드명 확인:')
    console.log('-' .repeat(80))

    console.log('\n예약 테이블 관계 필드:')
    console.log('  - patientId: 환자 ID (users 테이블 참조)')
    console.log('  - doctorId: 의사 ID (users 테이블 참조)')
    console.log('  - departmentId: 부서 ID (departments 테이블 참조)')
    console.log('  - users_appointments_doctorIdTousers: 의사 정보 관계')
    console.log('  - users_appointments_patientIdTousers: 환자 정보 관계')

    // 6. API 응답 구조 확인
    console.log('\n📋 6. API 응답 형식 (프론트엔드 예상):')
    console.log('-' .repeat(80))

    if (userAppointments.length > 0) {
      const sampleAppointment = userAppointments[0]
      const frontendFormat = {
        id: sampleAppointment.id,
        type: sampleAppointment.type,
        status: sampleAppointment.status,
        appointmentDate: sampleAppointment.appointmentDate,
        symptoms: sampleAppointment.symptoms,
        notes: sampleAppointment.notes,
        createdAt: sampleAppointment.createdAt,
        updatedAt: sampleAppointment.updatedAt,
        doctor: {
          id: sampleAppointment.doctorId,
          name: sampleAppointment.users_appointments_doctorIdTousers?.name,
          specialization: sampleAppointment.users_appointments_doctorIdTousers?.specialization,
          clinic: sampleAppointment.users_appointments_doctorIdTousers?.clinic
        },
        department: {
          id: sampleAppointment.departmentId,
          name: sampleAppointment.departments?.name,
          consultationType: sampleAppointment.departments?.consultationType
        }
      }

      console.log('\n프론트엔드 형식 (예상):')
      console.log(JSON.stringify(frontendFormat, null, 2))
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJunamAppointment()