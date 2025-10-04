import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET: 모든 의약품 조회
export async function GET(request: NextRequest) {
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

    // 모든 의약품 조회
    const medications = await prisma.medications.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      medications,
      total: medications.length
    })

  } catch (error) {
    console.error('Get medications error:', error)
    return NextResponse.json(
      { error: '의약품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 의약품 추가
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description, price } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: '의약품명과 가격은 필수입니다.' },
        { status: 400 }
      )
    }

    // 의약품 추가
    const medication = await prisma.medications.create({
      data: {
        id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description: description || null,
        price: parseFloat(price)
      }
    })

    return NextResponse.json({
      message: '의약품이 추가되었습니다.',
      medication
    })

  } catch (error) {
    console.error('Add medication error:', error)
    return NextResponse.json(
      { error: '의약품 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 의약품 정보 업데이트
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { medicationId, name, description, price } = body

    if (!medicationId || !name || price === undefined) {
      return NextResponse.json(
        { error: '의약품 ID, 이름, 가격은 필수입니다.' },
        { status: 400 }
      )
    }

    // 의약품 정보 업데이트
    const medication = await prisma.medications.update({
      where: {
        id: medicationId
      },
      data: {
        name,
        description: description || null,
        price: parseFloat(price)
      }
    })

    return NextResponse.json({
      message: '의약품 정보가 업데이트되었습니다.',
      medication
    })

  } catch (error) {
    console.error('Update medication error:', error)
    return NextResponse.json(
      { error: '의약품 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 의약품 삭제
export async function DELETE(request: NextRequest) {
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

    const body = await request.json()
    const { medicationId } = body

    if (!medicationId) {
      return NextResponse.json(
        { error: '의약품 ID는 필수입니다.' },
        { status: 400 }
      )
    }

    // 처방전에 사용 중인지 확인
    const usedInPrescriptions = await prisma.prescription_medications.findFirst({
      where: {
        medicationId
      }
    })

    if (usedInPrescriptions) {
      return NextResponse.json(
        { error: '이 의약품은 처방전에 사용 중이므로 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 의약품 삭제
    await prisma.medications.delete({
      where: {
        id: medicationId
      }
    })

    return NextResponse.json({
      message: '의약품이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Delete medication error:', error)
    return NextResponse.json(
      { error: '의약품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
