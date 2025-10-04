import jwt from 'jsonwebtoken'

async function testPatientAppointments() {
  try {
    // 사용자 토큰 생성 (정확한 JWT_SECRET 사용)
    const token = jwt.sign(
      {
        userId: 'user-1758957683254-lah38921g',
        email: 'junam670@gmail.com',
        role: 'patient'
      },
      'your-super-secret-jwt-key-here'
    )

    console.log('🔑 생성된 토큰:', token.substring(0, 50) + '...')

    // API 테스트
    const response = await fetch('http://localhost:3000/api/patient/appointments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 응답 상태:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ API 응답 성공:')
      console.log('📊 예약 수:', data.appointments?.length || 0)

      if (data.appointments) {
        data.appointments.forEach((apt: any, index: number) => {
          console.log(`\n📅 예약 ${index + 1}:`)
          console.log(`   ID: ${apt.id}`)
          console.log(`   의사: ${apt.doctor}`)
          console.log(`   병원: ${apt.clinic}`)
          console.log(`   날짜: ${apt.date}`)
          console.log(`   시간: ${apt.time}`)
          console.log(`   상태: ${apt.status}`)
          console.log(`   증상: ${apt.symptoms}`)
        })
      }
    } else {
      const error = await response.text()
      console.log('❌ API 응답 실패:', error)
    }

  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  }
}

testPatientAppointments()