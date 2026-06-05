import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { runPrescriptionOcr, checkOcrService } from '@/lib/ocr-client'

const prisma = new PrismaClient()

// 처방전 OCR 변환 결과 조회/재실행
// - GET:  변환 상태 및 텍스트/구조화 결과 (약국 프로그램 입력용)
// - POST: 변환 (재)실행 — 백그라운드로 동작
//
// 접근 권한: 해당 처방전의 환자 / 발행 의사 / 전송받은 약국 / 관리자

async function authorize(prescriptionId: string) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return { error: NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 }) }
  }

  const prescription = await prisma.prescriptions.findUnique({
    where: { id: prescriptionId },
    select: {
      id: true,
      prescriptionNumber: true,
      patientId: true,
      doctorId: true,
      pharmacyId: true,
      pdfFilePath: true,
      ocrStatus: true,
      ocrText: true,
      ocrData: true,
      ocrAt: true,
    },
  })

  if (!prescription) {
    return { error: NextResponse.json({ error: '처방전을 찾을 수 없습니다' }, { status: 404 }) }
  }

  const userId = session.user.id
  const role = session.user.role?.toLowerCase()
  const allowed =
    role === 'admin' ||
    prescription.patientId === userId ||
    prescription.doctorId === userId ||
    prescription.pharmacyId === userId

  if (!allowed) {
    return { error: NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 }) }
  }

  return { prescription }
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const { prescription, error } = await authorize(params.id)
    if (error) return error

    return NextResponse.json({
      success: true,
      prescriptionNumber: prescription.prescriptionNumber,
      ocrStatus: prescription.ocrStatus,
      ocrText: prescription.ocrText,
      ocrData: prescription.ocrData,
      ocrAt: prescription.ocrAt,
    })
  } catch (e) {
    console.error('OCR 결과 조회 오류:', e)
    return NextResponse.json({ error: 'OCR 결과 조회에 실패했습니다' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const { prescription, error } = await authorize(params.id)
    if (error) return error

    if (!prescription.pdfFilePath) {
      return NextResponse.json({ error: 'PDF가 첨부되지 않은 처방전입니다' }, { status: 400 })
    }
    if (prescription.ocrStatus === 'PROCESSING') {
      return NextResponse.json({ success: true, message: '이미 변환이 진행 중입니다', ocrStatus: 'PROCESSING' })
    }

    // OCR 서비스 가용성 사전 확인
    const service = await checkOcrService()
    if (!service.ok) {
      return NextResponse.json(
        { error: `OCR 서비스에 연결할 수 없습니다 (${service.error}). ocr-service를 실행해주세요.` },
        { status: 503 }
      )
    }

    after(() =>
      runPrescriptionOcr(params.id).catch((e) => console.error('[ocr] 백그라운드 변환 오류:', e))
    )

    return NextResponse.json({
      success: true,
      message: '처방전 텍스트 변환을 시작했습니다',
      ocrStatus: 'PROCESSING',
      modelLoaded: service.loaded,
    })
  } catch (e) {
    console.error('OCR 변환 요청 오류:', e)
    return NextResponse.json({ error: 'OCR 변환 요청에 실패했습니다' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
