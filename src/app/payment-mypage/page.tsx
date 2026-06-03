"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { previewPath, BOTTOM_NAV } from "@/lib/preview/routes"

export default function PaymentMyPage() {
  const [activeTab, setActiveTab] = useState<"my" | "pay">("my")
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/preview/me")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [])

  return (
    <div className="stitch-theme bg-background text-on-surface min-h-screen pb-32">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-container-margin py-stack-sm w-full bg-surface shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiqAfQQPYTJXxLE1TTUAM52jVLHJC0v4ijtGTZao6RAp8tGNWo_qJtlqN-Dz98SoKyXQzvs3-ocYqQg1y72ZVZQz7A0gHXqK35qfZYstjiWAXwfrUMrZs7YobWR_5DkKQA4J4kpb3CgAh_uHiDl6jXsDZypvSwdNhaA6HllFU_jwAa2j2cS_mXM7al4Ldg69r7AvYxWMzIZpeJ17cK3Tdf25dwyPwWQJon7piuRmq7LU9Sghxc0pUaKzA4TVXzoJ7QCjtIpLhSPZgP"
          alt="날씬닥터"
          className="h-12 w-auto object-contain object-left"
        />
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden ring-2 ring-primary/10">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              data-alt="A professional studio portrait of a young Korean woman in her early 30s with a clean and professional look, soft natural lighting, set against a minimalist light teal background. The image has a high-end medical-lifestyle aesthetic with soft focus on the background to emphasize her friendly yet authoritative expression."
              src={data?.user?.avatar ?? "https://lh3.googleusercontent.com/aida-public/AB6AXuCQWWNTXdr1dcokJars6vckuH8TBImRkK5F9fu3tMYT8iP4azSNsIIDeo8Fdav-uom4aWt-jwyL231iqMDK_tNyK0rbf-tIJa3wt_vjB4dmmKk4dNQ6QLwVfZP010kgNs1BAWINGf56HUPFjhhqeT3OTkPNyl5XeuwYZpemVtraUOA9i122qq-FjFiAQwCBnrHhMo3HSAzhbDq99g8EwEmGO9NA6RMt25acfIHEavK8FUomcV-D6ty3018VXuRYHFRx8FOZI_CHgnjp"}
            />
          </div>
        </div>
      </nav>
      <main className="pt-20 px-container-margin space-y-gutter">
        {/* Tab Switching Logic (UX Simulation) */}
        <div className="flex gap-stack-sm overflow-x-auto no-scrollbar py-2">
          <button
            className={
              activeTab === "my"
                ? "px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold shadow-md transition-all"
                : "px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-medium hover:bg-surface-variant transition-all"
            }
            id="tab-my"
            onClick={() => setActiveTab("my")}
          >
            마이페이지
          </button>
          <button
            className={
              activeTab === "pay"
                ? "px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold shadow-md transition-all"
                : "px-5 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-medium hover:bg-surface-variant transition-all"
            }
            id="tab-pay"
            onClick={() => setActiveTab("pay")}
          >
            결제 내역
          </button>
        </div>
        {/* MY PAGE CONTENT */}
        {activeTab === "my" && (
          <section className="space-y-gutter animate-in fade-in duration-500" id="content-my">
            {/* Profile Summary Card */}
            <div className="bg-white rounded-xl p-container-margin shadow-[0px_4px_12px_rgba(0,107,95,0.04)] flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{data?.user?.name ?? "김지수"} 님</h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant">{data?.user?.email ?? "다이어트 집중 케어 14일차"}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-label-md font-label-md">
                  {data?.user?.membership ?? "프리미엄"} 멤버
                </span>
              </div>
            </div>
            {/* Health Record Bento */}
            <div className="grid grid-cols-2 gap-gutter">
              {/* Weight Trend */}
              <div className="col-span-2 bg-white rounded-xl p-container-margin shadow-[0px_4px_12px_rgba(0,107,95,0.04)] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-sm text-headline-sm">체중 변화</h3>
                  <span className="text-primary font-bold text-headline-sm">-2.4kg</span>
                </div>
                <div className="h-32 w-full flex items-end gap-3 px-2">
                  {/* Simple Pure CSS Graph Representation */}
                  <div className="flex-1 bg-primary-container/20 rounded-t-lg relative group transition-all" style={{ height: "90%" }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md text-outline hidden group-hover:block">64.2</div>
                  </div>
                  <div className="flex-1 bg-primary-container/40 rounded-t-lg relative group transition-all" style={{ height: "85%" }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md text-outline hidden group-hover:block">63.8</div>
                  </div>
                  <div className="flex-1 bg-primary-container/60 rounded-t-lg relative group transition-all" style={{ height: "80%" }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md text-outline hidden group-hover:block">62.5</div>
                  </div>
                  <div className="flex-1 bg-primary rounded-t-lg relative group transition-all" style={{ height: "75%" }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-label-md text-primary font-bold hidden group-hover:block">61.8</div>
                  </div>
                </div>
                <div className="flex justify-between text-label-md font-label-md text-on-surface-variant px-1">
                  <span className="">월요일</span>
                  <span className="">화요일</span>
                  <span className="">수요일</span>
                  <span className="">오늘</span>
                </div>
              </div>
              {/* Consultation History */}
              <div className="col-span-2 bg-white rounded-xl p-container-margin shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-sm text-headline-sm">진료 기록</h3>
                  <button className="text-primary text-label-md font-label-md">전체보기</button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-secondary-fixed-variant">medical_services</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-body-md font-body-md font-bold">대사증후군 집중 상담</p>
                      <p className="text-body-sm font-body-sm text-on-surface-variant">2024.05.18 · 박지민 원장</p>
                    </div>
                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Settings Menu */}
            <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,107,95,0.04)] overflow-hidden">
              <div className="divide-y divide-outline-variant/30">
                <button className="w-full flex items-center justify-between p-container-margin hover:bg-surface-container-low transition-colors active:scale-[0.99]">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">notifications</span>
                    <span className="text-body-md font-body-md">알림 설정</span>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </button>
                <button className="w-full flex items-center justify-between p-container-margin hover:bg-surface-container-low transition-colors active:scale-[0.99]">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">privacy_tip</span>
                    <span className="text-body-md font-body-md">개인정보 보호</span>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </button>
                <button className="w-full flex items-center justify-between p-container-margin hover:bg-surface-container-low transition-colors active:scale-[0.99]">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">help</span>
                    <span className="text-body-md font-body-md">고객센터</span>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </button>
              </div>
            </div>
          </section>
        )}
        {/* PAYMENT CONTENT (HIDDEN BY DEFAULT) */}
        {activeTab === "pay" && (
          <section className="space-y-gutter animate-in fade-in duration-500" id="content-pay">
            {/* Payment Summary Card */}
            <div className="bg-primary text-on-primary rounded-xl p-container-margin shadow-lg space-y-6">
              <div>
                <h3 className="text-label-md font-label-md opacity-80 uppercase tracking-widest">이번 달 결제 예정 금액</h3>
                <div className="text-headline-lg font-headline-lg mt-1">₩ 154,200</div>
              </div>
              <div className="pt-4 border-t border-on-primary/10 space-y-2">
                <div className="flex justify-between text-body-sm font-body-sm">
                  <span className="opacity-70">비대면 진료비</span>
                  <span className="">₩ 24,000</span>
                </div>
                <div
                  className="flex justify-between text-body-sm font-body-sm cursor-pointer active:scale-[0.99] transition-all"
                  onClick={() => router.push(previewPath("prescription-pharmacy-send"))}
                >
                  <span className="opacity-70">처방 의약품 (30일분)</span>
                  <span className="">₩ 130,200</span>
                </div>
              </div>
            </div>
            {/* Registered Cards */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-sm text-headline-sm">결제 수단</h3>
                <button className="text-primary text-label-md font-label-md">+ 추가</button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {data?.paymentMethods?.map((m: any, i: number) => (
                  <div
                    key={m.id}
                    className={
                      i === 0
                        ? "min-w-[280px] h-44 rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#444444] p-5 flex flex-col justify-between shadow-xl relative overflow-hidden text-white group cursor-pointer active:scale-95 transition-all"
                        : "min-w-[280px] h-44 rounded-2xl bg-white border border-outline-variant p-5 flex flex-col justify-between shadow-sm group cursor-pointer active:scale-95 transition-all"
                    }
                  >
                    {i === 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>}
                    <div className="flex justify-between items-start">
                      <span className={i === 0 ? "font-bold tracking-tighter" : "font-bold text-on-surface-variant"}>{m.label}</span>
                      <span className={i === 0 ? "material-symbols-outlined" : "material-symbols-outlined text-outline"} data-weight="fill">{m.icon}</span>
                    </div>
                    <div className="space-y-1">
                      <p className={i === 0 ? "text-label-md opacity-50" : "text-label-md text-outline"}>{i === 0 ? "Main Method" : "Secondary"}</p>
                      <p className={i === 0 ? "text-body-lg font-bold tracking-[0.2em]" : "text-body-lg font-bold tracking-[0.2em] text-on-surface"}>{m.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,107,95,0.04)] overflow-hidden">
              <div className="flex justify-between items-center p-container-margin pb-2">
                <h3 className="font-headline-sm text-headline-sm">결제 내역</h3>
              </div>
              <div className="divide-y divide-outline-variant/30">
                {data?.paymentHistory?.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-container-margin">
                    <div className="space-y-1">
                      <p className="text-body-md font-body-md font-bold">{h.title}</p>
                      <p className="text-body-sm font-body-sm text-on-surface-variant">{h.date}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-body-md font-body-md font-bold">{h.amount.toLocaleString()}원</span>
                      <span className="text-label-md font-label-md text-on-surface-variant">{h.status === "PAID" ? "결제완료" : "환불"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Promotion / CTA */}
            <div className="bg-secondary-fixed rounded-xl p-container-margin flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-on-secondary-fixed font-bold text-body-md">포인트 혜택</p>
                <p className="text-on-secondary-fixed-variant text-body-sm">진료비 자동결제 시 3% 적립</p>
              </div>
              <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-label-md font-label-md active:scale-95 transition-all">
                신청하기
              </button>
            </div>
          </section>
        )}
      </main>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface shadow-[0px_-4px_12px_rgba(0,107,95,0.04)] rounded-t-xl border-t border-outline-variant/30">
        {BOTTOM_NAV.map((item) =>
          item.key === "my" ? (
            <Link
              key={item.key}
              href={previewPath(item.slug)}
              className="flex flex-col items-center justify-center text-primary font-bold bg-primary-container/20 rounded-xl px-4 py-1 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <span className="text-label-md font-label-md mt-1">{item.label}</span>
            </Link>
          ) : (
            <Link
              key={item.key}
              href={previewPath(item.slug)}
              className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-label-md font-label-md mt-1">{item.label}</span>
            </Link>
          )
        )}
      </nav>
      {/* Floating Action Button (FAB) - Contextual for My Page (Quick Consultation) */}
      <button className="fixed bottom-24 right-container-margin w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all z-40">
        <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
      </button>
    </div>
  )
}
