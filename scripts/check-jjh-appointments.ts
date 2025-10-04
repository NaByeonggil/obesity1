import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 조종훈 의사 예약 데이터 확인...\n')

    const appointments = await prisma.appointments.findMany({
      where: {
        users_appointments_doctorIdTousers: {
          name: {
            contains: '조종훈'
          }
        }
      },
      include: {
        users_appointments_doctorIdTousers: true,
        users_appointments_patientIdTousers: true,
        departments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`총 ${appointments.length}개의 예약 발견\n`)

    appointments.forEach((apt, idx) => {
      console.log(`\n[예약 ${idx + 1}]`)
      console.log(`ID: ${apt.id}`)
      console.log(`환자: ${apt.users_appointments_patientIdTousers?.name}`)
      console.log(`의사: ${apt.users_appointments_doctorIdTousers?.name}`)
      console.log(`진료과: ${apt.departments?.name}`)
      console.log(`예약 타입: ${apt.type}`) // ONLINE or OFFLINE
      console.log(`증상: ${apt.symptoms}`)
      console.log(`예약 일시: ${apt.appointmentDate}`)
      console.log(`상태: ${apt.status}`)
      console.log(`메모: ${apt.notes}`)
    })

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
