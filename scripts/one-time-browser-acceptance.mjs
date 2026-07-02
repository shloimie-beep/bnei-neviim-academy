#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.BNA_BROWSER_ACCEPTANCE_BASE_URL || 'http://127.0.0.1:8080';
const runDir = 'ops/execution-runs/2026-06-19-onetime-local-beta-hardening';
const evidenceRoot = path.join(runDir, 'evidence', 'req421-browser-acceptance');

fs.mkdirSync(evidenceRoot, { recursive: true });

const results = [];
const apiResponses = [];
const consoleMessages = [];
const pageErrors = [];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function evidencePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function fileName(label) {
  return `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`;
}

async function withPage(browser, label, viewport, fn) {
  const page = await browser.newPage({ viewport });
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push({ label, type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push({ label, message: error.message });
  });
  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('/api/one-time') && !url.includes('/api/rabbi/member')) return;
    let body = '';
    try {
      body = await response.text();
    } catch {
      body = '';
    }
    apiResponses.push({ label, url, status: response.status(), body });
  });

  try {
    await fn(page);
  } finally {
    await page.close();
  }
}

async function checkRoute(browser, options) {
  const {
    label,
    route,
    viewport,
    requiredText = [],
    screenshot = true,
    extra = async () => ({}),
  } = options;

  await withPage(browser, label, viewport, async (page) => {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
    const status = response ? response.status() : 0;
    const bodyText = await page.locator('body').innerText({ timeout: 10000 });
    for (const text of requiredText) {
      assert.match(bodyText, new RegExp(escapeRegExp(text), 'i'), `${label} missing ${text}`);
    }
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      title: document.title,
    }));
    assert.ok(dimensions.width <= viewport.width + 24, `${label} overflow ${dimensions.width} > ${viewport.width}`);

    const screenshotPath = screenshot ? path.join(evidenceRoot, fileName(label)) : '';
    if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true });
    const extraData = await extra(page);
    results.push({
      label,
      route,
      status,
      viewport,
      dimensions,
      screenshot: screenshotPath ? evidencePath(screenshotPath) : '',
      ...extraData,
    });
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    await checkRoute(browser, {
      label: 'desktop one-time offer',
      route: '/one-time',
      viewport: { width: 1366, height: 900 },
      requiredText: ['Worldwide OneTime Mishnayos', 'One Simple Starting Offer', 'Join Interest Review', 'No checkout yet'],
      extra: async (page) => ({
        hasInterestForm: await page.locator('#interestForm').count(),
        topNavMemberHref: await page.locator('.topnav a', { hasText: 'Member Login' }).first().getAttribute('href'),
      }),
    });

    await checkRoute(browser, {
      label: 'mobile one-time offer',
      route: '/one-time',
      viewport: { width: 390, height: 844 },
      requiredText: ['Worldwide OneTime Mishnayos', 'Join Interest Review'],
    });

    await checkRoute(browser, {
      label: 'desktop israel alias',
      route: '/one-time/israel',
      viewport: { width: 1366, height: 900 },
      requiredText: ['Worldwide OneTime Mishnayos', 'Israel'],
      extra: async (page) => ({
        selectedRegion: await page.locator('select[name="region"]').inputValue(),
        sourceLandingPage: await page.locator('input[name="source_landing_page"]').inputValue(),
        activeCardCount: await page.locator('[data-region-card="israel"].active').count(),
      }),
    });

    await checkRoute(browser, {
      label: 'mobile uk alias',
      route: '/one-time/uk',
      viewport: { width: 390, height: 844 },
      requiredText: ['Worldwide OneTime Mishnayos', 'Private replies'],
      extra: async (page) => ({
        selectedRegion: await page.locator('select[name="region"]').inputValue(),
        sourceLandingPage: await page.locator('input[name="source_landing_page"]').inputValue(),
        activeCardCount: await page.locator('[data-region-card="uk"].active').count(),
      }),
    });

    await withPage(browser, 'interest form submission', { width: 1366, height: 900 }, async (page) => {
      await page.goto(`${baseUrl}/one-time/israel`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.locator('input[name="parent_name"]').fill('Codex Browser Acceptance');
      await page.locator('input[name="email"]').fill(`codex-browser-${Date.now()}@example.test`);
      await page.locator('input[name="phone"]').fill('+10000000001');
      await page.locator('input[name="student_name"]').fill('Browser Acceptance Student');
      await page.locator('select[name="preferred_class_format"]').evaluate((select) => {
        select.value = 'library_live_low_touch';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.locator('input[name="consent"]').check();
      await page.locator('#interestForm button[type="submit"]').click();
      await page.locator('#formStatus').waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForFunction(() => document.querySelector('#formStatus')?.textContent?.includes('No checkout'), null, { timeout: 15000 });
      const statusText = await page.locator('#formStatus').innerText();
      const response = apiResponses.find((item) => item.url.endsWith('/api/one-time/interest') && item.label === 'interest form submission');
      assert.ok(response, 'interest API response captured');
      assert.equal(response.status, 200);
      const payload = JSON.parse(response.body);
      assert.equal(payload.success, true);
      assert.equal(payload.no_send, true);
      assert.equal(payload.no_checkout, true);
      assert.equal(payload.no_access_granted, true);
      assert.equal(payload.external_write_performed, false);
      const screenshotPath = path.join(evidenceRoot, 'interest-form-submission.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results.push({
        label: 'interest form submission',
        route: '/one-time/israel#interest',
        status: 200,
        viewport: { width: 1366, height: 900 },
        formStatus: statusText,
        apiPayload: {
          success: payload.success,
          no_send: payload.no_send,
          no_checkout: payload.no_checkout,
          no_access_granted: payload.no_access_granted,
          external_write_performed: payload.external_write_performed,
          source_landing_page: payload.lead?.source_landing_page,
          status: payload.lead?.status,
          region: payload.lead?.region,
        },
        screenshot: evidencePath(screenshotPath),
      });
    });

    await checkRoute(browser, {
      label: 'member login alias safe entry',
      route: '/one-time/member-login',
      viewport: { width: 1366, height: 900 },
      requiredText: ['One Time Mishnayos', 'Request member link', 'Recorded Classes', 'Live Sessions'],
      extra: async (page) => {
        const body = await page.locator('body').innerText();
        assert.doesNotMatch(body, /Worldwide OneTime Mishnayos - Draft Offer/i);
        return {
          loginFormCount: await page.locator('#loginForm').count(),
          libraryItemsVisible: await page.locator('#libraryList .member-item').count(),
          memberStateText: await page.locator('#memberState').innerText().catch(() => ''),
        };
      },
    });

    await checkRoute(browser, {
      label: 'rabbi preview desktop',
      route: '/rabbi',
      viewport: { width: 1366, height: 900 },
      requiredText: ['OneTimeOneTime', 'Preview mode only', 'Two OneTime paths'],
      extra: async (page) => ({
        previewBanner: await page.locator('#previewBanner').innerText(),
        heroTitle: await page.locator('#heroTitle').innerText(),
      }),
    });

    await withPage(browser, 'public calendar privacy', { width: 390, height: 844 }, async (page) => {
      const response = await page.goto(`${baseUrl}/api/one-time/calendar`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      assert.equal(response.status(), 200);
      const payload = JSON.parse(await page.locator('body').innerText());
      assert.equal(payload.success, true);
      assert.equal(payload.public_only, true);
      const payloadText = JSON.stringify(payload);
      assert.doesNotMatch(payloadText, /private/i);
      assert.doesNotMatch(payloadText, /admin/i);
      results.push({
        label: 'public calendar privacy',
        route: '/api/one-time/calendar',
        status: response.status(),
        viewport: { width: 390, height: 844 },
        public_only: payload.public_only,
        itemCount: Array.isArray(payload.items) ? payload.items.length : Array.isArray(payload.events) ? payload.events.length : 0,
      });
    });
  } finally {
    await browser.close();
  }

  const failures = [];
  for (const result of results) {
    if (result.status < 200 || result.status >= 400) failures.push(`${result.label} returned ${result.status}`);
    if (result.selectedRegion && result.route.includes('/israel') && result.selectedRegion !== 'israel') failures.push('Israel alias did not select israel');
    if (result.selectedRegion && result.route.includes('/uk') && result.selectedRegion !== 'uk') failures.push('UK alias did not select uk');
    if (typeof result.activeCardCount === 'number' && result.activeCardCount < 1) failures.push(`${result.label} missing active region card`);
  }

  const seriousConsole = consoleMessages.filter((message) => !/Failed to load resource.*404/.test(message.text));
  const report = {
    requirement_id: 'REQ-20260619-421',
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    local_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    screenshots_dir: evidencePath(evidenceRoot),
    result_count: results.length,
    results,
    apiResponses: apiResponses.map((item) => ({
      label: item.label,
      url: item.url,
      status: item.status,
      body: item.body.slice(0, 500),
    })),
    consoleMessages: seriousConsole,
    pageErrors,
    success: failures.length === 0 && seriousConsole.length === 0 && pageErrors.length === 0,
    failures,
  };
  const reportPath = path.join(runDir, 'evidence', 'req421-browser-acceptance.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  assert.equal(report.success, true, JSON.stringify({ failures, seriousConsole, pageErrors }, null, 2));
  console.log(JSON.stringify({ success: report.success, result_count: results.length, report: evidencePath(reportPath), screenshots_dir: evidencePath(evidenceRoot) }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
