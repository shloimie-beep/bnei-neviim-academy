#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');
const env = loadSmokeEnv({ root: repoRoot });
const oneTimeRailwayEnv = {
  ...env,
  OPS_USERNAME: '',
  OPS_PASSWORD: '',
  BNA_SMOKE_RAILWAY_PROJECT_ID: env.BNA_SMOKE_RAILWAY_PROJECT_ID || 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
  BNA_SMOKE_RAILWAY_SERVICE: env.BNA_SMOKE_RAILWAY_SERVICE || 'one-time-web',
  BNA_SMOKE_RAILWAY_ENVIRONMENT: env.BNA_SMOKE_RAILWAY_ENVIRONMENT || 'production',
};
const baseUrl = String(
  process.env.ONE_TIME_PUBLIC_BASE_URL ||
  process.env.ONE_TIME_APP_URL ||
  process.env.ONETIME_BASE_URL ||
  env.ONE_TIME_PUBLIC_BASE_URL ||
  env.ONE_TIME_APP_URL ||
  env.ONETIME_BASE_URL ||
  'https://join.onetimeonetime.com'
).replace(/\/+$/, '');
const operationsRoute = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts';
const operationsHtmlRoute = '/operations.html';
const startedAt = new Date().toISOString();
const stamp = startedAt.replace(/[:.]/g, '-');

const report = {
  started_at: startedAt,
  base_url: baseUrl,
  route: operationsRoute,
  status: 'unknown',
  deployment_id: process.env.BNA_DEPLOYMENT_ID || '',
  commit: process.env.BNA_DEPLOYED_COMMIT || '',
  steps: [],
  guardrails: [
    'Read-only live smoke; no contact data, notes, raw message bodies, screenshots, sends, payments, access grants, or external CRM writes are saved.',
    'Live API readback records counts and guard flags only.',
    'Synthetic local screenshots remain the visual proof for private-data-safe layout review.',
  ],
};
let firstCardId = '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-one-time-operations-crm-workbench-live-smoke.${ext}`);
}

function cookieHeader(cookie) {
  return `${cookie.name}=${cookie.value}`;
}

async function fetchText(route, headers = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: {
      accept: 'text/html, text/plain, */*',
      ...headers,
    },
  });
  const text = await response.text();
  assert(response.status === 200, `${route} returned ${response.status}: ${text.slice(0, 500)}`);
  return text;
}

async function fetchJson(route, headers = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: {
      accept: 'application/json',
      ...headers,
    },
  });
  const text = await response.text();
  assert(response.status === 200, `${route} returned ${response.status}: ${text.slice(0, 500)}`);
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`${route} did not return JSON: ${error.message}`);
  }
}

async function step(name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
    console.log(`PASS ${name}`);
    return details;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: message });
    console.error(`FAIL ${name}: ${message}`);
    throw error;
  }
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = reportPath('json');
  const mdPath = reportPath('md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${[
    `# One Time Operations CRM Workbench Live Smoke - ${report.started_at}`,
    '',
    `Base URL: ${report.base_url}`,
    `Route: ${report.route}`,
    `Result: ${report.status}`,
    `Deployment: ${report.deployment_id || '(not provided)'}`,
    `Commit: ${report.commit || '(not provided)'}`,
    '',
    '## Checks',
    ...report.steps.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name} (${item.duration_ms}ms)${item.error ? ` - ${item.error}` : ''}`),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
  ].join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  let cookie = null;
  await step('operations login uses One Time Railway auth fallback', async () => {
    const login = await loginOperations({ baseUrl, env: oneTimeRailwayEnv, cwd: repoRoot });
    assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, login.reason || 'Operations login cookie missing');
    cookie = login.cookie;
    return { source: login.source, role: login.role || login.user?.role || 'unknown' };
  });

  const authHeaders = { cookie: cookieHeader(cookie) };

  await step('deployed Operations HTML includes CRM workbench detail markers', async () => {
    const shell = await fetchText(`${operationsRoute}&cb=${Date.now()}`, authHeaders);
    assert(shell.includes('BNA Operations'), 'Operations route shell did not load');
    const html = await fetchText(`${operationsHtmlRoute}?cb=${Date.now()}`, authHeaders);
    const required = [
      'data-one-time-crm-workbench',
      'data-one-time-crm-api-workbench',
      'One Time CRM Workbench',
      'function renderFirstPartyCrmDetail',
      'Class / Trial / Access',
      'Read-only local timeline for',
      'No email, WhatsApp, payment, access, or external CRM write',
      'data-shared-crm-workbench',
      'data-shared-crm-component="contact-workspace"',
      'Review mode',
      'Email is not available for this contact.',
      'WhatsApp is not available for this contact.',
    ];
    const missing = required.filter((marker) => !html.includes(marker));
    assert(!missing.length, `missing marker(s): ${missing.join(', ')}`);
    return { markers_checked: required.length };
  });

  await step('scoped CRM contacts API responds without external-write flags', async () => {
    const data = await fetchJson('/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&sort=last_activity_desc', authHeaders);
    assert(Array.isArray(data.cards), 'CRM response did not include cards array');
    const wrongWorkspace = data.cards.find((card) => card.workspace_key && card.workspace_key !== 'rabbi_sheller_provider');
    const wrongProject = data.cards.find((card) => card.project_key && card.project_key !== 'one_time_mishnah_class');
    assert(!wrongWorkspace, 'CRM cards included a different workspace');
    assert(!wrongProject, 'CRM cards included a different project');
    assert(data.external_write_performed !== true, 'CRM list reported an external write');
    assert(data.no_send === true || data.no_send === undefined, 'CRM list no-send flag was false');
    firstCardId = data.cards[0]?.id ? String(data.cards[0].id) : '';
    report.crm_cards_count = data.cards.length;
    report.crm_filtered_total = Number(data.filtered_total || data.cards.length);
    return {
      cards_count: data.cards.length,
      filtered_total: report.crm_filtered_total,
      has_filters: Boolean(data.filters && typeof data.filters === 'object'),
      no_send: data.no_send !== false,
    };
  });

  await step('selected CRM timeline API is read-only when a card exists', async () => {
    if (!firstCardId) return { skipped: true, reason: 'No scoped CRM cards returned.' };
    const data = await fetchJson(`/api/bna/crm/contacts/${encodeURIComponent(firstCardId)}/timeline?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class`, authHeaders);
    assert(Array.isArray(data.timeline), 'CRM timeline response did not include timeline array');
    assert(data.external_write_performed !== true, 'CRM timeline reported an external write');
    assert(data.no_send === true || data.no_send === undefined, 'CRM timeline no-send flag was false');
    return {
      card_id: 'redacted',
      timeline_items: data.timeline.length,
      no_send: data.no_send !== false,
    };
  });

  report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({
    ok: true,
    report: relative(paths.mdPath),
    crm_cards_count: report.crm_cards_count,
    crm_filtered_total: report.crm_filtered_total,
  }, null, 2));
}

main().catch((error) => {
  report.status = 'failed';
  try {
    const paths = writeReports();
    console.error(`Report: ${relative(paths.mdPath)}`);
  } catch {
    // Preserve the original failure if report writing fails.
  }
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
