import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeDoctorClinicMismatch() {
  try {
    console.log('🔍 의사 수와 병원 수 불일치 원인 분석\n')
    console.log('=' .repeat(80))

    // 1. 모든 의사 조회
    const allDoctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        clinic: true,
        specialization: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log('\n📋 1. 모든 의사 목록 (총 ' + allDoctors.length + '명):')
    console.log('-' .repeat(80))

    allDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name}`)
      console.log(`   - ID: ${doctor.id}`)
      console.log(`   - Email: ${doctor.email}`)
      console.log(`   - 병원: ${doctor.clinic || '❌ 병원명 없음'}`)
      console.log(`   - 전문분야: ${doctor.specialization || '없음'}`)
      console.log()
    })

    // 2. 병원명이 없는 의사 찾기
    const doctorsWithoutClinic = allDoctors.filter(d => !d.clinic || d.clinic === null)

    console.log('\n📋 2. 병원명이 없는 의사들:')
    console.log('-' .repeat(80))

    if (doctorsWithoutClinic.length > 0) {
      console.log(`\n⚠️  병원명이 없는 의사: ${doctorsWithoutClinic.length}명\n`)
      doctorsWithoutClinic.forEach(doctor => {
        console.log(`   - ${doctor.name} (${doctor.id})`)
        console.log(`     Email: ${doctor.email}`)
        console.log(`     전문분야: ${doctor.specialization || '없음'}`)
        console.log()
      })
    } else {
      console.log('✅ 모든 의사가 병원명을 가지고 있습니다.')
    }

    // 3. 병원별 의사 수 집계
    console.log('\n📋 3. 병원별 의사 분포:')
    console.log('-' .repeat(80))

    const clinicGroups = allDoctors.reduce((acc, doctor) => {
      const clinicName = doctor.clinic || '병원명 없음'
      if (!acc[clinicName]) {
        acc[clinicName] = []
      }
      acc[clinicName].push(doctor)
      return acc
    }, {} as Record<string, typeof allDoctors>)

    // 병원명 있는 것만 카운트
    const validClinics = Object.keys(clinicGroups).filter(name => name !== '병원명 없음')

    console.log(`\n실제 병원 수: ${validClinics.length}개`)
    console.log(`병원명 없는 의사: ${clinicGroups['병원명 없음']?.length || 0}명`)
    console.log()

    Object.entries(clinicGroups).forEach(([clinicName, doctors]) => {
      if (clinicName === '병원명 없음') {
        console.log(`\n❌ ${clinicName}: ${doctors.length}명`)
      } else {
        console.log(`\n🏥 ${clinicName}: ${doctors.length}명`)
      }
      doctors.forEach(doctor => {
        console.log(`   - ${doctor.name} (${doctor.specialization || '전문분야 없음'})`)
      })
    })

    // 4. 중복 병원명 체크 (같은 병원에 여러 의사)
    console.log('\n\n📋 4. 같은 병원에 여러 의사가 있는 경우:')
    console.log('-' .repeat(80))

    let hasMultipleDoctors = false
    Object.entries(clinicGroups).forEach(([clinicName, doctors]) => {
      if (clinicName !== '병원명 없음' && doctors.length > 1) {
        hasMultipleDoctors = true
        console.log(`\n🏥 ${clinicName}: ${doctors.length}명의 의사`)
        doctors.forEach(doctor => {
          console.log(`   - ${doctor.name}`)
        })
      }
    })

    if (!hasMultipleDoctors) {
      console.log('\n✅ 각 병원마다 의사가 1명씩만 있습니다.')
    }

    // 5. 최종 분석 결과
    console.log('\n\n📊 최종 분석 결과:')
    console.log('=' .repeat(80))
    console.log(`\n총 의사 수: ${allDoctors.length}명`)
    console.log(`병원명이 있는 의사: ${allDoctors.length - doctorsWithoutClinic.length}명`)
    console.log(`병원명이 없는 의사: ${doctorsWithoutClinic.length}명`)
    console.log(`실제 병원 수: ${validClinics.length}개`)

    console.log('\n💡 의사 수와 병원 수가 다른 이유:')
    if (doctorsWithoutClinic.length > 0) {
      console.log(`   1. ${doctorsWithoutClinic.length}명의 의사가 병원명이 없음 (null)`)
    }

    const duplicateClinics = Object.entries(clinicGroups)
      .filter(([name, docs]) => name !== '병원명 없음' && docs.length > 1)

    if (duplicateClinics.length > 0) {
      console.log(`   2. 일부 병원에 여러 의사가 근무:`)
      duplicateClinics.forEach(([clinic, docs]) => {
        console.log(`      - ${clinic}: ${docs.length}명`)
      })
    }

    console.log('\n✨ 요약:')
    console.log(`   의사 10명 = 병원 8개 + 병원명 없는 의사 ${doctorsWithoutClinic.length}명`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeDoctorClinicMismatch()