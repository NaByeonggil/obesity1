const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('📊 일반인 앱 유저(환자) 가입 현황 조회\n')

    // 1. 전체 사용자 수 조회
    const totalUsers = await prisma.user.count()
    console.log(`📍 전체 사용자 수: ${totalUsers}명`)

    // 2. 역할별 사용자 수 조회
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    console.log('\n📊 역할별 사용자 분포:')
    usersByRole.forEach(group => {
      console.log(`   ${group.role}: ${group._count.role}명`)
    })

    // 3. 환자(일반인) 상세 정보 조회
    const patients = await prisma.user.findMany({
      where: {
        role: 'PATIENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        avatar: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n👥 환자(일반인) 상세 목록 (총 ${patients.length}명):`)
    console.log('=====================================')
    patients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.name}`)
      console.log(`   📧 이메일: ${patient.email}`)
      console.log(`   📱 전화번호: ${patient.phone || '미등록'}`)
      console.log(`   📅 가입일: ${patient.createdAt.toLocaleDateString('ko-KR')}`)
      console.log(`   🆔 ID: ${patient.id}`)
      console.log('')
    })

    // 4. 가입 날짜별 통계
    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentSignups = await prisma.user.count({
      where: {
        role: 'PATIENT',
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    const monthlySignups = await prisma.user.count({
      where: {
        role: 'PATIENT',
        createdAt: {
          gte: oneMonthAgo
        }
      }
    })

    console.log('📈 가입 통계:')
    console.log(`   📅 최근 7일 가입: ${recentSignups}명`)
    console.log(`   📅 최근 30일 가입: ${monthlySignups}명`)

    // 5. 예약 활동 통계
    const patientsWithAppointments = await prisma.user.findMany({
      where: {
        role: 'PATIENT'
      },
      include: {
        patientAppointments: {
          select: {
            id: true,
            status: true,
            appointmentDate: true
          }
        }
      }
    })

    let totalAppointments = 0
    let activePatients = 0

    patientsWithAppointments.forEach(patient => {
      const appointmentCount = patient.patientAppointments.length
      totalAppointments += appointmentCount
      if (appointmentCount > 0) {
        activePatients++
      }
    })

    console.log('\n🏥 활동 통계:')
    console.log(`   📋 총 예약 건수: ${totalAppointments}건`)
    console.log(`   👤 예약한 환자 수: ${activePatients}명`)
    console.log(`   📊 환자당 평균 예약: ${totalAppointments > 0 ? (totalAppointments / patients.length).toFixed(1) : 0}건`)

    // 6. 처방전 통계
    const prescriptionsCount = await prisma.prescription.count({
      where: {
        patient: {
          role: 'PATIENT'
        }
      }
    })

    console.log(`   💊 총 처방전 수: ${prescriptionsCount}건`)

    // 7. 소셜 로그인 통계 (NextAuth accounts 테이블 확인)
    const socialAccounts = await prisma.account.findMany({
      include: {
        user: {
          select: {
            role: true,
            name: true
          }
        }
      }
    })

    const patientSocialAccounts = socialAccounts.filter(account => account.user.role === 'PATIENT')

    console.log('\n🔗 로그인 방식 통계:')
    if (patientSocialAccounts.length > 0) {
      const providerGroups = patientSocialAccounts.reduce((acc, account) => {
        acc[account.provider] = (acc[account.provider] || 0) + 1
        return acc
      }, {})

      Object.entries(providerGroups).forEach(([provider, count]) => {
        console.log(`   ${provider}: ${count}명`)
      })
    } else {
      console.log('   소셜 로그인 사용자: 0명 (모두 이메일 가입)')
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()