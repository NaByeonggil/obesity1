// 예약 의사 불일치 문제 확인
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAppointmentDoctorMismatch() {
  console.log('=== 예약 의사 불일치 문제 확인 ===\n')

  try {
    // 1. 젤라의원 의사 정보
    console.log('🏥 젤라의원 의사 정보:')
    const zellaDoctors = await prisma.users.findMany({
      where: {
        clinic: { contains: '젤라' },
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true
      }
    })

    zellaDoctors.forEach(doctor => {
      console.log(`- ${doctor.name} (${doctor.email})`)
      console.log(`  ID: ${doctor.id}`)
      console.log(`  병원: ${doctor.clinic}`)
    })

    // 2. 서울비만클리닉 의사 정보
    console.log('\n🏥 서울비만클리닉 의사 정보:')
    const seoulDoctors = await prisma.users.findMany({
      where: {
        clinic: { contains: '서울비만' },
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true
      }
    })

    seoulDoctors.forEach(doctor => {
      console.log(`- ${doctor.name} (${doctor.email})`)
      console.log(`  ID: ${doctor.id}`)
      console.log(`  병원: ${doctor.clinic}`)
    })

    // 3. 최근 예약 확인 (주남씨 환자의 예약)
    console.log('\n📅 주남씨 환자의 최근 예약:')
    const patientAppointments = await prisma.appointments.findMany({
      where: {
        OR: [
          { users_appointments_patientIdTousers: { name: { contains: '주남' } } },
          { users_appointments_patientIdTousers: { email: 'junam670@gmail.com' } }
        ]
      },
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            clinic: true
          }
        },
        users_appointments_patientIdTousers: {
          select: {
            name: true,
            email: true
          }
        },
        departments: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    console.log(`총 ${patientAppointments.length}개 예약 발견\n`)

    patientAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. 예약 ID: ${apt.id}`)
      console.log(`   환자: ${apt.users_appointments_patientIdTousers?.name} (${apt.users_appointments_patientIdTousers?.email})`)
      console.log(`   의사: ${apt.users_appointments_doctorIdTousers?.name} (${apt.users_appointments_doctorIdTousers?.email})`)
      console.log(`   병원: ${apt.users_appointments_doctorIdTousers?.clinic}`)
      console.log(`   의사 ID: ${apt.doctorId}`)
      console.log(`   진료과: ${apt.departments?.name}`)
      console.log(`   예약일: ${apt.appointmentDate}`)
      console.log(`   상태: ${apt.status}`)
      console.log(`   생성일: ${apt.createdAt}`)
      console.log('')
    })

    // 4. 젤라의원으로 예약된 것 확인
    console.log('🔍 젤라의원 예약 필터링:')
    const zellaAppointments = patientAppointments.filter(apt =>
      apt.users_appointments_doctorIdTousers?.clinic?.includes('젤라')
    )
    console.log(`젤라의원 예약: ${zellaAppointments.length}개`)

    // 5. 서울비만클리닉으로 예약된 것 확인
    console.log('\n🔍 서울비만클리닉 예약 필터링:')
    const seoulAppointments = patientAppointments.filter(apt =>
      apt.users_appointments_doctorIdTousers?.clinic?.includes('서울비만')
    )
    console.log(`서울비만클리닉 예약: ${seoulAppointments.length}개`)

    // 6. 예약 생성 시 사용된 doctorId 추적
    console.log('\n📝 예약 생성 시 doctorId 매핑:')
    if (zellaDoctors.length > 0) {
      console.log(`젤라의원 김병만 의사 ID: ${zellaDoctors[0].id}`)
    }
    if (seoulDoctors.length > 0) {
      console.log(`서울비만클리닉 김민수 의사 ID: ${seoulDoctors[0].id}`)
    }

    // 7. 문제 진단
    console.log('\n\n=== 문제 진단 ===')
    if (zellaAppointments.length === 0 && seoulAppointments.length > 0) {
      console.log('⚠️ 문제 발견: 젤라의원으로 예약하려 했으나 서울비만클리닉으로 예약됨')
      console.log('\n가능한 원인:')
      console.log('1. 예약 생성 시 잘못된 doctorId 사용')
      console.log('2. 프론트엔드에서 의사 선택 로직 오류')
      console.log('3. 의사 목록 조회 시 정렬 문제')

      console.log('\n💡 해결 방법:')
      console.log('1. 예약 생성 API에서 doctorId 검증')
      console.log('2. 프론트엔드 의사 선택 UI 확인')
      console.log('3. 의사 목록 API 응답 순서 확인')
    }

    // 8. 모든 의사 목록 순서 확인
    console.log('\n📋 전체 의사 목록 (생성 순서):')
    const allDoctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        clinic: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    allDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.clinic || 'N/A'}`)
      console.log(`   ID: ${doctor.id}`)
      console.log(`   생성: ${doctor.createdAt}`)
    })

  } catch (error) {
    console.error('❌ 확인 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAppointmentDoctorMismatch()