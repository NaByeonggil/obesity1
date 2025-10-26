import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

/**
 * CORS 헤더 추가
 */
function addCorsHeaders(response: NextResponse, request?: NextRequest) {
  const origin = request?.headers.get('origin') || 'http://localhost:8080'
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

/**
 * OPTIONS 요청 처리 (Preflight)
 */
export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(
    new NextResponse(null, { status: 200 }),
    request
  )
}

/**
 * JWT 토큰에서 사용자 정보 추출
 */
function getUserFromToken(request: NextRequest): { userId: string; email: string; role: string } | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-secret-key') as any

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    console.error('JWT 토큰 검증 실패:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions)

    // JWT 토큰 확인 (Flutter 앱용)
    const tokenUser = getUserFromToken(request)

    const user = session?.user || tokenUser

    if (!user) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: '로그인이 필요합니다.' },
          { status: 401 }
        ),
        request
      )
    }

    const userRole = session?.user?.role || tokenUser?.role

    if (userRole?.toLowerCase() !== 'patient') {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: '환자만 접근 가능합니다.' },
          { status: 403 }
        ),
        request
      )
    }

    // 모든 약국 조회 (PHARMACY 역할을 가진 사용자)
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
        phone: true,
        email: true,
        latitude: true,
        longitude: true,
        address: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 약국 데이터 포맷팅
    const formattedPharmacies = pharmacies.map(pharmacy => ({
      id: pharmacy.id,
      name: pharmacy.pharmacyName || pharmacy.name,
      pharmacistName: pharmacy.name,
      address: pharmacy.pharmacyAddress || pharmacy.address || '주소 미등록',
      phone: pharmacy.pharmacyPhone || pharmacy.phone,
      email: pharmacy.email,
      latitude: pharmacy.latitude,
      longitude: pharmacy.longitude,
      role: pharmacy.role,
      pharmacyName: pharmacy.pharmacyName,
      pharmacyAddress: pharmacy.pharmacyAddress,
      pharmacyPhone: pharmacy.pharmacyPhone,
      // 기본값 설정
      hours: {
        weekday: "09:00 - 18:00",
        saturday: "09:00 - 13:00",
        sunday: "휴무"
      },
      operatingHours: "09:00-18:00",
      isOpen: true,
      available: true,
      rating: 0,
      reviews: 0
    }))

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        pharmacies: formattedPharmacies,
        total: formattedPharmacies.length
      }),
      request
    )

  } catch (error) {
    console.error('Get pharmacies error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '약국 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      ),
      request
    )
  }
}
