async function testLogin() {
  const testAccounts = [
    { email: 'kim.minji@example.com', name: '김민지 (환자)' },
    { email: 'kim.minsu@hospital.com', name: '김민수 (의사)' }
  ]

  console.log('🧪 로그인 API 테스트 시작...')

  for (const account of testAccounts) {
    try {
      console.log(`\n🔐 ${account.name} 로그인 테스트:`)

      const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account.email,
          password: '123456',
          csrfToken: 'test-token'
        }),
      })

      console.log(`📊 응답 상태: ${response.status} ${response.statusText}`)

      if (response.ok) {
        console.log('✅ 로그인 성공!')
      } else {
        const errorText = await response.text()
        console.log('❌ 로그인 실패:', errorText)
      }

    } catch (error) {
      console.error(`❌ ${account.name} 로그인 오류:`, error)
    }
  }

  // NextAuth 로그인 페이지 접근 테스트
  try {
    console.log('\n🌐 로그인 페이지 접근 테스트:')
    const pageResponse = await fetch('http://localhost:3000/auth/login')
    console.log(`📊 로그인 페이지 상태: ${pageResponse.status} ${pageResponse.statusText}`)

    if (pageResponse.ok) {
      console.log('✅ 로그인 페이지 정상 접근 가능')
    }
  } catch (error) {
    console.error('❌ 로그인 페이지 접근 오류:', error)
  }

  // 메인 페이지 접근 테스트
  try {
    console.log('\n🏠 메인 페이지 접근 테스트:')
    const mainResponse = await fetch('http://localhost:3000/')
    console.log(`📊 메인 페이지 상태: ${mainResponse.status} ${mainResponse.statusText}`)

    if (mainResponse.ok) {
      console.log('✅ 메인 페이지 정상 접근 가능')
    }
  } catch (error) {
    console.error('❌ 메인 페이지 접근 오류:', error)
  }
}

testLogin()