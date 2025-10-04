import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkKimDoctor() {
  try {
    console.log('🔍 kim@naver.com 의사 계정 확인\n')
    console.log('=' .repeat(80))

    // 1. 정확한 이메일로 검색
    console.log('\n📋 1. 이메일 "kim@naver.com" 검색:')
    console.log('-' .repeat(80))

    const doctorExact = await prisma.users.findFirst({
      where: {
        email: 'kim@naver.com'
      }
    })

    if (doctorExact) {
      console.log('\n✅ 계정 발견!')
      console.log(`  - ID: ${doctorExact.id}`)
      console.log(`  - 이름: ${doctorExact.name}`)
      console.log(`  - 이메일: ${doctorExact.email}`)
      console.log(`  - 역할: ${doctorExact.role}`)
      console.log(`  - 병원: ${doctorExact.clinic || '미지정'}`)
      console.log(`  - 전문분야: ${doctorExact.specialization || '미지정'}`)
      console.log(`  - 면허번호: ${doctorExact.license || '미지정'}`)
      console.log(`  - 전화번호: ${doctorExact.phone || '미지정'}`)
      console.log(`  - 생성일: ${doctorExact.createdAt}`)
    } else {
      console.log('\n❌ kim@naver.com 계정을 찾을 수 없습니다.')
    }

    // 2. 유사한 이메일 패턴 검색
    console.log('\n📋 2. "kim" 포함 이메일 검색:')
    console.log('-' .repeat(80))

    const kimEmails = await prisma.users.findMany({
      where: {
        email: {
          contains: 'kim'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clinic: true
      }
    })

    if (kimEmails.length > 0) {
      console.log(`\n"kim" 포함 이메일 ${kimEmails.length}개 발견:`)
      kimEmails.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`)
        console.log(`   - 이메일: ${user.email}`)
        console.log(`   - 역할: ${user.role}`)
        console.log(`   - 병원: ${user.clinic || '미지정'}`)
      })
    } else {
      console.log('\n"kim" 포함 이메일이 없습니다.')
    }

    // 3. 모든 의사 계정 확인
    console.log('\n📋 3. 전체 의사 계정 목록:')
    console.log('-' .repeat(80))

    const allDoctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true,
        specialization: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n총 의사 수: ${allDoctors.length}명`)
    allDoctors.forEach((doctor, index) => {
      console.log(`\n${index + 1}. ${doctor.name}`)
      console.log(`   - 이메일: ${doctor.email}`)
      console.log(`   - 병원: ${doctor.clinic}`)
      console.log(`   - 전문분야: ${doctor.specialization}`)
      console.log(`   - 가입일: ${doctor.createdAt.toLocaleDateString('ko-KR')}`)
    })

    // 4. 환자 중 김씨 확인
    console.log('\n📋 4. 환자 중 "kim" 이름/이메일 확인:')
    console.log('-' .repeat(80))

    const kimPatients = await prisma.users.findMany({
      where: {
        OR: [
          { email: { contains: 'kim' } },
          { name: { contains: '김' } }
        ],
        role: 'PATIENT'
      },
      select: {
        name: true,
        email: true,
        role: true
      }
    })

    if (kimPatients.length > 0) {
      console.log(`\n김씨 환자 ${kimPatients.length}명 발견:`)
      kimPatients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.name} - ${patient.email} (${patient.role})`)
      })
    }

    // 5. 결론
    console.log('\n📊 5. 결론:')
    console.log('=' .repeat(80))

    if (doctorExact) {
      console.log('\n✅ kim@naver.com 의사 계정이 존재합니다.')
      console.log(`   의사명: ${doctorExact.name}`)
      console.log(`   병원: ${doctorExact.clinic}`)
      console.log(`   로그인 가능 여부: 예`)
    } else {
      console.log('\n❌ kim@naver.com 의사 계정이 존재하지 않습니다.')
      console.log('   새로운 가입이 필요합니다.')

      // 초기화 이전 데이터 가능성 안내
      console.log('\n💡 참고:')
      console.log('   - 의사 데이터가 최근에 초기화되었습니다.')
      console.log('   - 이전에 kim@naver.com으로 가입했다면 재가입이 필요합니다.')
      console.log('   - 현재 등록된 테스트 의사 계정:')
      console.log('     * doctor@test.com (김의사)')
      console.log('     * doctor2@test.com (박의사)')
      console.log('     * doctor3@test.com (이의사)')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkKimDoctor()