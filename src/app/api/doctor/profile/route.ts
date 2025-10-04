import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET - 의사 프로필 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json(
        { error: '의사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const doctor = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        license: true,
        clinic: true,
        address: true,
        hasOnlineConsultation: true,
        hasOfflineConsultation: true
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: '프로필 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT - 의사 프로필 업데이트
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role?.toLowerCase() !== 'doctor') {
      return NextResponse.json(
        { error: '의사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      name,
      phone,
      specialization,
      license,
      clinic,
      address,
      clinicPhone,
      faxNumber,
      businessRegistration,
      latitude,
      longitude,
      description,
      hasOnlineConsultation,
      hasOfflineConsultation
    } = body

    // 진료 방식 검증
    if (!hasOnlineConsultation && !hasOfflineConsultation) {
      return NextResponse.json(
        { error: '최소 하나의 진료 방식을 선택해야 합니다.' },
        { status: 400 }
      )
    }

    console.log('Updating doctor profile:', session.user.id, body)

    const updatedDoctor = await prisma.users.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        specialization,
        license,
        clinic,
        address,
        hasOnlineConsultation,
        hasOfflineConsultation,
        updatedAt: new Date()
      }
    })

    console.log('Profile updated successfully:', updatedDoctor)

    return NextResponse.json({
      message: '프로필이 성공적으로 업데이트되었습니다.',
      profile: {
        id: updatedDoctor.id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        phone: updatedDoctor.phone,
        specialization: updatedDoctor.specialization,
        license: updatedDoctor.license,
        clinic: updatedDoctor.clinic,
        address: updatedDoctor.address,
        hasOnlineConsultation: updatedDoctor.hasOnlineConsultation,
        hasOfflineConsultation: updatedDoctor.hasOfflineConsultation
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}