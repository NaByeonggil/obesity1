// 실제 계정으로 알림 테스트
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PATIENT_EMAIL = 'junam670@gmail.com'
const DOCTOR_EMAIL = 'kim@naver.com'

async function testNotification() {
  console.log('🧪 알림 시스템 테스트 시작\n')
  console.log('환자:', PATIENT_EMAIL)
  console.log('의사:', DOCTOR_EMAIL)
  console.log('')

  try {
    // 1. 계정 확인
    console.log('1️⃣ 계정 확인...')
    const patient = await prisma.users.findUnique({
      where: { email: PATIENT_EMAIL }
    })

    const doctor = await prisma.users.findUnique({
      where: { email: DOCTOR_EMAIL }
    })

    if (!patient) {
      console.log(`   ❌ 환자를 찾을 수 없습니다: ${PATIENT_EMAIL}`)

      // 비슷한 계정 찾기
      const allPatients = await prisma.users.findMany({
        where: { role: 'PATIENT' },
        take: 5
      })
      console.log('\n   사용 가능한 환자 계정:')
      allPatients.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name} (${p.email})`)
      })
      await prisma.$disconnect()
      return
    }

    if (!doctor) {
      console.log(`   ❌ 의사를 찾을 수 없습니다: ${DOCTOR_EMAIL}`)

      // 비슷한 계정 찾기
      const allDoctors = await prisma.users.findMany({
        where: { role: 'DOCTOR' },
        take: 5
      })
      console.log('\n   사용 가능한 의사 계정:')
      allDoctors.forEach((d, i) => {
        console.log(`   ${i+1}. ${d.name} (${d.email})`)
      })
      await prisma.$disconnect()
      return
    }

    console.log(`   ✅ 환자: ${patient.name} (${patient.role})`)
    console.log(`   ✅ 의사: ${doctor.name} (${doctor.role})`)
    if (doctor.specialization) {
      console.log(`      전문과: ${doctor.specialization}`)
    }
    console.log('')

    // 2. 진료과 찾기
    console.log('2️⃣ 진료과 확인...')
    const department = await prisma.departments.findFirst()

    if (!department) {
      console.log('   ❌ 진료과가 없습니다.')
      await prisma.$disconnect()
      return
    }
    console.log(`   ✅ 진료과: ${department.name}`)
    console.log('')

    // 3. 테스트 예약 생성
    console.log('3️⃣ 테스트 예약 생성...')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    const timeStr = '14:00'

    const appointment = await prisma.appointments.create({
      data: {
        id: `apt-test-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: department.id,
        appointmentDate: new Date(`${dateStr}T${timeStr}:00`),
        type: 'OFFLINE',
        symptoms: '알림 테스트용 예약',
        notes: '알림 시스템 테스트',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`   ✅ 예약 ID: ${appointment.id}`)
    console.log(`      날짜: ${dateStr} ${timeStr}`)
    console.log('')

    // 4. 의사 알림 생성 (핵심!)
    console.log('4️⃣ 의사에게 알림 생성...')
    const notification = await prisma.user_notifications.create({
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

    console.log(`   ✅ 알림 생성 완료!`)
    console.log(`      알림 ID: ${notification.id}`)
    console.log(`      제목: ${notification.title}`)
    console.log(`      내용: ${notification.message}`)
    console.log('')

    // 5. 의사의 총 알림 개수 확인
    console.log('5️⃣ 의사의 알림 상태...')
    const allNotifications = await prisma.user_notifications.findMany({
      where: { userId: doctor.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const unreadCount = allNotifications.filter(n => !n.read).length
    console.log(`   총 알림: ${allNotifications.length}개`)
    console.log(`   읽지 않은 알림: ${unreadCount}개`)
    console.log('')

    if (allNotifications.length > 0) {
      console.log('   최근 알림 목록:')
      allNotifications.forEach((n, i) => {
        const status = n.read ? '✓' : '●'
        console.log(`   ${i+1}. ${status} ${n.title}`)
        console.log(`      ${n.message}`)
      })
    }
    console.log('')

    // 6. 브라우저 테스트 안내
    console.log('═══════════════════════════════════════════════')
    console.log('✅ 알림이 성공적으로 생성되었습니다!')
    console.log('═══════════════════════════════════════════════')
    console.log('')
    console.log('🌐 브라우저에서 테스트하세요:')
    console.log('')
    console.log('1. http://localhost:3001 접속')
    console.log('')
    console.log('2. 의사 계정으로 로그인:')
    console.log(`   이메일: ${DOCTOR_EMAIL}`)
    console.log('   비밀번호: 123456')
    console.log('')
    console.log('3. 로그인 후 확인사항:')
    console.log('   🔔 30초 이내에 오른쪽 상단에 알림 토스트 팝업!')
    console.log('   ● 벨 아이콘에 빨간 배지 (읽지 않은 알림 개수)')
    console.log('')
    console.log('📱 토스트 알림 내용:')
    console.log(`   제목: ${notification.title}`)
    console.log(`   내용: ${notification.message}`)
    console.log('')
    console.log('✨ 확인할 기능:')
    console.log('   ✓ 오른쪽 상단에 토스트 팝업 자동 표시')
    console.log('   ✓ X 버튼으로 즉시 닫기')
    console.log('   ✓ 5초 후 자동으로 사라짐')
    console.log('   ✓ 벨 아이콘 클릭 → 알림 목록 표시')
    console.log('   ✓ 알림 클릭 → 읽음 처리')
    console.log('')
    console.log('═══════════════════════════════════════════════')

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ 오류:', error.message)
    console.error(error)
    await prisma.$disconnect()
  }
}

testNotification()
