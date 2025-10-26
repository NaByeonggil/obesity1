// 실제 계정으로 알림 테스트
const BASE_URL = 'http://localhost:3001'

// 환자 계정 정보
const PATIENT_EMAIL = 'junam670@naver.com'
const PATIENT_PASSWORD = 'test1234' // 실제 비밀번호로 변경 필요

// 의사 계정 정보
const DOCTOR_EMAIL = 'kim@naver.com'
const DOCTOR_PASSWORD = 'test1234' // 실제 비밀번호로 변경 필요

async function testWithRealAccounts() {
  console.log('🧪 실제 계정으로 알림 시스템 테스트\n')
  console.log('환자 계정:', PATIENT_EMAIL)
  console.log('의사 계정:', DOCTOR_EMAIL)
  console.log('')

  try {
    // 1. 계정 존재 확인
    console.log('1️⃣ 데이터베이스에서 계정 확인...')
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const patient = await prisma.users.findUnique({
      where: { email: PATIENT_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    const doctor = await prisma.users.findUnique({
      where: { email: DOCTOR_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialization: true
      }
    })

    if (!patient) {
      console.log(`   ❌ 환자 계정을 찾을 수 없습니다: ${PATIENT_EMAIL}`)
      await prisma.$disconnect()
      return
    }

    if (!doctor) {
      console.log(`   ❌ 의사 계정을 찾을 수 없습니다: ${DOCTOR_EMAIL}`)
      await prisma.$disconnect()
      return
    }

    console.log(`   ✅ 환자 계정: ${patient.name} (${patient.email}) - ${patient.role}`)
    console.log(`   ✅ 의사 계정: ${doctor.name} (${doctor.email}) - ${doctor.role}`)
    if (doctor.specialization) {
      console.log(`      전문과: ${doctor.specialization}`)
    }
    console.log('')

    // 2. 현재 의사의 알림 개수 확인
    console.log('2️⃣ 의사의 현재 알림 상태 확인...')
    const currentNotifications = await prisma.user_notifications.findMany({
      where: { userId: doctor.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log(`   총 알림 개수: ${currentNotifications.length}`)
    const unreadCount = currentNotifications.filter(n => !n.read).length
    console.log(`   읽지 않은 알림: ${unreadCount}`)

    if (currentNotifications.length > 0) {
      console.log('\n   최근 알림:')
      currentNotifications.forEach((notif, idx) => {
        const status = notif.read ? '읽음' : '안읽음'
        console.log(`   ${idx + 1}. [${status}] ${notif.title}: ${notif.message}`)
      })
    }
    console.log('')

    // 3. 테스트 예약 생성
    console.log('3️⃣ 테스트 예약 생성...')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    const timeStr = '14:00'

    // 진료과 찾기
    const department = await prisma.departments.findFirst()

    if (!department) {
      console.log('   ❌ 진료과를 찾을 수 없습니다.')
      await prisma.$disconnect()
      return
    }

    const newAppointment = await prisma.appointments.create({
      data: {
        id: `apt-test-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: department.id,
        appointmentDate: new Date(`${dateStr}T${timeStr}:00`),
        type: 'OFFLINE',
        symptoms: '테스트 예약 (알림 시스템 테스트)',
        notes: '알림 기능 테스트를 위한 예약입니다.',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`   ✅ 예약 생성 성공: ${newAppointment.id}`)
    console.log(`      날짜: ${dateStr} ${timeStr}`)
    console.log(`      진료과: ${department.name}`)
    console.log('')

    // 4. 환자 알림 생성
    console.log('4️⃣ 환자 알림 생성...')
    await prisma.user_notifications.create({
      data: {
        id: `notif_patient_${Date.now()}`,
        userId: patient.id,
        title: '예약 확정 알림',
        message: `${department.name} 예약이 확정되었습니다. (${dateStr} ${timeStr})`,
        type: 'APPOINTMENT_CONFIRMED',
        read: false,
        createdAt: new Date()
      }
    })
    console.log(`   ✅ 환자 알림 생성 완료`)
    console.log('')

    // 5. 의사 알림 생성
    console.log('5️⃣ 의사 알림 생성...')
    const doctorNotification = await prisma.user_notifications.create({
      data: {
        id: `notif_doctor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId: doctor.id,
        title: '새로운 예약',
        message: `${patient.name}님의 ${department.name} 예약이 접수되었습니다. (${dateStr} ${timeStr})`,
        type: 'NEW_APPOINTMENT',
        read: false,
        createdAt: new Date()
      }
    })
    console.log(`   ✅ 의사 알림 생성 완료`)
    console.log(`      알림 ID: ${doctorNotification.id}`)
    console.log(`      내용: ${doctorNotification.message}`)
    console.log('')

    // 6. 알림 확인
    console.log('6️⃣ 생성된 알림 확인...')
    const newNotifications = await prisma.user_notifications.findMany({
      where: { userId: doctor.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    })

    if (newNotifications.length > 0) {
      const notif = newNotifications[0]
      console.log(`   ✅ 최신 알림:`)
      console.log(`      제목: ${notif.title}`)
      console.log(`      메시지: ${notif.message}`)
      console.log(`      타입: ${notif.type}`)
      console.log(`      읽음 여부: ${notif.read ? '읽음' : '안읽음'}`)
      console.log(`      생성 시간: ${notif.createdAt.toLocaleString('ko-KR')}`)
    }
    console.log('')

    // 7. 테스트 안내
    console.log('═══════════════════════════════════════')
    console.log('🎯 브라우저 테스트 가이드')
    console.log('═══════════════════════════════════════')
    console.log('')
    console.log('✅ 알림이 성공적으로 생성되었습니다!')
    console.log('')
    console.log('📱 다음 순서로 브라우저에서 확인하세요:')
    console.log('')
    console.log('1. http://localhost:3001 접속')
    console.log(`2. 의사 계정으로 로그인: ${DOCTOR_EMAIL}`)
    console.log('3. 로그인 후 자동으로 오른쪽 상단에 알림 토스트 팝업!')
    console.log('   (30초 이내에 자동으로 나타남)')
    console.log('')
    console.log('🔔 예상되는 알림 내용:')
    console.log(`   제목: 새로운 예약`)
    console.log(`   내용: ${patient.name}님의 ${department.name} 예약이 접수되었습니다.`)
    console.log('')
    console.log('✨ 확인할 사항:')
    console.log('   ✓ 오른쪽 상단에 토스트 팝업이 나타남')
    console.log('   ✓ X 버튼으로 닫기 가능')
    console.log('   ✓ 5초 후 자동으로 사라짐')
    console.log('   ✓ 벨 아이콘에 읽지 않은 알림 배지 표시')
    console.log('   ✓ 벨 아이콘 클릭 시 알림 목록 표시')
    console.log('')
    console.log('═══════════════════════════════════════')

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message)
    console.error(error)
  }
}

testWithRealAccounts()
