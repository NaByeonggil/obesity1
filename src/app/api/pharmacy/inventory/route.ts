import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromAuthHeader } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
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

    // 재고 정보 가져오기 (PharmacyInventory 테이블 사용)
    const inventory = await prisma.pharmacyInventory.findMany({
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
      },
      orderBy: {
        currentStock: 'asc' // 재고 적은 순으로 정렬
      }
    })

    // 재고 부족 품목 필터링 (현재 재고가 최소 재고보다 적은 경우)
    const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock)

    const formattedLowStockItems = lowStockItems.map(item => ({
      id: item.id,
      name: item.medication.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
      supplier: item.medication.manufacturer,
      lastOrderDate: item.lastOrderDate,
      category: item.medication.category,
      price: item.medication.price
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