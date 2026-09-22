#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const DEFAULT_BASE_URL = 'https://join.onetimeonetime.com';
const DEFAULT_OUT_DIR = path.join(ROOT, 'ops', 'performance-audits', '2026-07-13-onetime-architecture-performance-baseline');

const WORKSPACE_QUERY = 'workspace=rabbi_sheller_provider&project=one_time_mishnah_class';
const REQUIRED_ROUTES = [
  {
    id: 'public-landing',
    label: 'One Time public landing',
    surface: 'public landing',
    path: '/one-time',
    auth: 'none',
    budget_class: 'public',
  },
  {
    id: 'provider-login-entry',
    label: 'Provider/login entry',
    surface: 'login/provider entry',
    path: '/provider.html?admin_provider=one-time&section=crm',
    auth: 'none',
    budget_class: 'portal',
  },
  {
    id: 'operations-overview',
    label: 'Operations One Time overview',
    surface: 'operations overview',
    path: `/operations?${WORKSPACE_QUERY}&view=service_providers&section=overview`,
    auth: 'operations',
    budget_class: 'operations',
  },
  {
    id: 'crm-list',
    label: 'One Time CRM list',
    surface: 'CRM list',
    path: `/operations?${WORKSPACE_QUERY}&view=contacts&section=crm_contacts`,
    auth: 'operations',
    budget_class: 'crm',
  },
  {
    id: 'crm-contact-detail',
    label: 'One Time CRM contact detail',
    surface: 'CRM contact detail',
    auth: 'operations',
    requires_crm_contact: true,
    budget_class: 'crm',
    pathFactory: (ctx) => `/operations?${WORKSPACE_QUERY}&view=contacts&section=crm_contacts&crm_contact=${encodeURIComponent(ctx.crm_contact_id || '')}`,
  },
  {
    id: 'conversations',
    label: 'One Time conversations',
    surface: 'Conversations',
    path: `/operations?${WORKSPACE_QUERY}&view=communications&section=email&inbox=rabbi`,
    auth: 'operations',
    budget_class: 'operations',
  },
  {
    id: 'tasks',
    label: 'One Time tasks',
    surface: 'Tasks',
    path: `/operations?${WORKSPACE_QUERY}&view=tasks&section=one_time&project=one_time_mishnah_class`,
    auth: 'operations',
    budget_class: 'operations',
  },
  {
    id: 'owner-communication-agent-test',
    label: 'Owner communication-agent test/readiness view',
    surface: 'owner communication-agent test view',
    path: `/operations?${WORKSPACE_QUERY}&view=service_providers&section=tiers`,
    auth: 'operations',
    budget_class: 'operations',
  },
];

const PROFILE_GROUPS = [
  { id: 'desktop-1440', width: 1440, height: 1000, isMobile: false },
  { id: 'tablet-1024', width: 1024, height: 900, isMobile: false },
  { id: 'mobile-430', width: 430, height: 932, isMobile: true },
  { id: 'mobile-390', width: 390, height: 844, isMobile: true },
  {
    id: 'mobile-390-throttled',
    width: 390,
    height: 844,
    isMobile: true,
    throttle: {
      latency_ms: 150,
      download_kbps: 1600,
      upload_kbps: 750,
      cpu_rate: 4,
    },
  },
];

function argValue(name, fallback = '') {
  const equalsPrefix = `--${name}=`;
  const equals = process.argv.find((arg) => arg.startsWith(equalsPrefix));
  if (equals) return equals.slice(equalsPrefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function argList(name, fallback = []) {
  const raw = argValue(name, '');
  if (!raw) return fallback;
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildSamplePlan({ compact, repeats, cacheStates, profiles, routes }) {
  if (!compact) {
    const plan = [];
    for (const sampleIndex of Array.from({ length: repeats }, (_, index) => index + 1)) {
      for (const cacheState of cacheStates) {
        for (const profile of profiles) {
          for (const route of routes) plan.push({ sampleIndex, cacheState, profile, route });
        }
      }
    }
    return plan;
  }

  const repeatedProfileIds = new Set(['desktop-1440', 'mobile-390']);
  const repeatedProfiles = profiles.filter((profile) => repeatedProfileIds.has(profile.id));
  const supplementalProfiles = profiles.filter((profile) => !repeatedProfileIds.has(profile.id));
  const plan = [];

  for (const sampleIndex of Array.from({ length: repeats }, (_, index) => index + 1)) {
    for (const cacheState of cacheStates) {
      for (const profile of repeatedProfiles) {
        for (const route of routes) plan.push({ sampleIndex, cacheState, profile, route });
      }
    }
  }

  for (const profile of supplementalProfiles) {
    for (const route of routes) plan.push({ sampleIndex: 1, cacheState: 'cold', profile, route });
  }

  return plan;
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

function short(value, max = 220) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function redactText(value = '') {
  return String(value || '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b(?:\+?972|0|1)?[ -]?(?:5[0-9]|2|3|4|8|9)?[ -]?\d{2,4}[ -]?\d{3,4}[ -]?\d{3,4}\b/g, (match) => {
      const digits = match.replace(/\D/g, '');
      return digits.length >= 9 ? '[redacted-phone]' : match;
    })
    .replace(/([?&](?:crm_contact|contact_id|token|code|access|password|email|phone)=)[^&#]+/gi, '$1[redacted]')
    .replace(/(\/api\/bna\/crm\/contacts\/)[^/?#]+/gi, '$1[redacted-contact]')
    .replace(/\b(?:sk|rk|pk|whsec|ghp|github_pat|xoxb|SG)_[A-Za-z0-9_-]{12,}\b/g, '[redacted-token]')
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, '[redacted-long-token]');
}

function safeUrlPath(url, baseUrl = DEFAULT_BASE_URL) {
  try {
    const parsed = new URL(url, baseUrl);
    return redactText(`${parsed.pathname}${parsed.search}`);
  } catch {
    return redactText(url);
  }
}

function percentile(values, p) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!numbers.length) return null;
  const index = Math.min(numbers.length - 1, Math.max(0, Math.ceil((p / 100) * numbers.length) - 1));
  return ms(numbers[index]);
}

function summarize(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value));
  return {
    count: numbers.length,
    p50_ms: percentile(numbers, 50),
    p75_ms: percentile(numbers, 75),
    p95_ms: percentile(numbers, 95),
    worst_ms: percentile(numbers, 100),
  };
}

function headersFromCookie(cookie) {
  if (!cookie?.name || !cookie?.value) return {};
  return { cookie: `${cookie.name}=${cookie.value}` };
}

function cookieForContext(cookie, baseUrl) {
  if (!cookie?.name || !cookie?.value) return null;
  return {
    name: cookie.name,
    value: cookie.value,
    url: baseUrl,
    httpOnly: true,
    sameSite: 'Lax',
  };
}

async function fetchJsonTimed(baseUrl, routePath, headers = {}) {
  const url = new URL(routePath, baseUrl).toString();
  const started = performance.now();
  const response = await fetch(url, { headers: { accept: 'application/json', ...headers } });
  const text = await response.text();
  const duration = ms(performance.now() - started);
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {}
  return {
    ok: response.ok,
    status: response.status,
    duration_ms: duration,
    bytes: Buffer.byteLength(text || '', 'utf8'),
    data,
  };
}

async function discoverContext(baseUrl, cookie) {
  const headers = headersFromCookie(cookie);
  const deploy = await fetchJsonTimed(baseUrl, '/api/deploy-info', {}).catch((error) => ({
    ok: false,
    status: 0,
    duration_ms: 0,
    bytes: 0,
    data: {},
    error: error.message,
  }));

  const crmList = cookie
    ? await fetchJsonTimed(
        baseUrl,
        `/api/bna/crm/contacts?${WORKSPACE_QUERY}&limit=1&sort=last_activity_desc`,
        headers,
      ).catch((error) => ({
        ok: false,
        status: 0,
        duration_ms: 0,
        bytes: 0,
        data: {},
        error: error.message,
      }))
    : { ok: false, status: 0, duration_ms: 0, bytes: 0, data: {}, skipped: true };

  const firstCard = Array.isArray(crmList.data?.cards) ? crmList.data.cards[0] : null;
  return {
    deploy_info: {
      ok: deploy.ok,
      status: deploy.status,
      duration_ms: deploy.duration_ms,
      commit_sha: deploy.data?.commit_sha || deploy.data?.sha || '',
      deployment_id: deploy.data?.deployment_id || '',
    },
    crm_probe: {
      ok: crmList.ok,
      status: crmList.status,
      duration_ms: crmList.duration_ms,
      filtered_total: Number(crmList.data?.filtered_total || crmList.data?.total || 0),
      first_contact_available: Boolean(firstCard?.id),
      external_write_performed: crmList.data?.external_write_performed === true,
      no_send: crmList.data?.no_send !== false,
      error: crmList.error || '',
    },
    crm_contact_id: firstCard?.id ? String(firstCard.id) : '',
  };
}

function routePath(route, context) {
  if (route.pathFactory) return route.pathFactory(context);
  return route.path;
}

function budgetFor(route, profile) {
  const mobileMultiplier = profile.isMobile ? 1.25 : 1;
  const throttleMultiplier = profile.throttle ? 1.9 : 1;
  const multiplier = mobileMultiplier * throttleMultiplier;
  const base = route.budget_class === 'public'
    ? { response_start_ms: 1200, fcp_ms: 2200, lcp_ms: 3500, network_idle_ms: 4500, requests: 45, transfer_kb: 1200, dom_nodes: 1800, long_task_ms: 250, api_p95_ms: 1000 }
    : route.budget_class === 'crm'
      ? { response_start_ms: 1700, fcp_ms: 3600, lcp_ms: 5200, network_idle_ms: 6500, requests: 120, transfer_kb: 2600, dom_nodes: 3200, long_task_ms: 350, api_p95_ms: 1500 }
      : { response_start_ms: 1600, fcp_ms: 3400, lcp_ms: 5000, network_idle_ms: 6200, requests: 110, transfer_kb: 2400, dom_nodes: 3000, long_task_ms: 350, api_p95_ms: 1500 };
  return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, Math.round(value * multiplier)]));
}

function summarizeRequests(requests) {
  const finished = requests.filter((request) => request.finished_at && request.started_at);
  const durations = finished.map((request) => request.duration_ms).filter(Number.isFinite);
  const api = finished.filter((request) => request.path.includes('/api/'));
  const apiDurations = api.map((request) => request.duration_ms).filter(Number.isFinite);
  const failed = requests.filter((request) => request.failed || request.status >= 400);
  const thirdParty = finished.filter((request) => {
    try {
      const host = new URL(request.url).hostname;
      return !/onetimeonetime\.com$|bneineviimacademy\.org$|localhost|127\.0\.0\.1/.test(host);
    } catch {
      return false;
    }
  });
  const byType = {};
  for (const request of requests) byType[request.resource_type] = (byType[request.resource_type] || 0) + 1;
  return {
    total_request_count: requests.length,
    request_p50_ms: percentile(durations, 50),
    request_p75_ms: percentile(durations, 75),
    request_p95_ms: percentile(durations, 95),
    request_worst_ms: percentile(durations, 100),
    api_request_count: api.length,
    api_p95_ms: percentile(apiDurations, 95),
    api_worst_ms: percentile(apiDurations, 100),
    third_party_request_count: thirdParty.length,
    failed_request_count: failed.length,
    failed_request_preview: failed.slice(0, 8).map((request) => ({
      method: request.method,
      status: request.status || 0,
      resource_type: request.resource_type,
      path: request.path,
      error: redactText(request.error || ''),
    })),
    slow_api_preview: api
      .filter((request) => request.duration_ms > 1000)
      .sort((a, b) => b.duration_ms - a.duration_ms)
      .slice(0, 8)
      .map((request) => ({
        method: request.method,
        status: request.status || 0,
        duration_ms: ms(request.duration_ms),
        path: request.path,
      })),
    requests_by_type: byType,
  };
}

function scoreMetric(metric) {
  if (metric.skipped) return ['skipped'];
  const budget = metric.budget || {};
  const blockers = [];
  if (metric.status >= 400 || metric.main_response_failed) blockers.push('main_response_failed');
  if (metric.load_error && metric.load_error !== 'network_idle_timeout') blockers.push('load_error');
  if (metric.response_start_ms > budget.response_start_ms) blockers.push('slow_ttfb');
  if (metric.first_contentful_paint_ms > budget.fcp_ms) blockers.push('slow_fcp');
  if (metric.largest_contentful_paint_ms > budget.lcp_ms) blockers.push('slow_lcp');
  if (metric.network_idle_ms > budget.network_idle_ms) blockers.push('slow_network_idle');
  if (metric.total_request_count > budget.requests) blockers.push('request_fanout');
  if (metric.total_transfer_kb > budget.transfer_kb) blockers.push('large_transfer');
  if (metric.dom_node_count > budget.dom_nodes) blockers.push('heavy_dom');
  if (metric.long_task_total_ms > budget.long_task_ms) blockers.push('main_thread_long_tasks');
  if (metric.api_p95_ms && metric.api_p95_ms > budget.api_p95_ms) blockers.push('slow_api');
  if (metric.failed_request_count > 0) blockers.push('failed_requests');
  if (metric.console_error_count > 0) blockers.push('console_errors');
  return blockers;
}

function runnerErrorResult(route, profile, cacheState, sampleIndex, error) {
  return {
    route_id: route.id,
    route_label: route.label,
    route_surface: route.surface,
    route_path: redactText(route.path || ''),
    profile: profile.id,
    width: profile.width,
    height: profile.height,
    throttle: profile.throttle || null,
    cache_state: cacheState,
    sample_index: sampleIndex,
    skipped: false,
    status: 0,
    main_response_failed: true,
    load_error: redactText(error?.message || String(error || 'runner_error')),
    navigation_wall_ms: 0,
    domcontentloaded_wall_ms: 0,
    network_idle_ms: 0,
    response_start_ms: 0,
    first_contentful_paint_ms: 0,
    largest_contentful_paint_ms: 0,
    total_request_count: 0,
    api_request_count: 0,
    third_party_request_count: 0,
    failed_request_count: 0,
    console_error_count: 0,
    page_error_count: 0,
    total_transfer_kb: 0,
    dom_node_count: 0,
    long_task_total_ms: 0,
    budget: budgetFor(route, profile),
    blockers: ['runner_error'],
    status_label: 'needs_attention',
  };
}

async function installThrottling(page, profile) {
  if (!profile.throttle) return;
  const session = await page.context().newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: profile.throttle.latency_ms,
    downloadThroughput: Math.round((profile.throttle.download_kbps * 1024) / 8),
    uploadThroughput: Math.round((profile.throttle.upload_kbps * 1024) / 8),
  });
  await session.send('Emulation.setCPUThrottlingRate', { rate: profile.throttle.cpu_rate });
}

async function primeContext(context, baseUrl, route, cookie, profile, options) {
  const pathValue = routePath(route, {});
  if (!pathValue || route.requires_crm_contact) return;
  const page = await context.newPage();
  await installThrottling(page, profile);
  try {
    if (cookie) await context.addCookies([cookieForContext(cookie, baseUrl)].filter(Boolean));
    await page.goto(new URL(pathValue, baseUrl).toString(), { waitUntil: 'domcontentloaded', timeout: Math.min(options.gotoTimeoutMs, 5000) }).catch(() => {});
    await page.waitForTimeout(50).catch(() => {});
  } finally {
    await page.close().catch(() => {});
  }
}

async function measureRoute(browser, baseUrl, route, profile, cacheState, sampleIndex, contextData, cookie, options) {
  const pathValue = routePath(route, contextData);
  if (!pathValue || (route.requires_crm_contact && !contextData.crm_contact_id)) {
    return {
      route_id: route.id,
      route_label: route.label,
      route_surface: route.surface,
      profile: profile.id,
      cache_state: cacheState,
      sample_index: sampleIndex,
      skipped: true,
      skip_reason: 'No redacted CRM contact was available for the contact-detail route.',
      blockers: ['skipped'],
      status_label: 'skipped',
    };
  }
  if (route.auth === 'operations' && !cookie) {
    return {
      route_id: route.id,
      route_label: route.label,
      route_surface: route.surface,
      profile: profile.id,
      cache_state: cacheState,
      sample_index: sampleIndex,
      skipped: true,
      skip_reason: 'Operations auth cookie unavailable.',
      blockers: ['skipped'],
      status_label: 'skipped',
    };
  }

  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    isMobile: profile.isMobile,
    deviceScaleFactor: profile.isMobile ? 2 : 1,
    reducedMotion: 'reduce',
  });
  if (cookie) await context.addCookies([cookieForContext(cookie, baseUrl)].filter(Boolean));
  if (cacheState === 'warm') await primeContext(context, baseUrl, route, cookie, profile, options);

  const page = await context.newPage();
  await installThrottling(page, profile);
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  let status = 0;
  let mainResponseFailed = false;
  let loadError = '';

  await page.addInitScript(() => {
    window.__bnaLongTasks = [];
    window.__bnaLayoutShifts = [];
    window.__bnaLargestContentfulPaint = [];
    try {
      new PerformanceObserver((list) => {
        window.__bnaLongTasks.push(...list.getEntries().map((entry) => ({
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
    requests.push({
      url: request.url(),
      path: safeUrlPath(request.url(), baseUrl),
      method: request.method(),
      resource_type: request.resourceType(),
      started_at: performance.now(),
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
      match.finished_at = performance.now();
      match.duration_ms = ms(match.finished_at - match.started_at);
    }
  });
  page.on('requestfailed', (request) => {
    const match = [...requests].reverse().find((item) => item.url === request.url() && !item.finished_at);
    if (match) {
      match.failed = true;
      match.error = request.failure()?.errorText || 'request_failed';
      match.finished_at = performance.now();
      match.duration_ms = ms(match.finished_at - match.started_at);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(redactText(short(message.text(), 240)));
  });
  page.on('pageerror', (error) => pageErrors.push(redactText(short(error.message || String(error), 240))));

  const url = new URL(pathValue, baseUrl).toString();
  const started = performance.now();
  let domContentLoadedMs = 0;
  let networkIdleMs = 0;
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: options.gotoTimeoutMs });
    domContentLoadedMs = ms(performance.now() - started);
    status = response?.status() || 0;
    mainResponseFailed = !response || status >= 400;
    await page.waitForLoadState('networkidle', { timeout: options.networkIdleTimeoutMs }).catch(() => {
      loadError = 'network_idle_timeout';
    });
    networkIdleMs = ms(performance.now() - started);
    await page.waitForTimeout(options.settleMs);
  } catch (error) {
    loadError = redactText(error?.message || String(error));
    domContentLoadedMs = ms(performance.now() - started);
    networkIdleMs = domContentLoadedMs;
    mainResponseFailed = true;
  }

  const browserMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paints = Object.fromEntries(performance.getEntriesByType('paint').map((entry) => [entry.name, entry.startTime]));
    const resources = performance.getEntriesByType('resource');
    const scripts = resources.filter((entry) => entry.initiatorType === 'script');
    const styles = resources.filter((entry) => entry.initiatorType === 'link' || entry.initiatorType === 'css');
    const images = resources.filter((entry) => entry.initiatorType === 'img');
    const transferSize = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    const encodedSize = resources.reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0);
    const scriptTransferSize = scripts.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    const imageTransferSize = images.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    const longTasks = Array.isArray(window.__bnaLongTasks) ? window.__bnaLongTasks : [];
    const layoutShifts = Array.isArray(window.__bnaLayoutShifts) ? window.__bnaLayoutShifts : [];
    const lcpEntries = Array.isArray(window.__bnaLargestContentfulPaint) ? window.__bnaLargestContentfulPaint : [];
    return {
      response_start_ms: Math.round(navigation?.responseStart || 0),
      dom_content_loaded_event_ms: Math.round(navigation?.domContentLoadedEventEnd || 0),
      load_event_ms: Math.round(navigation?.loadEventEnd || 0),
      first_paint_ms: Math.round(paints['first-paint'] || 0),
      first_contentful_paint_ms: Math.round(paints['first-contentful-paint'] || 0),
      largest_contentful_paint_ms: Math.round(lcpEntries.at(-1)?.startTime || 0),
      cumulative_layout_shift: Number(layoutShifts.reduce((sum, entry) => sum + (entry.hadRecentInput ? 0 : entry.value || 0), 0).toFixed(4)),
      long_task_count: longTasks.length,
      long_task_total_ms: Math.round(longTasks.reduce((sum, entry) => sum + (entry.duration || 0), 0)),
      long_task_worst_ms: Math.round(Math.max(0, ...longTasks.map((entry) => entry.duration || 0))),
      dom_node_count: document.querySelectorAll('*').length,
      script_count: scripts.length,
      stylesheet_count: styles.length,
      image_count: images.length,
      total_transfer_kb: Math.round(transferSize / 1024),
      total_encoded_kb: Math.round(encodedSize / 1024),
      script_transfer_kb: Math.round(scriptTransferSize / 1024),
      image_transfer_kb: Math.round(imageTransferSize / 1024),
      document_title: document.title || '',
      app_shell_present: Boolean(document.querySelector('#app, #appRoot, [data-one-time-rabbi-dashboard], [data-one-time-crm-workbench], [data-one-time-agent-mode-acceptance]')),
      selected_contact_visible: Boolean(document.querySelector('[data-crm-contact-detail], .crm-selected-card, [data-selected-contact="true"]')),
    };
  }).catch((error) => ({ metrics_error: redactText(error.message) }));
  await context.close().catch(() => {});

  const requestSummary = summarizeRequests(requests);
  const metric = {
    route_id: route.id,
    route_label: route.label,
    route_surface: route.surface,
    route_path: safeUrlPath(pathValue, baseUrl),
    profile: profile.id,
    width: profile.width,
    height: profile.height,
    throttle: profile.throttle || null,
    cache_state: cacheState,
    sample_index: sampleIndex,
    skipped: false,
    status,
    main_response_failed: mainResponseFailed,
    load_error: loadError,
    navigation_wall_ms: ms(performance.now() - started),
    domcontentloaded_wall_ms: domContentLoadedMs,
    network_idle_ms: networkIdleMs,
    ...browserMetrics,
    ...requestSummary,
    console_error_count: consoleErrors.length,
    console_error_preview: consoleErrors.slice(0, 6),
    page_error_count: pageErrors.length,
    page_error_preview: pageErrors.slice(0, 6),
    budget: budgetFor(route, profile),
  };
  metric.blockers = scoreMetric(metric);
  metric.status_label = metric.blockers.length ? 'needs_attention' : 'within_budget';
  return metric;
}

function groupKey(result) {
  return [result.route_id, result.profile, result.cache_state].join('|');
}

function buildSummary(results) {
  const measured = results.filter((result) => !result.skipped);
  const skipped = results.filter((result) => result.skipped);
  const groupMap = new Map();
  for (const result of measured) {
    const key = groupKey(result);
    const entry = groupMap.get(key) || {
      route_id: result.route_id,
      route_surface: result.route_surface,
      profile: result.profile,
      cache_state: result.cache_state,
      samples: [],
    };
    entry.samples.push(result);
    groupMap.set(key, entry);
  }
  const route_profiles = [...groupMap.values()].map((entry) => {
    const samples = entry.samples;
    const blockers = {};
    for (const sample of samples) {
      for (const blocker of sample.blockers || []) blockers[blocker] = (blockers[blocker] || 0) + 1;
    }
    return {
      route_id: entry.route_id,
      route_surface: entry.route_surface,
      profile: entry.profile,
      cache_state: entry.cache_state,
      sample_count: samples.length,
      failure_rate: Number((samples.filter((sample) => sample.status_label === 'needs_attention').length / Math.max(1, samples.length)).toFixed(3)),
      response_start: summarize(samples.map((sample) => sample.response_start_ms)),
      fcp: summarize(samples.map((sample) => sample.first_contentful_paint_ms)),
      lcp: summarize(samples.map((sample) => sample.largest_contentful_paint_ms)),
      network_idle: summarize(samples.map((sample) => sample.network_idle_ms)),
      api_p95: summarize(samples.map((sample) => sample.api_p95_ms || 0)),
      requests: summarize(samples.map((sample) => sample.total_request_count)),
      transfer_kb: summarize(samples.map((sample) => sample.total_transfer_kb)),
      dom_nodes: summarize(samples.map((sample) => sample.dom_node_count)),
      long_task_total: summarize(samples.map((sample) => sample.long_task_total_ms)),
      blocker_counts: blockers,
    };
  });
  const blockerCounts = {};
  for (const result of results) {
    for (const blocker of result.blockers || []) blockerCounts[blocker] = (blockerCounts[blocker] || 0) + 1;
  }
  return {
    route_count: new Set(results.map((result) => result.route_id)).size,
    profile_count: new Set(results.map((result) => result.profile)).size,
    measured_sample_count: measured.length,
    skipped_sample_count: skipped.length,
    needs_attention_count: measured.filter((result) => result.status_label === 'needs_attention').length,
    blocker_counts: blockerCounts,
    route_profiles,
    worst_samples: [...measured]
      .sort((a, b) => (
        (b.network_idle_ms || 0) - (a.network_idle_ms || 0)
        || (b.first_contentful_paint_ms || 0) - (a.first_contentful_paint_ms || 0)
      ))
      .slice(0, 20)
      .map((result) => ({
        route_id: result.route_id,
        profile: result.profile,
        cache_state: result.cache_state,
        sample_index: result.sample_index,
        response_start_ms: result.response_start_ms,
        fcp_ms: result.first_contentful_paint_ms,
        lcp_ms: result.largest_contentful_paint_ms,
        network_idle_ms: result.network_idle_ms,
        requests: result.total_request_count,
        api_p95_ms: result.api_p95_ms,
        transfer_kb: result.total_transfer_kb,
        dom_nodes: result.dom_node_count,
        long_task_total_ms: result.long_task_total_ms,
        blockers: result.blockers,
      })),
    skipped: skipped.map((result) => ({
      route_id: result.route_id,
      profile: result.profile,
      cache_state: result.cache_state,
      sample_index: result.sample_index,
      skip_reason: result.skip_reason,
    })),
  };
}

function table(rows, columns) {
  if (!rows.length) return '_None._';
  const header = `| ${columns.map((column) => column.label).join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(column.value(row) ?? '').replace(/\|/g, '\\|')).join(' | ')} |`);
  return [header, divider, ...body].join('\n');
}

function rootCauseSummary(report) {
  const blockerCounts = report.summary.blocker_counts || {};
  const operationsRows = report.summary.route_profiles.filter((row) => ['operations-overview', 'crm-list', 'crm-contact-detail', 'conversations', 'tasks', 'owner-communication-agent-test'].includes(row.route_id));
  const publicRows = report.summary.route_profiles.filter((row) => ['public-landing', 'provider-login-entry'].includes(row.route_id));
  const operationsWorstFcp = Math.max(0, ...operationsRows.map((row) => row.fcp.worst_ms || 0));
  const publicWorstFcp = Math.max(0, ...publicRows.map((row) => row.fcp.worst_ms || 0));
  const slowApiCount = blockerCounts.slow_api || 0;
  const failedRequests = blockerCounts.failed_requests || 0;
  const longTasks = blockerCounts.main_thread_long_tasks || 0;
  return [
    `- Frontend critical path: Operations/CRM still rides the shared Operations shell and deferred renderer split; worst Operations-family FCP in this run is ${operationsWorstFcp || 'n/a'}ms versus ${publicWorstFcp || 'n/a'}ms for public/provider entry routes.`,
    `- Server/hosting timing: TTFB and network-idle are measured, but route handler/database/pool timing is not yet separated because live Server-Timing and DB span instrumentation are not present in this baseline.`,
    `- API/database signal: ${slowApiCount ? `${slowApiCount} slow API budget breach sample(s) were observed.` : 'No direct slow API budget breach was observed in the collected samples.'} Database cause remains an instrumentation gap for REQ-20260713-911.`,
    `- Third-party signal: request counts include third-party fanout; no external write or form submission was performed. Third-party cause is not primary unless route samples show failed/slow external requests in the JSON report.`,
    `- Browser work: ${longTasks ? `${longTasks} main-thread long-task budget breach sample(s) were observed.` : 'Long-task totals did not dominate the measured samples.'}`,
    `- Reliability: ${failedRequests ? `${failedRequests} sample(s) had failed request budget breaches.` : 'No failed request budget breach was observed.'}`,
  ].join('\n');
}

function markdownReport(report) {
  const routes = report.routes.map((route) => ({
    id: route.id,
    surface: route.surface,
    auth: route.auth,
    path: route.redacted_path,
  }));
  const routeRows = report.summary.route_profiles
    .filter((row) => row.cache_state === 'cold')
    .map((row) => ({
      ...row,
      blocker_text: Object.entries(row.blocker_counts || {}).map(([key, count]) => `${key}:${count}`).join(', ') || 'none',
    }));
  const lines = [];
  lines.push('# One Time Architecture Performance Baseline');
  lines.push('');
  lines.push(`Generated: ${report.generated_at}`);
  lines.push(`Requirement: ${report.requirement_id}`);
  lines.push(`Base URL: ${report.base_url}`);
  lines.push(`Deploy SHA: ${report.deploy_info.commit_sha || '(not reported)'}`);
  lines.push(`Operations auth: ${report.operations_auth.ok ? `available via ${report.operations_auth.source}` : report.operations_auth.blocker}`);
  lines.push(`External write performed: ${report.external_write_performed}`);
  lines.push(`Production data mutation performed: ${report.production_data_mutation_performed}`);
  lines.push('');
  lines.push('## Architecture Decision Baseline');
  lines.push('');
  lines.push('- Current state is a single Express app serving public One Time pages, provider/member/student pages, and authenticated Operations from the same repo/runtime.');
  lines.push('- Operations has already been split into `operations-bootstrap.html`, `public/js/operations-shell.js`, and `public/js/operations-deferred-renderers.js`, but One Time still shares the large Operations runtime and route switcher.');
  lines.push('- CRM selected-contact data now has server-owned DTO routes for timeline, conversations, and tasks, which reduces browser-side dataset unions but does not yet provide DB/pool timing spans.');
  lines.push('- ADR default for the next implementation packet is a dedicated same-repo One Time frontend artifact sharing only domain/API contracts; a fully separate app remains deferred unless later measurement proves repository coupling is the cause.');
  lines.push('');
  lines.push('## Route Map');
  lines.push('');
  lines.push(table(routes, [
    { label: 'Route ID', value: (row) => row.id },
    { label: 'Surface', value: (row) => row.surface },
    { label: 'Auth', value: (row) => row.auth },
    { label: 'Path', value: (row) => row.path },
  ]));
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Profiles sampled: ${report.summary.profile_count}`);
  lines.push(`- Measured samples: ${report.summary.measured_sample_count}`);
  lines.push(`- Skipped samples: ${report.summary.skipped_sample_count}`);
  lines.push(`- Samples needing attention: ${report.summary.needs_attention_count}`);
  lines.push('');
  lines.push('## Root-Cause Classification');
  lines.push('');
  lines.push(rootCauseSummary(report));
  lines.push('');
  lines.push('## Cold Route/Profile Results');
  lines.push('');
  lines.push(table(routeRows, [
    { label: 'Route', value: (row) => row.route_id },
    { label: 'Profile', value: (row) => row.profile },
    { label: 'Samples', value: (row) => row.sample_count },
    { label: 'FCP p50/p95', value: (row) => `${row.fcp.p50_ms ?? ''}/${row.fcp.p95_ms ?? ''}` },
    { label: 'LCP p50/p95', value: (row) => `${row.lcp.p50_ms ?? ''}/${row.lcp.p95_ms ?? ''}` },
    { label: 'TTFB p50/p95', value: (row) => `${row.response_start.p50_ms ?? ''}/${row.response_start.p95_ms ?? ''}` },
    { label: 'Network p95', value: (row) => row.network_idle.p95_ms ?? '' },
    { label: 'Req p95', value: (row) => row.requests.p95_ms ?? '' },
    { label: 'Blockers', value: (row) => row.blocker_text },
  ]));
  lines.push('');
  lines.push('## Worst Samples');
  lines.push('');
  lines.push(table(report.summary.worst_samples.slice(0, 15), [
    { label: 'Route', value: (row) => row.route_id },
    { label: 'Profile', value: (row) => row.profile },
    { label: 'Cache', value: (row) => row.cache_state },
    { label: 'TTFB', value: (row) => row.response_start_ms },
    { label: 'FCP', value: (row) => row.fcp_ms },
    { label: 'LCP', value: (row) => row.lcp_ms },
    { label: 'Network', value: (row) => row.network_idle_ms },
    { label: 'Reqs', value: (row) => row.requests },
    { label: 'Blockers', value: (row) => (row.blockers || []).join(', ') || 'none' },
  ]));
  lines.push('');
  lines.push('## Instrumentation Gaps To Carry Into REQ-20260713-911');
  lines.push('');
  for (const gap of report.instrumentation_gaps) lines.push(`- ${gap}`);
  lines.push('');
  lines.push('## Guardrails');
  lines.push('');
  for (const guardrail of report.guardrails) lines.push(`- ${guardrail}`);
  return `${lines.join('\n')}\n`;
}

async function main() {
  const baseUrl = argValue('base-url', process.env.ONE_TIME_PUBLIC_BASE_URL || process.env.ONE_TIME_APP_URL || process.env.ONETIME_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const outDir = path.resolve(argValue('out-dir', DEFAULT_OUT_DIR));
  const repeats = Math.max(1, Math.min(Number(argValue('repeats', '2')), 5));
  const gotoTimeoutMs = Number(argValue('goto-timeout-ms', '6000'));
  const networkIdleTimeoutMs = Number(argValue('network-idle-timeout-ms', '2000'));
  const settleMs = Number(argValue('settle-ms', '100'));
  const skipThrottle = hasFlag('skip-throttle');
  const compact = hasFlag('compact');
  const selectedRouteIds = new Set(argList('routes', REQUIRED_ROUTES.map((route) => route.id)));
  const selectedProfileIds = new Set(argList('profiles', PROFILE_GROUPS.map((profile) => profile.id)));
  const selectedCacheStates = new Set(argList('cache-states', ['cold', 'warm']));
  const routesToSample = REQUIRED_ROUTES.filter((route) => selectedRouteIds.has(route.id));
  const profiles = (skipThrottle ? PROFILE_GROUPS.filter((profile) => !profile.throttle) : PROFILE_GROUPS)
    .filter((profile) => selectedProfileIds.has(profile.id));
  const cacheStates = ['cold', 'warm'].filter((cacheState) => selectedCacheStates.has(cacheState));
  if (!routesToSample.length) throw new Error('No matching routes selected for the One Time architecture baseline.');
  if (!profiles.length) throw new Error('No matching profiles selected for the One Time architecture baseline.');
  if (!cacheStates.length) throw new Error('No matching cache states selected for the One Time architecture baseline.');
  ensureDir(outDir);

  const env = loadSmokeEnv({ root: ROOT });
  const oneTimeRailwayEnv = {
    ...env,
    OPS_USERNAME: '',
    OPS_PASSWORD: '',
    BNA_SMOKE_RAILWAY_PROJECT_ID: env.BNA_SMOKE_RAILWAY_PROJECT_ID || 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
    BNA_SMOKE_RAILWAY_SERVICE: env.BNA_SMOKE_RAILWAY_SERVICE || 'one-time-web',
    BNA_SMOKE_RAILWAY_ENVIRONMENT: env.BNA_SMOKE_RAILWAY_ENVIRONMENT || 'production',
  };
  const login = await loginOperations({ baseUrl, env: oneTimeRailwayEnv, cwd: ROOT }).catch((error) => ({
    cookie: null,
    source: 'missing',
    reason: redactText(error.message || String(error)),
  }));
  const operationsAuth = {
    ok: Boolean(login.cookie?.name && login.cookie?.value),
    source: login.source || 'missing',
    blocker: login.cookie ? '' : (login.reason || 'Operations auth unavailable.'),
  };
  const contextData = await discoverContext(baseUrl, login.cookie);

  const browser = await chromium.launch({ headless: true });
  const results = [];
  const samplePlan = buildSamplePlan({ compact, repeats, cacheStates, profiles, routes: routesToSample });
  const totalSamples = samplePlan.length;
  let completedSamples = 0;
  const startedAt = performance.now();
  try {
    for (const { sampleIndex, cacheState, profile, route } of samplePlan) {
      try {
        results.push(await measureRoute(browser, baseUrl, route, profile, cacheState, sampleIndex, contextData, login.cookie, {
          gotoTimeoutMs,
          networkIdleTimeoutMs,
          settleMs,
        }));
      } catch (error) {
        results.push(runnerErrorResult(route, profile, cacheState, sampleIndex, error));
        console.error(`[baseline] recorded runner_error for ${route.id}, ${profile.id}, ${cacheState}, repeat ${sampleIndex}: ${redactText(error?.message || String(error))}`);
      }
      completedSamples += 1;
      if (completedSamples === 1 || completedSamples % 8 === 0 || completedSamples === totalSamples) {
        const elapsedSeconds = Math.round((performance.now() - startedAt) / 1000);
        console.error(`[baseline] ${completedSamples}/${totalSamples} samples complete (${route.id}, ${profile.id}, ${cacheState}, repeat ${sampleIndex}) after ${elapsedSeconds}s`);
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  const routes = routesToSample.map((route) => {
    const pathValue = routePath(route, contextData);
    return {
      id: route.id,
      label: route.label,
      surface: route.surface,
      auth: route.auth,
      budget_class: route.budget_class,
      redacted_path: safeUrlPath(pathValue || route.path || '', baseUrl),
      requires_crm_contact: route.requires_crm_contact === true,
    };
  });
  const report = {
    report_version: 'onetime-architecture-performance-baseline-v1',
    requirement_id: 'REQ-20260713-907',
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    out_dir: rel(outDir),
    repeats,
    compact,
    cache_states: compact ? cacheStates.concat(['cold supplemental profiles']).filter((value, index, values) => values.indexOf(value) === index) : cacheStates,
    profiles,
    routes,
    deploy_info: contextData.deploy_info,
    operations_auth: operationsAuth,
    crm_probe: contextData.crm_probe,
    external_write_performed: false,
    production_data_mutation_performed: false,
    summary: buildSummary(results),
    results,
    instrumentation_gaps: [
      'No live Server-Timing header or trace ID is emitted for each route yet.',
      'API handler duration, database duration, and pool wait are not separated in production evidence yet.',
      'Frontend route-transition/RUM web-vitals collection is not persisted yet.',
      'Bundle/chunk budgets are documented from existing split-shell evidence but are not enforced by this live runner yet.',
      'Exact p95 live release gates should be wired into REQ-20260713-911 before lag is called fixed.',
    ],
    guardrails: [
      'No forms were submitted and no buttons were clicked.',
      'No email, WhatsApp, Telegram, payment, access grant, DNS, Drive, Vimeo, Zoom, provider credential, Railway mutation, or external CRM write was performed.',
      'Operations cookies were used only in memory; credentials and cookie values are not written to reports.',
      'Saved route paths redact crm_contact, tokens, access codes, email, and phone-like values.',
      'No raw contact data, message bodies, private destinations, or screenshots are stored by this runner.',
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
    measured_sample_count: report.summary.measured_sample_count,
    skipped_sample_count: report.summary.skipped_sample_count,
    needs_attention_count: report.summary.needs_attention_count,
    blocker_counts: report.summary.blocker_counts,
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
