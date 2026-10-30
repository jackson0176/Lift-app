// ponytail: cache-first, damit die App auf dem Festival offline läuft.
// Bei Änderungen CACHE hochzählen, sonst sehen installierte Geräte die alte Version.
const CACHE = 'flasche-v11';
const FILES = [
  './', './index.html', './manifest.webmanifest', './icon.png', './Logo%20Lift.jpg', './Logo%20Lift2-transparent.png', './Logo%20Lift3.png',
  'https://cdn.jsdelivr.net/npm/motion@12.23.12/dist/motion.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
];

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75,700;75,800&display=swap';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.addAll(FILES);
    // Schrift auch offline: CSS holen und die darin verlinkten woff2-Dateien mitcachen
    try {
      const css = await fetch(FONT_CSS).then((r) => r.text());
      await c.put(FONT_CSS, new Response(css, { headers: { 'Content-Type': 'text/css' } }));
      await c.addAll(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) || []);
    } catch { /* ohne Schrift-Cache greift die Ersatzschrift */ }
  }));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
});

// Alles andere (z. B. Google Fonts) beim ersten Laden mitcachen.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy));
    return res;
  })));
});
