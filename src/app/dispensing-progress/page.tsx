"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { previewPath } from "@/lib/preview/routes"

export default function DispensingProgressPage() {
  const router = useRouter()
  const [toastClosed, setToastClosed] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/preview/dispensing/rx-001")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Micro-interaction: Simulate status update after 3 seconds
    const timer = setTimeout(() => {
      setBannerVisible(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="stitch-theme bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Toast Notification */}
      <div
        className={
          "fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-40px)] max-w-md transition-all duration-500 ease-out transform " +
          (toastClosed ? "opacity-0 -translate-y-4" : "translate-y-0 opacity-100")
        }
      >
        <div className="bg-primary text-on-primary px-5 py-4 rounded-xl shadow-[0_8px_24px_rgba(0,96,86,0.15)] flex items-center gap-3">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
            info
          </span>
          <p className="font-label-md text-label-md flex-1">조제가 완료되었어요! 지금 결제하고 방문하세요.</p>
          <button className="text-on-primary/60 hover:text-on-primary" onClick={() => setToastClosed(true)}>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* TopAppBar */}
      <header className="bg-surface dark:bg-surface-dim docked full-width top-0 z-50">
        <div className="flex justify-between items-center w-full px-container-margin h-16">
          <button
            onClick={() => router.back()}
            className="text-primary dark:text-primary-fixed hover:opacity-80 transition-opacity Active: scale-95 duration-100"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed">날씬닥터</h1>
          <button className="text-primary dark:text-primary-fixed hover:opacity-80 transition-opacity Active: scale-95 duration-100">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 px-container-margin py-stack-lg space-y-stack-lg pb-32">
        {/* Vertical Timeline Card */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_12px_rgba(0,107,95,0.04)] relative">
          <h2 className="font-headline-sm text-headline-sm mb-6 text-on-surface">조제 현황</h2>
          <div className="relative flex flex-col gap-8">
            <div className="timeline-line"></div>
            {data?.steps?.map((s: any) => (
              <div
                key={s.key}
                className={
                  "flex items-center gap-4 relative z-10" + (!s.done && !s.current ? " opacity-40" : "")
                }
              >
                {s.done ? (
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                ) : s.current ? (
                  <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-primary-container pulse-ring"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-on-primary-container relative z-10"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-outline-variant flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
                <div className="flex flex-col">
                  {s.current ? (
                    <span className="text-primary font-headline-sm text-headline-sm">{s.label}</span>
                  ) : (
                    <span className="text-on-surface-variant font-label-md text-label-md">{s.label}</span>
                  )}
                  {s.at && <span className="text-outline text-xs">{s.at}</span>}
                  {s.current && (
                    <span className="text-primary-container text-xs font-medium">
                      예상 완료까지 {(data?.estimatedReadyMin ?? 8) + "분"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pharmacy Info Card */}
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_12px_rgba(0,107,95,0.04)] flex flex-col gap-stack-md">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-primary font-label-md text-label-md tracking-wider">방문 약국 정보</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">{data?.pharmacy?.name ?? "메디컬정문약국"}</h3>
            </div>
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high shrink-0">
              <img
                alt="Pharmacy exterior"
                className="w-full h-full object-cover"
                data-alt="A professional and modern pharmacy storefront in Seoul, featuring clean glass windows, a soft green medical cross sign, and warm interior lighting. The aesthetic is clinical yet welcoming, with white shelves organized neatly. The photography is high-end, utilizing a shallow depth of field to emphasize the entrance."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRCFRBHtT1qNrNNj5s3YegpqbrTUobCcN6e3UpJbbWF52rJsxjQMG6wFFNE-7dcQeWkKyDnRU5GnELH8Mo2XUmyeenawakeqGjR8EbXgr9Ieh9KVGilLGA4XAqcfgmomexvRWQKcUBOcgQH9geK8KQ6dpBCIf68e34AvmCfJc2W-Ic5ugg7ZnDFhrqcroK1vuamtkOowzz7pV272W8TtVLItf1rfd85x-10Ez3_sCISS8Kq5RGtAla1vAA2CUP5ur7nbRGHrbrDqNS"
              />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px] text-outline">location_on</span>
              <span className="text-body-md font-body-md">서울 중구 남대문로 84</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px] text-outline">call</span>
              <span className="text-body-md font-body-md">02-123-4567</span>
            </div>
          </div>
          <div className="pt-2">
            <button className="w-full border border-primary text-primary font-label-md text-label-md py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined text-[18px]">directions</span>
              길찾기
            </button>
          </div>
        </section>

        {/* Completion Banner (Conditional Simulation) */}
        {bannerVisible && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-primary-container/20 border border-primary-container/30 rounded-xl p-5 flex items-center gap-4">
              <div className="bg-primary-container p-2 rounded-full">
                <span className="material-symbols-outlined text-on-primary-container">celebration</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-primary-fixed-variant">조제가 완료되었습니다!</h4>
                <p className="text-body-sm font-body-sm text-on-primary-fixed-variant/80 leading-relaxed">
                  결제를 완료하시면 대기 없이 바로 약을 수령하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Fixed CTA */}
      <div className="fixed bottom-[88px] left-0 w-full px-container-margin z-40">
        <button
          onClick={() => router.push(previewPath("medication-pickup"))}
          className="w-full bg-[#FF7A59] text-white font-headline-sm text-headline-sm py-5 rounded-xl shadow-[0_8px_20px_rgba(255,122,89,0.25)] hover:scale-[1.02] active:scale-95 transition-all"
        >
          결제하기
        </button>
      </div>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white dark:bg-surface-container-lowest rounded-t-xl shadow-[0_-4px_12px_rgba(0,107,95,0.04)] dark:shadow-none">
        {/* Home */}
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant px-3 py-1 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-transform duration-200"
          href="#"
        >
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-label-md font-label-md mt-1">홈</span>
        </a>
        {/* Clinics */}
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant px-3 py-1 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-transform duration-200"
          href="#"
        >
          <span className="material-symbols-outlined">local_hospital</span>
          <span className="text-label-md font-label-md mt-1">의원</span>
        </a>
        {/* Prescriptions (Active) */}
        <a
          className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-xl px-3 py-1 scale-98 transition-transform duration-200"
          href="#"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            description
          </span>
          <span className="text-label-md font-label-md mt-1">처방전</span>
        </a>
        {/* Pharmacy */}
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant px-3 py-1 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-transform duration-200"
          href="#"
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-label-md font-label-md mt-1">약국</span>
        </a>
      </nav>
    </div>
  )
}
