import { NextRequest, NextResponse } from "next/server"
import { findClinic, getTimeSlots, clinics } from "@/lib/preview/data"

// 의원 상세 + 예약 가능 시간대
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const clinic = findClinic(params.id) ?? clinics[0]
  if (!clinic) {
    return NextResponse.json({ success: false, error: "의원을 찾을 수 없습니다" }, { status: 404 })
  }
  return NextResponse.json({ success: true, clinic, slots: getTimeSlots() })
}
