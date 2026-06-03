// 미리보기(Stitch 변환) 화면 간 네비게이션 라우트 맵.
// 모든 화면/하단 네비/CTA가 이 맵을 통해 서로 이동합니다.

// 화면들은 루트(/) 경로에 위치합니다. 예: /home-dashboard
export const PREVIEW_BASE = "" as const

export type PreviewSlug =
  | "home-dashboard"
  | "home-dashboard-update"
  | "clinic-search-list"
  | "clinic-detail-booking"
  | "clinic-booking"
  | "booking-status-detail"
  | "in-app-payment"
  | "payment-mypage"
  | "prescription-pharmacy-send"
  | "digital-prescription-pharmacy-select"
  | "dispensing-progress"
  | "medication-pickup"

/** 슬러그 → 미리보기 경로 */
export function previewPath(slug: PreviewSlug): string {
  return `${PREVIEW_BASE}/${slug}`
}

/** 하단 탭바 (홈 / 의원 / 처방전 / 마이) 공통 구성 */
export const BOTTOM_NAV: { key: string; label: string; icon: string; slug: PreviewSlug }[] = [
  { key: "home", label: "홈", icon: "home", slug: "home-dashboard" },
  { key: "clinic", label: "의원", icon: "local_hospital", slug: "clinic-search-list" },
  { key: "prescription", label: "처방전", icon: "medication", slug: "prescription-pharmacy-send" },
  { key: "my", label: "마이", icon: "person", slug: "payment-mypage" },
]

/**
 * 환자 진료 플로우의 "다음 화면" 매핑.
 * 각 화면의 주 CTA가 가리키는 목적지.
 */
export const PREVIEW_FLOW: Record<PreviewSlug, PreviewSlug | null> = {
  "home-dashboard": "clinic-search-list",
  "home-dashboard-update": "clinic-search-list",
  "clinic-search-list": "clinic-detail-booking",
  "clinic-detail-booking": "clinic-booking",
  "clinic-booking": "booking-status-detail",
  "booking-status-detail": "in-app-payment",
  "in-app-payment": "payment-mypage",
  "payment-mypage": "prescription-pharmacy-send",
  "prescription-pharmacy-send": "digital-prescription-pharmacy-select",
  "digital-prescription-pharmacy-select": "dispensing-progress",
  "dispensing-progress": "medication-pickup",
  "medication-pickup": "home-dashboard",
}

export function nextPreviewPath(slug: PreviewSlug): string {
  const next = PREVIEW_FLOW[slug]
  return next ? previewPath(next) : previewPath("home-dashboard")
}
