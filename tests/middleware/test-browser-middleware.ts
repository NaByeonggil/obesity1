// 브라우저에서 접근 테스트
import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3001'

async function testBrowserMiddleware() {
  console.log('=== 브라우저 미들웨어 테스트 ===\n')

  try {
    // 1. 의사 페이지 접근 테스트 (브라우저 헤더 포함)
    console.log('🚫 의사 페이지 브라우저 접근 테스트...')

    const doctorResponse = await fetch(`${BASE_URL}/doctor`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document'
      },
      redirect: 'manual'
    })

    console.log('의사 페이지 상태:', doctorResponse.status)
    console.log('응답 헤더:', Object.fromEntries(doctorResponse.headers.entries()))

    if (doctorResponse.status === 302 || doctorResponse.status === 307) {
      const location = doctorResponse.headers.get('location')
      console.log('✅ 리다이렉트 발생:', location)

      if (location?.includes('/auth/login')) {
        console.log('✅ 로그인 페이지로 올바르게 리다이렉트됨')
      }
    } else if (doctorResponse.status === 200) {
      console.log('⚠️ 미들웨어가 작동하지 않음 - 200 응답')
    }

    // 2. 루트 페이지 접근 테스트
    console.log('\n🏠 루트 페이지 접근 테스트...')

    const rootResponse = await fetch(`${BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible test client)'
      },
      redirect: 'manual'
    })

    console.log('루트 페이지 상태:', rootResponse.status)

    // 3. Next.js API 상태 확인
    console.log('\n🔧 Next.js API 상태 확인...')

    const healthResponse = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET'
    })

    console.log('Health API 상태:', healthResponse.status)

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error)
  }
}

testBrowserMiddleware()