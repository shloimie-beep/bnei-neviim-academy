#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const defaultOutDir = path.join(repoRoot, 'ops', 'ui-audits', '2026-07-13-onetime-auth-admin-context-live');

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function cookieHeader(cookie) {
  return cookie?.name && cookie?.value ? `${cookie.name}=${cookie.value}` : '';
}

function parseCookiePair(setCookie = '') {
  const pair = String(setCookie || '').split(';')[0] || '';
  const index = pair.indexOf('=');
  if (index <= 0) return null;
  return { name: pair.slice(0, index), value: pair.slice(index + 1) };
}

async function fetchJson(baseUrl, route, { cookie, method = 'GET', body } = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie: cookieHeader(cookie) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  return {
    status: response.status,
    ok: response.ok,
    json,
    text_preview: text.slice(0, 180),
    set_cookie: response.headers.get('set-cookie') || '',
    headers: {
      target_app: response.headers.get('x-bna-target-app') || '',
      deploy_sha: response.headers.get('x-bna-deploy-sha') || '',
    },
  };
}

function safeProviderView(data = {}) {
  const provider = data.provider || {};
  const scope = data.scope || {};
  return {
    provider_name: provider.provider_name || data.provider_name || '',
    login_username: provider.login_username || data.login_username || '',
    workspace_key: provider.workspace_key || scope.workspace_key || data.workspace_key || '',
    project_key: provider.project_key || scope.project_key || data.project_key || '',
    status: provider.status || data.status || '',
  };
}

function check(checks, id, passed, detail = {}) {
  checks.push({ id, passed: Boolean(passed), detail });
}

async function redactPrivatePage(page) {
  await page.evaluate(() => {
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
    const overlay = document.createElement('div');
    overlay.textContent = 'Private One Time workspace content redacted for launch evidence';
    overlay.setAttribute('data-auth-context-private-redaction', 'true');
    Object.assign(overlay.style, {
      position: 'fixed',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: '2147483647',
      padding: '10px 14px',
      background: 'rgba(15, 23, 42, 0.92)',
      color: 'white',
      font: '700 13px system-ui, sans-serif',
      textAlign: 'center',
    });
    document.body.appendChild(overlay);
  });
}

async function captureRoute({
  browser,
  baseUrl,
  id,
  route,
  viewport,
  outDir,
  cookies = [],
  privateRoute = false,
  expectSelector = '',
}) {
  const context = await browser.newContext({ viewport });
  if (cookies.length) await context.addCookies(cookies.map((cookie) => ({ ...cookie, url: baseUrl })));
  const page = await context.newPage();
  const failedRequests = [];
  const badResponses = [];
  const consoleErrors = [];
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`.trim());
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !/favicon\.ico/i.test(response.url())) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 220));
  });

  let status = 0;
  let navigationError = '';
  let screenshot = '';
  let state = {};
  try {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    status = response?.status() || 0;
    if (expectSelector) await page.waitForSelector(expectSelector, { timeout: 15000 });
    await page.waitForTimeout(400);
    state = await page.evaluate(() => ({
      url: `${location.pathname}${location.search}`,
      title: document.title || '',
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      login_panel_visible: Boolean(document.querySelector('#loginPanel:not(.hidden)')),
      portal_panel_visible: Boolean(document.querySelector('#portalPanel:not(.hidden), #portalLayout:not(.hidden)')),
      crm_shell_visible: Boolean(document.querySelector('[data-one-time-provider-crm-shell]')),
      student_login_form_visible: Boolean(document.querySelector('#studentLoginForm')),
      horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      body_class: document.body?.className || '',
      text_preview: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 260),
    }));
    if (privateRoute) await redactPrivatePage(page);
    screenshot = path.join(outDir, `${id}.png`);
    await page.screenshot({ path: screenshot, fullPage: false, timeout: 10000 });
  } catch (error) {
    navigationError = error instanceof Error ? error.message : String(error);
  } finally {
    await context.close().catch(() => {});
  }

  return {
    id,
    route,
    viewport,
    status,
    navigation_error: navigationError,
    screenshot_path: screenshot ? rel(screenshot) : '',
    private_redaction_overlay: privateRoute,
    failed_requests: failedRequests,
    bad_responses: badResponses,
    console_errors: consoleErrors,
    state,
  };
}

function markdownTable(rows, columns) {
  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((column) => String(row[column] ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')).join(' | ')} |`),
  ].join('\n');
}

async function main() {
  const baseUrl = normalizeBaseUrl(argValue('--base-url', process.env.ONETIME_BASE_URL || 'https://join.onetimeonetime.com'));
  const expectedSha = String(argValue('--expected-sha', process.env.BNA_EXPECT_DEPLOYED_SHA || '')).trim();
  const outDir = path.resolve(argValue('--out', argValue('--out-dir', defaultOutDir)));
  await mkdir(outDir, { recursive: true });

  const env = loadSmokeEnv({ root: repoRoot });
  const oneTimeRailwayEnv = {
    ...env,
    OPS_USERNAME: '',
    OPS_PASSWORD: '',
    BNA_SMOKE_RAILWAY_PROJECT_ID: env.BNA_SMOKE_RAILWAY_PROJECT_ID || 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
    BNA_SMOKE_RAILWAY_SERVICE: env.BNA_SMOKE_RAILWAY_SERVICE || 'one-time-web',
    BNA_SMOKE_RAILWAY_ENVIRONMENT: env.BNA_SMOKE_RAILWAY_ENVIRONMENT || 'production',
  };

  const generatedAt = new Date().toISOString();
  const checks = [];
  const deployInfo = await fetchJson(baseUrl, '/api/deploy-info');
  check(checks, 'deploy_info_ok', deployInfo.ok && deployInfo.json?.status === 'ok', {
    status: deployInfo.status,
    target_app: deployInfo.json?.target_app || deployInfo.headers.target_app,
    commit_sha: deployInfo.json?.commit_sha || deployInfo.headers.deploy_sha,
  });
  if (expectedSha) {
    check(checks, 'deploy_info_exact_sha', deployInfo.json?.commit_sha === expectedSha, {
      expected_sha: expectedSha,
      actual_sha: deployInfo.json?.commit_sha || '',
    });
  }
  check(checks, 'deploy_info_one_time_target', deployInfo.json?.target_app === 'one-time', {
    target_app: deployInfo.json?.target_app || deployInfo.headers.target_app,
  });

  const operationsLogin = await loginOperations({ baseUrl, env: oneTimeRailwayEnv, cwd: repoRoot });
  check(checks, 'operations_login_railway_auth', operationsLogin.cookie?.name === 'bna_ops_session', {
    source: operationsLogin.source,
    role: operationsLogin.role || operationsLogin.user?.role || '',
    cookie_name: operationsLogin.cookie?.name || '',
  });

  const providerStart = await fetchJson(baseUrl, '/api/bna/one-time/provider-session/start', {
    method: 'POST',
    cookie: operationsLogin.cookie,
    body: { reason: 'REQ-20260713-934B-live-redacted-proof', external_write_performed: false },
  });
  const providerCookie = parseCookiePair(providerStart.set_cookie);
  const providerStartView = safeProviderView(providerStart.json || {});
  check(checks, 'provider_session_start_scoped', providerStart.status === 200
    && providerStart.json?.success === true
    && providerCookie?.name === 'bna_provider_session'
    && providerStartView.workspace_key === 'rabbi_sheller_provider'
    && providerStartView.project_key === 'one_time_mishnah_class'
    && providerStart.json?.password_returned !== true
    && providerStart.json?.secrets_included !== true
    && providerStart.json?.external_write_performed !== true, {
    status: providerStart.status,
    mode: providerStart.json?.mode || '',
    view_url: providerStart.json?.view_url || '',
    provider: providerStartView,
    provider_cookie_name: providerCookie?.name || '',
    password_returned: Boolean(providerStart.json?.password_returned),
    secrets_included: Boolean(providerStart.json?.secrets_included),
    external_write_performed: Boolean(providerStart.json?.external_write_performed),
  });

  const providerSession = await fetchJson(baseUrl, '/api/provider-portal/session', { cookie: providerCookie });
  const providerSessionView = safeProviderView(providerSession.json || {});
  check(checks, 'provider_session_readback_scoped', providerSession.status === 200
    && providerSessionView.project_key === 'one_time_mishnah_class'
    && providerSession.json?.external_write_performed !== true, {
    status: providerSession.status,
    provider: providerSessionView,
    external_write_performed: Boolean(providerSession.json?.external_write_performed),
  });

  const crmContacts = await fetchJson(
    baseUrl,
    '/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&sort=last_activity_desc&limit=3',
    { cookie: operationsLogin.cookie },
  );
  const cards = Array.isArray(crmContacts.json?.cards) ? crmContacts.json.cards : [];
  check(checks, 'operations_crm_contacts_readonly_scoped', crmContacts.status === 200
    && Array.isArray(crmContacts.json?.cards)
    && cards.every((card) => !card.workspace_key || card.workspace_key === 'rabbi_sheller_provider')
    && cards.every((card) => !card.project_key || card.project_key === 'one_time_mishnah_class')
    && crmContacts.json?.external_write_performed !== true
    && crmContacts.json?.no_send !== false, {
    status: crmContacts.status,
    cards_count: cards.length,
    filtered_total: Number(crmContacts.json?.filtered_total || cards.length || 0),
    external_write_performed: Boolean(crmContacts.json?.external_write_performed),
    no_send: crmContacts.json?.no_send !== false,
  });

  const studentSessionWithoutCookie = await fetchJson(baseUrl, '/api/student-portal/session');
  check(checks, 'student_session_denial_classified_expected', studentSessionWithoutCookie.status === 401
    && /Student session is required/i.test(studentSessionWithoutCookie.json?.error || studentSessionWithoutCookie.text_preview), {
    status: studentSessionWithoutCookie.status,
    body_preview: studentSessionWithoutCookie.text_preview,
  });

  const browser = await chromium.launch({ headless: true });
  const captures = [];
  try {
    captures.push(await captureRoute({
      browser,
      baseUrl,
      id: 'provider-admin-crm-redacted',
      route: '/provider.html?admin_provider=one-time&section=crm',
      viewport: { width: 1280, height: 900 },
      outDir,
      cookies: [providerCookie],
      privateRoute: true,
      expectSelector: '[data-one-time-provider-crm-shell]',
    }));
    captures.push(await captureRoute({
      browser,
      baseUrl,
      id: 'student-login',
      route: '/student/login',
      viewport: { width: 430, height: 932 },
      outDir,
      expectSelector: '#studentLoginForm',
    }));
  } finally {
    await browser.close();
  }

  const providerCapture = captures.find((capture) => capture.id === 'provider-admin-crm-redacted') || {};
  const studentCapture = captures.find((capture) => capture.id === 'student-login') || {};
  check(checks, 'provider_admin_crm_route_clean', providerCapture.status === 200
    && !providerCapture.navigation_error
    && providerCapture.state?.crm_shell_visible === true
    && providerCapture.state?.horizontal_overflow === false
    && !providerCapture.failed_requests?.length
    && !providerCapture.bad_responses?.length
    && !providerCapture.console_errors?.length, {
    status: providerCapture.status,
    failed: providerCapture.failed_requests?.length || 0,
    bad: providerCapture.bad_responses?.length || 0,
    console: providerCapture.console_errors?.length || 0,
    screenshot: providerCapture.screenshot_path,
  });
  check(checks, 'student_login_route_clean_without_session_probe', studentCapture.status === 200
    && !studentCapture.navigation_error
    && studentCapture.state?.student_login_form_visible === true
    && studentCapture.state?.horizontal_overflow === false
    && !studentCapture.failed_requests?.length
    && !studentCapture.bad_responses?.length
    && !studentCapture.console_errors?.length, {
    status: studentCapture.status,
    failed: studentCapture.failed_requests?.length || 0,
    bad: studentCapture.bad_responses?.length || 0,
    console: studentCapture.console_errors?.length || 0,
    screenshot: studentCapture.screenshot_path,
  });

  const report = {
    status: checks.every((item) => item.passed) ? 'PASS' : 'FAIL',
    generated_at: generatedAt,
    base_url: baseUrl,
    expected_sha: expectedSha || null,
    deployed_sha: deployInfo.json?.commit_sha || deployInfo.headers.deploy_sha || null,
    target_app: deployInfo.json?.target_app || deployInfo.headers.target_app || null,
    raw_id: 'RAW-20260713-010',
    requirement_ids: ['REQ-20260713-934B', 'REQ-20260713-934C'],
    scope: 'Read-only live proof for One Time Operations auth, admin-on-provider session context, scoped CRM readback, and provider/student console/request cleanliness.',
    guardrails: [
      'No email, WhatsApp, payment, access grant, provider mutation, DNS change, or production data write was attempted.',
      'Private provider screenshot is DOM-redacted and includes a redaction overlay.',
      'Direct unauthenticated student session 401 is recorded only as expected API policy; /student/login must not emit it during first paint.',
    ],
    checks,
    api: {
      operations_login: {
        source: operationsLogin.source,
        role: operationsLogin.role || operationsLogin.user?.role || '',
        cookie_name: operationsLogin.cookie?.name || '',
      },
      provider_start: {
        status: providerStart.status,
        mode: providerStart.json?.mode || '',
        view_url: providerStart.json?.view_url || '',
        provider: providerStartView,
        provider_cookie_name: providerCookie?.name || '',
        password_returned: Boolean(providerStart.json?.password_returned),
        secrets_included: Boolean(providerStart.json?.secrets_included),
        external_write_performed: Boolean(providerStart.json?.external_write_performed),
      },
      provider_session: {
        status: providerSession.status,
        provider: providerSessionView,
        external_write_performed: Boolean(providerSession.json?.external_write_performed),
      },
      crm_contacts: {
        status: crmContacts.status,
        cards_count: cards.length,
        filtered_total: Number(crmContacts.json?.filtered_total || cards.length || 0),
        external_write_performed: Boolean(crmContacts.json?.external_write_performed),
        no_send: crmContacts.json?.no_send !== false,
      },
      student_session_without_cookie: {
        status: studentSessionWithoutCookie.status,
        error: studentSessionWithoutCookie.json?.error || '',
        classified_expected_auth_denial: true,
      },
    },
    captures,
    external_write_performed: false,
    production_data_mutation_performed: false,
  };

  const jsonPath = path.join(outDir, 'report.json');
  const mdPath = path.join(outDir, 'report.md');
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(mdPath, [
    '# One Time Auth/Admin Context Live Smoke',
    '',
    `Status: ${report.status}`,
    `Generated: ${report.generated_at}`,
    `Base URL: ${report.base_url}`,
    `Expected SHA: ${report.expected_sha || '(not supplied)'}`,
    `Deployed SHA: ${report.deployed_sha || '(unknown)'}`,
    `Target app: ${report.target_app || '(unknown)'}`,
    '',
    report.scope,
    '',
    '## Guardrails',
    '',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
    '## Checks',
    '',
    markdownTable(checks.map((item) => ({
      check: item.id,
      status: item.passed ? 'PASS' : 'FAIL',
      detail: JSON.stringify(item.detail),
    })), ['check', 'status', 'detail']),
    '',
    '## Browser Captures',
    '',
    markdownTable(captures.map((capture) => ({
      route: capture.route,
      status: capture.status,
      state: capture.navigation_error ? 'navigation_error' : 'loaded',
      failed_bad_console: `${capture.failed_requests.length}/${capture.bad_responses.length}/${capture.console_errors.length}`,
      overflow: capture.state?.horizontal_overflow ? 'yes' : 'no',
      screenshot: capture.screenshot_path,
    })), ['route', 'status', 'state', 'failed_bad_console', 'overflow', 'screenshot']),
    '',
    'No external send or production mutation was attempted.',
    '',
  ].join('\n'));

  console.log(JSON.stringify({
    ok: report.status === 'PASS',
    report: rel(mdPath),
    json: rel(jsonPath),
    screenshots: captures.map((capture) => capture.screenshot_path),
    deployed_sha: report.deployed_sha,
    target_app: report.target_app,
  }, null, 2));

  if (report.status !== 'PASS') process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
