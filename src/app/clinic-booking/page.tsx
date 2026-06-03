"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { previewPath } from "@/lib/preview/routes"

export default function ClinicBookingPage() {
  const router = useRouter()
  const [activeChip, setActiveChip] = useState(0)
  const chips = ["전체", "체중관리", "다이어트약", "상담 전문"]

  const [slots, setSlots] = useState<any[]>([])
  const [selectedTime, setSelectedTime] = useState<string>("")

  useEffect(() => {
    fetch("/api/preview/clinics/c-001")
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
  }, [])

  const handleConfirm = async () => {
    try {
      await fetch("/api/preview/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId: "c-001", date: slots?.[0]?.date, time: selectedTime }),
      })
    } catch {
      // 데모: 실패해도 다음 화면으로 진행
    }
    router.push(previewPath("booking-status-detail"))
  }

  return (
    <div className="stitch-theme bg-background text-on-surface min-h-screen pb-24">
      {/* TopAppBar Shell */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-margin py-stack-sm w-full bg-surface shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-surface-variant/50 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <div className="h-10 flex items-center">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiqAfQQPYTJXxLE1TTUAM52jVLHJC0v4ijtGTZao6RAp8tGNWo_qJtlqN-Dz98SoKyXQzvs3-ocYqQg1y72ZVZQz7A0gHXqK35qfZYstjiWAXwfrUMrZs7YobWR_5DkKQA4J4kpb3CgAh_uHiDl6jXsDZypvSwdNhaA6HllFU_jwAa2j2cS_mXM7al4Ldg69r7AvYxWMzIZpeJ17cK3Tdf25dwyPwWQJon7piuRmq7LU9Sghxc0pUaKzA4TVXzoJ7QCjtIpLhSPZgP"
              alt="       "
              className="h-full object-contain"
            />
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
      </header>
      <main className="pt-20 px-container-margin">
        {/* Search Section */}
        <section className="mt-stack-lg">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-outline">search</span>
            <input
              className="w-full pl-12 pr-4 py-4 bg-[#EDF0EF] border-none rounded-xl text-body-md font-body-md focus:ring-2 focus:ring-primary transition-all"
              placeholder="병원 또는 의사 이름을 검색하세요"
              type="text"
            />
          </div>
        </section>
        {/* Filter Chips */}
        <section className="mt-stack-md flex gap-2 overflow-x-auto hide-scrollbar">
          {chips.map((chip, i) => (
            <button
              key={chip}
              onClick={() => setActiveChip(i)}
              className={
                activeChip === i
                  ? "px-4 py-2 rounded-full bg-primary text-on-primary text-label-md font-label-md whitespace-nowrap active:scale-[0.98] transition-all"
                  : "px-4 py-2 rounded-full bg-primary-container/20 text-primary text-label-md font-label-md whitespace-nowrap active:scale-[0.98] transition-all hover:bg-primary-container/30"
              }
            >
              {chip}
            </button>
          ))}
        </section>
        {/* Time Slots */}
        {slots?.[0]?.times?.length ? (
          <section className="mt-stack-lg">
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-stack-sm">예약 시간 선택</h2>
            <div className="flex gap-2 flex-wrap">
              {slots[0].times.map((t: string) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={
                    selectedTime === t
                      ? "px-4 py-2 rounded-full bg-primary text-on-primary text-label-md font-label-md whitespace-nowrap active:scale-[0.98] transition-all"
                      : "px-4 py-2 rounded-full bg-primary-container/20 text-primary text-label-md font-label-md whitespace-nowrap active:scale-[0.98] transition-all hover:bg-primary-container/30"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        ) : null}
        {/* Doctor List Title */}
        <section className="mt-stack-lg flex justify-between items-end">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">추천 전문의</h2>
          <span className="text-label-md font-label-md text-outline">총 24명</span>
        </section>
        {/* List of Doctors */}
        <section className="mt-stack-md space-y-gutter">
          {/* Doctor Card 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(0,107,95,0.04)] flex flex-col gap-4 group">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-variant flex-shrink-0">
                <img
                  alt="Doctor"
                  className="w-full h-full object-cover"
                  data-alt="A professional portrait of a confident male doctor in a clean white medical coat, smiling warmly. The setting is a bright, modern medical clinic with soft, diffused sunlight and minimalist interior design elements. The overall mood is professional, empathetic, and premium, aligned with a high-end healthcare app's aesthetic of calm and authority."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6z3ILOvBsW0IAwJ_XdaDVoQj8P3uRkUNxvSktM2Mr7XEj7zvOuBvS8_ec8Q3jhQC81wQ-WuvPrOUOjFktkj2ZLJR8y8uk7SWfr0mF6wUqgtFHMmvMeHBL5cGYKjqnCeBUucWExcuaNqtGhmnxCrkzl950GfB-UDHsmxmsnDQpefW-XRMcCRWGP2WoOZBEJElBZ6JSndIh_Tcz7dYaJdzGceYgw4n2OYDcxuqjqyNLgdcaOkNcAVKbdr7FwTfD8vCaO8oTHEe7pKiH"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-lg font-bold text-on-surface">김민수 원장</h3>
                      <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded uppercase">예약 가능</span>
                    </div>
                    <p className="text-body-sm font-body-sm text-outline">바른핏 내과의원</p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-label-md font-bold">4.9</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded text-primary font-bold">#체중감량</span>
                  <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded text-primary font-bold">#식단코칭</span>
                </div>
              </div>
            </div>
            <button onClick={handleConfirm} className="w-full py-3 bg-secondary-container text-white rounded-lg text-body-md font-bold active:scale-[0.98] transition-all hover:brightness-105">
              예약하기
            </button>
          </div>
          {/* Doctor Card 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(0,107,95,0.04)] flex flex-col gap-4 group">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-variant flex-shrink-0">
                <img
                  alt="Doctor"
                  className="w-full h-full object-cover"
                  data-alt="A professional close-up of a female healthcare expert in a minimalist office. She exudes expertise and kindness, with bright, natural lighting highlighting her professional attire. The background is softly blurred to maintain a clean and uncluttered feel, reinforcing the privacy-respecting and calm brand identity of a modern weight management clinic."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxh9u0aEKKZkNJV1NHO0CyuGEdRGkMKVQmCr2MPZ43s0FfT4AdtOFjv66Q2nq3pBv6t-fSQ0s5cEJxPYbmyn9rbRJPde0Q5ofMdV97QiAo1C5JsFW50wlaAF7gxVn1zTQesYrUv06UoJLB-w_0fLCUkEZNgueYQ2hAyqlMkDiXkTk8Xc4Oia03b3-0OcNGAk_Bs0KqgaDKpEHc2NUPfQ8FHhXvexa9Of-7GUtXiZ5pCmvyzMwhxqBxsUo1f-hgmzZX7p6Q6kd05p24"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-lg font-bold text-on-surface">이지은 원장</h3>
                      <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded uppercase">예약 가능</span>
                    </div>
                    <p className="text-body-sm font-body-sm text-outline">슬림미 의원</p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-label-md font-bold">4.8</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded text-primary font-bold">#요요방지</span>
                  <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded text-primary font-bold">#심리상담</span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-secondary-container text-white rounded-lg text-body-md font-bold active:scale-[0.98] transition-all hover:brightness-105">
              예약하기
            </button>
          </div>
          {/* Doctor Card 3 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(0,107,95,0.04)] flex flex-col gap-4 group">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-variant flex-shrink-0">
                <img
                  alt="Doctor"
                  className="w-full h-full object-cover"
                  data-alt="A sophisticated portrait of a senior medical professional in a high-end hospital setting. The lighting is crisp and clear, creating a sense of authority and precision. The aesthetic is modern corporate minimalism, with a focus on deep teals and soft whites. The doctor's expression is attentive and expert, conveying safety and medical excellence for health-conscious users."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoOb4zCLj2-WY_h2x2fWwZRaCuI_0ihOF61pVuzbL_FdIDJ2rfEbjbyTcgnUl7qaFqr19gBYM1TmdnoCQZBJVq17CP7nk8sW_-aPo4WBLAfora4iSYOuJjMqCK7iyVp5SLbkckGoi4GUoazfPo_EgUGfxFnrfbfAebfgXw95IWZZp53t5qMlSlfyKdLJFtDSrnN359K8Nr2Jkq023D41AMX2BYq5xxcNZo1t9Ug8NknI89PWdv6SakT6UWYGDgtEKhuYWpaUxzgWTs"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-lg font-bold text-on-surface">박지성 원장</h3>
                      <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded uppercase">예약 가능</span>
                    </div>
                    <p className="text-body-sm font-body-sm text-outline">연세닥터 다이어트</p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-label-md font-bold">5.0</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded text-primary font-bold">#처방전</span>
                  <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded text-primary font-bold">#체질개선</span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-secondary-container text-white rounded-lg text-body-md font-bold active:scale-[0.98] transition-all hover:brightness-105">
              예약하기
            </button>
          </div>
        </section>
        {/* Empty state spacer */}
        <div className="h-10"></div>
      </main>
      {/* BottomNavBar Shell */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface shadow-[0px_-4px_12px_rgba(0,107,95,0.04)] rounded-t-xl border-t border-outline-variant/30">
        <a className="flex flex-col items-center justify-center text-on-surface-variant transition-colors hover:text-primary" href="#">
          <span className="material-symbols-outlined">home</span>
          <span className="text-label-md font-label-md">홈</span>
        </a>
        <a className="flex flex-col items-center justify-center text-primary font-bold bg-primary-container/20 rounded-xl px-4 py-1 active:scale-[0.98] transition-all" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
          <span className="text-label-md font-label-md">예약</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant transition-colors hover:text-primary" href="#">
          <span className="material-symbols-outlined">description</span>
          <span className="text-label-md font-label-md">처방전</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant transition-colors hover:text-primary" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="text-label-md font-label-md">마이</span>
        </a>
      </nav>
    </div>
  )
}
