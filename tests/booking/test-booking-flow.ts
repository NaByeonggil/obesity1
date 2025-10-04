// 예약 플로우 테스트 스크립트

import fetch from 'node-fetch'

async function testBookingFlow() {
  console.log('=== 예약 플로우 테스트 ===\n')

  const BASE_URL = 'http://localhost:3000'

  try {
    // 1. 로그인
    console.log('1. 로그인...')
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test.patient@example.com',
        password: 'test123',
      }),
    })

    const loginData = await loginResponse.json() as any
    if (loginData.message !== '로그인 성공') {
      console.error('❌ 로그인 실패')
      return
    }

    const token = loginResponse.headers.get('set-cookie')?.match(/auth-token=([^;]+)/)?.[1]
    console.log('✅ 로그인 성공')

    // 2. 현재 예약 수 확인
    console.log('\n2. 현재 예약 현황 확인...')
    const currentResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
    })

    const currentData = await currentResponse.json() as any
    const initialCount = currentData.success ? currentData.appointments.length : 0
    console.log(`✅ 현재 예약 수: ${initialCount}개`)

    // 3. 새 예약 생성
    console.log('\n3. 새 예약 생성...')
    const createResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
      body: JSON.stringify({
        doctorId: 'test-doctor-001',
        date: new Date().toISOString().split('T')[0],
        time: '15:30',
        type: 'offline',
        symptoms: 'API 테스트 예약',
        department: '내과',
        notes: '플로우 테스트용 예약'
      })
    })

    const createData = await createResponse.json() as any

    if (createData.success) {
      console.log('✅ 새 예약 생성 성공')
      console.log(`   - 예약 ID: ${createData.appointment.id}`)
      console.log(`   - 상태: ${createData.appointment.status}`)
    } else {
      console.error('❌ 예약 생성 실패:', createData.error)
      return
    }

    // 4. 예약 후 즉시 확인
    console.log('\n4. 예약 생성 후 즉시 확인...')
    const afterResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
    })

    const afterData = await afterResponse.json() as any
    const finalCount = afterData.success ? afterData.appointments.length : 0
    console.log(`✅ 예약 후 예약 수: ${finalCount}개`)

    if (finalCount > initialCount) {
      console.log('✅ 새 예약이 정상적으로 반영되었습니다!')
    } else {
      console.log('❌ 새 예약이 반영되지 않았습니다.')
    }

    // 5. 최신 예약 정보 확인
    if (afterData.success && afterData.appointments.length > 0) {
      console.log('\n최신 예약 정보:')
      const latestAppointment = afterData.appointments[0]
      console.log(`   - 의사: ${latestAppointment.users_appointments_doctorIdTousers?.name || '정보 없음'}`)
      console.log(`   - 날짜: ${new Date(latestAppointment.appointmentDate).toLocaleString('ko-KR')}`)
      console.log(`   - 증상: ${latestAppointment.symptoms}`)
      console.log(`   - 상태: ${latestAppointment.status}`)
    }

    console.log('\n=== 테스트 완료 ===')
    console.log('🔍 만약 프론트엔드에서 새 예약이 바로 보이지 않는다면,')
    console.log('   새로고침 또는 페이지 재방문이 필요할 수 있습니다.')

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  }
}

testBookingFlow()