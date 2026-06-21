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
  const jsonPath = path.join(reportDir, `${stamp}-one-time-test-identities-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-test-identities-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Test Identities Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Fixture Snapshot',
    `- Requirement: ${report.requirement_id || 'n/a'}`,
    `- TEST identities: ${report.identity_count ?? 'n/a'}`,
    `- Mock records: ${report.mock_record_count ?? 'n/a'}`,
    `- Negative auth cases: ${report.negative_authorization_count ?? 'n/a'}`,
    `- Cleanup ready: ${report.cleanup_ready === true ? 'yes' : 'no'}`,
    '',
    '## Guardrails',
    '- Smoke is read-only and does not create production records.',
    '- All identities are TEST-prefixed and use example.test contact values.',
    '- No real private exports, raw private rows, email/WhatsApp/SMS/Telegram sends, payment, Zoom, Vimeo, Google, DNS, or CRM writes are performed.',
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

  await step('Test identity preview API is no-write and TEST-prefixed', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/one-time/test-identities-preview`, {
      headers: authHeaders,
    });
    assert(data.success === true, 'preview endpoint did not return success');
    assert(data.requirement_id === 'REQ-20260621-909', 'requirement id mismatch');
    assert(data.workspace_key === 'rabbi_sheller_provider', 'workspace scope mismatch');
    assert(data.project_key === 'one_time_mishnah_class', 'project scope mismatch');
    assert(data.external_write_performed === false, 'external write reported');
    assert(data.records_created === false, 'records_created should be false');
    assert(data.production_records_created === false, 'production records were created');
    assert(data.private_export_sources_included === false, 'private exports included');
    assert(data.raw_private_rows_included === false, 'raw private rows included');
    assert(data.safety?.ok === true, `safety failed: ${(data.safety?.failures || []).join('; ')}`);
    const identities = data.fixtures?.identities || [];
    assert(identities.length >= 8, 'expected parent/student/provider/BNA control identities');
    assert(identities.every((identity) => /^TEST-/.test(identity.key || '')), 'identity key not TEST-prefixed');
    assert(identities.every((identity) => /^TEST /.test(identity.display_name || '')), 'display name not TEST-prefixed');
    assert(identities.every((identity) => /@example\.test$/i.test(identity.email || '')), 'identity email not example.test');
    const categories = new Set((data.scenarios || []).map((scenario) => scenario.category));
    for (const category of ['crm', 'payment_access', 'class_links', 'questions', 'support']) {
      assert(categories.has(category), `missing category ${category}`);
    }
    report.requirement_id = data.requirement_id;
    report.identity_count = data.safety.checks.identity_count;
    report.mock_record_count = data.safety.checks.mock_record_count;
    report.negative_authorization_count = data.safety.checks.negative_authorization_count;
    report.cleanup_ready = data.cleanup_manifest?.cleanup_ready === true;
    return `${report.identity_count} identities, ${report.negative_authorization_count} denial cases`;
  });

  await step('Operations ships test identity preview panel', async () => {
    const { text } = await requestText(`${appUrl}/operations`, { headers: authHeaders });
    assert(text.includes('data-one-time-test-identities-preview'), 'Operations HTML missing test identities marker');
    assert(text.includes('REQ-20260621-909'), 'Operations HTML missing Batch 9I requirement id');
    assert(text.includes('Apply Mock Data'), 'Operations HTML missing disabled apply action');
    assert(text.includes('Cleanup TEST Records'), 'Operations HTML missing disabled cleanup action');
    assert(text.includes('no private exports'), 'Operations HTML missing private-export guardrail');
    return 'Operations panel marker and disabled blockers shipped';
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
