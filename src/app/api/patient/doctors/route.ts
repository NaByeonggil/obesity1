import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

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
        NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 }),
        request
      )
    }

    const userRole = session?.user?.role || tokenUser?.role

    if (userRole?.toLowerCase() !== 'patient') {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '환자만 접근 가능합니다' }, { status: 403 }),
        request
      )
    }

    // 의사 목록 조회
    const doctors = await prisma.users.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        specialization: true,
        clinic: true,
        address: true,
        avatar: true,
        phone: true,
        email: true
      }
    })

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        doctors: doctors
      }),
      request
    )

  } catch (error) {
    console.error('의원 리스트 조회 오류:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '의원 리스트 조회에 실패했습니다' },
        { status: 500 }
      ),
      request
    )
  } finally {
    await prisma.$disconnect()
  }
}