"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { previewPath } from "@/lib/preview/routes"

export default function BookingStatusDetailPage() {
  const router = useRouter()
  const [guide1Open, setGuide1Open] = useState(false)
  const [guide2Open, setGuide2Open] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/preview/appointments/a-001")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => {})
  }, [])

  const a = data?.appointment
  const typeLabel = a?.type === "ONLINE" ? "비대면" : a?.type === "OFFLINE" ? "대면" : "대면"
  const statusLabel =
    a?.status === "REQUESTED"
      ? "의원 확인 대기"
      : a?.status === "CONFIRMED"
        ? "예약 확정"
        : a?.status === "COMPLETED"
          ? "진료 완료"
          : a?.status === "CANCELLED"
            ? "예약 취소"
            : "의원 확인 대기"

  return (
    <div className="stitch-theme bg-surface text-on-surface min-h-screen pb-24">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface flex justify-between items-center px-container-margin py-stack-sm shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="text-headline-sm-mobile font-headline-sm-mobile text-on-surface">예약 상세</h1>
        <div className="w-10"></div>
      </header>
      <main className="pt-20 px-container-margin space-y-gutter">
        {/* Brand Identity & Main Status */}
        <section className="flex flex-col items-center justify-center py-stack-lg">
          <img
            alt="Nal-ssin Doctor Logo"
            className="h-8 mb-stack-md opacity-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXTmRrQVWzpE1zTtN2lP-kFMmWvsRtyeU6Xk5zj32g0efOmT19wIADqZLV05UC86jae2WgGxGv_GxO_atmZVOYa4HDOAQv6u4vAiHpSuEF6FSxSnqm6Gyvgzj1auvLu6hUL0YimFNtL29NRvLAyEXWXeQ3PAYlbJaGw0ScKYvtGKTaVmWu9MqE1VF3zhxCWqclVz4x42DIBiDX8jGF8TXt7eD6-7V-IyGvKEPZndhoFvCa-Wtgt35iqQoqqIVBjEAWCPRUNape8OkC"
          />
          <div className="inline-flex items-center px-4 py-2 bg-primary-container/10 border border-primary/20 rounded-full">
            <span className="material-symbols-outlined text-primary text-[18px] mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            <span className="text-label-md font-label-md text-primary">{statusLabel ?? "의원 확인 대기"}</span>
          </div>
          <p className="mt-stack-sm text-body-sm font-body-sm text-on-surface-variant text-center">
            의원에서 예약을 확인하고 있습니다.<br />잠시만 기다려주세요.
          </p>
        </section>
        {/* Vertical Timeline */}
        <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
          <div className="space-y-0">
            {/* Step 1: Completed */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
                </div>
                <div className="w-0.5 h-10 bg-primary"></div>
              </div>
              <div className="pb-6">
                <h3 className="text-body-md font-bold text-primary">예약 요청됨</h3>
                <p className="text-label-md font-label-md text-on-surface-variant">2024.06.11 10:30</p>
              </div>
            </div>
            {/* Step 2: Current */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-surface flex items-center justify-center pulse-effect">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="w-0.5 h-10 timeline-line"></div>
              </div>
              <div className="pb-6">
                <h3 className="text-body-md font-bold text-on-surface">의원 확인 대기</h3>
                <p className="text-label-md font-label-md text-on-surface-variant">현재 단계</p>
              </div>
            </div>
            {/* Step 3: Pending */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-outline-variant bg-surface flex items-center justify-center">
                </div>
              </div>
              <div>
                <h3 className="text-body-md font-bold text-outline">예약 확정</h3>
                <p className="text-label-md font-label-md text-outline-variant">확인 후 알림을 보내드려요</p>
              </div>
            </div>
          </div>
        </div>
        {/* Visit Information Card */}
        <section className="bg-surface-container-lowest rounded-xl p-stack-md shadow-[0px_4px_12px_rgba(0,107,95,0.04)] border border-outline-variant/10">
          <div className="flex items-center mb-stack-md">
            <span className="material-symbols-outlined text-primary mr-2" data-icon="calendar_today">calendar_today</span>
            <span className="text-body-md font-bold text-on-surface">방문 정보</span>
          </div>
          <div className="space-y-stack-sm mb-stack-md">
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-on-surface-variant">일시</span>
              <span className="text-body-sm font-bold text-on-surface">
                {a?.date ?? "2024-06-12"} {a?.time ?? "14:30"}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-on-surface-variant">진료 방식</span>
              <span className="text-body-sm font-bold text-on-surface text-right">{typeLabel ?? "대면"}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-on-surface-variant">의원</span>
              <span className="text-body-sm font-bold text-on-surface text-right">
                {a?.clinicName ?? "서울 연세 가가 클리닉"}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-on-surface-variant">담당의</span>
              <span className="text-body-sm font-bold text-on-surface text-right">{a?.doctorName ?? "이서연 원장"}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-on-surface-variant">진료과</span>
              <span className="text-body-sm font-bold text-on-surface text-right">{a?.department ?? "비만/체중관리"}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-on-surface-variant">진료비</span>
              <span className="text-body-sm font-bold text-on-surface text-right">
                {(a?.fee ?? 30000).toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-label-md font-label-md text-on-surface-variant">주소</span>
              <div className="text-right">
                <p className="text-body-sm font-bold text-on-surface">{a?.address ?? "서울 강남구 역삼동"}</p>
                <p className="text-label-md font-label-md text-primary">내 위치에서 350m</p>
              </div>
            </div>
          </div>
          <div className="w-full h-32 rounded-lg bg-surface-container mb-stack-md overflow-hidden relative">
            <img
              className="w-full h-full object-cover opacity-80"
              data-alt="A clean, minimalist map interface showing a pinpoint in a modern urban district of Seoul, South Korea. The map is rendered in a soft grayscale and teal color scheme to match the healthcare brand identity, featuring subtle street markers and a pulsing location icon. The overall atmosphere is professional, clear, and reassuring."
              data-location="Gangnam, Seoul"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGVCvngcpenbqgQAu8p8SnwGCCu6wDKFkzsIEu_V1ayJ4Q-R0XquT3yTUd3oIe9U4j8Dc9kcDbB4nBnhvbn2yGfBVrrcPYH9StQWmGkCOUF8BeEGcpQJUjB5rdGbbEnZ6T677woG9C-__12dq3E8zD6k35BuZ3sm3h_2104BFT2j02NrHYGjp4hI_7iUQYr5dvAJ1au9KKPhLGHAysqEFHlVwn_pwA3C5FW1Pxl7-ts2kqD4ibPiLc1i3UIS8QCvTN-Jad5W8T45XS"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
          </div>
          <button className="w-full py-stack-sm rounded-lg border border-primary text-primary text-label-md font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">directions</span>
            길찾기
          </button>
        </section>
        {/* Preparation Guide Accordion */}
        <section className="space-y-stack-sm">
          <div className="accordion-item bg-surface-container-low rounded-xl overflow-hidden transition-all duration-300">
            <button
              className="w-full px-stack-md py-stack-md flex justify-between items-center group"
              onClick={() => setGuide1Open((v) => !v)}
            >
              <span className="text-body-md font-bold text-on-surface">방문 시 주의사항</span>
              <span
                className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                style={{ transform: guide1Open ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                expand_more
              </span>
            </button>
            <div className={`${guide1Open ? "" : "hidden"} px-stack-md pb-stack-md text-body-sm text-on-surface-variant space-y-2`}>
              <p>• 원활한 진료를 위해 예약 시간 10분 전까지 내원해 주세요.</p>
              <p>• 주차 공간이 협소하니 대중교통 이용을 권장합니다.</p>
            </div>
          </div>
          <div className="accordion-item bg-surface-container-low rounded-xl overflow-hidden transition-all duration-300">
            <button
              className="w-full px-stack-md py-stack-md flex justify-between items-center group"
              onClick={() => setGuide2Open((v) => !v)}
            >
              <span className="text-body-md font-bold text-on-surface">필요한 준비물</span>
              <span
                className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                style={{ transform: guide2Open ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                expand_more
              </span>
            </button>
            <div className={`${guide2Open ? "" : "hidden"} px-stack-md pb-stack-md text-body-sm text-on-surface-variant space-y-2`}>
              <p>• 신분증 지참 필수 (본인 확인용)</p>
              <p>• 현재 복용 중인 약 처방전 (상담 시 필요)</p>
            </div>
          </div>
        </section>
        {/* Primary CTA */}
        <div className="pt-stack-md">
          <button
            onClick={() => router.push(previewPath("in-app-payment"))}
            className="w-full py-stack-md rounded-xl bg-primary text-white text-body-md font-bold hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">payments</span>
            결제하기
          </button>
        </div>
        {/* Bottom Cancellation */}
        <div className="py-stack-lg flex justify-center">
          <button className="px-6 py-2 text-label-md font-label-md text-on-surface-variant border-b border-outline-variant hover:text-error transition-colors">
            예약 취소·변경
          </button>
        </div>
      </main>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface dark:bg-inverse-surface shadow-[0px_-4px_12px_rgba(0,107,95,0.04)] rounded-t-xl border-t border-outline-variant/30">
        <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors py-1">
          <span className="material-symbols-outlined mb-1" data-icon="home">home</span>
          <span className="text-label-md font-label-md">홈</span>
        </button>
        <button className="flex flex-col items-center justify-center text-primary dark:text-primary-fixed font-bold bg-primary-container/20 rounded-xl px-4 py-1 active:scale-[0.98] transition-all duration-200">
          <span className="material-symbols-outlined mb-1" data-icon="calendar_today" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
          <span className="text-label-md font-label-md">예약</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors py-1">
          <span className="material-symbols-outlined mb-1" data-icon="description">description</span>
          <span className="text-label-md font-label-md">처방전</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors py-1">
          <span className="material-symbols-outlined mb-1" data-icon="person">person</span>
          <span className="text-label-md font-label-md">마이</span>
        </button>
      </nav>
    </div>
  )
}
