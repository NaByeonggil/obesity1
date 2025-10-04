import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDoctors() {
  try {
    // 기존 예약에서 사용되는 의사 ID 확인
    const appointments = await prisma.appointments.findMany({
      select: {
        doctorId: true,
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        }
      },
      take: 3
    })
    
    console.log('Doctor IDs in appointments:')
    appointments.forEach((apt: any) => {
      console.log(`Doctor ID: ${apt.doctorId}, Name: ${apt.users_appointments_doctorIdTousers?.name}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDoctors()
