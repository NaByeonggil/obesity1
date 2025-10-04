import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  try {
    // JWT 토큰 검증
    const token = req.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 }
      )
    }

    const {
      name,
      phone,
      department,
      specialization,
      experience,
      description,
      workingHours
    } = await req.json()

    // 입력값 검증
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "이름은 필수 입력 항목입니다." },
        { status: 400 }
      )
    }

    // 사용자 프로필 업데이트
    const updatedUser = await prisma.users.update({
      where: { id: payload.userId },
      data: {
        name: name.trim(),
        phone: phone || null,
        department: department || null,
        specialization: specialization || null,
        experience: experience || null,
        description: description || null,
        workingHours: workingHours ? JSON.stringify(workingHours) : null,
        updatedAt: new Date()
      }
    })

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: "프로필이 성공적으로 업데이트되었습니다.",
      user: userWithoutPassword
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "프로필 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}