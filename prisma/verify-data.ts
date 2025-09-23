import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const totalUsers = await prisma.users.count()
    const patients = await prisma.users.count({ where: { role: 'PATIENT' } })
    const doctors = await prisma.users.count({ where: { role: 'DOCTOR' } })

    console.log('📊 데이터베이스 현황:')
    console.log(`- 전체 사용자: ${totalUsers}명`)
    console.log(`- 환자: ${patients}명`)
    console.log(`- 의사: ${doctors}명`)

    const recentPatients = await prisma.users.findMany({
      where: { role: 'PATIENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { name: true, email: true, createdAt: true }
    })

    console.log('\n최근 추가된 환자 5명:')
    recentPatients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.name} (${patient.email})`)
    })

  } catch (error) {
    console.error('❌ 데이터 확인 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()