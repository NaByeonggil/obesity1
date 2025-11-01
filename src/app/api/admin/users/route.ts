import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

// GET: 사용자 목록 조회
export async function GET(req: NextRequest) {
  try {
    // 관리자 권한 확인
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    // 쿼리 파라미터
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}

    if (role && role !== 'ALL') {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    }

    // 사용자 목록 조회
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
          emailVerified: true,
          // 역할별 추가 정보
          specialization: true,
          licenseNumber: true,
          hasOfflineConsultation: true,
          hasOnlineConsultation: true,
          pharmacyName: true,
          pharmacyAddress: true,
          pharmacyLicenseNumber: true,
          // 계정 정보
          accounts: {
            select: {
              provider: true,
              provider_account_id: true
            }
          }
        }
      }),
      prisma.users.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Admin users list error:", error)
    return NextResponse.json(
      { error: "사용자 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// PUT: 사용자 정보 수정
export async function PUT(req: NextRequest) {
  try {
    // 관리자 권한 확인
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { userId, data } = body

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      )
    }

    // 사용자 정보 업데이트
    const updateData: any = {}

    // 기본 정보
    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.role !== undefined) updateData.role = data.role

    // 의사 정보
    if (data.specialization !== undefined) updateData.specialization = data.specialization
    if (data.licenseNumber !== undefined) updateData.licenseNumber = data.licenseNumber
    if (data.hasOfflineConsultation !== undefined) updateData.hasOfflineConsultation = data.hasOfflineConsultation
    if (data.hasOnlineConsultation !== undefined) updateData.hasOnlineConsultation = data.hasOnlineConsultation

    // 약사 정보
    if (data.pharmacyName !== undefined) updateData.pharmacyName = data.pharmacyName
    if (data.pharmacyAddress !== undefined) updateData.pharmacyAddress = data.pharmacyAddress
    if (data.pharmacyLicenseNumber !== undefined) updateData.pharmacyLicenseNumber = data.pharmacyLicenseNumber

    const user = await prisma.users.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({
      message: "사용자 정보가 수정되었습니다.",
      user
    })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json(
      { error: "사용자 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// DELETE: 사용자 삭제
export async function DELETE(req: NextRequest) {
  try {
    // 관리자 권한 확인
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      )
    }

    // 자기 자신은 삭제할 수 없음
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "본인 계정은 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    // 사용자 삭제
    await prisma.users.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: "사용자가 삭제되었습니다."
    })
  } catch (error) {
    console.error("Admin user delete error:", error)
    return NextResponse.json(
      { error: "사용자 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
