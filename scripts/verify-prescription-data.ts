import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyPrescriptionData() {
  try {
    const prescription = await prisma.prescriptions.findFirst({
      where: {
        id: 'presc_1759305186240_87wmo9uwe'
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users_prescriptions_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            clinic: true,
            specialization: true
          }
        },
        appointments: {
          select: {
            id: true,
            appointmentDate: true,
            type: true,
            status: true
          }
        },
        prescription_medications: {
          include: {
            medications: true
          }
        }
      }
    })

    if (!prescription) {
      console.log('❌ 처방전을 찾을 수 없습니다')
      return
    }

    console.log('✅ 처방전 정보:')
    console.log('=====================================')
    console.log(`처방전 ID: ${prescription.id}`)
    console.log(`처방전 번호: ${prescription.prescriptionNumber}`)
    console.log(`\n환자 정보:`)
    console.log(`  ID: ${prescription.users_prescriptions_patientIdTousers?.id}`)
    console.log(`  이름: ${prescription.users_prescriptions_patientIdTousers?.name}`)
    console.log(`  이메일: ${prescription.users_prescriptions_patientIdTousers?.email}`)
    console.log(`\n의사/의료기관 정보:`)
    console.log(`  의사 ID: ${prescription.users_prescriptions_doctorIdTousers?.id}`)
    console.log(`  의사 이름: ${prescription.users_prescriptions_doctorIdTousers?.name}`)
    console.log(`  의료기관: ${prescription.users_prescriptions_doctorIdTousers?.clinic}`)
    console.log(`  전문분야: ${prescription.users_prescriptions_doctorIdTousers?.specialization}`)
    console.log(`\n진단 및 처방 정보:`)
    console.log(`  진단명: ${prescription.diagnosis}`)
    console.log(`  메모: ${prescription.notes}`)
    console.log(`  발행일: ${prescription.issuedAt}`)
    console.log(`  유효기간: ${prescription.validUntil}`)
    console.log(`  상태: ${prescription.status}`)
    console.log(`  총 금액: ${prescription.totalPrice}원`)
    console.log(`\n약물 정보:`)
    if (prescription.prescription_medications.length > 0) {
      prescription.prescription_medications.forEach((pm, idx) => {
        console.log(`  ${idx + 1}. ${pm.medications.name}`)
        console.log(`     - 용량: ${pm.dosage}`)
        console.log(`     - 복용빈도: ${pm.frequency}`)
        console.log(`     - 복용기간: ${pm.duration}`)
        console.log(`     - 수량: ${pm.quantity}`)
        console.log(`     - 가격: ${pm.price}원`)
      })
    } else {
      console.log('  약물 정보 없음 (PDF 첨부형)')
    }
    console.log(`\n예약 정보:`)
    console.log(`  예약 ID: ${prescription.appointments?.id}`)
    console.log(`  예약 날짜: ${prescription.appointments?.appointmentDate}`)
    console.log(`  예약 유형: ${prescription.appointments?.type}`)
    console.log(`  예약 상태: ${prescription.appointments?.status}`)

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyPrescriptionData()
