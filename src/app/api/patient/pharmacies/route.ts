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

    if (session.user.role?.toLowerCase() !== 'patient') {
      return NextResponse.json(
        { error: '환자만 접근 가능합니다.' },
        { status: 403 }
      )
    }

    // 모든 약국 조회 (PHARMACY 역할을 가진 사용자)
    const pharmacies = await prisma.users.findMany({
      where: {
        OR: [
          { role: 'PHARMACY' },
          { role: 'pharmacy' }
        ]
      },
      select: {
        id: true,
        name: true,
        pharmacyName: true,
        pharmacyAddress: true,
        pharmacyPhone: true,
        phone: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 약국 데이터 포맷팅
    const formattedPharmacies = pharmacies.map(pharmacy => ({
      id: pharmacy.id,
      name: pharmacy.pharmacyName || pharmacy.name,
      pharmacistName: pharmacy.name,
      address: pharmacy.pharmacyAddress || '주소 미등록',
      phone: pharmacy.pharmacyPhone || pharmacy.phone,
      email: pharmacy.email,
      // 기본값 설정
      hours: {
        weekday: "09:00 - 18:00",
        saturday: "09:00 - 13:00",
        sunday: "휴무"
      },
      available: true,
      rating: 0,
      reviews: 0
    }))

    return NextResponse.json({
      pharmacies: formattedPharmacies,
      total: formattedPharmacies.length
    })

  } catch (error) {
    console.error('Get pharmacies error:', error)
    return NextResponse.json(
      { error: '약국 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
