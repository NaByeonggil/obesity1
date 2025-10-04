import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAppointments() {
  try {
    const appointments = await prisma.appointments.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        patientId: true,
        appointmentDate: true
      },
      take: 5,
      orderBy: {
        appointmentDate: 'desc'
      }
    })
    
    console.log('Recent appointments:')
    appointments.forEach((apt: any) => {
      console.log(`ID: ${apt.id}, Type: ${apt.type}, Status: ${apt.status}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAppointments()
