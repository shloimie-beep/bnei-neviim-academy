#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'ui-audits', '2026-07-12-onetime-landing-whatsapp-local');
const fakeWhatsAppNumber = '15551234567';

const viewports = [
  { id: 'landing-whatsapp-1440', width: 1440, height: 960, path: '/one-time' },
  { id: 'landing-whatsapp-1024', width: 1024, height: 900, path: '/one-time' },
  { id: 'landing-whatsapp-768', width: 768, height: 1024, path: '/one-time' },
  { id: 'landing-whatsapp-430', width: 430, height: 860, path: '/one-time', openMenu: true },
  { id: 'landing-whatsapp-390', width: 390, height: 844, path: '/one-time' },
];

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

function json(res, payload, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function whatsAppMessage(intent = '') {
  const base = [
    "Hi, I'm interested in Rabbi Scheller's One Time Mishnayos class.",
    'Please send me the current free-class information.',
  ];
  if (String(intent || '').toLowerCase().includes('schedule')) base.push('I also have a schedule question.');
  return base.join('\n');
}

function staticPathFor(urlPath) {
  if (urlPath === '/' || urlPath === '/public' || urlPath === '/one-time' || urlPath === '/rabbi' || urlPath === '/rabbi-preview' || urlPath === '/one-time-mishnayos') {
    return '/one-time/index.html';
  }
  return urlPath;
}

async function serve(req, res, baseUrl, writeRequests) {
  const url = new URL(req.url || '/', baseUrl);
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    writeRequests.push({ method: req.method, path: url.pathname });
  }
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (url.pathname === '/api/one-time/public-whatsapp') {
    return json(res, {
      success: true,
      configured: true,
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      redirect_path: '/api/one-time/public-whatsapp/redirect',
      missing_runtime: [],
      number_hint: 'configured',
      full_number_returned: false,
      no_whatsapp_sent: true,
      external_write_performed: false,
    });
  }
  if (url.pathname === '/api/one-time/public-whatsapp/redirect') {
    const location = `https://wa.me/${fakeWhatsAppNumber}?text=${encodeURIComponent(whatsAppMessage(url.searchParams.get('intent') || ''))}`;
    res.writeHead(302, { location });
    res.end();
    return;
  }

  const requested = staticPathFor(url.pathname);
  const safePath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[\\/])+/, '');
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': contentType(filePath) });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function waitForText(page, text) {
  try {
    await page.waitForFunction((value) => document.body.innerText.toLowerCase().includes(value.toLowerCase()), text, { timeout: 7000 });
  } catch (error) {
    const bodyText = await page.locator('body').innerText().catch(() => '');
    throw new Error(`${error.message}\nMissing text: ${text}\nBody preview: ${bodyText.slice(0, 1200)}`);
  }
}

async function assertLauncher(page) {
  const launcher = page.locator('.one-time-whatsapp-launcher').first();
  assert.equal(await launcher.count(), 1, 'landing should render exactly one WhatsApp launcher');
  assert.equal(await launcher.getAttribute('href'), '/api/one-time/public-whatsapp/redirect?intent=free_class');
  assert.equal(await launcher.getAttribute('data-action-id'), 'ACTION-ONETIME-PUBLIC-WHATSAPP');
  assert.match(await launcher.getAttribute('aria-label'), /Open WhatsApp/i);
  const box = await launcher.boundingBox();
  assert.ok(box && box.width >= 44 && box.height >= 44, `launcher target should be at least 44px, got ${JSON.stringify(box)}`);
  return box;
}

function boxesOverlap(a, b) {
  if (!a || !b) return false;
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y;
}

async function assertHeroCtaClear(page, launcherBox) {
  const cta = page.locator('.hero-cta').first();
  assert.equal(await cta.count(), 1, 'landing should render exactly one hero CTA');
  const ctaBox = await cta.boundingBox();
  assert.ok(ctaBox && ctaBox.width >= 44 && ctaBox.height >= 44, `hero CTA should have a usable target, got ${JSON.stringify(ctaBox)}`);
  assert.equal(boxesOverlap(ctaBox, launcherBox), false, `hero CTA should not overlap WhatsApp launcher: ${JSON.stringify({ ctaBox, launcherBox })}`);
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 430) {
    assert.ok(
      ctaBox.y + ctaBox.height < viewport.height - 160,
      `mobile hero CTA should sit above the bottom browser/launcher zone: ${JSON.stringify({ ctaBox, viewport })}`
    );
  }
  return ctaBox;
}

async function run() {
  await mkdir(outDir, { recursive: true });
  const writeRequests = [];
  const server = createServer((req, res) => {
    serve(req, res, 'http://127.0.0.1', writeRequests).catch((error) => {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error.stack || error.message);
    });
  });
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;

  const readiness = await fetch(`${baseUrl}/api/one-time/public-whatsapp`).then((res) => res.json());
  assert.equal(readiness.configured, true);
  assert.equal(readiness.full_number_returned, false);
  assert.equal(readiness.no_whatsapp_sent, true);
  assert.equal(readiness.external_write_performed, false);
  assert.doesNotMatch(JSON.stringify(readiness), new RegExp(fakeWhatsAppNumber));

  const redirect = await fetch(`${baseUrl}/api/one-time/public-whatsapp/redirect?intent=free_class`, { redirect: 'manual' });
  assert.equal(redirect.status, 302);
  assert.match(redirect.headers.get('location') || '', /^https:\/\/wa\.me\/15551234567\?text=/);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.route('**/*', (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin !== baseUrl && requestUrl.protocol.startsWith('http')) {
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });

  const helperScriptRequests = [];
  const results = [];
  for (const item of viewports) {
    const page = await context.newPage();
    await page.setViewportSize({ width: item.width, height: item.height });
    const consoleErrors = [];
    const httpErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('request', (request) => {
      if (/bna-helper-knowledge|bna-bot-widget|RobotScheller/i.test(request.url())) {
        helperScriptRequests.push(request.url().replace(baseUrl, ''));
      }
    });
    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) httpErrors.push({ status, url: response.url().replace(baseUrl, '') });
    });

    await page.goto(`${baseUrl}${item.path}`, { waitUntil: 'domcontentloaded' });
    await waitForText(page, 'Give your son a love for learning Torah');
    const launcherBox = await assertLauncher(page);
    const heroCtaBox = await assertHeroCtaClear(page, launcherBox);
    const pageHtml = await page.content();
    assert.doesNotMatch(pageHtml, /bna-helper-knowledge\.js|bna-bot-widget\.js|Robot Scheller|https:\/\/wa\.me\//);

    if (item.openMenu) {
      await page.locator('[data-menu-button]').click();
      await assert.equal(await page.locator('body').evaluate((node) => node.classList.contains('drawer-open')), true);
      await assert.equal(await page.locator('[data-menu-button]').getAttribute('aria-expanded'), 'true');
      await assert.equal(await page.locator('[data-drawer]').getAttribute('aria-hidden'), 'false');
    }

    const screenshotName = `${item.id}.png`;
    await page.screenshot({ path: path.join(outDir, screenshotName), fullPage: true });
    assert.deepEqual(httpErrors, [], `${item.id} should not load missing local assets or API routes`);
    results.push({ ...item, screenshot: screenshotName, hero_cta_box: heroCtaBox, whatsapp_launcher_box: launcherBox, console_errors: consoleErrors, http_errors: httpErrors });
    await page.close();
  }

  assert.deepEqual(helperScriptRequests, [], 'landing must not request public helper scripts or Robot Scheller assets');
  assert.deepEqual(writeRequests, [], 'landing WhatsApp launcher smoke must not perform POST/write requests');

  await browser.close();
  server.close();

  const report = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    requirement_id: 'REQ-20260712-109',
    fake_whatsapp_number_used: true,
    full_number_returned_by_readiness: false,
    write_requests: writeRequests,
    helper_script_requests: helperScriptRequests,
    screenshots: results.map((item) => item.screenshot),
    results,
  };
  await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  await writeFile(path.join(outDir, 'report.md'), [
    '# One Time Landing WhatsApp Local Smoke',
    '',
    `Generated: ${report.generated_at}`,
    'Requirement: REQ-20260712-109',
    '',
    '## Result',
    '',
    '- PASS /one-time renders one direct WhatsApp launcher at 1440, 1024, 768, 430, and 390 widths.',
    '- PASS no bna-helper-knowledge.js, bna-bot-widget.js, Robot Scheller asset, or hard-coded wa.me link appears on the served landing page.',
    '- PASS launcher uses /api/one-time/public-whatsapp/redirect?intent=free_class and has accessible labeling plus 44px+ target size.',
    '- PASS hero CTA is accessible, above the mobile bottom safe zone, and does not overlap the WhatsApp launcher.',
    '- PASS readiness returns no full number and no_send/no_external_write metadata; redirect uses only a smoke fake number.',
    '- PASS no POST/write requests occurred.',
    '',
    '## Screenshots',
    '',
    ...report.screenshots.map((screenshot) => `- ${screenshot}`),
    '',
  ].join('\n'));

  console.log(`One Time landing WhatsApp smoke passed: ${path.relative(repoRoot, path.join(outDir, 'report.md'))}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
