import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPrescriptionStatus() {
  try {
    // 모든 예약과 처방전 관계 확인
    const appointments = await prisma.appointments.findMany({
      where: {
        type: 'ONLINE',
        status: 'CONFIRMED'
      },
      include: {
        prescriptions: {
          select: {
            id: true,
            prescriptionNumber: true,
            status: true,
            issuedAt: true,
            diagnosis: true
          }
        },
        users_appointments_patientIdTousers: {
          select: {
            name: true
          }
        },
        users_appointments_doctorIdTousers: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      },
      take: 10
    })

    console.log('✅ 최근 승인된 비대면 예약 (최대 10개):')
    console.log('=====================================\n')

    for (const apt of appointments) {
      console.log(`📋 예약 ID: ${apt.id}`)
      console.log(`   환자: ${apt.users_appointments_patientIdTousers?.name || 'N/A'}`)
      console.log(`   의사: ${apt.users_appointments_doctorIdTousers?.name || 'N/A'}`)
      console.log(`   날짜: ${apt.appointmentDate}`)
      console.log(`   상태: ${apt.status}`)
      console.log(`   처방전 개수: ${apt.prescriptions?.length || 0}`)

      if (apt.prescriptions && apt.prescriptions.length > 0) {
        console.log(`   ✅ 처방전 발행됨:`)
        apt.prescriptions.forEach((presc, idx) => {
          console.log(`      ${idx + 1}. ID: ${presc.id}`)
          console.log(`         번호: ${presc.prescriptionNumber}`)
          console.log(`         진단: ${presc.diagnosis}`)
          console.log(`         상태: ${presc.status}`)
          console.log(`         발행일: ${presc.issuedAt}`)
        })
      } else {
        console.log(`   ❌ 처방전 없음`)
      }
      console.log('-------------------------------------\n')
    }

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPrescriptionStatus()
