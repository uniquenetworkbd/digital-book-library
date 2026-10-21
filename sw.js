const CACHE_NAME = 'digital-book-library-v2-cache-v2';
const APP_SHELL = [
  './',
  './index.html',
  './reader.html',
  './creator.html',
  './dashboard.html',
  './manifest.json',
  './assets/css/main.css',
  './assets/css/reader.css',
  './assets/css/editor.css',
  './assets/css/bot.css',
  './assets/css/dashboard.css',
  './assets/js/app.js',
  './assets/js/reader.js',
  './assets/js/editor.js',
  './assets/js/db.js',
  './assets/js/bot.js',
  './assets/js/ai-engine.js',
  './assets/js/tts-engine.js',
  './assets/js/ui-enhancements.js',
  './assets/js/backup-engine.js',
  './assets/js/dashboard.js',
  './data/catalog.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
