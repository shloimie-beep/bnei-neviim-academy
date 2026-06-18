const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

test('public, operations, and parent manifests have distinct app identities', () => {
  const publicManifest = json('public/manifest.json');
  const operationsManifest = json('public/operations-manifest.json');
  const parentManifest = json('public/parent-manifest.json');

  assert.equal(publicManifest.name, 'Bnei Neviim Academy');
  assert.equal(publicManifest.id, '/');
  assert.equal(publicManifest.start_url, '/?source=pwa');
  assert.equal(publicManifest.display, 'browser');
  assert.doesNotMatch(publicManifest.name, /Operations/i);

  assert.equal(operationsManifest.name, 'BNA Operations');
  assert.equal(operationsManifest.id, '/operations');
  assert.equal(operationsManifest.start_url, '/operations?source=pwa');
  assert.equal(operationsManifest.scope, '/operations');
  assert.equal(operationsManifest.display, 'standalone');

  assert.equal(parentManifest.name, 'BNA Parent Portal');
  assert.equal(parentManifest.id, '/parent-portal');
  assert.equal(parentManifest.scope, '/signup');

  assert.notEqual(publicManifest.id, operationsManifest.id);
  assert.notEqual(publicManifest.id, parentManifest.id);
  assert.notEqual(operationsManifest.id, parentManifest.id);
  assert.notDeepEqual(publicManifest.icons, operationsManifest.icons);
  assert.notDeepEqual(parentManifest.icons, operationsManifest.icons);
});

test('public pages do not link or launch the private Operations app shell', () => {
  const index = read('public/index.html');
  const signup = read('public/signup.html');
  const signupHe = read('public/signup-he.html');

  assert.ok(index.includes('<link rel="manifest" href="/manifest.json">'));
  assert.ok(!index.includes("window.location.replace('/operations')"));
  assert.doesNotMatch(index, /operations-manifest\\.json/);
  assert.ok(index.includes("serviceWorker.register('/public-sw.js', { scope: '/' })"));

  assert.ok(signup.includes('<link rel="manifest" href="/manifest.json">'));
  assert.ok(signupHe.includes('<link rel="manifest" href="/manifest.json">'));
  assert.ok(signup.includes("serviceWorker.register('/public-sw.js', { scope: '/' })"));
  assert.ok(signupHe.includes("serviceWorker.register('/public-sw.js', { scope: '/' })"));
});

test('public homepage has no Operations loader artifact or header-to-hero gap rule', () => {
  const index = read('public/index.html');

  assert.ok(!index.includes('Loading BNA Operations'));
  assert.ok(!index.includes('checkmark'));
  assert.ok(index.includes('position: sticky;'));
  assert.ok(index.includes('min-height: 70px;'));
  assert.ok(index.includes('min-height: 58px;'));
  assert.match(index, /\.hero \{[\s\S]*?margin-top: 0;/);
  assert.match(index, /@media \(max-width: 767px\) \{[\s\S]*?\.hero \{[\s\S]*?margin-top: 0;/);
});

test('Operations pages use the private manifest and Operations service worker', () => {
  const operations = read('public/operations.html');
  const login = read('public/operations-login.html');

  for (const html of [operations, login]) {
    assert.ok(html.includes('<link rel="manifest" href="/operations-manifest.json">'));
    assert.ok(!html.includes('<link rel="manifest" href="/manifest.json">'));
    assert.ok(html.includes("serviceWorker.register('/operations-sw.js', { scope: '/operations' })"));
    assert.ok(html.includes("scriptUrl.endsWith('/public-sw.js')"));
  }

  assert.ok(operations.includes("window.location.replace('/operations')"));
});

test('service workers have separate cache names and do not serve the wrong shell', () => {
  const publicWorker = read('public/public-sw.js');
  const operationsWorker = read('public/operations-sw.js');

  assert.match(publicWorker, /bna-public-v20260618/);
  assert.match(operationsWorker, /bna-operations-v20260618/);
  assert.doesNotMatch(publicWorker, /bna-operations-v20260618/);
  assert.doesNotMatch(operationsWorker, /bna-public-v20260618/);
  assert.match(publicWorker, /isOperationsPath/);
  assert.ok(publicWorker.includes("url.pathname.startsWith('/operations')"));
  assert.ok(operationsWorker.includes('!isOperationsPath(url)'));
});

test('server sends no-store headers for manifests and service workers', () => {
  const server = read('server.js');

  assert.ok(server.includes("const isServiceWorker = filePath.endsWith('sw.js')"));
  assert.ok(server.includes("const isManifest = filePath.endsWith('manifest.json')"));
  assert.ok(server.includes("res.setHeader('Cache-Control', 'no-store')"));
});
