import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏥 모든 진료과목 의사 추가 시작...')

  const now = new Date()

  const doctors = [
    // 안과 (eye-care)
    {
      id: `user-${Date.now()}-eye1`,
      email: 'eye.doctor1@example.com',
      password: '$2b$10$XjK8vZ9L5Q0H3xF9X9X9X.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X',
      name: '이안과',
      role: 'DOCTOR' as any,
      specialization: '안과',
      clinic: '밝은안과의원',
      phone: '02-1234-5678',
      address: '서울특별시 강남구 테헤란로 123',
      hasOfflineConsultation: true,
      hasOnlineConsultation: true,
      updatedAt: now,
    },
    // 감기 관련 (cold)
    {
      id: `user-${Date.now() + 1}-cold1`,
      email: 'cold.doctor1@example.com',
      password: '$2b$10$XjK8vZ9L5Q0H3xF9X9X9X.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X',
      name: '박감기',
      role: 'DOCTOR' as any,
      specialization: '감기, 호흡기내과',
      clinic: '건강한내과의원',
      phone: '02-2345-6789',
      address: '서울특별시 서초구 서초대로 456',
      hasOfflineConsultation: true,
      hasOnlineConsultation: true,
      updatedAt: now,
    },
    // 소아과 (pediatrics)
    {
      id: `user-${Date.now() + 2}-pedi1`,
      email: 'pedi.doctor1@example.com',
      password: '$2b$10$XjK8vZ9L5Q0H3xF9X9X9X.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X',
      name: '최소아',
      role: 'DOCTOR' as any,
      specialization: '소아과',
      clinic: '아이사랑소아과',
      phone: '02-3456-7890',
      address: '서울특별시 송파구 올림픽로 789',
      hasOfflineConsultation: true,
      hasOnlineConsultation: true,
      updatedAt: now,
    },
    // 피부과 (dermatology)
    {
      id: `user-${Date.now() + 3}-derm1`,
      email: 'derm.doctor1@example.com',
      password: '$2b$10$XjK8vZ9L5Q0H3xF9X9X9X.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X',
      name: '정피부',
      role: 'DOCTOR' as any,
      specialization: '피부과',
      clinic: '깨끗한피부과',
      phone: '02-4567-8901',
      address: '서울특별시 강남구 역삼로 234',
      hasOfflineConsultation: true,
      hasOnlineConsultation: false,
      updatedAt: now,
    },
    // 정형외과 (orthopedics)
    {
      id: `user-${Date.now() + 4}-ortho1`,
      email: 'ortho.doctor1@example.com',
      password: '$2b$10$XjK8vZ9L5Q0H3xF9X9X9X.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X',
      name: '강정형',
      role: 'DOCTOR' as any,
      specialization: '정형외과',
      clinic: '튼튼정형외과',
      phone: '02-5678-9012',
      address: '서울특별시 영등포구 여의대로 567',
      hasOfflineConsultation: true,
      hasOnlineConsultation: false,
      updatedAt: now,
    },
    // 이비인후과 (ent)
    {
      id: `user-${Date.now() + 5}-ent1`,
      email: 'ent.doctor1@example.com',
      password: '$2b$10$XjK8vZ9L5Q0H3xF9X9X9X.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X',
      name: '윤이비',
      role: 'DOCTOR' as any,
      specialization: '이비인후과',
      clinic: '맑은이비인후과',
      phone: '02-6789-0123',
      address: '서울특별시 중구 명동길 890',
      hasOfflineConsultation: true,
      hasOnlineConsultation: true,
      updatedAt: now,
    },
    // 산부인과 (obgyn)
    {
      id: `user-${Date.now() + 6}-obgyn1`,
      email: 'obgyn.doctor1@example.com',
      password: '$2b$10$XjK8vZ9L5Q0H3xF9X9X9X.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X',
      name: '김산부',
      role: 'DOCTOR' as any,
      specialization: '산부인과',
      clinic: '여성건강산부인과',
      phone: '02-7890-1234',
      address: '서울특별시 강남구 신사동 123',
      hasOfflineConsultation: true,
      hasOnlineConsultation: false,
      updatedAt: now,
    },
    // 비뇨기과 (urology)
    {
      id: `user-${Date.now() + 7}-uro1`,
      email: 'uro.doctor1@example.com',
      password: '$2b$10$XjK8vZ9L5Q0H3xF9X9X9X.X9X9X9X9X9X9X9X9X9X9X9X9X9X9X9X',
      name: '송비뇨',
      role: 'DOCTOR' as any,
      specialization: '비뇨기과',
      clinic: '건강비뇨기과',
      phone: '02-8901-2345',
      address: '서울특별시 서초구 반포동 456',
      hasOfflineConsultation: true,
      hasOnlineConsultation: true,
      updatedAt: now,
    },
  ]

  for (const doctor of doctors) {
    try {
      await prisma.users.create({
        data: doctor,
      })
      console.log(`✅ ${doctor.name} 의사 추가 완료 (${doctor.specialization})`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  ${doctor.name} 의사 이미 존재`)
      } else {
        console.error(`❌ ${doctor.name} 의사 추가 실패:`, error.message)
      }
    }
  }

  console.log('✅ 모든 진료과목 의사 추가 완료!')
}

main()
  .catch((e) => {
    console.error('스크립트 실행 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
