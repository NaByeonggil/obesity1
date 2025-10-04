import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword, comparePassword } from '@/lib/auth'

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

    const { currentPassword, newPassword } = await req.json()

    // 입력값 검증
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "새 비밀번호는 최소 8자 이상이어야 합니다." },
        { status: 400 }
      )
    }

    // 현재 사용자 정보 조회
    const user = await prisma.users.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      )
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await hashPassword(newPassword)

    // 비밀번호 업데이트
    await prisma.users.update({
      where: { id: payload.userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: "비밀번호가 성공적으로 변경되었습니다."
    })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json(
      { error: "비밀번호 변경 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}