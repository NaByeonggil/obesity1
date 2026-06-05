import { NextRequest, NextResponse } from "next/server"
import { findPrescription } from "@/lib/preview/data"

// 처방전 상세
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const prescription = findPrescription(params.id)
  if (!prescription) {
    return NextResponse.json({ success: false, error: "처방전을 찾을 수 없습니다" }, { status: 404 })
  }
  return NextResponse.json({ success: true, prescription })
}
