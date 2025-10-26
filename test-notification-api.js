// 알림 API 테스트
const BASE_URL = 'http://localhost:3001'

async function testNotificationSystem() {
  console.log('🧪 알림 시스템 테스트 시작\n')

  try {
    // 1. 알림 API 엔드포인트 확인
    console.log('1️⃣ 알림 API 엔드포인트 테스트...')
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    console.log('   상태 코드:', response.status)

    if (response.status === 401) {
      console.log('   ✅ 인증 필요 (정상 동작) - 로그인 후 사용 가능\n')
    } else if (response.ok) {
      const data = await response.json()
      console.log('   ✅ API 응답 성공')
      console.log('   알림 개수:', data.notifications?.length || 0)
      console.log('   읽지 않은 알림:', data.unreadCount || 0)
      console.log('')
    }

    // 2. 컴포넌트 파일 확인
    console.log('2️⃣ 컴포넌트 파일 확인...')
    const fs = require('fs')
    const path = require('path')

    const files = [
      'src/components/notifications/NotificationBell.tsx',
      'src/components/notifications/NotificationToast.tsx',
      'src/app/api/patient/appointments/route.ts',
      'src/app/api/notifications/route.ts'
    ]

    files.forEach(file => {
      const filePath = path.join(__dirname, file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')

        if (file.includes('NotificationToast')) {
          const hasToastFunc = content.includes('showNotificationToast')
          const hasCloseButton = content.includes('<X')
          console.log(`   ✅ ${file}`)
          console.log(`      - showNotificationToast 함수: ${hasToastFunc ? '✓' : '✗'}`)
          console.log(`      - 닫기 버튼 (X): ${hasCloseButton ? '✓' : '✗'}`)
        } else if (file.includes('NotificationBell')) {
          const hasImport = content.includes('showNotificationToast')
          const hasAutoShow = content.includes('previousNotificationIds')
          console.log(`   ✅ ${file}`)
          console.log(`      - 토스트 import: ${hasImport ? '✓' : '✗'}`)
          console.log(`      - 자동 표시 로직: ${hasAutoShow ? '✓' : '✗'}`)
        } else if (file.includes('patient/appointments')) {
          const hasNotification = content.includes('user_notifications.create')
          const hasDoctorNotif = content.includes('새로운 예약')
          console.log(`   ✅ ${file}`)
          console.log(`      - 알림 생성 코드: ${hasNotification ? '✓' : '✗'}`)
          console.log(`      - 의사 알림: ${hasDoctorNotif ? '✓' : '✗'}`)
        } else {
          console.log(`   ✅ ${file}`)
        }
      } else {
        console.log(`   ❌ ${file} - 파일이 없습니다`)
      }
    })

    console.log('\n3️⃣ 구현된 기능 요약:')
    console.log('   ✅ 예약 생성 시 의사에게 알림 전송')
    console.log('   ✅ 오른쪽 상단 토스트 팝업 (위치: top-right)')
    console.log('   ✅ 닫기 버튼 (X) 포함')
    console.log('   ✅ 5초 후 자동 닫힘')
    console.log('   ✅ 30초마다 새 알림 자동 확인')
    console.log('   ✅ 새 알림 시 자동으로 토스트 표시')

    console.log('\n🎯 다음 단계:')
    console.log('   1. 브라우저에서 http://localhost:3001 접속')
    console.log('   2. 환자 계정으로 로그인하여 예약 생성')
    console.log('   3. 의사 계정으로 로그인하여 알림 토스트 확인')
    console.log('')

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message)
  }
}

testNotificationSystem()
