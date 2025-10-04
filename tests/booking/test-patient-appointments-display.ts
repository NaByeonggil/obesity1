// 환자 예약 현황 표시 테스트 스크립트

import fetch from 'node-fetch'

async function testPatientAppointmentsDisplay() {
  console.log('=== 환자 예약 현황 표시 테스트 ===\n')

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
      console.error('❌ 로그인 실패:', loginData)
      return
    }

    const token = loginResponse.headers.get('set-cookie')?.match(/auth-token=([^;]+)/)?.[1]
    console.log('✅ 로그인 성공')
    console.log(`   토큰: ${token?.substring(0, 20)}...`)

    // 2. 예약 목록 조회
    console.log('\n2. 예약 목록 조회...')
    const appointmentsResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`
      },
    })

    const appointmentsData = await appointmentsResponse.json() as any

    if (appointmentsData.success) {
      console.log(`✅ 예약 조회 성공! 총 ${appointmentsData.appointments.length}개 예약`)

      if (appointmentsData.appointments.length > 0) {
        console.log('\n📋 예약 목록:')
        appointmentsData.appointments.forEach((apt: any, index: number) => {
          console.log(`\n   [${index + 1}] 예약 ID: ${apt.id}`)
          console.log(`       의사: ${apt.users_appointments_doctorIdTousers?.name || '정보 없음'}`)
          console.log(`       진료과: ${apt.departments?.name || '정보 없음'}`)
          console.log(`       날짜: ${new Date(apt.appointmentDate).toLocaleDateString('ko-KR')}`)
          console.log(`       시간: ${new Date(apt.appointmentDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}`)
          console.log(`       타입: ${apt.type}`)
          console.log(`       상태: ${apt.status}`)
          console.log(`       증상: ${apt.symptoms || '없음'}`)
          console.log(`       비고: ${apt.notes || '없음'}`)
        })
      } else {
        console.log('   📭 예약이 없습니다.')
      }
    } else {
      console.log('❌ 예약 조회 실패:', appointmentsData.error)
    }

    // 3. 응답 구조 분석
    console.log('\n3. 응답 구조 분석...')
    console.log('   응답 상태:', appointmentsResponse.status)
    console.log('   Content-Type:', appointmentsResponse.headers.get('content-type'))
    console.log('   응답 크기:', JSON.stringify(appointmentsData).length, 'bytes')

    if (appointmentsData.success && appointmentsData.appointments.length > 0) {
      const sampleAppointment = appointmentsData.appointments[0]
      console.log('\n   샘플 예약 구조:')
      console.log('   - 기본 필드:', Object.keys(sampleAppointment).filter(key => !key.includes('_')))
      console.log('   - 관계 필드:', Object.keys(sampleAppointment).filter(key => key.includes('_')))
    }

    console.log('\n=== 결론 ===')
    if (appointmentsData.success && appointmentsData.appointments.length > 0) {
      console.log('✅ API가 정상적으로 데이터를 반환합니다.')
      console.log('🎯 문제가 있다면 프론트엔드 렌더링 로직을 확인하세요.')
    } else if (appointmentsData.success && appointmentsData.appointments.length === 0) {
      console.log('⚠️ API는 성공하지만 예약 데이터가 없습니다.')
      console.log('🎯 예약을 생성하거나 사용자 ID를 확인하세요.')
    } else {
      console.log('❌ API에서 오류가 발생합니다.')
      console.log('🎯 백엔드 로직을 먼저 수정하세요.')
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error)
  }
}

testPatientAppointmentsDisplay()