"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { previewPath, BOTTOM_NAV } from "@/lib/preview/routes"

export default function ClinicSearchListPage() {
  const filters = ["거리순", "오늘 예약가능", "비대면 상담", "GLP-1 전문"]
  const [activeFilter, setActiveFilter] = useState(0)
  const [clinics, setClinics] = useState<any[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    let active = true
    fetch("/api/preview/clinics?q=" + encodeURIComponent(query))
      .then((res) => res.json())
      .then((data) => {
        if (active) setClinics(data.clinics ?? [])
      })
      .catch(() => {
        if (active) setClinics([])
      })
    return () => {
      active = false
    }
  }, [query])

  return (
    <div className="stitch-theme font-body-md text-on-surface select-none">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface shadow-[0px_4px_12px_rgba(0,107,95,0.04)] flex justify-between items-center px-container-margin py-stack-sm h-[64px]">
        <div className="flex items-center gap-stack-sm">
          <img
            alt="날씬닥터 로고"
            className="h-8 w-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzeRC_alV8BRDTZq8bVW713sfYrqgZpB5ctdnYAHfHzEE9cP-Fer88-hAPGegO-T3rgye6smcEqxyke0kd-qf1CgDoYymMR2JRm-QoKiLtMUD0nTgKTP5ASb-VdCLmMX1zTLPo8D4ENK0OrWGK-656bJaRTQ3ZXH89wuTWyHw4a2CNQA-lAtwpeQDMybzAqVWloBdxlr0BcCRc4ZStTflaVZzPQzJo_a9yM2kL0V_W6K7HLgZK2hBNjfe98pyIk_xNZKG4UTgIF8Jb"
          />
        </div>
        <div className="flex items-center gap-stack-md">
          <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
            <img
              className="w-full h-full object-cover"
              data-alt="A professional female healthcare provider smiling in a clean, high-end medical clinic setting. The lighting is bright and natural, reflecting a premium and trustworthy healthcare environment. The overall aesthetic is minimalist and modern, with soft teal accents consistent with the medical brand identity."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHr1Sc7qPSD2N_Qh1GCSyiRwtVbLo-jE4XYOwcLsd9TM9UzpcPM5pobezkljE6s9zm_AS_5Ov8i51OUE43lLaEh2jz5KlFRyA9i4OBT4zEGK1iY8tXpQJdET5jyJz0DwqOp_UI_WJUv01Ny9Fi308PdaOpf_wOoiE76TajQg8VDiayylJUZUvG4LsAEueiIsY0fbeuUP1YJJHKUQM9T_lQhlvjk_xu06EnwLQHBdpii1yYG55QDb8vn8Jl1iUXb5M3N0eHyz-bcnxU"
            />
          </div>
        </div>
      </header>
      <main className="pt-[80px] pb-[100px] px-container-margin">
        {/* Search & Map Toggle Container */}
        <div className="flex items-center gap-gutter mb-stack-lg">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
            <input
              className="w-full bg-[#EDF0EF] border-none rounded-2xl py-3.5 pl-12 pr-4 text-body-md focus:ring-2 focus:ring-primary-container/30 transition-all outline-none placeholder:text-outline-variant"
              placeholder="지역·의원명 검색"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1 bg-surface-container-highest px-4 py-3.5 rounded-2xl card-shadow hover:bg-surface-variant transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-primary text-[20px]" data-icon="map">map</span>
            <span className="text-label-md font-label-md text-primary whitespace-nowrap">지도보기</span>
          </button>
        </div>
        {/* Filter Chips */}
        <div className="flex items-center gap-stack-sm overflow-x-auto no-scrollbar pb-stack-md -mx-container-margin px-container-margin">
          {filters.map((label, i) =>
            i === 0 ? (
              <button
                key={label}
                onClick={() => setActiveFilter(i)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-label-md font-label-md active:scale-95 transition-all ${
                  activeFilter === i
                    ? "bg-primary text-white"
                    : "bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant/50"
                }`}
              >
                <span>{label}</span>
                <span className="material-symbols-outlined text-[16px]" data-icon="expand_more">expand_more</span>
              </button>
            ) : (
              <button
                key={label}
                onClick={() => setActiveFilter(i)}
                className={`px-4 py-2 rounded-full text-label-md font-label-md whitespace-nowrap active:scale-95 transition-all ${
                  activeFilter === i
                    ? "bg-primary text-white"
                    : "bg-surface-container text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant/50"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
        {/* Clinic List Title */}
        <div className="flex items-center justify-between mb-stack-md mt-stack-sm">
          <h2 className="text-headline-sm-mobile font-headline-sm-mobile text-on-surface">내 주변 진료기관</h2>
          <span className="text-label-md font-label-md text-outline">총 42개</span>
        </div>
        {/* Clinic Cards List */}
        <div className="space-y-gutter">
          {clinics.map((c) => (
            <Link
              key={c.id}
              href={previewPath("clinic-detail-booking")}
              className="block bg-surface-container-lowest rounded-2xl p-stack-lg card-shadow border border-outline-variant/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-stack-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-tertiary-container/10 text-tertiary px-2 py-0.5 rounded text-[10px] font-bold">예약 가능</span>
                    <h3 className="text-body-lg font-bold text-on-surface">{c.name}</h3>
                  </div>
                  <div className="flex items-center gap-stack-sm text-label-md font-label-md text-outline">
                    <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px] fill-icon text-[#FFB400]" data-icon="star" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {c.rating} ({c.reviewCount})</span>
                    <span className="w-[1px] h-3 bg-outline-variant"></span>
                    <span>{c.distanceKm}km</span>
                    <span className="w-[1px] h-3 bg-outline-variant"></span>
                    <span>{c.address}</span>
                  </div>
                  <div className="flex items-center gap-stack-sm text-label-md font-label-md text-outline mt-1">
                    <span>{c.department}</span>
                    <span className="w-[1px] h-3 bg-outline-variant"></span>
                    <span>{c.doctorName}</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                  <img
                    className="w-full h-full object-cover"
                    src={c.imageUrl}
                    alt={c.name}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-stack-md">
                {(c.tags ?? []).map((tag: string) => (
                  <span key={tag} className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-lg text-label-md font-label-md">{tag}</span>
                ))}
              </div>
              <div className="mt-stack-lg pt-stack-md border-t border-outline-variant/30 flex items-center justify-between">
                <p className="text-body-sm text-on-surface-variant">{c.openHours} · <span className="font-bold text-primary">{c.fee.toLocaleString()}원</span></p>
                <button className="bg-primary-container text-white px-5 py-2 rounded-xl text-label-md font-bold shadow-sm active:scale-95 transition-all">
                  예약하기
                </button>
              </div>
            </Link>
          ))}
        </div>
      </main>
      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-[24px] pt-2 bg-surface rounded-t-2xl shadow-[0px_-4px_12px_rgba(0,107,95,0.04)] border-t border-outline-variant/10">
        {BOTTOM_NAV.map((item) => {
          const active = item.slug === "clinic-search-list"
          return (
            <Link
              key={item.key}
              href={previewPath(item.slug)}
              className={
                active
                  ? "flex flex-col items-center justify-center text-primary dark:text-primary-fixed font-bold bg-primary-container/10 rounded-xl px-6 py-1 transition-all"
                  : "flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant py-1"
              }
            >
              <span
                className={active ? "material-symbols-outlined text-[24px] fill-icon" : "material-symbols-outlined text-[24px]"}
                data-icon={item.icon}
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
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
