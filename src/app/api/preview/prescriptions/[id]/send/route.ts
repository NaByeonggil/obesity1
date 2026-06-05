import { NextRequest, NextResponse } from "next/server"
import { findPrescription, findPharmacy } from "@/lib/preview/data"

// 처방전을 약국으로 전송 (데모: 전송 성공 + 예상 조제 시간 반환)
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const prescription = findPrescription(params.id)
  if (!prescription) {
    return NextResponse.json({ success: false, error: "처방전을 찾을 수 없습니다" }, { status: 404 })
  }
  const body = await request.json().catch(() => ({}))
  const pharmacy = body.pharmacyId ? findPharmacy(body.pharmacyId) : undefined
  return NextResponse.json({
    success: true,
    prescriptionId: prescription.id,
    pharmacy: pharmacy ?? null,
    status: "SENT",
    estimatedReadyMin: pharmacy?.prepTimeMin ?? 15,
    message: `${pharmacy?.name ?? "약국"}으로 처방전이 전송되었습니다.`,
  })
}
