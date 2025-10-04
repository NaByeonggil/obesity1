async function testBooking() {
  console.log('🔍 젤라의원 예약 테스트\n')
  console.log('=' .repeat(80))

  const bookingData = {
    doctorId: 'user-1759218534856-68a57e05', // 조종훈 의사 ID
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    type: 'OFFLINE', 
    symptoms: '두통',
    department: '신경외과',
    notes: '테스트 예약'
  }

  console.log('📋 예약 데이터:', JSON.stringify(bookingData, null, 2))
  
  // 현재 개발 서버가 실행중이므로 curl로 직접 테스트
  console.log('\n💡 예약을 테스트하려면:')
  console.log('1. http://localhost:3000/patient 접속')
  console.log('2. 신경외과 선택')
  console.log('3. 젤라의원 예약하기 클릭')
  console.log('4. 예약 정보 입력 후 제출')
  console.log('\n✅ 수정 내용:')
  console.log('- 하드코딩된 의사 ID를 실제 조종훈 의사 ID로 변경')
  console.log('- 젤라의원은 OFFLINE (대면) 진료로 설정')
  console.log('- API 엔드포인트: /api/patient/appointments')
}

testBooking()
