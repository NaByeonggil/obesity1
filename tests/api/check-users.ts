import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    console.log('=== 현재 데이터베이스의 사용자들 ===')
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}, ${user.role})`)
    })
    console.log(`총 ${users.length}명의 사용자`)
  } catch (error) {
    console.error('오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers().catch(console.error)