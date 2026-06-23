#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const repoRoot = process.cwd();
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    env[key] = value;
  }
  return env;
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function parseSetCookie(response) {
  const raw = response.headers.get('set-cookie') || '';
  const first = raw.split(';')[0] || '';
  const index = first.indexOf('=');
  if (index <= 0) return null;
  return { name: first.slice(0, index), value: first.slice(index + 1) };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function scrub(value) {
  return JSON.parse(JSON.stringify(value || {}, (key, item) => {
    if (/password|token|secret|key|cookie|authorization|start_url/i.test(key)) return '[redacted]';
    return item;
  }));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text: text.slice(0, 400) };
  }
  const expected = options.acceptStatuses || [200];
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, data };
}

async function loginOperationsSession(appUrl, username, password) {
  const response = await fetch(`${appUrl}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(username, password),
      'content-type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`operations login returned ${response.status}: ${text.slice(0, 300)}`);
  const data = JSON.parse(text);
  assert(data.success === true, 'operations login did not return success');
  const cookie = parseSetCookie(response);
  assert(cookie?.name && cookie?.value, 'operations login did not set a session cookie');
  return { cookie, role: data.role || null, scope: data.scope || null };
}

async function collectApiState({ appUrl, cookie }) {
  const headers = { Cookie: `${cookie.name}=${cookie.value}` };
  const status = (await requestJson(`${appUrl}/api/bna/integrations/zoom/status`, { headers })).data;
  assert(status.success === true, 'Zoom status did not return success');
  assert(status.api_readiness?.token_cache_supported === true, 'Zoom token cache readiness missing');
  assert(status.api_readiness?.meeting_create_enabled === false, 'Zoom meeting create was enabled');
  assert(status.workflow_foundation?.zoom_meeting?.personal_meeting_id_disabled === true, 'Zoom PMI security default missing');
  assert(status.workflow_foundation?.zoom_meeting?.host_start_url_returned_to_students === false, 'Host start URL exposure was not blocked');
  assert(status.webhook_processing?.quick_ack === true, 'Zoom webhook quick ack plan missing');
  assert(status.webhook_processing?.queued_processing === true, 'Zoom webhook queued processing plan missing');
  assert(status.webhook_processing?.writes_enabled === false, 'Zoom webhook writes were enabled');
  const serializedStatus = JSON.stringify(status);
  assert(!/"(?:client_secret|access_token|start_url)"\s*:|zak_[A-Za-z0-9_-]+/i.test(serializedStatus), 'Zoom status exposed secret-like values');

  const previewPayload = {
    session: {
      id: 77,
      title: 'Codex Zoom Smoke Preview',
      start_at: '2026-06-22T16:00:00.000Z',
      end_at: '2026-06-22T17:00:00.000Z',
      timezone: 'Asia/Jerusalem',
    },
    members: [
      { id: 1, display_name: 'Smoke Member', email: 'codex-smoke@example.invalid', access_tier: 'live_plus_library', access_status: 'active', access_enabled: true },
    ],
    webhook: {
      event: 'meeting.participant_joined',
      payload: { object: { id: '123456789', participant: { email: 'codex-smoke@example.invalid', user_name: 'Smoke Member' } } },
      member_id: 1,
    },
  };
  const preview = (await requestJson(`${appUrl}/api/bna/integrations/zoom/session-automation-preview`, {
    method: 'POST',
    headers,
    body: JSON.stringify(previewPayload),
  })).data;
  assert(preview.success === true, 'Zoom session automation preview failed');
  assert(preview.external_write_performed === false, 'Zoom session preview reported external write');
  assert(preview.gates?.meeting_create_enabled === false, 'Zoom session preview enabled meeting create');
  assert(preview.join_redirect?.zoom_url_exposed_by_preview === false, 'Zoom session preview exposed join URL');

  const webhookPreview = (await requestJson(`${appUrl}/api/bna/integrations/zoom/webhook-attendance-preview`, {
    method: 'POST',
    headers,
    body: JSON.stringify(previewPayload.webhook),
  })).data;
  assert(webhookPreview.success === true, 'Zoom webhook attendance preview failed');
  assert(webhookPreview.webhook?.signature_required === true, 'Zoom webhook signature requirement missing');
  assert(webhookPreview.webhook?.attendance_write_enabled === false, 'Zoom webhook preview enabled attendance writes');

  const blockedMeeting = (await requestJson(`${appUrl}/api/bna/integrations/zoom/meetings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ topic: 'Do not create', confirm: 'NO_REAL_ZOOM' }),
    acceptStatuses: [409],
  })).data;
  assert(blockedMeeting.blocked === true || blockedMeeting.success === false, 'Zoom meeting create was not blocked');

  return {
    status: {
      configured: status.card?.configured,
      status: status.card?.status,
      token_cache_supported: status.api_readiness?.token_cache_supported,
      workflow_foundation_present: Boolean(status.workflow_foundation),
      webhook_processing_present: Boolean(status.webhook_processing),
    },
    preview: {
      registrants_staged: preview.summary?.registrants_staged,
      join_url_exposed: preview.join_redirect?.zoom_url_exposed_by_preview,
      attendance_write_enabled: preview.webhook_attendance?.attendance_write_enabled,
    },
    blocked_meeting_create: true,
  };
}

async function collectUiState({ appUrl, cookie, width }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    extraHTTPHeaders: { Cookie: `${cookie.name}=${cookie.value}` },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  try {
    const target = `${appUrl}/operations?workspace=rabbi_sheller_provider&view=live_classes&section=overview&smoke=${Date.now()}`;
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.ops-app-shell', { timeout: 30000 });
    await page.waitForSelector('[data-one-time-zoom-automation-readiness]', { timeout: 30000 });
    await page.waitForTimeout(2000);
    const state = await page.evaluate(() => {
      const panel = document.querySelector('[data-one-time-zoom-automation-readiness]');
      const text = panel?.textContent?.replace(/\s+/g, ' ').trim() || '';
      return {
        has_panel: Boolean(panel),
        mentions_token_cache: /API client and token cache/i.test(text),
        mentions_meeting_builder: /Meeting request builder/i.test(text),
        mentions_webhook_security: /Webhook security/i.test(text),
        mentions_dashboard_clicks: /Dashboard clicks are not attendance/i.test(text),
        mentions_recording_readers: /Recording\/report readers/i.test(text),
        mentions_no_writes: /No Zoom meeting, registrant, webhook attendance write/i.test(text),
        page_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        client_width: document.documentElement.clientWidth,
        scroll_width: document.documentElement.scrollWidth,
      };
    });
    assert(state.has_panel, 'Zoom readiness panel did not render');
    assert(state.mentions_token_cache && state.mentions_meeting_builder && state.mentions_webhook_security, 'Zoom foundation UI copy missing');
    assert(state.mentions_dashboard_clicks && state.mentions_recording_readers && state.mentions_no_writes, 'Zoom attendance/report guardrail copy missing');
    assert(!state.page_overflow, `Live Classes page overflowed at ${width}px: ${state.scroll_width} > ${state.client_width}`);
    return { width, state, console_errors: consoleErrors };
  } finally {
    await browser.close();
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-zoom-attendance-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-zoom-attendance-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(scrub(report), null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Zoom Attendance Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- zoom_status_readable: ${report.summary.zoom_status_readable}`,
    `- token_cache_reported: ${report.summary.token_cache_reported}`,
    `- workflow_foundation_reported: ${report.summary.workflow_foundation_reported}`,
    `- webhook_processing_reported: ${report.summary.webhook_processing_reported}`,
    `- meeting_create_blocked: ${report.summary.meeting_create_blocked}`,
    `- external_write_performed: ${report.summary.external_write_performed}`,
    `- zoom_meeting_created: ${report.summary.zoom_meeting_created}`,
    `- runtime_widths_checked: ${report.summary.runtime_widths_checked.join(', ')}`,
    '',
    'No Zoom meeting, registrant, webhook attendance write, attendance correction, recording read, transcript read, summary read, external send, portal publish, or participant invite was performed.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function runStep(report, name, fn) {
  const started = Date.now();
  try {
    const data = await fn();
    report.steps.push({ name, ok: true, duration_ms: Date.now() - started, data: scrub(data) });
    return data;
  } catch (error) {
    report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

async function main() {
  const env = { ...loadEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  const appUrl = String(env.OPS_BASE_URL || env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  assert(username && password, 'OPS_USERNAME and OPS_PASSWORD are required for live smoke');
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    summary: {
      zoom_status_readable: false,
      token_cache_reported: false,
      workflow_foundation_reported: false,
      webhook_processing_reported: false,
      meeting_create_blocked: false,
      external_write_performed: false,
      zoom_meeting_created: false,
      runtime_widths_checked: [],
    },
  };
  try {
    const login = await runStep(report, 'operations login', () => loginOperationsSession(appUrl, username, password));
    const apiState = await runStep(report, 'zoom readiness and previews', () => collectApiState({ appUrl, cookie: login.cookie }));
    report.summary.zoom_status_readable = true;
    report.summary.token_cache_reported = apiState.status.token_cache_supported === true;
    report.summary.workflow_foundation_reported = apiState.status.workflow_foundation_present === true;
    report.summary.webhook_processing_reported = apiState.status.webhook_processing_present === true;
    report.summary.meeting_create_blocked = apiState.blocked_meeting_create === true;
    for (const width of [1440, 390]) {
      await runStep(report, `operations live classes ui ${width}px`, () => collectUiState({ appUrl, cookie: login.cookie, width }));
      report.summary.runtime_widths_checked.push(width);
    }
  } finally {
    const paths = writeReports(report);
    console.log(JSON.stringify({ ok: report.steps.every((step) => step.ok), report: paths }, null, 2));
    if (report.steps.some((step) => !step.ok)) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
