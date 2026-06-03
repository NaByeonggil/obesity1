"use client"

import { useEffect } from "react"

// 서비스 워커 등록 (PWA 설치/오프라인 지원)
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
    if (document.readyState === "complete") register()
    else window.addEventListener("load", register)
    return () => window.removeEventListener("load", register)
  }, [])

  return null
}
