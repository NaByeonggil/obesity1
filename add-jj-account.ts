import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addJJAccount() {
  try {
    console.log('👤 jj@naver.com 환자 계정 추가 중...')

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash('123456', 10)
    const timestamp = Date.now()

    // 이미 존재하는지 확인
    const existingUser = await prisma.users.findUnique({
      where: { email: 'jj@naver.com' }
    })

    if (existingUser) {
      console.log('⚠️ 이미 존재하는 계정입니다.')
      console.log(`기존 계정: ${existingUser.name} (${existingUser.email})`)
      return
    }

    // 새 환자 계정 생성
    const newPatient = await prisma.users.create({
      data: {
        id: `patient_jj_${timestamp}`,
        email: 'jj@naver.com',
        password: hashedPassword,
        name: 'JJ',
        phone: '010-1234-5678',
        role: 'PATIENT',
        address: '서울시 강남구 역삼동',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ 환자 계정이 성공적으로 추가되었습니다!')
    console.log(`📧 이메일: ${newPatient.email}`)
    console.log(`👤 이름: ${newPatient.name}`)
    console.log(`🔑 비밀번호: 123456`)
    console.log(`📱 전화번호: ${newPatient.phone}`)
    console.log(`🏠 주소: ${newPatient.address}`)

  } catch (error) {
    console.error('❌ 계정 추가 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addJJAccount()