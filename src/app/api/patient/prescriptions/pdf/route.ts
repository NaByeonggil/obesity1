import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
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

// 환자용 처방전 PDF 조회
export async function GET(request: NextRequest) {
  try {
    console.log('[PDF API] 처방전 PDF 다운로드 요청')

    // NextAuth 세션 확인
    const session = await getServerSession(authOptions)

    // JWT 토큰 확인 (Flutter 앱용)
    const tokenUser = getUserFromToken(request)

    const user = session?.user || tokenUser

    if (!user) {
      console.log('[PDF API] 인증 실패: 세션 없음')
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 }),
        request
      )
    }

    const userId = session?.user?.id || tokenUser?.userId
    const userRole = session?.user?.role || tokenUser?.role

    if (userRole?.toLowerCase() !== 'patient') {
      console.log('[PDF API] 권한 없음: 환자 아님', userRole)
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '환자만 접근 가능합니다' }, { status: 403 }),
        request
      )
    }

    const { searchParams } = new URL(request.url)
    const prescriptionId = searchParams.get('id')
    console.log('[PDF API] 처방전 ID:', prescriptionId)

    if (!prescriptionId) {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '처방전 ID가 필요합니다' }, { status: 400 }),
        request
      )
    }

    // 처방전 정보 조회 및 권한 확인
    const prescription = await prisma.prescriptions.findFirst({
      where: {
        id: prescriptionId,
        patientId: userId // 환자 본인의 처방전만 조회
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            name: true,
            phone: true,
            ssn: true
          }
        },
        users_prescriptions_doctorIdTousers: {
          select: {
            name: true,
            specialization: true,
            clinic: true,
            license: true
          }
        },
        prescription_medications: {
          include: {
            medications: {
              select: {
                name: true,
                description: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!prescription) {
      console.log('[PDF API] 처방전을 찾을 수 없음')
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '처방전을 찾을 수 없습니다' }, { status: 404 }),
        request
      )
    }

    // 의사가 첨부한 PDF 파일이 있으면 그것을 반환
    if ((prescription as any).pdfFilePath) {
      console.log('[PDF API] 의사 첨부 PDF 파일 발견:', (prescription as any).pdfFilePath)

      const fs = await import('fs')
      const path = await import('path')

      try {
        // 파일 경로 처리
        const pdfPath = (prescription as any).pdfFilePath
        const filePath = pdfPath.startsWith('http')
          ? pdfPath
          : path.join(process.cwd(), 'public', pdfPath)

        // URL인 경우 fetch로 다운로드
        if (pdfPath.startsWith('http')) {
          const response = await fetch(pdfPath)
          if (!response.ok) {
            throw new Error('PDF 파일 다운로드 실패')
          }
          const buffer = await response.arrayBuffer()

          return new NextResponse(buffer as any, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="prescription_${prescription.prescriptionNumber}.pdf"`
            }
          })
        }

        // 로컬 파일인 경우
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath)

          return new NextResponse(fileBuffer as any, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="prescription_${prescription.prescriptionNumber}.pdf"`
            }
          })
        } else {
          console.log('[PDF API] 첨부 파일을 찾을 수 없음')
          return addCorsHeaders(
            NextResponse.json({ success: false, error: '첨부된 처방전 파일을 찾을 수 없습니다' }, { status: 404 }),
            request
          )
        }
      } catch (fileError) {
        console.error('[PDF API] 첨부 파일 로드 오류:', fileError)
        return addCorsHeaders(
          NextResponse.json({
            success: false,
            error: '첨부된 처방전 파일을 불러오는데 실패했습니다',
            details: fileError instanceof Error ? fileError.message : String(fileError)
          }, { status: 500 }),
          request
        )
      }
    } else {
      console.log('[PDF API] 첨부된 PDF 파일이 없음')
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '첨부된 처방전 파일이 없습니다' }, { status: 404 }),
        request
      )
    }

  } catch (error) {
    console.error('[PDF API] PDF 조회 오류:', error)
    console.error('[PDF API] 에러 스택:', error instanceof Error ? error.stack : 'Unknown error')

    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: 'PDF 조회에 실패했습니다', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      ),
      request
    )
  } finally {
    await prisma.$disconnect()
  }
}
