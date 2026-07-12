'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const providerHtmlPath = path.join(root, 'public', 'provider.html');
const operationsBootstrapPath = path.join(root, 'public', 'operations-bootstrap.html');

function contentTypeFor(filePath) {
  return {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.html': 'text/html',
  }[path.extname(filePath).toLowerCase()] || 'text/plain';
}

function servePublic(res, requestPath, servedPaths) {
  const publicRoot = path.join(root, 'public');
  const filePath = path.normalize(path.join(publicRoot, requestPath.replace(/^\/+/, '')));
  if (!filePath.startsWith(publicRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  servedPaths.push(requestPath);
  res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
  res.end(fs.readFileSync(filePath));
  return true;
}

function json(res, body, status = 200, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function hasProviderSession(req) {
  return /(?:^|;\s*)bna_provider_session=one-time-provider-session(?:;|$)/.test(req.headers.cookie || '');
}

function createProviderLoginHarness() {
  const servedPaths = [];
  let loginRequests = 0;
  let lastLoginPayload = null;
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (['/provider', '/provider.html', '/provider-dashboard'].includes(url.pathname)) {
      if (hasProviderSession(req)) {
        res.writeHead(302, { Location: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview' });
        res.end();
        return;
      }
      servedPaths.push(url.pathname);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(providerHtmlPath, 'utf8'));
      return;
    }
    if (url.pathname === '/api/provider-portal/login' && req.method === 'POST') {
      loginRequests += 1;
      const body = await readBody(req);
      assert.equal(body.username, 'rabbi_elie_scheller');
      assert.equal(body.password, 'local-test-password');
      lastLoginPayload = {
        success: true,
        sessionId: 'one-time-provider-session',
        portal_redirect: true,
        redirect_to: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
        role: 'project_owner',
        provider_id: 77,
        provider_name: 'Rabbi Eli Scheller',
        workspace_key: 'rabbi_sheller_provider',
        project_key: 'one_time_mishnah_class',
        operations_shell: true,
        legacy_provider_dashboard_replaced: true,
        external_write_performed: false,
      };
      return json(res, lastLoginPayload, 200, {
        'Set-Cookie': 'bna_provider_session=one-time-provider-session; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800',
      });
    }
    if (url.pathname === '/operations') {
      if (!hasProviderSession(req)) {
        res.writeHead(302, { Location: '/provider' });
        res.end();
        return;
      }
      servedPaths.push('/operations');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(operationsBootstrapPath, 'utf8'));
      return;
    }
    if (url.pathname === '/api/bna/auth/me') {
      if (!hasProviderSession(req)) return json(res, { success: false, authenticated: false });
      return json(res, {
        success: true,
        authenticated: true,
        user: 'rabbi_elie_scheller',
        username: 'rabbi_elie_scheller',
        role: 'project_owner',
        displayName: 'Rabbi Eli Scheller',
        workspace_key: 'rabbi_sheller_provider',
        project_key: 'one_time_mishnah_class',
        scope: { type: 'project', projectKey: 'one_time_mishnah_class', workspaceKey: 'rabbi_sheller_provider' },
        allowedViews: ['service_providers', 'contacts', 'content', 'communications'],
      });
    }
    if (url.pathname === '/api/bna/crm/contacts') {
      if (url.searchParams.get('workspace') === 'bna') {
        return json(res, { error: 'This login is scoped to One Time Mishnah Class records.' }, 403);
      }
      return json(res, { success: true, contacts: [], no_send: true, external_write_performed: false });
    }
    if (url.pathname.startsWith('/api/bna/')) {
      return json(res, { success: true, items: [], external_write_performed: false });
    }
    if (servePublic(res, url.pathname, servedPaths)) return;
    res.writeHead(404);
    res.end('not found');
  });
  return {
    servedPaths,
    loginRequests: () => loginRequests,
    lastLoginPayload: () => lastLoginPayload,
    listen() {
      return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          const { port } = server.address();
          resolve(`http://127.0.0.1:${port}`);
        });
      });
    },
    close() {
      return new Promise((resolve) => server.close(resolve));
    },
  };
}

test('server bridges normal One Time provider sessions into canonical scoped Operations shell', () => {
  const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  assert.match(server, /async function identifyOneTimeProviderOpsSession\(req, db = pool\)/);
  assert.match(server, /const providerOpsIdentity = await identifyOneTimeProviderOpsSession\(req\)\.catch\(\(\) => null\);/);
  assert.match(server, /if \(isOneTimeClassMediaProvider\(providerWithProject \|\| provider\)\)/);
  assert.match(server, /portal_redirect: true/);
  assert.match(server, /legacy_provider_dashboard_replaced: true/);
  assert.match(server, /return Boolean\(await identifyOneTimeProviderOpsSession\(req\)\.catch\(\(\) => null\)\);/);
});

test('normal One Time provider login redirects to canonical Operations and aliases do not expose old dashboard', async () => {
  const local = createProviderLoginHarness();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  try {
    await page.goto(`${baseUrl}/provider`);
    await page.fill('#username', 'rabbi_elie_scheller');
    await page.fill('#password', 'local-test-password');
    await Promise.all([
      page.waitForResponse((response) => response.url().endsWith('/api/provider-portal/login') && response.status() === 200),
      page.click('#loginButton'),
    ]);
    const loginPayload = local.lastLoginPayload();
    assert.equal(loginPayload.portal_redirect, true);
    assert.match(loginPayload.redirect_to, /^\/operations\?workspace=rabbi_sheller_provider&project=one_time_mishnah_class/);
    await page.waitForFunction(() => (
      window.location.pathname === '/operations'
      && window.location.search.includes('workspace=rabbi_sheller_provider')
      && window.location.search.includes('project=one_time_mishnah_class')
    ), null, {
      timeout: 10000,
    }).catch((error) => {
      error.message += `\nCurrent URL: ${page.url()}\nLogin payload: ${JSON.stringify(loginPayload)}\nPage errors: ${pageErrors.join(' | ')}`;
      throw error;
    });
    await page.waitForFunction(() => Boolean(document.querySelector('script[src="/js/operations-shell.js"]')), null, {
      timeout: 10000,
    });

    assert.equal(local.loginRequests(), 1);
    assert.equal(new URL(page.url()).pathname, '/operations');
    const loadedAssets = await page.evaluate(() => ({
      css: [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.getAttribute('href')),
      scripts: [...document.querySelectorAll('script[src]')].map((node) => node.getAttribute('src')),
    }));
    assert.ok(loadedAssets.css.includes('/css/operations-shell.css'));
    assert.ok(loadedAssets.scripts.includes('/js/one-time-rabbi-dashboard-ia.generated.js'));
    assert.ok(loadedAssets.scripts.includes('/js/operations-shell.js'));
    assert.equal(local.servedPaths.includes('/operations.html'), false);

    const me = await page.evaluate(async () => fetch('/api/bna/auth/me').then((res) => res.json()));
    assert.equal(me.authenticated, true);
    assert.equal(me.role, 'project_owner');
    assert.equal(me.workspace_key, 'rabbi_sheller_provider');
    assert.equal(me.project_key, 'one_time_mishnah_class');

    const denial = await page.evaluate(async () => {
      const res = await fetch('/api/bna/crm/contacts?workspace=bna');
      return { status: res.status, body: await res.json() };
    });
    assert.equal(denial.status, 403);
    assert.match(denial.body.error, /scoped to One Time Mishnah Class/);

    for (const alias of ['/provider', '/provider.html', '/provider-dashboard']) {
      await page.goto(`${baseUrl}${alias}`, { waitUntil: 'commit' });
      await page.waitForFunction(() => (
        window.location.pathname === '/operations'
        && window.location.search.includes('workspace=rabbi_sheller_provider')
        && window.location.search.includes('project=one_time_mishnah_class')
      ), null, {
        timeout: 10000,
      });
      assert.equal(new URL(page.url()).pathname, '/operations');
    }
  } finally {
    await browser.close();
    await local.close();
  }
});
