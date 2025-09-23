import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addMounjaroDoctors() {
  try {
    console.log('💉 마운자로/위고비 전문 의사들 추가 중...')

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash('123456', 10)
    const timestamp = Date.now()

    // 마운자로/위고비 전문 의사들
    const mounjaroDoctors = [
      {
        id: `doctor_mounjaro_${timestamp}_1`,
        email: `mounjaro1_${timestamp}@hospital.com`,
        password: hashedPassword,
        name: '김마운',
        phone: '02-1111-9999',
        role: 'DOCTOR',
        specialization: '마운자로',
        clinic: '서울마운자로전문클리닉',
        address: '서울시 강남구 청담동 123-45',
        license: `MD_MOUNJARO_${timestamp}_1`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_mounjaro_${timestamp}_2`,
        email: `wegovy1_${timestamp}@hospital.com`,
        password: hashedPassword,
        name: '박위고',
        phone: '02-2222-8888',
        role: 'DOCTOR',
        specialization: '마운자로',
        clinic: '위고비다이어트의원',
        address: '서울시 서초구 방배동 456-78',
        license: `MD_WEGOVY_${timestamp}_2`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_mounjaro_${timestamp}_3`,
        email: `glp1_${timestamp}@clinic.com`,
        password: hashedPassword,
        name: '이펜타',
        phone: '02-3333-7777',
        role: 'DOCTOR',
        specialization: '마운자로',
        clinic: 'GLP-1전문의원',
        address: '서울시 역삼동 789-01',
        license: `MD_GLP1_${timestamp}_3`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_mounjaro_${timestamp}_4`,
        email: `diabetes1_${timestamp}@hospital.com`,
        password: hashedPassword,
        name: '최당뇨',
        phone: '02-4444-6666',
        role: 'DOCTOR',
        specialization: '마운자로',
        clinic: '서울당뇨비만클리닉',
        address: '서울시 송파구 잠실동 234-56',
        license: `MD_DIABETES_${timestamp}_4`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_mounjaro_${timestamp}_5`,
        email: `obesity_injection_${timestamp}@clinic.com`,
        password: hashedPassword,
        name: '정주사',
        phone: '02-5555-5555',
        role: 'DOCTOR',
        specialization: '마운자로',
        clinic: '비만주사전문의원',
        address: '서울시 영등포구 여의도동 345-67',
        license: `MD_INJECTION_${timestamp}_5`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_mounjaro_${timestamp}_6`,
        email: `premium_diet_${timestamp}@hospital.com`,
        password: hashedPassword,
        name: '한프리',
        phone: '02-6666-4444',
        role: 'DOCTOR',
        specialization: '마운자로',
        clinic: '프리미엄다이어트센터',
        address: '서울시 중구 명동 456-78',
        license: `MD_PREMIUM_${timestamp}_6`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // 의사 데이터 추가
    for (const doctor of mounjaroDoctors) {
      await prisma.users.create({ data: doctor })
      console.log(`✅ 의사 ${doctor.name} (${doctor.clinic}) 추가됨`)
    }

    console.log('🎉 마운자로/위고비 전문 의사 6명 추가 완료!')
    console.log('💉 모든 의사가 마운자로 주사 치료 전문입니다.')
    console.log('🏥 서울 주요 지역별로 분산 배치되었습니다.')

  } catch (error) {
    console.error('❌ 의사 추가 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMounjaroDoctors()