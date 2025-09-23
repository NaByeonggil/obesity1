import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addBowelDoctors() {
  try {
    console.log('👨‍⚕️ 대변 진료 관련 의사들 추가 중...')

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash('123456', 10)
    const timestamp = Date.now()

    // 대변 진료 관련 의사들
    const bowelDoctors = [
      {
        id: `doctor_bowel_${timestamp}_1`,
        email: `gastro1_${timestamp}@hospital.com`,
        password: hashedPassword,
        name: '김소화',
        phone: '02-1111-2222',
        role: 'DOCTOR',
        specialization: '소화기내과',
        clinic: '서울소화기내과의원',
        address: '서울시 강남구 역삼동 456-78',
        license: `MD_GASTRO_${timestamp}_1`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_bowel_${timestamp}_2`,
        email: `procto1_${timestamp}@hospital.com`,
        password: hashedPassword,
        name: '박항문',
        phone: '02-2222-3333',
        role: 'DOCTOR',
        specialization: '항문외과',
        clinic: '서울항문외과전문의원',
        address: '서울시 서초구 서초동 789-01',
        license: `MD_PROCTO_${timestamp}_2`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_bowel_${timestamp}_3`,
        email: `gastro2_${timestamp}@clinic.com`,
        password: hashedPassword,
        name: '이대장',
        phone: '02-3333-4444',
        role: 'DOCTOR',
        specialization: '소화기내과',
        clinic: '대장항문전문클리닉',
        address: '서울시 송파구 잠실동 123-45',
        license: `MD_GASTRO_${timestamp}_3`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_bowel_${timestamp}_4`,
        email: `internal1_${timestamp}@hospital.com`,
        password: hashedPassword,
        name: '최내과',
        phone: '02-4444-5555',
        role: 'DOCTOR',
        specialization: '내과',
        clinic: '서울종합내과의원',
        address: '서울시 영등포구 여의도동 234-56',
        license: `MD_INTERNAL_${timestamp}_4`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `doctor_bowel_${timestamp}_5`,
        email: `procto2_${timestamp}@clinic.com`,
        password: hashedPassword,
        name: '정변비',
        phone: '02-5555-6666',
        role: 'DOCTOR',
        specialization: '항문외과',
        clinic: '항문질환전문클리닉',
        address: '서울시 중구 명동 345-67',
        license: `MD_PROCTO_${timestamp}_5`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // 의사 데이터 추가
    for (const doctor of bowelDoctors) {
      await prisma.users.create({ data: doctor })
      console.log(`✅ 의사 ${doctor.name} (${doctor.specialization}) 추가됨`)
    }

    console.log('🎉 대변 진료 관련 의사 5명 추가 완료!')
    console.log('- 소화기내과 전문의: 2명')
    console.log('- 항문외과 전문의: 2명')
    console.log('- 내과 전문의: 1명')

  } catch (error) {
    console.error('❌ 의사 추가 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addBowelDoctors()