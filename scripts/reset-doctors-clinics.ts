import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDoctorsAndClinics() {
  try {
    console.log('🔄 의사 및 병원 데이터 초기화 시작...\n')
    console.log('=' .repeat(80))

    // 1. 현재 의사 및 병원 데이터 확인
    console.log('\n📋 1. 현재 의사 및 관련 데이터 확인:')
    console.log('-' .repeat(80))

    const doctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        clinic: true,
        email: true
      }
    })

    console.log(`\n현재 의사 수: ${doctors.length}명`)
    doctors.forEach((doctor, index) => {
      console.log(`  ${index + 1}. ${doctor.name} - ${doctor.clinic} (${doctor.email})`)
    })

    // 2. 관련 예약 확인
    console.log('\n📋 2. 의사들의 예약 확인:')
    console.log('-' .repeat(80))

    const appointments = await prisma.appointments.findMany({
      where: {
        doctorId: {
          in: doctors.map(d => d.id)
        }
      },
      include: {
        users_appointments_patientIdTousers: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`\n총 예약 수: ${appointments.length}개`)
    if (appointments.length > 0) {
      console.log('\n삭제될 예약:')
      appointments.forEach((apt, index) => {
        console.log(`  ${index + 1}. ${apt.id} - 환자: ${apt.users_appointments_patientIdTousers?.name}`)
      })
    }

    // 3. 관련 처방전 확인
    console.log('\n📋 3. 의사들의 처방전 확인:')
    console.log('-' .repeat(80))

    const prescriptions = await prisma.prescriptions.findMany({
      where: {
        doctorId: {
          in: doctors.map(d => d.id)
        }
      }
    })

    console.log(`\n총 처방전 수: ${prescriptions.length}개`)

    // 4. 삭제 작업 수행
    console.log('\n📋 4. 데이터 삭제 작업:')
    console.log('-' .repeat(80))

    // 외래키 제약 조건 일시적으로 비활성화
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`

    // 4-1. 처방약품 삭제
    if (prescriptions.length > 0) {
      for (const prescription of prescriptions) {
        const deletedMedications = await prisma.prescription_medications.deleteMany({
          where: {
            prescriptionId: prescription.id
          }
        })
        if (deletedMedications.count > 0) {
          console.log(`  - ${prescription.id}의 처방약품 ${deletedMedications.count}개 삭제`)
        }
      }
    }

    // 4-2. 처방전 삭제
    if (prescriptions.length > 0) {
      const deletedPrescriptions = await prisma.prescriptions.deleteMany({
        where: {
          doctorId: {
            in: doctors.map(d => d.id)
          }
        }
      })
      console.log(`✅ ${deletedPrescriptions.count}개의 처방전 삭제 완료`)
    }

    // 4-3. 예약 삭제
    if (appointments.length > 0) {
      const deletedAppointments = await prisma.appointments.deleteMany({
        where: {
          doctorId: {
            in: doctors.map(d => d.id)
          }
        }
      })
      console.log(`✅ ${deletedAppointments.count}개의 예약 삭제 완료`)
    }

    // 4-4. 의사 계정 삭제
    if (doctors.length > 0) {
      const deletedDoctors = await prisma.users.deleteMany({
        where: {
          role: 'DOCTOR'
        }
      })
      console.log(`✅ ${deletedDoctors.count}명의 의사 계정 삭제 완료`)
    }

    // 외래키 제약 조건 다시 활성화
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`

    // 5. 삭제 후 확인
    console.log('\n📋 5. 삭제 후 확인:')
    console.log('-' .repeat(80))

    const remainingDoctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      }
    })

    const remainingAppointments = await prisma.appointments.count()
    const remainingPrescriptions = await prisma.prescriptions.count()

    console.log(`\n남은 의사 수: ${remainingDoctors.length}명`)
    console.log(`남은 예약 수: ${remainingAppointments}개`)
    console.log(`남은 처방전 수: ${remainingPrescriptions}개`)

    // 6. 환자 계정 확인 (삭제되지 않았는지 확인)
    console.log('\n📋 6. 환자 계정 확인:')
    console.log('-' .repeat(80))

    const patients = await prisma.users.findMany({
      where: {
        role: 'PATIENT'
      },
      select: {
        name: true,
        email: true
      }
    })

    console.log(`\n환자 계정 수: ${patients.length}명 (유지됨)`)
    patients.forEach((patient, index) => {
      console.log(`  ${index + 1}. ${patient.name} (${patient.email})`)
    })

    // 7. 최종 결과
    console.log('\n📊 초기화 완료 요약:')
    console.log('=' .repeat(80))
    console.log(`\n삭제된 데이터:`)
    console.log(`  - 의사 계정: ${doctors.length}명`)
    console.log(`  - 예약: ${appointments.length}개`)
    console.log(`  - 처방전: ${prescriptions.length}개`)
    console.log(`\n유지된 데이터:`)
    console.log(`  - 환자 계정: ${patients.length}명`)
    console.log(`  - 부서 정보: 유지됨`)
    console.log(`  - 약품 정보: 유지됨`)

    console.log('\n🎉 의사 및 병원 데이터 초기화가 완료되었습니다!')
    console.log('이제 새로운 의사 계정을 등록할 수 있습니다.')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDoctorsAndClinics()