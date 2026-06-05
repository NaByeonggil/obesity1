"use client"

// 루트(/)는 로그인 여부에 따라 분기합니다 (PWA 진입점).
// - 로그인:   홈 대시보드 (/home-dashboard)
// - 비로그인: 미로그인 랜딩 - 진료 과목 선택 (/landing-department-select)
// 화면 목록(런처)은 /screens, 기존 마케팅 랜딩은 /landing 에 있습니다.

import { useSession } from "next-auth/react"
import HomeDashboardPage from "./home-dashboard/page"
import LandingDepartmentSelectPage from "./landing-department-select/page"

export default function RootPage() {
  const { status } = useSession()

  // 세션 확인 중에는 깜빡임 방지를 위해 빈 화면 유지
  if (status === "loading") {
    return <div className="stitch-theme min-h-screen" />
  }

  return status === "authenticated" ? <HomeDashboardPage /> : <LandingDepartmentSelectPage />
}
