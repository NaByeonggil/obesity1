import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkJellaAppointments() {
  try {
    console.log('🔍 젤라의원 관련 데이터 조회 시작...\n')

    // 1. 젤라의원 의사 조회
    console.log('1. 젤라의원 의사 목록:')
    const jellaDoctors = await prisma.users.findMany({
      where: {
        clinic: '젤라의원'
      },
      select: {
        id: true,
        name: true,
        clinic: true,
        specialization: true,
        role: true
      }
    })
    console.log(jellaDoctors)
    console.log(`총 ${jellaDoctors.length}명의 젤라의원 의사\n`)

    // 2. 젤라의원 의사들의 예약 조회
    if (jellaDoctors.length > 0) {
      console.log('2. 젤라의원 예약 현황:')
      for (const doctor of jellaDoctors) {
        const appointments = await prisma.appointments.findMany({
          where: {
            doctorId: doctor.id
          },
          include: {
            users_appointments_patientIdTousers: {
              select: {
                name: true,
                email: true
              }
            }
          }
        })
        console.log(`\n${doctor.name} (${doctor.id}) 의사의 예약:`)
        console.log(`- 총 예약 수: ${appointments.length}`)

        if (appointments.length > 0) {
          appointments.forEach(apt => {
            console.log(`  - 예약 ID: ${apt.id}`)
            console.log(`    환자: ${apt.users_appointments_patientIdTousers?.name}`)
            console.log(`    날짜: ${apt.appointmentDate}`)
            console.log(`    상태: ${apt.status}`)
            console.log(`    타입: ${apt.type}`)
          })
        }
      }
    }

    // 3. 특정 환자의 모든 예약 확인 (테스트용)
    console.log('\n3. 환자별 예약 현황:')
    const patients = await prisma.users.findMany({
      where: {
        role: 'PATIENT'
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 5
    })

    for (const patient of patients) {
      const patientAppointments = await prisma.appointments.findMany({
        where: {
          patientId: patient.id
        },
        include: {
          users_appointments_doctorIdTousers: {
            select: {
              name: true,
              clinic: true
            }
          }
        }
      })

      if (patientAppointments.length > 0) {
        console.log(`\n${patient.name} (${patient.email}) 환자의 예약:`)
        patientAppointments.forEach(apt => {
          console.log(`  - 의사: ${apt.users_appointments_doctorIdTousers?.name} (${apt.users_appointments_doctorIdTousers?.clinic})`)
          console.log(`    날짜: ${apt.appointmentDate}`)
          console.log(`    상태: ${apt.status}`)
        })
      }
    }

    // 4. 모든 예약 통계
    console.log('\n4. 전체 예약 통계:')
    const totalAppointments = await prisma.appointments.count()
    const jellaAppointments = await prisma.appointments.count({
      where: {
        users_appointments_doctorIdTousers: {
          clinic: '젤라의원'
        }
      }
    })
    console.log(`총 예약 수: ${totalAppointments}`)
    console.log(`젤라의원 예약 수: ${jellaAppointments}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJellaAppointments()