'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'public', 'life-skills');

function read(relative) {
  return fs.readFileSync(path.join(SITE, relative), 'utf8');
}

test('publishes the bilingual Life Skills static entrypoint and approved assets', () => {
  const html = read('index.html');
  const config = read('assets/js/config.js');
  const bundle = read('assets/js/site-react.js');
  const css = read('assets/css/site.css');

  assert.match(html, /content="index, follow"/);
  assert.match(html, /assets\/js\/site-react\.js\?v=/);
  assert.match(config, /whatsappNumber: "972534932631"/);
  assert.match(bundle, /https:\/\/wa\.me\/972534932631/);
  assert.match(bundle, /floating-whatsapp/);
  assert.match(html, /טיפול רגשי לבנים/);
  assert.match(bundle, /Emotional Therapy for Boys/);
  assert.match(css, /Frank Ruhl Libre/);
  assert.match(css, /Heebo/);
  for (const required of [
    'assets/fonts/FrankRuhlLibre-wght.ttf',
    'assets/fonts/Heebo-wght.ttf',
    'assets/images/founder-boy-hero-desktop.webp',
    'assets/images/founder-boy-hero-mobile.webp',
    'assets/images/meir-bunny.png',
  ]) {
    assert.ok(fs.statSync(path.join(SITE, required)).size > 0, required);
  }
});

test('public artifact keeps only the owner-confirmed LB testimonial treatment', () => {
  const config = read('assets/js/config.js');
  const bundle = read('assets/js/site-react.js');

  assert.match(config, /testimonialConsentOwnerConfirmed: true/);
  assert.match(config, /testimonialConsentReference: "LS-LB-CONSENT-20260909-001"/);
  assert.match(bundle, /Medication is no longer relevant/);
  assert.match(bundle, /images\/l-bars-2024\.png/);
  assert.ok(fs.statSync(path.join(SITE, 'assets/images/l-bars-2024.png')).size > 0);
  assert.doesNotMatch(bundle, /L Bars, 2024/);
});

test('public artifact includes the current owner logo, testimonial order, and monthly pricing corrections', () => {
  const bundle = read('assets/js/site-react.js');
  const decodedBundle = bundle.replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
  const css = read('assets/css/site.css');
  const logo = fs.readFileSync(path.join(SITE, 'assets/images/LS_LOGO_HE_LEAF_APPROVED_20260910.png'));

  assert.equal(crypto.createHash('sha256').update(logo).digest('hex'), 'a95609b2ce76f5062be6619e5131430f11b99d7579148affebb2b545f66cc07c');
  assert.match(bundle, /brand-hebrew-logo/);
  assert.match(bundle, /Life Skills/);
  assert.match(decodedBundle, /₪2,200 for four sessions a month\./);
  assert.match(decodedBundle, /2,200 ₪ לארבעה מפגשים בחודש\./);
  assert.doesNotMatch(decodedBundle, /₪550 for an individual 60-minute session/);
  assert.doesNotMatch(decodedBundle, /550 ₪ למפגש אישי של 60 דקות/);
});

test('Life Skills route is registered as anonymous-safe', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops', 'route-registry.json'), 'utf8'));
  const route = registry.routes.find((entry) => entry.route === '/life-skills/');
  assert.ok(route);
  assert.equal(route.access, 'public');
  assert.equal(route.public_allowed, true);
  assert.equal(route.workspace_scope_required, false);
});
