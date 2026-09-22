const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const parentManifest = JSON.parse(fs.readFileSync('public/parent-manifest.json', 'utf8'));
const serviceWorker = fs.readFileSync('public/sw.js', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('parent PWA install stays scoped to the parent portal', () => {
  assert.equal(parentManifest.id, '/parent');
  assert.equal(parentManifest.start_url, '/parent?source=parent-pwa');
  assert.equal(parentManifest.scope, '/parent');
  assert.equal(parentManifest.display, 'standalone');
  assert.equal(parentManifest.orientation, 'portrait-primary');
  assert.equal(parentManifest.icons[0].src, '/icons/parent-icon.svg');
  assert.match(parentHtml, /<link rel="manifest" href="\/parent-manifest\.json">/);
  assert.doesNotMatch(serviceWorker, /\/parent-manifest\.json/);
  assert.match(serviceWorker, /PRIVATE_APP_PREFIXES/);
  assert.match(serviceWorker, /'\/parent'/);
  assert.doesNotMatch(parentManifest.start_url, /operations/i);
});

test('parent setup panel exposes install prompt and resume state', () => {
  assert.match(parentHtml, /data-parent-install-app/);
  assert.match(parentHtml, /data-parent-install-status/);
  assert.match(parentHtml, /beforeinstallprompt/);
  assert.match(parentHtml, /deferredParentInstallPrompt/);
  assert.match(parentHtml, /promptParentInstall/);
  assert.match(parentHtml, /installParentAppFallback/);
  assert.match(parentHtml, /PARENT_SECTION_STORAGE_KEY/);
  assert.match(parentHtml, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(parentHtml, /params\.get\('section'\)/);
  assert.match(parentHtml, /window\.history\.replaceState/);
  assert.match(parentHtml, /setParentSection\(section, \{ scroll = true, updateUrl = true \} = \{\}\)/);
});

test('parent filter setup APIs are scoped, statusful, and no remote control', () => {
  assert.match(server, /function filterSetupPayload\(context\)/);
  assert.match(server, /remote_control_enabled: false/);
  assert.match(server, /safe_mode: 'guided_checklist_parent_submits_status'/);
  assert.match(server, /app\.get\('\/api\/household\/filter-setup'/);
  assert.match(server, /app\.post\('\/api\/household\/filter-setup\/start'/);
  assert.match(server, /filter_setup_status = 'instructions_sent'/);
  assert.match(server, /app\.post\('\/api\/household\/filter-setup\/submit-code'/);
  assert.match(server, /if \(!code && !notes\) return res\.status\(400\)/);
  assert.match(server, /filter_setup_status = 'submitted'/);
  assert.match(server, /filter_setup_code = COALESCE/);
  assert.match(server, /filter_setup_submitted_at/);
  assert.match(server, /requireHouseholdContext\(req\)/);
});
