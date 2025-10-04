import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDoctors() {
  const doctors = await prisma.users.findMany({
    where: { role: 'DOCTOR' },
    select: { name: true, clinic: true, specialization: true },
    orderBy: { name: 'asc' }
  })

  console.log('의사 목록 (총 ' + doctors.length + '명):')
  doctors.forEach((d: any) => {
    console.log(`  ${d.name.padEnd(10)} - ${(d.clinic || '의원명 없음').padEnd(20)} (${d.specialization})`)
  })

  await prisma.$disconnect()
}

checkDoctors()
