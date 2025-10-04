// 젤라의원 예약 문제 진단
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkZellaAppointments() {
  console.log('=== 젤라의원 예약 문제 진단 ===\n')

  try {
    // 1. 젤라의원 의사 계정 확인
    console.log('🔍 젤라의원 의사 계정 확인...')
    const zellaDoctor = await prisma.users.findFirst({
      where: {
        email: 'kim@naver.com'
      }
    })

    if (zellaDoctor) {
      console.log('✅ 젤라의원 의사 정보:')
      console.log(`ID: ${zellaDoctor.id}`)
      console.log(`이름: ${zellaDoctor.name}`)
      console.log(`이메일: ${zellaDoctor.email}`)
      console.log(`역할: "${zellaDoctor.role}" (${typeof zellaDoctor.role})`)
      console.log(`병원: ${zellaDoctor.clinic}`)

      // 역할 대소문자 확인
      console.log('\n🔍 역할 대소문자 분석:')
      console.log(`DB에 저장된 역할: "${zellaDoctor.role}"`)
      console.log(`대문자 변환: "${zellaDoctor.role.toUpperCase()}"`)
      console.log(`소문자 변환: "${zellaDoctor.role.toLowerCase()}"`)
      console.log(`DOCTOR와 일치?: ${zellaDoctor.role === 'DOCTOR'}`)
      console.log(`doctor와 일치?: ${zellaDoctor.role === 'doctor'}`)
      console.log(`대소문자 무시 비교: ${zellaDoctor.role.toLowerCase() === 'doctor'}`)
    }

    // 2. 젤라의원 의사의 예약 조회 (대소문자 구분 없이)
    console.log('\n📅 젤라의원 의사 예약 조회...')

    // 방법 1: 직접 doctorId로 조회
    if (zellaDoctor) {
      const appointmentsByDoctorId = await prisma.appointments.findMany({
        where: {
          doctorId: zellaDoctor.id
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

      console.log(`\n방법1 - doctorId(${zellaDoctor.id})로 조회:`)
      console.log(`예약 수: ${appointmentsByDoctorId.length}개`)

      if (appointmentsByDoctorId.length > 0) {
        console.log('\n예약 목록:')
        appointmentsByDoctorId.forEach((apt, index) => {
          console.log(`${index + 1}. 환자: ${apt.users_appointments_patientIdTousers?.name || apt.patientId}`)
          console.log(`   날짜: ${apt.appointmentDate}`)
          console.log(`   상태: ${apt.status}`)
          console.log(`   ID: ${apt.id}`)
        })
      }
    }

    // 3. 모든 예약에서 젤라의원 관련 찾기
    console.log('\n🔍 전체 예약에서 젤라의원 관련 검색...')
    const allAppointments = await prisma.appointments.findMany({
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            clinic: true,
            role: true
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
      }
    })

    const zellaAppointments = allAppointments.filter(apt =>
      apt.users_appointments_doctorIdTousers?.clinic?.includes('젤라') ||
      apt.users_appointments_doctorIdTousers?.email === 'kim@naver.com'
    )

    console.log(`전체 예약 수: ${allAppointments.length}개`)
    console.log(`젤라의원 관련 예약: ${zellaAppointments.length}개`)

    if (zellaAppointments.length > 0) {
      console.log('\n젤라의원 예약 상세:')
      zellaAppointments.forEach((apt, index) => {
        console.log(`\n${index + 1}. 예약 ID: ${apt.id}`)
        console.log(`   의사: ${apt.users_appointments_doctorIdTousers?.name} (${apt.users_appointments_doctorIdTousers?.email})`)
        console.log(`   의사 역할: "${apt.users_appointments_doctorIdTousers?.role}"`)
        console.log(`   병원: ${apt.users_appointments_doctorIdTousers?.clinic}`)
        console.log(`   환자: ${apt.users_appointments_patientIdTousers?.name} (${apt.users_appointments_patientIdTousers?.email})`)
        console.log(`   진료과: ${apt.departments?.name}`)
        console.log(`   날짜: ${apt.appointmentDate}`)
        console.log(`   상태: ${apt.status}`)
      })
    }

    // 4. API 로직 시뮬레이션
    console.log('\n🔧 API 로직 시뮬레이션:')
    if (zellaDoctor) {
      // API에서 사용하는 역할 체크 로직
      const roleCheck1 = zellaDoctor.role?.toLowerCase() === 'doctor'
      const roleCheck2 = zellaDoctor.role === 'DOCTOR'
      const roleCheck3 = zellaDoctor.role === 'doctor'

      console.log(`toLowerCase() === 'doctor': ${roleCheck1}`)
      console.log(`=== 'DOCTOR': ${roleCheck2}`)
      console.log(`=== 'doctor': ${roleCheck3}`)

      if (!roleCheck1 && !roleCheck2 && !roleCheck3) {
        console.log('\n❌ 역할 체크 실패! 이것이 문제의 원인일 수 있습니다.')
      } else {
        console.log('\n✅ 역할 체크 통과')
      }
    }

    // 5. 최근 생성된 예약 확인
    console.log('\n📊 최근 생성된 예약 (모든 의사):')
    const recentAppointments = await prisma.appointments.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            name: true,
            clinic: true,
            role: true
          }
        },
        users_appointments_patientIdTousers: {
          select: {
            name: true
          }
        }
      }
    })

    recentAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.users_appointments_doctorIdTousers?.name} (${apt.users_appointments_doctorIdTousers?.clinic})`)
      console.log(`   역할: "${apt.users_appointments_doctorIdTousers?.role}"`)
      console.log(`   환자: ${apt.users_appointments_patientIdTousers?.name}`)
      console.log(`   생성: ${apt.createdAt}`)
    })

    // 6. 문제 진단 결과
    console.log('\n\n=== 진단 결과 ===')
    if (zellaDoctor) {
      const hasLowercaseRole = zellaDoctor.role === 'doctor'
      const hasUppercaseRole = zellaDoctor.role === 'DOCTOR'

      if (hasLowercaseRole) {
        console.log('⚠️ 문제 발견: 역할이 소문자 "doctor"로 저장되어 있습니다.')
        console.log('   일부 API 로직에서 대문자 "DOCTOR"를 체크하는 경우 문제가 될 수 있습니다.')
        console.log('\n💡 해결 방법:')
        console.log('   1. DB의 역할을 "DOCTOR"로 업데이트')
        console.log('   2. 또는 API 코드에서 대소문자 구분 없이 비교하도록 수정')
      } else if (hasUppercaseRole) {
        console.log('✅ 역할이 올바르게 "DOCTOR"로 설정되어 있습니다.')
      }

      if (zellaAppointments.length === 0) {
        console.log('\n⚠️ 젤라의원 의사에게 예약이 없습니다.')
        console.log('   예약 시 올바른 doctorId가 사용되고 있는지 확인이 필요합니다.')
      } else {
        console.log(`\n✅ 젤라의원 예약 ${zellaAppointments.length}개가 있습니다.`)
      }
    }

  } catch (error) {
    console.error('❌ 진단 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkZellaAppointments()