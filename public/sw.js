// 날씬닥터 PWA 서비스 워커 (설치형 PWA 요건 충족용 + 기본 오프라인 캐시)
const CACHE = "nalssin-pwa-v1"
const APP_SHELL = ["/", "/screens", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// 네트워크 우선, 실패 시 캐시 폴백 (API 요청은 항상 네트워크)
self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) return // API는 캐시하지 않음

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
  )
})
