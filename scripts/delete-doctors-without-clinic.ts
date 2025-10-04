import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteDoctorsWithoutClinic() {
  try {
    console.log('🗑️  병원명이 없는 의사 데이터 삭제 작업 시작...\n')
    console.log('=' .repeat(80))

    // 1. 먼저 병원명이 없는 의사들 조회
    console.log('\n📋 1. 삭제 대상 의사 확인:')
    console.log('-' .repeat(80))

    const doctorsWithoutClinic = await prisma.users.findMany({
      where: {
        role: 'DOCTOR',
        OR: [
          { clinic: null },
          { clinic: '' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true,
        specialization: true
      }
    })

    if (doctorsWithoutClinic.length === 0) {
      console.log('✅ 병원명이 없는 의사가 없습니다.')
      return
    }

    console.log(`\n⚠️  삭제될 의사: ${doctorsWithoutClinic.length}명\n`)
    doctorsWithoutClinic.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name}`)
      console.log(`   - ID: ${doctor.id}`)
      console.log(`   - Email: ${doctor.email}`)
      console.log(`   - 병원: ${doctor.clinic || 'null'}`)
      console.log(`   - 전문분야: ${doctor.specialization || '없음'}`)
      console.log()
    })

    // 2. 관련 예약 확인 (외래 키 제약 확인)
    console.log('\n📋 2. 관련 예약 데이터 확인:')
    console.log('-' .repeat(80))

    let hasAppointments = false
    for (const doctor of doctorsWithoutClinic) {
      const appointments = await prisma.appointments.findMany({
        where: {
          doctorId: doctor.id
        }
      })

      if (appointments.length > 0) {
        hasAppointments = true
        console.log(`\n⚠️  ${doctor.name} (${doctor.id})의 예약: ${appointments.length}개`)
        console.log('   이 의사의 예약도 함께 삭제됩니다.')
      }
    }

    if (!hasAppointments) {
      console.log('\n✅ 삭제 대상 의사들에게 예약이 없습니다.')
    }

    // 3. 삭제 수행
    console.log('\n📋 3. 삭제 작업 수행:')
    console.log('-' .repeat(80))

    for (const doctor of doctorsWithoutClinic) {
      // 먼저 관련 예약 삭제 (외래 키 제약 때문)
      const deletedAppointments = await prisma.appointments.deleteMany({
        where: {
          doctorId: doctor.id
        }
      })

      if (deletedAppointments.count > 0) {
        console.log(`   - ${doctor.name}의 예약 ${deletedAppointments.count}개 삭제`)
      }

      // 의사 삭제
      await prisma.users.delete({
        where: {
          id: doctor.id
        }
      })

      console.log(`✅ ${doctor.name} (${doctor.id}) 삭제 완료`)
    }

    // 4. 삭제 후 확인
    console.log('\n📋 4. 삭제 후 확인:')
    console.log('-' .repeat(80))

    const remainingDoctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        clinic: true
      }
    })

    const remainingWithoutClinic = await prisma.users.findMany({
      where: {
        role: 'DOCTOR',
        OR: [
          { clinic: null },
          { clinic: '' }
        ]
      }
    })

    console.log(`\n✅ 남은 의사 수: ${remainingDoctors.length}명`)
    console.log(`✅ 병원명 없는 의사: ${remainingWithoutClinic.length}명`)

    // 5. 최종 병원 통계
    console.log('\n📊 최종 통계:')
    console.log('=' .repeat(80))

    const clinicGroups = remainingDoctors.reduce((acc, doctor) => {
      const clinicName = doctor.clinic || '병원명 없음'
      if (!acc[clinicName]) {
        acc[clinicName] = 0
      }
      acc[clinicName]++
      return acc
    }, {} as Record<string, number>)

    const validClinics = Object.keys(clinicGroups).filter(name => name !== '병원명 없음')

    console.log(`\n총 의사 수: ${remainingDoctors.length}명`)
    console.log(`총 병원 수: ${validClinics.length}개`)
    console.log('\n병원별 의사 분포:')

    Object.entries(clinicGroups).forEach(([clinicName, count]) => {
      if (clinicName !== '병원명 없음') {
        console.log(`  - ${clinicName}: ${count}명`)
      }
    })

    console.log('\n🎉 삭제 작업 완료!')
    console.log(`   ${doctorsWithoutClinic.length}명의 병원명 없는 의사가 삭제되었습니다.`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteDoctorsWithoutClinic()