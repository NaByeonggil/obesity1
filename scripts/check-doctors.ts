import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDoctors() {
  console.log('🔍 현재 데이터베이스의 의사 정보 확인\n')

  try {
    const doctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true,
        specialization: true
      }
    })

    console.log(`✅ 총 ${doctors.length}명의 의사가 등록되어 있습니다:`)
    console.log('=' .repeat(80))

    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} (${doctor.clinic})`)
      console.log(`   ID: ${doctor.id}`)
      console.log(`   이메일: ${doctor.email}`)
      console.log(`   전문분야: ${doctor.specialization}`)
      console.log('   ' + '-'.repeat(60))
    })

    console.log('\n📋 비대면 진료 가능한 의사 확인:')
    const telemedicineDoctors = doctors.filter(doctor =>
      doctor.specialization?.includes('비만')
    )

    if (telemedicineDoctors.length > 0) {
      telemedicineDoctors.forEach(doctor => {
        console.log(`✅ ${doctor.name} (${doctor.clinic}) - ID: ${doctor.id}`)
      })
    } else {
      console.log('❌ 비만치료 전문 의사가 없습니다.')
    }

  } catch (error) {
    console.error('❌ 의사 조회 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDoctors()