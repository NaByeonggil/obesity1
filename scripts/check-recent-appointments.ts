import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 최근 예약 정보 확인...\n')

    const recentAppointments = await prisma.appointments.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        users_appointments_doctorIdTousers: true,
        users_appointments_patientIdTousers: true,
        departments: true
      }
    })

    console.log(`총 ${recentAppointments.length}개의 최근 예약\n`)

    recentAppointments.forEach((apt, idx) => {
      console.log(`\n[예약 ${idx + 1}]`)
      console.log(`ID: ${apt.id}`)
      console.log(`환자: ${apt.users_appointments_patientIdTousers?.name}`)
      console.log(`의사: ${apt.users_appointments_doctorIdTousers?.name}`)
      console.log(`진료과: ${apt.departments?.name}`)
      console.log(`예약 타입: ${apt.type}`)
      console.log(`예약 일시: ${apt.appointmentDate}`)
      console.log(`증상: ${apt.symptoms}`)
      console.log(`메모: ${apt.notes}`)
      console.log(`생성일: ${apt.createdAt}`)
    })

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
