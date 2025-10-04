import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      message: '로그아웃 완료',
      success: true
    })

    // Clear the auth-token cookie by setting it to expire immediately
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set to past date to expire immediately
      path: '/'
    })

    return addCorsHeaders(response, request)

  } catch (error) {
    console.error('Logout error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: '로그아웃 중 오류가 발생했습니다.' },
        { status: 500 }
      ),
      request
    )
  }
}