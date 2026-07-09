const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');
const serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const providerHtml = fs.readFileSync(path.join(root, 'public', 'provider.html'), 'utf8');
const memberHtml = fs.readFileSync(path.join(root, 'public', 'rabbi-member.html'), 'utf8');
const memberJs = fs.readFileSync(path.join(root, 'public', 'js', 'rabbi-member.js'), 'utf8');
const studentHtml = fs.readFileSync(path.join(root, 'public', 'student.html'), 'utf8');
const oneTimeSmoke = fs.readFileSync(path.join(root, 'scripts', 'smoke-onetime-separate-instance-live.mjs'), 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));

function json(res, payload, statusCode = 200) {
  res.writeHead(statusCode, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

function createRouteRoleServer() {
  let activePort = 0;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
    if (url.pathname === '/api/provider-portal/session') {
      return json(res, {
        success: false,
        error: 'No scoped One Time provider session is active in this browser.',
        external_write_performed: false,
      }, 401);
    }

    const requested = url.pathname === '/' ? '/provider.html' : url.pathname;
    const staticPath = requested === '/provider' ? '/provider.html' : requested;
    const filePath = path.resolve(publicRoot, decodeURIComponent(staticPath.replace(/^\/+/, '')));
    if (!filePath.startsWith(publicRoot)) return json(res, { error: 'forbidden' }, 403);
    fs.readFile(filePath, (error, body) => {
      if (error) return json(res, { error: 'not found' }, 404);
      res.writeHead(200, { 'content-type': contentType(filePath) });
      res.end(body);
    });
  });
  return {
    listen() {
      return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          activePort = server.address().port;
          resolve(`http://127.0.0.1:${activePort}`);
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}

test('provider admin-provider route gives truthful session-required state when no scoped session exists', async () => {
  assert.match(providerHtml, /oneTimeAdminProviderLoginMessage/);
  assert.match(providerHtml, /No scoped One Time provider session is active in this browser/);
  assert.match(providerHtml, /Return to Super Admin Inbox/);
  assert.match(providerHtml, /Open Read-only Review Preview/);
  assert.match(providerHtml, /oneTimeAdminProviderReviewUrl/);
  assert.match(providerHtml, /showLogin\(oneTimeAdminProviderMode \?/);

  const local = createRouteRoleServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });
    await page.goto(`${baseUrl}/provider.html?admin_provider=one-time&section=mailbox`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=No scoped One Time provider session is active in this browser');

    assert.equal(await page.locator('#loginPanel').isVisible(), true);
    assert.equal(await page.locator('#portalPanel').isVisible(), false);
    assert.equal(await page.locator('a[href="/operations?workspace=platform&view=communications&section=email&inbox=rabbi"]').count(), 1);
    assert.equal(await page.locator('a[href="/provider.html?review=one-time&section=mailbox"]').count(), 1);
    assert.equal(await page.locator('text=Super Admin diagnostics').count(), 0);
  } finally {
    await browser.close();
    await local.close();
  }
});

test('One Time provider.html requests are intercepted before static BNA shell markup', () => {
  assert.match(serverJs, /function wantsOneTimeProviderShell\(req\)/);
  assert.match(serverJs, /Boolean\(query\.view_as_rabbi \|\| query\.viewAsRabbi\)/);
  assert.match(serverJs, /function oneTimeProviderShellHtml\(html = ''\)/);
  assert.match(serverJs, /one-time-review-active/);
  assert.match(serverJs, /OneTimeOneTime<\/strong>/);
  assert.match(serverJs, /Rabbi provider account<\/span>/);
  assert.match(serverJs, /app\.get\('\/provider\.html', \(req, res, next\) => \{/);
  assert.match(serverJs, /return sendOneTimeProviderShell\(req, res\)/);
});

test('student login is a real student login and student preview is clearly TEST-only One Time scope', () => {
  assert.match(serverJs, /app\.get\(\['\/student', '\/student\/login'\]/);
  assert.match(serverJs, /return res\.redirect\(302, '\/student\.html\?one_time_login=1'\)/);
  assert.match(studentHtml, /<form id="studentLoginForm">/);
  assert.match(studentHtml, /apiRequest\('\/api\/student-portal\/login'/);
  assert.match(studentHtml, /returnTo: window\.location\.pathname \+ window\.location\.search \+ window\.location\.hash/);
  assert.match(studentHtml, /const ONE_TIME_REVIEW_MODE/);
  assert.match(studentHtml, /const ONE_TIME_LOGIN_MODE =/);
  assert.match(studentHtml, /const ONE_TIME_HOST_MODE =/);
  assert.match(studentHtml, /onetimeonetime\\\.com\$\/i\.test\(window\.location\.hostname/);
  assert.match(studentHtml, /OneTimeOneTime Student Login/);
  assert.match(studentHtml, /one-time-student-login-active/);
  assert.match(studentHtml, /Use the student username and password managed by your parent/);
  assert.match(studentHtml, /renderOneTimeStudentReview/);
  assert.match(studentHtml, /Student dashboard for live Mishnayos[\s\S]*TEST-only class data and excludes BNA school accountability goals/);
  assert.match(studentHtml, /BNA school accountability goals, checkoffs, consequences, device controls, and other household\/student records stay out/);
});

test('One Time single-tenant parent login redirects to OneTime parent setup instead of Academy login', () => {
  const routeStart = serverJs.indexOf("app.get(['/parent/login', '/parent-login']");
  const routeEnd = serverJs.indexOf("app.get('/parent'", routeStart);
  const route = serverJs.slice(routeStart, routeEnd);
  assert.match(route, /if \(isOneTimeSingleTenantRuntime\(\)\) \{/);
  assert.match(route, /return res\.redirect\(302, '\/one-time-parent'\)/);
  assert.doesNotMatch(route, /Bnei Neviim Academy|parent-login\.html[\s\S]*isOneTimeSingleTenantRuntime/);
});

test('member route is a member entry shell and never redirects to provider login', () => {
  assert.match(serverJs, /app\.get\(\['\/rabbi-member', '\/rabbi\/member'\]/);
  assert.match(memberHtml, /Request member link/);
  assert.match(memberJs, /\/api\/rabbi\/member\/request-login/);
  assert.match(memberJs, /\/api\/one-time-review\/member/);
  assert.doesNotMatch(memberHtml, /href="\/provider\/login"/);
  assert.doesNotMatch(memberJs, /window\.location\.(?:href|assign)\s*=\s*['"]\/provider/);
});

test('One Time join-domain public alias serves public funnel only in single-tenant runtime', () => {
  assert.match(serverJs, /app\.get\(\['\/', '\/index\.html', '\/public', '\/public\/'\]/);
  assert.match(serverJs, /if \(!isOneTimeSingleTenantRuntime\(\)\) return next\(\)/);
  assert.match(oneTimeSmoke, /for \(const route of \['\/', '\/public', '\/one-time', '\/one-time\/'\]\)/);

  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  const publicAlias = routes.get('/public');
  assert.ok(publicAlias, 'missing /public route registry row');
  assert.equal(publicAlias.access, 'public');
  assert.equal(publicAlias.public_allowed, true);
  assert.match(publicAlias.expected_logged_out_behavior, /load_one_time_public_landing/);
  assert.match(publicAlias.security_expectation, /no student board, provider portal, member library, Operations data/i);

  const adminProvider = routes.get('/provider.html?admin_provider=one-time&section=mailbox');
  assert.ok(adminProvider, 'missing admin-provider route registry row');
  assert.equal(adminProvider.access, 'private');
  assert.equal(adminProvider.public_allowed, false);
  assert.match(adminProvider.expected_logged_out_behavior, /session_required_shell_without_private_data/);

  const studentPreview = routes.get('/student.html?review=one-time');
  assert.ok(studentPreview, 'missing One Time student preview route registry row');
  assert.equal(studentPreview.access, 'public_review_fixture');
  assert.match(studentPreview.security_expectation, /TEST One Time student/i);
});
