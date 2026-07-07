const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');
const { buildOneTimeSharedReviewData } = require('../src/platform/instances/one-time-shared-review-data');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');
const operationsHtml = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');
const providerHtml = fs.readFileSync(path.join(root, 'public', 'provider.html'), 'utf8');
const memberHtml = fs.readFileSync(path.join(root, 'public', 'rabbi-member.html'), 'utf8');
const memberJs = fs.readFileSync(path.join(root, 'public', 'js', 'rabbi-member.js'), 'utf8');
const sharedReviewData = fs.readFileSync(path.join(root, 'src', 'platform', 'instances', 'one-time-shared-review-data.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));
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

function createMemberPreviewServer() {
  let activePort = 0;
  const apiHits = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
    apiHits.push({ method: req.method, path: url.pathname });
    if (url.pathname === '/api/one-time-review/member') {
      const review = buildOneTimeSharedReviewData({ baseUrl: `http://127.0.0.1:${activePort || 0}` });
      return json(res, {
        success: true,
        ...review.member_portal,
        links: review.links,
        test_only: true,
        external_write_performed: false,
      });
    }
    if (url.pathname.startsWith('/api/rabbi/member/')) {
      return json(res, { success: false, error: 'live member api should not be called in preview' }, 500);
    }

    const requested = url.pathname === '/' ? '/rabbi-member.html' : url.pathname;
    const staticPath = requested === '/rabbi-member' ? '/rabbi-member.html' : requested;
    const filePath = path.resolve(publicRoot, decodeURIComponent(staticPath.replace(/^\/+/, '')));
    if (!filePath.startsWith(publicRoot)) return json(res, { error: 'forbidden' }, 403);
    fs.readFile(filePath, (error, body) => {
      if (error) return json(res, { error: 'not found' }, 404);
      res.writeHead(200, { 'content-type': contentType(filePath) });
      res.end(body);
    });
  });
  return {
    apiHits,
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

test('Operations exposes safe Rabbi, student, and member preview navigation', () => {
  assert.match(operationsHtml, /function renderOneTimePerspectivePreviewPanel\(\)/);
  assert.match(operationsHtml, /data-one-time-perspective-preview/);
  assert.match(operationsHtml, /ACTION-ONETIME-PROVIDER-SESSION-START/);
  assert.match(operationsHtml, /View One Time as Rabbi/);
  assert.match(operationsHtml, /ACTION-ONETIME-STUDENT-PREVIEW/);
  assert.match(operationsHtml, /\/student\.html\?review=one-time/);
  assert.match(operationsHtml, /ACTION-ONETIME-MEMBER-PREVIEW/);
  assert.match(operationsHtml, /\/rabbi-member\?review=one-time/);
  assert.match(operationsHtml, /No access grant/);
});

test('Provider View-as Rabbi mode has sticky labels, Operations return, and readonly blockers', () => {
  assert.match(providerHtml, /VIEWING AS RABBI - READ ONLY/);
  assert.match(providerHtml, /Return to Super Admin/);
  assert.match(providerHtml, /function exitOneTimeViewAsRabbi/);
  assert.match(providerHtml, /function applyOneTimeReadOnlyControls/);
  assert.match(providerHtml, /Read-only View-as Rabbi mode blocks form submissions/);
  assert.match(providerHtml, /document\.addEventListener\('submit'[\s\S]*true\);/);
  assert.match(providerHtml, /document\.addEventListener\('click'[\s\S]*true\);/);
  assert.match(providerHtml, /\/rabbi-member\?review=one-time/);
  assert.match(providerHtml, /No email, WhatsApp, payment, access, upload, or provider write can run here/);
});

test('Member preview path is backed by TEST review data and does not need a live member credential', () => {
  assert.match(sharedReviewData, /member: joinUrl\(baseUrl, '\/rabbi-member\?review=one-time'\)/);
  assert.match(sharedReviewData, /member_portal: memberPortal/);
  assert.match(sharedReviewData, /TEST-ONETIME-MEMBER-001/);
  assert.match(serverJs, /app\.get\('\/api\/one-time-review\/member'/);
  assert.match(memberHtml, /href="\/student\.html\?review=one-time"/);
  assert.match(memberJs, /ONE_TIME_MEMBER_REVIEW_MODE/);
  assert.match(memberJs, /\/api\/one-time-review\/member/);
  assert.match(memberJs, /Preview question simulated locally/);
  assert.match(memberJs, /Preview support ticket simulated locally/);
});

test('registries cover safe view-as and preview actions/routes', () => {
  const actions = new Map(actionRegistry.actions.map((action) => [action.action_id, action]));
  assert.equal(actions.get('ACTION-ONETIME-PROVIDER-SESSION-START').route, '/api/bna/one-time/view-as-rabbi/start');
  assert.match(actions.get('ACTION-ONETIME-PROVIDER-SESSION-START').expected_behavior, /read-only View-as Rabbi/i);
  assert.equal(actions.get('ACTION-ONETIME-STUDENT-PREVIEW').route, '/student.html?review=one-time');
  assert.match(actions.get('ACTION-ONETIME-STUDENT-PREVIEW').expected_behavior, /TEST-only student data/i);
  assert.equal(actions.get('ACTION-ONETIME-MEMBER-PREVIEW').route, '/rabbi-member?review=one-time');
  assert.match(actions.get('ACTION-ONETIME-MEMBER-PREVIEW').expected_behavior, /TEST-only member/i);

  const routes = new Map(routeRegistry.routes.map((route) => [route.route, route]));
  assert.equal(routes.get('/api/one-time-review/member').access, 'public_review_fixture');
  assert.equal(routes.get('/api/one-time-review/member').public_allowed, true);
  assert.match(routes.get('/api/one-time-review/member').security_expectation, /no external send or database mutation/i);
});

test('member preview loads and simulates submit actions without live member API posts', async () => {
  const local = createMemberPreviewServer();
  const baseUrl = await local.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1180, height: 840 } });
    await page.goto(`${baseUrl}/rabbi-member?review=one-time`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=TEST One Time Member');

    assert.equal(await page.locator('#loginForm button').isDisabled(), true);
    assert.equal(await page.locator('text=Pesachim Perek 10 Review Class').count(), 1);

    await page.locator('#questionBody').fill('Preview question');
    await page.locator('#questionForm button[type="submit"]').click();
    await page.waitForSelector('text=Preview question simulated locally');

    await page.locator('#supportTitle').fill('Preview support');
    await page.locator('#supportForm button[type="submit"]').click();
    await page.waitForSelector('text=Preview support ticket simulated locally');

    const liveMemberPosts = local.apiHits.filter((hit) => hit.method === 'POST' && hit.path.startsWith('/api/rabbi/member/'));
    assert.deepEqual(liveMemberPosts, []);
  } finally {
    await browser.close();
    await local.close();
  }
});
