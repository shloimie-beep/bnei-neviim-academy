#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const VIEWPORTS = [
  { id: '1440', width: 1440, height: 1000 },
  { id: '1024', width: 1024, height: 900 },
  { id: '768', width: 768, height: 900 },
  { id: '430', width: 430, height: 932 },
  { id: '390', width: 390, height: 844 },
];

const ROUTES = [
  { id: 'landing', path: '/one-time' },
  { id: 'signup', path: '/one-time/signup' },
];

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.ONETIME_BASE_URL || process.env.BNA_LIVE_BASE_URL || 'https://join.onetimeonetime.com',
    expectedSha: process.env.BNA_EXPECT_DEPLOYED_SHA || '',
    outDir: path.resolve('ops', 'ui-audits', '2026-07-13-onetime-landing-signup-responsive-live'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url' || arg === '--base') {
      options.baseUrl = argv[index + 1] || options.baseUrl;
      index += 1;
    } else if (arg === '--expected-sha') {
      options.expectedSha = argv[index + 1] || options.expectedSha;
      index += 1;
    } else if (arg.startsWith('--expected-sha=')) {
      options.expectedSha = arg.slice('--expected-sha='.length);
    } else if (arg === '--out-dir') {
      options.outDir = path.resolve(argv[index + 1] || options.outDir);
      index += 1;
    } else if (/^https?:\/\//i.test(arg)) {
      options.baseUrl = arg;
    }
  }
  options.baseUrl = String(options.baseUrl || '').replace(/\/+$/, '');
  options.expectedSha = String(options.expectedSha || '').trim();
  return options;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { accept: 'application/json', 'cache-control': 'no-cache' },
  }).catch((error) => ({ ok: false, status: 0, json: async () => ({ error: error.message }) }));
  return {
    ok: Boolean(response.ok),
    status: response.status || 0,
    json: await response.json().catch(() => null),
  };
}

function forbiddenPublicText(text) {
  return /30 DAYS TO JOIN|START WITH 30 DAYS FREE|30-day trial|free trial|trial object|hidden trial|student portal|parent portal|classroom code|recovery code|Bnei Nevi'?im Academy|Torah Learning for Boys/i.test(text);
}

function hasOfferText(text) {
  return /Free promotional access until Friday, September 11, 2026 \(Israel time\)/i.test(text)
    && /\$67\/month afterward/i.test(text)
    && /starts only after you actively choose it\. No card today\./i.test(text);
}

async function inspectPage(page, baseUrl, route, screenshotPath) {
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(240, Math.floor((window.innerHeight || 800) * 0.75));
    const max = Math.max(document.documentElement.scrollHeight || 0, document.body?.scrollHeight || 0);
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await wait(90);
    }
    window.scrollTo(0, 0);
    await wait(180);
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => Math.abs(window.scrollY || 0) <= 1, null, { timeout: 3000 }).catch(() => null);
  await page.waitForTimeout(180);
  const text = await page.locator('body').innerText({ timeout: 5000 });
  const metrics = await page.evaluate((routeId) => {
    const doc = document.documentElement;
    const visible = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return false;
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    return {
      route_id: routeId,
      client_width: doc.clientWidth,
      scroll_width: doc.scrollWidth,
      scroll_y: Math.round(window.scrollY || 0),
      has_horizontal_overflow: doc.scrollWidth > doc.clientWidth + 1,
      has_landing_offer: visible('[data-campaign-offer-copy]'),
      has_rosh_ticker: visible('[data-rosh-hashanah-ticker]'),
      has_signup_form: visible('[data-one-time-direct-signup-form]'),
      has_family_school_picker: visible('[data-signup-type-picker]'),
      actionless_visible_buttons: Array.from(document.querySelectorAll('button')).filter((button) => {
        const style = window.getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        if (style.display === 'none' || style.visibility === 'hidden' || rect.width <= 0 || rect.height <= 0) return false;
        return !button.hasAttribute('data-action-id')
          && !button.hasAttribute('data-button-state')
          && !button.hasAttribute('data-one-time-action-state');
      }).map((button) => button.outerHTML.replace(/\s+/g, ' ').slice(0, 160)),
    };
  }, route.id);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  return {
    ...metrics,
    text_has_offer_policy: route.id === 'landing' ? hasOfferText(text) : true,
    text_has_forbidden_public_copy: forbiddenPublicText(text),
    screenshot_path: screenshotPath,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const screenshotDir = path.join(options.outDir, 'screenshots');
  await fs.mkdir(screenshotDir, { recursive: true });

  const report = {
    started_at: startedAt,
    base_url: options.baseUrl,
    expected_sha: options.expectedSha || null,
    deploy_info: await fetchJson(`${options.baseUrl}/api/deploy-info`),
    campaign: await fetchJson(`${options.baseUrl}/api/one-time/campaign`),
    captures: [],
    non_read_requests: [],
    console_errors: [],
    passed: false,
  };

  const browser = await chromium.launch();
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.width <= 430,
        hasTouch: viewport.width <= 430,
      });
      const page = await context.newPage();
      page.on('console', (message) => {
        if (message.type() === 'error' && !/favicon|Failed to load resource.*api\/performance\/rum/i.test(message.text())) {
          report.console_errors.push({ viewport: viewport.id, text: message.text() });
        }
      });
      page.on('request', (request) => {
        const method = request.method().toUpperCase();
        const url = request.url();
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !/\/api\/performance\/rum\b/.test(url)) {
          report.non_read_requests.push({ viewport: viewport.id, method, url });
        }
      });
      for (const route of ROUTES) {
        const screenshotPath = path.join(screenshotDir, `${route.id}-${viewport.id}.png`);
        const capture = await inspectPage(page, options.baseUrl, route, screenshotPath);
        report.captures.push({
          ...capture,
          viewport: viewport.id,
          width: viewport.width,
          height: viewport.height,
          screenshot_path: path.relative(process.cwd(), capture.screenshot_path).replace(/\\/g, '/'),
        });
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const campaign = report.campaign.json?.campaign || {};
  const shaOk = !options.expectedSha || report.deploy_info.json?.commit_sha === options.expectedSha;
  const campaignOk = report.campaign.ok
    && campaign.free_access_until_date === '2026-09-11'
    && campaign.free_access_until_label === 'Friday, September 11, 2026 (Israel time)'
    && campaign.post_promo_price_label === '$67/month afterward'
    && campaign.time_zone === 'Asia/Jerusalem'
    && campaign.trial_days === 0
    && campaign.stripe_trial_object === false
    && campaign.hidden_trial === false
    && campaign.card_required_for_promotional_signup === false
    && campaign.external_write_performed === false;
  const capturesOk = report.captures.every((capture) => !capture.has_horizontal_overflow
    && capture.text_has_offer_policy
    && !capture.text_has_forbidden_public_copy
    && capture.actionless_visible_buttons.length === 0
    && (capture.route_id === 'landing' ? capture.has_landing_offer && capture.has_rosh_ticker : capture.has_signup_form && capture.has_family_school_picker));

  report.passed = Boolean(shaOk
    && campaignOk
    && capturesOk
    && report.non_read_requests.length === 0
    && report.console_errors.length === 0);

  const jsonPath = path.join(options.outDir, 'report.json');
  const mdPath = path.join(options.outDir, 'REPORT.md');
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const rows = report.captures.map((capture) => `| ${capture.route_id} | ${capture.viewport} | ${capture.has_horizontal_overflow ? 'FAIL' : 'PASS'} | ${capture.text_has_offer_policy ? 'PASS' : 'FAIL'} | ${capture.actionless_visible_buttons.length} | ${capture.screenshot_path} |`);
  await fs.writeFile(mdPath, [
    '# One Time Landing/Signup Responsive Smoke',
    '',
    `- Base URL: ${options.baseUrl}`,
    `- Started: ${startedAt}`,
    `- Expected SHA: ${options.expectedSha || 'not asserted'}`,
    `- Deployed SHA: ${report.deploy_info.json?.commit_sha || 'unknown'}`,
    `- Campaign API: ${campaignOk ? 'PASS' : 'FAIL'}`,
    `- Status: ${report.passed ? 'PASSED' : 'FAILED'}`,
    '',
    '| Route | Viewport | Overflow | Offer policy | Actionless buttons | Screenshot |',
    '| --- | --- | --- | --- | ---: | --- |',
    ...rows,
    '',
    'No signup POST, checkout, payment, access grant, email, WhatsApp, Zoom, Vimeo, DNS, CRM, or external-provider write was performed. The RUM endpoint is the only allowed non-GET browser request.',
    '',
  ].join('\n'));

  console.log(JSON.stringify({
    ok: report.passed,
    json_path: path.relative(process.cwd(), jsonPath).replace(/\\/g, '/'),
    md_path: path.relative(process.cwd(), mdPath).replace(/\\/g, '/'),
    captures: report.captures.length,
    deployed_sha: report.deploy_info.json?.commit_sha || null,
  }, null, 2));
  if (!report.passed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
