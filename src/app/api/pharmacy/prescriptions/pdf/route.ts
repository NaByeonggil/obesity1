import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 약국용 처방전 PDF 다운로드 (첨부된 PDF만 반환)
export async function GET(request: NextRequest) {

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

    // 의사가 첨부한 PDF 파일이 있으면 그것을 반환
    if ((prescription as any).pdfFilePath) {
      console.log('[Pharmacy PDF API] 의사 첨부 PDF 파일 발견:', (prescription as any).pdfFilePath)

      const fs = await import('fs')
      const path = await import('path')

      try {
        // 파일 경로 처리
        const pdfPath = (prescription as any).pdfFilePath
        const filePath = pdfPath.startsWith('http')
          ? pdfPath
          : path.join(process.cwd(), 'public', pdfPath)

        // URL인 경우 fetch로 다운로드
        if (pdfPath.startsWith('http')) {
          const response = await fetch(pdfPath)
          if (!response.ok) {
            throw new Error('PDF 파일 다운로드 실패')
          }
          const buffer = await response.arrayBuffer()

          return new NextResponse(buffer as any, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="prescription_${prescription.prescriptionNumber}.pdf"`
            }
          })
        }

        // 로컬 파일인 경우
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath)

          return new NextResponse(fileBuffer as any, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="prescription_${prescription.prescriptionNumber}.pdf"`
            }
          })
        } else {
          console.log('[Pharmacy PDF API] 첨부 파일을 찾을 수 없음')
          return NextResponse.json({ error: '의사가 아직 처방전 PDF를 첨부하지 않았습니다' }, { status: 404 })
        }
      } catch (fileError) {
        console.error('[Pharmacy PDF API] 첨부 파일 로드 오류:', fileError)
        return NextResponse.json({ error: '처방전 PDF 파일을 불러올 수 없습니다' }, { status: 500 })
      }
    }

    // 첨부 PDF가 없는 경우
    console.log('[Pharmacy PDF API] 첨부된 PDF 파일이 없음')
    return NextResponse.json({ error: '의사가 아직 처방전 PDF를 첨부하지 않았습니다' }, { status: 404 })

  } catch (error) {
    console.error('[Pharmacy PDF API] PDF 조회 오류:', error)
    console.error('[Pharmacy PDF API] 에러 스택:', error instanceof Error ? error.stack : 'Unknown error')

    return NextResponse.json(
      { error: 'PDF 조회에 실패했습니다', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
