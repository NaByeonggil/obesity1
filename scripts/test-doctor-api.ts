import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDoctorAppointmentsAPI() {
  console.log('🔍 의사 예약 API 테스트 시작\n')

  try {
    // 의사 계정 조회
    const doctor = await prisma.users.findFirst({
      where: {
        role: 'DOCTOR',
        name: '김민수'  // 서울 비대면 내과 의사
      }
    })

    if (!doctor) {
      console.log('❌ 테스트할 의사를 찾을 수 없습니다.')
      return
    }

    console.log(`✅ 테스트 의사: ${doctor.name} (${doctor.clinic})\n`)

    // 해당 의사의 예약 조회 (API 로직 시뮬레이션)
    const appointments = await prisma.appointments.findMany({
      where: {
        doctorId: doctor.id
      },
      include: {
        users_appointments_patientIdTousers: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            consultationType: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    console.log(`📋 의사의 예약 목록: ${appointments.length}건\n`)

    // API 변환 로직 테스트
    appointments.forEach((appointment, index) => {
      // 기존 로직 (문제가 있었던)
      const oldLogic = appointment.type?.toLowerCase() || 'offline'

      // 새로운 로직 (수정된)
      const newLogic = appointment.type === 'ONLINE' ? 'online' : 'offline'

      console.log(`예약 ${index + 1}:`)
      console.log(`  환자: ${appointment.users_appointments_patientIdTousers?.name}`)
      console.log(`  DB 타입: ${appointment.type}`)
      console.log(`  기존 변환: ${oldLogic}`)
      console.log(`  수정 변환: ${newLogic}`)
      console.log(`  결과: ${newLogic === 'online' ? '🔵 비대면' : '🟢 대면'}`)

      if (appointment.type === 'ONLINE' && newLogic === 'online') {
        console.log('  ✅ 비대면 예약이 올바르게 변환됨!')
      } else if (appointment.type === 'OFFLINE' && newLogic === 'offline') {
        console.log('  ✅ 대면 예약이 올바르게 변환됨!')
      } else {
        console.log('  ❌ 타입 변환 오류!')
      }
      console.log('')
    })

    // 통계
    const onlineAppointments = appointments.filter(a => a.type === 'ONLINE')
    const offlineAppointments = appointments.filter(a => a.type === 'OFFLINE')

    console.log('📊 예약 통계:')
    console.log(`  비대면 예약: ${onlineAppointments.length}건`)
    console.log(`  대면 예약: ${offlineAppointments.length}건`)

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDoctorAppointmentsAPI()
