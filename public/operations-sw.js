const OPERATIONS_CACHE = 'bna-operations-v20260618';
const OPERATIONS_ASSETS = ['/operations', '/operations-manifest.json'];

function isOperationsPath(url) {
  return url.pathname.startsWith('/operations');
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(OPERATIONS_CACHE).then((cache) => cache.addAll(OPERATIONS_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('bna-operations-') && key !== OPERATIONS_CACHE).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || !isOperationsPath(url)) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
