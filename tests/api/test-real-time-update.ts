// 실시간 업데이트 테스트 스크립트

import fetch from 'node-fetch'

async function testRealTimeUpdate() {
  console.log('=== 실시간 업데이트 테스트 ===\n')

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

    // 2. 예약 생성 전 상태 확인
    console.log('\n2. 예약 생성 전 상태 확인...')
    const beforeResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
    })

    const beforeData = await beforeResponse.json() as any
    const beforeCount = beforeData.success ? beforeData.appointments.length : 0
    console.log(`   현재 예약 수: ${beforeCount}개`)

    // 3. 새 예약 생성 (실제 AppointmentBooking 컴포넌트에서 하는 것과 동일)
    console.log('\n3. 새 예약 생성 (컴포넌트 시뮬레이션)...')

    const testAppointment = {
      doctorId: 'test-doctor-001',
      date: new Date().toISOString().split('T')[0],
      time: '16:30',
      type: 'offline', // 'telehealth' 대신 'offline'
      symptoms: '실시간 업데이트 테스트',
      department: '내과',
      notes: '테스트 병원에서 예약'
    }

    console.log('   예약 데이터:', testAppointment)

    const createResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
      body: JSON.stringify(testAppointment)
    })

    const createData = await createResponse.json() as any

    if (createData.success) {
      console.log('✅ 새 예약 생성 성공!')
      console.log(`   - 예약 ID: ${createData.appointment.id}`)
      console.log(`   - 상태: ${createData.appointment.status}`)
      console.log(`   - 날짜: ${createData.appointment.date}`)
      console.log(`   - 시간: ${createData.appointment.time}`)
    } else {
      console.error('❌ 예약 생성 실패:', createData.error)
      return
    }

    // 4. 즉시 확인 (patient 페이지가 할 것과 동일)
    console.log('\n4. 예약 생성 후 즉시 확인...')
    const afterResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
    })

    const afterData = await afterResponse.json() as any
    const afterCount = afterData.success ? afterData.appointments.length : 0
    console.log(`   예약 수: ${afterCount}개`)

    if (afterCount > beforeCount) {
      console.log('✅ 새 예약이 즉시 반영되었습니다!')

      // 최신 예약 정보 표시
      const latestAppointment = afterData.appointments.find((apt: any) => apt.id === createData.appointment.id)
      if (latestAppointment) {
        console.log('\n   최신 예약 정보:')
        console.log(`   - 의사: ${latestAppointment.users_appointments_doctorIdTousers?.name}`)
        console.log(`   - 진료과: ${latestAppointment.departments?.name}`)
        console.log(`   - 날짜: ${new Date(latestAppointment.appointmentDate).toLocaleDateString('ko-KR')}`)
        console.log(`   - 시간: ${new Date(latestAppointment.appointmentDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}`)
        console.log(`   - 증상: ${latestAppointment.symptoms}`)
        console.log(`   - 상태: ${latestAppointment.status}`)
      }
    } else {
      console.log('❌ 새 예약이 반영되지 않았습니다.')
    }

    console.log('\n=== 결론 ===')
    console.log('🎯 이제 브라우저에서 다음과 같이 테스트할 수 있습니다:')
    console.log('1. http://localhost:3000/auth/login (test.patient@example.com / test123)')
    console.log('2. http://localhost:3000/patient/appointments 에서 새 예약 생성')
    console.log('3. http://localhost:3000/patient 으로 이동')
    console.log('4. 새 예약이 즉시 표시되는지 확인')
    console.log('5. 브라우저 개발자 도구 콘솔에서 새로고침 로그 확인')

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  }
}

testRealTimeUpdate()