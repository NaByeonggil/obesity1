// 환자 예약 API 테스트 스크립트

async function testPatientAppointments() {
  const BASE_URL = 'http://localhost:3000';

  console.log('=== 환자 예약 현황 테스트 ===\n');

  // 1. 로그인
  console.log('1. 환자로 로그인 시도...');
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test.patient@example.com',
      password: 'test123',
    }),
  });

  const loginData = await loginResponse.json();

  if (loginData.message !== '로그인 성공' || !loginData.user) {
    console.error('❌ 로그인 실패:', loginData.error || loginData.message || 'Unknown error');
    return;
  }

  const token = loginResponse.headers.get('set-cookie')?.match(/auth-token=([^;]+)/)?.[1];
  console.log('✅ 로그인 성공');
  console.log('   - 사용자:', loginData.user.name);
  console.log('   - 역할:', loginData.user.role);

  // 2. 예약 목록 조회
  console.log('\n2. 예약 목록 조회...');
  const appointmentsResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth-token=${token}`
    },
  });

  const appointmentsData = await appointmentsResponse.json();

  if (!appointmentsData.success) {
    console.error('❌ 예약 조회 실패:', appointmentsData.error);
    return;
  }

  console.log('✅ 예약 조회 성공');
  console.log(`   - 총 ${appointmentsData.appointments.length}개의 예약`);

  if (appointmentsData.appointments.length > 0) {
    console.log('\n예약 목록:');
    appointmentsData.appointments.forEach((apt: any, index: number) => {
      console.log(`\n예약 ${index + 1}:`);
      console.log(`  - ID: ${apt.id}`);
      console.log(`  - 날짜: ${new Date(apt.appointmentDate).toLocaleString('ko-KR')}`);
      console.log(`  - 의사: ${apt.users_appointments_doctorIdTousers?.name || '정보 없음'}`);
      console.log(`  - 진료과: ${apt.departments?.name || '정보 없음'}`);
      console.log(`  - 타입: ${apt.type}`);
      console.log(`  - 상태: ${apt.status}`);
      if (apt.symptoms) {
        console.log(`  - 증상: ${apt.symptoms}`);
      }
    });
  } else {
    console.log('   예약 내역이 없습니다.');
  }

  // 3. 테스트 예약 생성
  console.log('\n3. 테스트 예약 생성...');
  const createResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth-token=${token}`
    },
    body: JSON.stringify({
      doctorId: 'doc-001',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      type: 'offline',
      symptoms: 'API 테스트 증상',
      department: '내과',
      notes: '테스트 예약입니다'
    })
  });

  const createData = await createResponse.json();

  if (!createData.success) {
    console.error('❌ 예약 생성 실패:', createData.error);
  } else {
    console.log('✅ 예약 생성 성공');
    console.log('   - 예약 ID:', createData.appointment.id);
    console.log('   - 예약 시간:', createData.appointment.time);
    console.log('   - 상태:', createData.appointment.status);
  }

  // 4. 다시 조회하여 새 예약 확인
  console.log('\n4. 새 예약 확인...');
  const checkResponse = await fetch(`${BASE_URL}/api/patient/appointments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth-token=${token}`
    },
  });

  const checkData = await checkResponse.json();

  if (checkData.success) {
    console.log(`✅ 현재 총 ${checkData.appointments.length}개의 예약`);
  }

  console.log('\n=== 테스트 완료 ===');
}

// 테스트 실행
testPatientAppointments().catch(console.error);