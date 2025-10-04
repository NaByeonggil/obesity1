import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const samplePharmacies = [
  {
    email: 'kangnam@pharmacy.com',
    password: 'pharmacy123',
    name: '김약사',
    pharmacyName: '강남중앙약국',
    pharmacyAddress: '서울특별시 강남구 테헤란로 123',
    pharmacyPhone: '02-555-1234',
    latitude: 37.5012,
    longitude: 127.0396
  },
  {
    email: 'gangnam@pharmacy.com',
    password: 'pharmacy123',
    name: '이약사',
    pharmacyName: '역삼온누리약국',
    pharmacyAddress: '서울특별시 강남구 강남대로 456',
    pharmacyPhone: '02-555-5678',
    latitude: 37.4985,
    longitude: 127.0276
  },
  {
    email: 'seocho@pharmacy.com',
    password: 'pharmacy123',
    name: '박약사',
    pharmacyName: '서초새봄약국',
    pharmacyAddress: '서울특별시 서초구 서초대로 789',
    pharmacyPhone: '02-555-9999',
    latitude: 37.4915,
    longitude: 127.0074
  },
  {
    email: 'samsung@pharmacy.com',
    password: 'pharmacy123',
    name: '정약사',
    pharmacyName: '삼성24시약국',
    pharmacyAddress: '서울특별시 강남구 테헤란로 321',
    pharmacyPhone: '02-555-2468',
    latitude: 37.5095,
    longitude: 127.0632
  },
  {
    email: 'nonhyun@pharmacy.com',
    password: 'pharmacy123',
    name: '최약사',
    pharmacyName: '논현건강약국',
    pharmacyAddress: '서울특별시 강남구 논현로 654',
    pharmacyPhone: '02-555-1357',
    latitude: 37.5106,
    longitude: 127.0220
  }
]

async function main() {
  console.log('샘플 약국 데이터 추가 시작...')

  for (const pharmacy of samplePharmacies) {
    // 이미 존재하는 이메일인지 확인
    const existing = await prisma.users.findUnique({
      where: { email: pharmacy.email }
    })

    if (existing) {
      console.log(`❌ 이미 존재함: ${pharmacy.pharmacyName} (${pharmacy.email})`)

      // 위도/경도 업데이트
      await prisma.users.update({
        where: { email: pharmacy.email },
        data: {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude
        }
      })
      console.log(`✅ 위도/경도 업데이트: ${pharmacy.pharmacyName}`)
      continue
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(pharmacy.password, 10)

    // 약국 계정 생성
    const created = await prisma.users.create({
      data: {
        id: `pharmacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: pharmacy.email,
        password: hashedPassword,
        name: pharmacy.name,
        role: 'PHARMACY',
        pharmacyName: pharmacy.pharmacyName,
        pharmacyAddress: pharmacy.pharmacyAddress,
        pharmacyPhone: pharmacy.pharmacyPhone,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`✅ 생성 완료: ${pharmacy.pharmacyName} (${pharmacy.email})`)
  }

  console.log('\n✨ 샘플 약국 데이터 추가 완료!')
  console.log('\n📋 로그인 정보:')
  samplePharmacies.forEach(p => {
    console.log(`- ${p.pharmacyName}: ${p.email} / ${p.password}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
