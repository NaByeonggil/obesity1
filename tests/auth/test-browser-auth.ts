/**
 * Browser Authentication Test Script
 * Tests the complete browser authentication flow with cookie debugging
 */

import fetch from 'node-fetch';

// Configure to use the same cookie handling as browsers
const cookieJar: string[] = [];

async function testBrowserAuth() {
  console.log('🧪 브라우저 인증 플로우 테스트 시작\n');

  try {
    // Step 1: Login and capture cookies
    console.log('1️⃣ 로그인 테스트...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Browser Test)',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: 'kim@naver.com',
        password: '123456'
      })
    });

    console.log('로그인 응답 상태:', loginResponse.status);

    // Extract cookies from response
    const setCookieHeader = loginResponse.headers.raw()['set-cookie'];
    if (setCookieHeader) {
      console.log('설정된 쿠키 헤더들:', setCookieHeader);
      cookieJar.push(...setCookieHeader);
    }

    const loginData = await loginResponse.json() as any;
    console.log('로그인 응답:', {
      message: loginData.message,
      userRole: loginData.user?.role,
      tokenExists: !!loginData.token
    });

    if (loginResponse.status !== 200) {
      throw new Error('로그인 실패');
    }

    // Step 2: Test /api/auth/me with cookies (simulating browser)
    console.log('\n2️⃣ /api/auth/me 테스트 (쿠키 포함)...');

    const authResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Browser Test)',
        'Origin': 'http://localhost:3000',
        'Cookie': cookieJar.join('; ')
      }
    });

    console.log('/api/auth/me 응답 상태:', authResponse.status);

    const authData = await authResponse.json() as any;
    console.log('/api/auth/me 응답:', authData);

    if (authResponse.status === 200) {
      console.log('\n✅ 브라우저 인증 플로우 성공!');
      console.log('사용자 정보:', {
        name: authData.user.name,
        email: authData.user.email,
        role: authData.user.role
      });
    } else {
      console.log('\n❌ /api/auth/me 실패');
      console.log('오류:', authData.error);
    }

  } catch (error) {
    console.error('\n🚨 테스트 실패:', error);
  }
}

// Run the test
testBrowserAuth();