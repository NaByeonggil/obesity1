import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSampleDoctor() {
  try {
    console.log('🏥 샘플 의사 계정 생성...\n')
    console.log('=' .repeat(80))

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash('doctor123', 10)

    // 샘플 의사 생성
    const doctor = await prisma.users.create({
      data: {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        email: 'doctor@test.com',
        password: hashedPassword,
        name: '김의사',
        phone: '02-1234-5678',
        role: 'DOCTOR',
        license: 'DOC-2024-001',
        specialization: '비만의학과',
        clinic: '서울다이어트클리닉',
        address: '서울시 강남구 테헤란로 123',
        avatar: 'https://ui-avatars.com/api/?name=김의사&background=10B981&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ 샘플 의사 계정이 생성되었습니다!')
    console.log('=' .repeat(80))
    console.log('\n의사 정보:')
    console.log(`  - ID: ${doctor.id}`)
    console.log(`  - 이름: ${doctor.name}`)
    console.log(`  - 이메일: ${doctor.email}`)
    console.log(`  - 병원: ${doctor.clinic}`)
    console.log(`  - 전문분야: ${doctor.specialization}`)
    console.log(`  - 면허번호: ${doctor.license}`)
    console.log(`  - 주소: ${doctor.address}`)

    console.log('\n로그인 정보:')
    console.log(`  - 이메일: ${doctor.email}`)
    console.log(`  - 비밀번호: doctor123`)

    // 추가 의사 2명 더 생성
    const doctor2 = await prisma.users.create({
      data: {
        id: `user-${Date.now() + 1000}-${Math.random().toString(36).substring(2, 8)}`,
        email: 'doctor2@test.com',
        password: hashedPassword,
        name: '박의사',
        phone: '02-2345-6789',
        role: 'DOCTOR',
        license: 'DOC-2024-002',
        specialization: '내과',
        clinic: '강남내과의원',
        address: '서울시 강남구 역삼동 456',
        avatar: 'https://ui-avatars.com/api/?name=박의사&background=3B82F6&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    const doctor3 = await prisma.users.create({
      data: {
        id: `user-${Date.now() + 2000}-${Math.random().toString(36).substring(2, 8)}`,
        email: 'doctor3@test.com',
        password: hashedPassword,
        name: '이의사',
        phone: '02-3456-7890',
        role: 'DOCTOR',
        license: 'DOC-2024-003',
        specialization: '가정의학과',
        clinic: '서울가정의학과',
        address: '서울시 서초구 서초동 789',
        avatar: 'https://ui-avatars.com/api/?name=이의사&background=EF4444&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('\n추가 의사 계정:')
    console.log(`2. ${doctor2.name} - ${doctor2.clinic} (${doctor2.email})`)
    console.log(`3. ${doctor3.name} - ${doctor3.clinic} (${doctor3.email})`)

    // 생성된 의사 수 확인
    const totalDoctors = await prisma.users.count({
      where: { role: 'DOCTOR' }
    })

    console.log(`\n총 의사 수: ${totalDoctors}명`)
    console.log('\n🎉 샘플 의사 계정 생성이 완료되었습니다!')
    console.log('이제 환자가 예약을 잡을 수 있습니다.')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleDoctor()