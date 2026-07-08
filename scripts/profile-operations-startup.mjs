#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'ops', 'performance-audits', '2026-07-08-app-backend-helper-performance');
const DEFAULT_BASE_URL = 'https://join.onetimeonetime.com';
const DEFAULT_PATH = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview';

function argValue(name, fallback = '') {
  const raw = process.argv.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));
  if (!raw) return fallback;
  if (raw === `--${name}`) return 'true';
  return raw.slice(name.length + 3);
}

const BASE_URL = (process.env.PERF_AUDIT_BASE_URL || argValue('base', DEFAULT_BASE_URL)).replace(/\/+$/, '');
const TARGET_PATH = argValue('path', DEFAULT_PATH);
const OUT_SUFFIX = argValue('out-suffix', BASE_URL.includes('127.0.0.1') || BASE_URL.includes('localhost') ? 'local' : 'live');
const SETTLE_MS = Number(argValue('settle-ms', process.env.PERF_PROFILE_SETTLE_MS || '6000'));
const HEADLESS = argValue('headed', 'false') !== 'true';

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

function loadEnv() {
  loadEnvFile(path.join(ROOT, '.env.local'));
  loadEnvFile(process.env.BNA_LOCAL_ENV_FILE);
  loadEnvFile(process.env.BNA_ENV_FILE);
  loadEnvFile(path.join(ROOT, '.env'));
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function cookiePair(setCookie = '') {
  return String(setCookie || '').split(';')[0] || '';
}

function resolveOpsCredentials() {
  const base = BASE_URL.toLowerCase();
  const preferOneTime = base.includes('onetime') || base.includes('one-time') || base.includes('localhost') || base.includes('127.0.0.1');
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

async function loginOperations(credentials) {
  if (!credentials.username || !credentials.password) {
    return { ok: false, blocker: 'OPS_USERNAME/OPS_PASSWORD not available', cookie: '' };
  }
  const started = performance.now();
  const response = await fetch(`${BASE_URL}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(credentials.username, credentials.password),
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });
  const text = await response.text();
  const cookie = cookiePair(response.headers.get('set-cookie'));
  return {
    ok: response.ok && cookie.includes('='),
    status: response.status,
    duration_ms: Math.round(performance.now() - started),
    response_bytes: Buffer.byteLength(text || '', 'utf8'),
    cookie,
    blocker: response.ok ? '' : `operations login returned ${response.status}`,
  };
}

function normalizePath(url) {
  try {
    const parsed = new URL(url, BASE_URL);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return String(url || '');
  }
}

function apiFamily(url) {
  const pathname = normalizePath(url).split('?')[0];
  if (!pathname.startsWith('/api/')) return pathname;
  return pathname
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/[a-f0-9-]{24,}(?=\/|$)/gi, '/:id');
}

function percentile(values, p) {
  const nums = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!nums.length) return null;
  const index = Math.min(nums.length - 1, Math.max(0, Math.ceil((p / 100) * nums.length) - 1));
  return Math.round(nums[index]);
}

function fetchSummary(fetches, overviewVisibleMs) {
  const durations = fetches.map((entry) => entry.duration_ms).filter(Number.isFinite);
  const afterOverview = fetches.filter((entry) => Number.isFinite(overviewVisibleMs) && Number(entry.start_ms) >= overviewVisibleMs);
  const beforeOverview = fetches.filter((entry) => !Number.isFinite(overviewVisibleMs) || Number(entry.start_ms) < overviewVisibleMs);
  const byFamily = new Map();
  for (const entry of fetches) {
    const key = apiFamily(entry.url);
    const item = byFamily.get(key) || { path: key, count: 0, total_ms: 0, max_ms: 0, statuses: new Set() };
    item.count += 1;
    item.total_ms += Number(entry.duration_ms || 0);
    item.max_ms = Math.max(item.max_ms, Number(entry.duration_ms || 0));
    if (entry.status) item.statuses.add(entry.status);
    byFamily.set(key, item);
  }
  return {
    count: fetches.length,
    before_overview_count: beforeOverview.length,
    after_overview_count: afterOverview.length,
    median_ms: percentile(durations, 50),
    p95_ms: percentile(durations, 95),
    max_ms: percentile(durations, 100),
    top_slowest: [...fetches]
      .sort((a, b) => Number(b.duration_ms || 0) - Number(a.duration_ms || 0))
      .slice(0, 20)
      .map((entry) => ({
        method: entry.method,
        path: normalizePath(entry.url),
        start_ms: entry.start_ms,
        duration_ms: entry.duration_ms,
        status: entry.status,
        after_overview: Number.isFinite(overviewVisibleMs) ? Number(entry.start_ms) >= overviewVisibleMs : null,
      })),
    by_family: [...byFamily.values()]
      .map((item) => ({
        ...item,
        statuses: [...item.statuses].sort(),
        avg_ms: item.count ? Math.round(item.total_ms / item.count) : 0,
      }))
      .sort((a, b) => b.total_ms - a.total_ms)
      .slice(0, 25),
  };
}

function resourceSummary(resources) {
  const scripts = resources.filter((resource) => resource.initiatorType === 'script');
  const styles = resources.filter((resource) => resource.initiatorType === 'link' || resource.name.includes('/css/'));
  return {
    count: resources.length,
    transfer_size: Math.round(resources.reduce((sum, resource) => sum + Number(resource.transferSize || 0), 0)),
    encoded_body_size: Math.round(resources.reduce((sum, resource) => sum + Number(resource.encodedBodySize || 0), 0)),
    scripts: scripts.map((resource) => ({
      path: normalizePath(resource.name).split('?')[0],
      transfer_size: Math.round(resource.transferSize || 0),
      encoded_body_size: Math.round(resource.encodedBodySize || 0),
      duration_ms: Math.round(resource.duration || 0),
    })),
    styles: styles.map((resource) => ({
      path: normalizePath(resource.name).split('?')[0],
      transfer_size: Math.round(resource.transferSize || 0),
      encoded_body_size: Math.round(resource.encodedBodySize || 0),
      duration_ms: Math.round(resource.duration || 0),
    })),
  };
}

function table(rows, columns) {
  if (!rows.length) return '_None captured._';
  const header = `| ${columns.map((column) => column.label).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(column.value(row) ?? '').replace(/\|/g, '\\|')).join(' | ')} |`);
  return [header, divider, ...body].join('\n');
}

function markdownReport(report) {
  const overviewMs = report.marks.overview_visible_ms ?? null;
  return `# Operations Startup Residual Slowness Profile

- Base URL: ${report.base_url}
- Path: ${report.path}
- Output suffix: ${report.out_suffix}
- Login: ${report.login.ok ? `ok in ${report.login.duration_ms}ms via ${report.credentials_source}` : report.login.blocker}
- Captured at: ${report.captured_at}

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | ${report.marks.dom_content_loaded_ms ?? ''} |
| Operations shell visible | ${report.marks.shell_visible_ms ?? ''} |
| One Time overview visible | ${overviewMs ?? ''} |
| Settled capture window | ${report.marks.capture_complete_ms ?? ''} |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | ${report.fetch_summary.count} |
| Fetches before overview visible | ${report.fetch_summary.before_overview_count} |
| Fetches after overview visible | ${report.fetch_summary.after_overview_count} |
| Median fetch duration | ${report.fetch_summary.median_ms ?? ''} |
| P95 fetch duration | ${report.fetch_summary.p95_ms ?? ''} |
| Max fetch duration | ${report.fetch_summary.max_ms ?? ''} |

## Slowest Fetches

${table(report.fetch_summary.top_slowest.slice(0, 12), [
    { label: 'Path', value: (row) => row.path },
    { label: 'Start ms', value: (row) => row.start_ms },
    { label: 'Duration ms', value: (row) => row.duration_ms },
    { label: 'Status', value: (row) => row.status },
    { label: 'After overview', value: (row) => row.after_overview },
  ])}

## Fetch Families

${table(report.fetch_summary.by_family.slice(0, 12), [
    { label: 'Path', value: (row) => row.path },
    { label: 'Count', value: (row) => row.count },
    { label: 'Total ms', value: (row) => row.total_ms },
    { label: 'Max ms', value: (row) => row.max_ms },
    { label: 'Statuses', value: (row) => row.statuses.join(',') },
  ])}

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | ${report.dom.dom_nodes} |
| Buttons | ${report.dom.button_count} |
| Links | ${report.dom.link_count} |
| Body text length | ${report.dom.body_text_length} |
| Long tasks | ${report.long_tasks.count} |
| Long task total ms | ${report.long_tasks.total_ms} |
| Long task max ms | ${report.long_tasks.max_ms} |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | ${report.resources.count} |
| Transfer size | ${report.resources.transfer_size} |
| Encoded body size | ${report.resources.encoded_body_size} |

${table(report.resources.scripts, [
    { label: 'Script', value: (row) => row.path },
    { label: 'Transfer', value: (row) => row.transfer_size },
    { label: 'Encoded', value: (row) => row.encoded_body_size },
    { label: 'Duration ms', value: (row) => row.duration_ms },
  ])}

## Console And Failures

- Console errors: ${report.console_errors.length}
- Failed requests: ${report.failed_requests.length}
`;
}

async function waitForSelectorMs(page, selector, startedAt, timeout = 30000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return Math.round(performance.now() - startedAt);
  } catch {
    return null;
  }
}

async function main() {
  loadEnv();
  ensureDir(OUT_DIR);
  const credentials = resolveOpsCredentials();
  const login = await loginOperations(credentials);
  if (!login.ok) {
    const blocker = {
      base_url: BASE_URL,
      path: TARGET_PATH,
      out_suffix: OUT_SUFFIX,
      captured_at: new Date().toISOString(),
      credentials_source: credentials.source || '',
      login,
    };
    const jsonPath = path.join(OUT_DIR, `residual-slowness-profile-${OUT_SUFFIX}.json`);
    fs.writeFileSync(jsonPath, `${JSON.stringify(blocker, null, 2)}\n`);
    console.log(JSON.stringify(blocker, null, 2));
    process.exitCode = 1;
    return;
  }

  const browser = await chromium.launch({ headless: HEADLESS });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    extraHTTPHeaders: { cookie: login.cookie },
  });

  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 500));
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message || String(error));
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({
      path: normalizePath(request.url()),
      failure: request.failure()?.errorText || 'request failed',
    });
  });

  await page.addInitScript(() => {
    window.__opsStartupProfile = {
      fetches: [],
      longTasks: [],
      marks: [],
    };
    window.__opsStartupMark = (name, detail = {}) => {
      window.__opsStartupProfile.marks.push({
        name,
        time_ms: Math.round(performance.now()),
        detail,
      });
    };
    document.addEventListener('DOMContentLoaded', () => window.__opsStartupMark('domcontentloaded'));
    window.addEventListener('load', () => window.__opsStartupMark('load'));
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__opsStartupProfile.longTasks.push({
            name: entry.name,
            start_ms: Math.round(entry.startTime),
            duration_ms: Math.round(entry.duration),
          });
        }
      }).observe({ entryTypes: ['longtask'] });
    } catch {}
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const started = performance.now();
      const url = typeof input === 'string' ? input : input?.url || '';
      const method = init?.method || input?.method || 'GET';
      const entry = {
        url,
        method,
        start_ms: Math.round(started),
        end_ms: null,
        duration_ms: null,
        status: null,
        ok: null,
      };
      window.__opsStartupProfile.fetches.push(entry);
      try {
        const response = await originalFetch(input, init);
        entry.status = response.status;
        entry.ok = response.ok;
        entry.end_ms = Math.round(performance.now());
        entry.duration_ms = Math.round(performance.now() - started);
        return response;
      } catch (error) {
        entry.error = error?.message || String(error);
        entry.end_ms = Math.round(performance.now());
        entry.duration_ms = Math.round(performance.now() - started);
        throw error;
      }
    };
  });

  const started = performance.now();
  await page.goto(`${BASE_URL}${TARGET_PATH}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const domContentLoadedMs = Math.round(performance.now() - started);
  const shellVisibleMs = await waitForSelectorMs(page, '.ops-app-shell', started);
  const overviewVisibleMs = await waitForSelectorMs(page, '[data-one-time-rabbi-module="overview"]', started);
  if (overviewVisibleMs) {
    await page.evaluate(() => window.__opsStartupMark?.('overview_visible'));
  }
  await page.waitForTimeout(SETTLE_MS);
  await page.evaluate(() => window.__opsStartupMark?.('capture_complete'));
  const captureCompleteMs = Math.round(performance.now() - started);

  const pageMetrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource').map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
      duration: entry.duration || 0,
    }));
    return {
      profile: window.__opsStartupProfile || { fetches: [], longTasks: [], marks: [] },
      navigation: nav
        ? {
            dom_content_loaded_ms: Math.round(nav.domContentLoadedEventEnd),
            load_event_ms: Math.round(nav.loadEventEnd),
            duration_ms: Math.round(nav.duration),
            transfer_size: Math.round(nav.transferSize || 0),
            encoded_body_size: Math.round(nav.encodedBodySize || 0),
          }
        : null,
      resources,
      dom: {
        dom_nodes: document.querySelectorAll('*').length,
        button_count: document.querySelectorAll('button').length,
        link_count: document.querySelectorAll('a').length,
        script_count: document.scripts.length,
        stylesheet_count: document.styleSheets.length,
        body_text_length: (document.body?.innerText || '').length,
        body_text_preview: (document.body?.innerText || '').replace(/\s+/g, ' ').slice(0, 700),
        error_banners: [...document.querySelectorAll('.error-banner')].map((node) => (node.textContent || '').replace(/\s+/g, ' ').slice(0, 500)),
        one_time_route: document.querySelector('[data-one-time-program-route]')?.getAttribute('data-one-time-program-route') || '',
        title: document.title,
      },
    };
  });

  await browser.close();

  const marks = {
    dom_content_loaded_ms: domContentLoadedMs,
    shell_visible_ms: shellVisibleMs,
    overview_visible_ms: overviewVisibleMs,
    capture_complete_ms: captureCompleteMs,
    page_marks: pageMetrics.profile.marks || [],
  };
  const longTasks = pageMetrics.profile.longTasks || [];
  const report = {
    base_url: BASE_URL,
    path: TARGET_PATH,
    out_suffix: OUT_SUFFIX,
    captured_at: new Date().toISOString(),
    credentials_source: credentials.source,
    login: { ...login, cookie: login.cookie ? 'present' : '' },
    marks,
    navigation: pageMetrics.navigation,
    fetches: pageMetrics.profile.fetches || [],
    fetch_summary: fetchSummary(pageMetrics.profile.fetches || [], overviewVisibleMs),
    long_tasks: {
      count: longTasks.length,
      total_ms: Math.round(longTasks.reduce((sum, entry) => sum + Number(entry.duration_ms || 0), 0)),
      max_ms: Math.round(Math.max(0, ...longTasks.map((entry) => Number(entry.duration_ms || 0)))),
      top: [...longTasks].sort((a, b) => Number(b.duration_ms || 0) - Number(a.duration_ms || 0)).slice(0, 10),
    },
    resources: resourceSummary(pageMetrics.resources || []),
    dom: pageMetrics.dom,
    console_errors: consoleErrors,
    failed_requests: failedRequests,
  };

  const jsonPath = path.join(OUT_DIR, `residual-slowness-profile-${OUT_SUFFIX}.json`);
  const mdPath = path.join(OUT_DIR, `residual-slowness-profile-${OUT_SUFFIX}.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, markdownReport(report));
  console.log(JSON.stringify({
    json: path.relative(ROOT, jsonPath),
    markdown: path.relative(ROOT, mdPath),
    overview_visible_ms: overviewVisibleMs,
    fetch_count: report.fetch_summary.count,
    fetches_after_overview: report.fetch_summary.after_overview_count,
    slowest_fetch_ms: report.fetch_summary.max_ms,
    long_task_count: report.long_tasks.count,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
