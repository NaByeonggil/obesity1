import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAppointments() {
  try {
    const count = await prisma.appointments.count()
    console.log('총 예약 수:', count)

    const appointments = await prisma.appointments.findMany({
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            clinic: true,
            specialization: true
          }
        },
        departments: {
          select: {
            name: true
          }
        }
      },
      take: 10
    })

    console.log('\n예약 데이터 샘플:')
    appointments.forEach((apt: any, index: number) => {
      console.log(`\n[${index + 1}]`)
      console.log('  예약 ID:', apt.id)
      console.log('  환자 ID:', apt.patientId)
      console.log('  의사 ID:', apt.doctorId)
      console.log('  의사 이름:', apt.users_appointments_doctorIdTousers?.name || '없음')
      console.log('  의원명:', apt.users_appointments_doctorIdTousers?.clinic || '없음')
      console.log('  전문과목:', apt.users_appointments_doctorIdTousers?.specialization || '없음')
      console.log('  진료과:', apt.departments?.name || '없음')
      console.log('  예약일:', apt.appointmentDate)
      console.log('  상태:', apt.status)
      console.log('  타입:', apt.type)
    })

  } catch (error) {
    console.error('오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAppointments()
