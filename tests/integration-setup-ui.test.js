const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('playwright');

const repoRoot = path.resolve(__dirname, '..');
const publicRoot = path.join(repoRoot, 'public');

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.md')) return 'text/markdown; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function createStaticServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/api/bna/integration-setup/readiness') {
      res.writeHead(401, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'signed_out' }));
      return;
    }
    const requested = url.pathname === '/' ? '/integration-setup.html' : url.pathname;
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

test('static setup center renders safely while logged out and exposes required controls', async () => {
  const staticServer = await createStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${staticServer.baseUrl}/integration-setup.html`, { waitUntil: 'networkidle' });

    const readiness = await page.request.get(`${staticServer.baseUrl}/api/bna/integration-setup/readiness`);
    assert.equal(readiness.status(), 401);

    await page.getByText('Signed out: static checklist shown').waitFor();
    await assert.equal(await page.locator('.setup-card').count(), 16);
    await assert.equal(await page.getByRole('button', { name: 'Run validation' }).count(), 16);
    await assert.equal(await page.getByRole('link', { name: 'Open setup page' }).count(), 16);
    await assert.equal(await page.getByRole('link', { name: 'Open Operations' }).count(), 17);
    await assert.ok(await page.getByLabel('Integration filters').isVisible());
    await assert.ok(await page.getByRole('button', { name: 'Print Checklist' }).isVisible());
    await assert.ok(await page.locator('.skip-link').evaluate((node) => node.getAttribute('href') === '#setupCards'));

    await page.locator('#statusFilter').evaluate((select) => {
      select.value = 'missing_credential';
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const filteredCards = await page.locator('.setup-card').count();
    assert.ok(filteredCards > 0 && filteredCards < 16, `expected narrowed status filter, got ${filteredCards}`);

    await page.locator('#searchInput').fill('stripe');
    await assert.equal(await page.locator('.setup-card h2').first().textContent(), 'Stripe');

    await page.locator('h1').click();
    await page.keyboard.press('/');
    await assert.equal(await page.evaluate(() => document.activeElement.id), 'searchInput');
  } finally {
    await browser.close();
    await staticServer.close();
  }
});

test('setup center remains usable on mobile width without overlapping core controls', async () => {
  const staticServer = await createStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 }, isMobile: true });
    await page.goto(`${staticServer.baseUrl}/integration-setup.html`, { waitUntil: 'networkidle' });
    await page.getByText('Signed out: static checklist shown').waitFor();

    const header = await page.locator('.setup-header').boundingBox();
    const filters = await page.locator('.filters').boundingBox();
    const cards = await page.locator('#setupCards').boundingBox();
    assert.ok(header && filters && cards, 'expected mobile layout boxes');
    assert.ok(header.y + header.height <= filters.y, 'header should not overlap filters');
    assert.ok(filters.y + filters.height <= cards.y, 'filters should not overlap cards');
    assert.ok(await page.getByRole('button', { name: 'Print Checklist' }).isVisible());
    assert.ok(await page.getByRole('button', { name: 'Run validation' }).first().isVisible());
  } finally {
    await browser.close();
    await staticServer.close();
  }
});
