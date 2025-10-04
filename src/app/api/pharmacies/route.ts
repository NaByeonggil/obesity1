import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - 약국 목록 조회 (웹/앱 공유, 위치 기반)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = searchParams.get('radius') || '5' // km
    const search = searchParams.get('search')

    // 기본 약국 데이터 (실제로는 DB에서 조회)
    const pharmacies = [
      {
        id: '1',
        name: '서울약국',
        address: '서울시 강남구 테헤란로 123',
        phoneNumber: '02-1234-5678',
        latitude: 37.5665,
        longitude: 126.9780,
        operatingHours: '09:00-20:00',
        isOpen: true,
        distance: latitude && longitude ? calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          37.5665,
          126.9780
        ) : null
      },
      {
        id: '2',
        name: '건강약국',
        address: '서울시 서초구 강남대로 456',
        phoneNumber: '02-2345-6789',
        latitude: 37.4833,
        longitude: 127.0322,
        operatingHours: '08:00-22:00',
        isOpen: true,
        distance: latitude && longitude ? calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          37.4833,
          127.0322
        ) : null
      },
      {
        id: '3',
        name: '24시간약국',
        address: '서울시 용산구 이태원로 789',
        phoneNumber: '02-3456-7890',
        latitude: 37.5341,
        longitude: 126.9948,
        operatingHours: '24시간',
        isOpen: true,
        distance: latitude && longitude ? calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          37.5341,
          126.9948
        ) : null
      }
    ]

    // 검색 필터링
    let filteredPharmacies = pharmacies
    if (search) {
      filteredPharmacies = pharmacies.filter(p =>
        p.name.includes(search) || p.address.includes(search)
      )
    }

    // 거리 기반 필터링
    if (latitude && longitude) {
      const maxDistance = parseFloat(radius)
      filteredPharmacies = filteredPharmacies.filter(p =>
        (p.distance || 0) <= maxDistance
      )
      // 거리순 정렬
      filteredPharmacies.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return NextResponse.json({
      success: true,
      data: filteredPharmacies,
      count: filteredPharmacies.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get pharmacies error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pharmacies' },
      { status: 500 }
    )
  }
}

// Haversine 공식으로 거리 계산 (km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 지구 반경 (km)
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // 소수점 1자리
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}
