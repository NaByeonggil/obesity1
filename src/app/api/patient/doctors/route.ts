import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'patient') {
      return NextResponse.json({ error: '환자만 접근 가능합니다' }, { status: 403 })
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
        address: true
      }
    })

    return NextResponse.json({
      success: true,
      doctors: doctors
    })

  } catch (error) {
    console.error('의원 리스트 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '의원 리스트 조회에 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}