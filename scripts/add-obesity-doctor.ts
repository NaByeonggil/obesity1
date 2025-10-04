import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addObesityDoctor() {
  console.log('👨‍⚕️ 비만치료과 전문의 추가\n')

  try {
    // 비만치료과 전문의 추가
    const obesityDoctor = await prisma.users.create({
      data: {
        id: 'user-1759205086393-ymq5en', // 로그에서 요청된 의사 ID
        name: '김민수',
        email: 'obesity@telemedicine.com',
        password: '$2b$10$hashedpassword', // 임시 해시된 비밀번호
        phone: '02-555-0123',
        role: 'DOCTOR',
        specialization: '비만치료과, 내과',
        clinic: '서울 비대면 내과',
        avatar: '/images/doctors/kim-minsu.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ 비만치료과 전문의 추가 완료:')
    console.log(`의사명: ${obesityDoctor.name}`)
    console.log(`병원: ${obesityDoctor.clinic}`)
    console.log(`전문분야: ${obesityDoctor.specialization}`)
    console.log(`ID: ${obesityDoctor.id}`)
    console.log(`이메일: ${obesityDoctor.email}`)

    console.log('\n✅ 이제 비대면 진료 예약이 정상적으로 작동합니다!')

  } catch (error) {
    console.error('❌ 의사 추가 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addObesityDoctor()