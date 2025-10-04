// 젤라의원 의사 계정 확인
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkZellaDoctor() {
  console.log('=== 젤라의원 의사 계정 확인 ===\n')

  try {
    // 1. kim@naver.com 계정 확인
    console.log('🔍 kim@naver.com 계정 조회...')
    const kimAccount = await prisma.users.findUnique({
      where: {
        email: 'kim@naver.com'
      }
    })

    if (!kimAccount) {
      console.log('❌ kim@naver.com 계정이 존재하지 않습니다.')
      console.log('\n📝 계정 생성 필요: kim@naver.com (젤라의원 의사 계정)')

      // 계정 생성 제안
      console.log('\n💡 계정 생성 방법:')
      console.log('1. 웹사이트에서 회원가입 (/auth/register)')
      console.log('2. 또는 아래 스크립트로 직접 생성 가능')

    } else {
      console.log('✅ kim@naver.com 계정 발견!')
      console.log('\n📋 계정 상세 정보:')
      console.log(`ID: ${kimAccount.id}`)
      console.log(`이름: ${kimAccount.name}`)
      console.log(`이메일: ${kimAccount.email}`)
      console.log(`역할: ${kimAccount.role}`)
      console.log(`전문분야: ${kimAccount.specialization || 'N/A'}`)
      console.log(`병원: ${kimAccount.clinic || 'N/A'}`)
      console.log(`가입일: ${kimAccount.createdAt}`)
      console.log(`수정일: ${kimAccount.updatedAt}`)

      // 역할 확인
      if (kimAccount.role !== 'DOCTOR') {
        console.log(`\n⚠️ 경고: 현재 역할이 ${kimAccount.role}입니다. DOCTOR로 변경이 필요합니다.`)
      }

      // 병원명 확인
      if (!kimAccount.clinic || kimAccount.clinic !== '젤라의원') {
        console.log(`\n⚠️ 병원명이 '젤라의원'이 아닙니다. 현재: ${kimAccount.clinic || '없음'}`)
      }
    }

    // 2. 젤라의원과 관련된 모든 의사 계정 조회
    console.log('\n📍 젤라의원 관련 계정 검색...')
    const zellaDoctors = await prisma.users.findMany({
      where: {
        OR: [
          { clinic: { contains: '젤라' } },
          { clinic: { contains: 'zella' } },
          { clinic: { contains: 'Zella' } },
          { name: { contains: '젤라' } }
        ],
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true,
        specialization: true,
        createdAt: true
      }
    })

    if (zellaDoctors.length > 0) {
      console.log(`\n✅ 젤라의원 의사 ${zellaDoctors.length}명 발견:`)
      zellaDoctors.forEach((doctor, index) => {
        console.log(`\n${index + 1}. ${doctor.name}`)
        console.log(`   이메일: ${doctor.email}`)
        console.log(`   병원: ${doctor.clinic}`)
        console.log(`   전문분야: ${doctor.specialization || 'N/A'}`)
        console.log(`   ID: ${doctor.id}`)
      })
    } else {
      console.log('❌ 젤라의원으로 등록된 의사 계정이 없습니다.')
    }

    // 3. 모든 의사 계정 목록
    console.log('\n📋 전체 의사 계정 목록:')
    const allDoctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true,
        specialization: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    if (allDoctors.length === 0) {
      console.log('등록된 의사 계정이 없습니다.')
    } else {
      console.log(`최근 등록된 의사 ${allDoctors.length}명:`)
      allDoctors.forEach((doctor, index) => {
        console.log(`${index + 1}. ${doctor.name} (${doctor.email})`)
        console.log(`   병원: ${doctor.clinic || 'N/A'}`)
        console.log(`   전문분야: ${doctor.specialization || 'N/A'}`)
      })
    }

    // 4. kim@naver.com 계정 생성 제안
    if (!kimAccount) {
      console.log('\n\n=== 계정 생성 스크립트 ===')
      console.log('아래 스크립트를 실행하여 kim@naver.com 계정을 생성할 수 있습니다:')
      console.log(`
const hashedPassword = await bcrypt.hash('123456', 10)
const newDoctor = await prisma.users.create({
  data: {
    id: 'doc-zella-' + Date.now(),
    email: 'kim@naver.com',
    password: hashedPassword,
    name: '김의사',
    role: 'DOCTOR',
    clinic: '젤라의원',
    specialization: '내과',
    phone: '02-1234-5678',
    isActive: true
  }
})
      `)
    }

  } catch (error) {
    console.error('❌ 계정 확인 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkZellaDoctor()