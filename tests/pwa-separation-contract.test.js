const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const publicManifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
const operationsManifest = JSON.parse(fs.readFileSync('public/operations-manifest.json', 'utf8'));
const parentManifest = JSON.parse(fs.readFileSync('public/parent-manifest.json', 'utf8'));
const serviceWorker = fs.readFileSync('public/sw.js', 'utf8');
const publicHome = fs.readFileSync('public/index.html', 'utf8');
const parentPortal = fs.readFileSync('public/parent.html', 'utf8');
const operationsLogin = fs.readFileSync('public/operations-login.html', 'utf8');
const operationsApp = fs.readFileSync('public/operations.html', 'utf8');

test('public, parent, and Operations PWAs keep separate launch identities', () => {
  assert.equal(publicManifest.id, '/');
  assert.equal(publicManifest.start_url, '/?source=public-pwa');
  assert.equal(publicManifest.scope, '/');

  assert.equal(operationsManifest.id, '/operations');
  assert.equal(operationsManifest.start_url, '/operations?source=ops-pwa');
  assert.equal(operationsManifest.scope, '/operations');
  assert.equal(operationsManifest.icons[0].src, '/icons/operations-icon.svg');

  assert.equal(parentManifest.id, '/parent');
  assert.equal(parentManifest.start_url, '/parent?source=parent-pwa');
  assert.equal(parentManifest.scope, '/parent');
  assert.equal(parentManifest.icons[0].src, '/icons/parent-icon.svg');

  assert.notEqual(publicManifest.start_url, operationsManifest.start_url);
  assert.notEqual(publicManifest.start_url, parentManifest.start_url);
  assert.notEqual(parentManifest.start_url, operationsManifest.start_url);
});

test('public service worker caches only the anonymous public shell', () => {
  assert.match(serviceWorker, /const CACHE_NAME = 'bna-public-v10'/);
  assert.match(serviceWorker, /const PRIVATE_APP_PREFIXES = \[/);
  for (const privatePrefix of [
    "'/operations'",
    "'/operations-login.html'",
    "'/parent'",
    "'/student'",
    "'/provider'",
  ]) {
    assert.match(serviceWorker, new RegExp(privatePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(serviceWorker, /if \(isPrivateAppPath\(url\.pathname\)\) return;/);
  assert.doesNotMatch(serviceWorker, /\/operations-manifest\.json/);
  assert.doesNotMatch(serviceWorker, /\/parent-manifest\.json/);
});

test('public and private shells point at the correct manifest and worker policy', () => {
  assert.match(publicHome, /<link rel="manifest" href="\/manifest\.json">/);
  assert.match(parentPortal, /<link rel="manifest" href="\/parent-manifest\.json">/);
  assert.match(operationsLogin, /<link rel="manifest" href="\/operations-manifest\.json">/);
  assert.match(operationsApp, /navigator\.serviceWorker\.getRegistrations\(\)/);
  assert.match(operationsApp, /registration\.unregister\(\)/);
  assert.match(operationsLogin, /navigator\.serviceWorker\.getRegistrations\(\)/);
  assert.match(operationsLogin, /registration\.unregister\(\)/);
});
