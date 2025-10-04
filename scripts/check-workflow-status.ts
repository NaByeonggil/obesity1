import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkWorkflowStatus() {
  try {
    console.log('=== 워크플로우 상태 확인 ===\n')

    // 1. 처방전 확인
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
            clinic: true
          }
        },
        appointments: {
          select: {
            id: true,
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
      console.log('❌ 처방전 없음')
      return
    }

    console.log('✅ 1. 처방전 발행 완료')
    console.log(`   - 처방전 ID: ${prescription.id}`)
    console.log(`   - 처방전 번호: ${prescription.prescriptionNumber}`)
    console.log(`   - 환자: ${prescription.users_prescriptions_patientIdTousers?.name}`)
    console.log(`   - 의사: ${prescription.users_prescriptions_doctorIdTousers?.name}`)
    console.log(`   - 의료기관: ${prescription.users_prescriptions_doctorIdTousers?.clinic}`)
    console.log(`   - 진단: ${prescription.diagnosis}`)
    console.log(`   - 상태: ${prescription.status}`)
    console.log(`   - 약국 ID: ${prescription.pharmacyId || '미지정'}`)
    console.log(`   - 약물 개수: ${prescription.prescription_medications.length}개`)

    // 2. 약국 목록 확인
    console.log('\n✅ 2. 약국 목록 확인')
    const pharmacies = await prisma.users.findMany({
      where: {
        role: 'PHARMACY'
      },
      select: {
        id: true,
        name: true,
        pharmacyName: true,
        pharmacyAddress: true,
        pharmacyPhone: true,
        email: true
      }
    })

    console.log(`   - 등록된 약국 수: ${pharmacies.length}개`)
    pharmacies.forEach((pharmacy, idx) => {
      console.log(`   ${idx + 1}. ${pharmacy.pharmacyName || pharmacy.name}`)
      console.log(`      주소: ${pharmacy.pharmacyAddress || '정보 없음'}`)
      console.log(`      전화: ${pharmacy.pharmacyPhone || '정보 없음'}`)
    })

    // 3. 약국 재고 확인
    console.log('\n✅ 3. 약국 재고 현황')
    const inventory = await prisma.pharmacy_inventory.findMany({
      include: {
        medications: true,
        users: {
          select: {
            pharmacyName: true,
            name: true
          }
        }
      },
      take: 10
    })

    console.log(`   - 재고 항목 수: ${inventory.length}개`)
    inventory.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.medications.name}`)
      console.log(`      약국: ${item.users.pharmacyName || item.users.name}`)
      console.log(`      재고: ${item.currentStock}개`)
    })

    // 4. 처방전 전송 여부 확인
    console.log('\n📋 4. 처방전 전송 상태')
    if (prescription.pharmacyId) {
      const pharmacy = await prisma.users.findUnique({
        where: { id: prescription.pharmacyId },
        select: {
          name: true,
          pharmacyName: true,
          pharmacyAddress: true
        }
      })
      console.log(`   ✅ 약국 전송 완료: ${pharmacy?.pharmacyName || pharmacy?.name}`)
    } else {
      console.log(`   ❌ 약국 미전송`)
    }

    // 5. 처방전 상태 변경 이력
    console.log('\n📋 5. 처방전 상태 정보')
    console.log(`   - 현재 상태: ${prescription.status}`)
    console.log(`   - 발행일: ${prescription.issuedAt}`)
    console.log(`   - 유효기간: ${prescription.validUntil}`)
    console.log(`   - 생성일: ${prescription.createdAt}`)
    console.log(`   - 수정일: ${prescription.updatedAt}`)

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkWorkflowStatus()
