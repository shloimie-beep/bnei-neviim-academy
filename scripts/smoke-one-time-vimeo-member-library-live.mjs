#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const repoRoot = process.cwd();
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');
const APPROVAL_FLAG = 'APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING';

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
    if (/password|token|secret|key|cookie|authorization/i.test(key)) return '[redacted]';
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

function assertNoSecretLikeValues(value, label) {
  const serialized = JSON.stringify(value || {});
  assert(!/"(?:vimeoToken|vimeoClientSecret|access_token|client_secret)"\s*:|Bearer\s+[A-Za-z0-9._-]{12,}/i.test(serialized), `${label} exposed secret-like values`);
}

async function collectApiState({ appUrl, cookie, startedAt }) {
  const headers = { Cookie: `${cookie.name}=${cookie.value}` };
  const status = (await requestJson(`${appUrl}/api/bna/integrations/video-hosting/status`, { headers })).data;
  assert(status.success === true, 'video-hosting status failed');
  assert(status.card?.selectedProviderDecision === 'vimeo', 'Vimeo was not recorded as selected provider');
  assert(status.card?.manualFallback?.ready === true, 'manual Vimeo fallback was not ready');
  assert(status.card?.automatedUpload?.feature_flag_enabled === false, 'automated upload feature flag was enabled');
  assert(status.card?.automatedUpload?.api_upload_enabled === false, 'automated upload API was enabled');
  assert(status.recording_pipeline?.automated_upload_readiness?.api_upload_enabled === false, 'recording pipeline enabled API upload');
  assert(status.recording_pipeline?.publication_lifecycle?.states?.some((state) => state.state === 'member_library_publication'), 'publication lifecycle missing member-library state');
  assertNoSecretLikeValues(status, 'video-hosting status');

  const classPayload = {
    title: `Codex Vimeo Smoke ${startedAt}`,
    class_date: new Date().toISOString().slice(0, 10),
    media_provider: 'vimeo',
    media_url: 'https://vimeo.com/123456789',
    masechta: 'Smoke',
    perek: '1',
    mishnah_range: '1-2',
    duration_seconds: 1800,
    thumbnail_url: 'https://example.com/one-time-vimeo-smoke-thumbnail.jpg',
    transcript_status: 'approved',
    description: 'Temporary smoke package for manual Vimeo member-library workflow.',
    summary: 'Temporary smoke package for manual Vimeo member-library workflow.',
    source_sheet_draft: 'Smoke source sheet placeholder.',
  };
  const created = (await requestJson(`${appUrl}/api/bna/one-time/classes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(classPayload),
  })).data;
  assert(created.success === true, 'class package create failed');
  const classId = Number(created.class_session?.id || 0);
  assert(classId > 0, 'class package id missing');
  assert(created.class_session?.vimeo_id === '123456789', 'Vimeo ID did not persist from URL');
  assert(created.class_session?.masechta === 'Smoke', 'Masechta did not persist');

  const asset = (await requestJson(`${appUrl}/api/bna/one-time/classes/${classId}/assets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      asset_type: 'source_sheet',
      title: 'Smoke source sheet',
      file_url: 'https://example.com/one-time-vimeo-smoke-source-sheet',
      status: 'approved',
      description: 'Temporary source asset for smoke verification.',
    }),
  })).data;
  assert(asset.success === true, 'asset attach failed');

  const preview = (await requestJson(`${appUrl}/api/bna/one-time/classes/${classId}/package-preview`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  })).data;
  assert(preview.success === true, 'package preview failed');
  assert(preview.recording_pipeline?.status === 'manual_vimeo_ready', 'package preview did not report manual Vimeo ready');
  assert(preview.recording_pipeline?.automated_upload_readiness?.api_upload_enabled === false, 'package preview enabled automated upload');

  const memberPreview = (await requestJson(`${appUrl}/api/bna/one-time/classes/${classId}/member-preview`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tier: 'smoke', library_visibility: 'smoke', required_tier: 'smoke' }),
  })).data;
  assert(memberPreview.success === true, 'member preview failed');
  assert(memberPreview.preview_visible === true, 'smoke member preview was not visible');
  assert(memberPreview.item?.vimeo_id === '123456789', 'member preview did not include Vimeo ID');

  const approved = (await requestJson(`${appUrl}/api/bna/one-time/classes/${classId}/approve-library`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ approval_flag: APPROVAL_FLAG }),
  })).data;
  assert(approved.success === true, 'approve-library failed');
  assert(approved.package?.package_status === 'approved', 'package was not approved');

  const published = (await requestJson(`${appUrl}/api/bna/one-time/classes/${classId}/publish-library`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      approval_flag: APPROVAL_FLAG,
      destination: 'member_library',
      library_visibility: 'smoke',
      required_tier: 'smoke',
    }),
  })).data;
  assert(published.success === true, 'publish-library failed');
  const itemId = Number(published.item?.id || 0);
  assert(itemId > 0, 'published item id missing');
  assert(published.item?.publish_status === 'published', 'item was not published');
  assert(published.item?.library_visibility === 'smoke', 'item was not smoke-scoped');
  assert(published.item?.vimeo_id === '123456789', 'published item lost Vimeo ID');

  const rolledBack = (await requestJson(`${appUrl}/api/bna/one-time/library-items/${itemId}/rollback`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ approval_flag: APPROVAL_FLAG, reason: 'Codex smoke rollback' }),
  })).data;
  assert(rolledBack.success === true, 'rollback failed');
  assert(rolledBack.item?.publish_status === 'archived', 'item was not archived after rollback');

  const smoke = (await requestJson(`${appUrl}/api/bna/one-time/library-smoke`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ approval_flag: APPROVAL_FLAG }),
  })).data;
  assert(smoke.success === true, 'member-library smoke endpoint failed');
  assert(smoke.smoke?.visible_before_count >= 1, 'member-library smoke item was not visible before rollback');
  assert(smoke.smoke?.visible_after_count === 0, 'member-library smoke item remained visible after rollback');

  const archivedClass = (await requestJson(`${appUrl}/api/bna/one-time/classes/${classId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ package_status: 'archived', actor: 'codex-live-smoke-cleanup' }),
  })).data;
  assert(archivedClass.success === true, 'temporary class archive failed');
  assert(archivedClass.class_session?.package_status === 'archived', 'temporary class was not archived');

  return {
    selected_provider: status.card?.selectedProviderDecision,
    manual_ready: status.card?.manualFallback?.ready,
    automated_upload_enabled: status.card?.automatedUpload?.api_upload_enabled,
    created_class_id: classId,
    published_item_id: itemId,
    rolled_back: rolledBack.item?.publish_status === 'archived',
    class_archived: archivedClass.class_session?.package_status === 'archived',
    smoke_visible_before: smoke.smoke?.visible_before_count,
    smoke_visible_after: smoke.smoke?.visible_after_count,
  };
}

async function collectOperationsUiState({ appUrl, cookie, width }) {
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
    const target = `${appUrl}/operations?workspace=rabbi_sheller_provider&view=content&section=one_time_library&smoke=${Date.now()}`;
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.ops-app-shell', { timeout: 30000 });
    await page.waitForSelector('[data-one-time-recording-vimeo-readiness]', { timeout: 30000 });
    await page.waitForSelector('form[onsubmit*="createOneTimeClassPackage"]', { timeout: 30000 });
    await page.waitForTimeout(2500);
    const state = await page.evaluate(() => {
      const panel = document.querySelector('[data-one-time-recording-vimeo-readiness]');
      const text = document.body.textContent.replace(/\s+/g, ' ').trim();
      return {
        has_readiness_panel: Boolean(panel),
        has_class_manager: /Class Package Manager/i.test(text),
        has_manual_ready_copy: /manual mode ready, automated upload disabled/i.test(text),
        has_setup_fields: /authenticated Vimeo user/i.test(text) && /allowed embed domains/i.test(text) && /last verification/i.test(text),
        has_metadata_inputs: Boolean(document.querySelector('input[name="masechta"]') && document.querySelector('input[name="perek"]') && document.querySelector('input[name="mishnah_range"]') && document.querySelector('input[name="duration_seconds"]')),
        has_approval_phrase: /APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING/i.test(text),
        page_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        client_width: document.documentElement.clientWidth,
        scroll_width: document.documentElement.scrollWidth,
      };
    });
    assert(state.has_readiness_panel && state.has_class_manager, 'Operations Vimeo/library panels did not render');
    assert(state.has_manual_ready_copy && state.has_setup_fields, 'Operations setup/readiness copy missing');
    assert(state.has_metadata_inputs && state.has_approval_phrase, 'Class manager metadata or approval controls missing');
    assert(!state.page_overflow, `Operations content library overflowed at ${width}px: ${state.scroll_width} > ${state.client_width}`);
    return { width, state, console_errors: consoleErrors };
  } finally {
    await browser.close();
  }
}

async function collectMemberLibraryUiState({ appUrl, width }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width, height: 820 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  try {
    await page.goto(`${appUrl}/member-library?smoke=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#accessForm', { timeout: 30000 });
    await page.evaluate(() => {
      window.renderLibrary({
        member_library: {
          access: { member_label: 'Smoke Member', tier: 'library_only' },
          items: [
            {
              id: 991,
              class_session_id: 991,
              title: 'Smoke Berachos Review',
              description: 'Synthetic UI-only smoke item.',
              class_date: '2026-06-21',
              media_provider: 'vimeo',
              media_url: 'https://vimeo.com/123456789',
              vimeo_id: '123456789',
              masechta: 'Berachos',
              perek: '1',
              mishnah_range: '1-2',
              duration_seconds: 1800,
              review_state: 'review_ready',
              assets: [{ asset_type: 'source_sheet', title: 'Source sheet', file_url: 'https://example.com/source' }],
            },
          ],
        },
        classroom: { calendar_items: [], threads: [], leaderboard: [] },
      });
    });
    await page.waitForSelector('#filterRail button', { timeout: 30000 });
    await page.click('button[role="tab"]:has-text("Masechta")');
    await page.waitForSelector('.library-group-title', { timeout: 30000 });
    const state = await page.evaluate(() => {
      const text = document.body.textContent.replace(/\s+/g, ' ').trim();
      const rail = document.querySelector('#filterRail');
      return {
        toolbar_visible: document.querySelector('#libraryToolbar')?.classList.contains('visible') || false,
        filters_horizontal: Boolean(rail && getComputedStyle(rail).display === 'flex' && getComputedStyle(rail).flexWrap === 'nowrap'),
        filter_scrolls: Boolean(rail && rail.scrollWidth >= rail.clientWidth),
        has_all_filters: ['All', 'Recently Added', 'Continue Watching', 'Masechta', 'Perek', 'Review', 'Completed'].every((label) => text.includes(label)),
        has_grouping: /Berachos/i.test(text) && /Perek 1/i.test(text) && /Mishnah 1-2/i.test(text),
        has_progress: /0% complete/i.test(text) && /Mark Complete/i.test(text),
        page_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        client_width: document.documentElement.clientWidth,
        scroll_width: document.documentElement.scrollWidth,
      };
    });
    assert(state.toolbar_visible && state.filters_horizontal, 'member-library filter rail did not render horizontally');
    assert(state.has_all_filters && state.has_grouping && state.has_progress, 'member-library filters/grouping/progress missing');
    assert(!state.page_overflow, `Member library page overflowed at ${width}px: ${state.scroll_width} > ${state.client_width}`);
    return { width, state, console_errors: consoleErrors };
  } finally {
    await browser.close();
  }
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-vimeo-member-library-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-vimeo-member-library-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(scrub(report), null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const formatList = (items) => (items.length ? items.join(', ') : 'none');
  const lines = [
    `# One Time Vimeo Member Library Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- vimeo_selected: ${report.summary.vimeo_selected}`,
    `- manual_vimeo_ready: ${report.summary.manual_vimeo_ready}`,
    `- automated_upload_enabled: ${report.summary.automated_upload_enabled}`,
    `- temporary_class_created: ${report.summary.temporary_class_created}`,
    `- temporary_class_archived: ${report.summary.temporary_class_archived}`,
    `- temporary_item_published: ${report.summary.temporary_item_published}`,
    `- temporary_item_rolled_back: ${report.summary.temporary_item_rolled_back}`,
    `- member_library_smoke_rolled_back: ${report.summary.member_library_smoke_rolled_back}`,
    `- operations_widths_checked: ${formatList(report.summary.operations_widths_checked)}`,
    `- member_library_widths_checked: ${formatList(report.summary.member_library_widths_checked)}`,
    '',
    'No Vimeo upload, provider publish/unpublish/delete, email, WhatsApp, payment, Zoom meeting, participant invite, real member access grant, or external portal write was performed.',
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
      vimeo_selected: false,
      manual_vimeo_ready: false,
      automated_upload_enabled: false,
      temporary_class_created: false,
      temporary_class_archived: false,
      temporary_item_published: false,
      temporary_item_rolled_back: false,
      member_library_smoke_rolled_back: false,
      operations_widths_checked: [],
      member_library_widths_checked: [],
    },
  };

  try {
    const session = await runStep(report, 'operations login', () => loginOperationsSession(appUrl, username, password));
    const apiState = await runStep(report, 'manual Vimeo API workflow', () => collectApiState({ appUrl, cookie: session.cookie, startedAt: report.started_at }));
    report.summary.vimeo_selected = apiState.selected_provider === 'vimeo';
    report.summary.manual_vimeo_ready = apiState.manual_ready === true;
    report.summary.automated_upload_enabled = apiState.automated_upload_enabled === true;
    report.summary.temporary_class_created = Number(apiState.created_class_id) > 0;
    report.summary.temporary_class_archived = apiState.class_archived === true;
    report.summary.temporary_item_published = Number(apiState.published_item_id) > 0;
    report.summary.temporary_item_rolled_back = apiState.rolled_back === true;
    report.summary.member_library_smoke_rolled_back = Number(apiState.smoke_visible_after) === 0;

    for (const width of [1440, 390]) {
      await runStep(report, `operations content library ui ${width}px`, () => collectOperationsUiState({ appUrl, cookie: session.cookie, width }));
      report.summary.operations_widths_checked.push(width);
    }
    for (const width of [1440, 390]) {
      await runStep(report, `member library filters ui ${width}px`, () => collectMemberLibraryUiState({ appUrl, width }));
      report.summary.member_library_widths_checked.push(width);
    }
  } catch (error) {
    const paths = writeReports(report);
    console.error(`One Time Vimeo/member-library live smoke failed. Reports: ${paths.markdown} ${paths.json}`);
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exit(1);
  }

  const paths = writeReports(report);
  console.log(`One Time Vimeo/member-library live smoke passed. Reports: ${paths.markdown} ${paths.json}`);
}

main();
