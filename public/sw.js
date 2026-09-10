const CACHE_NAME = 'bna-public-v11';
const LIFE_SKILLS_PREFIX = '/life-skills';
const APP_SHELL = [
  '/',
  '/signup.html',
  '/signup-he.html',
  '/signup-thank-you.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/favicon-32.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/images/bna-social-preview.png'
];

const PRIVATE_APP_PREFIXES = [
  '/operations',
  '/operations-login.html',
  '/parent',
  '/student',
  '/provider',
  '/rabbi-member',
  '/member',
  '/member-library',
  '/one-time-classroom'
];

function isPrivateAppPath(pathname) {
  return PRIVATE_APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
}

function isLifeSkillsPath(pathname) {
  return pathname === LIFE_SKILLS_PREFIX || pathname.startsWith(`${LIFE_SKILLS_PREFIX}/`);
}

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
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;
  if (isPrivateAppPath(url.pathname)) return;
  if (isLifeSkillsPath(url.pathname)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});
