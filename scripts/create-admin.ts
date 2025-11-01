const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 관리자 계정 생성 스크립트\n')

  const adminEmail = 'admin@obesity.ai.kr'
  const adminPassword = '123456'
  const adminName = '시스템관리자'

  // 기존 관리자 확인
  const existingAdmin = await prisma.users.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('✅ 관리자 계정이 이미 존재합니다:')
    console.log(`   이메일: ${existingAdmin.email}`)
    console.log(`   이름: ${existingAdmin.name}`)
    console.log(`   역할: ${existingAdmin.role}`)

    // 역할이 ADMIN이 아니면 업데이트
    if (existingAdmin.role !== 'ADMIN') {
      console.log('\n🔄 역할을 ADMIN으로 변경합니다...')
      await prisma.users.update({
        where: { id: existingAdmin.id },
        data: { role: 'ADMIN' }
      })
      console.log('✅ 역할이 ADMIN으로 변경되었습니다!')
    }
  } else {
    // 새 관리자 계정 생성
    console.log('📝 새로운 관리자 계정을 생성합니다...')

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.users.create({
      data: {
        id: `admin_${Date.now()}`,
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('\n✅ 관리자 계정이 생성되었습니다!')
    console.log(`   이메일: ${admin.email}`)
    console.log(`   이름: ${admin.name}`)
    console.log(`   비밀번호: ${adminPassword}`)
    console.log(`   역할: ${admin.role}`)
  }

  // 전체 관리자 목록
  const allAdmins = await prisma.users.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  })

  console.log('\n📋 전체 관리자 계정:')
  allAdmins.forEach((admin: any, index: number) => {
    console.log(`   ${index + 1}. ${admin.email} (${admin.name})`)
  })

  console.log('\n✨ 완료!')
  console.log('\n💡 로그인 정보:')
  console.log(`   URL: http://localhost:3000/auth/login?role=admin`)
  console.log(`   이메일: ${adminEmail}`)
  console.log(`   비밀번호: ${adminPassword}`)
}

main()
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
