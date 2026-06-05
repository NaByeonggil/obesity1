"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { previewPath } from "@/lib/preview/routes"

export default function InAppPaymentPage() {
  const router = useRouter()
  const [selected, setSelected] = useState("card")
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/preview/payments")
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        if (d?.methods?.[0]?.id) setSelected(d.methods[0].id)
      })
      .catch(() => {})
  }, [])

  const methodIcon = (m: any) => (
    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
      <span className="material-symbols-outlined" data-icon={m.icon}>
        {m.icon}
      </span>
    </div>
  )

  const consultationFee = data?.summary?.consultationFee ?? 12400
  const serviceFee = data?.summary?.serviceFee ?? 3200
  const total = data?.summary?.total ?? 15600

  const handlePay = async () => {
    try {
      await fetch("/api/preview/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methodId: selected, amount: data?.summary?.total }),
      })
    } catch {}
    router.push(previewPath("payment-mypage"))
  }

  return (
    <div className="stitch-theme bg-background text-on-background min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-16 bg-surface dark:bg-surface-dim">
        <button
          className="flex items-center justify-center p-2 text-primary hover:opacity-80 transition-opacity active:scale-95 duration-100"
          onClick={() => router.back()}
        >
          <span className="material-symbols-outlined" data-icon="arrow_back">
            arrow_back
          </span>
        </button>
        <h1 className="text-headline-sm font-headline-sm font-bold text-primary dark:text-primary-fixed">결제하기</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>
      <main className="mt-16 px-container-margin pt-stack-lg space-y-stack-lg">
        {/* Order Summary Card */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-stack-sm ml-1">주문 요약</h2>
          <div className="bg-surface-container-lowest rounded-xl p-5 custom-shadow border border-surface-variant/30">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-headline-sm text-headline-sm text-on-surface mb-1">리피토정 10mg</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">30일분 x 1개</p>
              </div>
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-label-md text-label-md">처방약</span>
            </div>
            <div className="space-y-2 pt-4 border-t border-outline-variant">
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">약제비</span>
                <span className="text-on-surface">{consultationFee.toLocaleString() + "원"}</span>
              </div>
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">조제 기술료</span>
                <span className="text-on-surface">{serviceFee.toLocaleString() + "원"}</span>
              </div>
              <div className="flex justify-between font-headline-sm text-headline-sm pt-2 text-primary">
                <span className="font-bold">최종 결제 금액</span>
                <span className="font-extrabold">{total.toLocaleString() + "원"}</span>
              </div>
            </div>
          </div>
        </section>
        {/* Payment Method Selection */}
        <section className="space-y-stack-md">
          <h2 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-stack-sm ml-1">결제 수단 선택</h2>
          <div className="grid grid-cols-1 gap-3">
            {data?.methods?.map((m: any) => {
              const isActive = selected === m.id
              return (
                <button
                  key={m.id}
                  className={
                    "payment-option flex items-center justify-between p-4 bg-surface-container-lowest border-2 border-transparent rounded-xl transition-all duration-200 active:scale-98 text-left" +
                    (isActive ? " active-ring" : "")
                  }
                  onClick={() => setSelected(m.id)}
                >
                  <div className="flex items-center gap-4">
                    {methodIcon(m)}
                    <div>
                      <span className="font-body-md text-body-md font-semibold text-on-surface block">{m.label}</span>
                      {m.detail ? (
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{m.detail}</span>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={
                      "material-symbols-outlined " + (isActive ? "text-primary" : "text-outline-variant")
                    }
                    data-icon={isActive ? "check_circle" : "radio_button_unchecked"}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {isActive ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
        {/* Terms Agreement */}
        <section className="pt-4 border-t border-outline-variant/30 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
            <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">결제 서비스 이용 약관 동의 (필수)</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
            <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">개인정보 제 3자 제공 및 수집 동의 (필수)</span>
          </label>
        </section>
      </main>
      {/* Fixed Bottom CTA */}
      <footer className="fixed bottom-0 left-0 w-full p-container-margin bg-white/80 backdrop-blur-md">
        <button
          className="w-full h-14 bg-secondary-container text-on-primary font-headline-sm rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 hover:opacity-90"
          onClick={handlePay}
        >
          {total.toLocaleString() + "원 결제하기"}
        </button>
      </footer>
    </div>
  )
}
