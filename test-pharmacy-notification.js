// 약사 알림 테스트
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PATIENT_EMAIL = 'junam670@gmail.com'
const DOCTOR_EMAIL = 'kim@naver.com'
const PHARMACY_EMAIL = 'song@naver.com'

async function testPharmacyNotification() {
  console.log('🧪 약사 알림 시스템 테스트 시작\n')
  console.log('환자:', PATIENT_EMAIL)
  console.log('의사:', DOCTOR_EMAIL)
  console.log('약사:', PHARMACY_EMAIL)
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

    const pharmacy = await prisma.users.findUnique({
      where: { email: PHARMACY_EMAIL }
    })

    if (!patient) {
      console.log(`   ❌ 환자를 찾을 수 없습니다: ${PATIENT_EMAIL}`)
      await prisma.$disconnect()
      return
    }

    if (!doctor) {
      console.log(`   ❌ 의사를 찾을 수 없습니다: ${DOCTOR_EMAIL}`)
      await prisma.$disconnect()
      return
    }

    if (!pharmacy) {
      console.log(`   ❌ 약사를 찾을 수 없습니다: ${PHARMACY_EMAIL}`)

      // 사용 가능한 약사 계정 찾기
      const allPharmacies = await prisma.users.findMany({
        where: { role: 'PHARMACY' },
        take: 5
      })
      console.log('\n   사용 가능한 약사 계정:')
      allPharmacies.forEach((ph, i) => {
        console.log(`   ${i+1}. ${ph.name} (${ph.email})`)
        if (ph.pharmacyName) console.log(`      약국: ${ph.pharmacyName}`)
      })
      await prisma.$disconnect()
      return
    }

    console.log(`   ✅ 환자: ${patient.name}`)
    console.log(`   ✅ 의사: ${doctor.name}`)
    console.log(`   ✅ 약사: ${pharmacy.name}`)
    if (pharmacy.pharmacyName) {
      console.log(`      약국명: ${pharmacy.pharmacyName}`)
    }
    console.log('')

    // 2. 테스트용 처방전 생성
    console.log('2️⃣ 테스트 처방전 생성...')

    // 먼저 예약 생성
    const department = await prisma.departments.findFirst()
    if (!department) {
      console.log('   ❌ 진료과가 없습니다.')
      await prisma.$disconnect()
      return
    }

    const appointment = await prisma.appointments.create({
      data: {
        id: `apt-rx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: department.id,
        appointmentDate: new Date(),
        type: 'OFFLINE',
        symptoms: '테스트',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // 처방전 생성
    const prescriptionNumber = `RX${Date.now()}`
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)

    const prescription = await prisma.prescriptions.create({
      data: {
        id: `presc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        prescriptionNumber: prescriptionNumber,
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentId: appointment.id,
        status: 'ISSUED',
        diagnosis: '테스트 진단',
        notes: '약사 알림 테스트용 처방전',
        validUntil: validUntil,
        totalPrice: 10000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        users_prescriptions_patientIdTousers: true
      }
    })

    console.log(`   ✅ 처방전 생성 완료`)
    console.log(`      처방전 번호: ${prescription.prescriptionNumber}`)
    console.log(`      유효기간: ${validUntil.toLocaleDateString('ko-KR')}`)
    console.log('')

    // 3. 처방전을 약국으로 전송
    console.log('3️⃣ 처방전을 약국으로 전송...')

    const updatedPrescription = await prisma.prescriptions.update({
      where: { id: prescription.id },
      data: {
        pharmacyId: pharmacy.id,
        status: 'PENDING',
        updatedAt: new Date()
      }
    })

    console.log(`   ✅ 처방전 전송 완료`)
    console.log(`      약국: ${pharmacy.pharmacyName || pharmacy.name}`)
    console.log('')

    // 4. 약사에게 알림 생성
    console.log('4️⃣ 약사 알림 생성...')

    const notification = await prisma.user_notifications.create({
      data: {
        id: `notif_pharmacy_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId: pharmacy.id,
        title: '새로운 처방전',
        message: `${patient.name}님의 처방전이 전송되었습니다. (처방전번호: ${prescription.prescriptionNumber})`,
        type: 'NEW_PRESCRIPTION',
        read: false,
        createdAt: new Date()
      }
    })

    console.log(`   ✅ 알림 생성 완료!`)
    console.log(`      알림 ID: ${notification.id}`)
    console.log(`      제목: ${notification.title}`)
    console.log(`      내용: ${notification.message}`)
    console.log('')

    // 5. 약사의 알림 상태 확인
    console.log('5️⃣ 약사의 알림 상태...')
    const allNotifications = await prisma.user_notifications.findMany({
      where: { userId: pharmacy.id },
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
    console.log('✅ 약사 알림이 성공적으로 생성되었습니다!')
    console.log('═══════════════════════════════════════════════')
    console.log('')
    console.log('🌐 브라우저에서 테스트하세요:')
    console.log('')
    console.log('1. http://localhost:3001 접속')
    console.log('')
    console.log('2. 약사 계정으로 로그인:')
    console.log(`   이메일: ${PHARMACY_EMAIL}`)
    console.log('   비밀번호: 123456')
    console.log('')
    console.log('3. 로그인 후 확인사항:')
    console.log('   🔔 30초 이내에 오른쪽 상단에 알림 토스트 팝업!')
    console.log(`   ● 벨 아이콘에 빨간 배지 (읽지 않은 알림: ${unreadCount})`)
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
    console.log('')
    console.log('📋 전체 흐름 요약:')
    console.log(`   1. 환자(${patient.name})가 처방전 받음`)
    console.log(`   2. 환자가 약국(${pharmacy.pharmacyName || pharmacy.name})으로 처방전 전송`)
    console.log(`   3. 약사(${pharmacy.name})에게 알림 전송 ✅`)
    console.log(`   4. 약사 로그인 시 토스트 팝업 표시 ✅`)
    console.log('')
    console.log('═══════════════════════════════════════════════')

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ 오류:', error.message)
    console.error(error)
    await prisma.$disconnect()
  }
}

testPharmacyNotification()
