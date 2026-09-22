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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
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
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 500)}`);
  }
  return { response, data: text ? JSON.parse(text) : {} };
}

async function requestText(url, options = {}) {
  const expected = options.acceptStatuses || [200];
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html, text/plain, */*',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 500)}`);
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
  const jsonPath = path.join(reportDir, `${stamp}-one-time-agent-mode-acceptance-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-agent-mode-acceptance-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Agent Mode Acceptance Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Acceptance Snapshot',
    `- Requirement: ${report.requirement_id || 'n/a'}`,
    `- Stages: ${report.stage_count ?? 'n/a'}`,
    `- Blockers: ${report.blocker_count ?? 'n/a'}`,
    `- Status: ${report.status || 'n/a'}`,
    '',
    '## Guardrails',
    '- Smoke is read-only and does not run an autonomous external agent.',
    '- No live charges, sends, external CRM writes, GHL/LeadConnector runtime, DNS, Zoom/Vimeo/Google mutation, production record creation, or secret exposure is performed.',
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

  await step('Agent Mode acceptance API passes with no writes', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/one-time/agent-mode-acceptance`, {
      headers: authHeaders,
    });
    assert(data.success === true, 'acceptance endpoint did not return success');
    assert(data.requirement_id === 'REQ-20260621-910', 'requirement id mismatch');
    assert(data.status === 'pass', `acceptance status ${data.status}`);
    assert(data.workspace_key === 'rabbi_sheller_provider', 'workspace scope mismatch');
    assert(data.project_key === 'one_time_mishnah_class', 'project scope mismatch');
    assert(data.external_write_performed === false, 'external write reported');
    assert(data.production_mutation_performed === false, 'production mutation reported');
    assert(data.live_charge_performed === false, 'live charge reported');
    assert(data.live_send_performed === false, 'live send reported');
    assert(data.external_crm_write_performed === false, 'external CRM write reported');
    const stages = data.stages || [];
    assert(stages.length >= 6, 'expected six acceptance stages');
    for (const key of ['source_envelope_parser', 'crm_import_dedupe', 'trial_referral', 'payment_access_class_links', 'tickets_questions', 'beta_test_data']) {
      assert(stages.some((stage) => stage.key === key), `missing stage ${key}`);
    }
    assert(Object.values(data.acceptance_checks || {}).every(Boolean), 'not all acceptance checks passed');
    assert((data.remaining_external_blockers || []).every((blocker) => blocker.owner && blocker.next_action), 'blockers are not explicit');
    report.requirement_id = data.requirement_id;
    report.stage_count = stages.length;
    report.blocker_count = (data.remaining_external_blockers || []).length;
    report.status = data.status;
    return `${stages.length} stages, ${(data.remaining_external_blockers || []).length} blockers`;
  });

  await step('Operations ships Agent Mode acceptance panel', async () => {
    const { text } = await requestText(`${appUrl}/operations`, { headers: authHeaders });
    assert(text.includes('data-one-time-agent-mode-acceptance'), 'Operations HTML missing Agent Mode acceptance marker');
    assert(text.includes('REQ-20260621-910'), 'Operations HTML missing Batch 9J requirement id');
    assert(text.includes('Run Live Agent Mode'), 'Operations HTML missing disabled live agent action');
    assert(text.includes('Read-only acceptance'), 'Operations HTML missing read-only guardrail');
    return 'Operations panel marker and disabled live-agent blocker shipped';
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
