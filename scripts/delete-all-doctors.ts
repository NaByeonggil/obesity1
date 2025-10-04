import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllDoctors() {
  try {
    console.log('🗑️  의사 및 병원 데이터 완전 삭제 시작\n')
    console.log('=' .repeat(80))

    // 1. 현재 의사 수 확인
    const doctorCount = await prisma.users.count({
      where: { role: 'DOCTOR' }
    })
    console.log(`\n📋 현재 의사 수: ${doctorCount}명`)

    if (doctorCount === 0) {
      console.log('✅ 이미 의사 데이터가 없습니다.')
      return
    }

    // 2. 의사 목록 출력
    const doctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true,
        specialization: true
      }
    })

    console.log('\n📋 삭제될 의사 목록:')
    console.log('-' .repeat(80))
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} (${doctor.email})`)
      console.log(`   병원: ${doctor.clinic}`)
      console.log(`   전문분야: ${doctor.specialization}`)
      console.log()
    })

    // 3. 관련 데이터 삭제 (외래키 제약조건 순서대로)
    console.log('🔄 관련 데이터 삭제 중...\n')

    // 3-1. 처방전 삭제
    const prescriptionCount = await prisma.prescriptions.count({
      where: {
        appointments: {
          doctorId: { in: doctors.map(d => d.id) }
        }
      }
    })
    console.log(`📋 처방전 삭제: ${prescriptionCount}개`)
    await prisma.prescriptions.deleteMany({
      where: {
        appointments: {
          doctorId: { in: doctors.map(d => d.id) }
        }
      }
    })

    // 3-2. 예약 삭제
    const appointmentCount = await prisma.appointments.count({
      where: {
        doctorId: { in: doctors.map(d => d.id) }
      }
    })
    console.log(`📋 예약 삭제: ${appointmentCount}개`)
    await prisma.appointments.deleteMany({
      where: {
        doctorId: { in: doctors.map(d => d.id) }
      }
    })

    // 3-3. 병원 진료비 정보 삭제
    const clinicFeesCount = await prisma.clinic_fees.count({
      where: {
        doctorId: { in: doctors.map(d => d.id) }
      }
    })
    console.log(`📋 병원 진료비 삭제: ${clinicFeesCount}개`)
    await prisma.clinic_fees.deleteMany({
      where: {
        doctorId: { in: doctors.map(d => d.id) }
      }
    })

    // 3-4. 의사 계정 삭제
    console.log(`📋 의사 계정 삭제: ${doctorCount}개`)
    await prisma.users.deleteMany({
      where: { role: 'DOCTOR' }
    })

    // 4. 삭제 완료 확인
    console.log('\n✅ 삭제 완료!')
    console.log('=' .repeat(80))

    const remainingDoctors = await prisma.users.count({
      where: { role: 'DOCTOR' }
    })
    console.log(`\n📊 삭제 후 의사 수: ${remainingDoctors}명`)

    if (remainingDoctors === 0) {
      console.log('🎉 모든 의사 및 병원 데이터가 성공적으로 삭제되었습니다!')
      console.log('\n💡 이제 새로운 의사 계정으로 가입하실 수 있습니다.')
      console.log('   - 의사 가입 페이지: http://localhost:3000/auth/login')
      console.log('   - 역할을 "의사"로 선택하여 가입하세요')
    } else {
      console.log('⚠️  일부 의사 데이터가 남아있습니다. 수동 확인이 필요합니다.')
    }

    // 5. 환자 데이터는 보존 확인
    const patientCount = await prisma.users.count({
      where: { role: 'PATIENT' }
    })
    console.log(`\n📋 환자 데이터 보존: ${patientCount}명 (삭제되지 않음)`)

    // 6. 부서 데이터 확인
    const departmentCount = await prisma.departments.count()
    console.log(`📋 진료과 데이터 보존: ${departmentCount}개 (삭제되지 않음)`)

  } catch (error) {
    console.error('❌ 삭제 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllDoctors()