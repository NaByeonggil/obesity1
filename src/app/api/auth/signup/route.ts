import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      password,
      name,
      phone,
      role,
      // 의사 전용 필드
      license,
      specialization,
      clinic,
      // 약사 전용 필드
      pharmacyName,
      pharmacyLicense,
      pharmacyAddress
    } = body

    console.log('Signup request received:', { email, name, role, specialization, clinic })

    // 입력 검증
    if (!email || !password || !name || !role) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name, role: !!role })
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 역할 정규화 (소문자를 대문자로 변환)
    const normalizedRole = role.toUpperCase()

    // 역할 검증
    if (!['PATIENT', 'DOCTOR', 'PHARMACY'].includes(normalizedRole)) {
      console.log('Invalid role:', role, 'normalized:', normalizedRole)
      return NextResponse.json(
        { error: '유효하지 않은 회원 유형입니다.' },
        { status: 400 }
      )
    }

    // 의사 필수 필드 검증
    if (normalizedRole === 'DOCTOR' && (!license || !specialization || !clinic)) {
      console.log('Missing doctor fields:', { license: !!license, specialization: !!specialization, clinic: !!clinic })
      return NextResponse.json(
        { error: '의사 정보를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 약사 필수 필드 검증
    if (normalizedRole === 'PHARMACY' && (!pharmacyName || !pharmacyLicense || !pharmacyAddress)) {
      console.log('Missing pharmacy fields:', { pharmacyName: !!pharmacyName, pharmacyLicense: !!pharmacyLicense, pharmacyAddress: !!pharmacyAddress })
      return NextResponse.json(
        { error: '약사 정보를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.users.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Email already exists:', email)
      return NextResponse.json(
        { error: '이미 사용중인 이메일입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 데이터 준비
    const userData: any = {
      id: `user-${Date.now()}-${uuidv4().slice(0, 8)}`,
      email,
      password: hashedPassword,
      name,
      phone,
      role: normalizedRole,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 역할별 추가 데이터
    if (normalizedRole === 'DOCTOR') {
      userData.license = license
      userData.specialization = specialization
      userData.clinic = clinic
    }

    if (normalizedRole === 'PHARMACY') {
      userData.pharmacyName = pharmacyName
      userData.license = pharmacyLicense
      userData.pharmacyAddress = pharmacyAddress
    }

    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' })

    // 사용자 생성
    const newUser = await prisma.users.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clinic: true,
        specialization: true,
        createdAt: true
      }
    })

    console.log('New user registered successfully:', newUser)

    return NextResponse.json({
      message: '회원가입이 완료되었습니다.',
      user: newUser
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}