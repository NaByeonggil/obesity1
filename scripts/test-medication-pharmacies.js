/**
 * 특정 의약품의 약국 목록 API 테스트
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testMedicationPharmacies() {
  console.log('=== 의약품별 약국 조회 테스트 ===\n')

  try {
    // 위고비 1.7mg를 예시로 테스트
    const medicationId = 'med-1759758296323-xq2auw6jz' // 위고비 1.7mg

    // 의약품 정보
    const medication = await prisma.medications.findUnique({
      where: { id: medicationId }
    })

    console.log('의약품:', medication?.name)
    console.log('가격:', medication?.price?.toLocaleString(), '원\n')

    // API와 동일한 쿼리 실행
    const pharmacyInventories = await prisma.pharmacy_inventory.findMany({
      where: {
        medicationId: medicationId,
        currentStock: {
          gt: 0
        }
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            pharmacyName: true,
            pharmacyAddress: true,
            pharmacyPhone: true,
            phone: true,
            email: true,
            latitude: true,
            longitude: true,
            address: true,
          }
        },
        medications: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true
          }
        }
      }
    })

    console.log(`재고가 있는 약국: ${pharmacyInventories.length}개\n`)

    // 각 약국 정보 출력
    pharmacyInventories.forEach((inventory, index) => {
      const pharmacy = inventory.users
      console.log(`${index + 1}. ${pharmacy.pharmacyName || pharmacy.name}`)
      console.log(`   재고: ${inventory.currentStock}개`)
      console.log(`   주소: ${pharmacy.pharmacyAddress || '주소 없음'}`)
      console.log(`   좌표: ${pharmacy.latitude ? `${pharmacy.latitude}, ${pharmacy.longitude}` : '좌표 없음'}`)
      console.log('')
    })

    // 종로사약국 확인
    const jongnoInventory = pharmacyInventories.find(inv =>
      inv.users.pharmacyName && inv.users.pharmacyName.includes('종로사')
    )

    if (jongnoInventory) {
      console.log('=== ✅ 종로사약국 발견 ===')
      console.log('약국명:', jongnoInventory.users.pharmacyName)
      console.log('주소:', jongnoInventory.users.pharmacyAddress)
      console.log('위도:', jongnoInventory.users.latitude)
      console.log('경도:', jongnoInventory.users.longitude)
      console.log('재고:', jongnoInventory.currentStock, '개')
      console.log('')

      // 좌표 유효성 확인
      if (jongnoInventory.users.latitude && jongnoInventory.users.longitude) {
        console.log('✅ 좌표 정보 있음 - 지도에 표시될 수 있습니다')
      } else {
        console.log('❌ 좌표 정보 없음 - 지도에 표시되지 않습니다')
      }
    } else {
      console.log('=== ❌ 종로사약국 미발견 ===')
      console.log('재고가 없거나 데이터가 없습니다')
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMedicationPharmacies()
