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
const outDir = path.join(repoRoot, 'ops', 'performance-audits', '2026-07-13-onetime-member-performance-local');

const viewports = [
  { id: '1440-desktop', width: 1440, height: 1000 },
  { id: '1024-desktop-tablet', width: 1024, height: 900 },
  { id: '768-tablet', width: 768, height: 900 },
  { id: '430-mobile', width: 430, height: 932 },
  { id: '390-mobile', width: 390, height: 844 },
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

function staticPathFor(pathname) {
  if (pathname === '/' || pathname === '/rabbi-member') return '/rabbi-member.html';
  return pathname;
}

function json(res, payload, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function serve(req, res, baseUrl, requests) {
  const url = new URL(req.url || '/', baseUrl);
  requests.push({ method: req.method || 'GET', path: url.pathname });
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (url.pathname.startsWith('/api/rabbi/member/')) {
    return json(res, { success: false, error: 'member_session_required' }, 401);
  }
  if (url.pathname.startsWith('/api/bna/assistant/')) {
    return json(res, { success: false, error: 'assistant_not_called_by_performance_smoke' }, 503);
  }

  const requested = staticPathFor(url.pathname);
  const safePath = path.normalize(decodeURIComponent(requested).replace(/^\/+/, '')).replace(/^(\.\.[\\/])+/, '');
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

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

async function captureMemberViewport(browser, baseUrl, viewport) {
  console.log(`Capturing /rabbi-member ${viewport.id}...`);
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  page.setDefaultNavigationTimeout(8000);

  const failedRequests = [];
  const badResponses = [];
  const consoleErrors = [];
  const requestPaths = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    requestPaths.push(url.pathname);
  });
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim()));
  page.on('response', (response) => {
    if (response.status() >= 400 && !/favicon\.ico/i.test(response.url())) badResponses.push(`${response.status()} ${response.url().replace(baseUrl, '')}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 220));
  });

  const started = Date.now();
  const response = await page.goto(`${baseUrl}/rabbi-member`, { waitUntil: 'domcontentloaded', timeout: 8000 });
  const domContentLoadedMs = Date.now() - started;
  assert.equal(response?.status(), 200, `${viewport.id} /rabbi-member should return 200`);
  const bodyPreview = await page.locator('body').innerText({ timeout: 1000 }).catch(() => '');
  const htmlPreview = await page.content().catch(() => '');
  assert.match(
    bodyPreview,
    /One Time Family Portal/,
    `${viewport.id} should render member portal text; body=${bodyPreview.slice(0, 500)} html=${htmlPreview.slice(0, 500)}`
  );
  await page.waitForTimeout(900);
  await page.waitForSelector('text=One Time Family Portal', { timeout: 2000 });
  await page.waitForSelector('text=Request family portal link', { timeout: 2000 });
  await page.waitForSelector('text=Library access is pending', { timeout: 2000 });

  const screenshotFile = path.join(outDir, 'screenshots', `member-portal-${viewport.id}.png`);
  await mkdir(path.dirname(screenshotFile), { recursive: true });
  await page.screenshot({ path: screenshotFile, fullPage: false, timeout: 5000 });

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const bodyText = document.body?.innerText || '';
    return {
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      ready_state: document.readyState,
      nav_dom_content_loaded_ms: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      nav_load_event_ms: nav ? Math.round(nav.loadEventEnd) : null,
      interactive_count: document.querySelectorAll('button, a, input, select, textarea').length,
      helper_ready_initially: Boolean(window.BNAAssistant),
      helper_deferred_state: document.body?.dataset?.memberAssistantState || '',
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      has_bna_private_leak: /Avi Synthetic|Benny Synthetic|Synthetic Parent|BNA accountability/i.test(bodyText),
    };
  });

  assert.ok(domContentLoadedMs < 2500, `${viewport.id} DCL should stay under 2500ms, got ${domContentLoadedMs}ms`);
  assert.equal(metrics.h1, 'One Time Family Portal');
  assert.equal(metrics.has_bna_private_leak, false, `${viewport.id} should not expose BNA private fixture data`);
  assert.equal(metrics.horizontal_overflow, false, `${viewport.id} should not horizontally overflow`);
  assert.deepEqual(failedRequests, [], `${viewport.id} should not have failed requests`);
  assert.deepEqual(
    badResponses.filter((entry) => !entry.includes('/api/rabbi/member/')),
    [],
    `${viewport.id} should not have missing static assets`
  );

  await context.close();
  console.log(`Captured /rabbi-member ${viewport.id}: ${domContentLoadedMs}ms DCL`);
  return {
    viewport: viewport.id,
    width: viewport.width,
    height: viewport.height,
    status: response?.status() || 0,
    dom_content_loaded_ms: domContentLoadedMs,
    screenshot: rel(screenshotFile),
    request_paths: [...new Set(requestPaths)],
    bad_responses: badResponses,
    failed_requests: failedRequests,
    console_errors: consoleErrors,
    metrics,
  };
}

async function verifyDeferredHelper(browser, baseUrl) {
  console.log('Verifying deferred member assistant...');
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  page.setDefaultNavigationTimeout(8000);
  await page.goto(`${baseUrl}/rabbi-member`, { waitUntil: 'domcontentloaded', timeout: 8000 });
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => Boolean(window.BNAAssistant)), false, 'assistant should not block first render');
  console.log('Deferred assistant absent on first render; clicking Helper...');
  await page.locator('[data-bna-assistant-open]').first().click({ timeout: 5000 });
  console.log('Helper clicked; waiting for deferred assistant...');
  await page.waitForFunction(() => Boolean(window.BNAAssistant?.open), null, { timeout: 5000 });
  await page.waitForSelector('#bnaBotPanel', { timeout: 5000 });
  const assistantState = await page.evaluate(() => ({
    surface: window.BNAAssistant?.surface || '',
    panelCount: document.querySelectorAll('#bnaBotPanel').length,
    bodyState: document.body?.dataset?.memberAssistantState || '',
  }));
  assert.equal(assistantState.surface, 'one_time_member');
  assert.equal(assistantState.panelCount, 1);
  assert.equal(assistantState.bodyState, 'ready');
  await context.close();
  console.log('Deferred assistant opened successfully.');
  return assistantState;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const requests = [];
  const server = createServer((req, res) => {
    serve(req, res, 'http://127.0.0.1', requests).catch((error) => {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error.stack || error.message);
    });
  });
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });

  try {
    const results = [];
    for (const viewport of viewports) {
      results.push(await captureMemberViewport(browser, baseUrl, viewport));
    }
    const deferredHelper = await verifyDeferredHelper(browser, baseUrl);
    const report = {
      generated_at: new Date().toISOString(),
      requirement_id: 'REQ-20260713-934',
      packet_id: 'PKT-20260713-934A',
      base_url: baseUrl,
      external_write_performed: false,
      production_data_mutation_performed: false,
      route: '/rabbi-member',
      viewports,
      results,
      deferred_helper: deferredHelper,
      server_requests: requests,
    };
    await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(path.join(outDir, 'report.md'), [
      '# One Time Member Portal Performance Local Smoke',
      '',
      `Generated: ${report.generated_at}`,
      `Requirement: ${report.requirement_id}`,
      `Packet: ${report.packet_id}`,
      '',
      '## Result',
      '',
      '- PASS `/rabbi-member` reaches screenshot-ready first useful content at 1440, 1024, 768, 430, and 390 widths.',
      '- PASS the member assistant is deferred from first render and still opens on Helper click.',
      '- PASS no external writes, production mutations, private data leaks, or horizontal overflow were observed.',
      '',
      '## Timing',
      '',
      '| Viewport | DCL | Screenshot |',
      '|---|---:|---|',
      ...results.map((item) => `| ${item.viewport} | ${item.dom_content_loaded_ms}ms | ${item.screenshot} |`),
      '',
    ].join('\n'));
    console.log(`One Time member performance smoke passed: ${rel(path.join(outDir, 'report.md'))}`);
  } finally {
    await browser.close().catch(() => {});
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
