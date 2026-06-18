const PUBLIC_CACHE = 'bna-public-v20260618';
const PUBLIC_ASSETS = ['/', '/manifest.json'];

function isOperationsPath(url) {
  return url.pathname.startsWith('/operations') || url.pathname === '/operations-login.html';
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PUBLIC_CACHE).then((cache) => cache.addAll(PUBLIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('bna-public-') && key !== PUBLIC_CACHE).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || isOperationsPath(url)) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
