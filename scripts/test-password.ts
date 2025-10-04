import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testPassword() {
  const email = 'junam670@gmail.com'
  const password = '123456'

  const user = await prisma.users.findUnique({
    where: { email },
    select: { password: true }
  })

  if (user) {
    const isValid = await bcrypt.compare(password, user.password)
    console.log('Password check for', email)
    console.log('Password:', password)
    console.log('Is valid:', isValid ? '✅ YES' : '❌ NO')
  } else {
    console.log('User not found')
  }

  await prisma.$disconnect()
}

testPassword()
