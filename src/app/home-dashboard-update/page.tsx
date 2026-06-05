"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { previewPath, nextPreviewPath, BOTTOM_NAV } from "@/lib/preview/routes"

export default function HomeDashboardUpdatePage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/preview/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [])

  return (
    <div className="stitch-theme text-on-surface antialiased pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-margin py-stack-sm bg-surface dark:bg-inverse-surface shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
        <div className="flex items-center gap-2">
          <img
            alt="날씬닥터 로고"
            className="h-10 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaBbVnABeI97TEs3WQYIajGt3W_ZWRtT-9OQOXnICbiS0-F3VebHSuleru-s0_rsYoO3qMOrCJ_wqz_qMig9_tHPXXFgaIDYYd89O3TVsdknwhMCCJPf6L8gfdXaSvQnQLh9-TZT0WsNxbwBJ2_la6e9g7VHC0Z42XlvUrMc85KOPFqyHey525WcXlSR369l0EpYfJhST1SmqhCdCxSEgZS_PAiJi-lDNBCxMnzF0T9tyXPHRDAiYWudikF7KzzvTvwFhByrmKjYfA"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all duration-200 active:scale-[0.98]">
            <span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border-2 border-surface shadow-sm overflow-hidden">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src={data?.user?.avatar ?? "https://lh3.googleusercontent.com/aida-public/AB6AXuBVpoiseFYohxBopFphsmItQ2QKECFRG7RAOIXiz5NFgv4Su_GDQCV-QMNqSu-qf95Z82Y5PmXFSzS6EjfyNjoluPp7F8INY4gDYTlI8c1w2YlShc8GFkJSFvkKna8J80jO3eoEa8km_EK--V-2CEn_6LXxK-HYKzKLvT2aTvrbJSyQc7LPaJyjyWjiPdqyvy4RGMC1ymtl_9rX6csPFltDJAnRU9rp_GjmCC1OUgrffpY_q20Bo83Yc2bI3pOwoYf1ybVpF1tHkGuS"}
            />
          </div>
        </div>
      </header>

      <main className="mt-20 px-container-margin space-y-6">
        {/* Welcome Message */}
        <section className="py-2">
          <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
            {data?.user?.name ?? "김민수"}님, <br />
            <span className="text-primary font-bold">오늘도 건강하게</span>
          </h2>
        </section>

        {/* Status Summary Card */}
        <section>
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0px_4px_12px_rgba(0,107,95,0.06)] border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <div>
                <p className="text-body-md font-bold text-on-surface">{data?.nextAppointment?.clinicName ?? "강남365의원"} 예약 확정</p>
                <p className="text-label-md text-on-surface-variant">
                  {data?.nextAppointment ? `${data.nextAppointment.date} ${data.nextAppointment.time}` : "6월 10일 14:00"}
                </p>
              </div>
            </div>
            {/* Progress Timeline */}
            <div className="relative flex justify-between items-center px-1">
              <div className="absolute top-[18px] left-0 w-full h-0.5 bg-surface-container-high -z-10"></div>
              <div className="absolute top-[18px] left-0 w-0 h-0.5 bg-primary -z-10 transition-all duration-700" style={{ width: "10%" }}></div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center border-4 border-surface shadow-sm">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                </div>
                <span className="text-[11px] font-bold text-primary">예약</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant/40 flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-[18px]">person_pin_circle</span>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant/60">방문</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant/40 flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant/60">처방</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant/40 flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-[18px]">medication</span>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant/60">조제</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant/40 flex items-center justify-center border-4 border-surface">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant/60">수령</span>
              </div>
            </div>
          </div>
        </section>

        {/* Health Summary */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-outline-variant/10 text-center">
              <p className="text-label-md text-on-surface-variant">현재 체중</p>
              <p className="text-body-lg font-bold text-on-surface">{data?.healthSummary?.weightKg ?? 78.4}kg</p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-outline-variant/10 text-center">
              <p className="text-label-md text-on-surface-variant">변화</p>
              <p className="text-body-lg font-bold text-primary">{data?.healthSummary?.weightChangeKg ?? -2.1}kg</p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-outline-variant/10 text-center">
              <p className="text-label-md text-on-surface-variant">연속</p>
              <p className="text-body-lg font-bold text-on-surface">{data?.healthSummary?.streakDays ?? 14}일</p>
            </div>
          </div>
        </section>

        {/* Main CTA Button */}
        <section>
          <button
            onClick={() => router.push(previewPath("clinic-search-list"))}
            className="w-full bg-brand-coral hover:opacity-90 text-white font-bold py-4 px-6 rounded-2xl shadow-[0px_8px_16px_rgba(255,122,89,0.24)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">search</span>
            <span className="text-body-lg font-bold">의원 찾고 예약하기</span>
          </button>
        </section>

        {/* Quick Links (Bento - Compacted) */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/10 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 bg-secondary-fixed rounded-xl flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-secondary">description</span>
            </div>
            <p className="text-body-md font-bold">{data?.activePrescription?.prescriptionNumber ? `처방전 ${data.activePrescription.prescriptionNumber}` : "처방전 관리"}</p>
            <p className="text-label-md text-on-surface-variant">{data?.dispensing?.currentStep?.label ?? "내역 확인"}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/10 active:scale-[0.98] transition-all">
            <div className="w-10 h-10 bg-tertiary-fixed rounded-xl flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-tertiary">edit_note</span>
            </div>
            <p className="text-body-md font-bold">다이어트 기록</p>
            <p className="text-label-md text-on-surface-variant">식단과 운동</p>
          </div>
        </section>

        {/* Recommended Clinics */}
        <section className="pb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-headline-sm font-headline-sm">추천 의원</h3>
            <button className="text-primary text-label-md font-bold">전체보기</button>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-container-margin px-container-margin">
            {/* Clinic Card 1 */}
            <Link href={previewPath("clinic-detail-booking")} className="min-w-[180px] bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 flex-shrink-0">
              <div className="h-28 w-full bg-surface-container relative">
                <img
                  alt="연세 가가 클리닉"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmgkQ0ijpdklvGvaOFwwMQbj43fAEp7O5x4PdmiHd4yp5oByTCDqLds7UGwRlNTsnhs8AZYZOxJtHPUae02sbdNbq9_z4yZB7xQKa-BN5OU_KhfaMCmNnAKyd0KbqUgOgOqLjfCxRL5FzCHPkEjHz1yR4gYiwHV8wfluhGeCrJnba1-y4-T_oY9WAzdnkU0XJGKGCyu_WDzWKaMyWsaK6atjRIB85FGDWawQnIYP3rxvxWdEUKemAB_6pXU09d0buImWYTwp2fhyfw"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[11px] font-bold">4.8</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-body-sm font-bold text-on-surface truncate">서울 연세 가가 클리닉</p>
                <p className="text-label-md text-on-surface-variant">비대면 전문 · 강남구</p>
              </div>
            </Link>
            {/* Clinic Card 2 */}
            <Link href={previewPath("clinic-detail-booking")} className="min-w-[180px] bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 flex-shrink-0">
              <div className="h-28 w-full bg-surface-container relative">
                <img
                  alt="미래 내과"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbGldt9_OTTSBTxxajDGAd5j4X6sgNwcY3SHozDmKmxjRan05P-WCusQXAI4mcWnf7oje1SJ58BMnnFIzp_gALt4QwonKi8LWErjfQjrxmUWChPFUEg45iO2Ny-OtBVn1RSq0uh6SlvZsmHMokIawZsZat-89qAYIbJHn853Au2EaXmwvIJCyhlTgBOzFM6her2PneScdHkXMXj7r3lF32MtfISgdPQctzBb7E4UMQJQb44FBiiqke9wmDtqmfyAHp1AiKoFW2JoZY"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[11px] font-bold">4.9</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-body-sm font-bold text-on-surface truncate">스마트 다이어트 의원</p>
                <p className="text-label-md text-on-surface-variant">야간 진료 · 서초구</p>
              </div>
            </Link>
            {/* Clinic Card 3 */}
            <Link href={previewPath("clinic-detail-booking")} className="min-w-[180px] bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 flex-shrink-0">
              <div className="h-28 w-full bg-surface-container relative">
                <img
                  alt="정다운 병원"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi4TPWvmIMSxo2SFsJE2C5pfGZIWZxfsqxvVw9AjngxN6xad7NFJS0U1If2MW95DGanRjkZVsFlAWrqtkPt3xE90nwQ8pXOkwugrDK3mRqHOOAxPhcz_LVRrDwnqVWsJvaXu4mMuEFS2-MtUUAiooBjKSWt0bpi9Ej2DNRDMZVlFk-wX8N_ExW30Gnp6xtGlN4Czj-bDTy2s-r5OZes1E_UReGesccrk8B8smSt9bHKTcxb-JuvI4jRR9L3QcY3XiJIF08GuOIdQY0"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[11px] font-bold">4.7</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-body-sm font-bold text-on-surface truncate">바른몸 한의원</p>
                <p className="text-label-md text-on-surface-variant">체질 개선 · 송파구</p>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface dark:bg-inverse-surface rounded-t-2xl shadow-[0px_-4px_12px_rgba(0,107,95,0.04)] border-t border-outline-variant/30">
        {/* 홈 (Active) */}
        <Link className="flex flex-col items-center justify-center text-primary dark:text-primary-fixed font-bold bg-primary-container/10 rounded-xl px-4 py-1 active:scale-[0.98] transition-all duration-200" href={previewPath("home-dashboard")}>
          <span className="material-symbols-outlined" data-icon="home" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-label-md font-label-md">홈</span>
        </Link>
        {/* 예약 */}
        <Link className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors active:scale-[0.98]" href={previewPath("clinic-search-list")}>
          <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
          <span className="text-label-md font-label-md">예약</span>
        </Link>
        {/* 처방전 */}
        <Link className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors active:scale-[0.98]" href={previewPath("prescription-pharmacy-send")}>
          <span className="material-symbols-outlined" data-icon="description">description</span>
          <span className="text-label-md font-label-md">처방전</span>
        </Link>
        {/* 마이 */}
        <Link className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors active:scale-[0.98]" href={previewPath("payment-mypage")}>
          <span className="material-symbols-outlined" data-icon="person">person</span>
          <span className="text-label-md font-label-md">마이</span>
        </Link>
      </nav>

      {/* FAB for New Record */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-secondary-container text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all duration-200 z-40">
        <span className="material-symbols-outlined text-[32px]" data-icon="add">add</span>
      </button>
    </div>
  )
}
