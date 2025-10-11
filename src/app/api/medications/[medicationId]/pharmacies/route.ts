import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

/**
 * GET /api/medications/[medicationId]/pharmacies
 * 특정 의약품을 보유한 약국 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { medicationId: string } }
) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions)

    // JWT 토큰 확인 (Flutter 앱용)
    const tokenUser = getUserFromToken(request)

    const user = session?.user || tokenUser

    // 인증 확인
    if (!user) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: '로그인이 필요합니다' },
          { status: 401 }
        ),
        request
      )
    }

    const { medicationId } = params

    // 해당 의약품을 보유한 약국 조회
    const pharmacyInventories = await prisma.pharmacy_inventory.findMany({
      where: {
        medicationId: medicationId,
        currentStock: {
          gt: 0 // 재고가 있는 약국만
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

    // 약국 정보 포맷팅
    const pharmacies = pharmacyInventories.map(inventory => ({
      id: inventory.users.id,
      name: inventory.users.pharmacyName || inventory.users.name,
      pharmacyName: inventory.users.pharmacyName || inventory.users.name,
      pharmacistName: inventory.users.name,
      address: inventory.users.pharmacyAddress || inventory.users.address || '주소 미등록',
      pharmacyAddress: inventory.users.pharmacyAddress || inventory.users.address,
      phone: inventory.users.pharmacyPhone || inventory.users.phone,
      pharmacyPhone: inventory.users.pharmacyPhone || inventory.users.phone,
      email: inventory.users.email,
      latitude: inventory.users.latitude,
      longitude: inventory.users.longitude,
      currentStock: inventory.currentStock,
      medication: inventory.medications,
      // 기본값 설정
      hours: {
        weekday: "09:00 - 18:00",
        saturday: "09:00 - 13:00",
        sunday: "휴무"
      },
      available: inventory.currentStock > 0,
      operatingHours: "09:00-18:00",
      isOpen: true,
    }))

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        pharmacies: pharmacies,
        medication: pharmacyInventories[0]?.medications || null,
        total: pharmacies.length
      }),
      request
    )

  } catch (error) {
    console.error('Get pharmacies by medication error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      ),
      request
    )
  }
}
