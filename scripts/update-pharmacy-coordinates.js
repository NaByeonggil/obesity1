/**
 * 약국 주소를 기반으로 정확한 좌표 업데이트
 * 카카오 Local API의 주소 검색 사용
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const KAKAO_REST_API_KEY = '4976057b86815b637a1411a279fda223' // REST API 키

// 주소를 좌표로 변환
async function addressToCoordinates(address) {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
        }
      }
    )

    const data = await response.json()

    if (data.documents && data.documents.length > 0) {
      const result = data.documents[0]
      return {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x)
      }
    }

    return null
  } catch (error) {
    console.error('주소 변환 실패:', address, error)
    return null
  }
}

async function updatePharmacyCoordinates() {
  console.log('약국 좌표 업데이트 시작...\n')

  // 모든 약국 조회
  const pharmacies = await prisma.users.findMany({
    where: {
      role: 'PHARMACY'
    }
  })

  console.log(`총 ${pharmacies.length}개 약국 발견\n`)

  for (const pharmacy of pharmacies) {
    const address = pharmacy.pharmacyAddress || pharmacy.address

    if (!address) {
      console.log(`❌ ${pharmacy.pharmacyName}: 주소 없음`)
      continue
    }

    console.log(`📍 ${pharmacy.pharmacyName}: ${address}`)

    // 주소를 좌표로 변환
    const coordinates = await addressToCoordinates(address)

    if (coordinates) {
      // DB 업데이트
      await prisma.users.update({
        where: { id: pharmacy.id },
        data: {
          latitude: coordinates.lat,
          longitude: coordinates.lng
        }
      })

      console.log(`   ✅ 좌표 업데이트: ${coordinates.lat}, ${coordinates.lng}\n`)
    } else {
      console.log(`   ❌ 좌표 변환 실패\n`)
    }

    // API 호출 제한 방지 (초당 5회)
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('✅ 좌표 업데이트 완료!')
}

updatePharmacyCoordinates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
