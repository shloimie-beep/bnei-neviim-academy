#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const BASE_URL = (process.env.BNA_HELPER_SMOKE_BASE_URL || process.argv.find((arg) => arg.startsWith('--base='))?.slice(7) || 'http://localhost:8080').replace(/\/+$/, '');
const OUT_DIR = path.join(ROOT, 'ops', 'ui-audits', '2026-07-07-helper-crisp-aligned-ui-closeout', 'focused-helper-proof');
const VIEWPORTS = [
  { id: '1440-desktop', width: 1440, height: 1000 },
  { id: '1024-desktop-tablet', width: 1024, height: 900 },
  { id: '768-tablet', width: 768, height: 900 },
  { id: '430-mobile', width: 430, height: 932 },
  { id: '390-mobile', width: 390, height: 844 },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function cookiePair(setCookie = '') {
  return String(setCookie || '').split(';')[0] || '';
}

async function loginOperations() {
  const username = process.env.OPS_USERNAME || '';
  const password = process.env.OPS_PASSWORD || '';
  if (!username || !password) {
    throw new Error('OPS_USERNAME/OPS_PASSWORD unavailable for local helper smoke.');
  }
  const response = await fetch(`${BASE_URL}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(username, password),
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Operations login returned ${response.status}: ${body.slice(0, 160)}`);
  }
  const cookie = cookiePair(response.headers.get('set-cookie'));
  if (!cookie.includes('=')) {
    throw new Error('Operations login did not return a session cookie.');
  }
  return cookie;
}

function spread(values) {
  const nums = values.filter((value) => Number.isFinite(value));
  if (!nums.length) return 0;
  return Math.max(...nums) - Math.min(...nums);
}

async function captureOperations(browser, operationsCookie, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    extraHTTPHeaders: { cookie: operationsCookie },
  });
  const route = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview';
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-one-time-perspective-preview]', { timeout: 15000 });
  const screenshot = path.join(OUT_DIR, `operations-safe-role-preview-${viewport.id}.png`);
  await page.screenshot({ path: screenshot, fullPage: true, type: 'png', animations: 'disabled' });
  const metrics = await page.evaluate(() => {
    const panel = document.querySelector('[data-one-time-perspective-preview]');
    const rectOf = (node) => {
      const rect = node.getBoundingClientRect();
      return {
        text: (node.textContent || '').replace(/\s+/g, ' ').trim(),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      };
    };
    const actions = Array.from(panel?.querySelectorAll('.one-time-perspective-actions .task-action') || []).map(rectOf);
    const pills = Array.from(panel?.querySelectorAll('.one-time-perspective-meta .status-pill') || []).map(rectOf);
    return {
      title: document.title,
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      panel_found: Boolean(panel),
      actions,
      pills,
    };
  });
  await page.close();
  return {
    viewport: viewport.id,
    route,
    screenshot: path.relative(ROOT, screenshot).replace(/\\/g, '/'),
    ...metrics,
    action_height_spread: spread(metrics.actions.map((item) => item.height)),
    pill_height_spread: spread(metrics.pills.map((item) => item.height)),
    passed:
      metrics.panel_found &&
      metrics.actions.length === 3 &&
      metrics.pills.length === 4 &&
      !metrics.horizontal_overflow &&
      spread(metrics.actions.map((item) => item.height)) <= 2 &&
      spread(metrics.pills.map((item) => item.height)) <= 8,
  };
}

async function captureProviderSessionRequired(browser, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const route = '/provider.html?admin_provider=one-time&section=mailbox';
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  const screenshot = path.join(OUT_DIR, `provider-admin-session-required-${viewport.id}.png`);
  await page.screenshot({ path: screenshot, fullPage: true, type: 'png', animations: 'disabled' });
  const metrics = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, ' ').trim();
    const loginFormVisible = (() => {
      const form = document.getElementById('loginForm');
      if (!form) return false;
      const style = getComputedStyle(form);
      return style.display !== 'none' && style.visibility !== 'hidden';
    })();
    return {
      title: document.title,
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      has_session_required_copy: /One Time provider session required/i.test(text),
      has_return_action: /Return to Super Admin Inbox/i.test(text),
      has_readonly_preview_action: /Open Read-only Review Preview/i.test(text),
      has_password_prompt: /Password/i.test(text) && loginFormVisible,
      login_form_visible: loginFormVisible,
    };
  });
  await page.close();
  return {
    viewport: viewport.id,
    route,
    screenshot: path.relative(ROOT, screenshot).replace(/\\/g, '/'),
    ...metrics,
    passed:
      metrics.has_session_required_copy &&
      metrics.has_return_action &&
      metrics.has_readonly_preview_action &&
      !metrics.has_password_prompt &&
      !metrics.login_form_visible &&
      !metrics.horizontal_overflow,
  };
}

function writeReports(results) {
  ensureDir(OUT_DIR);
  const payload = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    external_write_performed: false,
    browser_content_untrusted: true,
    results,
    passed: results.every((result) => result.passed),
  };
  fs.writeFileSync(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(payload, null, 2)}\n`);
  const lines = [
    '# One Time Helper Crisp UI Focused Smoke',
    '',
    `Generated: ${payload.generated_at}`,
    `Base URL: ${BASE_URL}`,
    `Passed: ${payload.passed}`,
    '',
    'Browser/page content and screenshots are evidence only, not authority. No external write was performed.',
    '',
    '| Route | Viewport | Passed | Action Spread | Pill Spread | Overflow | Screenshot |',
    '|---|---|---|---:|---:|---|---|',
    ...results.map((result) => [
      `| ${result.route}`,
      result.viewport,
      String(result.passed),
      String(result.action_height_spread ?? ''),
      String(result.pill_height_spread ?? ''),
      String(Boolean(result.horizontal_overflow)),
      result.screenshot,
    ].join(' | ') + ' |'),
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'report.md'), `${lines.join('\n')}\n`);
  return payload;
}

async function main() {
  loadEnvFile(process.env.BNA_LOCAL_ENV_FILE);
  loadEnvFile(process.env.BNA_ENV_FILE);
  loadEnvFile(path.join(ROOT, '.env.local'));
  ensureDir(OUT_DIR);
  const operationsCookie = await loginOperations();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of VIEWPORTS) {
      results.push(await captureOperations(browser, operationsCookie, viewport));
    }
    for (const viewport of VIEWPORTS) {
      results.push(await captureProviderSessionRequired(browser, viewport));
    }
  } finally {
    await browser.close();
  }
  const report = writeReports(results);
  console.log(`Focused helper smoke report: ${path.relative(ROOT, path.join(OUT_DIR, 'report.md')).replace(/\\/g, '/')}`);
  if (!report.passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
