"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { previewPath, BOTTOM_NAV } from "@/lib/preview/routes"

export default function MedicationPickupPage() {
  const [guideOpen, setGuideOpen] = useState(false)
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/preview/pickup/rx-001")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [])

  return (
    <div className="stitch-theme bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="top-0 z-50 shadow-[0px_4px_12px_rgba(31,122,110,0.04)] bg-surface dark:bg-surface-container-high h-16 w-full fixed">
        <div className="flex justify-between items-center px-container-margin w-full h-full max-w-screen-xl mx-auto">
          <button className="active:scale-95 transition-transform duration-200 hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-full p-2">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">menu</span>
          </button>
          <h1 className="text-headline-sm-mobile font-bold text-primary dark:text-primary-fixed-dim">날씬닥터</h1>
          <div className="h-10 w-10 rounded-full bg-surface-container overflow-hidden">
            <img
              alt="User profile"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBiX9vL2jxRSNhhskw82N9FtEyJmahyAgP6ATHPdwPqy4XQ7nZDWhRdzoeIZbfXNoTRyA3VEA46iaEYAvlyWrSOFmSCHkaekHUcwMK1Ty7aVO6EQggD6qFlcbqcTeebCpTevj_Yh07PJ3qGP-19EIc49Gwgy3RhR1Qi58wZIsPbFOJBU82NpOLwfEFrySzsk-KcUh-6wPSrQawtZbhW5AQOYTu4gcNhC6D9s9T15kPOelwq_oNjSIxJEmHUVkXBu2vUPT22OubVyV_"
            />
          </div>
        </div>
      </header>

      <main className="pt-20 px-container-margin max-w-md mx-auto space-y-stack-md">
        {/* Success Status Card */}
        <section className="bg-surface-container-lowest rounded-xl p-stack-md shadow-premium flex flex-col items-center space-y-stack-sm text-center">
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              alt="Status Illustration"
              className="w-full h-full object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyK2MxkrSV9zxFPK4VQCCVJ0Lg3ZQYMh-SR8SY0Rh8n3h5m2vYKXWok4pHJ1YXXsC89Vi5SqZ4ICLTb1agyKmUF3wb9U9AIsvjxeOV1CXpUMO6qBc4s_sBKdreJkCFlGgRinirr5IvEumN2w25M5hdX46Br5Zg61via3myyYOglQnsqMQWdJsRC-Zjx4OnF0u8G3xSN7fvEEtk1e4eU60vXKN-aK8NptxzfJK3L5r9QYx0hRynrQXn5vNuO2U4p6lpMxVfndFFSbSI"
            />
          </div>
          <h2 className="text-headline-sm text-primary">조제·결제 완료</h2>
          <p className="text-body-sm text-on-surface-variant">
            약국에서 처방약 조제가 완료되었습니다.
            <br />
            아래 QR코드를 제시해주세요.
          </p>
        </section>

        {/* QR Code Section */}
        <section className="bg-surface-container-lowest rounded-xl p-stack-lg shadow-premium flex flex-col items-center space-y-stack-md">
          <div className="p-4 bg-white border-2 border-primary rounded-xl overflow-hidden aspect-square w-48 shadow-inner">
            <img
              alt="Pickup QR Code"
              className="w-full h-full object-contain"
              src={data?.qrUrl ?? "https://lh3.googleusercontent.com/aida-public/AB6AXuDn2JvGoeOm8gUc8TnufZHlKyGKSaUlgbvGwE6NxqJ6mzG0nm6tRH1kJt76XEk27MHvONaF5IhKc9J6iaVLi4ag3A7gt5rPpjb47LQfwh9xLAbqWjkz1RAXgbOQnBBQ1gByK55UwycRqTQtM90t6iYba-hihy2dlTBuXfbBQVv3AavDPgxWxUepALhX1vbhB9RzRbmHKpqj1yX9IHNdqbQVzU0ZUpjLuFJijvipC4BmnCUXr9_xgd6UFGyr-_k5i0rpRe4AlNYL6Ayn"}
            />
          </div>
          <div className="text-center">
            <p className="text-label-md text-on-surface-variant uppercase tracking-widest">주문 번호</p>
            <p className="text-headline-md text-primary mt-1">{data?.orderNo ?? "20240612-0042"}</p>
          </div>
        </section>

        {/* Pharmacy Info Card */}
        <section className="bg-surface-container-lowest rounded-xl p-stack-md shadow-premium space-y-stack-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-headline-sm text-on-surface">{data?.pharmacy?.name ?? "메디컬정문약국"}</h3>
              <div className="flex items-center space-x-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                <p className="text-body-sm">{data?.pharmacy?.address ?? "서울 중구 남대문로 84"}</p>
              </div>
            </div>
            <div className="bg-primary-container/10 text-primary px-3 py-1 rounded-full">
              <p className="text-label-md">{data?.pharmacy?.openHours ?? "오후 8:30까지 영업"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-stack-sm pt-2">
            <a
              className="flex-1 flex items-center justify-center space-x-2 border border-outline-variant py-3 rounded-lg hover:bg-surface-container transition-colors active:scale-95 duration-200"
              href={`tel:${data?.pharmacy?.phone ?? "02-123-4567"}`}
            >
              <span className="material-symbols-outlined text-on-surface-variant">call</span>
              <span className="text-body-md text-on-surface">{data?.pharmacy?.phone ?? "02-123-4567"}</span>
            </a>
            <button className="flex-1 flex items-center justify-center space-x-2 bg-primary py-3 rounded-lg text-white hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                directions
              </span>
              <span className="text-body-md">길찾기</span>
            </button>
          </div>
        </section>

        {/* Accordion Guide */}
        <section className="bg-surface-container-lowest rounded-xl shadow-premium overflow-hidden">
          <button
            className="w-full flex justify-between items-center p-stack-md hover:bg-surface-container-low transition-colors"
            onClick={() => setGuideOpen((v) => !v)}
          >
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-primary">info</span>
              <span className="text-headline-sm">보관 및 복약 안내</span>
            </div>
            <span
              className="material-symbols-outlined transition-transform duration-300"
              style={{ transform: guideOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              expand_more
            </span>
          </button>
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out px-stack-md bg-surface-container-lowest"
            style={{ maxHeight: guideOpen ? "500px" : "0px" }}
          >
            <div className="pb-stack-md space-y-stack-md border-t border-outline-variant pt-stack-md">
              {(
                data?.medicationGuide ?? [
                  { title: "식후 30분 복용", detail: "위장 장애 예방을 위해 규칙적인 식사 후 복용을 권장합니다.", warn: false },
                  { title: "실온 보관", detail: "직사광선을 피하고 습기가 적은 서늘한 곳에 보관하세요.", warn: false },
                  { title: "음주 금지", detail: "복용 기간 중 알코올 섭취는 간 손상 및 부작용 위험을 높일 수 있습니다.", warn: true },
                ]
              ).map((g: any) => (
                <div className="flex items-start space-x-3" key={g.title}>
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${g.warn ? "bg-secondary-container" : "bg-primary"}`}
                  ></div>
                  <div>
                    <p
                      className={`text-body-md font-bold ${g.warn ? "text-on-secondary-fixed-variant" : "text-on-surface"}`}
                    >
                      {g.title}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">{g.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-20 left-0 w-full px-container-margin z-40 md:hidden">
        <button
          className="w-full bg-accent-coral text-white font-headline-sm py-4 rounded-xl shadow-lg active:scale-95 transition-all duration-200 hover:brightness-105"
          onClick={() => router.push(previewPath("home-dashboard"))}
        >
          수령 완료
        </button>
      </div>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface dark:bg-surface-container-highest shadow-[0px_-4px_12px_rgba(31,122,110,0.04)] rounded-t-xl">
        {BOTTOM_NAV.map((item) => {
          const active = item.key === "prescription"
          return (
            <Link
              href={previewPath(item.slug)}
              key={item.key}
              className={
                active
                  ? "flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-4 py-1 active:scale-[0.98]"
                  : "flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant px-4 py-1 hover:bg-surface-container dark:hover:bg-inverse-surface transition-all active:scale-[0.98]"
              }
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-label-md">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
