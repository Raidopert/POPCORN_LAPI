/* Service Worker для PWA «Рацион» — кабинет нутрициолога.
   Кеширует оболочку приложения (index.html, manifest, иконки),
   чтобы оно открывалось офлайн. Данные хранятся в IndexedDB,
   поэтому работают без сети. Стратегия: stale-while-revalidate
   для оболочки; запросы к Supabase не кешируем (проходят насквозь). */
const CACHE = "ration-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon.ico",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // не трогаем запросы к Supabase и другим API — пусть идут на сеть
  if (url.origin !== self.location.origin) return;
  // только GET
  if (e.request.method !== "GET") return;

  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const fetchPromise = fetch(e.request)
        .then((resp) => {
          // кешируем только успешные ответы того же происхождения
          if (resp && resp.status === 200 && resp.type === "basic") {
            cache.put(e.request, resp.clone()).catch(() => {});
          }
          return resp;
        })
        .catch(() => cached); // сеть упала — отдаём кеш
      return cached || fetchPromise;
    })()
  );
});
