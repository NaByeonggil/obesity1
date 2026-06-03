"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { previewPath, BOTTOM_NAV } from "@/lib/preview/routes"

export default function PrescriptionPharmacySendPage() {
  const router = useRouter()
  const [selected, setSelected] = useState(0)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/preview/prescriptions/rx-001")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [])

  const rx = data?.prescription

  const issuedDate = rx?.issuedAt
    ? new Date(rx.issuedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    : "2024. 05. 22"

  const pharmacies = [
    {
      tag: "단골약국",
      name: "서울봄약국",
      address: "강남구 테헤란로 123 (240m)",
      timer: "5분 내 조제 가능",
      timerClass: "text-tertiary",
      close: "오후 9시 마감",
    },
    {
      tag: null,
      name: "메디컬정문약국",
      address: "강남구 테헤란로 145 (410m)",
      timer: "대기 10분 이상",
      timerClass: "text-on-surface-variant",
      close: "오후 7시 마감",
    },
  ]

  return (
    <div className="stitch-theme font-body-md text-on-surface">
      {/* Top App Bar (Shared Component Strategy) */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-margin py-stack-sm bg-surface shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
        <div className="flex items-center gap-3">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiqAfQQPYTJXxLE1TTUAM52jVLHJC0v4ijtGTZao6RAp8tGNWo_qJtlqN-Dz98SoKyXQzvs3-ocYqQg1y72ZVZQz7A0gHXqK35qfZYstjiWAXwfrUMrZs7YobWR_5DkKQA4J4kpb3CgAh_uHiDl6jXsDZypvSwdNhaA6HllFU_jwAa2j2cS_mXM7al4Ldg69r7AvYxWMzIZpeJ17cK3Tdf25dwyPwWQJon7piuRmq7LU9Sghxc0pUaKzA4TVXzoJ7QCjtIpLhSPZgP"
            alt="’‘’‘’‘’‘’‘’‘’‘’‘’‘’‘ ’‘’‘’‘"
            className="h-10 w-auto object-contain"
          />
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
        </button>
      </header>
      <main className="pt-24 pb-32 px-container-margin max-w-md mx-auto space-y-6">
        {/* Transfer Progress Stepper */}
        <section className="bg-surface-container-lowest p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,107,95,0.04)] relative overflow-hidden">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6">진행 상황</h2>
          <div className="relative flex justify-between">
            {/* Track */}
            <div className="stepper-line bg-surface-variant"></div>
            <div className="stepper-line bg-primary w-[66%]" style={{ transition: "width 1s ease-in-out" }}></div>
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
              <span className="text-label-md font-label-md text-primary">진료 완료</span>
            </div>
            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
              <span className="text-label-md font-label-md text-primary">처방전 발행</span>
            </div>
            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary border-4 border-primary-fixed-dim animate-pulse"></div>
              <span className="text-label-md font-label-md text-primary">약국 전송 중</span>
            </div>
            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface-variant border-2 border-outline-variant"></div>
              <span className="text-label-md font-label-md text-on-surface-variant">조제 완료</span>
            </div>
          </div>
        </section>
        {/* Digital Prescription View */}
        <article className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,107,95,0.04)] overflow-hidden">
          <div className="bg-primary-container/10 px-5 py-4 flex justify-between items-center border-b border-outline-variant/20">
            <div>
              <p className="text-label-md font-label-md text-primary">전자처방전 No. {rx?.prescriptionNumber ?? "2024-0522"}</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant">{issuedDate} 발행</p>
            </div>
            <span className="material-symbols-outlined text-primary" data-icon="description">description</span>
          </div>
          <div className="p-5 space-y-4">
            {(rx?.medications ?? [
              { name: "리피토정 10mg", dosage: "1정", frequency: "1일 1회 (식후 30분)", durationDays: 30 },
              { name: "노바스크정 5mg", dosage: "1정", frequency: "1일 1회 (아침 식사 전)", durationDays: 30 },
            ]).map((m: any, index: number) => (
              <div key={m.name + index} className="flex items-start gap-4 p-4 bg-surface rounded-lg">
                <div className="bg-primary-fixed-dim p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary" data-icon="medication">medication</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{m.name}</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">{m.dosage}, {m.frequency}, {m.durationDays}일분</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-dashed border-outline-variant/50">
              <div className="flex justify-between items-center py-1">
                <span className="text-body-md font-body-md text-on-surface-variant">조제 담당의</span>
                <span className="text-body-md font-body-md font-bold text-on-surface">{rx?.doctorName ?? "김닥터 원장"}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-body-md font-body-md text-on-surface-variant">의료기관</span>
                <span className="text-body-md font-body-md font-bold text-on-surface">{rx?.clinicName ?? "날씬내과의원"}</span>
              </div>
            </div>
          </div>
        </article>
        {/* Pharmacy Selection Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">약국 전송하기</h2>
            <button className="text-label-md font-label-md text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]" data-icon="map">map</span>
              지도에서 보기
            </button>
          </div>
          {/* Pharmacy Cards Grid */}
          <div className="grid grid-cols-1 gap-3">
            {pharmacies.map((p, i) => {
              const isSelected = selected === i
              return (
                <div
                  key={i}
                  onClick={() => setSelected(i)}
                  className={
                    isSelected
                      ? "bg-white p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,107,95,0.04)] border-2 border-primary relative cursor-pointer active:scale-[0.98] transition-all"
                      : "bg-white p-5 rounded-xl shadow-[0px_4px_12px_rgba(0,107,95,0.04)] border border-outline-variant/30 cursor-pointer active:scale-[0.98] transition-all hover:bg-surface-variant/10"
                  }
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    {p.tag ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary-container text-white text-[10px] font-bold rounded-full">{p.tag}</span>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface">{p.name}</h4>
                      </div>
                    ) : (
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">{p.name}</h4>
                    )}
                    <p className="text-body-sm font-body-sm text-on-surface-variant">{p.address}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-label-md font-label-md ${p.timerClass} flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        {p.timer}
                      </span>
                      <span className="text-label-md font-label-md text-on-surface-variant">{p.close}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        {/* CTA Button */}
        <div className="fixed bottom-24 left-0 right-0 px-container-margin z-40 max-w-md mx-auto">
          <button
            onClick={() => router.push(previewPath("digital-prescription-pharmacy-select"))}
            className="w-full h-14 bg-secondary-container text-white font-headline-sm rounded-xl shadow-lg active:scale-[0.96] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" data-icon="send">send</span>
            약국으로 처방전 전송
          </button>
        </div>
        <div className="h-10"></div> {/* Bottom Spacer */}
      </main>
      {/* Bottom Nav Bar (Shared Component Strategy) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface dark:bg-inverse-surface rounded-t-xl shadow-[0px_-4px_12px_rgba(0,107,95,0.04)] border-t border-outline-variant/30">
        {BOTTOM_NAV.map((item) => {
          const isActive = item.slug === "prescription-pharmacy-send"
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
