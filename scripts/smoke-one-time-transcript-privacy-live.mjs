#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(root, 'ops', 'live-smokes');
const env = loadSmokeEnv({ root });
const oneTimeRailwayEnv = {
  ...env,
  OPS_USERNAME: '',
  OPS_PASSWORD: '',
  BNA_SMOKE_RAILWAY_PROJECT_ID: env.BNA_SMOKE_RAILWAY_PROJECT_ID || 'ce55ef20-1418-4ad3-aafa-f877fb992dc8',
  BNA_SMOKE_RAILWAY_SERVICE: env.BNA_SMOKE_RAILWAY_SERVICE || 'one-time-web',
  BNA_SMOKE_RAILWAY_ENVIRONMENT: env.BNA_SMOKE_RAILWAY_ENVIRONMENT || 'production',
};

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

const appUrl = String(
  argValue('--base-url') ||
  process.env.ONE_TIME_PUBLIC_BASE_URL ||
  process.env.ONE_TIME_APP_URL ||
  process.env.ONETIME_BASE_URL ||
  env.ONE_TIME_PUBLIC_BASE_URL ||
  env.ONE_TIME_APP_URL ||
  env.ONETIME_BASE_URL ||
  'https://join.onetimeonetime.com'
).replace(/\/+$/, '');
const expectedSha = String(argValue('--expected-sha', process.env.BNA_EXPECT_DEPLOYED_SHA || '')).trim();

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
    `Expected SHA: ${report.expected_sha || '(not provided)'}`,
    `Deployed SHA: ${report.deployed_sha || '(not checked)'}`,
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
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    expected_sha: expectedSha || '',
    steps: [],
  };
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
  await step('Operations login uses One Time Railway auth fallback', async () => {
    const login = await loginOperations({ baseUrl: appUrl, env: oneTimeRailwayEnv, cwd: root });
    assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, login.reason || 'Operations login cookie missing');
    cookie = login.cookie;
    report.auth_source = login.source;
    return `source ${login.source}`;
  });

  const authHeaders = {
    cookie: `${cookie.name}=${cookie.value}`,
  };

  await step('Deploy-info is One Time and matches expected SHA when supplied', async () => {
    const { data } = await requestJson(`${appUrl}/api/deploy-info`);
    assert(data.status === 'ok', 'deploy-info did not return ok');
    assert(data.target_app === 'one-time', `deploy target was ${data.target_app || '(missing)'}`);
    if (expectedSha) assert(data.commit_sha === expectedSha, `deployed SHA ${data.commit_sha || '(missing)'} did not match ${expectedSha}`);
    report.deployed_sha = data.commit_sha || '';
    return `target ${data.target_app}; sha ${data.commit_sha || '(missing)'}`;
  });

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

  await step('Operations bootstrap route loads the split Operations shell', async () => {
    const { text } = await requestText(`${appUrl}/operations`, { headers: authHeaders });
    assert(text.includes('/js/operations-shell.js'), 'Operations bootstrap missing operations shell runtime');
    assert(text.includes('/css/one-time-operations.css'), 'Operations bootstrap missing One Time Operations stylesheet');
    return 'Authenticated /operations route serves the split Operations shell';
  });

  await step('Operations deferred runtime ships transcript privacy panel', async () => {
    const { text } = await requestText(`${appUrl}/js/operations-deferred-renderers.js`, {
      headers: { 'cache-control': 'no-cache' },
    });
    assert(text.includes('data-one-time-transcript-privacy-readiness'), 'Operations deferred runtime missing transcript privacy marker');
    assert(text.includes('REQ-20260619-309'), 'Operations deferred runtime missing transcript privacy requirement id');
    assert(text.includes('guessed speaker identity'), 'Operations deferred runtime missing guessed-speaker guardrail');
    assert(text.includes('Live smoke ready'), 'Operations deferred runtime missing live-smoke-ready state');
    return 'Transcript privacy panel markers shipped in operations-deferred-renderers.js';
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
