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

export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions)

    // JWT 토큰 확인 (Flutter 앱용)
    const tokenUser = getUserFromToken(request)

    const user = session?.user || tokenUser

    // 인증 확인 (선택사항 - 누구나 검색 가능하게 하려면 제거)
    if (!user) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: '로그인이 필요합니다' },
          { status: 401 }
        ),
        request
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    const medications = await prisma.medications.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      } : undefined,
      orderBy: {
        name: 'asc'
      },
      take: limit
    })

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        medications,
        count: medications.length
      }),
      request
    )

  } catch (error) {
    console.error('Get medications error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      ),
      request
    )
  }
}