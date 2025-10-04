import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllPrescriptions() {
  try {
    // 모든 처방전 조회
    const prescriptions = await prisma.prescriptions.findMany({
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            name: true
          }
        },
        users_prescriptions_doctorIdTousers: {
          select: {
            name: true
          }
        },
        appointments: {
          select: {
            id: true,
            appointmentDate: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    console.log(`✅ 전체 처방전 개수: ${prescriptions.length}`)
    console.log('=====================================\n')

    if (prescriptions.length === 0) {
      console.log('❌ 데이터베이스에 처방전이 없습니다.')
      return
    }

    for (const presc of prescriptions) {
      console.log(`📋 처방전 ID: ${presc.id}`)
      console.log(`   번호: ${presc.prescriptionNumber}`)
      console.log(`   환자: ${presc.users_prescriptions_patientIdTousers?.name || 'N/A'}`)
      console.log(`   의사: ${presc.users_prescriptions_doctorIdTousers?.name || 'N/A'}`)
      console.log(`   진단: ${presc.diagnosis}`)
      console.log(`   상태: ${presc.status}`)
      console.log(`   발행일: ${presc.issuedAt}`)
      console.log(`   생성일: ${presc.createdAt}`)
      console.log(`   예약 ID: ${presc.appointmentId}`)
      if (presc.appointments) {
        console.log(`   예약 상태: ${presc.appointments.status}`)
        console.log(`   예약 날짜: ${presc.appointments.appointmentDate}`)
      }
      console.log('-------------------------------------\n')
    }

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllPrescriptions()
