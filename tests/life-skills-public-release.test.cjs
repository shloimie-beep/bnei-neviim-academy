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
    'assets/images/founder-boy-hero-en-desktop.png',
    'assets/images/founder-boy-hero-en-mobile.png',
    'assets/images/founder-boy-hero-he-desktop.png',
    'assets/images/founder-boy-hero-he-mobile.png',
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

test('public artifact includes the approved UX refinement', () => {
  const bundle = read('assets/js/site-react.js');
  const decodedBundle = bundle.replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
  const css = read('assets/css/site.css');

  assert.match(bundle, /The Life Skills approach/);
  assert.match(bundle, /Intrinsic motivation/);
  assert.match(bundle, /Self-governance/);
  assert.match(bundle, /Handling frustration/);
  assert.match(decodedBundle, /הגישה של כישורי חיים/);
  assert.match(css, /border:2px solid var\(--gold\)/);
  assert.match(css, /object-position:66% 50%/);
  assert.match(bundle, /footer-whatsapp/);
  assert.match(bundle, /footer-phone/);
  assert.match(bundle, /hero-semantics/);
  assert.doesNotMatch(bundle, /hero-photo-support/);
  assert.match(bundle, /mobile-language-direct/);
  assert.match(bundle, /Message on WhatsApp/);
  assert.match(decodedBundle, /שלחו הודעה בוואטסאפ/);
  assert.match(css, /left:8\.501594%/);
  assert.match(css, /width:83\.103082%/);
  assert.match(css, /white-space:nowrap/);
});

test('public hero files match the four exact owner-approved masters', () => {
  const expected = {
    'founder-boy-hero-en-mobile.png': 'ee2924444efc3d21dda5186b3a1107c3fde935ce4c76ded75ae3458aa99c7a71',
    'founder-boy-hero-he-mobile.png': '56dc8fcbe99f16d723a8b07b41eda8ebb03eb27716829b8c786f27b82a3ddcbe',
    'founder-boy-hero-en-desktop.png': '5c28d22d7b6b784eb6becb4cfabb7977c80a304b5bcaca93943564ed74394f50',
    'founder-boy-hero-he-desktop.png': '74c7d3258770abdab5c146e1211c4cbd16e0738840d5c274390f9a707f8dd824',
  };
  for (const [name, sha256] of Object.entries(expected)) {
    const bytes = fs.readFileSync(path.join(SITE, 'assets', 'images', name));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), sha256, name);
  }
});

test('Life Skills route owns its favicon, install identity, and social metadata', () => {
  const html = read('index.html');
  const manifest = JSON.parse(read('manifest.webmanifest'));

  assert.match(html, /href="favicon\.ico"/);
  assert.match(html, /href="icons\/apple-touch-icon\.png"/);
  assert.match(html, /href="manifest\.webmanifest"/);
  assert.match(html, /rel="canonical" href="https:\/\/bneineviimacademy\.org\/life-skills\/"/);
  assert.match(html, /property="og:image" content="https:\/\/bneineviimacademy\.org\/life-skills\/assets\/images\/life-skills-social-preview\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(html, /Bnei Nevi['’]im Academy/);
  assert.equal(manifest.scope, '/life-skills/');
  assert.equal(manifest.start_url, '/life-skills/?lang=he');
  assert.equal(manifest.icons[0].src, 'icons/icon-192.png');
  for (const required of [
    'favicon.ico',
    'icons/favicon-16.png',
    'icons/favicon-32.png',
    'icons/apple-touch-icon.png',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'assets/images/life-skills-social-preview.png',
  ]) {
    assert.ok(fs.statSync(path.join(SITE, required)).size > 0, required);
  }
});

test('all Life Skills WhatsApp controls use the verified direct destination', () => {
  const bundle = read('assets/js/site-react.js');
  assert.match(bundle, /https:\/\/wa\.me\/972534932631/);
  assert.doesNotMatch(bundle, /searchParams\.set\("text"/);
  assert.doesNotMatch(bundle, /[?&]text=/);
});

test('Life Skills route is registered as anonymous-safe', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops', 'route-registry.json'), 'utf8'));
  const route = registry.routes.find((entry) => entry.route === '/life-skills/');
  assert.ok(route);
  assert.equal(route.access, 'public');
  assert.equal(route.public_allowed, true);
  assert.equal(route.workspace_scope_required, false);
});
