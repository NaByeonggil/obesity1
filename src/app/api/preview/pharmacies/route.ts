import { NextResponse } from "next/server"
import { pharmacies } from "@/lib/preview/data"

// 약국 목록 (거리순). 디지털 처방전 약국 선택 화면용.
export async function GET() {
  const sorted = [...pharmacies].sort((a, b) => a.distanceKm - b.distanceKm)
  return NextResponse.json({ success: true, count: sorted.length, pharmacies: sorted })
}
