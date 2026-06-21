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
    headers: {
      accept: 'text/html, text/plain, */*',
      ...(options.headers || {}),
    },
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
  const jsonPath = path.join(reportDir, `${stamp}-one-time-transcript-privacy-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-transcript-privacy-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Transcript Privacy Live Smoke - ${report.started_at}`,
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
    `- Classes seen: ${report.classes_seen ?? 'n/a'}`,
    `- Segments seen: ${report.segments_seen ?? 'n/a'}`,
    `- Guessed-speaker blocks: ${report.guessed_speaker_blocks ?? 'n/a'}`,
    '',
    '## Guardrails',
    '- Smoke is read-only and does not write transcript content, student records, public helper corpus, or portal data.',
    '- No raw transcript body, staff-private note, cross-student private segment, send, charge, Zoom/Vimeo/Google/DNS mutation, external CRM/GHL write, or secret exposure is performed.',
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

  await step('Transcript privacy readiness API is body-free and no-write', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/one-time/transcript-privacy`, { headers: authHeaders });
    assert(data.success === true, 'readiness endpoint did not return success');
    assert(data.workspace_key === 'rabbi_sheller_provider', 'workspace scope mismatch');
    assert(data.project_key === 'one_time_mishnah_class', 'project scope mismatch');
    assert(data.raw_transcript_text_returned === false, 'raw transcript body was returned');
    assert(data.transcript_body_returned === false, 'transcript body flag was not false');
    assert(data.production_mutation_performed === false, 'production mutation reported');
    assert(data.external_write_performed === false, 'external write reported');
    const readiness = data.transcript_privacy || {};
    assert(readiness.requirement_id === 'REQ-20260619-309', 'requirement id mismatch');
    assert(readiness.status === 'implemented_read_only', `unexpected status ${readiness.status}`);
    assert(readiness.raw_text_returned === false, 'readiness returned raw text');
    assert(readiness.transcript_body_returned === false, 'readiness returned transcript body');
    assert(readiness.gates?.raw_transcript_public_rag_enabled === false, 'raw transcript public RAG gate enabled');
    assert(readiness.gates?.cross_student_retrieval_enabled === false, 'cross-student retrieval gate enabled');
    assert(readiness.gates?.guessed_speaker_to_student_record_enabled === false, 'guessed speaker student mapping gate enabled');
    assert(Array.isArray(readiness.blockers) && readiness.blockers.length === 0, 'unexpected transcript privacy blockers');
    assert((readiness.release_policy?.unsafe_match_methods || []).includes('guessed_speaker_label'), 'unsafe guessed speaker method missing');
    assert(!includesSecretLikeValue(data), 'secret-like value appeared in readiness response');
    report.requirement_id = readiness.requirement_id;
    report.status = readiness.status;
    report.classes_seen = readiness.summary?.classes_seen ?? null;
    report.segments_seen = readiness.summary?.segments_seen ?? null;
    report.guessed_speaker_blocks = readiness.summary?.guessed_speaker_blocks ?? null;
    return `${report.classes_seen} classes, ${report.segments_seen} segments`;
  });

  await step('Operations ships transcript privacy panel', async () => {
    const { text } = await requestText(`${appUrl}/operations`, { headers: authHeaders });
    assert(text.includes('data-one-time-transcript-privacy-readiness'), 'Operations missing transcript privacy marker');
    assert(text.includes('REQ-20260619-309'), 'Operations missing transcript privacy requirement id');
    assert(text.includes('guessed speaker identity'), 'Operations missing guessed-speaker guardrail');
    assert(text.includes('Live smoke ready'), 'Operations missing live-smoke-ready state');
    return 'Operations panel marker and guardrail text shipped';
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
