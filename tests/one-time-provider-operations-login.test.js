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

function oneTimeProviderPayload() {
  return {
    provider: {
      id: 77,
      provider_name: 'Rabbi Eli Scheller',
      display_name: 'Rabbi Eli Scheller',
      login_username: 'rabbi_elie_scheller',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      entitlement_plan: 'rabbi_sheller_partner',
      status: 'active',
      plan: { label: 'One Time Mishnah Class workspace' },
    },
    scope: {
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      entitlements: ['crm_contacts', 'parent_portal', 'student_portal'],
    },
    profile: { id: 77 },
    services: [],
    links: {
      one_time_home: '/one-time',
      parent: '/parent.html?review=one-time',
      student: '/student.html?review=one-time',
      member: '/rabbi-member?review=one-time',
      classroom: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
      email_preview: '/one-time-email-review.html',
    },
    crm_workspace: { current_records: { parents: 0, students: 0, support_items: 1 } },
    one_time_class_media_enabled: true,
    one_time_class_media: [],
    wapi_setup: null,
    messages: [],
    entitlements: [],
    integrations: [],
    access_checklist: [],
    media: [],
    comments: [],
    google_business: {},
    upgrade: {},
    dedicated_provider_shell: true,
    operations_fallback_url: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
    role: 'project_owner',
    provider_id: 77,
    provider_name: 'Rabbi Eli Scheller',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    operations_shell: false,
    legacy_provider_dashboard_replaced: true,
    external_write_performed: false,
  };
}

function createProviderLoginHarness() {
  const servedPaths = [];
  let loginRequests = 0;
  let lastLoginPayload = null;
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    if (['/provider', '/provider.html', '/provider-dashboard'].includes(url.pathname)) {
      if (url.searchParams.get('ops_fallback') === '1') {
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
        ...oneTimeProviderPayload(),
      };
      return json(res, lastLoginPayload, 200, {
        'Set-Cookie': 'bna_provider_session=one-time-provider-session; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800',
      });
    }
    if (url.pathname === '/api/provider-portal/session') {
      if (!hasProviderSession(req)) return json(res, { error: 'Provider session is required' }, 401);
      return json(res, { success: true, ...oneTimeProviderPayload() });
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
  assert.match(server, /function oneTimeProviderWantsOperationsFallback\(req\)/);
  assert.match(server, /if \(!oneTimeProviderWantsOperationsFallback\(req\)\) return false;/);
  assert.match(server, /dedicated_provider_shell: true/);
  assert.match(server, /operations_fallback_url: oneTimeProviderCanonicalOperationsUrl/);
  assert.match(server, /legacy_provider_dashboard_replaced: true/);
  assert.match(server, /query\.ops_fallback \|\| query\.operations_fallback \|\| query\.operationsFallback/);
});

test('normal One Time provider login stays in dedicated shell with Operations fallback', async () => {
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
    assert.equal(loginPayload.dedicated_provider_shell, true);
    assert.equal(loginPayload.operations_shell, false);
    assert.equal(loginPayload.workspace_key, 'rabbi_sheller_provider');
    assert.equal(loginPayload.project_key, 'one_time_mishnah_class');
    await page.waitForTimeout(250);
    const renderedState = await page.evaluate(() => ({
      bodyClass: document.body.className,
      portalHidden: document.getElementById('portalPanel')?.classList.contains('hidden'),
      loginHidden: document.getElementById('loginPanel')?.classList.contains('hidden'),
      loginError: document.getElementById('loginError')?.textContent || '',
      hasCrmShell: Boolean(document.querySelector('[data-one-time-provider-crm-shell]')),
    }));
    assert.equal(renderedState.loginError, '', JSON.stringify(renderedState));
    assert.equal(renderedState.portalHidden, false, JSON.stringify(renderedState));
    assert.equal(renderedState.loginHidden, true, JSON.stringify(renderedState));
    assert.match(renderedState.bodyClass, /one-time-provider-review-active/, JSON.stringify(renderedState));
    assert.equal(renderedState.hasCrmShell, true, JSON.stringify(renderedState));

    assert.equal(local.loginRequests(), 1);
    assert.equal(new URL(page.url()).pathname, '/provider');
    const loadedAssets = await page.evaluate(() => ({
      css: [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.getAttribute('href')),
      scripts: [...document.querySelectorAll('script[src]')].map((node) => node.getAttribute('src')),
    }));
    assert.ok(loadedAssets.css.includes('/css/one-time-shared-review.css'));
    assert.equal(loadedAssets.css.includes('/css/operations-shell.css'), false);
    assert.equal(loadedAssets.scripts.includes('/js/operations-shell.js'), false);
    assert.equal(local.servedPaths.includes('/operations.html'), false);
    assert.equal(local.servedPaths.includes('/operations'), false);
    assert.equal(await page.locator('[data-action-id="ACTION-ONETIME-PROVIDER-OPERATIONS-FALLBACK"]').count() > 0, true);

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
        document.body.classList.contains('one-time-provider-review-active')
        && Boolean(document.querySelector('[data-one-time-provider-crm-shell]'))
      ), null, {
        timeout: 10000,
      });
      assert.equal(new URL(page.url()).pathname, alias === '/provider-dashboard' ? '/provider-dashboard' : alias);
    }

    await page.goto(`${baseUrl}/provider.html?admin_provider=one-time&section=crm&ops_fallback=1`, { waitUntil: 'commit' });
    await page.waitForFunction(() => (
      window.location.pathname === '/operations'
      && window.location.search.includes('workspace=rabbi_sheller_provider')
      && window.location.search.includes('project=one_time_mishnah_class')
    ), null, {
      timeout: 10000,
    });
    assert.equal(new URL(page.url()).pathname, '/operations');
  } finally {
    await browser.close();
    await local.close();
  }
});
