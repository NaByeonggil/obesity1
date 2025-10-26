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
 * Flutter 앱 전용 카카오 로그인 API
 * POST /api/auth/kakao
 *
 * Request Body:
 * {
 *   "accessToken": "카카오 액세스 토큰"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessToken } = body

    // 입력 검증
    if (!accessToken) {
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: '카카오 액세스 토큰이 필요합니다'
          },
          { status: 400 }
        ),
        request
      )
    }

    // 카카오 API로 사용자 정보 가져오기
    const kakaoUserResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    })

    if (!kakaoUserResponse.ok) {
      return addCorsHeaders(
        NextResponse.json(
          {
            success: false,
            error: '카카오 사용자 정보를 가져올 수 없습니다'
          },
          { status: 401 }
        ),
        request
      )
    }

    const kakaoUser = await kakaoUserResponse.json()

    // 카카오 사용자 정보 파싱
    const kakaoId = kakaoUser.id.toString()
    const kakaoEmail = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@social.com`
    const kakaoName = kakaoUser.kakao_account?.profile?.nickname || '카카오 사용자'
    const kakaoAvatar = kakaoUser.kakao_account?.profile?.profile_image_url

    // DB에서 사용자 찾기 (이메일로)
    let user = await prisma.users.findUnique({
      where: { email: kakaoEmail }
    })

    if (!user) {
      // 새 사용자 생성
      user = await prisma.users.create({
        data: {
          id: `kakao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: kakaoEmail,
          name: kakaoName,
          password: await bcrypt.hash(Math.random().toString(36), 10), // 랜덤 비밀번호
          role: 'PATIENT',
          avatar: kakaoAvatar,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    } else {
      // 기존 사용자 정보 업데이트
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          name: kakaoName,
          avatar: kakaoAvatar || user.avatar,
          updatedAt: new Date()
        }
      })
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
        message: '카카오 로그인 성공'
      }),
      request
    )

  } catch (error) {
    console.error('Kakao login error:', error)
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: '카카오 로그인 처리 중 오류가 발생했습니다'
        },
        { status: 500 }
      ),
      request
    )
  }
}
