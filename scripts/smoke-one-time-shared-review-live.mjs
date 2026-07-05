#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const root = process.cwd();
const reportDir = path.join(root, 'ops', 'live-smokes');

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || process.env.BNA_APP_URL || 'https://bneineviimacademy.org',
    reportDir,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url' || arg === '--base') {
      options.baseUrl = argv[index + 1] || options.baseUrl;
      index += 1;
    } else if (arg === '--report-dir') {
      options.reportDir = argv[index + 1] ? path.resolve(argv[index + 1]) : options.reportDir;
      index += 1;
    } else if (arg === '--no-report') {
      options.reportDir = '';
    }
  }
  options.baseUrl = String(options.baseUrl || '').replace(/\/+$/, '');
  return options;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function writeReports(report, options) {
  if (!options.reportDir) return {};
  fs.mkdirSync(options.reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(options.reportDir, `${stamp}-one-time-shared-review-live-smoke.json`);
  const mdPath = path.join(options.reportDir, `${stamp}-one-time-shared-review-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.checks.filter((check) => !check.ok);
  const lines = [
    `# One Time Shared Review Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Checks',
    ...report.checks.map((check) => {
      const marker = check.skipped ? 'SKIP' : check.ok ? 'PASS' : 'FAIL';
      const details = check.error ? ` - ${check.error}` : check.skipped ? ` - ${check.details?.reason || 'skipped'}` : '';
      return `- ${marker} ${check.name} (${check.duration_ms}ms)${details}`;
    }),
    '',
    '## Routes',
    ...report.routes.map((route) => `- ${route.label}: ${route.path}`),
    '',
    'No payment, checkout, access grant, external send, Zoom meeting creation, Vimeo upload, DNS write, Railway topology change, or external CRM write was performed.',
    '',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const env = loadSmokeEnv({ root });
  const options = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const viewports = [
    { name: 'mobile390', width: 390, height: 844 },
    { name: 'tablet768', width: 768, height: 1024 },
    { name: 'desktop1440', width: 1440, height: 900 },
  ];
  const routes = [
    {
      label: 'landing',
      path: '/one-time/',
      expectedTitle: /Your Child Can Love Learning Mishnayos/i,
      requiredText: ['OneTimeOneTime Mishnah', 'Start 30 Days Free', 'See How It Works', 'Enrollment deadline will be posted before launch', 'Member Login'],
      requiredSelectors: ['img[src*="onetimelogo"]', '.hero-media-placeholder', '#interestForm'],
      forbidTitle: /BNA|Bnei Neviim/i,
      forbidText: ['Bnei Neviim Academy', 'Huda Weber', 'Menachem Mendel', 'Dratler Family'],
    },
    {
      label: 'provider',
      path: '/provider.html?review=one-time',
      expectedTitle: /OneTimeOneTime (?:Provider|Rabbi Workspace) Review/i,
      requiredText: ['Scoped provider workspace', 'Branded review workspace', 'Rabbi Eli Scheller'],
      requiredSelectors: ['img[src*="onetimelogo"]'],
      forbidTitle: /BNA|Bnei Neviim/i,
      forbidText: ['Bnei Neviim Academy', 'Dratler Family'],
    },
    {
      label: 'parent',
      path: '/parent.html?review=one-time',
      expectedTitle: /OneTimeOneTime Parent Review|BNA Parent Portal/i,
      requiredText: ['Parent Review Portal', 'TEST Student One Time', 'Payment / trial'],
      requiredSelectors: ['img[src*="onetimelogo"]'],
      forbidTitle: /BNA|Bnei Neviim/i,
      forbidText: ['Bnei Neviim Academy', 'Dratler Family'],
    },
    {
      label: 'student',
      path: '/student.html?review=one-time',
      expectedTitle: /OneTimeOneTime Student Review|BNA Student Goal Board/i,
      requiredText: ['ONE TIME STUDENT REVIEW', 'Student dashboard for live Mishnayos', 'PORTAL BOUNDARY'],
      requiredSelectors: ['img[src*="onetimelogo"]'],
      forbidTitle: /BNA|Bnei Neviim/i,
      forbidText: ['Bnei Neviim Academy', 'Student Goal Board', 'My Goal Board', 'Dratler Family'],
    },
    {
      label: 'classroom',
      path: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
      expectedTitle: /One Time Mishnah Classroom/i,
      requiredText: ['One Time Mishnah Classroom', 'TEST-only member-library data', 'Vimeo manual/sample reference'],
      requiredSelectors: ['img[src*="onetimelogo"]'],
      forbidTitle: /BNA|Bnei Neviim/i,
      forbidText: ['Bnei Neviim Academy', 'Dratler Family'],
    },
    {
      label: 'email',
      path: '/one-time-email-review.html',
      expectedTitle: /One Time Email Review/i,
      requiredText: ['One Time Email Review', 'Preview-only parent, student, class, payment, and support templates', 'No live email'],
      requiredSelectors: ['img[src*="onetimelogo"]'],
      forbidTitle: /BNA|Bnei Neviim/i,
      forbidText: ['Bnei Neviim Academy', 'Dratler Family'],
    },
    {
      label: 'operations',
      path: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
      expectedTitle: /One Time Mishnah Class - Operations/i,
      requiredText: ['One Time Mishnah Class', 'Program Overview', 'Provider Workspace'],
      requiredSelectors: ['.ops-app-shell'],
      forbidTitle: /BNA|Bnei Neviim/i,
      forbidText: ['Sign in to BNA Operations'],
      needsSession: true,
    },
  ];

  const report = {
    started_at: startedAt,
    app_url: options.baseUrl,
    routes: routes.map(({ label, path: routePath }) => ({ label, path: routePath })),
    viewports,
    auth_source: 'unknown',
    checks: [],
  };

  async function check(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.checks.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.checks.push({ name, ok: false, duration_ms: Date.now() - started, error: message });
      console.error(`FAIL ${name}: ${message}`);
      throw error;
    }
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const session = await loginOperations({ baseUrl: options.baseUrl, env, cwd: root });
    const sessionCookie = session.cookie;
    report.auth_source = session.source || 'missing';
    await check('public health endpoint', async () => {
      const response = await fetch(`${options.baseUrl}/api/health`, { headers: { accept: 'application/json' } });
      const data = await response.json();
      assert(response.status === 200, `/api/health returned ${response.status}`);
      assert(data.status === 'ok', 'health status is not ok');
      assert(data.database === 'connected', 'database is not connected');
      return { status: data.status, database: data.database };
    });

    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      if (sessionCookie) {
        await context.addCookies([{ ...sessionCookie, url: options.baseUrl, httpOnly: true, sameSite: 'Lax' }]);
      }
      try {
        for (const route of routes) {
          const checkName = `${route.label} ${viewport.name}`;
          if (route.needsSession && !sessionCookie) {
            const reason = session.reason || 'Operations authentication unavailable; authenticated Operations route not checked.';
            report.checks.push({ name: checkName, ok: true, skipped: true, duration_ms: 0, details: { reason } });
            console.log(`SKIP ${checkName}: ${reason}`);
            continue;
          }
          await check(checkName, async () => {
            const page = await context.newPage();
            const consoleErrors = [];
            const pageErrors = [];
            page.on('console', (message) => {
              if (message.type() === 'error') consoleErrors.push(message.text());
            });
            page.on('pageerror', (error) => pageErrors.push(error.message));
            const response = await page.goto(`${options.baseUrl}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
            assert(response && response.status() >= 200 && response.status() < 400, `${route.path} returned ${response?.status()}`);
            await page.waitForTimeout(route.needsSession ? 3500 : 800);
            const title = await page.title();
            const text = (await page.locator('body').innerText({ timeout: 15000 })).replace(/\s+/g, ' ');
            const textLower = text.toLowerCase();
            assert(route.expectedTitle.test(title), `${route.label} title mismatch: ${title}`);
            if (route.forbidTitle) assert(!route.forbidTitle.test(title), `${route.label} title leaked forbidden brand: ${title}`);
            for (const item of route.requiredText) assert(textLower.includes(String(item).toLowerCase()), `${route.label} missing text: ${item}`);
            for (const item of route.forbidText || []) assert(!textLower.includes(String(item).toLowerCase()), `${route.label} leaked forbidden text: ${item}`);
            for (const selector of route.requiredSelectors) {
              assert(await page.locator(selector).count() > 0, `${route.label} missing selector: ${selector}`);
            }
            const imageFailures = await page.locator('img').evaluateAll((nodes) => nodes
              .filter((img) => img.complete && img.naturalWidth === 0)
              .map((img) => img.getAttribute('src') || 'unknown'));
            assert(imageFailures.length === 0, `${route.label} has broken images: ${imageFailures.join(', ')}`);
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
            assert(overflow <= 2, `${route.label} horizontal overflow ${overflow}px`);
            assert(consoleErrors.length === 0, `${route.label} console errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
            assert(pageErrors.length === 0, `${route.label} page errors: ${pageErrors.slice(0, 3).join(' | ')}`);
            const imageCount = await page.locator('img').count();
            await page.close();
            return {
              title,
              bytes: text.length,
              image_count: imageCount,
            };
          });
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    report.report_files = writeReports(report, options);
    if (report.report_files.markdown) console.log(`Report: ${report.report_files.markdown}`);
  }
}

main().catch(() => {
  process.exitCode = 1;
});
