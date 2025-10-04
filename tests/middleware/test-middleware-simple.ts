// 간단한 미들웨어 테스트
import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3000'

async function testMiddleware() {
  console.log('=== 미들웨어 테스트 ===\n')

  try {
    // 1. 의사 페이지 접근 테스트
    console.log('🚫 의사 페이지 접근 테스트...')

    const response = await fetch(`${BASE_URL}/doctor`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 Test Client'
      },
      redirect: 'manual'
    })

    console.log('응답 상태:', response.status)
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()))

    if (response.status === 302 || response.status === 307) {
      const location = response.headers.get('location')
      console.log('✅ 리다이렉트 발생:', location)
    } else {
      console.log('⚠️ 예상되지 않은 응답:', response.status)
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error)
  }
}

testMiddleware()