import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyPatientPrescription() {
  try {
    console.log('=== 환자 처방전 확인 ===\n')

    // 1. 처방전 조회
    const prescription = await prisma.prescriptions.findFirst({
      where: {
        id: 'presc_1759305186240_87wmo9uwe'
      }
    })

    if (!prescription) {
      console.log('❌ 처방전 없음')
      return
    }

    console.log('✅ 처방전 발견')
    console.log(`   - ID: ${prescription.id}`)
    console.log(`   - 환자 ID: ${prescription.patientId}`)
    console.log(`   - 의사 ID: ${prescription.doctorId}`)
    console.log(`   - 예약 ID: ${prescription.appointmentId}`)
    console.log(`   - 상태: ${prescription.status}`)

    // 2. 환자 정보 확인
    const patient = await prisma.users.findUnique({
      where: {
        id: prescription.patientId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log('\n✅ 환자 정보')
    console.log(`   - ID: ${patient?.id}`)
    console.log(`   - 이름: ${patient?.name}`)
    console.log(`   - 이메일: ${patient?.email}`)
    console.log(`   - 역할: ${patient?.role}`)

    // 3. 해당 환자의 모든 처방전 조회
    const allPatientPrescriptions = await prisma.prescriptions.findMany({
      where: {
        patientId: prescription.patientId
      }
    })

    console.log('\n✅ 환자의 모든 처방전')
    console.log(`   - 총 개수: ${allPatientPrescriptions.length}개`)
    allPatientPrescriptions.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ID: ${p.id}, 상태: ${p.status}, 발행일: ${p.issuedAt}`)
    })

    // 4. 예약 정보 확인
    const appointmentCheck = await prisma.appointments.findUnique({
      where: {
        id: prescription.appointmentId || ''
      }
    })

    console.log('\n✅ 예약 정보 확인')
    console.log(`   - 예약 ID: ${appointmentCheck?.id}`)
    console.log(`   - 환자 ID: ${appointmentCheck?.patientId}`)
    console.log(`   - 의사 ID: ${appointmentCheck?.doctorId}`)

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyPatientPrescription()
