'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createTorahInterestGateway } = require('../src/lib/bna/torah-interest-gateway');

let backend, front, origin, upstream, enabled = true;
const observed = [];
before(async () => {
  backend = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      observed.push({ path: req.url, method: req.method, headers: req.headers, body: Buffer.concat(chunks).toString() });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(req.method === 'GET' ? { challenge: 'fixture-challenge', noticeVersion: 'v1' } : { saved: true, reference: 'fixture-reference', replayed: false }));
    });
  });
  backend.listen(0, '127.0.0.1'); await once(backend, 'listening');
  upstream = 'http://127.0.0.1:' + backend.address().port;
  front = http.createServer((req, res) => createTorahInterestGateway({ enabled: () => enabled, origin, upstream, transport: http })(req, res, () => { res.writeHead(418); res.end('existing route'); }));
  front.listen(0, '127.0.0.1'); await once(front, 'listening'); origin = 'http://127.0.0.1:' + front.address().port;
});
after(async () => { await Promise.all([new Promise(resolve => front.close(resolve)), new Promise(resolve => backend.close(resolve))]); });
const request = (path, options) => fetch(origin + path, options);

test('GET challenge uses exact upstream route and no browser credentials', async () => {
  const response = await request('/api/bna/interest', { headers: { Cookie: 'bna_session=secret', Authorization: 'Bearer secret' } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).challenge, 'fixture-challenge');
  const last = observed.at(-1);
  assert.equal(last.path, '/api/public/bna-inquiries');
  assert.equal(last.headers.cookie, undefined);
  assert.equal(last.headers.authorization, undefined);
  assert.equal(last.headers.origin, upstream);
});

test('POST forwards one exact payload and never forwards private headers', async () => {
  const body = JSON.stringify({ challenge: 'fixture', operationId: 'same-key', fields: { name: 'Synthetic Parent' } });
  const count = observed.length;
  const response = await request('/api/bna/interest', { method: 'POST', headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json', Cookie: 'bna_session=secret', Authorization: 'Bearer secret' }, body });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { saved: true, reference: 'fixture-reference', replayed: false });
  assert.equal(observed.length, count + 1);
  assert.equal(observed.at(-1).body, body);
  assert.equal(observed.at(-1).headers.cookie, undefined);
  assert.equal(observed.at(-1).headers.authorization, undefined);
});

test('cross-site requests, query variation and large bodies fail closed', async () => {
  const count = observed.length;
  const bad = [
    await request('/api/bna/interest?program=fishing'),
    await request('/api/bna/interest', { method: 'POST', headers: { Origin: 'https://evil.invalid', 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' }, body: '{}' }),
    await request('/api/bna/interest', { method: 'POST', headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' }, body: 'x'.repeat(16385) }),
  ];
  for (const response of bad) assert.ok(response.status >= 400);
  assert.equal(observed.length, count);
});

test('only exact route on configured host is bridged', async () => {
  const count = observed.length;
  assert.equal((await request('/api/bna/interest/other')).status, 418);
  enabled = false;
  assert.equal((await request('/api/bna/interest')).status, 418);
  enabled = true;
  assert.equal(observed.length, count);
});
