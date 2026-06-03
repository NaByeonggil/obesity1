import { NextRequest, NextResponse } from "next/server"
import { appointments, findClinic } from "@/lib/preview/data"

// 예약 목록
export async function GET() {
  return NextResponse.json({ success: true, appointments })
}

// 예약 생성 (데모: 입력을 받아 확정된 예약 객체를 echo)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const clinic = body.clinicId ? findClinic(body.clinicId) : undefined
  const created = {
    id: `a-${Date.now()}`,
    clinicId: clinic?.id ?? "c-001",
    clinicName: clinic?.name ?? "강남 비만클리닉",
    doctorName: clinic?.doctorName ?? "이서연 원장",
    department: clinic?.department ?? "비만/체중관리",
    date: body.date ?? "2024-06-12",
    time: body.time ?? "14:30",
    type: body.type ?? "OFFLINE",
    status: "CONFIRMED" as const,
    fee: clinic?.fee ?? 30000,
    address: clinic?.address ?? "서울 강남구 테헤란로 152",
  }
  return NextResponse.json({ success: true, appointment: created }, { status: 201 })
}
