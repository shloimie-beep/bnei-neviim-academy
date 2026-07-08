#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'ops', 'performance-audits', '2026-07-08-app-backend-helper-performance');
const DEFAULT_BASE_URL = 'https://join.onetimeonetime.com';
const BASE_URL = (process.env.PERF_AUDIT_BASE_URL || process.argv.find((arg) => arg.startsWith('--base='))?.slice(7) || DEFAULT_BASE_URL).replace(/\/+$/, '');
const REPEATS = Number(process.argv.find((arg) => arg.startsWith('--repeats='))?.slice(10) || process.env.PERF_AUDIT_REPEATS || 2);
const INCLUDE_COMPLEX_HELPER = !process.argv.includes('--skip-complex-helper');

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

function safePathName(value = '') {
  return String(value || 'route').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'route';
}

function percentile(values, p) {
  const nums = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!nums.length) return null;
  const index = Math.min(nums.length - 1, Math.max(0, Math.ceil((p / 100) * nums.length) - 1));
  return Math.round(nums[index]);
}

function summarizeDurations(samples) {
  const durations = samples.map((sample) => sample.duration_ms).filter(Number.isFinite);
  return {
    count: durations.length,
    min_ms: percentile(durations, 0),
    median_ms: percentile(durations, 50),
    p95_ms: percentile(durations, 95),
    max_ms: percentile(durations, 100),
  };
}

async function timedFetch(pathOrUrl, options = {}, repeats = REPEATS) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
  const samples = [];
  for (let index = 0; index < repeats; index += 1) {
    const started = performance.now();
    const response = await fetch(url, options);
    const text = await response.text();
    const duration = Math.round(performance.now() - started);
    let jsonKeys = [];
    try {
      const parsed = text ? JSON.parse(text) : {};
      jsonKeys = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? Object.keys(parsed).slice(0, 16) : [];
    } catch {}
    samples.push({
      status: response.status,
      ok: response.ok,
      duration_ms: duration,
      bytes: Buffer.byteLength(text || '', 'utf8'),
      cache_control: response.headers.get('cache-control') || '',
      content_type: response.headers.get('content-type') || '',
      json_keys: jsonKeys,
    });
  }
  return {
    path: pathOrUrl,
    method: options.method || 'GET',
    samples,
    summary: summarizeDurations(samples),
  };
}

function resolveOpsCredentials() {
  const base = BASE_URL.toLowerCase();
  const preferOneTime = base.includes('onetime') || base.includes('one-time') || base.includes('localhost');
  const candidates = preferOneTime
    ? [
        ['ONE_TIME_OPS_USERNAME', 'ONE_TIME_OPS_PASSWORD'],
        ['OPS_USERNAME', 'OPS_PASSWORD'],
      ]
    : [
        ['OPS_USERNAME', 'OPS_PASSWORD'],
        ['ONE_TIME_OPS_USERNAME', 'ONE_TIME_OPS_PASSWORD'],
      ];
  for (const [usernameKey, passwordKey] of candidates) {
    const username = process.env[usernameKey] || '';
    const password = process.env[passwordKey] || '';
    if (username && password) {
      return {
        username,
        password,
        source: usernameKey.replace(/_USERNAME$/, ''),
      };
    }
  }
  return { username: '', password: '', source: '' };
}

async function loginOperations(credentials, authHeader) {
  if (!authHeader) return { ok: false, blocker: 'OPS_USERNAME/OPS_PASSWORD not available' };
  const started = performance.now();
  const response = await fetch(`${BASE_URL}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: authHeader,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      username: credentials.username || '',
      password: credentials.password || '',
    }),
  });
  const text = await response.text();
  const cookie = cookiePair(response.headers.get('set-cookie'));
  return {
    ok: response.ok && cookie.includes('='),
    status: response.status,
    duration_ms: Math.round(performance.now() - started),
    cookie,
    response_bytes: Buffer.byteLength(text || '', 'utf8'),
    blocker: response.ok ? '' : `operations login returned ${response.status}`,
  };
}

function helperPageContext(view = 'tasks', section = 'tasks') {
  return {
    route: `/operations?view=${view}&section=${section}&workspace=bna`,
    page: 'operations',
    view,
    workspace: {
      workspaceKey: 'bna',
      projectKey: 'bna',
      displayName: 'Bnei Neviim Academy',
      workspaceType: 'school',
      roleLabel: 'BNA Admin',
    },
    actor: {
      role: 'admin',
      allowedViews: ['dashboard', 'tasks', 'content', 'calendar', 'admin'],
    },
    visibleSection: section,
    selectedRecord: null,
    availableClientActions: ['open_operations_view', 'create_support_ticket', 'update_task', 'mark_task_done'],
  };
}

async function timeHelperPlan(authHeader, name, message, pageContext = helperPageContext()) {
  if (!authHeader) {
    return { name, skipped: true, blocker: 'OPS_USERNAME/OPS_PASSWORD not available' };
  }
  const body = {
    message,
    workspace_key: 'bna',
    project_key: 'bna',
    pageContext,
    auto_execute_safe: false,
    client_request_id: `performance_audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  const started = performance.now();
  const response = await fetch(`${BASE_URL}/api/bna/helper/plan`, {
    method: 'POST',
    headers: {
      authorization: authHeader,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {}
  return {
    name,
    status: response.status,
    ok: response.ok,
    duration_ms: Math.round(performance.now() - started),
    planner: data.planner || null,
    helper_status: data.status || null,
    action_count: Array.isArray(data.actions) ? data.actions.length : 0,
    first_tool: Array.isArray(data.actions) && data.actions[0] ? data.actions[0].tool : null,
    response_bytes: Buffer.byteLength(text || '', 'utf8'),
  };
}

async function captureBrowserRoute(browser, route) {
  const page = await browser.newPage({
    viewport: { width: route.width, height: route.height },
    extraHTTPHeaders: route.cookie ? { cookie: route.cookie } : undefined,
  });
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 300));
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url().replace(BASE_URL, ''),
      failure: request.failure()?.errorText || 'request failed',
    });
  });

  const started = performance.now();
  await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  let selector_found = false;
  try {
    await page.waitForSelector(route.selector || 'body', { timeout: route.selectorTimeout || 10000 });
    selector_found = true;
  } catch {}
  await page.waitForTimeout(route.settleMs || 1200);
  const navigationMs = Math.round(performance.now() - started);

  let clickMs = null;
  let clickLabel = '';
  if (route.clickEval) {
    const result = await page.evaluate(route.clickEval).catch((error) => ({ error: error.message || String(error) }));
    clickMs = Number.isFinite(result?.duration_ms) ? Math.round(result.duration_ms) : null;
    clickLabel = result?.label || '';
  }

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    return {
      title: document.title,
      ready_state: document.readyState,
      dom_nodes: document.querySelectorAll('*').length,
      script_count: document.scripts.length,
      stylesheet_count: document.styleSheets.length,
      button_count: document.querySelectorAll('button').length,
      link_count: document.querySelectorAll('a').length,
      iframe_count: document.querySelectorAll('iframe').length,
      body_text_length: (document.body?.innerText || '').length,
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      transfer_size: Math.round(resources.reduce((sum, item) => sum + (item.transferSize || 0), 0)),
      resource_count: resources.length,
      dom_content_loaded_ms: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load_event_ms: nav ? Math.round(nav.loadEventEnd) : null,
    };
  });

  if (route.redactScreenshot) {
    await page.addStyleTag({
      content: `
        body * { color: transparent !important; text-shadow: none !important; }
        body::before {
          content: "REDACTED PERFORMANCE SCREENSHOT";
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 2147483647;
          color: #fff !important;
          background: #111;
          border: 1px solid #ffd200;
          border-radius: 6px;
          padding: 8px 10px;
          font: 700 13px system-ui, sans-serif;
        }
      `,
    });
  }
  const screenshotPath = path.join(OUT_DIR, `${safePathName(route.id)}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled' });
  await page.close();

  return {
    id: route.id,
    path: route.path,
    viewport: `${route.width}x${route.height}`,
    selector_found,
    navigation_ms: navigationMs,
    click_ms: clickMs,
    click_label: clickLabel,
    console_error_count: consoleErrors.length,
    console_errors: consoleErrors.slice(0, 5),
    failed_request_count: failedRequests.length,
    failed_requests: failedRequests.slice(0, 8),
    screenshot: path.relative(ROOT, screenshotPath).replace(/\\/g, '/'),
    ...metrics,
  };
}

function firstFixRecommendation(report) {
  const slowApis = report.api_timings
    .filter((entry) => Number(entry.summary?.median_ms || 0) >= 900)
    .sort((a, b) => Number(b.summary?.median_ms || 0) - Number(a.summary?.median_ms || 0));
  const slowHelper = report.helper_timings
    .filter((entry) => Number(entry.duration_ms || 0) >= 2500)
    .sort((a, b) => Number(b.duration_ms || 0) - Number(a.duration_ms || 0));
  const operations = report.browser_timings.find((entry) => entry.id === 'operations-desktop');
  if (slowHelper.length) {
    return {
      target: 'helper_planner_fast_path',
      reason: `${slowHelper[0].name} took ${slowHelper[0].duration_ms}ms; add deterministic fast path or better waiting-state before touching model quality.`,
    };
  }
  if (slowApis.length) {
    return {
      target: 'api_latency',
      reason: `${slowApis[0].path} median ${slowApis[0].summary.median_ms}ms is the slowest measured API path.`,
    };
  }
  if (operations && Number(operations.navigation_ms || 0) >= 3000) {
    return {
      target: 'operations_initial_load',
      reason: `Operations initial browser load took ${operations.navigation_ms}ms; inspect large inline Operations shell and first render work.`,
    };
  }
  return {
    target: 'helper_performance_observability',
    reason: 'No single extreme route dominated this run; add helper/backend latency reporting and continue with targeted Operations click profiling.',
  };
}

function writeReport(report) {
  ensureDir(OUT_DIR);
  report.first_fix_recommendation = firstFixRecommendation(report);
  report.passed = true;
  const jsonPath = path.join(OUT_DIR, 'report.json');
  const mdPath = path.join(OUT_DIR, 'report.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    '# App Backend And Helper Performance Audit',
    '',
    `Generated: ${report.generated_at}`,
    `Base URL: ${report.base_url}`,
    `External writes performed: ${report.external_write_performed}`,
    '',
    '## API Timings',
    '',
    '| Path | Method | Status | Median | P95 | Bytes | Cache-Control |',
    '|---|---|---:|---:|---:|---:|---|',
    ...report.api_timings.map((entry) => {
      const sample = entry.samples[0] || {};
      return `| ${entry.path} | ${entry.method} | ${sample.status ?? ''} | ${entry.summary.median_ms ?? ''} | ${entry.summary.p95_ms ?? ''} | ${sample.bytes ?? ''} | ${sample.cache_control || ''} |`;
    }),
    '',
    '## Helper Timings',
    '',
    '| Name | Status | Duration | Planner | Helper Status | First Tool | Actions |',
    '|---|---:|---:|---|---|---|---:|',
    ...report.helper_timings.map((entry) => `| ${entry.name} | ${entry.status ?? ''} | ${entry.duration_ms ?? ''} | ${entry.planner || ''} | ${entry.helper_status || ''} | ${entry.first_tool || ''} | ${entry.action_count ?? ''} |`),
    '',
    '## Browser Timings',
    '',
    '| Route | Viewport | Navigation | Click | DOM Nodes | Resources | Iframes | Overflow | Console Errors | Failed Requests | Screenshot |',
    '|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|',
    ...report.browser_timings.map((entry) => `| ${entry.path} | ${entry.viewport} | ${entry.navigation_ms} | ${entry.click_ms ?? ''} | ${entry.dom_nodes} | ${entry.resource_count} | ${entry.iframe_count} | ${entry.horizontal_overflow} | ${entry.console_error_count} | ${entry.failed_request_count} | ${entry.screenshot} |`),
    '',
    '## First Fix Recommendation',
    '',
    `- Target: ${report.first_fix_recommendation.target}`,
    `- Reason: ${report.first_fix_recommendation.reason}`,
    '',
    '## Guardrails',
    '',
    '- No helper actions were executed.',
    '- No external sends, payments, access grants, WAPI/WhatsApp sends, Drive/Vimeo uploads, or production data mutations were performed.',
    '- Auth credentials and session cookies are not written to this report.',
    '- Operations screenshots are redacted before being saved.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(ROOT, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(ROOT, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  loadEnvFile(process.env.BNA_LOCAL_ENV_FILE);
  loadEnvFile(process.env.BNA_ENV_FILE);
  loadEnvFile(path.join(ROOT, '.env.local'));
  ensureDir(OUT_DIR);

  const credentials = resolveOpsCredentials();
  const authHeader = credentials.username && credentials.password
    ? basicAuthHeader(credentials.username, credentials.password)
    : '';
  const login = await loginOperations(credentials, authHeader);

  const apiTimings = [];
  apiTimings.push(await timedFetch('/api/health'));
  apiTimings.push(await timedFetch('/api/one-time/instance-config'));
  apiTimings.push(await timedFetch('/operations', { headers: authHeader ? { authorization: authHeader, accept: 'text/html' } : { accept: 'text/html' } }));
  apiTimings.push(await timedFetch('/api/member-library'));
  apiTimings.push(await timedFetch('/api/one-time-classroom?review=one-time'));
  apiTimings.push(await timedFetch('/api/provider-portal/session'));
  if (authHeader) {
    apiTimings.push(await timedFetch('/api/bna/helper/context?workspace_key=bna&project_key=bna', { headers: { authorization: authHeader, accept: 'application/json' } }));
  }

  const helperTimings = [];
  helperTimings.push(await timeHelperPlan(authHeader, 'deterministic navigation', 'open decisions'));
  helperTimings.push(await timeHelperPlan(authHeader, 'deterministic performance report', 'the app and backend are slow and laggy and take forever to open pages'));
  if (INCLUDE_COMPLEX_HELPER) {
    helperTimings.push(await timeHelperPlan(
      authHeader,
      'complex planning fallback',
      'Think through why the OneTime app and backend feel slow, preserve all safety gates, and propose the first measurement. Do not execute any external action.',
      helperPageContext('dashboard', 'overview')
    ));
  }

  const browser = await chromium.launch({ headless: true });
  const browserTimings = [];
  try {
    const operationsCookie = login.ok ? login.cookie : '';
    const routes = [
      {
        id: 'operations-desktop',
        path: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
        width: 1440,
        height: 1000,
        selector: '.ops-app-shell',
        cookie: operationsCookie,
        redactScreenshot: true,
        clickEval: async () => {
          const label = 'switchView communications';
          const start = performance.now();
          if (typeof window.switchView === 'function') {
            window.switchView('communications');
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            return { label, duration_ms: performance.now() - start };
          }
          return { label, duration_ms: null, error: 'switchView unavailable' };
        },
      },
      {
        id: 'provider-desktop',
        path: '/provider.html?admin_provider=one-time&section=communications',
        width: 1440,
        height: 960,
        selector: 'body',
        redactScreenshot: true,
      },
      {
        id: 'member-library-mobile',
        path: '/member-library',
        width: 390,
        height: 844,
        selector: 'body',
        clickEval: async () => {
          const button = Array.from(document.querySelectorAll('button')).find((item) => /fallback access code/i.test(item.textContent || ''));
          const start = performance.now();
          button?.click();
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return { label: 'fallback drawer toggle', duration_ms: performance.now() - start };
        },
      },
      {
        id: 'classroom-mobile',
        path: '/one-time-classroom',
        width: 390,
        height: 844,
        selector: 'body',
        clickEval: async () => {
          const button = Array.from(document.querySelectorAll('button')).find((item) => /fallback access code/i.test(item.textContent || ''));
          const start = performance.now();
          button?.click();
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          return { label: 'fallback drawer toggle', duration_ms: performance.now() - start };
        },
      },
    ];
    for (const route of routes) {
      browserTimings.push(await captureBrowserRoute(browser, route));
    }
  } finally {
    await browser.close();
  }

  const report = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    repeats: REPEATS,
    external_write_performed: false,
    auth_available: Boolean(authHeader),
    auth_source: credentials.source || null,
    operations_login: {
      ok: login.ok,
      status: login.status || null,
      duration_ms: login.duration_ms || null,
      blocker: login.blocker || '',
      cookie_recorded: false,
    },
    api_timings: apiTimings,
    helper_timings: helperTimings,
    browser_timings: browserTimings,
  };
  const paths = writeReport(report);
  console.log(JSON.stringify({ ok: true, ...paths, first_fix_recommendation: report.first_fix_recommendation }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
