import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding 5 unique dummy data entries...')

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash('123456', 10)
  const timestamp = Date.now()

  try {
    // 1. 추가 환자 5명 (고유한 이메일 사용)
    const newPatients = [
      {
        id: `patient_${timestamp}_1`,
        email: `patient1_${timestamp}@example.com`,
        password: hashedPassword,
        name: '강지원',
        phone: '010-6666-7777',
        role: 'PATIENT',
        address: '서울시 강남구 청담동 123-45',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `patient_${timestamp}_2`,
        email: `patient2_${timestamp}@example.com`,
        password: hashedPassword,
        name: '윤상호',
        phone: '010-7777-8888',
        role: 'PATIENT',
        address: '서울시 서초구 방배동 567-89',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `patient_${timestamp}_3`,
        email: `patient3_${timestamp}@example.com`,
        password: hashedPassword,
        name: '오민주',
        phone: '010-8888-9999',
        role: 'PATIENT',
        address: '서울시 송파구 잠실동 101-23',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `patient_${timestamp}_4`,
        email: `patient4_${timestamp}@example.com`,
        password: hashedPassword,
        name: '김수빈',
        phone: '010-9999-0000',
        role: 'PATIENT',
        address: '서울시 영등포구 여의도동 789-12',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `patient_${timestamp}_5`,
        email: `patient5_${timestamp}@example.com`,
        password: hashedPassword,
        name: '이동현',
        phone: '010-0000-1111',
        role: 'PATIENT',
        address: '서울시 중구 명동 345-67',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // 환자 데이터 추가
    for (const patient of newPatients) {
      await prisma.users.create({ data: patient })
      console.log(`✅ 환자 ${patient.name} 추가됨`)
    }

    console.log('🎉 5개의 추가 환자 데이터 입력 완료!')

  } catch (error) {
    console.error('❌ 더미 데이터 추가 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })