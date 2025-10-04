import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPatientLogin() {
  try {
    // 사용자 정보 확인
    const user = await prisma.users.findUnique({
      where: { id: 'user-1758957683254-lah38921g' },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다')
      return
    }

    console.log('✅ 사용자 정보:')
    console.log(`- ID: ${user.id}`)
    console.log(`- 이름: ${user.name}`)
    console.log(`- 이메일: ${user.email}`)
    console.log(`- 역할: ${user.role}`)

    // 해당 사용자의 예약 확인
    const appointments = await prisma.appointments.findMany({
      where: { patientId: user.id },
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            specialization: true,
            clinic: true,
            avatar: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            consultationType: true
          }
        }
      },
      orderBy: { appointmentDate: 'desc' }
    })

    console.log(`\n📅 예약 현황 (총 ${appointments.length}개):`)
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.id}`)
      console.log(`   - 날짜: ${apt.appointmentDate}`)
      console.log(`   - 타입: ${apt.type}`)
      console.log(`   - 상태: ${apt.status}`)
      console.log(`   - 의사: ${apt.users_appointments_doctorIdTousers?.name || 'N/A'}`)
      console.log(`   - 진료과: ${apt.departments?.name || 'N/A'}`)
      console.log('')
    })

  } catch (error) {
    console.error('오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPatientLogin()
