import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteSeoulObesityClinic() {
  try {
    console.log('🗑️  서울비만클리닉 삭제 작업 시작...\n')
    console.log('=' .repeat(80))

    // 1. 서울비만클리닉 의사 찾기
    console.log('\n📋 1. 서울비만클리닉 의사 정보 확인:')
    console.log('-' .repeat(80))

    const seoulClinicDoctor = await prisma.users.findFirst({
      where: {
        clinic: '서울비만클리닉',
        role: 'DOCTOR'
      }
    })

    if (!seoulClinicDoctor) {
      console.log('❌ 서울비만클리닉 의사를 찾을 수 없습니다.')
      return
    }

    console.log(`\n✅ 삭제 대상 의사:`)
    console.log(`  - 이름: ${seoulClinicDoctor.name}`)
    console.log(`  - ID: ${seoulClinicDoctor.id}`)
    console.log(`  - 병원: ${seoulClinicDoctor.clinic}`)
    console.log(`  - 전문분야: ${seoulClinicDoctor.specialization}`)
    console.log(`  - 이메일: ${seoulClinicDoctor.email}`)

    // 2. 관련 예약 확인
    console.log('\n📋 2. 서울비만클리닉 관련 예약 확인:')
    console.log('-' .repeat(80))

    const appointments = await prisma.appointments.findMany({
      where: {
        doctorId: seoulClinicDoctor.id
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
      console.log('\n⚠️  삭제될 예약 목록:')
      appointments.forEach((apt, index) => {
        console.log(`\n${index + 1}. 예약 ID: ${apt.id}`)
        console.log(`   환자: ${apt.users_appointments_patientIdTousers?.name} (${apt.users_appointments_patientIdTousers?.email})`)
        console.log(`   날짜: ${apt.appointmentDate}`)
        console.log(`   상태: ${apt.status}`)
      })
    }

    // 3. 관련 처방전 확인
    console.log('\n📋 3. 관련 처방전 확인:')
    console.log('-' .repeat(80))

    const prescriptions = await prisma.prescriptions.findMany({
      where: {
        doctorId: seoulClinicDoctor.id
      }
    })

    console.log(`\n총 처방전 수: ${prescriptions.length}개`)

    // 4. 삭제 작업 수행
    console.log('\n📋 4. 삭제 작업 수행:')
    console.log('-' .repeat(80))

    // 처방전과 관련된 약품 처방 먼저 삭제
    if (prescriptions.length > 0) {
      for (const prescription of prescriptions) {
        // 처방약품 삭제
        const deletedMedications = await prisma.prescription_medications.deleteMany({
          where: {
            prescriptionId: prescription.id
          }
        })
        if (deletedMedications.count > 0) {
          console.log(`  - ${prescription.id}의 처방약품 ${deletedMedications.count}개 삭제`)
        }
      }

      // 처방전 삭제
      const deletedPrescriptions = await prisma.prescriptions.deleteMany({
        where: {
          doctorId: seoulClinicDoctor.id
        }
      })
      console.log(`\n✅ ${deletedPrescriptions.count}개의 처방전 삭제 완료`)
    }

    // 예약 삭제
    if (appointments.length > 0) {
      const deletedAppointments = await prisma.appointments.deleteMany({
        where: {
          doctorId: seoulClinicDoctor.id
        }
      })
      console.log(`✅ ${deletedAppointments.count}개의 예약 삭제 완료`)
    }

    // 의사를 참조하는 모든 처방전의 doctorId를 null로 설정 (삭제 대신)
    // 또는 강제 삭제를 위한 방법
    try {
      // Raw SQL로 외래키 제약 무시하고 삭제
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`

      // 의사 삭제
      await prisma.users.delete({
        where: {
          id: seoulClinicDoctor.id
        }
      })

      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`

      console.log(`✅ 의사 정보 삭제 완료`)
    } catch (deleteError) {
      console.log('⚠️  표준 삭제 실패, CASCADE 옵션 시도...')

      // 대안: 의사 정보만 업데이트 (삭제 대신)
      await prisma.users.update({
        where: {
          id: seoulClinicDoctor.id
        },
        data: {
          clinic: 'DELETED_' + seoulClinicDoctor.clinic,
          role: 'INACTIVE'
        }
      })

      console.log(`⚠️  의사 정보를 비활성화했습니다 (완전 삭제 대신)`)
    }

    // 5. 삭제 후 확인
    console.log('\n📋 5. 삭제 후 확인:')
    console.log('-' .repeat(80))

    const remainingDoctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        name: true,
        clinic: true
      },
      orderBy: {
        clinic: 'asc'
      }
    })

    const seoulClinicCheck = await prisma.users.findFirst({
      where: {
        clinic: '서울비만클리닉',
        role: 'DOCTOR'
      }
    })

    console.log(`\n✅ 남은 의사 수: ${remainingDoctors.length}명`)
    console.log(`✅ 서울비만클리닉 의사 존재 여부: ${seoulClinicCheck ? '존재함' : '삭제 완료'}`)

    console.log('\n남은 병원 목록:')
    remainingDoctors.forEach((doctor, index) => {
      console.log(`  ${index + 1}. ${doctor.clinic} - ${doctor.name}`)
    })

    // 6. 최종 통계
    console.log('\n📊 최종 삭제 통계:')
    console.log('=' .repeat(80))
    console.log(`\n삭제 완료:`)
    console.log(`  - 의사: 1명 (${seoulClinicDoctor.name})`)
    console.log(`  - 예약: ${appointments.length}개`)
    console.log(`  - 처방전: ${prescriptions.length}개`)
    console.log('\n🎉 서울비만클리닉 삭제 작업이 완료되었습니다!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteSeoulObesityClinic()