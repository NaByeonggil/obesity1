import { NextRequest, NextResponse } from "next/server"
import { findAppointment } from "@/lib/preview/data"

// 예약 상태 상세
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const appointment = findAppointment(params.id)
  if (!appointment) {
    return NextResponse.json({ success: false, error: "예약을 찾을 수 없습니다" }, { status: 404 })
  }
  return NextResponse.json({ success: true, appointment })
}
