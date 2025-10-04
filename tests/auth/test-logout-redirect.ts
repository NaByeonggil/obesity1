/**
 * 로그아웃 리다이렉트 테스트 스크립트
 * 각 역할별로 로그아웃 후 리다이렉트가 올바르게 작동하는지 테스트
 */

import fetch from 'node-fetch';

async function testLogoutRedirect() {
  console.log('🧪 로그아웃 리다이렉트 테스트 시작\n');

  try {
    // Step 1: 의사 계정으로 로그인
    console.log('1️⃣ 의사 계정 로그인...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'kim@naver.com',
        password: '123456'
      })
    });

    if (loginResponse.status !== 200) {
      throw new Error(`로그인 실패: ${loginResponse.status}`);
    }

    console.log('✅ 의사 계정 로그인 성공');

    // Extract cookies from login
    const setCookieHeader = loginResponse.headers.raw()['set-cookie'];
    const cookies = setCookieHeader ? setCookieHeader.join('; ') : '';

    // Step 2: 로그아웃 API 테스트
    console.log('\n2️⃣ 로그아웃 API 테스트...');
    const logoutResponse = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Cookie': cookies
      }
    });

    console.log(`로그아웃 응답 상태: ${logoutResponse.status}`);

    if (logoutResponse.ok) {
      console.log('✅ 로그아웃 API 성공');
    } else {
      console.log('❌ 로그아웃 API 실패');
    }

    // Step 3: 역할별 로그인 페이지 테스트
    console.log('\n3️⃣ 역할별 로그인 페이지 테스트...');

    const testRoles = [
      { role: 'doctor', title: '의료진 로그인' },
      { role: 'pharmacy', title: '약사 로그인' },
      { role: 'admin', title: '관리자 로그인' },
      { role: 'patient', title: '헬스케어 플랫폼' }
    ];

    for (const { role, title } of testRoles) {
      const loginPageUrl = role === 'patient'
        ? 'http://localhost:3000/auth/login'
        : `http://localhost:3000/auth/login?role=${role}`;

      console.log(`\n   📄 ${role} 로그인 페이지 테스트: ${loginPageUrl}`);

      const pageResponse = await fetch(loginPageUrl);
      if (pageResponse.ok) {
        const pageContent = await pageResponse.text();

        // 제목이 올바른지 확인
        if (pageContent.includes(title)) {
          console.log(`   ✅ ${role} 페이지 제목 확인: "${title}"`);
        } else {
          console.log(`   ❌ ${role} 페이지 제목 불일치`);
        }
      } else {
        console.log(`   ❌ ${role} 페이지 로드 실패: ${pageResponse.status}`);
      }
    }

    console.log('\n4️⃣ 브라우저 테스트 가이드:');
    console.log('   1. http://localhost:3000/auth/login?role=doctor 접속');
    console.log('   2. kim@naver.com / 123456 로그인');
    console.log('   3. /doctor 페이지에서 로그아웃 버튼 클릭');
    console.log('   4. /auth/login?role=doctor 페이지로 리다이렉트 되는지 확인');
    console.log('   5. 페이지 제목이 "의료진 로그인"인지 확인');

  } catch (error) {
    console.error('\n🚨 테스트 실패:', error);
  }
}

// Run the test
testLogoutRedirect();