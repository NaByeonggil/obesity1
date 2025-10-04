// Node.js 18+ has built-in fetch, no import needed

const BASE_URL = 'http://localhost:3001';

async function testTelemedicinePage() {
  console.log('=== 비대면 진료 페이지 테스트 시작 ===\n');

  try {
    // 1. 비대면 진료 페이지 접속 테스트
    console.log('1. 비대면 진료 리스팅 페이지 접속 테스트...');
    const response = await fetch(`${BASE_URL}/patient/telemedicine`);

    if (response.ok) {
      console.log('✅ 페이지 접속 성공 (Status:', response.status + ')');

      const html = await response.text();

      // HTML 내용 분석
      console.log('\n2. 페이지 내용 확인:');

      // 페이지 제목 확인
      if (html.includes('비대면 진료')) {
        console.log('✅ 페이지 제목 "비대면 진료" 확인');
      }

      // 의원 리스팅 확인
      const clinicNames = [
        '서울 비대면 내과',
        '온라인 가정의학과',
        '디지털 헬스케어 센터',
        '스마트 원격진료 클리닉',
        '마음편한 정신건강 클리닉',
        '365 온라인 진료'
      ];

      console.log('\n3. 의원 리스팅 확인:');
      clinicNames.forEach(name => {
        if (html.includes(name)) {
          console.log(`✅ ${name} - 확인됨`);
        } else {
          console.log(`❌ ${name} - 찾을 수 없음`);
        }
      });

      // 가격 정보 확인
      console.log('\n4. 가격 정보 확인:');
      const prices = ['10,000원', '12,000원', '15,000원', '20,000원', '25,000원', '35,000원'];
      let priceCount = 0;
      prices.forEach(price => {
        if (html.includes(price)) {
          priceCount++;
          console.log(`✅ ${price} - 확인됨`);
        }
      });
      console.log(`총 ${priceCount}개의 가격 정보 확인됨`);

      // 정렬 버튼 확인
      console.log('\n5. 정렬 기능 확인:');
      if (html.includes('가격순')) {
        console.log('✅ 가격순 정렬 버튼 확인');
      }
      if (html.includes('평점순')) {
        console.log('✅ 평점순 정렬 버튼 확인');
      }
      if (html.includes('예약가능순')) {
        console.log('✅ 예약가능순 정렬 버튼 확인');
      }

      // 진료 방식 확인
      console.log('\n6. 진료 방식 표시 확인:');
      if (html.includes('화상진료')) {
        console.log('✅ 화상진료 표시 확인');
      }
      if (html.includes('전화진료')) {
        console.log('✅ 전화진료 표시 확인');
      }

      // 예약 버튼 확인
      console.log('\n7. 예약 기능 확인:');
      if (html.includes('예약하기')) {
        console.log('✅ 예약하기 버튼 확인');
      }

      // 의사 정보 확인
      console.log('\n8. 의사 정보 확인:');
      const doctors = ['김민수 원장', '이정희 원장', '박준영 원장', '최서연 원장', '정현우 원장', '강지민 원장'];
      let doctorCount = 0;
      doctors.forEach(doctor => {
        if (html.includes(doctor)) {
          doctorCount++;
          console.log(`✅ ${doctor} - 확인됨`);
        }
      });
      console.log(`총 ${doctorCount}명의 의사 정보 확인됨`);

    } else {
      console.log('❌ 페이지 접속 실패 (Status:', response.status + ')');
    }

    // 예약 페이지 테스트
    console.log('\n\n=== 예약 페이지 테스트 ===');
    console.log('예약 페이지 접속 테스트...');
    const bookingResponse = await fetch(`${BASE_URL}/patient/telemedicine/booking/1`);

    if (bookingResponse.ok) {
      console.log('✅ 예약 페이지 접속 성공 (Status:', bookingResponse.status + ')');

      const bookingHtml = await bookingResponse.text();

      // 예약 단계 확인
      if (bookingHtml.includes('날짜/시간') &&
          bookingHtml.includes('증상입력') &&
          bookingHtml.includes('결제확인') &&
          bookingHtml.includes('예약완료')) {
        console.log('✅ 4단계 예약 프로세스 확인');
      }

      // 진료 방식 선택 확인
      if (bookingHtml.includes('화상 진료') && bookingHtml.includes('전화 진료')) {
        console.log('✅ 진료 방식 선택 옵션 확인');
      }

      // 캘린더 컴포넌트 확인
      if (bookingHtml.includes('진료 날짜')) {
        console.log('✅ 날짜 선택 기능 확인');
      }

      // 시간 슬롯 확인
      if (bookingHtml.includes('09:00') && bookingHtml.includes('21:30')) {
        console.log('✅ 시간 슬롯 표시 확인');
      }
    } else {
      console.log('❌ 예약 페이지 접속 실패 (Status:', bookingResponse.status + ')');
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  }

  console.log('\n=== 테스트 완료 ===');
}

// 테스트 실행
testTelemedicinePage();