'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createTorahInterestGateway, createCoopInterestGateway, createSupportInterestGateway, createBnaPreferencesGateway } = require('../src/lib/bna/torah-interest-gateway');

let backend, front, origin, upstream, enabled = true, coopEnabled = true, supportEnabled = true, preferencesEnabled = true;
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
  front = http.createServer((req, res) => createTorahInterestGateway({ enabled: () => enabled, origin, upstream, transport: http })(req, res, () => createCoopInterestGateway({enabled:()=>coopEnabled,origin,upstream,transport:http})(req,res,()=>createSupportInterestGateway({enabled:()=>supportEnabled,origin,upstream,transport:http})(req,res,()=>createBnaPreferencesGateway({enabled:()=>preferencesEnabled,origin,upstream,transport:http})(req,res,()=>{res.writeHead(418);res.end('existing route');})))));
  front.listen(0, '127.0.0.1'); await once(front, 'listening'); origin = 'http://127.0.0.1:' + front.address().port;
});
after(async () => { await Promise.all([new Promise(resolve => front.close(resolve)), new Promise(resolve => backend.close(resolve))]); });
const request = (path, options) => fetch(origin + path, options);
test('preferences relay forwards one body to its exact native endpoint with no browser credentials or token in URL',async()=>{
 const body=JSON.stringify({action:'update',token:'synthetic-capability',command:{action:'unsubscribe_all',operationId:'synthetic-operation'}}),count=observed.length;
 const options={method:'POST',headers:{Origin:origin,'Sec-Fetch-Site':'same-origin','Content-Type':'application/json',Cookie:'private=secret',Authorization:'Bearer secret'},body};
 assert.equal((await request('/api/bna/preferences',options)).status,200);
 const last=observed.at(-1);assert.equal(last.path,'/api/public/bna-preferences');assert.equal(last.body,body);assert.equal(last.headers.cookie,undefined);assert.equal(last.headers.authorization,undefined);assert.equal(observed.length,count+1);
 assert.equal((await request('/api/bna/preferences?token=must-not-be-in-url',options)).status,404);assert.equal(observed.length,count+1);
 preferencesEnabled=false;assert.equal((await request('/api/bna/preferences',options)).status,418);preferencesEnabled=true;assert.equal(observed.length,count+1);
});

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


test('co-op gateway has its own exact route and independent gate', async () => {
  const count=observed.length;
  const response=await request('/api/bna/coop-interest',{headers:{Cookie:'private=secret',Authorization:'Bearer secret'}});
  assert.equal(response.status,200);assert.equal(observed.at(-1).path,'/api/public/bna-coop-inquiries');
  assert.equal(observed.at(-1).headers.cookie,undefined);assert.equal(observed.at(-1).headers.authorization,undefined);
  assert.equal((await request('/api/bna/coop-interest?program=other')).status,404);
  coopEnabled=false;assert.equal((await request('/api/bna/coop-interest')).status,418);coopEnabled=true;
  assert.equal(observed.length,count+1);
});

test('support uses its own fixed upstream, strips credentials and stays independently gated',async()=>{
 const count=observed.length,body=JSON.stringify({operationId:'synthetic-support-operation',fields:{purpose:'support_conversation'}});
 const response=await request('/api/bna/support-interest',{method:'POST',headers:{Origin:origin,'Sec-Fetch-Site':'same-origin','Content-Type':'application/json',Cookie:'private=synthetic',Authorization:'Bearer synthetic'},body});
 assert.equal(response.status,200);assert.equal(observed.at(-1).path,'/api/public/bna-support-inquiries');assert.equal(observed.at(-1).body,body);
 assert.equal(observed.at(-1).headers.cookie,undefined);assert.equal(observed.at(-1).headers.authorization,undefined);
 assert.equal((await request('/api/bna/support-interest?program=coop')).status,404);
 supportEnabled=false;assert.equal((await request('/api/bna/support-interest')).status,418);supportEnabled=true;
 assert.equal(observed.length,count+1);
});
