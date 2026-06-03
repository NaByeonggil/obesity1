"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { previewPath } from "@/lib/preview/routes"

export default function ClinicDetailBookingPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/preview/clinics/c-001")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [])

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    if (button.disabled) return
    const circle = document.createElement("span")
    const diameter = Math.max(button.clientWidth, button.clientHeight)
    const radius = diameter / 2
    const rect = button.getBoundingClientRect()

    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${e.clientX - rect.left - radius}px`
    circle.style.top = `${e.clientY - rect.top - radius}px`
    circle.style.position = "absolute"
    circle.style.borderRadius = "50%"
    circle.style.transform = "scale(0)"
    circle.style.animation = "ripple 600ms linear"
    circle.style.backgroundColor = "rgba(255, 255, 255, 0.4)"
    circle.style.pointerEvents = "none"
    circle.classList.add("ripple")

    button.appendChild(circle)
    setTimeout(() => circle.remove(), 600)
  }

  return (
    <div className="stitch-theme bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container">
      <style>{`@keyframes ripple { to { transform: scale(4); opacity: 0; } }`}</style>
      {/* Header Actions (Floating over image) */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-container-margin py-stack-md">
        <button
          className="p-2 bg-surface/80 backdrop-blur-md rounded-full shadow-sm text-primary active:scale-95 transition-transform"
          onClick={(e) => {
            handleRipple(e)
            router.back()
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <button
            className="p-2 bg-surface/80 backdrop-blur-md rounded-full shadow-sm text-primary active:scale-95 transition-transform"
            onClick={handleRipple}
          >
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <button
            className="p-2 bg-surface/80 backdrop-blur-md rounded-full shadow-sm text-primary active:scale-95 transition-transform"
            onClick={handleRipple}
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>
      <main className="pb-32">
        {/* Hero Section */}
        <section className="relative h-72 w-full overflow-hidden">
          <img
            alt="Clinic Interior"
            className="w-full h-full object-cover"
            data-alt="A wide-angle professional photograph of a modern high-end medical clinic interior. The space is flooded with soft natural daylight, featuring light wood accents, pristine white marble surfaces, and minimalist ergonomic furniture in a serene teal and gray color palette. The atmosphere is exceptionally clean, private, and peaceful, reflecting a premium healthcare environment. High-key lighting emphasizes the clinical yet welcoming aesthetic."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGMYyPMJbWvh6SwnOkfm0tlpQoy6SE511A1UaLHN0S7FnCIL7AIVheZkyB_pwVZhzdiSlGafYIZWtzt9SjYjY6TaK26tr6RVprPKC0_ONmlzbiXDcmIdZrpil6ah0uR1-i4h3v_XGvmrBMSP5bk8erJamhTi152BMXQzfn0DUhISiPnMyrmI2BgYrzUsT6AscfGBgRwzL1bvNRQCqzyh99igOfHK2gEVBsI_G6n11fG0e2TWstzjH1bL5xuTdGTlA1mY_Y1j0Dav3w"
          />
          <div className="absolute inset-0 clinic-hero-gradient"></div>
        </section>
        {/* Clinic Profile */}
        <section className="-mt-8 relative z-10 px-container-margin">
          <div className="bg-surface-container-lowest rounded-xl p-stack-lg shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
            <div className="flex flex-col gap-2">
              <h1 className="text-headline-md font-headline-md text-on-surface">{data?.clinic?.name ?? "서울 연세 가가 클리닉"}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-body-md font-bold">{data?.clinic?.rating ?? "4.8"}</span>
                </div>
                <span className="text-on-surface-variant text-label-md">({data?.clinic?.reviewCount ?? "1.2k+"} reviews)</span>
              </div>
              <div className="mt-stack-sm space-y-2">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="text-body-sm">{data?.clinic?.address ?? "강남구 역삼동 (내 위치에서 350m)"}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span className="text-body-sm">{data?.clinic?.openHours ?? "09:00 - 19:00 (오늘)"}</span>
                  <span className="ml-auto text-primary font-bold text-label-md bg-primary-fixed/20 px-2 py-0.5 rounded">영업 중</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Medical Services Section */}
        <section className="mt-stack-lg px-container-margin">
          <h2 className="text-headline-sm font-headline-sm text-on-surface mb-stack-md">진료 및 상담 서비스</h2>
          <div className="flex flex-wrap gap-2">
            {(data?.clinic?.tags ?? ["체중관리·비만", "GLP-1 상담", "대사증후군 상담", "종합 내과 진료"]).map((tag: string) => (
              <div key={tag} className="bg-surface-container-high text-primary px-4 py-2 rounded-full text-label-md font-bold border border-primary/10">
                {tag}
              </div>
            ))}
          </div>
        </section>
        {/* Appointment Section */}
        <section className="mt-stack-lg px-container-margin">
          <h2 className="text-headline-sm font-headline-sm text-on-surface mb-stack-md">방문 예약하기</h2>
          {/* Date Picker */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-stack-sm">
            {/* Mon (Past/Disabled) */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl bg-surface-container-highest/30 text-outline-variant opacity-50 cursor-not-allowed">
              <span className="text-label-md">월</span>
              <span className="text-body-lg font-bold">10</span>
            </div>
            {/* Tue (Past/Disabled) */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl bg-surface-container-highest/30 text-outline-variant opacity-50 cursor-not-allowed">
              <span className="text-label-md">화</span>
              <span className="text-body-lg font-bold">11</span>
            </div>
            {/* Wed (Active Selected) */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/20 transition-all scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background">
              <span className="text-label-md">수</span>
              <span className="text-body-lg font-bold">12</span>
            </div>
            {/* Thu */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:border-primary transition-colors cursor-pointer">
              <span className="text-label-md">목</span>
              <span className="text-body-lg font-bold">13</span>
            </div>
            {/* Fri */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:border-primary transition-colors cursor-pointer">
              <span className="text-label-md">금</span>
              <span className="text-body-lg font-bold">14</span>
            </div>
            {/* Sat */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:border-primary transition-colors cursor-pointer">
              <span className="text-label-md">토</span>
              <span className="text-body-lg font-bold">15</span>
            </div>
          </div>
          {/* Time Grid */}
          <div className="mt-stack-lg grid grid-cols-3 gap-3">
            <button className="py-3 px-2 rounded-xl bg-surface-container text-outline-variant font-label-md text-center opacity-60" disabled onClick={handleRipple}>09:30 (마감)</button>
            <button className="py-3 px-2 rounded-xl bg-surface-container text-outline-variant font-label-md text-center opacity-60" disabled onClick={handleRipple}>10:00 (마감)</button>
            <button className="py-3 px-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-label-md text-center hover:border-primary active:scale-95 transition-all" onClick={handleRipple}>11:30</button>
            <button className="py-3 px-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-label-md text-center hover:border-primary active:scale-95 transition-all" onClick={handleRipple}>13:30</button>
            <button className="py-3 px-2 rounded-xl bg-primary-container text-on-primary-container font-label-md text-center ring-2 ring-primary ring-offset-1 ring-offset-background font-bold" onClick={handleRipple}>14:00</button>
            <button className="py-3 px-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-label-md text-center hover:border-primary active:scale-95 transition-all" onClick={handleRipple}>15:00</button>
            <button className="py-3 px-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-label-md text-center hover:border-primary active:scale-95 transition-all" onClick={handleRipple}>16:30</button>
            <button className="py-3 px-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-label-md text-center hover:border-primary active:scale-95 transition-all" onClick={handleRipple}>17:00</button>
            <button className="py-3 px-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-label-md text-center hover:border-primary active:scale-95 transition-all" onClick={handleRipple}>18:00</button>
          </div>
          {/* Selection Summary */}
          <div className="mt-stack-lg p-stack-md bg-surface-container-low rounded-xl border border-primary/10">
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-on-surface-variant">선택된 예약 시간</span>
              <div className="flex items-center justify-between">
                <span className="text-body-md font-bold text-primary">2024년 6월 12일 (수) 오후 2:00</span>
                <span className="material-symbols-outlined text-primary">event_available</span>
              </div>
            </div>
          </div>
          {/* Notice */}
          <div className="mt-stack-md flex items-start gap-2 px-1">
            <span className="material-symbols-outlined text-[16px] mt-0.5 text-on-surface-variant">info</span>
            <p className="text-body-sm text-on-surface-variant">예약은 의원 확인 후 확정됩니다. 방문 전 안내 문자를 확인해 주세요.</p>
          </div>
        </section>
      </main>
      {/* Bottom Fixed CTA */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg px-container-margin pb-10 pt-4 z-50">
        <Link
          href={previewPath("clinic-booking")}
          className="block w-full text-center bg-secondary-container hover:bg-secondary text-white text-body-lg font-bold py-5 rounded-xl shadow-lg shadow-secondary-container/30 active:scale-[0.98] transition-all duration-200"
        >
          예약 요청하기
        </Link>
      </footer>
      {/* Bottom Nav Placeholder (Contextually Hidden for Focused Task as per instructions) */}
      {/* The BottomNavBar is suppressed because this is a specific 'Details and Appointment' task-focused sub-page */}
    </div>
  )
}
