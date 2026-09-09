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

function filesBelow(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(root, entry.name);
    return entry.isDirectory() ? filesBelow(target) : [target];
  });
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

test('public artifact excludes the unverified LB testimonial and associated image', () => {
  const allFiles = filesBelow(SITE);
  assert.equal(allFiles.some((file) => /l-bars|testimonial/i.test(path.basename(file))), false);
  const publicText = allFiles
    .filter((file) => /\.(?:html|js|css|json|txt|svg)$/i.test(file))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');
  for (const marker of ['Medication is no longer relevant', 'l-bars-2024', 'PrivateTestimonial', 'L Bars, 2024']) {
    assert.equal(publicText.includes(marker), false, marker);
  }
});

test('Life Skills route is registered as anonymous-safe', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops', 'route-registry.json'), 'utf8'));
  const route = registry.routes.find((entry) => entry.route === '/life-skills/');
  assert.ok(route);
  assert.equal(route.access, 'public');
  assert.equal(route.public_allowed, true);
  assert.equal(route.workspace_scope_required, false);
});
