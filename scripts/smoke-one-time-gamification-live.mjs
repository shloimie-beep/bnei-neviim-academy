#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'ops', 'live-smokes');

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
  const expected = options.acceptStatuses || [200];
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, data: text ? JSON.parse(text) : {} };
}

async function requestText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { accept: 'text/html, text/plain, */*', ...(options.headers || {}) },
  });
  const text = await response.text();
  const expected = options.acceptStatuses || [200];
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, text };
}

async function loginOperationsSession(appUrl, username, password) {
  const { response, data } = await requestJson(`${appUrl}/api/operations/login`, {
    method: 'POST',
    headers: { authorization: basicAuthHeader(username, password) },
    body: JSON.stringify({ username, password }),
  });
  assert(data.success === true, 'operations login did not return success');
  const cookie = parseSetCookie(response);
  assert(cookie?.name && cookie?.value, 'operations login did not set a session cookie');
  return cookie;
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-gamification-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-gamification-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Gamification Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Snapshot',
    `- Requirement: ${report.requirement_id || 'n/a'}`,
    `- Status: ${report.status || 'n/a'}`,
    `- Automatic badges: ${report.automatic_badges ?? 'n/a'}`,
    `- Rabbi-awarded badges: ${report.rabbi_awarded_badges ?? 'n/a'}`,
    '',
    '## Guardrails',
    '- Smoke is read-only and does not create gamification events, award badges, reverse badges, notify anyone, grant access, or change prizes/credits.',
    '- No public individual leaderboard, negative-point action, external CRM/GHL write, send, charge, Zoom/Vimeo/Google/DNS mutation, or secret exposure is performed.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  const env = {
    ...loadEnvFile(path.join(root, '.env.local')),
    ...loadEnvFile(path.join(root, '.env')),
    ...process.env,
  };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  assert(username && password, 'OPS_USERNAME and OPS_PASSWORD are required for live smoke');

  const report = { started_at: new Date().toISOString(), app_url: appUrl, steps: [] };
  const step = async (name, fn) => {
    try {
      const detail = await fn();
      report.steps.push({ name, ok: true, detail: typeof detail === 'string' ? detail : '' });
      return detail;
    } catch (error) {
      report.steps.push({ name, ok: false, detail: error.message });
      throw error;
    }
  };

  let cookie;
  await step('Operations login', async () => {
    cookie = await loginOperationsSession(appUrl, username, password);
    return `cookie ${cookie.name}`;
  });

  const authHeaders = {
    authorization: basicAuthHeader(username, password),
    cookie: `${cookie.name}=${cookie.value}`,
  };

  await step('Gamification readiness API is implemented and no-write', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/gamification/badge-readiness?project_key=one_time_mishnah_class`, { headers: authHeaders });
    assert(data.success === true, 'readiness endpoint did not return success');
    assert(data.project_key === 'one_time_mishnah_class', 'project scope mismatch');
    assert(data.external_write_performed === false, 'external write reported');
    assert(data.production_mutation_performed === false, 'production mutation reported');
    assert(data.public_individual_leaderboard_enabled === false, 'public leaderboard reported enabled');
    const readiness = data.badge_readiness || {};
    assert(readiness.requirement_id === 'REQ-20260619-310', 'requirement id mismatch');
    assert(readiness.status === 'implemented_read_only', `unexpected status ${readiness.status}`);
    assert(readiness.event_driven_award_pipeline_enabled === true, 'event-driven pipeline not enabled');
    assert(readiness.manual_reversal_pipeline_enabled === true, 'manual reversal pipeline not enabled');
    assert(readiness.gates?.readiness_route_award_write_enabled === false, 'readiness route award write enabled');
    assert(readiness.gates?.readiness_route_reversal_write_enabled === false, 'readiness route reversal write enabled');
    assert(readiness.gates?.public_individual_leaderboard_enabled === false, 'public leaderboard gate enabled');
    assert(readiness.gates?.automatic_access_grant_enabled === false, 'automatic access grant gate enabled');
    assert(Array.isArray(readiness.blockers) && readiness.blockers.length === 0, 'unexpected gamification blockers');
    assert((readiness.definitions?.automatic_badges || []).length === 11, 'automatic badge catalog mismatch');
    assert((readiness.definitions?.rabbi_awarded_badges || []).length === 6, 'Rabbi-awarded badge catalog mismatch');
    report.requirement_id = readiness.requirement_id;
    report.status = readiness.status;
    report.automatic_badges = readiness.definitions.automatic_badges.length;
    report.rabbi_awarded_badges = readiness.definitions.rabbi_awarded_badges.length;
    return `${report.automatic_badges} automatic, ${report.rabbi_awarded_badges} Rabbi-awarded`;
  });

  await step('Operations ships badge audit readiness panel', async () => {
    const { text } = await requestText(`${appUrl}/operations`, { headers: authHeaders });
    assert(text.includes('data-one-time-badge-audit-readiness'), 'Operations missing badge readiness marker');
    assert(text.includes('REQ-20260619-310'), 'Operations missing gamification requirement id');
    assert(text.includes('Server-side event badges and manual reversals are implemented'), 'Operations missing implemented badge copy');
    assert(text.includes('No public individual leaderboard'), 'Operations missing leaderboard guardrail');
    return 'Operations badge panel marker and guardrails shipped';
  });

  const paths = writeReports(report);
  console.log(JSON.stringify({
    ok: true,
    report: path.relative(root, paths.mdPath).replace(/\\/g, '/'),
    requirement_id: report.requirement_id,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
