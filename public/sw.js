/**
 * Service Worker «POPCORN PAWS»:
 *  - кэширует оболочку игры и работает офлайн;
 *  - статика — «устарел-пока-обновлялся» (мгновенная загрузка + фоновое обновление);
 *  - API /api/leaders не кэшируем — лидерборд всегда живой.
 */

const VERSION = 'popcorn-v21'
const CORE = [
  '/',
  '/manifest.json',
  '/cat-menu.png',
  '/popcorn-room.png',
  '/logo.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
  '/apple-touch-icon.png',
  '/rooms/cinema.webp',
  '/rooms/kitchen.webp',
  '/rooms/yard.webp',
  '/rooms/arcade.webp',
  '/rooms/roof.webp',
  '/rooms/park.webp',
  '/rooms/attic.webp',
  '/rooms/basement.webp',
  /* Плакаты перебивки: без них перебивка после 5-го уровня в PWA/офлайне
     открывается пустой рамкой (запрос раньше шёл только в момент показа) */
  '/posters/game/poster-1.webp',
  '/posters/game/poster-2.webp',
  '/posters/game/poster-3.webp',
  '/posters/game/poster-4.webp',
  '/posters/game/poster-5.webp',
  '/posters/game/poster-6.webp',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return // живые данные — только сеть

  // Навигация: сеть → при офлайне отдаём кэшированную оболочку
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(VERSION).then((c) => c.put('/', copy))
          return res
        })
        .catch(() => caches.match('/').then((r) => r || Response.error())),
    )
    return
  }

  // Статика: из кэша сразу, обновляем в фоне
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(VERSION).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => cached || Response.error())
      return cached || network
    }),
  )
})
