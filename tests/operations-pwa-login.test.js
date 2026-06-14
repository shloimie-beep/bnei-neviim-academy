const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const loginHtml = fs.readFileSync('public/operations-login.html', 'utf8');
const publicIndexHtml = fs.readFileSync('public/index.html', 'utf8');
const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const operationsManifest = JSON.parse(fs.readFileSync('public/operations-manifest.json', 'utf8'));
const publicManifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
const parentManifest = JSON.parse(fs.readFileSync('public/parent-manifest.json', 'utf8'));
const serviceWorker = fs.readFileSync('public/sw.js', 'utf8');
const serverJs = fs.readFileSync('server.js', 'utf8');

test('Operations login installs and resumes as the Operations PWA', () => {
  assert.match(loginHtml, /<link rel="manifest" href="\/operations-manifest\.json">/);
  assert.equal(operationsManifest.id, '/operations');
  assert.equal(operationsManifest.start_url, '/operations?source=ops-pwa');
  assert.equal(operationsManifest.background_color, '#f8f5ee');
  assert.match(serviceWorker, /bna-public-v9/);
});

test('public and parent installs do not open Operations', () => {
  assert.equal(publicManifest.start_url, '/?source=public-pwa');
  assert.equal(parentManifest.id, '/parent');
  assert.equal(parentManifest.start_url, '/parent?source=parent-pwa');
  assert.match(parentHtml, /<link rel="manifest" href="\/parent-manifest\.json">/);
  assert.match(serviceWorker, /\/parent-manifest\.json/);
  assert.match(publicIndexHtml, /<title>Bnei Nevi'im Academy \| Torah Learning for Boys<\/title>/);
  assert.doesNotMatch(publicIndexHtml, /redirectStandaloneLaunchToOperations|\/operations\?source=pwa/);
  assert.doesNotMatch(serverJs, /source === 'pwa'[\s\S]{0,120}res\.redirect\('\/'\)/);
});

test('Operations login preserves only safe Operations return paths', () => {
  assert.match(loginHtml, /function operationsReturnTo\(\)/);
  assert.match(loginHtml, /url\.origin !== window\.location\.origin \|\| url\.pathname !== '\/operations'/);
  assert.match(loginHtml, /window\.location\.href = operationsReturnTo\(\)/);
  assert.match(loginHtml, /window\.location\.replace\(operationsReturnTo\(\)\)/);
  assert.match(loginHtml, /redirectIfAlreadySignedIn\(\)/);
});

test('Operations auth redirect sends browser users back to the requested Operations route', () => {
  assert.match(serverJs, /function safeOperationsReturnPath\(value\)/);
  assert.match(serverJs, /url\.pathname !== '\/operations'/);
  assert.match(serverJs, /function operationsLoginUrlForRequest\(req\)/);
  assert.match(serverJs, /return `\/operations-login\.html\?returnTo=\$\{encodeURIComponent\(returnTo\)\}`;/);
  assert.match(serverJs, /return res\.redirect\(operationsLoginUrlForRequest\(req\)\);/);
});
