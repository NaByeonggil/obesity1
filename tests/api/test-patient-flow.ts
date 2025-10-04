// 환자 비대면 진료 예약 플로우 테스트
// 1. 환자 로그인
// 2. 의원 리스트 확인
// 3. 비대면 진료 예약
// 4. 의사 로그인 후 승인
// 5. 처방전 발행

const API_BASE = 'http://localhost:3000/api'

// 테스트용 환자 및 의사 계정
const patientCredentials = {
  email: 'patient1@test.com',
  password: 'password123',
  role: 'patient'
}

const doctorCredentials = {
  email: 'doctor1@test.com',
  password: 'password123',
  role: 'doctor'
}

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 1. 환자 로그인
async function patientLogin() {
  log('\n=== STEP 1: 환자 로그인 ===', colors.cyan)

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientCredentials)
    })

    const data = await response.json()

    if (response.ok && data.token) {
      // Store cookie for future requests
      const setCookieHeader = response.headers.get('set-cookie')
      if (setCookieHeader) {
        cookieJar.push(`auth-token=${data.token}`)
      }

      log('✅ 환자 로그인 성공', colors.green)
      log(`  - 이름: ${data.user.name}`, colors.blue)
      log(`  - 역할: ${data.user.role}`, colors.blue)
      return data.token
    } else {
      throw new Error(data.error || '로그인 실패')
    }
  } catch (error) {
    log(`❌ 환자 로그인 실패: ${error}`, colors.red)
    throw error
  }
}

// Cookie storage
let cookieJar: string[] = []

// 2. 의원 리스트 조회
async function getDoctorList(token: string) {
  log('\n=== STEP 2: 의원 리스트 조회 ===', colors.cyan)

  try {
    const response = await fetch(`${API_BASE}/patient/doctors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': cookieJar.join('; ')
      }
    })

    const data = await response.json()

    if (data.doctors && data.doctors.length > 0) {
      log('✅ 의원 리스트 조회 성공', colors.green)
      log(`  - 총 ${data.doctors.length}개 의원 발견`, colors.blue)

      // 첫 번째 의원 선택
      const selectedDoctor = data.doctors[0]
      log(`  - 선택된 의원: ${selectedDoctor.name} (${selectedDoctor.specialization})`, colors.yellow)
      return selectedDoctor
    } else {
      throw new Error('의원을 찾을 수 없습니다')
    }
  } catch (error) {
    log(`❌ 의원 리스트 조회 실패: ${error}`, colors.red)
    throw error
  }
}

// 3. 비대면 진료 예약
async function bookTelehealthAppointment(token: string, doctorId: string) {
  log('\n=== STEP 3: 비대면 진료 예약 ===', colors.cyan)

  const appointmentData = {
    doctorId,
    date: '2025-01-25',
    time: '14:00',
    type: 'telehealth',
    symptoms: '두통과 어지러움',
    department: '내과',
    notes: '비대면 진료를 희망합니다'
  }

  try {
    const response = await fetch(`${API_BASE}/patient/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cookie': cookieJar.join('; ')
      },
      body: JSON.stringify(appointmentData)
    })

    const data = await response.json()

    if (data.success) {
      log('✅ 비대면 진료 예약 성공', colors.green)
      log(`  - 예약 ID: ${data.appointment.id}`, colors.blue)
      log(`  - 날짜: ${appointmentData.date}`, colors.blue)
      log(`  - 시간: ${appointmentData.time}`, colors.blue)
      log(`  - 유형: 비대면진료`, colors.blue)
      return data.appointment.id
    } else {
      throw new Error(data.error || '예약 실패')
    }
  } catch (error) {
    log(`❌ 비대면 진료 예약 실패: ${error}`, colors.red)
    throw error
  }
}

// 4. 의사 로그인
async function doctorLogin() {
  log('\n=== STEP 4: 의사 로그인 ===', colors.cyan)

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorCredentials)
    })

    const data = await response.json()

    if (response.ok && data.token) {
      // Clear patient cookies and set doctor cookies
      cookieJar = [`auth-token=${data.token}`]

      log('✅ 의사 로그인 성공', colors.green)
      log(`  - 이름: ${data.user.name}`, colors.blue)
      log(`  - 역할: ${data.user.role}`, colors.blue)
      return data.token
    } else {
      throw new Error(data.error || '로그인 실패')
    }
  } catch (error) {
    log(`❌ 의사 로그인 실패: ${error}`, colors.red)
    throw error
  }
}

// 5. 예약 승인
async function approveAppointment(token: string, appointmentId: string) {
  log('\n=== STEP 5: 예약 승인 ===', colors.cyan)

  try {
    const response = await fetch(`${API_BASE}/doctor/appointments/${appointmentId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cookie': cookieJar.join('; ')
      },
      body: JSON.stringify({
        status: 'confirmed',
        notes: '비대면 진료 예약이 승인되었습니다'
      })
    })

    const data = await response.json()

    if (data.success) {
      log('✅ 예약 승인 성공', colors.green)
      log(`  - 상태: 승인됨`, colors.blue)
      return true
    } else {
      throw new Error(data.error || '승인 실패')
    }
  } catch (error) {
    log(`❌ 예약 승인 실패: ${error}`, colors.red)
    throw error
  }
}

// 6. 처방전 발행
async function issuePrescription(token: string, appointmentId: string) {
  log('\n=== STEP 6: 처방전 발행 ===', colors.cyan)

  const prescriptionData = {
    appointmentId,
    patientName: '테스트 환자',
    diagnosis: '편두통',
    medication: '타이레놀, 진통제',
    instructions: '하루 3회, 식후 30분',
    validDays: 3,
    notes: '충분한 휴식을 취하시기 바랍니다'
  }

  try {
    const response = await fetch(`${API_BASE}/doctor/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cookie': cookieJar.join('; ')
      },
      body: JSON.stringify(prescriptionData)
    })

    const data = await response.json()

    if (data.success) {
      log('✅ 처방전 발행 성공', colors.green)
      log(`  - 처방전 ID: ${data.prescription.id}`, colors.blue)
      log(`  - 진단: ${prescriptionData.diagnosis}`, colors.blue)
      log(`  - 처방약: ${prescriptionData.medication}`, colors.blue)
      log(`  - 복용법: ${prescriptionData.instructions}`, colors.blue)
      return data.prescription
    } else {
      throw new Error(data.error || '처방전 발행 실패')
    }
  } catch (error) {
    log(`❌ 처방전 발행 실패: ${error}`, colors.red)
    throw error
  }
}

// 메인 테스트 플로우
async function runTestFlow() {
  log('\n🏥 비대면 진료 전체 플로우 테스트 시작 🏥\n', colors.yellow)

  try {
    // 1. 환자 로그인
    const patientToken = await patientLogin()
    await delay(1000)

    // 2. 의원 리스트 조회
    const selectedDoctor = await getDoctorList(patientToken)
    await delay(1000)

    // 3. 비대면 진료 예약
    const appointmentId = await bookTelehealthAppointment(patientToken, selectedDoctor.id)
    await delay(1000)

    log('\n--- 의사 측 처리 시작 ---', colors.yellow)

    // 4. 의사 로그인
    const doctorToken = await doctorLogin()
    await delay(1000)

    // 5. 예약 승인
    await approveAppointment(doctorToken, appointmentId)
    await delay(1000)

    // 6. 처방전 발행
    const prescription = await issuePrescription(doctorToken, appointmentId)
    await delay(1000)

    log('\n🎉 테스트 완료! 모든 단계가 성공적으로 수행되었습니다 🎉', colors.green)
    log('\n=== 테스트 요약 ===', colors.cyan)
    log('1. ✅ 환자 로그인', colors.green)
    log('2. ✅ 의원 리스트 조회', colors.green)
    log('3. ✅ 비대면 진료 예약', colors.green)
    log('4. ✅ 의사 로그인', colors.green)
    log('5. ✅ 예약 승인', colors.green)
    log('6. ✅ 처방전 발행', colors.green)

  } catch (error) {
    log(`\n❌ 테스트 실패: ${error}`, colors.red)
    process.exit(1)
  }
}

// 테스트 실행
runTestFlow().catch(console.error)