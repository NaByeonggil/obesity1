import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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
        { error: '약국 계정만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 재고 정보 가져오기 (pharmacy_inventory 테이블 사용)
    const inventory = await prisma.pharmacy_inventory.findMany({
      include: {
        medications: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true
          }
        }
      },
      orderBy: {
        currentStock: 'asc' // 재고 적은 순으로 정렬
      }
    })

    // 재고 부족 품목 필터링 (현재 재고가 최소 재고보다 적은 경우)
    const lowStockItems = inventory.filter((item: any) => item.currentStock <= item.minStock)

    const formattedLowStockItems = lowStockItems.map((item: any) => ({
      id: item.id,
      name: item.medications.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
      supplier: item.supplier,
      lastOrderDate: item.lastOrderDate,
      description: item.medications.description,
      price: item.medications.price
    }))

    return NextResponse.json({ lowStockItems: formattedLowStockItems })

  } catch (error) {
    console.error('Get pharmacy inventory error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}