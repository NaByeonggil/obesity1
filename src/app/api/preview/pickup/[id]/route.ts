import { NextRequest, NextResponse } from "next/server"
import { findPrescription, pharmacies } from "@/lib/preview/data"

// 약 수령 안내: 주문번호 + QR + 약국 정보 + 복약 안내
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const prescription = findPrescription(params.id)
  const pharmacy = pharmacies[0]
  return NextResponse.json({
    success: true,
    orderNo: prescription?.prescriptionNumber ?? "20240612-0042",
    status: "READY",
    pharmacy,
    qrUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDn2JvGoeOm8gUc8TnufZHlKyGKSaUlgbvGwE6NxqJ6mzG0nm6tRH1kJt76XEk27MHvONaF5IhKc9J6iaVLi4ag3A7gt5rPpjb47LQfwh9xLAbqWjkz1RAXgbOQnBBQ1gByK55UwycRqTQtM90t6iYba-hihy2dlTBuXfbBQVv3AavDPgxWxUepALhX1vbhB9RzRbmHKpqj1yX9IHNdqbQVzU0ZUpjLuFJijvipC4BmnCUXr9_xgd6UFGyr-_k5i0rpRe4AlNYL6Ayn",
    medicationGuide: [
      { title: "식후 30분 복용", detail: "위장 장애 예방을 위해 규칙적인 식사 후 복용을 권장합니다.", warn: false },
      { title: "실온 보관", detail: "직사광선을 피하고 습기가 적은 서늘한 곳에 보관하세요.", warn: false },
      { title: "음주 금지", detail: "복용 기간 중 알코올 섭취는 간 손상 및 부작용 위험을 높일 수 있습니다.", warn: true },
    ],
  })
}
