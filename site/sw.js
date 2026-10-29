// sw.js: the service worker that lets What I Meant live on a home screen.
//
// Every request goes to the network first, so a copy on the home screen always shows the
// newest version as soon as there is a connection; whatever arrives is also saved, and the
// saved copy answers when there is no connection. Nothing has to be bumped by hand on a
// release. The Google Fonts files are saved the same way.

const CACHE = 'wim-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const ours = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!ours && !fonts) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const fresh = await fetch(request, { cache: 'no-cache' });
      if (fresh.ok) cache.put(request, fresh.clone());
      return fresh;
    } catch (error) {
      const saved = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
      if (saved) return saved;
      throw error;
    }
  })());
});
