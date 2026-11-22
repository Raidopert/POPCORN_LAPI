// CatScribbles service worker — офлайн-оболочка + stale-while-revalidate.
// Данные (Supabase Realtime/REST, WebRTC) всегда идут в сеть; кэшируется только
// оболочка (index.html, app.js) и статика (иконки, модули esm.sh после первой загрузки).
const CACHE = 'catscribbles-v1';
const SHELL = ['./', './index.html', './app.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // POST (save) и WS — в сеть
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Навигация — network-first: пользователь видит свежий index.html (v=N обновления)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { caches.open(CACHE).then(c => c.put('./index.html', r.clone())); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Прочее (app.js, esm.sh-модули, иконки) — stale-while-revalidate:
  // отдаём из кэша сразу, в фоне обновляем. После первой загрузки работает офлайн.
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(r => {
        if (r && r.ok) caches.open(CACHE).then(c => c.put(req, r.clone()));
        return r;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
