#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const { buildOneTimeSharedReviewData } = require('../src/platform/instances/one-time-shared-review-data');

const ROOT = process.cwd();
const PUBLIC_ROOT = path.join(ROOT, 'public');
const DEFAULT_OUT_DIR = path.join(ROOT, 'ops', 'ui-audits', '2026-07-13-onetime-billing-ui-current-state');
const REQUIREMENT_ID = 'REQ-20260713-960';
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';

const VIEWPORTS = [
  { id: '1440-desktop', width: 1440, height: 1000 },
  { id: '1024-desktop-tablet', width: 1024, height: 900 },
  { id: '768-tablet', width: 768, height: 900 },
  { id: '430-mobile', width: 430, height: 932 },
  { id: '390-mobile', width: 390, height: 844 },
];

function argValue(name, fallback = '') {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${String(value || '').replace(/\r\n/g, '\n')}\n`);
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function json(res, payload, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function createAuditServer() {
  let activePort = 0;
  const served = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${activePort || 0}`);
    if (url.pathname === '/api/one-time-review/provider') {
      const baseUrl = `http://127.0.0.1:${activePort || 0}`;
      const data = buildOneTimeSharedReviewData({ baseUrl });
      return json(res, {
        success: true,
        ...data.provider_portal,
        links: data.links,
        test_only: true,
        external_write_performed: false,
      });
    }
    if (url.pathname.startsWith('/api/')) {
      return json(res, { success: true, items: [], external_write_performed: false });
    }

    const requested = url.pathname === '/' ? '/provider.html' : url.pathname;
    const filePath = path.resolve(PUBLIC_ROOT, decodeURIComponent(requested.replace(/^\/+/, '')));
    if (!filePath.startsWith(PUBLIC_ROOT)) return json(res, { error: 'forbidden' }, 403);
    fs.readFile(filePath, (error, body) => {
      if (error) return json(res, { error: 'not found' }, 404);
      served.push(requested);
      res.writeHead(200, { 'content-type': contentType(filePath) });
      res.end(body);
    });
  });
  return {
    served,
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

async function captureViewport(browser, baseUrl, outDir, viewport, phaseLabel) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const failedRequests = [];
  const badResponses = [];
  const consoleErrors = [];
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim());
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !/favicon\.ico/i.test(response.url())) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${baseUrl}/provider.html?review=one-time&section=billing`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForSelector('#portalPanel.one-time-provider-workspace:not(.hidden)', { timeout: 15000 });

  const screenshotPath = path.join(outDir, 'screenshots', `provider-billing-${phaseLabel}-${viewport.id}.png`);
  ensureDir(path.dirname(screenshotPath));
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const state = await page.evaluate(() => {
    const activeNav = document.querySelector('[data-provider-nav].active');
    const visibleSection = document.querySelector('[data-provider-section]:not(.provider-section-hidden)');
    const sectionIds = [...document.querySelectorAll('[data-provider-section]')]
      .map((node) => node.getAttribute('data-provider-section'))
      .filter(Boolean);
    const navLabels = [...document.querySelectorAll('[data-provider-nav]')]
      .map((node) => ({
        id: node.getAttribute('data-provider-nav'),
        label: (node.textContent || '').trim().replace(/\s+/g, ' '),
      }))
      .filter((item) => item.id);
    const bodyText = document.body?.innerText || '';
    const scripts = [...document.querySelectorAll('script[src]')].map((node) => node.getAttribute('src'));
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.getAttribute('href'));
    return {
      title: document.title,
      active_section: activeNav?.getAttribute('data-provider-nav') || null,
      active_label: (activeNav?.textContent || '').trim().replace(/\s+/g, ' '),
      visible_section: visibleSection?.getAttribute('data-provider-section') || null,
      visible_heading: (visibleSection?.querySelector('h1,h2,h3')?.textContent || '').trim().replace(/\s+/g, ' '),
      section_ids: sectionIds,
      nav_labels: navLabels,
      billing_section_exists: sectionIds.includes('billing'),
      billing_nav_exists: navLabels.some((item) => item.id === 'billing' || /billing/i.test(item.label)),
      billing_shell_exists: Boolean(document.querySelector('[data-one-time-provider-billing-shell]')),
      billing_route_module_loaded: Boolean(window.OneTimeProviderRouteModules?.billing),
      billing_actions_disabled: [
        'ACTION-ONETIME-BILLING-NOTICE-PREVIEW',
        'ACTION-ONETIME-BILLING-LIVE-CHARGE-BLOCKED',
        'ACTION-ONETIME-BILLING-REFUND-REVIEW-BLOCKED',
        'ACTION-ONETIME-BILLING-ACCESS-AUTOMATION-BLOCKED',
      ].every((id) => {
        const node = document.querySelector(`[data-action-id="${id}"]`);
        return node && node.disabled === true;
      }),
      route_module_scripts: scripts.filter((src) => /one-time-provider-.*-route\.js/.test(src || '')),
      operations_assets_loaded: scripts.includes('/js/operations-shell.js') || styles.includes('/css/operations-shell.css'),
      old_trial_copy_visible: /\btrial\b|free access|Free Trial/i.test(bodyText),
      stripe_copy_visible: /Stripe/i.test(bodyText),
      no_trial_copy_visible: /no\s+trial/i.test(bodyText),
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      browser_viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  });
  await page.close();

  return {
    viewport,
    route: '/provider.html?review=one-time&section=billing',
    screenshot: rel(screenshotPath),
    failed_requests: failedRequests,
    bad_responses: badResponses,
    console_errors: consoleErrors,
    ...state,
  };
}

async function main() {
  const outDir = path.resolve(argValue('--out-dir', DEFAULT_OUT_DIR));
  const expect = String(argValue('--expect', 'auto')).toLowerCase();
  const phaseLabel = expect === 'before' || expect === 'after' ? expect : 'current';
  ensureDir(outDir);
  const generatedAt = new Date().toISOString();
  const server = createAuditServer();
  const baseUrl = await server.listen();
  const browser = await chromium.launch({ headless: true });
  let captures = [];
  try {
    captures = [];
    for (const viewport of VIEWPORTS) {
      captures.push(await captureViewport(browser, baseUrl, outDir, viewport, phaseLabel));
    }
  } finally {
    await browser.close();
    await server.close();
  }

  const beforeChecks = [
    {
      id: 'before_billing_section_missing',
      passed: captures.every((capture) => capture.billing_section_exists === false && capture.billing_nav_exists === false),
      detail: 'Current provider shell has no dedicated Billing section or nav item before implementation.',
    },
    {
      id: 'requested_billing_route_falls_back_to_overview',
      passed: captures.every((capture) => capture.active_section === 'overview' && capture.visible_section === 'overview'),
      detail: 'section=billing currently resolves to the Overview/Dashboard state.',
    },
    {
      id: 'before_no_billing_route_module',
      passed: captures.every((capture) => capture.billing_route_module_loaded === false && !capture.route_module_scripts.includes('/js/one-time-provider-billing-route.js')),
      detail: 'No Billing route module is loaded before implementation.',
    },
  ];
  const afterChecks = [
    {
      id: 'after_billing_section_active',
      passed: captures.every((capture) => capture.billing_section_exists === true && capture.billing_nav_exists === true && capture.active_section === 'billing' && capture.visible_section === 'billing'),
      detail: 'Billing section, nav item, and active route are present after implementation.',
    },
    {
      id: 'after_billing_route_module_loaded',
      passed: captures.every((capture) => capture.billing_shell_exists === true && capture.billing_route_module_loaded === true && capture.route_module_scripts.includes('/js/one-time-provider-billing-route.js')),
      detail: 'Billing route module loads lazily on section=billing.',
    },
    {
      id: 'after_billing_actions_disabled',
      passed: captures.every((capture) => capture.billing_actions_disabled === true),
      detail: 'Notice, live billing, refund, and access automation actions remain disabled.',
    },
  ];
  const autoChecks = [
    {
      id: 'current_billing_route_resolves',
      passed: captures.every((capture) => ['overview', 'billing'].includes(capture.active_section)),
      detail: 'Billing route either falls back to current-state overview before implementation or resolves to Billing after implementation.',
    },
  ];
  const commonChecks = [
    {
      id: 'no_horizontal_overflow',
      passed: captures.every((capture) => capture.horizontal_overflow === false),
      detail: 'No automated horizontal overflow at required viewports.',
    },
    {
      id: 'no_runtime_errors',
      passed: captures.every((capture) => !capture.failed_requests.length && !capture.bad_responses.length && !capture.console_errors.length),
      detail: 'Local read-only review harness reported no failed requests, 4xx/5xx responses, or console errors.',
    },
  ];
  const checks = [
    ...(expect === 'before' ? beforeChecks : []),
    ...(expect === 'after' ? afterChecks : []),
    ...(expect === 'auto' ? autoChecks : []),
    ...commonChecks,
  ];
  const finding = captures.every((capture) => capture.billing_section_exists)
    ? 'The dedicated provider Billing section exists, loads the lazy Billing route module, and remains read-only/gated across the required viewport matrix.'
    : 'The dedicated provider shell exists and renders safely, but `section=billing` has no Billing section, nav item, or lazy route module yet. It falls back to Dashboard/Overview at every required viewport.';
  const phaseScope = expect === 'after'
    ? 'After-implementation Billing UI visual audit for the One Time provider Billing route. Local read-only fixture only; no live account, payment, email, WhatsApp, refund, access, or provider mutation was attempted.'
    : expect === 'before'
      ? 'Current-state visual audit before implementing the One Time provider Billing UI. Local read-only fixture only; no live account, payment, email, WhatsApp, refund, access, or provider mutation was attempted.'
      : 'Current-state Billing route visual audit for the One Time provider shell. Local read-only fixture only; no live account, payment, email, WhatsApp, refund, access, or provider mutation was attempted.';

  const report = {
    status: checks.every((check) => check.passed) ? 'PASS' : 'FAIL',
    generated_at: generatedAt,
    requirement_id: REQUIREMENT_ID,
    expectation: expect,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    scope: phaseScope,
    base_url: baseUrl,
    captures,
    checks,
    external_write_performed: false,
    production_data_mutation_performed: false,
  };

  const jsonPath = path.join(outDir, 'report.json');
  const mdPath = path.join(outDir, 'report.md');
  const reportTitle = expect === 'after'
    ? '# One Time Billing UI After-Implementation Visual Audit'
    : '# One Time Billing UI Current-State Visual Audit';
  writeJson(jsonPath, report);
  writeText(mdPath, [
    reportTitle,
    '',
    `Status: ${report.status}`,
    `Generated: ${report.generated_at}`,
    `Requirement: ${report.requirement_id}`,
    `Workspace: ${report.workspace_key}`,
    `Project: ${report.project_key}`,
    '',
    report.scope,
    '',
    '## Checks',
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
    ...checks.map((check) => `| \`${check.id}\` | ${check.passed ? 'PASS' : 'FAIL'} | ${check.detail.replace(/\|/g, '\\|')} |`),
    '',
    '## Required Viewports',
    '',
    '| Viewport | Active section | Billing nav | Overflow | Runtime issues | Screenshot |',
    '| --- | --- | --- | --- | --- | --- |',
    ...captures.map((capture) => [
      `\`${capture.viewport.id}\``,
      `\`${capture.active_section || '(none)'}\``,
      capture.billing_nav_exists ? 'yes' : 'no',
      capture.horizontal_overflow ? 'yes' : 'no',
      `${capture.failed_requests.length}/${capture.bad_responses.length}/${capture.console_errors.length}`,
      capture.screenshot,
    ].join(' | ')).map((line) => `| ${line} |`),
    '',
    '## Finding',
    '',
    finding,
  ].join('\n'));

  console.log(JSON.stringify({
    ok: report.status === 'PASS',
    report: rel(mdPath),
    json: rel(jsonPath),
    screenshots: captures.map((capture) => capture.screenshot),
  }, null, 2));

  if (report.status !== 'PASS') process.exit(1);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
