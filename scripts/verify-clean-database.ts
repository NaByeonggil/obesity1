import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyCleanDatabase() {
  try {
    console.log('🔍 데이터베이스 상태 확인\n')
    console.log('=' .repeat(80))

    // 1. 의사 데이터 확인
    const doctorCount = await prisma.users.count({
      where: { role: 'DOCTOR' }
    })
    console.log(`📋 의사 수: ${doctorCount}명`)

    if (doctorCount > 0) {
      const doctors = await prisma.users.findMany({
        where: { role: 'DOCTOR' },
        select: { id: true, name: true, email: true }
      })
      console.log('⚠️  남은 의사 계정:')
      doctors.forEach(d => console.log(`   - ${d.name} (${d.email})`))
    }

    // 2. 의사 관련 예약 확인
    const doctorAppointments = await prisma.appointments.count({
      where: {
        users_appointments_doctorIdTousers: {
          role: 'DOCTOR'
        }
      }
    })
    console.log(`📋 의사 관련 예약: ${doctorAppointments}개`)

    // 3. 병원 진료비 데이터 확인
    const clinicFees = await prisma.clinic_fees.count()
    console.log(`📋 병원 진료비 데이터: ${clinicFees}개`)

    // 4. 환자 데이터 확인 (보존되어야 함)
    const patientCount = await prisma.users.count({
      where: { role: 'PATIENT' }
    })
    console.log(`📋 환자 수: ${patientCount}명 (보존됨)`)

    // 5. 진료과 데이터 확인 (보존되어야 함)
    const departmentCount = await prisma.departments.count()
    console.log(`📋 진료과 수: ${departmentCount}개 (보존됨)`)

    // 6. 전체 예약 수 확인
    const totalAppointments = await prisma.appointments.count()
    console.log(`📋 전체 예약 수: ${totalAppointments}개`)

    // 7. 결과 요약
    console.log('\n📊 정리 결과:')
    console.log('=' .repeat(80))

    if (doctorCount === 0 && doctorAppointments === 0 && clinicFees === 0) {
      console.log('✅ 데이터베이스가 성공적으로 정리되었습니다!')
      console.log('✅ 의사 및 병원 관련 데이터가 모두 삭제되었습니다.')
      console.log('✅ 환자 데이터와 진료과 정보는 보존되었습니다.')
      console.log('\n🎯 새로운 의사 가입이 가능합니다:')
      console.log('   1. http://localhost:3000/auth/login 접속')
      console.log('   2. "회원가입" 클릭')
      console.log('   3. 역할을 "의사"로 선택')
      console.log('   4. 의사 정보 입력 (면허번호, 전문분야, 병원명 등)')
      console.log('   5. 가입 완료 후 로그인')
    } else {
      console.log('⚠️  일부 데이터가 남아있습니다:')
      if (doctorCount > 0) console.log(`   - 의사 계정: ${doctorCount}개`)
      if (doctorAppointments > 0) console.log(`   - 의사 예약: ${doctorAppointments}개`)
      if (clinicFees > 0) console.log(`   - 병원 진료비: ${clinicFees}개`)
    }

  } catch (error) {
    console.error('❌ 확인 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyCleanDatabase()