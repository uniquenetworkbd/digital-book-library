const CACHE_NAME = 'digital-book-library-v2-cache-v3';
const APP_SHELL = [
  './', './index.html', './reader.html', './creator.html', './dashboard.html', './manifest.json',
  './assets/css/main.css', './assets/css/reader.css', './assets/css/editor.css', './assets/css/bot.css', './assets/css/dashboard.css',
  './assets/js/app.js', './assets/js/reader.js', './assets/js/editor.js', './assets/js/db.js', './assets/js/bot.js',
  './assets/js/ai-engine.js', './assets/js/tts-engine.js', './assets/js/ui-enhancements.js', './assets/js/backup-engine.js',
  './assets/js/dashboard.js', './assets/js/pwa.js', './assets/icons/icon.svg', './data/catalog.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok && response.type === 'basic') {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request).catch(() => caches.match('./index.html')));
    return;
  }

  // Book JSON and catalog data use network-first so published updates become visible,
  // while previously visited books remain readable offline.
  if (url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
