import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding 5 additional dummy data entries...')

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash('123456', 10)

  try {
    // 1. 추가 환자 5명
    const newPatients = [
      {
        id: 'patient_' + Date.now() + '_1',
        email: 'kang.jiwon@example.com',
        password: hashedPassword,
        name: '강지원',
        phone: '010-6666-7777',
        role: 'PATIENT',
        address: '서울시 강남구 청담동 123-45',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'patient_' + Date.now() + '_2',
        email: 'yoon.sangho@example.com',
        password: hashedPassword,
        name: '윤상호',
        phone: '010-7777-8888',
        role: 'PATIENT',
        address: '서울시 서초구 방배동 567-89',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'patient_' + Date.now() + '_3',
        email: 'oh.minju@example.com',
        password: hashedPassword,
        name: '오민주',
        phone: '010-8888-9999',
        role: 'PATIENT',
        address: '서울시 송파구 잠실동 101-23',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'patient_' + Date.now() + '_4',
        email: 'kim.subin@example.com',
        password: hashedPassword,
        name: '김수빈',
        phone: '010-9999-0000',
        role: 'PATIENT',
        address: '서울시 영등포구 여의도동 789-12',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'patient_' + Date.now() + '_5',
        email: 'lee.donghyun@example.com',
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

    // 2. 추가 의사 2명
    const newDoctors = [
      {
        id: 'doctor_' + Date.now() + '_1',
        email: 'dr.youngsuk@example.com',
        password: hashedPassword,
        name: '최영석',
        phone: '010-2222-3333',
        role: 'DOCTOR',
        specialization: '피부과',
        clinic: '서울피부과의원',
        address: '서울시 강남구 신사동 456-78',
        license: 'MD' + Date.now() + '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'doctor_' + Date.now() + '_2',
        email: 'dr.minhee@example.com',
        password: hashedPassword,
        name: '신민희',
        phone: '010-3333-4444',
        role: 'DOCTOR',
        specialization: '정형외과',
        clinic: '서울정형외과',
        address: '서울시 서초구 서초동 789-01',
        license: 'MD' + Date.now() + '2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // 의사 데이터 추가
    for (const doctor of newDoctors) {
      await prisma.users.create({ data: doctor })
      console.log(`✅ 의사 ${doctor.name} 추가됨`)
    }

    // 3. 추가 약물 3개
    const newMedications = [
      {
        id: 'med_' + Date.now() + '_1',
        name: '타이레놀',
        description: '해열진통제',
        dosage: '500mg',
        sideEffects: '위장장애, 간독성',
        contraindications: '간기능 장애 환자 주의',
        manufacturer: '한국얀센',
        price: 8500
      },
      {
        id: 'med_' + Date.now() + '_2',
        name: '애드빌',
        description: '소염진통제',
        dosage: '200mg',
        sideEffects: '위장장애, 어지럼증',
        contraindications: '소화성궤양 환자 금기',
        manufacturer: '화이자',
        price: 12000
      },
      {
        id: 'med_' + Date.now() + '_3',
        name: '베아제',
        description: '소화효소제',
        dosage: '150mg',
        sideEffects: '복부팽만, 설사',
        contraindications: '특이사항 없음',
        manufacturer: '한국야쿠르트',
        price: 6800
      }
    ]

    // 약물 데이터 추가
    for (const medication of newMedications) {
      await prisma.medications.create({ data: medication })
      console.log(`✅ 약물 ${medication.name} 추가됨`)
    }

    console.log('🎉 5개의 추가 더미 데이터 입력 완료!')
    console.log('- 환자 5명')
    console.log('- 의사 2명')
    console.log('- 약물 3개')

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