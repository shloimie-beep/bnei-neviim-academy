const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

const html = fs.readFileSync('public/issue-20-owner-walkthrough.html', 'utf8');
const artifact = fs.readFileSync('ops/execution-runs/2026-06-24-issue-20-parent-run/OWNER-WALKTHROUGH.md', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
const publicRoot = path.resolve('public');

const requiredCards = [
  'live-sha',
  'active-goal-lanes',
  'agent-fleet',
  'browser-chatgpt',
  'role-links-bot-qa',
  'github-bridge',
  'decisions-next-ramble',
  'stop-restart-release',
];

test('Issue 20 owner walkthrough page exposes exact setup cards without claiming deploy proof', () => {
  assert.match(html, /data-page="issue-20-owner-walkthrough"/);
  assert.match(html, /50087ae5d8e120830ae8e1f8dcaab71f61389d7c/);
  assert.match(html, /9b2696b744e094a2bffe2d178124d94719df2644/);
  assert.match(html, /deployed SHA is not currently provable through Railway/i);
  assert.match(html, /REQ-20260624-048/);

  for (const card of requiredCards) {
    const cardMatch = html.match(new RegExp(`<article[^>]+data-card="${card}"[\\s\\S]*?<\\/article>`));
    assert.ok(cardMatch, `${card} card exists`);
    for (const label of ['Page', 'Step', 'Expected result', 'Validation command', 'Recovery action']) {
      assert.match(cardMatch[0], new RegExp(`<dt>${label}<\\/dt>`), `${card} includes ${label}`);
    }
  }
});

test('Issue 20 owner walkthrough is registered as credential-safe and documented', () => {
  const route = routeRegistry.routes.find((item) => item.route === '/issue-20-owner-walkthrough.html');
  assert.ok(route, 'route registry includes owner walkthrough');
  assert.equal(route.access, 'public');
  assert.equal(route.public_allowed, true);
  assert.match(route.security_expectation, /must not expose secrets/i);

  assert.match(artifact, /^# Issue 20 Owner Setup and Walkthrough/m);
  assert.match(artifact, /Public page: `\/issue-20-owner-walkthrough\.html`/);
  assert.match(artifact, /Each page card includes exact page, step, expected result, validation command,\s+and recovery action\./);
  for (const phrase of [
    'Live SHA and Health',
    'Active Goal and Lanes',
    'Agent Fleet and Watchdog',
    'Browser Profiles and ChatGPT Agent',
    'Role Links and Bot QA',
    'GitHub Bridge and Agent Results',
    'Decisions, Queue, and Next Ramble',
    'Stop, Restart, and Release Gate',
  ]) {
    assert.match(artifact, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function createStaticServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const requested = url.pathname === '/' ? '/issue-20-owner-walkthrough.html' : url.pathname;
    const normalized = path.normalize(decodeURIComponent(requested)).replace(/^([/\\])+/, '');
    const filePath = path.join(publicRoot, normalized);
    if (!filePath.startsWith(publicRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': contentType(filePath) });
    res.end(fs.readFileSync(filePath));
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

test('Issue 20 owner walkthrough renders without horizontal overflow on desktop and mobile', async () => {
  const staticServer = await createStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 900, isMobile: true }]) {
      const page = await browser.newPage({ viewport, isMobile: Boolean(viewport.isMobile) });
      await page.goto(`${staticServer.baseUrl}/issue-20-owner-walkthrough.html`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'Issue 20 Owner Walkthrough' }).waitFor();
      assert.equal(await page.locator('.walkthrough-card').count(), requiredCards.length);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 1, `expected no horizontal overflow at ${viewport.width}px, got ${overflow}`);

      const header = await page.locator('.setup-header').boundingBox();
      const truth = await page.locator('.walkthrough-truth').boundingBox();
      const cards = await page.locator('#walkthroughCards').boundingBox();
      assert.ok(header && truth && cards, 'expected walkthrough layout boxes');
      assert.ok(header.y + header.height <= truth.y, 'header should not overlap truth band');
      assert.ok(truth.y + truth.height <= cards.y, 'truth band should not overlap cards');
      await page.close();
    }
  } finally {
    await browser.close();
    await staticServer.close();
  }
});
