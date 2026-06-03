"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { previewPath } from "@/lib/preview/routes"

export default function DigitalPrescriptionPharmacySelectPage() {
  const router = useRouter()
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null)
  const [pharmacies, setPharmacies] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/preview/pharmacies")
      .then((res) => res.json())
      .then((data) => {
        const list = data.pharmacies ?? []
        setPharmacies(list)
        setSelectedPharmacy((prev) => prev ?? list[0]?.id ?? null)
      })
      .catch(() => {})
  }, [])

  const handleSend = async () => {
    try {
      await fetch("/api/preview/prescriptions/rx-001/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pharmacyId: selectedPharmacy }),
      })
    } catch {}
    router.push(previewPath("dispensing-progress"))
  }

  return (
    <div className="stitch-theme bg-background text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface dark:bg-inverse-surface shadow-[0px_4px_12px_rgba(0,107,95,0.04)] flex justify-between items-center px-container-margin py-stack-sm h-16">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-surface-variant/50 transition-all active:scale-[0.98]"
            aria-label="뒤로"
          >
            <span className="material-symbols-outlined text-primary" data-icon="arrow_back">
              arrow_back
            </span>
          </button>
          <img
            alt="날씨닥터 로고"
            className="h-8 w-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnrYtr2olo9-k5Ym9q9WOyzK69BhMaox2Z1FM5agVveGsG1M672LRcabh3e-C2ShH1eSoKYYGhQ2w2Nd9khieLltlKCVOElmF7OnF1zG7utvF8W0rO-c9CocgrKvSV56qFecYXKCmcfsUgn0ahQWPIBGggqZNjI3Avenn4NvjSBvLOIEPGAGH9OHhWkWxUS5dy5bfDI-8xWlEnG4tjGwatO6oN_eh9YEc4VhU9McV6eTmECM-vHTzYtHVE51OUdfuign7D9c4CYGhc"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-primary" data-icon="notifications">
              notifications
            </span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border border-outline-variant/30">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              data-alt="A clean, professional portrait of a modern healthcare user, styled in high-key lighting with a minimalist background. The photography is crisp and bright, aligning with a premium healthcare app aesthetic, using soft teal and neutral white tones for a calm and trustworthy mood."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA58eIQRR3tnZjoYSe5VhrSOxk5Yj69rdhnCb5fFpora5FC8HTH0wN6z5Ugow_soNCA4NoKET9nuUObjy5QE6ZfgA0Z79KLSaIMuSwOsAYqVaYOW8zQILSM2dfj5AdPM-E5y2EOEDUa0pYsEaxg477YZ4bdEKN7JDAUXRaPr3IeBV5xadJGdcrOtyE19G-rKW-tv44VXGeqCCG61W9CxjH0lr4ryGpKTQCZgwI5ddGBLuKvWGegnhui2hCJw50F84wByabpivjP6P8I"
            />
          </div>
        </div>
      </header>

      <main className="pt-20 px-container-margin space-y-stack-lg">
        {/* Prescription Section */}
        <section className="space-y-stack-md">
          <div className="flex justify-between items-end">
            <h2 className="text-headline-sm font-headline-sm text-on-surface">디지털 처방전</h2>
            <span className="text-label-md font-label-md text-primary">No. 20240612-0042</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-[0px_4px_12px_rgba(0,107,95,0.04)] border border-outline-variant/20">
            <div className="space-y-unit mb-stack-md">
              <div className="flex justify-between items-center">
                <span className="text-label-md font-label-md text-on-surface-variant">발급 의원</span>
                <span className="text-body-md font-bold text-on-surface">서울 연세 가가 클리닉</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label-md font-label-md text-on-surface-variant">발급일</span>
                <span className="text-body-sm font-body-sm text-on-surface-variant">2024.06.12</span>
              </div>
            </div>
            <div className="border-t border-outline-variant/20 pt-stack-md">
              <div className="bg-surface-container-low rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high/50">
                    <tr>
                      <th className="px-3 py-2 text-label-md font-label-md text-on-surface-variant">약품명</th>
                      <th className="px-3 py-2 text-label-md font-label-md text-on-surface-variant text-right">용량/기간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <tr>
                      <td className="px-3 py-3 text-body-sm font-body-sm text-on-surface">리피토정 10mg</td>
                      <td className="px-3 py-3 text-body-sm font-body-sm text-on-surface text-right">30일분</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 text-body-sm font-body-sm text-on-surface">노바스크정 5mg</td>
                      <td className="px-3 py-3 text-body-sm font-body-sm text-on-surface text-right">30일분</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-primary/60">
              <span className="material-symbols-outlined text-[18px]" data-icon="verified_user">
                verified_user
              </span>
              <span className="text-label-md font-label-md">건강보험심사평가원 인증됨</span>
            </div>
          </div>
        </section>

        {/* Pharmacy Selection Section */}
        <section className="space-y-stack-md">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">약국 선택</h2>
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined" data-icon="search">
                search
              </span>
            </div>
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-body-md focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
              placeholder="주변 약국 검색 또는 주소 입력"
              type="text"
            />
          </div>
          {/* Pharmacy List */}
          <div className="grid gap-gutter">
            {pharmacies.map((p) => {
              const isSelected = selectedPharmacy === p.id
              return (
                <div
                  key={p.id}
                  className={`pharmacy-card group cursor-pointer bg-surface-container-lowest p-stack-md rounded-xl border-2 shadow-[0px_4px_12px_rgba(0,107,95,0.04)] transition-all hover:shadow-md relative overflow-hidden ${
                    isSelected ? "border-primary ring-4 ring-primary/5" : "border-transparent"
                  }`}
                  id={p.id}
                  onClick={() => setSelectedPharmacy(p.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-body-lg font-bold text-on-surface">{p.name}</h3>
                        {p.open && (
                          <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary rounded-full text-[10px] font-bold flex items-center gap-1">
                            <span
                              className="material-symbols-outlined text-[12px]"
                              data-icon="check_circle"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                            재고 확인됨
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-label-md font-label-md px-1.5 rounded ${
                            p.open
                              ? "text-primary bg-primary/5"
                              : "text-on-surface-variant bg-surface-variant"
                          }`}
                        >
                          {p.distanceKm}km
                        </span>
                        <span className="text-body-sm text-on-surface-variant">{p.address}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-label-md font-label-md ${
                          p.open ? "text-tertiary" : "text-on-surface-variant"
                        }`}
                      >
                        {p.openHours}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-surface-variant rounded text-[11px] text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]" data-icon="star">
                        star
                      </span>
                      {p.rating}
                    </span>
                    <span className="px-2 py-1 bg-surface-variant rounded text-[11px] text-on-surface-variant">
                      조제 {p.prepTimeMin}분
                    </span>
                    <span className="px-2 py-1 bg-surface-variant rounded text-[11px] text-on-surface-variant">
                      {p.phone}
                    </span>
                  </div>
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-primary animate-slide-up">
                      <span
                        className="material-symbols-outlined text-[24px]"
                        data-icon="check_circle"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* Fixed Bottom CTA (Appears when pharmacy selected) */}
      <div
        className={`fixed bottom-20 left-0 w-full px-container-margin z-40 transition-transform duration-300 ${
          selectedPharmacy ? "translate-y-0" : "translate-y-[200%]"
        }`}
        id="cta-container"
      >
        <button
          onClick={handleSend}
          className="w-full bg-secondary-container text-on-error py-4 rounded-2xl shadow-xl font-bold text-body-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>이 약국으로 처방 전송</span>
          <span className="material-symbols-outlined" data-icon="send">
            send
          </span>
        </button>
      </div>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface dark:bg-inverse-surface border-t border-outline-variant/30 rounded-t-xl shadow-[0px_-4px_12px_rgba(0,107,95,0.04)]">
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined" data-icon="home">
            home
          </span>
          <span className="text-label-md font-label-md mt-1">홈</span>
        </a>
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined" data-icon="calendar_today">
            calendar_today
          </span>
          <span className="text-label-md font-label-md mt-1">예약</span>
        </a>
        <a
          className="flex flex-col items-center justify-center text-primary dark:text-primary-fixed font-bold bg-primary-container/20 rounded-xl px-4 py-1 active:scale-[0.98] transition-all duration-200"
          href="#"
        >
          <span
            className="material-symbols-outlined"
            data-icon="description"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            description
          </span>
          <span className="text-label-md font-label-md mt-1">처방전</span>
        </a>
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined" data-icon="person">
            person
          </span>
          <span className="text-label-md font-label-md mt-1">마이</span>
        </a>
      </nav>
    </div>
  )
}
