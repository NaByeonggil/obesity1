import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserAppointments() {
  try {
    // 모든 patient 사용자 확인
    const patients = await prisma.users.findMany({
      where: { role: 'patient' },
      select: { id: true, name: true, email: true }
    })
    
    console.log('All patients:')
    patients.forEach(patient => {
      console.log(`- ID: ${patient.id}, Name: ${patient.name}, Email: ${patient.email}`)
    })
    
    // 모든 예약의 환자 ID 확인
    const appointments = await prisma.appointments.findMany({
      select: {
        id: true,
        patientId: true,
        type: true,
        status: true
      }
    })
    
    console.log('\nAll appointments:')
    appointments.forEach(apt => {
      console.log(`- ID: ${apt.id}, PatientID: ${apt.patientId}, Type: ${apt.type}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserAppointments()
