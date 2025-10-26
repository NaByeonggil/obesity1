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

// GET - 환자 프로필 조회 (웹/앱 공유)
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
          { success: false, error: '로그인이 필요합니다' },
          { status: 401 }
        ),
        request
      )
    }

    const userId = session?.user?.id || tokenUser?.userId
    const userEmail = session?.user?.email || tokenUser?.email

    const userData = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        ssn: true,
        address: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!userData) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: '사용자를 찾을 수 없습니다' },
          { status: 404 }
        ),
        request
      )
    }

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        data: userData,
        timestamp: new Date().toISOString()
      }),
      request
    )
  } catch (error) {
    console.error('Get patient profile error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '프로필 조회에 실패했습니다' },
        { status: 500 }
      ),
      request
    )
  }
}

// PUT - 환자 프로필 업데이트 (웹/앱 공유)
export async function PUT(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions)

    // JWT 토큰 확인 (Flutter 앱용)
    const tokenUser = getUserFromToken(request)

    const user = session?.user || tokenUser

    if (!user) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: '로그인이 필요합니다' },
          { status: 401 }
        ),
        request
      )
    }

    const userId = session?.user?.id || tokenUser?.userId

    const body = await request.json()
    const { name, phone, address, ssn } = body

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(ssn && { ssn }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        ssn: true,
        address: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        data: updatedUser,
        timestamp: new Date().toISOString()
      }),
      request
    )
  } catch (error) {
    console.error('Update patient profile error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '프로필 수정에 실패했습니다' },
        { status: 500 }
      ),
      request
    )
  }
}
