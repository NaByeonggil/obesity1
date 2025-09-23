import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAccounts() {
  try {
    console.log('🔍 테스트 가능한 계정 목록:')

    // 환자 계정들
    const patients = await prisma.users.findMany({
      where: { role: 'PATIENT' },
      select: { email: true, name: true, phone: true },
      take: 5
    })

    console.log('\n👥 환자 계정:')
    patients.forEach((patient, index) => {
      console.log(`${index + 1}. 이름: ${patient.name}`)
      console.log(`   이메일: ${patient.email}`)
      console.log(`   비밀번호: 123456`)
      console.log('')
    })

    // 의사 계정들
    const doctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: { email: true, name: true, specialization: true },
      take: 3
    })

    console.log('👨‍⚕️ 의사 계정:')
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. 이름: ${doctor.name}`)
      console.log(`   이메일: ${doctor.email}`)
      console.log(`   전문과: ${doctor.specialization}`)
      console.log(`   비밀번호: 123456`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ 계정 조회 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAccounts()