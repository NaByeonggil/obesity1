import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClinicLocations() {
  try {
    console.log('🔍 서울비만클리닉과 젤라의원 위치 정보 비교\n')
    console.log('=' .repeat(80))

    // 1. 서울비만클리닉 정보 조회
    console.log('\n📍 1. 서울비만클리닉 정보:')
    console.log('-' .repeat(80))

    const seoulClinic = await prisma.users.findFirst({
      where: {
        clinic: '서울비만클리닉',
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        clinic: true,
        address: true,
        phone: true,
        specialization: true,
        email: true
      }
    })

    if (seoulClinic) {
      console.log(`의사: ${seoulClinic.name}`)
      console.log(`병원명: ${seoulClinic.clinic}`)
      console.log(`주소: ${seoulClinic.address || '❌ 주소 정보 없음'}`)
      console.log(`전화번호: ${seoulClinic.phone || '❌ 전화번호 없음'}`)
      console.log(`전문분야: ${seoulClinic.specialization}`)
      console.log(`이메일: ${seoulClinic.email}`)
    }

    // 2. 젤라의원 정보 조회
    console.log('\n📍 2. 젤라의원 정보:')
    console.log('-' .repeat(80))

    const jellaClinic = await prisma.users.findFirst({
      where: {
        clinic: '젤라의원',
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        clinic: true,
        address: true,
        phone: true,
        specialization: true,
        email: true
      }
    })

    if (jellaClinic) {
      console.log(`의사: ${jellaClinic.name}`)
      console.log(`병원명: ${jellaClinic.clinic}`)
      console.log(`주소: ${jellaClinic.address || '❌ 주소 정보 없음'}`)
      console.log(`전화번호: ${jellaClinic.phone || '❌ 전화번호 없음'}`)
      console.log(`전문분야: ${jellaClinic.specialization}`)
      console.log(`이메일: ${jellaClinic.email}`)
    }

    // 3. 모든 의사의 주소 정보 확인
    console.log('\n📍 3. 모든 의사의 주소 정보:')
    console.log('-' .repeat(80))

    const allDoctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        name: true,
        clinic: true,
        address: true,
        phone: true
      },
      orderBy: {
        clinic: 'asc'
      }
    })

    allDoctors.forEach((doctor, index) => {
      console.log(`\n${index + 1}. ${doctor.name} (${doctor.clinic})`)
      console.log(`   주소: ${doctor.address || '❌ 주소 없음'}`)
      console.log(`   전화: ${doctor.phone || '❌ 전화 없음'}`)
    })

    // 4. 주소 정보 통계
    console.log('\n📊 4. 주소 정보 통계:')
    console.log('-' .repeat(80))

    const withAddress = allDoctors.filter(d => d.address && d.address.trim() !== '')
    const withoutAddress = allDoctors.filter(d => !d.address || d.address.trim() === '')
    const withPhone = allDoctors.filter(d => d.phone && d.phone.trim() !== '')
    const withoutPhone = allDoctors.filter(d => !d.phone || d.phone.trim() === '')

    console.log(`\n총 의사 수: ${allDoctors.length}명`)
    console.log(`주소 있음: ${withAddress.length}명`)
    console.log(`주소 없음: ${withoutAddress.length}명`)
    console.log(`전화번호 있음: ${withPhone.length}명`)
    console.log(`전화번호 없음: ${withoutPhone.length}명`)

    if (withoutAddress.length > 0) {
      console.log('\n⚠️  주소가 없는 의사:')
      withoutAddress.forEach(d => {
        console.log(`  - ${d.name} (${d.clinic})`)
      })
    }

    // 5. 프론트엔드에서 표시되는 위치 확인
    console.log('\n📱 5. 프론트엔드 표시 로직 분석:')
    console.log('-' .repeat(80))

    console.log('\n/api/doctors 라우트에서의 처리:')
    console.log('- location 필드 = doctor.address || (clinic 이름에 "서울" 포함 시 "서울시", 아니면 "서울시 강남구")')

    console.log('\n예상되는 프론트엔드 표시:')
    allDoctors.forEach(doctor => {
      const location = doctor.address || (doctor.clinic?.includes('서울') ? '서울시' : '서울시 강남구')
      console.log(`${doctor.name} (${doctor.clinic}): ${location}`)
    })

    // 6. 위치 일치 여부 확인
    console.log('\n✅ 6. 서울비만클리닉과 젤라의원 위치 일치 여부:')
    console.log('-' .repeat(80))

    const seoulLocation = seoulClinic?.address || (seoulClinic?.clinic?.includes('서울') ? '서울시' : '서울시 강남구')
    const jellaLocation = jellaClinic?.address || (jellaClinic?.clinic?.includes('서울') ? '서울시' : '서울시 강남구')

    console.log(`\n서울비만클리닉 표시 위치: ${seoulLocation}`)
    console.log(`젤라의원 표시 위치: ${jellaLocation}`)

    if (seoulLocation === jellaLocation) {
      console.log('\n⚠️  두 병원의 위치가 동일하게 표시됩니다!')
    } else {
      console.log('\n✅ 두 병원의 위치가 다르게 표시됩니다.')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClinicLocations()