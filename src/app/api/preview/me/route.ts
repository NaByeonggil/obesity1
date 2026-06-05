import { NextResponse } from "next/server"
import { previewUser, paymentMethods, paymentHistory } from "@/lib/preview/data"

// 마이페이지: 사용자 정보 + 결제수단 + 결제내역
export async function GET() {
  return NextResponse.json({
    success: true,
    user: previewUser,
    paymentMethods,
    paymentHistory,
  })
}
