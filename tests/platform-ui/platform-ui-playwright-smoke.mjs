import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';

const root = process.cwd();
const publicRoot = path.join(root, 'public');
const screenshotDir = path.join(root, 'ops', 'parallel-runs', 'PARALLEL-20260619-001', 'workers', 'W2', 'screenshots');
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
]);
const require = createRequire(import.meta.url);

function loadPlaywright() {
  const candidates = [
    path.join(root, 'node_modules'),
    process.env.BNA_PLAYWRIGHT_NODE_MODULES,
    ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : []),
    path.join(process.env.USERPROFILE || process.env.HOME || '', 'BNA v2.0', 'node_modules'),
  ].filter(Boolean);

  for (const modulesDir of candidates) {
    const packagePath = path.join(modulesDir, 'playwright', 'package.json');
    if (!existsSync(packagePath)) continue;
    return createRequire(packagePath)('playwright');
  }
  return require('playwright');
}

const { chromium } = loadPlaywright();

function servePublic() {
  const server = createServer((request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const decodedPath = decodeURIComponent(url.pathname);
    const targetPath = path.normalize(path.join(publicRoot, decodedPath));
    if (!targetPath.startsWith(publicRoot) || !existsSync(targetPath)) {
      response.statusCode = 404;
      response.end('Not found');
      return;
    }
    response.setHeader('Content-Type', contentTypes.get(path.extname(targetPath)) || 'application/octet-stream');
    createReadStream(targetPath).pipe(response);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function assertNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    documentClientWidth: document.documentElement.clientWidth,
    overlappingDialogs: Array.from(document.querySelectorAll('[role="dialog"]')).some((dialog) => {
      const rect = dialog.getBoundingClientRect();
      return rect.left < 0 || rect.right > window.innerWidth || rect.top < 0 || rect.bottom > window.innerHeight;
    }),
    activeModule: document.querySelector('.pui-main')?.getAttribute('data-active-module'),
    visibleText: document.body.innerText,
  }));
  assert.ok(metrics.bodyScrollWidth <= metrics.bodyClientWidth + 1, JSON.stringify(metrics));
  assert.ok(metrics.documentScrollWidth <= metrics.documentClientWidth + 1, JSON.stringify(metrics));
  assert.equal(metrics.overlappingDialogs, false);
  assert.ok(metrics.activeModule);
  assert.match(metrics.visibleText, /BNA|One Time/);
}

test('platform UI harness is responsive and interactive across required viewports', async () => {
  await mkdir(screenshotDir, { recursive: true });
  const { server, url } = await servePublic();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const viewports = [
    { name: 'mobile-360', width: 360, height: 800, query: '?workspace=bna&module=overview' },
    { name: 'mobile-390-onetime', width: 390, height: 844, query: '?workspace=one_time&module=courses' },
    { name: 'tablet-768', width: 768, height: 1024, query: '?workspace=bna&module=tasks' },
    { name: 'desktop-1440', width: 1440, height: 900, query: '?workspace=bna&module=integrations' },
  ];

  try {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${url}/platform-ui/index.html${viewport.query}`, { waitUntil: 'networkidle' });
      await assertNoHorizontalOverflow(page);
      await page.screenshot({ path: path.join(screenshotDir, `${viewport.name}.png`), fullPage: true });
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${url}/platform-ui/index.html?workspace=one_time&module=integrations`, { waitUntil: 'networkidle' });
    await page.locator('.pui-repeated-card', { hasText: 'Vimeo' }).getByRole('button', { name: 'Test Connection' }).click();
    await assertNoHorizontalOverflow(page);
    await expectText(page, 'integration.readiness.checked');

    await page.getByRole('button', { name: 'Courses' }).click();
    await page.getByRole('button', { name: 'Add course' }).click();
    await page.getByLabel('Title').fill('Browser Smoke Course');
    await page.getByRole('button', { name: 'Save' }).click();
    await expectText(page, 'Browser Smoke Course');
    await assertNoHorizontalOverflow(page);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

async function expectText(page, text) {
  await page.waitForFunction(
    (expected) => document.body.innerText.includes(expected),
    text,
    { timeout: 5000 },
  );
}
