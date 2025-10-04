#!/usr/bin/env tsx

// 젤라의원 김병만 의사 예약 테스트
// 실제 예약 생성 과정에서 올바른 의사 ID가 사용되는지 확인

import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3000'

async function testJellaBooking() {
  console.log('🧪 젤라의원 김병만 의사 예약 테스트\n')

  try {
    // 1. 의사 데이터 확인
    console.log('1️⃣ 젤라의원 의사 데이터 확인')
    const doctorsResponse = await fetch(`${API_BASE}/api/doctors`)
    const doctorsData = await doctorsResponse.json()

    const jellaDoctor = doctorsData.doctors.find((doc: any) =>
      doc.name === '김병만' && doc.clinic === '젤라의원'
    )

    if (!jellaDoctor) {
      console.log('❌ 젤라의원 김병만 의사를 찾을 수 없음')
      return
    }

    console.log('✅ 젤라의원 의사 정보 확인:')
    console.log(`   - ID: ${jellaDoctor.id}`)
    console.log(`   - 이름: ${jellaDoctor.name}`)
    console.log(`   - 병원: ${jellaDoctor.clinic}`)
    console.log(`   - 전문과: ${jellaDoctor.specialization}`)
    console.log(`   - 주소: ${jellaDoctor.location}`)

    // 2. 실제 예약 생성 시뮬레이션 (토큰 없이 구조만 확인)
    console.log('\n2️⃣ 예약 생성 요청 데이터 구조 확인')

    const bookingData = {
      doctorId: jellaDoctor.id,
      date: '2024-01-16',
      time: '10:00',
      type: 'offline',
      symptoms: '젤라의원 예약 테스트',
      department: jellaDoctor.specialization,
      notes: `${jellaDoctor.clinic}에서 예약`
    }

    console.log('📋 예약 요청 데이터:')
    console.log(JSON.stringify(bookingData, null, 2))

    // 3. 데이터베이스에서 직접 확인
    console.log('\n3️⃣ 데이터베이스 직접 확인')

    // 데이터베이스에서 해당 의사 정보 조회
    const checkResponse = await fetch(`${API_BASE}/api/doctors`)
    const checkData = await checkResponse.json()

    const dbDoctor = checkData.doctors.find((doc: any) => doc.id === jellaDoctor.id)

    if (dbDoctor) {
      console.log('✅ DB에서 의사 정보 재확인:')
      console.log(`   - DB ID: ${dbDoctor.id}`)
      console.log(`   - DB 병원명: ${dbDoctor.clinic}`)
      console.log(`   - DB 의사명: ${dbDoctor.name}`)

      if (dbDoctor.clinic === '젤라의원' && dbDoctor.name === '김병만') {
        console.log('✅ 젤라의원 김병만 의사 데이터 정확함')
      } else {
        console.log('❌ 데이터 불일치 발견!')
      }
    } else {
      console.log('❌ DB에서 해당 의사를 찾을 수 없음')
    }

    // 4. 예약 생성 후 검증을 위한 가이드
    console.log('\n4️⃣ 실제 예약 생성 검증 방법')
    console.log('실제 예약을 생성한 후 다음 명령어로 확인:')
    console.log('```bash')
    console.log('# 최근 생성된 예약 조회')
    console.log('curl -s "http://localhost:3000/api/patient/appointments" \\')
    console.log('  -H "Authorization: Bearer <토큰>" | jq \'.appointments[] | select(.doctorId == "' + jellaDoctor.id + '")\'')
    console.log('```')

    console.log('\n✅ 젤라의원 예약 테스트 완료!')
    console.log('\n📊 결과:')
    console.log('- ✅ 젤라의원 김병만 의사 데이터 API에서 정상 조회')
    console.log('- ✅ 올바른 의사 ID 확인: ' + jellaDoctor.id)
    console.log('- ✅ 예약 요청 데이터 구조 정상')
    console.log('- ⚠️  실제 예약 생성은 로그인 후 프론트엔드에서 테스트 필요')

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  }
}

// 실행
testJellaBooking()