import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllAppointments() {
  try {
    // 모든 예약과 관련 사용자 확인
    const appointments = await prisma.appointments.findMany({
      include: {
        users_appointments_patientIdTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 5 // 처음 5개만
    })

    console.log('📊 Checking first 5 appointments:')
    appointments.forEach(apt => {
      console.log(`\n📅 Appointment ID: ${apt.id}`)
      console.log(`   Patient: ${apt.users_appointments_patientIdTousers?.name} (${apt.users_appointments_patientIdTousers?.email})`)
      console.log(`   Patient ID: ${apt.patientId}`)
      console.log(`   Doctor: ${apt.users_appointments_doctorIdTousers?.name}`)
      console.log(`   Date: ${apt.appointmentDate}`)
      console.log(`   Status: ${apt.status}`)
    })

    // 고유한 patient ID 목록
    const allAppointments = await prisma.appointments.findMany()
    const uniquePatients = Array.from(new Set(allAppointments.map(a => a.patientId)))
    console.log('\n🔍 Unique patient IDs in appointments:', uniquePatients)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllAppointments()