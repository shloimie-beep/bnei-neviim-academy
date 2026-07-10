#!/usr/bin/env node
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const { buildOneTimeSharedReviewData } = require('../src/platform/instances/one-time-shared-review-data');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const publicDir = path.join(repoRoot, 'public');
const outDir = path.join(repoRoot, 'ops', 'ui-audits', '2026-07-09-onetime-provider-crm-layout-local');

const viewports = [
  { id: 'desktop-1440', width: 1440, height: 960 },
  { id: 'tablet-768', width: 768, height: 1024 },
  { id: 'mobile-390', width: 390, height: 844 },
];

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function makeProviderPayload(baseUrl) {
  const review = buildOneTimeSharedReviewData({ baseUrl });
  return {
    success: true,
    ...review.provider_portal,
    links: {
      ...review.links,
      one_time_home: '/one-time',
      parent: '/parent/login',
      student: '/student/login',
      member: '/rabbi-member',
      classroom: '/one-time-classroom.html',
      email_preview: '/one-time-email-review.html',
    },
    provider: {
      ...(review.provider_portal.provider || {}),
      provider_name: 'Rabbi Eli Scheller',
      display_name: 'Rabbi Eli Scheller',
      login_username: 'ELISHELLER',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      status: 'active',
    },
    scope: {
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    test_only: true,
    external_write_performed: false,
  };
}

async function serveStatic(req, res, baseUrl) {
  const url = new URL(req.url || '/', baseUrl);
  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (url.pathname === '/api/provider-portal/session') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(makeProviderPayload(baseUrl)));
    return;
  }
  if (url.pathname === '/api/provider-portal/inquiries') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ cards: [] }));
    return;
  }
  if (url.pathname === '/api/provider-portal/calendar-events') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ events: [] }));
    return;
  }
  if (url.pathname === '/api/provider-portal/mailbox') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      mailbox: {
        readiness: {
          inbox_address: 'info@onetimeonetime.com',
          readiness: { send_allowed: false },
        },
        threads: [
          {
            thread_key: 'parent-welcome',
            contact_name: 'One Time Parent',
            contact_email: 'parent@example.test',
            subject: 'Welcome question',
            preview: 'Can you confirm tonight class link?',
            message_count: 1,
            needs_reply: true,
          },
        ],
      },
    }));
    return;
  }
  if (url.pathname === '/api/provider-portal/mailbox/parent-welcome') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      mailbox: {
        readiness: {
          inbox_address: 'info@onetimeonetime.com',
          readiness: { send_allowed: false },
        },
      },
      thread: {
        thread_key: 'parent-welcome',
        subject: 'Welcome question',
        reply_to_address: 'parent@example.test',
        messages: [
          {
            direction: 'inbound',
            from_name: 'One Time Parent',
            from_address: 'parent@example.test',
            subject: 'Welcome question',
            preview: 'Can you confirm tonight class link?',
            body_text: 'Can you confirm tonight class link?',
            status: 'received',
            occurred_at: '2026-07-08T12:00:00.000Z',
          },
        ],
      },
    }));
    return;
  }
  const requested = url.pathname === '/' || url.pathname === '/provider' ? '/provider.html' : url.pathname;
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

function close(server) {
  return new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

async function captureViewport(browser, baseUrl, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  const route = '/provider.html?admin_provider=one-time&section=crm';
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-one-time-provider-crm-shell]');
  await page.waitForSelector('.bna-bot-launcher', { timeout: 5000 }).catch(() => {});

  const helperBeforeOpen = await page.evaluate(() => ({
    helperLoaded: Boolean(window.BNABotWidgetLoaded),
    providerSurfaceClass: document.body.classList.contains('bna-assistant-surface-one-time-provider'),
  }));
  let helperTitle = '';
  const launcher = page.locator('.bna-bot-launcher');
  if (await launcher.count()) {
    await launcher.first().click();
    await page.waitForSelector('.bna-bot-panel.is-open', { timeout: 5000 });
    helperTitle = await page.locator('.bna-bot-head strong').first().innerText().catch(() => '');
    await page.locator('.bna-bot-close').first().click().catch(() => {});
    await page.waitForSelector('.bna-bot-panel.is-open', { state: 'detached', timeout: 1200 }).catch(() => {});
  }

  const metrics = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, ' ').trim();
    const shell = document.querySelector('[data-one-time-provider-crm-shell]');
    const rect = shell?.getBoundingClientRect();
    const buttonRects = Array.from(document.querySelectorAll('[data-one-time-provider-crm-shell] .btn')).map((node) => {
      const box = node.getBoundingClientRect();
      return { text: (node.textContent || '').trim(), width: Math.round(box.width), height: Math.round(box.height) };
    });
    return {
      title: document.title,
      bodyHasBnaHelper: /BNA Helper/i.test(text),
      bodyHasFixtureLeak: /TEST Parent One Time|TEST Student One Time|test\.parent|example\.test|Message Actions|BNA Academy/i.test(text),
      bodyHasSetupDiagnostics: /configured|not configured|runtime config|webhook|Access Checklist|Commercial Model|External Apps/i.test(text),
      crmShellCount: document.querySelectorAll('[data-one-time-provider-crm-shell]').length,
      crmWorkbenchCount: document.querySelectorAll('.one-time-crm-workbench').length,
      crmDetailCount: document.querySelectorAll('.one-time-crm-detail').length,
      activeCrmNav: Boolean(document.querySelector('[data-provider-nav="crm"].active')),
      visibleCrmSection: Boolean(document.querySelector('[data-provider-section="crm"]:not(.provider-section-hidden)')),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      crmTop: rect ? Math.round(rect.top) : null,
      crmWidth: rect ? Math.round(rect.width) : null,
      viewportWidth: window.innerWidth,
      buttonRects,
    };
  });

  const screenshot = path.join(outDir, `${viewport.id}-crm.png`);
  await page.screenshot({ path: screenshot, fullPage: true, type: 'png', animations: 'disabled' });
  await page.close();

  const passed = Boolean(
    helperBeforeOpen.helperLoaded &&
      helperBeforeOpen.providerSurfaceClass &&
      /Robot Scheller/i.test(helperTitle) &&
      metrics.crmShellCount === 1 &&
      metrics.crmWorkbenchCount === 1 &&
      metrics.crmDetailCount === 1 &&
      metrics.activeCrmNav &&
      metrics.visibleCrmSection &&
      !metrics.horizontalOverflow &&
      !metrics.bodyHasFixtureLeak &&
      !metrics.bodyHasSetupDiagnostics &&
      !metrics.bodyHasBnaHelper &&
      consoleErrors.length === 0 &&
      pageErrors.length === 0 &&
      failedRequests.length === 0 &&
      badResponses.length === 0
  );

  return {
    viewport,
    route,
    screenshot: rel(screenshot),
    helperTitle,
    ...helperBeforeOpen,
    ...metrics,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    passed,
  };
}

async function main() {
  await mkdir(outDir, { recursive: true });
  let baseUrl = '';
  const server = createServer((req, res) => {
    serveStatic(req, res, baseUrl).catch((error) => {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error instanceof Error ? error.stack || error.message : String(error));
    });
  });
  const port = await listen(server);
  baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  let results = [];
  try {
    for (const viewport of viewports) {
      results.push(await captureViewport(browser, baseUrl, viewport));
    }
  } finally {
    await browser.close();
    await close(server);
  }

  const report = {
    status: results.every((result) => result.passed) ? 'PASS' : 'FAIL',
    generated_at: new Date().toISOString(),
    target: '/provider.html?admin_provider=one-time&section=crm',
    scope: 'Local signed One Time provider CRM layout smoke; no database, sends, payments, external accounts, or production writes.',
    results,
  };
  await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outDir, 'report.md'), [
    '# One Time Provider CRM Layout Local Smoke',
    '',
    `Status: ${report.status}`,
    `Generated: ${report.generated_at}`,
    '',
    report.scope,
    '',
    '| Viewport | Passed | Overflow | Fixture leak | Diagnostics leak | Helper | Screenshot |',
    '|---|---:|---:|---:|---:|---|---|',
    ...results.map((result) => [
      `| ${result.viewport.width}x${result.viewport.height}`,
      String(result.passed),
      String(result.horizontalOverflow),
      String(result.bodyHasFixtureLeak),
      String(result.bodyHasSetupDiagnostics),
      result.helperTitle || 'missing',
      result.screenshot,
    ].join(' | ') + ' |'),
    '',
    'Checks:',
    '',
    '- CRM renders as one workbench shell with list and detail regions.',
    '- CRM is the active visible provider section from the direct URL.',
    '- No horizontal overflow on desktop, tablet, or 390px mobile.',
    '- Rabbi-facing CRM text does not expose TEST Parent/Student names, `.example.test` emails, Message Actions duplicates, BNA Academy, or platform setup diagnostics.',
    '- Helper loads as the One Time provider helper, not the BNA helper.',
    '- No console errors, page errors, or failed requests.',
    '',
  ].join('\n'));

  console.log(`${report.status} ${rel(path.join(outDir, 'report.md'))}`);
  if (report.status !== 'PASS') process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
