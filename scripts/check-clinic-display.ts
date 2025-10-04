import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClinicDisplay() {
  try {
    console.log('🏥 병원 데이터 표시 현황 확인\n')
    console.log('=' .repeat(80))

    // 1. 데이터베이스의 실제 병원 데이터
    console.log('\n📋 1. 데이터베이스 실제 병원 정보:')
    console.log('-' .repeat(80))

    const doctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        clinic: true,
        address: true,
        phone: true,
        specialization: true,
        avatar: true
      },
      orderBy: { name: 'asc' }
    })

    console.log(`\n총 의사 수: ${doctors.length}명\n`)
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name}`)
      console.log(`   병원명: ${doctor.clinic || '미지정'}`)
      console.log(`   주소: ${doctor.address || '주소 없음'}`)
      console.log(`   전화: ${doctor.phone || '전화번호 없음'}`)
      console.log(`   전문분야: ${doctor.specialization || '미지정'}`)
      console.log(`   아바타: ${doctor.avatar ? '있음' : '없음'}`)
      console.log()
    })

    // 2. API가 반환하는 형식 (현재)
    console.log('\n📋 2. 현재 API 응답 형식 (/api/doctors):')
    console.log('-' .repeat(80))
    console.log('\n현재 API는 다음과 같이 변환하고 있습니다:')
    console.log('- location: doctor.address || (clinic.includes("서울") ? "서울시" : "서울시 강남구")')
    console.log('- 즉, 주소가 없으면 임의로 생성됨')

    console.log('\n현재 변환된 데이터:')
    doctors.forEach((doctor, index) => {
      const location = doctor.address || (doctor.clinic?.includes('서울') ? '서울시' : '서울시 강남구')
      console.log(`${index + 1}. ${doctor.name}`)
      console.log(`   병원명: ${doctor.clinic}`)
      console.log(`   변환된 위치: ${location} ${doctor.address ? '✅ (실제)' : '❌ (임의생성)'}`)
    })

    // 3. 문제점 분석
    console.log('\n📋 3. 발견된 문제점:')
    console.log('-' .repeat(80))

    const doctorsWithoutAddress = doctors.filter(d => !d.address)
    const doctorsWithoutPhone = doctors.filter(d => !d.phone)

    if (doctorsWithoutAddress.length > 0) {
      console.log(`\n⚠️  주소가 없는 의사: ${doctorsWithoutAddress.length}명`)
      doctorsWithoutAddress.forEach(d => {
        console.log(`   - ${d.name} (${d.clinic})`)
      })
    }

    if (doctorsWithoutPhone.length > 0) {
      console.log(`\n⚠️  전화번호가 없는 의사: ${doctorsWithoutPhone.length}명`)
      doctorsWithoutPhone.forEach(d => {
        console.log(`   - ${d.name} (${d.clinic})`)
      })
    }

    // 4. 개선 방안
    console.log('\n📋 4. 개선 방안:')
    console.log('-' .repeat(80))
    console.log('\n✅ API에서 실제 데이터만 반환하도록 수정')
    console.log('✅ 주소가 없으면 null 또는 "주소 정보 없음" 표시')
    console.log('✅ 임의로 생성하지 않고 실제 데이터 표시')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClinicDisplay()