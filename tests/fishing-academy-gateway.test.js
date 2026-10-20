'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const fs = require('node:fs');
const { createFishingAcademyGateway, classify } = require('../src/lib/bna/fishing-academy-gateway');
let backend, front, upstream, origin, observed = [], enabled = true;
before(async () => {
  backend = http.createServer((req, res) => {
    const chunks = []; req.on('data', chunk => chunks.push(chunk)); req.on('end', () => {
      observed.push({ path: req.url, method: req.method, headers: req.headers, body: Buffer.concat(chunks).toString() });
      if (req.url.includes('redirect-test')) { res.writeHead(302, { Location: 'https://not-the-academy.invalid/private' }); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': 'private=never-forward', 'Content-Security-Policy': "default-src 'none'; script-src 'self' 'nonce-fixture'" });
      res.end(JSON.stringify({ received: true }));
    });
  }); backend.listen(0, '127.0.0.1'); await once(backend, 'listening'); upstream = 'http://127.0.0.1:' + backend.address().port;
  front = http.createServer((req, res) => handler(req, res, () => { res.writeHead(418); res.end('existing school route'); }));
  front.listen(0, '127.0.0.1'); await once(front, 'listening'); origin = 'http://127.0.0.1:' + front.address().port;
  handler = createFishingAcademyGateway({ enabled: () => enabled, origin, upstream, transport: http });
});
let handler;
after(async () => { await Promise.all([new Promise(resolve => front.close(resolve)), new Promise(resolve => backend.close(resolve))]); });
const request = (path, options = {}) => fetch(origin + path, { ...options, redirect: 'manual' });

for (const locale of ['en', 'he']) for (const suffix of ['', '/apply', '/pricing', '/stages/foundation', '/stages/independent', '/stages/advanced', '/stages/leadership']) {
  const path = (locale === 'he' ? '/he/fishing-academy' : '/fishing-academy') + suffix;
  test('exact public route ' + path, async () => { const response = await request(path); await response.text(); assert.equal(response.status, 200); assert.equal(observed.at(-1).path, '/' + locale + '/florida' + suffix); assert.equal(observed.at(-1).headers['x-jlfa-public-site'], 'bna-v1'); });
}
test('default disabled leaves school root and Academy path with existing router', async () => {
  enabled = false; const beforeCount = observed.length; for (const path of ['/', '/fishing-academy']) { const response = await request(path); assert.equal(response.status, 418); assert.equal(await response.text(), 'existing school route'); } assert.equal(observed.length, beforeCount); enabled = true;
});
test('school home, private, payment and unrelated application routes are never proxied', async () => {
  const count = observed.length;
  for (const path of ['/', '/student.html', '/api/identity/session', '/api/webhooks/stripe/test', '/api/payments', '/api/public/group-applications/private', '/groups/other.png', '/_next/image?url=private', '/_next/static/secret.map']) { const response = await request(path); await response.text(); assert.equal(response.status, 418); }
  assert.equal(observed.length, count);
});
test('unknown Academy child and invalid inquiry program fail closed', async () => {
  const count = observed.length;
  for (const path of ['/fishing-academy/private', '/he/fishing-academy/stages/unknown', '/api/public/group-applications', '/api/public/group-applications?program=private_fishing_life_skills', '/api/public/group-applications?program=sunday_fishing_academy&program=sunday_fishing_academy']) { const response = await request(path); await response.text(); assert.equal(response.status, 404); }
  assert.equal(observed.length, count);
});
test('old BNA Academy bookmarks redirect to matching new locale and child path', async () => {
  const count = observed.length; const response = await request('/he/florida/stages/advanced'); await response.text(); assert.equal(response.status, 308); assert.equal(response.headers.get('location'), '/he/fishing-academy/stages/advanced'); assert.equal(observed.length, count);
});
test('POST body is forwarded once unchanged, with canonical origin and no BNA credential headers', async () => {
  const body = JSON.stringify({ operationId: 'synthetic-gateway-1', fields: { parentName: 'Synthetic gateway verification', academyIntake: { driveLimit: 70, nextStep: 'callback' } } });
  const response = await request('/api/public/group-applications?program=sunday_fishing_academy', { method: 'POST', headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json', Cookie: 'bna_session=secret_fixture', Authorization: 'Bearer never-forward', 'X-Nonce': 'untrusted' }, body });
  await response.text(); assert.equal(response.status, 200); const entry = observed.at(-1); assert.equal(entry.body, body); assert.equal(entry.headers.origin, upstream); assert.equal(entry.headers['sec-fetch-site'], 'same-origin'); assert.equal(entry.headers.cookie, undefined); assert.equal(entry.headers.authorization, undefined); assert.equal(entry.headers['x-nonce'], undefined); assert.equal(response.headers.get('set-cookie'), null);
});
test('cross-site, absent origin, form content type and foreign-host forwarding are denied before dispatch', async () => {
  const count = observed.length;
  const url = '/api/public/group-applications?program=sunday_fishing_academy';
  for (const headers of [{ Origin: 'https://evil.invalid', 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' }, { 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' }, { Origin: origin, 'Sec-Fetch-Site': 'cross-site', 'Content-Type': 'application/json' }, { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/x-www-form-urlencoded' }]) { const response = await request(url, { method: 'POST', headers, body: '{}' }); await response.text(); assert.equal(response.status, 403); }
  const response = await request('/fishing-academy', { headers: { 'X-Forwarded-Proto': 'https,http' } }); await response.text(); assert.equal(response.status, 400); assert.equal(observed.length, count);
});
test('original 16KiB inquiry limit is enforced before an upstream request', async () => {
  const count = observed.length; const response = await request('/api/public/group-applications?program=sunday_fishing_academy', { method: 'POST', headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' }, body: 'x'.repeat(16385) }); await response.text(); assert.equal(response.status, 413); assert.equal(observed.length, count);
});
test('unsupported methods cannot mutate pages or assets', async () => { const count = observed.length; for (const path of ['/fishing-academy', '/groups/brand/jlfa-logo-locked-v1.png']) { const response = await request(path, { method: 'POST', body: '{}' }); await response.text(); assert.equal(response.status, 405); } assert.equal(observed.length, count); });
test('only named assets and compiled static JS/CSS/font types are selected', () => {
  for (const path of ['/groups/academy/scenes/foundation.webp', '/_next/static/chunks/app/%5Blocale%5D/page.js', '/_next/static/css/app/layout.css']) assert.equal(classify(new URL(path, origin)).kind, 'asset');
  for (const path of ['/groups/private.png', '/_next/static/secret.map', '/_next/static/%2Fprivate.js', '/_next/static/../private.js', '/_next/hmr']) assert.equal(classify(new URL(path, origin)), null);
});
test('strict upstream CSP is retained and cookies are stripped', async () => { const response = await request('/fishing-academy'); await response.text(); assert.equal(response.headers.get('content-security-policy'), "default-src 'none'; script-src 'self' 'nonce-fixture'"); assert.equal(response.headers.get('set-cookie'), null); assert.equal(response.headers.get('x-frame-options'), 'DENY'); });

for (const path of ['/groups/academy/hero-desktop-20261018.png', '/groups/academy/hero-mobile-20261018.png']) {
  test('exact text-free master is proxied without credentials for GET and HEAD: ' + path, async () => {
    for (const method of ['GET', 'HEAD']) {
      const response = await request(path, {method, headers: {Cookie: 'bna_session=never-forward', Authorization: 'Bearer never-forward'}});
      await response.text(); assert.equal(response.status, 200);
      const entry = observed.at(-1); assert.equal(entry.path, path); assert.equal(entry.method, method);
      assert.equal(entry.headers.cookie, undefined); assert.equal(entry.headers.authorization, undefined); assert.equal(response.headers.get('set-cookie'), null);
    }
    const count = observed.length; const denied = await request(path, {method: 'POST', body: '{}'}); await denied.text(); assert.equal(denied.status, 405); assert.equal(observed.length, count);
  });
}
test('text-free master additions do not admit variants or arbitrary Academy images', () => {
  for (const path of ['/groups/academy/private.png', '/groups/academy/hero-desktop-20261018.png.bak', '/groups/academy/hero-mobile-20261018.jpg']) assert.equal(classify(new URL(path, origin)), null);
});
test('no redirect can escape to an arbitrary upstream or private route', async () => { const response = await request('/fishing-academy?redirect-test=1'); await response.text(); assert.equal(response.status, 502); assert.equal(response.headers.get('location'), null); });
test('actual BNA mount precedes body parser, with explicit off-by-default switch', () => { const source = fs.readFileSync(require.resolve('../server.js'), 'utf8'); assert.ok(source.indexOf('createFishingAcademyGateway({ enabled:') < source.indexOf('app.use(express.json(')); assert.match(source, /BNA_ACADEMY_GATEWAY_ENABLED === 'true'/); });
