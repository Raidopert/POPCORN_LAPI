// Service Worker — кеширует приложение для офлайн-работы
const CACHE_VERSION = "chest-thief-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  "./",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./bg/clicker-bg.png",
  "./bg/chest-field-bg.png",
  "./bg/battle-bg.png",
  "./bg/hero-bg.png",
  "./bg/thief-portrait.png",
  "./bg/chest-iron.png",
  "./bg/chest-gold.png",
  "./bg/chest-cursed.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => { const c = res.clone(); caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, c)); return res; }).catch(() => caches.match(req).then((c) => c || caches.match("./")))
    );
    return;
  }

  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("./bg/") || url.pathname.startsWith("./icon-") || url.pathname === "./apple-touch-icon.png" || url.pathname === "./favicon-32.png" || url.pathname === "./manifest.webmanifest") {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => { if (res.ok && res.type === "basic") { const c = res.clone(); caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, c)); } return res; }))
    );
    return;
  }

  event.respondWith(fetch(req).then((res) => { if (res.ok && res.type === "basic") { const c = res.clone(); caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, c)); } return res; }).catch(() => caches.match(req)));
});

self.addEventListener("message", (event) => { if (event.data === "SKIP_WAITING") self.skipWaiting(); });
