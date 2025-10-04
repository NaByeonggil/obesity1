import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
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
 * Flutter 앱 전용 로그인 API
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 입력 검증
    if (!email || !password) {
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: '이메일과 비밀번호를 입력해주세요'
          },
          { status: 400 }
        ),
        request
      )
    }

    // 사용자 조회
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        phone: true,
        address: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: '등록되지 않은 이메일입니다'
          },
          { status: 401 }
        ),
        request
      )
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: '비밀번호가 일치하지 않습니다'
          },
          { status: 401 }
        ),
        request
      )
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // 비밀번호 제외한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        user: userWithoutPassword,
        token: token,
        message: '로그인 성공'
      }),
      request
    )

  } catch (error) {
    console.error('Login error:', error)
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: '로그인 처리 중 오류가 발생했습니다'
        },
        { status: 500 }
      ),
      request
    )
  }
}
