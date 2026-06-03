import Link from "next/link"
import { previewPath, type PreviewSlug } from "@/lib/preview/routes"

const SCREENS: { slug: PreviewSlug; title: string; icon: string }[] = [
  { slug: "home-dashboard", title: "홈 대시보드", icon: "home" },
  { slug: "home-dashboard-update", title: "홈 대시보드 업데이트", icon: "dashboard" },
  { slug: "clinic-search-list", title: "의원 검색 및 목록", icon: "search" },
  { slug: "clinic-detail-booking", title: "의원 상세 및 예약", icon: "local_hospital" },
  { slug: "clinic-booking", title: "의원 예약하기", icon: "calendar_month" },
  { slug: "booking-status-detail", title: "예약 상태 상세", icon: "event_available" },
  { slug: "in-app-payment", title: "앱 내 결제", icon: "payments" },
  { slug: "payment-mypage", title: "결제 및 마이페이지", icon: "account_circle" },
  { slug: "prescription-pharmacy-send", title: "처방전 및 약국 전송", icon: "send" },
  { slug: "digital-prescription-pharmacy-select", title: "디지털 처방전 및 약국 선택", icon: "receipt_long" },
  { slug: "dispensing-progress", title: "조제 진행 상태", icon: "pending_actions" },
  { slug: "medication-pickup", title: "약 수령 안내", icon: "medication" },
]

export default function PreviewIndexPage() {
  return (
    <div className="stitch-theme bg-background text-on-surface font-body-md min-h-screen">
      <header className="top-0 z-50 shadow-[0px_4px_12px_rgba(31,122,110,0.04)] bg-surface h-16 w-full sticky">
        <div className="flex items-center px-container-margin w-full h-full max-w-screen-md mx-auto">
          <h1 className="text-headline-sm font-bold text-primary">날씬닥터 — 화면 미리보기</h1>
        </div>
      </header>
      <main className="px-container-margin py-stack-lg max-w-screen-md mx-auto">
        <p className="text-body-sm text-on-surface-variant mb-stack-md">
          Stitch에서 변환된 {SCREENS.length}개 화면입니다. 카드를 눌러 각 화면을 확인하세요.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
          {SCREENS.map((s) => (
            <Link
              key={s.slug}
              href={previewPath(s.slug)}
              className="bg-surface-container-lowest rounded-xl p-stack-md shadow-premium flex items-center gap-stack-sm hover:bg-surface-container-low active:scale-[0.98] transition-all"
            >
              <div className="h-11 w-11 flex items-center justify-center rounded-lg bg-primary-container/10 text-primary shrink-0">
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-body-md font-bold text-on-surface truncate">{s.title}</p>
                <p className="text-label-md text-on-surface-variant truncate">{previewPath(s.slug)}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
