import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role?.toLowerCase() !== 'pharmacy') {
      return NextResponse.json(
        { error: '약국만 접근 가능합니다.' },
        { status: 403 }
      )
    }

    const { status, notes } = await request.json()
    const prescriptionId = params.id

    // 처방전 상태 업데이트
    const updatedPrescription = await prisma.prescriptions.update({
      where: {
        id: prescriptionId
      },
      data: {
        status: status,
        notes: notes || undefined
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        users_prescriptions_doctorIdTousers: {
          select: {
            id: true,
            name: true
          }
        },
        prescription_medications: {
          include: {
            medications: true
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
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role?.toLowerCase() !== 'pharmacy') {
      return NextResponse.json(
        { error: '약국만 접근 가능합니다.' },
        { status: 403 }
      )
    }

    const prescriptionId = params.id

    // 처방전 상세 정보 가져오기
    const prescription = await prisma.prescriptions.findUnique({
      where: {
        id: prescriptionId
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true
          }
        },
        users_prescriptions_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        appointments: {
          select: {
            id: true,
            appointmentDate: true,
            type: true
          }
        },
        prescription_medications: {
          include: {
            medications: {
              select: {
                id: true,
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
  } finally {
    await prisma.$disconnect()
  }
}