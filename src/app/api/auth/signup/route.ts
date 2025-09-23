import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json()

    // 입력값 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "이름, 이메일, 비밀번호는 필수 입력 항목입니다." },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10)

    // 새 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "PATIENT", // 기본적으로 환자로 가입
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff`
      }
    })

    // 비밀번호 제거 후 반환
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      message: "회원가입이 완료되었습니다.",
      user: userWithoutPassword
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}