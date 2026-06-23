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
  const jsonPath = path.join(reportDir, `${stamp}-one-time-payment-access-class-links-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-payment-access-class-links-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Payment Access Class Links Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Readiness Snapshot',
    `- Requirement: ${report.requirement_id || 'n/a'}`,
    `- Checkout count: ${report.checkout_count ?? 'n/a'}`,
    `- Test paid checkout count: ${report.test_paid_checkout_count ?? 'n/a'}`,
    `- Active grant count: ${report.active_grant_count ?? 'n/a'}`,
    `- Live scoped sessions: ${report.live_scoped_session_count ?? 'n/a'}`,
    '',
    '## Guardrails',
    '- Smoke is read-only: it does not create checkout sessions, payment links, charges, invoices, subscriptions, access grants, emails, WhatsApps, external CRM writes, Zoom meetings, registrants, or join links.',
    '- Member-facing class links remain relationship-scoped and the smoke verifies raw Zoom join URLs plus host/start URLs are not exposed.',
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

  await step('Payment/access/class-link API returns no-write readiness', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/one-time/payment-access-class-links`, {
      headers: authHeaders,
    });
    assert(data.success === true, 'payment/access endpoint did not return success');
    const readiness = data.payment_access_class_links || {};
    const payment = readiness.payment_state || {};
    const access = readiness.access_gate || {};
    const classLink = readiness.class_link_scope || {};
    const guardrails = readiness.guardrails || {};
    assert(readiness.requirement_id === 'REQ-20260621-907', 'requirement id mismatch');
    assert(payment.live_charges_enabled === false, 'live charges are enabled');
    assert(payment.checkout_session_creation_enabled === false, 'checkout session creation is enabled');
    assert(payment.payment_link_creation_enabled === false, 'payment link creation is enabled');
    assert(access.approved_local_test_event_required === true, 'approved local/test event requirement missing');
    assert(access.automated_access_grants_enabled === false, 'automated access grants are enabled');
    assert(classLink.relationship_scope === 'member_session_and_active_live_grant', 'class link scope mismatch');
    assert(classLink.protected_reference_required === true, 'protected reference requirement missing');
    assert(classLink.raw_zoom_join_url_returned_to_members === false, 'raw Zoom join URL is exposed');
    assert(classLink.zoom_host_start_url_returned === false, 'Zoom host/start URL is exposed');
    assert(guardrails.external_write_performed === false, 'external write was reported');
    report.requirement_id = readiness.requirement_id;
    report.checkout_count = payment.checkout_count;
    report.test_paid_checkout_count = payment.test_paid_checkout_count;
    report.active_grant_count = access.active_grant_count;
    report.live_scoped_session_count = classLink.live_scoped_session_count;
    return 'no charge, no grant automation, relationship-scoped class links, no host/start URL';
  });

  await step('Operations ships payment/access/class-link UX markers', async () => {
    const { text } = await requestText(`${appUrl}/operations`, { headers: authHeaders });
    assert(text.includes('data-one-time-payment-access-class-links'), 'Operations HTML missing payment/access marker');
    assert(text.includes('REQ-20260621-907'), 'Operations HTML missing Batch 9G requirement id');
    assert(text.includes('Payment state does not create live charges'), 'Operations HTML missing payment guardrail');
    assert(text.includes('access requires an approved local/test event'), 'Operations HTML missing approved-event gate');
    assert(text.includes('Zoom host/start URLs are never exposed'), 'Operations HTML missing Zoom host/start guardrail');
    assert(text.includes('Reveal Join Link'), 'Operations HTML missing disabled join action');
    return 'Payment/access panel markers shipped';
  });

  await step('Member portal script does not use raw Zoom URL contract', async () => {
    const { text } = await requestText(`${appUrl}/js/rabbi-member.js`, { headers: authHeaders });
    assert(!text.includes('session.zoom_url'), 'member portal script still renders session.zoom_url');
    assert(text.includes('Secure Join Class is relationship-scoped'), 'member portal missing protected join blocker');
    assert(text.includes('host/start URLs are never exposed'), 'member portal missing host/start copy');
    return 'member script renders protected join blocker';
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
