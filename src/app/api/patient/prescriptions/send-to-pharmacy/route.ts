import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 환자가 약국으로 처방전 전송
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'patient') {
      return NextResponse.json({ error: '환자만 접근 가능합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { prescriptionId, pharmacyId } = body

    if (!prescriptionId || !pharmacyId) {
      return NextResponse.json({ error: '처방전 ID와 약국 ID가 필요합니다' }, { status: 400 })
    }

    // 처방전 확인 및 권한 검증
    const prescription = await prisma.prescriptions.findFirst({
      where: {
        id: prescriptionId,
        patientId: session.user.id
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: '처방전을 찾을 수 없습니다' }, { status: 404 })
    }

    // 유효기간 확인
    if (new Date() > new Date(prescription.validUntil)) {
      return NextResponse.json({ error: '처방전 유효기간이 만료되었습니다' }, { status: 400 })
    }

    // 약국 존재 확인
    const pharmacy = await prisma.users.findFirst({
      where: {
        id: pharmacyId,
        role: 'PHARMACY'
      }
    })

    if (!pharmacy) {
      return NextResponse.json({ error: '약국을 찾을 수 없습니다' }, { status: 404 })
    }

    // 처방전을 약국으로 전송 (pharmacyId 업데이트 및 상태 변경)
    const updatedPrescription = await prisma.prescriptions.update({
      where: { id: prescriptionId },
      data: {
        pharmacyId: pharmacyId,
        status: 'PENDING', // 조제 대기 상태로 변경
        updatedAt: new Date()
      }
    })

    // 약사에게 알림 생성
    const patientName = prescription.users_prescriptions_patientIdTousers?.name || '환자'
    await prisma.user_notifications.create({
      data: {
        id: `notif_pharmacy_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId: pharmacyId,
        title: '새로운 처방전',
        message: `${patientName}님의 처방전이 전송되었습니다. (처방전번호: ${prescription.prescriptionNumber})`,
        type: 'NEW_PRESCRIPTION',
        read: false,
        createdAt: new Date()
      }
    })

    console.log('✅ 약사 알림 생성 완료:', {
      pharmacyId,
      pharmacyName: pharmacy.pharmacyName || pharmacy.name,
      prescriptionNumber: prescription.prescriptionNumber
    })

    return NextResponse.json({
      success: true,
      message: `처방전이 ${pharmacy.pharmacyName || pharmacy.name}으로 전송되었습니다`,
      prescription: updatedPrescription
    })

  } catch (error) {
    console.error('처방전 전송 오류:', error)
    return NextResponse.json(
      { success: false, error: '처방전 전송에 실패했습니다' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
