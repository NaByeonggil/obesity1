async function testJJLogin() {
  try {
    console.log('🧪 JJ 계정 로그인 테스트 시작...')

    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jj@naver.com',
        password: '123456',
        csrfToken: 'test-token'
      }),
    })

    console.log(`📊 응답 상태: ${response.status} ${response.statusText}`)

    if (response.ok) {
      console.log('✅ JJ 계정 로그인 성공!')
      console.log('🎉 계정이 정상적으로 등록되고 인증 시스템과 연동되었습니다.')
    } else {
      const errorText = await response.text()
      console.log('❌ 로그인 실패:', errorText)
    }

  } catch (error) {
    console.error('❌ 로그인 테스트 오류:', error)
  }
}

testJJLogin()