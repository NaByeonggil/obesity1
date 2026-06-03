import { NextRequest, NextResponse } from "next/server"
import { paymentMethods, findClinic } from "@/lib/preview/data"

// 결제 화면: 결제수단 + 결제 금액 요약
export async function GET(request: NextRequest) {
  const clinicId = request.nextUrl.searchParams.get("clinicId")
  const clinic = clinicId ? findClinic(clinicId) : undefined
  const consultationFee = clinic?.fee ?? 30000
  const serviceFee = 1000
  return NextResponse.json({
    success: true,
    methods: paymentMethods,
    summary: {
      consultationFee,
      serviceFee,
      discount: 0,
      total: consultationFee + serviceFee,
    },
  })
}

// 결제 처리 (데모: 항상 성공, 영수증 번호 발급)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    paid: true,
    methodId: body.methodId ?? "pm-card",
    amount: body.amount ?? 31000,
    receiptNo: `RCPT-${Date.now()}`,
    paidAt: "2024-06-12T15:05:00+09:00",
  })
}
