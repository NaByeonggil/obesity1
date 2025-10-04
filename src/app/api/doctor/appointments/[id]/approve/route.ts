import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json({ error: '의사만 접근 가능합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { status, notes } = body
    const appointmentId = params.id

    // 예약 승인 처리 (for testing, allow any doctor to approve)
    const updatedAppointment = await prisma.appointments.update({
      where: {
        id: appointmentId
      },
      data: {
        status: status === 'confirmed' ? 'CONFIRMED' : 'CANCELLED',
        notes: notes || '',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        appointmentDate: updatedAppointment.appointmentDate
      }
    })

  } catch (error) {
    console.error('예약 승인 오류:', error)
    return NextResponse.json(
      { success: false, error: '예약 승인에 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}