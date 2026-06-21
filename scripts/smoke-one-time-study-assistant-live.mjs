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
  const secretPattern = /(sk_live_|sk_test_|rk_live_|xox[baprs]-|AKIA[0-9A-Z]{16}|-----BEGIN|bearer\s+[a-z0-9._-]{20,}|basic\s+[a-z0-9+/=]{20,})/i;
  const seen = new Set();
  const walk = (item) => {
    if (typeof item === 'string') return secretPattern.test(item);
    if (!item || typeof item !== 'object') return false;
    if (seen.has(item)) return false;
    seen.add(item);
    if (Array.isArray(item)) return item.some(walk);
    return Object.values(item).some(walk);
  };
  return walk(value);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-study-assistant-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-study-assistant-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time Study Assistant Live Smoke - ${report.started_at}`,
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
    `- Source versions seen: ${report.source_versions_seen ?? 'n/a'}`,
    `- Assistant-ready sources: ${report.assistant_ready_sources ?? 'n/a'}`,
    '',
    '## Guardrails',
    '- Smoke is read-only and does not ingest Sefaria/API content, mutate source corpus, publish to a portal, generate answers, create chat sessions, or retrieve raw source text.',
    '- Unrestricted AI chat, arbitrary version ingestion, arbitrary translation merge, raw transcript retrieval, cross-student retrieval, sends, charges, Zoom/Vimeo/Google/DNS mutation, external CRM/GHL write, and secret exposure remain disabled.',
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

  await step('Study assistant readiness API is implemented and disabled', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/one-time/study-assistant-readiness`, { headers: authHeaders });
    assert(data.success === true, 'readiness endpoint did not return success');
    assert(data.workspace_key === 'rabbi_sheller_provider', 'workspace scope mismatch');
    assert(data.project_key === 'one_time_mishnah_class', 'project scope mismatch');
    assert(data.study_assistant_feature_flag_enabled === false, 'study assistant feature flag enabled');
    assert(data.unrestricted_ai_chat_enabled === false, 'unrestricted AI chat enabled');
    assert(data.arbitrary_version_ingestion_enabled === false, 'arbitrary_version_ingestion_enabled was not false');
    assert(data.answer_generation_enabled === false, 'answer_generation_enabled was not false');
    assert(data.source_corpus_mutation_enabled === false, 'source_corpus_mutation_enabled was not false');
    assert(data.portal_publish_enabled === false, 'portal publish enabled');
    assert(data.raw_source_text_returned === false, 'raw source text returned');
    assert(data.external_write_performed === false, 'external write reported');
    assert(data.production_mutation_performed === false, 'production mutation reported');
    const readiness = data.study_assistant || {};
    assert(readiness.requirement_id === 'REQ-20260619-312', 'requirement id mismatch');
    assert(readiness.status === 'implemented_read_only', `unexpected status ${readiness.status}`);
    assert(readiness.preview_only === true, 'readiness should be preview only');
    assert(readiness.gates?.study_assistant_feature_flag_enabled === false, 'feature gate enabled');
    assert(readiness.gates?.arbitrary_version_ingestion_enabled === false, 'arbitrary version gate enabled');
    assert(readiness.gates?.answer_generation_enabled === false, 'answer generation gate enabled');
    assert(readiness.gates?.source_corpus_mutation_enabled === false, 'corpus mutation gate enabled');
    assert(readiness.gates?.cross_student_retrieval_enabled === false, 'cross-student gate enabled');
    assert(readiness.retrieval_policy?.apply_authorization_before_retrieval === true, 'authorization-before-retrieval policy missing');
    assert(readiness.retrieval_policy?.arbitrary_versions_allowed === false, 'arbitrary versions allowed');
    assert((readiness.prohibited_behaviors || []).includes('fabricate_citations'), 'fabricated-citation prohibition missing');
    assert((readiness.prohibited_behaviors || []).includes('use_raw_unreviewed_transcripts'), 'raw transcript prohibition missing');
    assert(Array.isArray(readiness.blockers) && readiness.blockers.length === 0, 'unexpected study assistant blockers');
    assert(!includesSecretLikeValue(data), 'secret-like value appeared in readiness response');
    report.requirement_id = readiness.requirement_id;
    report.status = readiness.status;
    report.source_versions_seen = readiness.summary?.source_versions_seen ?? null;
    report.assistant_ready_sources = readiness.summary?.assistant_ready_sources ?? null;
    return `${report.source_versions_seen} sources, ${report.assistant_ready_sources} ready`;
  });

  await step('Operations ships study assistant readiness panel', async () => {
    const { text } = await requestText(`${appUrl}/operations`, { headers: authHeaders });
    assert(text.includes('data-one-time-study-assistant-readiness'), 'Operations missing study assistant marker');
    assert(text.includes('REQ-20260619-312'), 'Operations missing study assistant requirement id');
    assert(text.includes('implemented disabled-feature foundation'), 'Operations missing implemented foundation copy');
    assert(text.includes('arbitrary version ingestion'), 'Operations missing arbitrary-version guardrail');
    assert(text.includes('No arbitrary versions'), 'Operations missing no arbitrary versions row');
    assert(text.includes('Live smoke ready'), 'Operations missing live-smoke-ready state');
    return 'Operations study assistant panel marker and guardrails shipped';
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
