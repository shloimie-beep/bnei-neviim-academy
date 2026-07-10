#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const DEFAULT_BASE_URL = 'https://join.onetimeonetime.com';
const DEFAULT_OUT_DIR = path.join(ROOT, 'ops', 'performance-audits', '2026-07-09-onetime-live-lag-audit');

const ROUTES = [
  { id: 'one-time', route: '/one-time', label: 'One Time public landing' },
  { id: 'one-time-mishnayos', route: '/one-time/mishnayos', label: 'One Time Mishnayos alias' },
  { id: 'rabbi-member', route: '/rabbi-member', label: 'Member home' },
  { id: 'member-library', route: '/member-library', label: 'Member library' },
  { id: 'one-time-classroom', route: '/one-time-classroom', label: 'Classroom entry' },
  {
    id: 'one-time-classroom-review',
    route: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
    label: 'Classroom review fixture',
  },
  { id: 'provider-review', route: '/provider.html?review=one-time', label: 'Provider review fixture' },
  { id: 'student-review', route: '/student.html?review=one-time', label: 'Student review fixture' },
  { id: 'parent-review', route: '/parent.html?review=one-time', label: 'Parent review fixture' },
];

const VIEWPORTS = [
  { id: 'desktop-1440', width: 1440, height: 1000, isMobile: false },
  { id: 'mobile-390', width: 390, height: 844, isMobile: true },
];

function argValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  if (found) return found.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${String(text || '').replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function ms(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(number) : 0;
}

function short(value, max = 160) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function percentile(values, p) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!numbers.length) return 0;
  const index = Math.min(numbers.length - 1, Math.max(0, Math.ceil((p / 100) * numbers.length) - 1));
  return ms(numbers[index]);
}

function scoreResult(metric) {
  const blockers = [];
  if (metric.status >= 400 || metric.main_response_failed) blockers.push('main_response_failed');
  if (metric.goto_ms > 4500) blockers.push('slow_initial_navigation');
  if (metric.network_idle_ms > 6500) blockers.push('slow_network_idle');
  if (metric.dom_content_loaded_ms > 2500) blockers.push('slow_dom_content_loaded');
  if (metric.first_contentful_paint_ms > 2500) blockers.push('slow_first_contentful_paint');
  if (metric.long_task_total_ms > 250) blockers.push('main_thread_long_tasks');
  if (metric.total_request_count > 90) blockers.push('too_many_requests');
  if (metric.api_slow_count > 0) blockers.push('slow_api_requests');
  if (metric.failed_request_count > 0) blockers.push('failed_requests');
  if (metric.console_error_count > 0) blockers.push('console_errors');
  if (metric.dom_node_count > 2500) blockers.push('heavy_dom');
  return blockers;
}

function summarizeRequests(requests) {
  const completed = requests.filter((request) => request.finished_at && request.started_at);
  const durations = completed.map((request) => request.finished_at - request.started_at);
  const apiRequests = completed.filter((request) => /\/api\//i.test(request.url));
  const slowApi = apiRequests.filter((request) => request.duration_ms > 1000);
  const failed = requests.filter((request) => request.failed || request.status >= 400);
  const byType = {};
  for (const request of requests) {
    byType[request.resource_type] = (byType[request.resource_type] || 0) + 1;
  }
  return {
    total_request_count: requests.length,
    request_p95_ms: percentile(durations, 95),
    request_max_ms: ms(Math.max(0, ...durations)),
    api_request_count: apiRequests.length,
    api_slow_count: slowApi.length,
    slow_api_preview: slowApi.slice(0, 8).map((request) => ({
      method: request.method,
      status: request.status || 0,
      duration_ms: ms(request.duration_ms),
      path: request.path,
    })),
    failed_request_count: failed.length,
    failed_request_preview: failed.slice(0, 8).map((request) => ({
      method: request.method,
      status: request.status || 0,
      resource_type: request.resource_type,
      path: request.path,
      error: request.error || '',
    })),
    requests_by_type: byType,
  };
}

async function collectPageMetrics(page) {
  return page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paints = Object.fromEntries(performance.getEntriesByType('paint').map((entry) => [entry.name, entry.startTime]));
    const resources = performance.getEntriesByType('resource');
    const scripts = resources.filter((entry) => entry.initiatorType === 'script');
    const styles = resources.filter((entry) => entry.initiatorType === 'link' || entry.initiatorType === 'css');
    const images = resources.filter((entry) => entry.initiatorType === 'img');
    const transferSize = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    const scriptTransferSize = scripts.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    const imageTransferSize = images.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    const scriptDuration = scripts.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const longTasks = Array.isArray(window.__bnaLongTasks) ? window.__bnaLongTasks : [];
    const layoutShifts = Array.isArray(window.__bnaLayoutShifts) ? window.__bnaLayoutShifts : [];
    const lcpEntries = Array.isArray(window.__bnaLargestContentfulPaint) ? window.__bnaLargestContentfulPaint : [];
    const navStart = navigation?.startTime || 0;
    return {
      dom_content_loaded_ms: Math.round((navigation?.domContentLoadedEventEnd || 0) - navStart),
      load_event_ms: Math.round((navigation?.loadEventEnd || 0) - navStart),
      response_start_ms: Math.round((navigation?.responseStart || 0) - navStart),
      first_paint_ms: Math.round(paints['first-paint'] || 0),
      first_contentful_paint_ms: Math.round(paints['first-contentful-paint'] || 0),
      largest_contentful_paint_ms: Math.round(lcpEntries.at(-1)?.startTime || 0),
      cumulative_layout_shift: Number(layoutShifts.reduce((sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value || 0), 0).toFixed(4)),
      long_task_count: longTasks.length,
      long_task_total_ms: Math.round(longTasks.reduce((sum, entry) => sum + (entry.duration || 0), 0)),
      long_task_max_ms: Math.round(Math.max(0, ...longTasks.map((entry) => entry.duration || 0))),
      dom_node_count: document.querySelectorAll('*').length,
      fixed_overlay_count: Array.from(document.querySelectorAll('body *')).filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.position === 'fixed' && rect.width > 20 && rect.height > 20;
      }).length,
      script_count: scripts.length,
      stylesheet_count: styles.length,
      image_count: images.length,
      total_transfer_kb: Math.round(transferSize / 1024),
      script_transfer_kb: Math.round(scriptTransferSize / 1024),
      image_transfer_kb: Math.round(imageTransferSize / 1024),
      script_resource_duration_ms: Math.round(scriptDuration),
      document_title: document.title,
    };
  });
}

async function auditRoute(browser, baseUrl, route, viewport, outDir, options = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    deviceScaleFactor: viewport.isMobile ? 2 : 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const url = new URL(route.route, baseUrl).toString();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  let status = 0;
  let mainResponseFailed = false;

  await page.addInitScript(() => {
    window.__bnaLongTasks = [];
    window.__bnaLayoutShifts = [];
    window.__bnaLargestContentfulPaint = [];
    try {
      new PerformanceObserver((list) => {
        window.__bnaLongTasks.push(...list.getEntries().map((entry) => ({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration,
        })));
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        window.__bnaLayoutShifts.push(...list.getEntries().map((entry) => ({
          value: entry.value,
          hadRecentInput: entry.hadRecentInput,
          startTime: entry.startTime,
        })));
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        window.__bnaLargestContentfulPaint.push(...list.getEntries().map((entry) => ({
          startTime: entry.startTime,
          renderTime: entry.renderTime,
          loadTime: entry.loadTime,
          size: entry.size,
        })));
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  });

  page.on('request', (request) => {
    const currentUrl = request.url();
    const parsed = new URL(currentUrl, baseUrl);
    requests.push({
      url: currentUrl,
      path: parsed.pathname + parsed.search,
      method: request.method(),
      resource_type: request.resourceType(),
      started_at: Date.now(),
      finished_at: 0,
      duration_ms: 0,
      status: 0,
      failed: false,
      error: '',
    });
  });
  page.on('response', (response) => {
    const request = response.request();
    const match = [...requests].reverse().find((item) => item.url === request.url() && !item.status);
    if (match) match.status = response.status();
  });
  page.on('requestfinished', (request) => {
    const match = [...requests].reverse().find((item) => item.url === request.url() && !item.finished_at);
    if (match) {
      match.finished_at = Date.now();
      match.duration_ms = match.finished_at - match.started_at;
    }
  });
  page.on('requestfailed', (request) => {
    const match = [...requests].reverse().find((item) => item.url === request.url() && !item.finished_at);
    if (match) {
      match.failed = true;
      match.error = request.failure()?.errorText || 'request_failed';
      match.finished_at = Date.now();
      match.duration_ms = match.finished_at - match.started_at;
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(short(message.text(), 240));
  });
  page.on('pageerror', (error) => {
    pageErrors.push(short(error.message || String(error), 240));
  });

  const startedAt = Date.now();
  let gotoMs = 0;
  let networkIdleMs = 0;
  let loadError = '';
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: options.gotoTimeoutMs || 20000 });
    gotoMs = Date.now() - startedAt;
    status = response?.status() || 0;
    mainResponseFailed = !response || status >= 400;
    await page.waitForLoadState('networkidle', { timeout: options.networkIdleTimeoutMs || 3000 }).catch(() => {
      loadError = loadError || 'network_idle_timeout';
    });
    networkIdleMs = Date.now() - startedAt;
    await page.waitForTimeout(options.settleMs || 500);
  } catch (error) {
    loadError = error?.message || String(error);
    gotoMs = Date.now() - startedAt;
    networkIdleMs = gotoMs;
    mainResponseFailed = true;
  }

  const pageMetrics = await collectPageMetrics(page).catch((error) => ({ metrics_error: error.message }));
  const requestMetrics = summarizeRequests(requests);
  const screenshotPath = path.join(outDir, 'screenshots', `${route.id}-${viewport.id}.png`);
  if (options.screenshots) {
    ensureDir(path.dirname(screenshotPath));
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }
  await context.close();

  const metric = {
    route_id: route.id,
    route: route.route,
    label: route.label,
    viewport: viewport.id,
    width: viewport.width,
    height: viewport.height,
    url,
    status,
    main_response_failed: mainResponseFailed,
    load_error: loadError,
    goto_ms: ms(gotoMs),
    network_idle_ms: ms(networkIdleMs),
    ...pageMetrics,
    ...requestMetrics,
    console_error_count: consoleErrors.length,
    console_error_preview: consoleErrors.slice(0, 8),
    page_error_count: pageErrors.length,
    page_error_preview: pageErrors.slice(0, 8),
    screenshot: options.screenshots ? rel(screenshotPath) : '',
  };
  metric.blockers = scoreResult(metric);
  metric.status_label = metric.blockers.length ? 'needs_attention' : 'acceptable';
  return metric;
}

function buildSummary(results) {
  const sortedByNetwork = [...results].sort((a, b) => b.network_idle_ms - a.network_idle_ms);
  const sortedByFcp = [...results].sort((a, b) => b.first_contentful_paint_ms - a.first_contentful_paint_ms);
  const sortedByLongTask = [...results].sort((a, b) => b.long_task_total_ms - a.long_task_total_ms);
  const blockerCounts = {};
  for (const result of results) {
    for (const blocker of result.blockers || []) blockerCounts[blocker] = (blockerCounts[blocker] || 0) + 1;
  }
  return {
    route_count: new Set(results.map((result) => result.route_id)).size,
    viewport_count: new Set(results.map((result) => result.viewport)).size,
    sample_count: results.length,
    needs_attention_count: results.filter((result) => result.status_label === 'needs_attention').length,
    blocker_counts: blockerCounts,
    worst_network_idle: sortedByNetwork.slice(0, 5).map((result) => ({
      route_id: result.route_id,
      viewport: result.viewport,
      network_idle_ms: result.network_idle_ms,
      goto_ms: result.goto_ms,
      blockers: result.blockers,
    })),
    worst_fcp: sortedByFcp.slice(0, 5).map((result) => ({
      route_id: result.route_id,
      viewport: result.viewport,
      first_contentful_paint_ms: result.first_contentful_paint_ms,
      blockers: result.blockers,
    })),
    worst_long_tasks: sortedByLongTask.slice(0, 5).map((result) => ({
      route_id: result.route_id,
      viewport: result.viewport,
      long_task_total_ms: result.long_task_total_ms,
      long_task_max_ms: result.long_task_max_ms,
      blockers: result.blockers,
    })),
  };
}

function markdownReport(report) {
  const lines = [];
  lines.push('# One Time Live Lag Audit');
  lines.push('');
  lines.push(`Generated: ${report.generated_at}`);
  lines.push(`Base URL: ${report.base_url}`);
  lines.push(`External write performed: ${report.external_write_performed}`);
  lines.push(`Production data mutation performed: ${report.production_data_mutation_performed}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Routes sampled: ${report.summary.route_count}`);
  lines.push(`- Viewports sampled: ${report.summary.viewport_count}`);
  lines.push(`- Total samples: ${report.summary.sample_count}`);
  lines.push(`- Samples needing attention: ${report.summary.needs_attention_count}`);
  lines.push('');
  lines.push('## Blocker Counts');
  lines.push('');
  const blockerEntries = Object.entries(report.summary.blocker_counts || {}).sort((a, b) => b[1] - a[1]);
  if (!blockerEntries.length) {
    lines.push('- None');
  } else {
    for (const [blocker, count] of blockerEntries) lines.push(`- ${blocker}: ${count}`);
  }
  lines.push('');
  lines.push('## Worst Network Idle');
  lines.push('');
  lines.push('| Route | Viewport | Network idle | Goto | Blockers |');
  lines.push('|---|---:|---:|---:|---|');
  for (const item of report.summary.worst_network_idle) {
    lines.push(`| ${item.route_id} | ${item.viewport} | ${item.network_idle_ms}ms | ${item.goto_ms}ms | ${(item.blockers || []).join(', ') || 'none'} |`);
  }
  lines.push('');
  lines.push('## Worst Paint');
  lines.push('');
  lines.push('| Route | Viewport | First contentful paint | Blockers |');
  lines.push('|---|---:|---:|---|');
  for (const item of report.summary.worst_fcp) {
    lines.push(`| ${item.route_id} | ${item.viewport} | ${item.first_contentful_paint_ms}ms | ${(item.blockers || []).join(', ') || 'none'} |`);
  }
  lines.push('');
  lines.push('## Worst Main Thread Work');
  lines.push('');
  lines.push('| Route | Viewport | Long task total | Long task max | Blockers |');
  lines.push('|---|---:|---:|---:|---|');
  for (const item of report.summary.worst_long_tasks) {
    lines.push(`| ${item.route_id} | ${item.viewport} | ${item.long_task_total_ms}ms | ${item.long_task_max_ms}ms | ${(item.blockers || []).join(', ') || 'none'} |`);
  }
  lines.push('');
  lines.push('## Per-Route Results');
  lines.push('');
  lines.push('| Route | Viewport | Status | DCL | FCP | Load | Network idle | Requests | API slow | Failed | Console errors | DOM nodes | Long tasks |');
  lines.push('|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const result of report.results) {
    lines.push(`| ${result.route_id} | ${result.viewport} | ${result.status_label} | ${result.dom_content_loaded_ms}ms | ${result.first_contentful_paint_ms}ms | ${result.load_event_ms}ms | ${result.network_idle_ms}ms | ${result.total_request_count} | ${result.api_slow_count} | ${result.failed_request_count} | ${result.console_error_count} | ${result.dom_node_count} | ${result.long_task_total_ms}ms |`);
  }
  lines.push('');
  lines.push('## Interpretation');
  lines.push('');
  lines.push('- `slow_network_idle` usually points to late resources, slow API calls, or widgets continuing work after the page appears.');
  lines.push('- `main_thread_long_tasks` points to JavaScript work that can make taps/typing feel laggy.');
  lines.push('- `heavy_dom` points to too much rendered markup and is often paired with layout jank.');
  lines.push('- This audit did not submit forms, send messages, create accounts, charge payments, mutate provider records, or log into private Operations.');
  lines.push('');
  lines.push('## Guardrails');
  lines.push('');
  for (const guardrail of report.guardrails) lines.push(`- ${guardrail}`);
  return `${lines.join('\n')}\n`;
}

async function main() {
  const baseUrl = argValue('base-url', DEFAULT_BASE_URL).replace(/\/+$/, '');
  const outDir = path.resolve(argValue('out-dir', DEFAULT_OUT_DIR));
  const includeScreenshots = hasFlag('screenshots');
  const networkIdleTimeoutMs = Number(argValue('network-idle-timeout-ms', '3000'));
  const gotoTimeoutMs = Number(argValue('goto-timeout-ms', '20000'));
  const settleMs = Number(argValue('settle-ms', '500'));
  ensureDir(outDir);

  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of VIEWPORTS) {
      for (const route of ROUTES) {
        results.push(await auditRoute(browser, baseUrl, route, viewport, outDir, {
          screenshots: includeScreenshots,
          networkIdleTimeoutMs,
          gotoTimeoutMs,
          settleMs,
        }));
      }
    }
  } finally {
    await browser.close();
  }

  const report = {
    report_version: 'onetime-live-lag-audit-v1',
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    out_dir: rel(outDir),
    external_write_performed: false,
    production_data_mutation_performed: false,
    routes: ROUTES,
    viewports: VIEWPORTS,
    wait_budget: {
      goto_timeout_ms: gotoTimeoutMs,
      network_idle_timeout_ms: networkIdleTimeoutMs,
      settle_ms: settleMs,
    },
    summary: buildSummary(results),
    results,
    guardrails: [
      'No forms were submitted.',
      'No login, payment, checkout, access grant, email, WhatsApp, Telegram, DNS, Drive, Vimeo, Zoom, provider, credential, or production-data mutation was performed.',
      'Private Operations routes were intentionally excluded from this live lag audit.',
      'Screenshots, if requested, are limited to public/review surfaces.',
    ],
  };

  const jsonPath = path.join(outDir, 'report.json');
  const mdPath = path.join(outDir, 'report.md');
  writeJson(jsonPath, report);
  writeText(mdPath, markdownReport(report));

  console.log(JSON.stringify({
    ok: true,
    report: rel(mdPath),
    json: rel(jsonPath),
    needs_attention_count: report.summary.needs_attention_count,
    blocker_counts: report.summary.blocker_counts,
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
