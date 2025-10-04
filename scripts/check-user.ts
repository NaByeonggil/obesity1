import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  const email = 'junam670@gmail.com'

  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true
    }
  })

  if (user) {
    console.log('✅ User found:')
    console.log('  ID:', user.id)
    console.log('  Email:', user.email)
    console.log('  Name:', user.name)
    console.log('  Role:', user.role)
    console.log('  Password hash:', user.password.substring(0, 20) + '...')
  } else {
    console.log('❌ User not found with email:', email)
  }

  await prisma.$disconnect()
}

checkUser()
