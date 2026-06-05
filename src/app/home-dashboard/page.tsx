"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { previewPath, nextPreviewPath, BOTTOM_NAV } from "@/lib/preview/routes"

export default function HomeDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/preview/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <div className="stitch-theme text-on-surface antialiased pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-container-margin py-stack-sm w-full bg-surface dark:bg-inverse-surface shadow-[0px_4px_12px_rgba(0,107,95,0.04)]">
        <div className="flex items-center gap-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiqAfQQPYTJXxLE1TTUAM52jVLHJC0v4ijtGTZao6RAp8tGNWo_qJtlqN-Dz98SoKyXQzvs3-ocYqQg1y72ZVZQz7A0gHXqK35qfZYstjiWAXwfrUMrZs7YobWR_5DkKQA4J4kpb3CgAh_uHiDl6jXsDZypvSwdNhaA6HllFU_jwAa2j2cS_mXM7al4Ldg69r7AvYxWMzIZpeJ17cK3Tdf25dwyPwWQJon7piuRmq7LU9Sghxc0pUaKzA4TVXzoJ7QCjtIpLhSPZgP"
            alt="      "
            className="h-10 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all duration-200 active:scale-[0.98]">
                <span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-full hover:bg-surface-variant/50 transition-all duration-200 active:scale-[0.98]"
                aria-label="로그아웃"
              >
                <span className="material-symbols-outlined text-primary" data-icon="logout">logout</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border-2 border-surface shadow-sm overflow-hidden">
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  data-alt="A professional close-up portrait of a Korean man in his 30s with a warm and friendly expression. He is wearing a clean, modern white linen shirt against a soft, out-of-focus medical office background. The lighting is bright and natural, reflecting a clean healthcare aesthetic with subtle teal accents. The visual style is premium and trustworthy."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVpoiseFYohxBopFphsmItQ2QKECFRG7RAOIXiz5NFgv4Su_GDQCV-QMNqSu-qf95Z82Y5PmXFSzS6EjfyNjoluPp7F8INY4gDYTlI8c1w2YlShc8GFkJSFvkKna8J80jO3eoEa8km_EK--V-2CEn_6LXxK-HYKzKLvT2aTvrbJSyQc7LPaJyjyWjiPdqyvy4RGMC1ymtl_9rX6csPFltDJAnRU9rp_GjmCC1OUgrffpY_q20Bo83Yc2bI3pOwoYf1ybVpF1tHkGuS"
                />
              </div>
            </>
          ) : (
            <button
              onClick={() => router.push("/auth/login")}
              className="bg-primary text-white px-4 py-2 rounded-full text-label-md font-bold active:scale-[0.98] transition-all duration-200"
            >
              로그인
            </button>
          )}
        </div>
      </header>
      <main className="mt-20 px-container-margin">
        {/* Welcome Message */}
        <section
          className="py-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ opacity: 1, transform: "translateY(0px)", transition: "0.5s ease-out" }}
        >
          <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
            {isLoggedIn ? (
              <>
                {session?.user?.name ?? data?.user?.name ?? "회원"}님, 안녕하세요 <br />
                <span className="text-primary font-bold">건강한 하루를 시작해볼까요?</span>
              </>
            ) : (
              <>
                안녕하세요 <br />
                <span className="text-primary font-bold">로그인하고 건강 관리를 시작해보세요</span>
              </>
            )}
          </h2>
        </section>
        {/* Status Card (Upcoming Reservation) */}
        <section className="mb-stack-lg" style={{ opacity: 1, transform: "translateY(0px)", transition: "0.5s ease-out 0.1s" }}>
          <Link href={previewPath("clinic-detail-booking")} className="block bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(0,107,95,0.04)] border border-outline-variant/20 overflow-hidden relative active:scale-[0.98] transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-md font-label-md">진료 예정</span>
                <p className="mt-2 text-body-md font-bold">
                  {data?.nextAppointment?.time ?? "오후 2:30"} {data?.nextAppointment?.type === "ONLINE" ? "비대면 진료" : data?.nextAppointment ? "대면 진료" : "비대면 진료"}
                </p>
              </div>
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
            </div>
            <div className="flex items-center gap-3 py-3 border-t border-outline-variant/30">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" data-icon="medical_services">medical_services</span>
              </div>
              <div>
                <p className="text-body-sm text-on-surface-variant">{data?.nextAppointment?.clinicName ?? "서울 연세 가가 클리닉"}</p>
                <p className="text-body-md font-semibold">{data?.nextAppointment?.doctorName ?? "이정후 전문의"}</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]" data-icon="pulse">pulse_alert</span>
            </div>
          </Link>
        </section>
        {/* Service Quick Links (Bento) */}
        <section className="mb-stack-lg" style={{ opacity: 1, transform: "translateY(0px)", transition: "0.5s ease-out 0.2s" }}>
          <h3 className="text-headline-sm font-headline-sm mb-4">빠른 메뉴</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push(previewPath("clinic-search-list"))}
              className="col-span-2 bg-primary text-white p-5 rounded-xl shadow-md flex justify-between items-center active:scale-[0.98] transition-all text-left"
            >
              <div>
                <p className="text-headline-sm font-bold">비대면 진료 예약</p>
                <p className="text-body-sm opacity-80">어디서나 편하게 상담받으세요</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined" data-icon="video_call">video_call</span>
              </div>
            </button>
            <Link href={previewPath("prescription-pharmacy-send")} className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/10 active:scale-[0.98] transition-all">
              <div className="w-10 h-10 bg-secondary-fixed rounded-lg flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-secondary" data-icon="description">description</span>
              </div>
              <p className="text-body-md font-bold">처방전 관리</p>
              <p className="text-label-md text-on-surface-variant">내 처방 이력 확인</p>
            </Link>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/10 active:scale-[0.98] transition-all">
              <div className="w-10 h-10 bg-tertiary-fixed rounded-lg flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-tertiary" data-icon="edit_note">edit_note</span>
              </div>
              <p className="text-body-md font-bold">다이어트 기록</p>
              <p className="text-label-md text-on-surface-variant">오늘의 식단과 운동</p>
            </div>
          </div>
        </section>
        {/* Health Tip Section */}
        <section className="mb-stack-lg" style={{ opacity: 1, transform: "translateY(0px)", transition: "0.5s ease-out 0.3s" }}>
          <h3 className="text-headline-sm font-headline-sm mb-4">오늘의 건강 팁</h3>
          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-outline-variant/20 flex">
            <div className="w-1/3 h-32 relative overflow-hidden">
              <img
                alt="Healthy Tip Illustration"
                className="w-full h-full object-cover"
                data-alt="A minimalist and artistic flat illustration of a balanced meal with fresh greens, an avocado, and a bright egg on a clean white ceramic plate. The background is a soft, pastel off-white with gentle light-teal shadows. The lighting is diffused and calm, creating a serene and premium lifestyle atmosphere that encourages healthy eating."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgSkPPgInW88TgVAgc5-k1kiCj2qDenWUdsdhjNG0BmlhU5u8WvANCWIq3-aLIGTpNjsLbNjBlFGht7slX9rbWnrwg0yGGWxMm58IgMR5lvrCpD4n5KBHMJhYrcgqic7InBxtH9QLwDLlIQh8nZs878wcBbmFwGMgdjwx-m28x9L8-QdM3aBo7NYNSCJvC3lHsplJgm7jsgVzXxXjLhJrMqOGioM1qatjSSkAxGFyTf3gjoQr7_WASGy6ACrie47A2W6LbY9eWI-ST"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-container-low"></div>
            </div>
            <div className="w-2/3 p-4 flex flex-col justify-center">
              <p className="text-primary font-bold text-label-md mb-1">식단 가이드</p>
              <p className="text-body-md font-semibold line-clamp-2 mb-2">물 섭취만으로도 대사량이 10% 증가한다는 사실, 알고 계셨나요?</p>
              <button className="text-primary text-label-md font-bold flex items-center gap-1">
                더 알아보기 <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
        {/* Weekly Progress Card */}
        <section className="mb-stack-lg" style={{ opacity: 1, transform: "translateY(0px)", transition: "0.5s ease-out 0.4s" }}>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-body-md font-bold">주간 활동 목표</h3>
              <span className="text-primary text-label-md font-bold">85% 완료</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 mb-4">
              <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: "85%" }}></div>
            </div>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-label-md text-on-surface-variant mb-1">현재 체중</p>
                <p className="text-body-sm font-bold">{data?.healthSummary?.weightKg ?? "78.4"}kg</p>
              </div>
              <div className="text-center">
                <p className="text-label-md text-on-surface-variant mb-1">목표 체중</p>
                <p className="text-body-sm font-bold">{data?.healthSummary?.goalKg ?? "72.0"}kg</p>
              </div>
              <div className="text-center">
                <p className="text-label-md text-on-surface-variant mb-1">연속 기록</p>
                <p className="text-body-sm font-bold">{data?.healthSummary?.streakDays ?? "14"}일</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 bg-surface dark:bg-inverse-surface rounded-t-xl shadow-[0px_-4px_12px_rgba(0,107,95,0.04)] border-t border-outline-variant/30">
        {/* 홈 (Active) */}
        <Link href={previewPath("home-dashboard")} className="flex flex-col items-center justify-center text-primary dark:text-primary-fixed font-bold bg-primary-container/20 rounded-xl px-4 py-1 active:scale-[0.98] transition-all duration-200">
          <span className="material-symbols-outlined" data-icon="home" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-label-md font-label-md">홈</span>
        </Link>
        {/* 의원 */}
        <Link href={previewPath("clinic-search-list")} className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors active:scale-[0.98]">
          <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
          <span className="text-label-md font-label-md">의원</span>
        </Link>
        {/* 처방전 */}
        <Link href={previewPath("prescription-pharmacy-send")} className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors active:scale-[0.98]">
          <span className="material-symbols-outlined" data-icon="description">description</span>
          <span className="text-label-md font-label-md">처방전</span>
        </Link>
        {/* 마이 */}
        <Link href={previewPath("payment-mypage")} className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors active:scale-[0.98]">
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
