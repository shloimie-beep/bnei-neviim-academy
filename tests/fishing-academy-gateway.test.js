'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const fs = require('node:fs');
const { createFishingAcademyGateway, classify } = require('../src/lib/bna/fishing-academy-gateway');
let backend, front, upstream, origin, observed = [], enabled = true, replyCookies = null;
before(async () => {
  backend = http.createServer((req, res) => {
    const chunks = []; req.on('data', chunk => chunks.push(chunk)); req.on('end', () => {
      observed.push({ path: req.url, method: req.method, headers: req.headers, body: Buffer.concat(chunks).toString() });
      if (req.url.includes('redirect-test')) { res.writeHead(302, { Location: 'https://not-the-academy.invalid/private' }); return res.end(); }
      const cookies=replyCookies??(req.url==='/api/public/group-applications?program=sunday_fishing_academy'&&req.method==='GET'&&!req.headers.cookie?safeCookie:'private=never-forward');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': cookies, 'Content-Security-Policy': "default-src 'none'; script-src 'self' 'nonce-fixture'" });
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

for (const locale of ['en', 'he']) for (const suffix of ['', '/apply', '/pricing', '/confirm-interest', '/stages/foundation', '/stages/independent', '/stages/advanced', '/stages/leadership']) {
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

const continuation = 'ls_academy_registration=' + 's'.repeat(43);
const safeCookie = continuation + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000';
const postHeaders = () => ({ Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' });
test('counter GET is query-free, no-store and dispatches fresh reads without credentials', async () => {
  const count = observed.length;
  for(let i=0;i<2;i++){
    const response=await request('/api/public/academy-founder',{headers:{Cookie:continuation+'; bna_session=private',Authorization:'Bearer private'}});
    await response.text();assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
    assert.equal(observed.at(-1).path,'/api/public/academy-founder');assert.equal(observed.at(-1).headers.cookie,undefined);assert.equal(observed.at(-1).headers.authorization,undefined);
  }
  assert.equal(observed.length,count+2);
});
test('confirmation page GET is inert and legacy bilingual bookmarks redirect to public aliases', async()=>{
  for(const locale of ['en','he']){
    const before=observed.length;const path=(locale==='he'?'/he':'')+'/fishing-academy/confirm-interest';
    const response=await request(path);await response.text();assert.equal(response.status,200);assert.equal(observed.length,before+1);assert.equal(observed.at(-1).method,'GET');assert.equal(observed.at(-1).body,'');
    const old=await request('/'+locale+'/florida/confirm-interest');await old.text();assert.equal(old.status,308);assert.equal(old.headers.get('location'),path);
  }
});
test('explicit confirmation/read POST forwards body exactly once with canonical upstream origin',async()=>{
  for(const action of ['read_confirmation','confirm_interest']){
    const before=observed.length,body=JSON.stringify({action,token:'t'.repeat(43)});
    const response=await request('/api/public/academy-founder',{method:'POST',headers:postHeaders(),body});await response.text();
    assert.equal(response.status,200);assert.equal(observed.length,before+1);assert.equal(observed.at(-1).body,body);assert.equal(observed.at(-1).headers.origin,upstream);assert.equal(response.headers.get('set-cookie'),null);
  }
});
test('founder API query, method, origin and oversized-body boundaries reject before dispatch',async()=>{
  const before=observed.length;
  for(const options of [
    {path:'/api/public/academy-founder?token=synthetic',status:404},
    {path:'/api/public/academy-founder',method:'DELETE',status:405},
    {path:'/api/public/academy-founder',method:'HEAD',status:405},
    {path:'/api/public/academy-founder',method:'POST',headers:{...postHeaders(),Origin:'https://foreign.invalid'},body:'{}',status:403},
    {path:'/api/public/academy-founder',method:'POST',headers:postHeaders(),body:'x'.repeat(16385),status:413}
  ]){const {path,status,...init}=options,response=await request(path,init);await response.text();assert.equal(response.status,status);}
  assert.equal(observed.length,before);
});
test('initial GET challenge cookie survives POST retry and locale reads, stripping all other credentials',async()=>{
  replyCookies=[safeCookie,'bna_session=never-forward','ls_identity=never-forward'];
  try{
    const first=await request('/api/public/group-applications?program=sunday_fishing_academy');await first.text();
    assert.equal(first.status,200);assert.equal(observed.at(-1).headers.cookie,undefined);
    assert.equal(first.headers.get('set-cookie'),safeCookie);
    const browserCookie=first.headers.get('set-cookie').split(';')[0];
    // Real upstream creates continuation during GET challenge, never POST.
    for(const [locale,method] of [['en','POST'],['en','POST'],['he','GET']]){
      replyCookies='private=never-forward';
      const body=method==='POST'?JSON.stringify({locale,operationId:'same-synthetic-operation'}):undefined;
      const response=await request('/api/public/group-applications?program=sunday_fishing_academy',{method,headers:{...postHeaders(),Cookie:'bna_session=private; '+browserCookie+'; ls_identity=private',Authorization:'Bearer private'},body});
      await response.text();assert.equal(response.status,200);assert.equal(observed.at(-1).headers.cookie,continuation);assert.equal(observed.at(-1).headers.authorization,undefined);assert.equal(response.headers.get('set-cookie'),null);
    }
  }finally{replyCookies=null;}
});
test('duplicate or malformed registration cookies reject before upstream allocation',async()=>{
  const before=observed.length;
  for(const cookie of [continuation+'; '+continuation,'ls_academy_registration=short','ls_academy_registration','ls_academy_registration=','ls_academy_registration ='+ 's'.repeat(43),'ls_academy_registration=%73'+'s'.repeat(42)]){
    const response=await request('/api/public/group-applications?program=sunday_fishing_academy',{method:'POST',headers:{...postHeaders(),Cookie:cookie},body:'{}'});await response.text();assert.equal(response.status,400);
  }
  assert.equal(observed.length,before);
});
test('only exact safe upstream registration cookie can be returned, never widened or duplicated',async()=>{
  try{
    for(const cookies of [safeCookie+'; Domain=.bneineviimacademy.org',safeCookie.replace('Strict','None'),safeCookie.replace('; HttpOnly',''),[safeCookie,safeCookie],continuation+'; Path=/api']){
      replyCookies=cookies;const response=await request('/api/public/group-applications?program=sunday_fishing_academy');await response.text();assert.equal(response.status,502);assert.equal(response.headers.get('set-cookie'),null);
    }
    replyCookies=safeCookie;const post=await request('/api/public/group-applications?program=sunday_fishing_academy',{method:'POST',headers:postHeaders(),body:'{}'});await post.text();assert.equal(post.headers.get('set-cookie'),null);
    replyCookies=safeCookie;for(const path of ['/fishing-academy','/api/public/academy-founder','/groups/academy/prereg-approved-square-20261023.png']){
      const response=await request(path,{headers:{Cookie:continuation}});await response.text();assert.equal(response.status,200);assert.equal(response.headers.get('set-cookie'),null);assert.equal(observed.at(-1).headers.cookie,undefined);
    }
  }finally{replyCookies=null;}
});
test('missing, malformed or rotated challenge cookie fails closed without usable challenge or retry',async()=>{
  try{
    for(const [cookie,upstreamCookies] of [[undefined,'private=never-forward'],[continuation,safeCookie.replace('s'.repeat(43),'r'.repeat(43))],[continuation,[safeCookie,safeCookie]],[continuation,'ls_academy_registration=short']]){
      replyCookies=upstreamCookies;const before=observed.length;
      const response=await request('/api/public/group-applications?program=sunday_fishing_academy',{headers:cookie?{Cookie:cookie}:{}});
      assert.equal(response.status,502);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('set-cookie'),null);assert.deepEqual(await response.json(),{ok:false,error:{code:'UNAVAILABLE'}});assert.equal(observed.length,before+1);
    }
  }finally{replyCookies=null;}
});
test('Packet05 square admits only exact approved path',async()=>{
  const response=await request('/groups/academy/prereg-approved-square-20261023.png');await response.text();assert.equal(response.status,200);
  for(const path of ['/groups/academy/prereg-approved-square-20261023.png.bak','/groups/academy/prereg-approved-square-20261023.jpg'])assert.equal(classify(new URL(path,origin)),null);
});
