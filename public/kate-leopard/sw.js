/* Kate Leopard · © Raidopert — сервис-воркер: кэш приложения для работы офлайн */
const CACHE = 'kate-leopard-v0.5.1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  './sprites/fluff-cloud-96.png',
  './sprites/kw-balloon.png',
  './sprites/kw-cloudrain.png',
  './sprites/kw-umbrella.png',
  './sprites/kw-rainbow.png',
  './sprites/kw-sun.png',
  './sprites/kw-cake.png',
  './sprites/puff-f1.png',
  './sprites/puff-f2.png',
  './sprites/puff-f3.png',
  './sprites/puff-f4.png',
  './sprites/puff-f5.png',
  './sprites/fluff-tex-1.jpg',
  './sprites/fluff-tex-2.jpg',
  './sprites/fluff-tex-3.jpg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      /* кэшируем только успешные ответы — иначе битый ответ (404/500) залипает навсегда */
      if (res && res.ok) { try { caches.open(CACHE).then(c => c.put(e.request, res.clone())); } catch (_) {} }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
