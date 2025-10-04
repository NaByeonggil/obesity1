import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import puppeteer from 'puppeteer'

const prisma = new PrismaClient()

// HTML 템플릿 생성 함수
function generatePrescriptionHTML(prescription: any): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>처방전</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
      padding: 40px;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }

    .header h1 {
      font-size: 28px;
      color: #1e40af;
      margin-bottom: 10px;
    }

    .section {
      margin-bottom: 25px;
    }

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e5e7eb;
    }

    .info-table {
      width: 100%;
      margin-bottom: 10px;
    }

    .info-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .info-label {
      font-weight: bold;
      width: 150px;
      color: #4b5563;
    }

    .info-value {
      flex: 1;
      color: #1f2937;
    }

    .medication-item {
      background-color: #f9fafb;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }

    .medication-name {
      font-size: 14px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }

    .medication-detail {
      padding: 4px 0;
      padding-left: 15px;
      color: #4b5563;
    }

    .total-price {
      font-size: 18px;
      font-weight: bold;
      text-align: right;
      margin-top: 30px;
      padding: 15px;
      background-color: #eff6ff;
      border-radius: 8px;
      color: #1e40af;
    }

    .notes-box {
      margin-top: 25px;
      padding: 20px;
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>처 방 전</h1>
    <p style="font-size: 14px; color: #6b7280;">Prescription</p>
  </div>

  <div class="section">
    <div class="section-title">처방전 정보</div>
    <div class="info-table">
      <div class="info-row">
        <div class="info-label">처방전 번호</div>
        <div class="info-value">${prescription.prescriptionNumber}</div>
      </div>
      <div class="info-row">
        <div class="info-label">발급일</div>
        <div class="info-value">${new Date(prescription.issuedAt).toLocaleString('ko-KR')}</div>
      </div>
      <div class="info-row">
        <div class="info-label">유효기간</div>
        <div class="info-value">${new Date(prescription.validUntil).toLocaleString('ko-KR')}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">환자 정보</div>
    <div class="info-table">
      <div class="info-row">
        <div class="info-label">성명</div>
        <div class="info-value">${prescription.users_prescriptions_patientIdTousers?.name || '-'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">연락처</div>
        <div class="info-value">${prescription.users_prescriptions_patientIdTousers?.phone || '-'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">의사 정보</div>
    <div class="info-table">
      <div class="info-row">
        <div class="info-label">의사명</div>
        <div class="info-value">${prescription.users_prescriptions_doctorIdTousers?.name || '-'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">전문과목</div>
        <div class="info-value">${prescription.users_prescriptions_doctorIdTousers?.specialization || '-'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">병원명</div>
        <div class="info-value">${prescription.users_prescriptions_doctorIdTousers?.clinic || '-'}</div>
      </div>
      <div class="info-row">
        <div class="info-label">면허번호</div>
        <div class="info-value">${prescription.users_prescriptions_doctorIdTousers?.license || '-'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">진단명</div>
    <div class="info-value" style="padding: 10px; background-color: #f9fafb; border-radius: 8px;">
      ${prescription.diagnosis || '-'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">처방 의약품</div>
    ${prescription.prescription_medications?.map((med: any, index: number) => `
      <div class="medication-item">
        <div class="medication-name">${index + 1}. ${med.medications.name}</div>
        <div class="medication-detail">• 용량: ${med.dosage}</div>
        <div class="medication-detail">• 복용법: ${med.frequency}</div>
        <div class="medication-detail">• 투약기간: ${med.duration}</div>
        <div class="medication-detail">• 수량: ${med.quantity}</div>
      </div>
    `).join('')}
  </div>

  <div class="total-price">
    총 금액: ${prescription.totalPrice?.toLocaleString('ko-KR') || '0'}원
  </div>

  ${prescription.notes ? `
    <div class="notes-box">
      <div class="section-title" style="border: none; color: #92400e;">⚠️ 주의사항</div>
      <div style="color: #92400e; padding-top: 10px;">
        ${prescription.notes}
      </div>
    </div>
  ` : ''}

  <div class="footer">
    본 처방전은 전자 처방전으로 법적 효력을 가집니다.
  </div>
</body>
</html>
  `
}

// 약국용 처방전 PDF 다운로드 (Puppeteer 사용 - 한글 완벽 지원)
export async function GET(request: NextRequest) {
  let browser = null

  try {
    console.log('[Pharmacy PDF API] 처방전 PDF 다운로드 요청')
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log('[Pharmacy PDF API] 인증 실패: 세션 없음')
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    if (session.user.role?.toLowerCase() !== 'pharmacy') {
      console.log('[Pharmacy PDF API] 권한 없음: 약국 아님', session.user.role)
      return NextResponse.json({ error: '약국만 접근 가능합니다' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const prescriptionId = searchParams.get('prescriptionId')
    console.log('[Pharmacy PDF API] 처방전 ID:', prescriptionId)

    if (!prescriptionId) {
      return NextResponse.json({ error: '처방전 ID가 필요합니다' }, { status: 400 })
    }

    // 처방전 정보 조회 - 약국은 전송된 모든 처방전 조회 가능
    const prescription = await prisma.prescriptions.findFirst({
      where: {
        id: prescriptionId
      },
      include: {
        users_prescriptions_patientIdTousers: {
          select: {
            name: true,
            phone: true,
            ssn: true
          }
        },
        users_prescriptions_doctorIdTousers: {
          select: {
            name: true,
            specialization: true,
            clinic: true,
            license: true
          }
        },
        prescription_medications: {
          include: {
            medications: {
              select: {
                name: true,
                description: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!prescription) {
      console.log('[Pharmacy PDF API] 처방전을 찾을 수 없음')
      return NextResponse.json({ error: '처방전을 찾을 수 없습니다' }, { status: 404 })
    }

    console.log('[Pharmacy PDF API] 처방전 조회 성공, PDF 생성 시작')

    // Puppeteer로 PDF 생성
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // HTML 설정
    const html = generatePrescriptionHTML(prescription)
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    })

    // PDF 생성
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()
    browser = null

    console.log('[Pharmacy PDF API] PDF 생성 완료, 크기:', pdfBuffer.length, 'bytes')

    // PDF 응답 반환
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="prescription_${prescription.prescriptionNumber}.pdf"`
      }
    })

  } catch (error) {
    console.error('[Pharmacy PDF API] PDF 다운로드 오류:', error)
    console.error('[Pharmacy PDF API] 에러 스택:', error instanceof Error ? error.stack : 'Unknown error')

    // 브라우저 정리
    if (browser) {
      await browser.close()
    }

    return NextResponse.json(
      { error: 'PDF 다운로드에 실패했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
