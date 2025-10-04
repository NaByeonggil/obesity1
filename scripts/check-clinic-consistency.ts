import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClinicConsistency() {
  try {
    console.log('🔍 병원명 일치 여부 전체 확인 시작...\n')
    console.log('=' .repeat(80))

    // 1. 모든 의사와 병원명 확인
    console.log('\n📋 1. 등록된 모든 의사와 병원명:')
    console.log('-' .repeat(80))

    const doctors = await prisma.users.findMany({
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
        clinic: 'asc'
      }
    })

    const clinicGroups = doctors.reduce((acc, doctor) => {
      const clinicName = doctor.clinic || '병원명 없음'
      if (!acc[clinicName]) {
        acc[clinicName] = []
      }
      acc[clinicName].push(doctor)
      return acc
    }, {} as Record<string, typeof doctors>)

    Object.entries(clinicGroups).forEach(([clinicName, doctorList]) => {
      console.log(`\n🏥 ${clinicName}:`)
      doctorList.forEach(doctor => {
        console.log(`   - ${doctor.name} (${doctor.specialization}) [${doctor.id}]`)
      })
    })

    // 2. 실제 데이터베이스의 unique 병원명 리스트
    console.log('\n\n📋 2. 데이터베이스에 있는 고유 병원명 목록:')
    console.log('-' .repeat(80))

    const uniqueClinics = await prisma.users.findMany({
      where: {
        role: 'DOCTOR',
        clinic: {
          not: null
        }
      },
      select: {
        clinic: true
      },
      distinct: ['clinic']
    })

    console.log('\n고유 병원명 리스트:')
    uniqueClinics.forEach((item, index) => {
      console.log(`  ${index + 1}. "${item.clinic}"`)
    })

    // 3. 병원명 정확한 비교 (대소문자, 띄어쓰기 포함)
    console.log('\n\n📋 3. 병원명 상세 분석:')
    console.log('-' .repeat(80))

    const clinicAnalysis = uniqueClinics.map(item => {
      const name = item.clinic || ''
      return {
        original: name,
        trimmed: name.trim(),
        lowercase: name.toLowerCase(),
        length: name.length,
        hasSpace: name.includes(' '),
        hasSpecialChars: /[^\w\s가-힣]/.test(name)
      }
    })

    console.log('\n병원명 상세 정보:')
    clinicAnalysis.forEach(analysis => {
      console.log(`\n병원: "${analysis.original}"`)
      console.log(`  - 길이: ${analysis.length}자`)
      console.log(`  - 공백 포함: ${analysis.hasSpace ? '예' : '아니오'}`)
      console.log(`  - 특수문자 포함: ${analysis.hasSpecialChars ? '예' : '아니오'}`)
      console.log(`  - Trimmed: "${analysis.trimmed}"`)
      console.log(`  - 소문자: "${analysis.lowercase}"`)
    })

    // 4. 젤라의원 특별 확인
    console.log('\n\n📋 4. 젤라의원 특별 확인:')
    console.log('-' .repeat(80))

    const jellaVariations = [
      '젤라의원',
      '젤라 의원',
      '젤라클리닉',
      '젤라',
      'jella',
      'Jella'
    ]

    for (const variation of jellaVariations) {
      const found = await prisma.users.findMany({
        where: {
          OR: [
            { clinic: variation },
            { clinic: { contains: variation } }
          ]
        },
        select: {
          id: true,
          name: true,
          clinic: true
        }
      })

      if (found.length > 0) {
        console.log(`\n✅ "${variation}" 검색 결과:`)
        found.forEach(doctor => {
          console.log(`   - ${doctor.name}: "${doctor.clinic}" [${doctor.id}]`)
        })
      } else {
        console.log(`❌ "${variation}" 검색 결과: 없음`)
      }
    }

    // 5. 예약 데이터와 의사 병원명 매칭 확인
    console.log('\n\n📋 5. 예약 데이터와 의사 정보 매칭 확인:')
    console.log('-' .repeat(80))

    const appointmentsWithDoctor = await prisma.appointments.findMany({
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            clinic: true
          }
        }
      },
      take: 10
    })

    console.log('\n최근 예약 10개의 의사-병원 정보:')
    appointmentsWithDoctor.forEach(apt => {
      const doctor = apt.users_appointments_doctorIdTousers
      console.log(`\n예약 ID: ${apt.id}`)
      console.log(`  의사: ${doctor?.name}`)
      console.log(`  병원: "${doctor?.clinic}"`)
      console.log(`  예약일: ${apt.appointmentDate}`)
    })

    // 6. 병원명 일치성 검증
    console.log('\n\n📋 6. 병원명 일치성 최종 검증:')
    console.log('-' .repeat(80))

    const allAppointments = await prisma.appointments.findMany({
      include: {
        users_appointments_doctorIdTousers: true
      }
    })

    const clinicMismatch: any[] = []
    const clinicMatch: any[] = []

    for (const apt of allAppointments) {
      const doctorId = apt.doctorId
      const doctorFromApt = apt.users_appointments_doctorIdTousers

      // 직접 의사 정보 조회
      const doctorDirect = await prisma.users.findUnique({
        where: { id: doctorId }
      })

      if (doctorDirect && doctorFromApt) {
        if (doctorDirect.clinic !== doctorFromApt.clinic) {
          clinicMismatch.push({
            appointmentId: apt.id,
            doctorId,
            directClinic: doctorDirect.clinic,
            aptClinic: doctorFromApt.clinic
          })
        } else {
          clinicMatch.push({
            appointmentId: apt.id,
            doctorId,
            clinic: doctorDirect.clinic
          })
        }
      }
    }

    console.log(`\n✅ 일치하는 예약: ${clinicMatch.length}개`)
    console.log(`❌ 불일치 예약: ${clinicMismatch.length}개`)

    if (clinicMismatch.length > 0) {
      console.log('\n불일치 상세:')
      clinicMismatch.forEach(mismatch => {
        console.log(`  예약 ${mismatch.appointmentId}:`)
        console.log(`    - Direct: "${mismatch.directClinic}"`)
        console.log(`    - Via Appointment: "${mismatch.aptClinic}"`)
      })
    }

    // 7. 최종 요약
    console.log('\n\n📊 최종 요약:')
    console.log('=' .repeat(80))
    console.log(`총 의사 수: ${doctors.length}명`)
    console.log(`총 병원 수: ${uniqueClinics.length}개`)
    console.log(`총 예약 수: ${allAppointments.length}개`)
    console.log(`젤라의원 의사: ${doctors.filter(d => d.clinic === '젤라의원').length}명`)
    console.log(`젤라의원 예약: ${allAppointments.filter(a => a.users_appointments_doctorIdTousers?.clinic === '젤라의원').length}개`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClinicConsistency()