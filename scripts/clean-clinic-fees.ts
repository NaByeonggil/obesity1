import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanClinicFees() {
  try {
    console.log('🧹 병원 진료비 데이터 정리\n')
    console.log('=' .repeat(80))

    // 1. 현재 진료비 데이터 확인
    const clinicFeesCount = await prisma.clinic_fees.count()
    console.log(`📋 현재 병원 진료비 데이터: ${clinicFeesCount}개`)

    if (clinicFeesCount === 0) {
      console.log('✅ 이미 진료비 데이터가 없습니다.')
      return
    }

    // 2. 고아 데이터 확인 (의사가 삭제된 진료비 데이터)
    const orphanedFees = await prisma.clinic_fees.findMany({
      where: {
        doctorId: {
          notIn: await prisma.users.findMany({
            where: { role: 'DOCTOR' },
            select: { id: true }
          }).then(docs => docs.map(d => d.id))
        }
      },
      include: {
        departments: true
      }
    })

    console.log(`📋 고아 진료비 데이터: ${orphanedFees.length}개`)

    if (orphanedFees.length > 0) {
      console.log('\n삭제될 진료비 데이터:')
      orphanedFees.slice(0, 5).forEach((fee, index) => {
        console.log(`${index + 1}. ${fee.departments.name} - ${fee.consultationType} - ${fee.basePrice}원`)
        console.log(`   의사 ID: ${fee.doctorId} (존재하지 않음)`)
      })
      if (orphanedFees.length > 5) {
        console.log(`   ... 외 ${orphanedFees.length - 5}개`)
      }
    }

    // 3. 모든 진료비 데이터 삭제 (의사가 없으므로)
    console.log('\n🔄 모든 진료비 데이터 삭제 중...')
    await prisma.clinic_fees.deleteMany({})

    // 4. 확인
    const remainingFees = await prisma.clinic_fees.count()
    console.log(`\n✅ 진료비 데이터 정리 완료!`)
    console.log(`📊 남은 진료비 데이터: ${remainingFees}개`)

    if (remainingFees === 0) {
      console.log('🎉 모든 진료비 데이터가 성공적으로 삭제되었습니다!')
    }

  } catch (error) {
    console.error('❌ 정리 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanClinicFees()