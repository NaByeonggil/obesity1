import { NextRequest, NextResponse } from "next/server"
import { clinics } from "@/lib/preview/data"

// 의원 검색/목록. ?q= 로 이름/진료과/태그 필터링.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? ""
  const filtered = q
    ? clinics.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      )
    : clinics
  return NextResponse.json({ success: true, count: filtered.length, clinics: filtered })
}
