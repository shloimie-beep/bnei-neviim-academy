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
  assert.match(home, /href="\/join"/);
  assert.match(home, /\/fishing-academy/);
  assert.match(home, /\/support/);
});

test('short BNA inquiry is distinct from historical registration and preserves exact consent scope', () => {
  for (const name of ['name','contactChannel','contact','language','townOrZip','childAge']) assert.match(inquiry, new RegExp('name="'+name+'"'));
  assert.match(inquiry, /Please keep my inquiry privately and contact me about the first Torah-morning group/);
  assert.match(inquiry, /פנייה זו אינה רושמת ילד/);
  assert.match(inquiry, /<input type="checkbox" name="purposeConsent" required>/);
  assert.match(client, /confirmed:form\.elements\.namedItem\('purposeConsent'\)\.checked/);
  assert.match(client, /BNA-TORAH-MORNING-INTEREST-20261028-v1/);
  assert.match(client, /\/api\/bna\/interest/);
  assert.doesNotMatch(inquiry, /\/api\/submit|payment_method|full name of child/i);
});

test('305 contact is one shared configuration and donation is a separate truthful path', () => {
  assert.match(client, /display: '\+1 \(305\) 491-6674'/);
  assert.match(client, /tel: 'tel:\+13054916674'/);
  assert.match(client, /whatsapp: 'https:\/\/wa\.me\/13054916674'/);
  for (const page of [home,inquiry]) assert.match(page, /data-bna-phone/);
  assert.match(support, /href="tel:\+13054916674"/);
  assert.match(support, /This form saves a support inquiry\. No donation or payment is collected here\./);
  assert.match(support, /name="purpose"/);
  assert.doesNotMatch(support, /https:\/\/(?:stripe|paypal)|tax-deductible/i);
});


test('new co-op homepage keeps the locked hero, direct program links and owner entry', () => {
  for (const copy of ['Raising the Generation of the Geulah','South Florida Integrative Torah Learning Co-op for Boys','An autonomous Torah learning community manifesting Geulah consciousness through authentic relationships, intrinsic motivation, and self-governance.','Join the Learning Co-op','Free to register your interest.']) assert.ok(home.includes(copy));
  for (const route of ['/join','/he/join','/fishing-academy/apply','/he/fishing-academy/apply','/fishing-academy','/support','/providers','/blog']) assert.ok(home.includes(`href="${route}"`));
  assert.match(home,/life-skills\.bneineviimacademy\.org\/en\/login\?next=%2Fen%2Fapp%2Fclients/);
  assert.match(home,/images\/sitting%20on%20grass\.jpg/);
  assert.match(home,/Earlier BNA teaching/);
  assert.match(home,/fishing-academy-logo-locked\.png/);
});
