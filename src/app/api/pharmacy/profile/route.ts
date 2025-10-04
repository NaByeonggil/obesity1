import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 약국 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'pharmacy') {
      return NextResponse.json({ error: '약국만 접근 가능합니다' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      pharmacyName,
      pharmacyLicense,
      pharmacyAddress,
      pharmacyPhone
    } = body

    // 필수 필드 검증
    if (!name || !phone || !pharmacyName || !pharmacyLicense || !pharmacyAddress) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 프로필 업데이트
    const updatedUser = await prisma.users.update({
      where: {
        id: session.user.id
      },
      data: {
        name,
        phone,
        pharmacyName,
        license: pharmacyLicense,
        pharmacyAddress,
        pharmacyPhone,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        pharmacyName: true,
        license: true,
        pharmacyAddress: true,
        pharmacyPhone: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '프로필이 업데이트되었습니다.',
      user: updatedUser
    })

  } catch (error) {
    console.error('프로필 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, error: '프로필 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
