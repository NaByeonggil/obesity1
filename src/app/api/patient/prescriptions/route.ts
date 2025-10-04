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

    const userId = session?.user?.id || tokenUser?.userId
    const userRole = session?.user?.role || tokenUser?.role

    if (userRole?.toLowerCase() !== 'patient') {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '환자만 접근 가능합니다' }, { status: 403 }),
        request
      )
    }

    // 환자의 처방전 목록 조회
    const prescriptions = await prisma.prescriptions.findMany({
      where: {
        patientId: userId
      },
      include: {
        appointments: {
          include: {
            users_appointments_patientIdTousers: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true
              }
            },
            users_appointments_doctorIdTousers: {
              select: {
                id: true,
                name: true,
                specialization: true,
                clinic: true,
                avatar: true
              }
            },
            departments: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        prescription_medications: {
          include: {
            medications: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    })

    // 처방전 데이터를 프론트엔드 형식으로 변환
    const formattedPrescriptions = prescriptions.map((prescription: any) => ({
      id: prescription.id,
      prescriptionNumber: prescription.prescriptionNumber,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      status: prescription.status,
      issuedAt: prescription.issuedAt.toISOString(),
      validUntil: prescription.validUntil.toISOString(),
      totalPrice: prescription.totalPrice,
      appointment: {
        patient: {
          id: prescription.appointments?.users_appointments_patientIdTousers?.id || '',
          name: prescription.appointments?.users_appointments_patientIdTousers?.name || '환자',
          phone: prescription.appointments?.users_appointments_patientIdTousers?.phone || '',
          avatar: prescription.appointments?.users_appointments_patientIdTousers?.avatar || ''
        },
        doctor: {
          id: prescription.appointments?.users_appointments_doctorIdTousers?.id || '',
          name: prescription.appointments?.users_appointments_doctorIdTousers?.name || '담당의',
          specialization: prescription.appointments?.users_appointments_doctorIdTousers?.specialization || '',
          clinic: prescription.appointments?.users_appointments_doctorIdTousers?.clinic || '',
          avatar: prescription.appointments?.users_appointments_doctorIdTousers?.avatar || ''
        },
        department: {
          id: prescription.appointments?.departments?.id || '',
          name: prescription.appointments?.departments?.name || '일반'
        }
      },
      medications: prescription.prescription_medications.map((pm: any) => ({
        id: pm.id,
        dosage: pm.dosage,
        frequency: pm.frequency,
        duration: pm.duration,
        instructions: pm.notes || '',
        medication: {
          id: pm.medications.id,
          name: pm.medications.name,
          description: pm.medications.description || '',
          unit: pm.quantity || '정'
        }
      }))
    }))

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        prescriptions: formattedPrescriptions
      }),
      request
    )

  } catch (error) {
    console.error('처방전 조회 오류:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '처방전 조회에 실패했습니다' },
        { status: 500 }
      ),
      request
    )
  } finally {
    await prisma.$disconnect()
  }
}
