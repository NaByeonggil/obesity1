// 처방전 PDF → 텍스트 변환 (로컬 Qwen3-VL OCR 서비스 연동)
//
// ocr-service/server.py (FastAPI, 기본 http://localhost:8400)를 호출하여
// 처방전 PDF를 약국 프로그램 입력용 텍스트/구조화 JSON으로 변환합니다.
// 환자가 처방전을 약국으로 전송할 때 백그라운드로 실행되고,
// 결과는 prescriptions.ocrText / ocrData 에 저장됩니다.

import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8400'
// 32B VLM 추론은 M1 Max 기준 페이지당 2~4분 소요 — 넉넉히 설정
const OCR_TIMEOUT_MS = Number(process.env.OCR_TIMEOUT_MS || 10 * 60 * 1000)

export interface OcrMedication {
  name: string | null
  code: string | null
  dosePerTime: string | null
  timesPerDay: string | null
  totalDays: string | null
  instructions: string | null
}

export interface OcrResult {
  success: boolean
  model: string
  pages: number
  elapsedSec: number
  rawText: string
  structured: {
    prescriptionNumber?: string | null
    issueDate?: string | null
    validUntil?: string | null
    patient?: { name?: string | null; registrationNumber?: string | null; phone?: string | null }
    clinic?: { name?: string | null; phone?: string | null; doctorName?: string | null; licenseNumber?: string | null }
    diagnosis?: string | null
    medications?: OcrMedication[]
    pharmacistNotes?: string | null
    rawText?: string
  }
}

/** OCR 서비스 상태 확인 */
export async function checkOcrService(): Promise<{ ok: boolean; loaded?: boolean; error?: string }> {
  try {
    const res = await fetch(`${OCR_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
    const data = await res.json()
    return { ok: true, loaded: data.loaded }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/** PDF 버퍼를 OCR 서비스로 보내 텍스트로 변환 */
export async function convertPdfToText(pdfBuffer: Buffer, filename = 'prescription.pdf'): Promise<OcrResult> {
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' }), filename)

  const res = await fetch(`${OCR_SERVICE_URL}/extract`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(OCR_TIMEOUT_MS),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`OCR 서비스 오류 (HTTP ${res.status}): ${detail}`)
  }
  return (await res.json()) as OcrResult
}

/** prescriptions.pdfFilePath(상대경로 또는 URL)에서 PDF 버퍼 로드 */
async function loadPrescriptionPdf(pdfFilePath: string): Promise<Buffer> {
  if (pdfFilePath.startsWith('http')) {
    const res = await fetch(pdfFilePath)
    if (!res.ok) throw new Error(`PDF 다운로드 실패: HTTP ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  }
  const filePath = path.join(process.cwd(), 'public', pdfFilePath)
  if (!fs.existsSync(filePath)) throw new Error(`PDF 파일을 찾을 수 없습니다: ${filePath}`)
  return fs.readFileSync(filePath)
}

/**
 * 처방전 1건을 OCR 변환하고 결과를 DB에 저장.
 * 약국 전송 시 백그라운드(after)로 호출되며, 실패해도 전송 플로우는 막지 않습니다.
 */
export async function runPrescriptionOcr(prescriptionId: string): Promise<void> {
  const prescription = await prisma.prescriptions.findUnique({
    where: { id: prescriptionId },
    select: { id: true, prescriptionNumber: true, pdfFilePath: true, ocrStatus: true },
  })

  if (!prescription) {
    console.error(`[ocr] 처방전 없음: ${prescriptionId}`)
    return
  }
  if (!prescription.pdfFilePath) {
    console.warn(`[ocr] PDF 미첨부 처방전, 변환 건너뜀: ${prescription.prescriptionNumber}`)
    return
  }
  if (prescription.ocrStatus === 'PROCESSING') {
    console.warn(`[ocr] 이미 변환 중: ${prescription.prescriptionNumber}`)
    return
  }

  await prisma.prescriptions.update({
    where: { id: prescriptionId },
    data: { ocrStatus: 'PROCESSING', updatedAt: new Date() },
  })

  try {
    const pdfBuffer = await loadPrescriptionPdf(prescription.pdfFilePath)
    const result = await convertPdfToText(pdfBuffer, `${prescription.prescriptionNumber}.pdf`)

    await prisma.prescriptions.update({
      where: { id: prescriptionId },
      data: {
        ocrStatus: 'DONE',
        ocrText: result.rawText,
        ocrData: result.structured as any,
        ocrAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log(
      `[ocr] 변환 완료: ${prescription.prescriptionNumber} (${result.pages}p, ${result.elapsedSec}s)`
    )
  } catch (error) {
    console.error(`[ocr] 변환 실패: ${prescription.prescriptionNumber}`, error)
    await prisma.prescriptions.update({
      where: { id: prescriptionId },
      data: { ocrStatus: 'FAILED', updatedAt: new Date() },
    })
  }
}
