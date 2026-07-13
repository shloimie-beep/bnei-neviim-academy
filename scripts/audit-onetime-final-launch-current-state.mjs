#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const defaultOutDir = path.join(repoRoot, 'ops', 'ui-audits', '2026-07-13-onetime-final-launch-current-state');

const viewports = [
  { id: '1440-desktop', width: 1440, height: 1000 },
  { id: '1024-desktop-tablet', width: 1024, height: 900 },
  { id: '768-tablet', width: 768, height: 900 },
  { id: '430-mobile', width: 430, height: 932 },
  { id: '390-mobile', width: 390, height: 844 },
];

const routes = [
  { id: 'public-root', path: '/', surface: 'public landing root', auth: 'none', private: false },
  { id: 'public-one-time', path: '/one-time', surface: 'public One Time landing', auth: 'none', private: false },
  { id: 'public-signup', path: '/one-time/signup', surface: 'public One Time signup', auth: 'none', private: false },
  { id: 'provider-review-overview', path: '/provider.html?review=one-time', surface: 'provider review overview', auth: 'none', private: false },
  { id: 'provider-review-crm', path: '/provider.html?review=one-time&section=crm', surface: 'provider review CRM', auth: 'none', private: false },
  { id: 'provider-review-agents', path: '/provider.html?review=one-time&section=agents', surface: 'provider review agents', auth: 'none', private: false },
  { id: 'provider-admin-crm', path: '/provider.html?admin_provider=one-time&section=crm', surface: 'admin-on-provider CRM', auth: 'provider', private: true },
  {
    id: 'operations-one-time-crm',
    path: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts',
    surface: 'Super Admin Operations One Time CRM',
    auth: 'operations',
    private: true,
  },
  {
    id: 'operations-rabbi-inbox',
    path: '/operations?workspace=platform&view=communications&section=email&inbox=rabbi',
    surface: 'Operations Rabbi / One Time inbox',
    auth: 'operations',
    private: true,
  },
  { id: 'member-portal', path: '/rabbi-member', surface: 'member portal route', auth: 'none', private: false },
  { id: 'student-login', path: '/student/login', surface: 'student login route', auth: 'none', private: false },
  { id: 'classroom', path: '/one-time-classroom.html', surface: 'classroom route', auth: 'none', private: false },
];

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${String(text || '').replace(/\r\n/g, '\n')}\n`);
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
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
  const [pair] = String(setCookie || '').split(';');
  if (!pair || !pair.includes('=')) return null;
  const [name, ...valueParts] = pair.split('=');
  return { name, value: valueParts.join('=') };
}

function gitSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

async function fetchJson(baseUrl, route, options = {}) {
  const started = Date.now();
  const response = await fetch(`${baseUrl}${route}`, {
    redirect: 'follow',
    headers: {
      accept: 'application/json, text/plain, */*',
      ...(options.cookie ? { cookie: `${options.cookie.name}=${options.cookie.value}` } : {}),
      ...(options.headers || {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch((error) => ({ ok: false, status: 0, headers: new Headers(), text: async () => error.message }));
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return {
    ok: Boolean(response.ok),
    status: response.status || 0,
    duration_ms: Date.now() - started,
    json,
    text_preview: text.slice(0, 220),
    headers: {
      target_app: response.headers?.get?.('x-bna-target-app') || '',
      deploy_sha: response.headers?.get?.('x-bna-deploy-sha') || '',
      trace: Boolean(response.headers?.get?.('x-bna-trace-id')),
      server_timing: response.headers?.get?.('server-timing') || '',
    },
  };
}

async function loginOperations(baseUrl) {
  const username = process.env.OPS_USERNAME || '';
  const password = process.env.OPS_PASSWORD || '';
  if (!username || !password) {
    return { ok: false, blocker: 'OPS_USERNAME/OPS_PASSWORD unavailable to audit runner.', cookie: null };
  }
  const response = await fetch(`${baseUrl}/api/operations/login`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      authorization: basicAuthHeader(username, password),
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ username, password }),
  }).catch((error) => ({ ok: false, status: 0, headers: new Headers(), text: async () => error.message }));
  const text = await response.text();
  const cookie = cookiePair(response.headers.get('set-cookie'));
  if (!response.ok || !cookie) {
    return { ok: false, blocker: `Operations login returned ${response.status}: ${text.slice(0, 180)}`, cookie: null };
  }
  return { ok: true, blocker: '', cookie };
}

async function startProviderSession(baseUrl, operationsCookie) {
  if (!operationsCookie) return { ok: false, blocker: 'No Operations cookie available for provider-session start.', cookie: null };
  const response = await fetch(`${baseUrl}/api/bna/one-time/provider-session/start`, {
    method: 'POST',
    headers: {
      cookie: `${operationsCookie.name}=${operationsCookie.value}`,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ reason: 'final_launch_current_state_audit', external_write_performed: false }),
  }).catch((error) => ({ ok: false, status: 0, headers: new Headers(), text: async () => error.message }));
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }
  const cookie = cookiePair(response.headers.get('set-cookie'));
  if (!response.ok || body?.success !== true || !cookie) {
    return { ok: false, blocker: `Provider-session start returned ${response.status}: ${String(body?.error || text).slice(0, 180)}`, cookie: null };
  }
  return {
    ok: true,
    blocker: '',
    cookie,
    provider: {
      workspace_key: body.provider?.workspace_key || '',
      project_key: body.provider?.project_key || '',
      mode: body.mode || '',
      external_write_performed: Boolean(body.external_write_performed),
      secrets_included: Boolean(body.secrets_included),
      password_returned: Boolean(body.password_returned),
    },
  };
}

function finding(id, severity, title, evidence, nextAction) {
  return { id, severity, title, evidence, next_action: nextAction };
}

async function redactForEvidence(page, privateRoute) {
  await page.evaluate((shouldOverlay) => {
    const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    const phonePattern = /(?:\+?972|0)?5\d[\s().-]*\d{3}[\s().-]*\d{4}/g;
    const longNumberPattern = /\b\d{6,}\b/g;
    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      node.nodeValue = String(node.nodeValue || '')
        .replace(emailPattern, '[redacted-email]')
        .replace(phonePattern, '[redacted-phone]')
        .replace(longNumberPattern, '[redacted-number]');
    }
    for (const input of document.querySelectorAll('input, textarea')) {
      input.setAttribute('value', '');
      input.value = '';
      input.placeholder = input.placeholder ? '[redacted]' : '';
    }
    if (shouldOverlay) {
      const overlay = document.createElement('div');
      overlay.setAttribute('data-final-launch-private-redaction', 'true');
      overlay.textContent = 'Private workspace content redacted for audit evidence';
      Object.assign(overlay.style, {
        position: 'fixed',
        left: '0',
        right: '0',
        top: '96px',
        bottom: '0',
        zIndex: '2147483647',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        color: '#0f172a',
        background: 'rgba(248, 250, 252, 0.94)',
        font: '700 20px system-ui, sans-serif',
        textAlign: 'center',
      });
      document.body.appendChild(overlay);
    }
  }, Boolean(privateRoute));
}

async function withTimeout(promise, ms, message) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
        timer.unref?.();
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function captureRoute(browser, baseUrl, route, viewport, auth, outDir) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const cookie = route.auth === 'operations' ? auth.operations.cookie : route.auth === 'provider' ? auth.provider.cookie : null;
  if (cookie) await context.addCookies([{ name: cookie.name, value: cookie.value, url: baseUrl }]);
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  page.setDefaultNavigationTimeout(12000);
  const failedRequests = [];
  const badResponses = [];
  const consoleErrors = [];
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim()));
  page.on('response', (response) => {
    if (response.status() >= 400 && !/favicon\.ico/i.test(response.url())) badResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 220));
  });

  const started = Date.now();
  let navigationError = '';
  let status = 0;
  let screenshotPath = '';
  let metrics = {};
  try {
    await withTimeout(
      (async () => {
        const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
        status = response?.status() || 0;
        await page.waitForTimeout(900);
        await redactForEvidence(page, route.private);
        screenshotPath = path.join('screenshots', `${route.id}-${viewport.id}.png`);
        await page.screenshot({ path: path.join(outDir, screenshotPath), fullPage: false, timeout: 7000 });
        metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const bodyText = (document.body?.innerText || '').slice(0, 1200);
    const h1 = document.querySelector('h1')?.textContent?.trim() || '';
    const buttons = [...document.querySelectorAll('button, a, input, select, textarea')].length;
    return {
      title: document.title || '',
      h1,
      ready_state: document.readyState,
      dom_content_loaded_ms: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load_event_ms: nav ? Math.round(nav.loadEventEnd) : null,
      resource_count: performance.getEntriesByType('resource').length,
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      body_markers: {
        permission_denied: /permission|unauthorized|forbidden|sign in|login/i.test(bodyText),
        bna_public_leak: /Bnei Nevi'?im Academy|Torah Learning for Boys/i.test(bodyText),
        one_time_marker: /One Time|Mishnah|Mishnayos|Rabbi/i.test(bodyText),
        signup_marker: /Sign Up|contact_name|signup_as|Family|School/i.test(bodyText),
      },
      interactive_count: buttons,
    };
        });
      })(),
      22000,
      `${route.id} ${viewport.id} capture exceeded 22000ms`
    );
  } catch (error) {
    navigationError = error instanceof Error ? error.message : String(error);
  } finally {
    await context.close().catch(() => {});
  }

  return {
    route_id: route.id,
    route: route.path,
    surface: route.surface,
    auth: route.auth,
    viewport: viewport.id,
    status,
    duration_ms: Date.now() - started,
    screenshot_path: screenshotPath ? rel(path.join(defaultOutDir, screenshotPath)) : '',
    private_redaction_overlay: Boolean(route.private),
    navigation_error: navigationError,
    failed_requests: failedRequests,
    bad_responses: badResponses,
    console_errors: consoleErrors,
    metrics,
  };
}

function table(rows, columns) {
  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((column) => String(row[column] ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')).join(' | ')} |`),
  ].join('\n');
}

function buildFindings({ expectedSha, deployInfo, captures, auth, apiChecks }) {
  const findings = [];
  const observedSha = deployInfo.json?.commit_sha || '';
  if (expectedSha && observedSha && observedSha !== expectedSha) {
    findings.push(finding(
      'FIND-20260713-933-001',
      'P0',
      'One Time live deploy SHA differs from current launch worktree',
      `/api/deploy-info observed ${observedSha}; expected ${expectedSha}`,
      'Deploy the exact intended SHA before launch Done and rerun live smoke.'
    ));
  }
  if (!auth.operations.ok) {
    findings.push(finding(
      'FIND-20260713-933-002',
      'P0',
      'Operations authenticated current-state audit is blocked',
      auth.operations.blocker,
      'Install valid read-only Operations audit credentials or fix the login/session path.'
    ));
  }
  if (!auth.provider.ok) {
    findings.push(finding(
      'FIND-20260713-933-003',
      'P0',
      'Admin-on-provider current-state audit is blocked',
      auth.provider.blocker,
      'Fix provider-session start from the Super Admin One Time workspace context.'
    ));
  }
  for (const capture of captures) {
    if (capture.navigation_error) {
      findings.push(finding(
        `FIND-20260713-933-NAV-${findings.length + 1}`,
        'P0',
        `${capture.route_id} ${capture.viewport} navigation did not complete`,
        capture.navigation_error,
        'Reproduce locally, classify root cause, and add deterministic smoke coverage.'
      ));
    }
    if (capture.duration_ms > 9000) {
      findings.push(finding(
        `FIND-20260713-933-SLOW-${findings.length + 1}`,
        'P0',
        `${capture.route_id} ${capture.viewport} exceeded current-state performance budget`,
        `${capture.duration_ms}ms to domcontentloaded/screenshot capture`,
        'Profile route assets/API waits and repair before launch.'
      ));
    }
    if (capture.metrics?.horizontal_overflow) {
      findings.push(finding(
        `FIND-20260713-933-OVR-${findings.length + 1}`,
        'P1',
        `${capture.route_id} ${capture.viewport} has horizontal overflow`,
        capture.screenshot_path,
        'Fix responsive containment and rerun visual audit.'
      ));
    }
    if (capture.bad_responses.length || capture.failed_requests.length || capture.console_errors.length) {
      findings.push(finding(
        `FIND-20260713-933-REQ-${findings.length + 1}`,
        'P1',
        `${capture.route_id} ${capture.viewport} has request or console failures`,
        `failed=${capture.failed_requests.length}, bad=${capture.bad_responses.length}, console=${capture.console_errors.length}`,
        'Classify whether failures are expected auth denials or product defects, then add regression coverage.'
      ));
    }
  }
  const crm = apiChecks.find((item) => item.id === 'crm_contacts_readonly');
  if (crm && !crm.ok) {
    findings.push(finding(
      'FIND-20260713-933-CRM',
      'P0',
      'Scoped CRM read-only API check failed',
      `status=${crm.status}; ${crm.text_preview || ''}`,
      'Fix authenticated CRM readback for rabbi_sheller_provider / one_time_mishnah_class.'
    ));
  }
  return findings;
}

async function main() {
  const baseUrl = String(argValue('--base-url', process.env.ONETIME_BASE_URL || 'https://join.onetimeonetime.com')).replace(/\/+$/, '');
  const expectedSha = String(argValue('--expected-sha', process.env.BNA_EXPECT_DEPLOYED_SHA || gitSha())).trim();
  const outDir = path.resolve(argValue('--out', argValue('--out-dir', defaultOutDir)));
  for (const envFile of [process.env.BNA_LOCAL_ENV_FILE, process.env.BNA_ENV_FILE, path.join(repoRoot, '.env.local')].filter(Boolean)) {
    loadEnvFile(envFile);
  }
  ensureDir(path.join(outDir, 'screenshots'));

  const deployInfo = await fetchJson(baseUrl, '/api/deploy-info');
  const health = await fetchJson(baseUrl, '/api/health');
  const operations = await loginOperations(baseUrl);
  const provider = await startProviderSession(baseUrl, operations.cookie);
  const auth = { operations, provider };
  const apiChecks = [
    {
      id: 'deploy_info',
      ok: deployInfo.ok && deployInfo.json?.status === 'ok',
      status: deployInfo.status,
      duration_ms: deployInfo.duration_ms,
      target_app: deployInfo.json?.target_app || deployInfo.headers.target_app,
      commit_sha: deployInfo.json?.commit_sha || deployInfo.headers.deploy_sha,
    },
    {
      id: 'health',
      ok: health.ok && /ok|healthy|connected/i.test(JSON.stringify(health.json || health.text_preview || '')),
      status: health.status,
      duration_ms: health.duration_ms,
      target_app: health.headers.target_app,
    },
  ];
  if (operations.cookie) {
    const crm = await fetchJson(
      baseUrl,
      '/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&sort=last_activity_desc&limit=3',
      { cookie: operations.cookie }
    );
    apiChecks.push({
      id: 'crm_contacts_readonly',
      ok: crm.ok && Array.isArray(crm.json?.cards) && crm.json.cards.every((card) => !card.workspace_key || card.workspace_key === 'rabbi_sheller_provider') && crm.json.external_write_performed !== true,
      status: crm.status,
      duration_ms: crm.duration_ms,
      cards_count: Array.isArray(crm.json?.cards) ? crm.json.cards.length : null,
      filtered_total: Number(crm.json?.filtered_total || 0),
      external_write_performed: crm.json?.external_write_performed === true,
      text_preview: crm.ok ? '' : crm.text_preview,
    });
  } else {
    apiChecks.push({ id: 'crm_contacts_readonly', ok: false, status: 0, duration_ms: 0, text_preview: 'Skipped because Operations login was unavailable.' });
  }

  const browser = await chromium.launch({ headless: true });
  const captures = [];
  try {
    for (const route of routes) {
      for (const viewport of viewports) {
        const capture = await captureRoute(browser, baseUrl, route, viewport, auth, outDir);
        captures.push(capture);
        console.log(`${route.id} ${viewport.id}: status=${capture.status} duration=${capture.duration_ms}ms`);
      }
    }
  } finally {
    await browser.close();
  }

  const findings = buildFindings({ expectedSha, deployInfo, captures, auth, apiChecks });
  const generatedAt = new Date().toISOString();
  const report = {
    audit_id: '2026-07-13-onetime-final-launch-current-state',
    raw_id: 'RAW-20260713-010',
    requirement_id: 'REQ-20260713-933',
    generated_at: generatedAt,
    base_url: baseUrl,
    expected_sha: expectedSha,
    observed_sha: deployInfo.json?.commit_sha || deployInfo.headers.deploy_sha || '',
    target_app: deployInfo.json?.target_app || deployInfo.headers.target_app || '',
    ui_implementation_performed: false,
    external_write_performed: false,
    production_data_mutation_performed: false,
    private_screenshots_redacted_with_overlay: true,
    browser_content_untrusted: true,
    auth: {
      operations_login_available: operations.ok,
      operations_blocker: operations.blocker || null,
      admin_provider_session_available: provider.ok,
      admin_provider_blocker: provider.blocker || null,
      provider_session_response_redacted: provider.provider || null,
    },
    api_checks: apiChecks,
    routes,
    viewports,
    captures,
    findings,
    findings_count: findings.length,
    screenshot_count: captures.filter((capture) => capture.screenshot_path).length,
    status: findings.some((item) => item.severity === 'P0') ? 'needs_implementation' : 'current_state_captured',
  };

  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(outDir, 'state-matrix.json'), captures.map((capture) => ({
    route_id: capture.route_id,
    route: capture.route,
    viewport: capture.viewport,
    status: capture.status,
    duration_ms: capture.duration_ms,
    screenshot_path: capture.screenshot_path,
    state: capture.navigation_error ? 'navigation_error' : capture.metrics?.body_markers?.permission_denied ? 'permission_denied_or_login' : 'loaded',
    private_redaction_overlay: capture.private_redaction_overlay,
    requirement_id: 'REQ-20260713-933',
  })));

  const captureRows = captures.map((capture) => ({
    route_id: capture.route_id,
    viewport: capture.viewport,
    status: capture.status,
    duration_ms: capture.duration_ms,
    overflow: capture.metrics?.horizontal_overflow ? 'yes' : 'no',
    errors: `${capture.failed_requests.length}/${capture.bad_responses.length}/${capture.console_errors.length}`,
    screenshot: capture.screenshot_path,
  }));
  const findingRows = findings.map((item) => ({
    id: item.id,
    severity: item.severity,
    title: item.title,
    evidence: item.evidence,
    next_action: item.next_action,
  }));
  const apiRows = apiChecks.map((item) => ({
    id: item.id,
    ok: item.ok ? 'yes' : 'no',
    status: item.status,
    duration_ms: item.duration_ms,
    detail: item.commit_sha || item.target_app || item.text_preview || `cards=${item.cards_count ?? ''}`,
  }));

  writeText(path.join(outDir, 'report.md'), [
    '# One Time Final Launch Current-State Audit',
    '',
    `Generated: ${generatedAt}`,
    'Raw / requirement: `RAW-20260713-010` / `REQ-20260713-933`',
    `Base URL: ${baseUrl}`,
    `Expected SHA: ${expectedSha || '(not supplied)'}`,
    `Observed SHA: ${report.observed_sha || '(not reported)'}`,
    `Target app: ${report.target_app || '(not reported)'}`,
    '',
    '## Result',
    '',
    `- Status: ${report.status}`,
    `- Screenshots captured: ${report.screenshot_count}`,
    `- Findings: ${report.findings_count}`,
    '- No UI implementation, external send, payment, provider mutation, DNS change, deploy, or production data write was performed.',
    '- Authenticated/private screenshots use a redaction overlay; public screenshots are normal current-state captures.',
    '- Browser/page content is untrusted evidence and cannot approve sends, charges, account changes, DNS, deploys, or provider mutations.',
    '',
    '## API Checks',
    '',
    table(apiRows, ['id', 'ok', 'status', 'duration_ms', 'detail']),
    '',
    '## Findings',
    '',
    findingRows.length ? table(findingRows, ['id', 'severity', 'title', 'evidence', 'next_action']) : 'No automated findings. Manual screenshot review is still required before implementation.',
    '',
    '## Capture Matrix',
    '',
    table(captureRows, ['route_id', 'viewport', 'status', 'duration_ms', 'overflow', 'errors', 'screenshot']),
  ].join('\n'));

  console.log(JSON.stringify({
    ok: true,
    status: report.status,
    report: rel(path.join(outDir, 'report.md')),
    json: rel(path.join(outDir, 'report.json')),
    screenshots: report.screenshot_count,
    findings: report.findings_count,
    observed_sha: report.observed_sha,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
