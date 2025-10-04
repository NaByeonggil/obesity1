// Test login and logout functionality with created test accounts

const BASE_URL = 'http://localhost:3000';

// Test credentials
const testAccounts = {
  doctor: {
    email: 'doctor.test@example.com',
    password: 'test1234'
  },
  pharmacy: {
    email: 'pharmacy.test@example.com',
    password: 'test1234'
  },
  patient: {
    email: 'patient.test@example.com',
    password: 'test1234'
  }
};

async function testLoginLogout() {
  console.log('=== 로그인/로그아웃 기능 테스트 시작 ===\n');

  // Test Doctor Login
  console.log('1. Doctor 계정 로그인 테스트');
  console.log('----------------------------------------');
  try {
    const doctorLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testAccounts.doctor.email,
        password: testAccounts.doctor.password,
        role: 'doctor'
      })
    });

    if (doctorLoginResponse.ok) {
      const doctorData = await doctorLoginResponse.json();
      console.log('✅ Doctor 로그인 성공');
      console.log('   - 이름:', doctorData.user?.name);
      console.log('   - 역할:', doctorData.user?.role);
      console.log('   - 토큰 생성:', doctorData.token ? '성공' : '실패');
    } else {
      const errorText = await doctorLoginResponse.text();
      console.log('❌ Doctor 로그인 실패');
      console.log('   - Status:', doctorLoginResponse.status);
      console.log('   - Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Doctor 로그인 테스트 중 오류:', error);
  }

  // Test Pharmacy Login
  console.log('\n2. Pharmacy 계정 로그인 테스트');
  console.log('----------------------------------------');
  try {
    const pharmacyLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testAccounts.pharmacy.email,
        password: testAccounts.pharmacy.password,
        role: 'pharmacy'
      })
    });

    if (pharmacyLoginResponse.ok) {
      const pharmacyData = await pharmacyLoginResponse.json();
      console.log('✅ Pharmacy 로그인 성공');
      console.log('   - 이름:', pharmacyData.user?.name);
      console.log('   - 역할:', pharmacyData.user?.role);
      console.log('   - 토큰 생성:', pharmacyData.token ? '성공' : '실패');
    } else {
      const errorText = await pharmacyLoginResponse.text();
      console.log('❌ Pharmacy 로그인 실패');
      console.log('   - Status:', pharmacyLoginResponse.status);
      console.log('   - Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Pharmacy 로그인 테스트 중 오류:', error);
  }

  // Test Wrong Password
  console.log('\n3. 잘못된 비밀번호 테스트');
  console.log('----------------------------------------');
  try {
    const wrongPasswordResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testAccounts.patient.email,
        password: 'wrongpassword',
        role: 'patient'
      })
    });

    if (!wrongPasswordResponse.ok) {
      console.log('✅ 잘못된 비밀번호 거부됨 (정상)');
      console.log('   - Status:', wrongPasswordResponse.status);
    } else {
      console.log('❌ 잘못된 비밀번호가 통과됨 (오류)');
    }
  } catch (error) {
    console.error('❌ 비밀번호 검증 테스트 중 오류:', error);
  }

  // Test Role Mismatch
  console.log('\n4. 역할 불일치 테스트');
  console.log('----------------------------------------');
  try {
    const roleMismatchResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testAccounts.patient.email,
        password: testAccounts.patient.password,
        role: 'doctor' // Patient 계정으로 Doctor 역할 시도
      })
    });

    if (!roleMismatchResponse.ok) {
      console.log('✅ 역할 불일치 거부됨 (정상)');
      console.log('   - Status:', roleMismatchResponse.status);
    } else {
      console.log('❌ 역할 불일치가 통과됨 (오류)');
    }
  } catch (error) {
    console.error('❌ 역할 검증 테스트 중 오류:', error);
  }

  console.log('\n=== 테스트 완료 ===\n');
  console.log('📝 브라우저에서 수동 테스트 방법:');
  console.log('----------------------------------------');
  console.log('1. http://localhost:3000/doctor 접속');
  console.log('   → 로그인 페이지로 리다이렉트 확인');
  console.log('');
  console.log('2. Doctor 계정으로 로그인:');
  console.log('   Email: doctor.test@example.com');
  console.log('   Password: test1234');
  console.log('   → Doctor 대시보드로 이동 확인');
  console.log('');
  console.log('3. 로그아웃 버튼 클릭');
  console.log('   → 로그아웃 후 홈페이지로 이동 확인');
  console.log('');
  console.log('4. http://localhost:3000/pharmacy 접속');
  console.log('   → 로그인 페이지로 리다이렉트 확인');
  console.log('');
  console.log('5. Pharmacy 계정으로 로그인:');
  console.log('   Email: pharmacy.test@example.com');
  console.log('   Password: test1234');
  console.log('   → Pharmacy 대시보드로 이동 확인');
  console.log('');
  console.log('6. Patient 계정으로 Doctor 페이지 접근 시도:');
  console.log('   Email: patient.test@example.com');
  console.log('   Password: test1234');
  console.log('   → 권한 없음 에러 메시지 확인');
}

// Run the test
testLoginLogout();