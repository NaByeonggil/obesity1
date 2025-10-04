import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateExistingDoctors() {
  console.log('🔧 기존 의사들의 진료 방식 필드 업데이트\n')

  try {
    // 모든 의사 조회
    const doctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        clinic: true,
        hasOnlineConsultation: true,
        hasOfflineConsultation: true
      }
    })

    console.log(`✅ 총 ${doctors.length}명의 의사를 찾았습니다:`)

    for (const doctor of doctors) {
      console.log(`\n처리 중: ${doctor.name} (${doctor.clinic})`)
      console.log(`  현재 설정: 대면=${doctor.hasOfflineConsultation}, 비대면=${doctor.hasOnlineConsultation}`)

      // 진료 방식이 null인 경우 기본값으로 업데이트
      if (doctor.hasOnlineConsultation === null || doctor.hasOfflineConsultation === null) {
        await prisma.users.update({
          where: { id: doctor.id },
          data: {
            hasOnlineConsultation: doctor.hasOnlineConsultation ?? true,
            hasOfflineConsultation: doctor.hasOfflineConsultation ?? true,
            updatedAt: new Date()
          }
        })
        console.log(`  ✅ 업데이트 완료: 대면=true, 비대면=true (기본값)`)
      } else {
        console.log(`  ✅ 이미 설정되어 있음`)
      }
    }

    console.log('\n🎉 모든 의사의 진료 방식 설정이 완료되었습니다!')

  } catch (error) {
    console.error('❌ 업데이트 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingDoctors()