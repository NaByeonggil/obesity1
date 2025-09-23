import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromAuthHeader } from '@/lib/auth'
import { UserRole, PrescriptionStatus } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromAuthHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== UserRole.PHARMACY) {
      return NextResponse.json(
        { error: '약국 계정만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    const { status, notes } = await request.json()
    const prescriptionId = params.id

    // 처방전 상태 업데이트
    const updatedPrescription = await prisma.prescription.update({
      where: {
        id: prescriptionId
      },
      data: {
        status: status as PrescriptionStatus,
        notes: notes || undefined,
        updatedAt: new Date()
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true
          }
        },
        medications: {
          include: {
            medication: true
          }
        }
      }
    })

    return NextResponse.json({
      message: '처방전 상태가 업데이트되었습니다.',
      prescription: updatedPrescription
    })

  } catch (error) {
    console.error('Update prescription status error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromAuthHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== UserRole.PHARMACY) {
      return NextResponse.json(
        { error: '약국 계정만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    const prescriptionId = params.id

    // 처방전 상세 정보 가져오기
    const prescription = await prisma.prescription.findUnique({
      where: {
        id: prescriptionId
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            type: true
          }
        },
        medications: {
          include: {
            medication: {
              select: {
                id: true,
                name: true,
                category: true,
                manufacturer: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json(
        { error: '처방전을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prescription })

  } catch (error) {
    console.error('Get prescription detail error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}