/**
 * 약국 주소 API 테스트
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPharmacyAddresses() {
  console.log('=== 약국 주소 API 테스트 ===\n')

  try {
    // API와 동일한 쿼리 실행
    const pharmacies = await prisma.users.findMany({
      where: {
        OR: [
          { role: 'PHARMACY' },
          { role: 'pharmacy' }
        ]
      },
      select: {
        id: true,
        name: true,
        pharmacyName: true,
        pharmacyAddress: true,
        pharmacyPhone: true,
        latitude: true,
        longitude: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`총 ${pharmacies.length}개 약국 발견\n`)

    // 각 약국 정보 출력
    pharmacies.forEach((pharmacy, index) => {
      console.log(`${index + 1}. ${pharmacy.pharmacyName || pharmacy.name}`)
      console.log(`   ID: ${pharmacy.id}`)
      console.log(`   주소: ${pharmacy.pharmacyAddress || '주소 없음'}`)
      console.log(`   전화: ${pharmacy.pharmacyPhone || '전화번호 없음'}`)
      console.log(`   좌표: ${pharmacy.latitude ? `${pharmacy.latitude}, ${pharmacy.longitude}` : '좌표 없음'}`)
      console.log('')
    })

    // 종로사약국 상세 정보
    const jongnoPharmacy = pharmacies.find(p =>
      p.pharmacyName && p.pharmacyName.includes('종로사')
    )

    if (jongnoPharmacy) {
      console.log('=== 종로사약국 상세 정보 ===')
      console.log('약국명:', jongnoPharmacy.pharmacyName)
      console.log('주소:', jongnoPharmacy.pharmacyAddress)
      console.log('위도:', jongnoPharmacy.latitude)
      console.log('경도:', jongnoPharmacy.longitude)
      console.log('')

      // 주소 검증
      const expectedAddress = '경기도 부천시 소사구 심곡본동 668'
      const isAddressCorrect = jongnoPharmacy.pharmacyAddress === expectedAddress

      console.log('예상 주소:', expectedAddress)
      console.log('주소 일치:', isAddressCorrect ? '✅ 일치' : '❌ 불일치')

      // 좌표 검증
      const hasCoordinates = jongnoPharmacy.latitude && jongnoPharmacy.longitude
      console.log('좌표 존재:', hasCoordinates ? '✅ 있음' : '❌ 없음')

      if (hasCoordinates) {
        // 부천 심곡본동 일대 좌표 범위 검증 (대략적)
        const isLatValid = jongnoPharmacy.latitude >= 37.48 && jongnoPharmacy.latitude <= 37.49
        const isLngValid = jongnoPharmacy.longitude >= 126.77 && jongnoPharmacy.longitude <= 126.79
        console.log('좌표 범위:', (isLatValid && isLngValid) ? '✅ 부천 심곡본동 일대' : '⚠️ 범위 확인 필요')
      }
    } else {
      console.log('⚠️ 종로사약국을 찾을 수 없습니다.')
    }

    console.log('\n✅ 테스트 완료!')

  } catch (error) {
    console.error('❌ 테스트 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPharmacyAddresses()
