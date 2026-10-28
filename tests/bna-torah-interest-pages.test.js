'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('server.js','utf8');
const home = fs.readFileSync('public/bna-current-home.html','utf8');
const inquiry = fs.readFileSync('public/torah-mornings.html','utf8');
const support = fs.readFileSync('public/support.html','utf8');
const client = fs.readFileSync('public/js/bna-torah-interest.js','utf8');

test('active BNA root and Hebrew root serve the current hub, while One Time retains its own landing', () => {
  assert.match(server, /if \(isOneTimeSingleTenantRuntime\(\)\) return sendOneTimePublicLanding\(req, res\);[\s\S]{0,150}bna-current-home\.html/);
  assert.match(server, /app\.get\('\/he', [\s\S]{0,220}bna-current-home\.html/);
  assert.doesNotMatch(home, /7 Spots Left|Registration Is Open for This Year|HaChozeh MiLublin|Beit Shemesh/);
  assert.match(home, /\/torah-mornings/);
  assert.match(home, /\/fishing-academy/);
  assert.match(home, /\/support/);
});

test('short BNA inquiry is distinct from historical registration and preserves exact consent scope', () => {
  for (const name of ['name','contactChannel','contact','language','townOrZip','childAge']) assert.match(inquiry, new RegExp('name="'+name+'"'));
  assert.match(inquiry, /Please keep my inquiry privately and contact me about the first Torah-morning group/);
  assert.match(inquiry, /פנייה זו אינה רושמת ילד/);
  assert.match(client, /BNA-TORAH-MORNING-INTEREST-20261028-v1/);
  assert.match(client, /\/api\/bna\/interest/);
  assert.doesNotMatch(inquiry, /\/api\/submit|payment_method|full name of child/i);
});

test('305 contact is one shared configuration and donation is a separate truthful path', () => {
  assert.match(client, /display: '\+1 \(305\) 491-6674'/);
  assert.match(client, /tel: 'tel:\+13054916674'/);
  assert.match(client, /whatsapp: 'https:\/\/wa\.me\/13054916674'/);
  for (const page of [home,inquiry,support]) assert.match(page, /data-bna-phone/);
  assert.match(support, /verifying the donation destination and payee/);
  assert.doesNotMatch(support, /https:\/\/(?:stripe|paypal)|tax-deductible/i);
});
