// 사용자 역할 데이터 확인
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserRole() {
  console.log('=== 사용자 역할 데이터 확인 ===\n')

  try {
    const user = await prisma.users.findUnique({
      where: { email: 'junam670@gmail.com' }
    })

    if (user) {
      console.log('사용자 정보:')
      console.log('- 이메일:', user.email)
      console.log('- 이름:', user.name)
      console.log('- 역할:', user.role)
      console.log('- 역할 타입:', typeof user.role)
      console.log('- 소문자 변환:', user.role?.toString().toLowerCase())
    } else {
      console.log('❌ 사용자를 찾을 수 없습니다.')
    }

    // 모든 사용자의 역할 확인
    console.log('\n=== 전체 사용자 역할 목록 ===')
    const allUsers = await prisma.users.findMany({
      select: { email: true, name: true, role: true }
    })

    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email} - ${u.role} (${typeof u.role})`)
    })

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserRole()