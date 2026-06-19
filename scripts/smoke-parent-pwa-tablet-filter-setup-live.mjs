#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || process.env.BNA_APP_URL || DEFAULT_BASE_URL,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url' || arg === '--base') {
      options.baseUrl = argv[index + 1] || options.baseUrl;
      index += 1;
    }
  }
  options.baseUrl = String(options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  return options;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchText(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: options.method || 'GET',
    headers: {
      accept: options.accept || 'text/html,application/json,*/*;q=0.8',
      'content-type': options.body ? 'application/json' : undefined,
      'cache-control': 'no-cache',
      'user-agent': 'codex-parent-pwa-filter-setup-live-smoke',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  return { response, text };
}

async function runCheck(report, name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.checks.push({ name, ok: true, duration_ms: Date.now() - started, details });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.checks.push({ name, ok: false, duration_ms: Date.now() - started, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-parent-pwa-tablet-filter-setup-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-parent-pwa-tablet-filter-setup-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# Parent PWA Tablet Filter Setup Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${report.success ? 'passed' : 'failed'}`,
    '',
    '## Checks',
    ...report.checks.map((check) => `- ${check.ok ? 'PASS' : 'FAIL'} ${check.name} (${check.duration_ms}ms)${check.error ? ` - ${check.error}` : ''}`),
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

function mockParentPortalPayload() {
  return {
    success: true,
    parent: {
      email: 'codex-parent-pwa-smoke@example.test',
      name: 'Codex Smoke Parent',
      preferred_language: 'en',
      language: 'en',
      direction: 'ltr',
      has_password: true,
      rabbi_contact: {},
    },
    workspace: { id: 1, workspace_key: 'dratler_family', display_name: 'Smoke Family' },
    household: { id: 9001, display_name: 'Smoke Family', filter_setup_status: 'instructions_sent' },
    setup: {
      filter_setup_status: 'instructions_sent',
      filter_setup_code: '',
      filter_setup_notes: 'Parent tablet',
      install: {
        pwa_manifest: '/parent-manifest.json',
        standalone_ready: true,
        tablet_widths: [768, 1024],
      },
    },
    students: [],
    communications: [],
    provider_messages: [],
    service_providers: [],
    weekly_updates: [],
  };
}

async function smokeViewport(baseUrl, viewport) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });
  const apiCalls = [];
  try {
    await page.route('**/api/parent-portal', async (route) => {
      apiCalls.push({ url: route.request().url(), method: route.request().method() });
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockParentPortalPayload()) });
    });
    await page.route('**/api/household/filter-setup/start', async (route) => {
      apiCalls.push({ url: route.request().url(), method: route.request().method(), body: route.request().postData() });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, setup: { ...mockParentPortalPayload().setup, filter_setup_status: 'instructions_sent' } }),
      });
    });
    await page.route('**/api/household/filter-setup/submit-code', async (route) => {
      const body = route.request().postDataJSON();
      apiCalls.push({ url: route.request().url(), method: route.request().method(), body });
      assert(String(body.setup_code || '').includes('SMOKE-CODE'), 'setup code was not submitted from the form');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, setup: { ...mockParentPortalPayload().setup, filter_setup_status: 'submitted', filter_setup_code: body.setup_code } }),
      });
    });
    await page.goto(`${baseUrl}/parent?section=setup`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-parent-section-panel="setup"]:not(.portal-section-hidden)', { timeout: 10000 });
    await page.waitForSelector('[data-parent-install-app]', { timeout: 10000 });
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      event.prompt = async () => undefined;
      event.userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });
    await page.click('[data-parent-install-app]');
    await page.fill('[data-filter-setup-form] textarea[name="setup_code"]', `SMOKE-CODE-${viewport.width}`);
    await page.fill('[data-filter-setup-form] textarea[name="notes"]', `Smoke viewport ${viewport.width}`);
    await page.click('[data-filter-setup-form] button[type="submit"]');
    await page.waitForFunction(() => {
      const button = document.querySelector('[data-filter-setup-form] button[type="submit"]');
      return button && !button.disabled;
    }, null, { timeout: 10000 });
    await page.waitForSelector('[data-parent-section-panel="setup"]:not(.portal-section-hidden)', { timeout: 10000 });
    const metrics = await page.evaluate(() => ({
      href: window.location.href,
      stored_section: window.localStorage.getItem('bna.parent.activeSection'),
      section_visible: !document.querySelector('[data-parent-section-panel="setup"]')?.classList.contains('portal-section-hidden'),
      install_status: document.querySelector('[data-parent-install-status]')?.textContent || '',
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      setup_api_called: window.__setupApiCalled || false,
    }));
    assert(metrics.href.includes('section=setup'), 'setup section was not preserved in the URL');
    assert(metrics.stored_section === 'setup', 'setup section was not persisted to localStorage');
    assert(metrics.section_visible, 'setup panel is not visible');
    assert(/completed|Install|prompt|browser menu/i.test(metrics.install_status), `unexpected install status: ${metrics.install_status}`);
    assert(!metrics.horizontal_overflow, `viewport ${viewport.width} has horizontal overflow`);
    assert(apiCalls.some((call) => /submit-code/.test(call.url)), 'submit-code API was not called');
    return {
      viewport,
      api_calls: apiCalls.length,
      install_status: metrics.install_status,
      horizontal_overflow: metrics.horizontal_overflow,
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = {
    started_at: new Date().toISOString(),
    app_url: options.baseUrl,
    success: false,
    checks: [],
  };

  await runCheck(report, 'live parent manifest is parent-scoped', async () => {
    const { response, text } = await fetchText(options.baseUrl, '/parent-manifest.json', { accept: 'application/manifest+json,application/json' });
    assert(response.status === 200, `manifest returned ${response.status}`);
    const manifest = JSON.parse(text);
    assert(manifest.id === '/parent', `unexpected manifest id ${manifest.id}`);
    assert(manifest.start_url === '/parent?source=parent-pwa', `unexpected start_url ${manifest.start_url}`);
    assert(!/operations/i.test(JSON.stringify(manifest)), 'parent manifest references Operations');
    return { id: manifest.id, start_url: manifest.start_url, display: manifest.display };
  });

  await runCheck(report, 'live parent page exposes install and setup contracts', async () => {
    const { response, text } = await fetchText(options.baseUrl, '/parent.html');
    assert(response.status === 200, `parent.html returned ${response.status}`);
    for (const snippet of [
      'href="/parent-manifest.json"',
      'data-parent-install-app',
      'beforeinstallprompt',
      'PARENT_SECTION_STORAGE_KEY',
      'data-filter-setup-form',
      '/api/household/filter-setup/submit-code',
    ]) {
      assert(text.includes(snippet), `parent.html missing ${snippet}`);
    }
    return { bytes: text.length };
  });

  await runCheck(report, 'live setup API remains parent-session gated', async () => {
    const read = await fetchText(options.baseUrl, '/api/household/filter-setup', { accept: 'application/json' });
    const submit = await fetchText(options.baseUrl, '/api/household/filter-setup/submit-code', {
      method: 'POST',
      accept: 'application/json',
      body: { setup_code: 'SMOKE-SHOULD-NOT-WRITE' },
    });
    assert(read.response.status === 401, `anonymous setup read expected 401, got ${read.response.status}`);
    assert(submit.response.status === 401, `anonymous setup submit expected 401, got ${submit.response.status}`);
    return { read_status: read.response.status, submit_status: submit.response.status };
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
    { width: 1024, height: 768 },
  ]) {
    await runCheck(report, `mocked parent setup UI works at ${viewport.width}px`, async () => smokeViewport(options.baseUrl, viewport));
  }

  report.success = report.checks.length > 0 && report.checks.every((check) => check.ok);
  const paths = writeReports(report);
  console.log(`Report: ${paths.markdown}`);
  if (!report.success) process.exitCode = 1;
}

main();
