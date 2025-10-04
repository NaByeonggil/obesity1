import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPharmacies() {
  try {
    const pharmacies = await prisma.users.findMany({
      where: {
        role: 'PHARMACY'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pharmacyName: true,
        pharmacyAddress: true,
        pharmacyPhone: true
      }
    })

    console.log('=== 약국 계정 조회 결과 ===')
    console.log('총 약국 수:', pharmacies.length)
    console.log('\n약국 목록:')
    pharmacies.forEach((pharmacy, index) => {
      console.log(`\n${index + 1}. ${pharmacy.name}`)
      console.log('   ID:', pharmacy.id)
      console.log('   Email:', pharmacy.email)
      console.log('   Role:', pharmacy.role)
      console.log('   Pharmacy Name:', pharmacy.pharmacyName || '미설정')
      console.log('   Address:', pharmacy.pharmacyAddress || '미설정')
      console.log('   Phone:', pharmacy.pharmacyPhone || '미설정')
    })

  } catch (error) {
    console.error('조회 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPharmacies()
