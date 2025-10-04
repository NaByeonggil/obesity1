import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLatestAppointment() {
  try {
    // 가장 최근 예약 조회
    const latestAppointment = await prisma.appointments.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        users_appointments_patientIdTousers: {
          select: {
            name: true,
            email: true
          }
        },
        users_appointments_doctorIdTousers: {
          select: {
            name: true,
            clinic: true
          }
        },
        departments: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('✅ 가장 최근 예약 정보:')
    console.log(JSON.stringify(latestAppointment, null, 2))

    if (latestAppointment) {
      console.log('\n📋 주요 정보:')
      console.log('- 예약 ID:', latestAppointment.id)
      console.log('- 환자:', latestAppointment.users_appointments_patientIdTousers?.name)
      console.log('- 의사:', latestAppointment.users_appointments_doctorIdTousers?.name)
      console.log('- 병원:', latestAppointment.users_appointments_doctorIdTousers?.clinic)
      console.log('- 진료과:', latestAppointment.departments?.name)
      console.log('- 예약 타입:', latestAppointment.type)
      console.log('- 상태:', latestAppointment.status)
      console.log('- 예약 시간:', latestAppointment.appointmentDate)
      console.log('- 메모:', latestAppointment.notes)
    }

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLatestAppointment()
