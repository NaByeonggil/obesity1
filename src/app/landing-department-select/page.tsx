"use client"

// Stitch "통합 홈 랜딩 (차별화 포인트 추가)" 화면 (projects/12427868471829032741)
// 비로그인 사용자가 루트(/) 진입 시 보게 되는 랜딩입니다.
// 원본: stitch/home-landing-v2/screen.html

import Link from "next/link"
import { useRouter } from "next/navigation"
import { previewPath, BOTTOM_NAV } from "@/lib/preview/routes"

const DEPARTMENTS = [
  {
    key: "obesity-pill",
    title: "비만약 처방",
    description: "체중 관리를 위한 맞춤 처방",
    badge: "대면" as const,
    imgAlt: "Weight management capsule supplement bottle in soft teal lighting",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgfKGQvUrMHHx8UqgCpEg4Mw1M5ZAGSRzGBypElGj7XGrpkIozTH8GeLDweYmoLsj4LJqtQmoRZHOdOYNq-QY2Ipf3Od8f-o0HSNMPE0gXw-U8YE5lDrMKfzUh88BsQykdaqCTFOQf-fHhv5i8xdOuvGPwyo0Fl9TB3NDgNmLS-Fx6tZseYi-6HxCs0Fim8JBCxOeiwNvQadXopimNx4C5dGwFMzBtYs7SW1bzGfz7vQjtABo0Adg4GKKgG9E3P3ghtHaRAaJsBsIP",
  },
  {
    key: "obesity-injection",
    title: "비만약 주사",
    description: "위고비·마운자로 상담",
    badge: "대면" as const,
    imgAlt: "Modern insulin pen injector device for weight management in soft teal and white color palette",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvkfdpfmr7-ATF-CsuhGeRhKrTqFjoBs6-3e55f_pRVwrMb-6ZlTyzBapRxL5dDE1M2taunvQlNFyBUI_C5VmIet8hWfJ-iI4aX99Zn4b5uKzr9jh595ql8oql2VfgGRnxPLtQMLM7wG-m2NUMBKjEm99nNmD8KWhbnpPksrUbm2bBSmJduBfBosm4kEHZheX7q6Xa681iUlvxGUhT1dxqrEgYnNNsIAvXz0YPh4ENGo8xjvJdrgmyw8Sh2ZmxgGcvAQGzlD5Ne_ie",
  },
  {
    key: "hair-loss",
    title: "탈모약 처방",
    description: "풍성한 내일을 위한 관리",
    badge: "대면" as const,
    imgAlt: "Premium hair loss treatment bottle with revitalizing logo on a minimalist light teal background",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMGtCP-_O4_SjgWUk1qSh-_m1VYvszZXjmBAVtj3lNLsIm6n70Qsna9n7SD_3gCNmcy1T9qYFDp-NY332QE5KalVoTcY1AUwz_7Il3U7bnKOve8A_PCtsMDOKGzfEMkkLH1h_1O9RW4eCeX2l9CIazxHHIYSEgiw4-ivhuM-wLGlyMqn1Mw0jnF7OjAQq0kET3eXbHvRPZ6HLTe7Z-Rm4YycK293gxC76n6NRumiTz8Ky0P-mwH47c2TV_3S9tEdY0EUQdzuE5S8AQ",
  },
  {
    key: "artificial-tears",
    title: "인공눈물",
    description: "촉촉한 눈을 위한 비대면 처방",
    badge: "비대면" as const,
    imgAlt: "Medical grade eye drop bottle for artificial tears in a soothing soft teal setting",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYK5aN3oc2SYQVZbFxK2YQX1fKjQn8Nldak-HrIgdHHpjpVZCnJpstsM9frTMvl2X9LSKrMfgsL8nVwu7rmYR24EUa6Gy9-Sx2OiDa7aX4zigeUI-1QL0OSZHt2TZTtrjpYH-yOzO6YhEdZv39jcatWNKj7wIVD_Afc_jTM0T330rS4PqfoZpkHadRDJovHI5f0UwD4OIGv8GqjgEPbhG_tgoqseTkcwJ5hbawZz5PLLAV8v_WRap18tX4I4vfRLhsn1V7CcrkMduM",
  },
]

const TESTIMONIALS = [
  {
    key: "kang",
    quote:
      "\"앱이 정말 직관적이에요. 전문가의 안내에 따라 3개월 만에 8kg 감량에 성공했습니다. 이제는 더 이상 고민하지 않아도 돼요!\"",
    name: "강민수님",
    role: "직장인, 34세",
    initials: "강민",
    accentBorder: "border-l-primary-container",
    avatarClass: "bg-primary-fixed text-primary",
  },
  {
    key: "park",
    quote:
      "\"비대면 진료가 망설여졌지만, 이곳의 전문성은 확실하네요. 바쁜 일정에도 편리하게 이용할 수 있어서 좋았습니다.\"",
    name: "박지혜님",
    role: "마케팅 팀장, 29세",
    initials: "지혜",
    accentBorder: "border-l-secondary",
    avatarClass: "bg-secondary-fixed text-secondary",
  },
  {
    key: "lee",
    quote:
      "\"명확한 설명과 전문적인 지원이 인상적입니다. 현대적인 헬스케어란 이런 것이죠. 체중 감량을 진지하게 생각하시는 분들께 강력 추천합니다.\"",
    name: "이상균님",
    role: "개발자, 38세",
    initials: "상균",
    accentBorder: "border-l-tertiary",
    avatarClass: "bg-tertiary-fixed text-tertiary",
  },
]

const DIFFERENTIATORS = [
  {
    key: "screening",
    icon: "analytics",
    title: "정밀한 비대면 검진",
    description: "단순 상담을 넘어 데이터 기반의 맞춤 처방을 제공하여 안전하고 효과적인 관리를 시작합니다.",
  },
  {
    key: "monitoring",
    icon: "monitoring",
    title: "24/7 밀착 모니터링",
    description: "처방 후에도 앱을 통한 실시간 컨디션 체크와 전문가 상담으로 끝까지 함께합니다.",
  },
  {
    key: "pharmacy",
    icon: "local_pharmacy",
    title: "검증된 약국 연계",
    description: "전국 검증된 파트너 약국과의 연계로 조제 지연 없는 가장 빠른 수령 시스템을 구축했습니다.",
  },
]

const TRUST_BADGES = [
  { key: "iso", icon: "encrypted", label: "ISO 27001 정보보호 인증" },
  { key: "partner", icon: "clinical_notes", label: "검증된 의료 파트너" },
  { key: "privacy", icon: "gpp_good", label: "개인정보보호 규정 준수" },
]

export default function LandingDepartmentSelectPage() {
  const router = useRouter()

  return (
    <div className="stitch-theme bg-background font-body-md text-body-md text-on-surface antialiased">
      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-container-margin py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img
              alt="날씬닥터 로고"
              className="h-8 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrewt6n1ZvxmRVw8O7opAOUjYUCtp3Re2zOFtAs-W67Hn7NLUzJ9W65GeykxvO_oFIWtQreLTJloSWkvCllRw6f72ywLDGPOv-ZmZmHkyB2WW9YeAsikHjYY6QAyTd2ZZqCQm1pWBD1LyuSgjaO9k4jZ4uvFyR9QAT1bcDchT4FaovAT0n0I8sF1HEnOek-q1Nd9IttezoKOQ3SafhyU51V4j96a4VbzLpv00Fuxdns0wFbx58mULYfupJxckq5ycZImv6rW6tlEhp"
            />
            <span className="font-headline-md text-headline-md text-primary tracking-tight hidden sm:block">날씬닥터</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#treatments">진료 과목</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#why">특장점</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#reviews">사용 후기</a>
            <Link href="/auth/login" className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all">
              로그인
            </Link>
          </nav>
          <div className="md:hidden flex items-center gap-4">
            <Link href="/auth/login" className="text-primary font-label-md text-label-md font-bold">로그인</Link>
          </div>
        </div>
      </header>
      <main>
        {/* Hero Section */}
        <section className="pt-8 pb-12 px-container-margin">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4">
                체중 관리,<br /><span className="text-primary">이제 전문적이고 편리하게</span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-lg mx-auto md:mx-0">
                비대면 상담부터 약 수령까지, 전문가의 관리를 어디서든 편리하게 경험하세요.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-fixed-dim/30 blur-3xl rounded-full"></div>
                <img
                  alt="신뢰할 수 있는 날씬닥터 전문 의료진"
                  className="relative z-10 w-full h-48 md:h-64 object-cover rounded-2xl shadow-xl border-2 border-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiuWJ9edf8U0siNCLu5nVpANvu76uw_vP4vARfTjtNo7Ksj3-ORJj9Se_aeiBcjfoEHMgY_xtdAtJcMKy_l9-JkbRfFNUKv5mpeqPqXKIB83PhRjeiqPovvPboTAb9b_xgOsaffcyDL_asMgw8nfD4y_VFcm_Hd3rDklnGbGbq5WSepZNO4gXdky2_q4-s2IsPjP4meK1xXKY-SkPmo3bgfmp-g5Shu_t73KjXBPuEwreE09ksaa3ryxQB5Dafh_HCMsjrHSD3nls5"
                />
              </div>
            </div>
          </div>
        </section>
        {/* Category Selection Section (Immediate Action) */}
        <section className="py-section-gap px-container-margin bg-surface-container-low" id="treatments">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10 text-center md:text-left">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">진료 과목 선택</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">로그인 없이 바로 진료 과목을 확인해보세요</p>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.key}
                  onClick={() => router.push(previewPath("clinic-search-list"))}
                  className="group relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/30 flex flex-col items-center text-center transition-all duration-300 active:scale-95 cursor-pointer hover:border-primary"
                >
                  <div className="absolute top-2 right-2 z-10">
                    <span
                      className={
                        dept.badge === "대면"
                          ? "bg-primary-container text-on-primary-container font-label-md text-label-md px-2 py-0.5 rounded-full"
                          : "bg-secondary-container text-on-secondary-container font-label-md text-label-md px-2 py-0.5 rounded-full"
                      }
                    >
                      {dept.badge}
                    </span>
                  </div>
                  <div className="w-full aspect-square mb-3 flex items-center justify-center bg-surface-container rounded-lg group-hover:scale-105 transition-transform">
                    <img alt={dept.imgAlt} className="w-full h-full object-cover rounded-lg" src={dept.imgSrc} />
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">{dept.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">{dept.description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
        {/* Real Reviews Carousel */}
        <section className="bg-surface-container-low py-section-gap px-container-margin overflow-hidden" id="reviews">
          <div className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">10,000명 이상의 성공 스토리가 함께합니다</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">사용자들이 직접 증명하는 리얼 후기</p>
          </div>
          <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar">
            <div className="flex gap-4 px-container-margin max-w-7xl mx-auto">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.key}
                  className={`bg-surface-container-lowest p-6 rounded-2xl shadow-sm border-l-4 ${t.accentBorder} snap-center shrink-0 w-[75vw] md:w-[400px]`}
                >
                  <div className="flex text-secondary-container mb-4">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mb-6 italic">{t.quote}</p>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${t.avatarClass}`}>{t.initials}</div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{t.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Why Professional Care Matters (차별화 포인트) */}
        <section className="py-section-gap px-container-margin bg-background" id="why">
          <div className="max-w-7xl mx-auto">
            <header className="mb-12 text-center">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">날씬닥터만의 차별화된 전문 관리</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                단순한 처방을 넘어, 당신의 건강한 변화를 위해 체계적인 시스템을 제공합니다.
              </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {DIFFERENTIATORS.map((point) => (
                <div key={point.key} className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4">
                    <span className="material-symbols-outlined text-3xl">{point.icon}</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{point.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      {/* Professional Footer */}
      <footer className="bg-surface-container-highest/50 py-12 px-container-margin pb-44 md:pb-12 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto">
          {/* Trust Badges */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12 opacity-70">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.key} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
                <span className="font-label-md text-label-md">{badge.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-outline-variant/20">
            <div className="text-center md:text-left">
              <h4 className="font-headline-sm text-headline-sm text-primary mb-2">날씬닥터</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 날씬닥터. 전문 의료 파트너.</p>
            </div>
            <div className="flex gap-6">
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">개인정보 처리방침</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">이용약관</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">고객센터</a>
            </div>
          </div>
        </div>
      </footer>
      {/* Fixed Bottom Action Area (Mobile) — 하단 메뉴바 위에 표시 */}
      <div className="fixed bottom-14 left-0 w-full z-40 md:hidden bg-surface/90 backdrop-blur-md p-4 border-t border-outline-variant/30">
        <Link
          href="/auth/login"
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-sm text-headline-sm shadow-lg active:scale-95 transition-all flex items-center justify-center"
        >
          로그인하고 시작하기
        </Link>
      </div>
      {/* Bottom Nav Bar (Shared Component Strategy) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface dark:bg-inverse-surface rounded-t-xl shadow-[0px_-4px_12px_rgba(0,107,95,0.04)] border-t border-outline-variant/30">
        {BOTTOM_NAV.map((item) => {
          const isActive = item.slug === "home-dashboard" // 랜딩은 홈(/)의 비로그인 화면
          return (
            <Link
              key={item.key}
              href={previewPath(item.slug)}
              className={
                isActive
                  ? "flex flex-col items-center justify-center text-primary font-bold bg-primary-container/20 rounded-xl px-4 py-1 active:scale-[0.98] transition-all"
                  : "flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              }
            >
              <span
                className="material-symbols-outlined"
                data-icon={item.icon}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-label-md font-label-md">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
