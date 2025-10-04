import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateDoctorSpecialization() {
  console.log('🔧 조종훈 의사 전문분야 업데이트\n')

  try {
    // 조종훈 의사 정보 업데이트
    const updatedDoctor = await prisma.users.update({
      where: {
        id: 'user-1759218534856-68a57e05'
      },
      data: {
        specialization: '신경외과, 비만치료과'
      }
    })

    console.log('✅ 의사 정보 업데이트 완료:')
    console.log(`의사명: ${updatedDoctor.name}`)
    console.log(`병원: ${updatedDoctor.clinic}`)
    console.log(`전문분야: ${updatedDoctor.specialization}`)
    console.log(`ID: ${updatedDoctor.id}`)

    console.log('\n💡 이제 이 의사 ID를 비대면 진료 페이지에서 사용해야 합니다.')

  } catch (error) {
    console.error('❌ 업데이트 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateDoctorSpecialization()