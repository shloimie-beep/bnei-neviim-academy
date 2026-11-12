const CACHE_NAME = 'bna-public-v12';
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

function isFishingGatewayPath(pathname) {
  // The gateway serves these URLs from a separate application. Its HTML,
  // RSC responses and images must never use a school shell or cached HTML.
  return /^\/(?:he\/)?fishing-academy(?:\/|$)/.test(pathname) ||
    /^\/(?:en|he)\/florida(?:\/|$)/.test(pathname) ||
    pathname.startsWith('/groups/') || pathname.startsWith('/_next/static/') ||
    pathname === '/fonts/Heebo-wght.ttf' || pathname === '/fonts/FrankRuhlLibre-wght.ttf';
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
      .then((keys) => Promise.all(keys.filter((key) => /^bna-public-v\d+$/.test(key) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isFishingGatewayPath(url.pathname)) return;
  // Old installs may still request these retired public launch icons.
  if (/^\/icons\/icon(?:-192|-512)?\.svg$/.test(url.pathname)) {
    event.respondWith(fetch(request, { cache: 'reload' }));
    return;
  }
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
      .catch(() => caches.open(CACHE_NAME).then(async (cache) => (await cache.match(request)) || cache.match('/')))
  );
});
