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

function includesSecretLikeValue(value) {
  const text = JSON.stringify(value || {});
  return /(sk_live_|sk_test_|rk_live_|xox[baprs]-|AKIA[0-9A-Z]{16}|-----BEGIN|authorization|set-cookie)/i.test(text);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-community-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-community-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Community Live Smoke - ${report.started_at}`,
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
    `- Threads seen: ${report.threads_seen ?? 'n/a'}`,
    `- Messages seen: ${report.messages_seen ?? 'n/a'}`,
    `- Pending moderation: ${report.pending_moderation ?? 'n/a'}`,
    '',
    '## Guardrails',
    '- Smoke is read-only and does not create threads, messages, approvals, public posts, parent-visible messages, staff notes, notifications, or delete/purge actions.',
    '- Unrestricted student-to-student messaging, unreviewed publication, public promotion writes, external notifications, sends, charges, Zoom/Vimeo/Google/DNS mutation, external CRM/GHL write, and secret exposure remain disabled.',
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

  await step('Community moderation readiness API is implemented and no-write', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/one-time/community-moderation-readiness`, { headers: authHeaders });
    assert(data.success === true, 'readiness endpoint did not return success');
    assert(data.workspace_key === 'rabbi_sheller_provider', 'workspace scope mismatch');
    assert(data.project_key === 'one_time_mishnah_class', 'project scope mismatch');
    assert(data.raw_private_message_text_returned === false, 'raw private message text was returned');
    assert(data.external_write_performed === false, 'external write reported');
    assert(data.production_mutation_performed === false, 'production mutation reported');
    assert(data.unrestricted_student_messaging_enabled === false, 'unrestricted student messaging reported enabled');
    const readiness = data.community_moderation || {};
    assert(readiness.requirement_id === 'REQ-20260619-311', 'requirement id mismatch');
    assert(readiness.status === 'implemented_read_only', `unexpected status ${readiness.status}`);
    assert(readiness.preview_only === true, 'readiness should be preview only');
    assert(readiness.gates?.unrestricted_student_private_messaging_enabled === false, 'student private messaging gate enabled');
    assert(readiness.gates?.unreviewed_member_post_publication_enabled === false, 'unreviewed publication gate enabled');
    assert(readiness.gates?.private_question_public_promotion_write_enabled === false, 'public_promotion_write_enabled gate enabled');
    assert(readiness.gates?.readiness_route_mutation_enabled === false, 'readiness mutation gate enabled');
    assert(Array.isArray(readiness.blockers) && readiness.blockers.length === 0, 'unexpected community blockers');
    assert((readiness.private_to_public_workflow || []).length === 6, 'private-to-public workflow step count mismatch');
    const sectionKeys = (readiness.sections || []).map((section) => section.key);
    for (const key of [
      'rabbi_announcements',
      'cohort_discussions',
      'private_questions',
      'parent_visible_communication',
      'staff_only_notes',
      'report_flag_flow',
      'private_to_public_anonymization',
      'no_unrestricted_student_messaging',
      'audit_release',
    ]) {
      assert(sectionKeys.includes(key), `missing section ${key}`);
    }
    assert(readiness.sections.find((section) => section.key === 'audit_release')?.status === 'live_smoke_ready', 'audit section not live-smoke-ready');
    assert(!includesSecretLikeValue(data), 'secret-like value appeared in readiness response');
    report.requirement_id = readiness.requirement_id;
    report.status = readiness.status;
    report.threads_seen = readiness.summary?.threads_seen ?? null;
    report.messages_seen = readiness.summary?.messages_seen ?? null;
    report.pending_moderation = readiness.summary?.pending_moderation ?? null;
    return `${report.threads_seen} threads, ${report.messages_seen} messages`;
  });

  await step('Operations ships community moderation readiness panel', async () => {
    const { text } = await requestText(`${appUrl}/operations`, { headers: authHeaders });
    assert(text.includes('data-one-time-community-moderation-readiness'), 'Operations missing community readiness marker');
    assert(text.includes('REQ-20260619-311'), 'Operations missing community requirement id');
    assert(text.includes('Private-to-public workflow'), 'Operations missing workflow copy');
    assert(text.includes('implemented no-write readiness'), 'Operations missing implemented readiness copy');
    assert(text.includes('No unrestricted student-to-student messaging'), 'Operations missing student messaging guardrail');
    assert(text.includes('Live smoke ready'), 'Operations missing live-smoke-ready state');
    return 'Operations community panel marker and guardrails shipped';
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
