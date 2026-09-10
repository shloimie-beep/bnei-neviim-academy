'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
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

test('Life Skills route is registered as anonymous-safe', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops', 'route-registry.json'), 'utf8'));
  const route = registry.routes.find((entry) => entry.route === '/life-skills/');
  assert.ok(route);
  assert.equal(route.access, 'public');
  assert.equal(route.public_allowed, true);
  assert.equal(route.workspace_scope_required, false);
});
