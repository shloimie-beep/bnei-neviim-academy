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
  try {
    return { response, data: text ? JSON.parse(text) : {} };
  } catch (error) {
    throw new Error(`${url} did not return JSON: ${error.message}`);
  }
}

async function loginOperationsSession(appUrl, username, password) {
  const { response, data } = await requestJson(`${appUrl}/api/operations/login`, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(username, password),
    },
    body: JSON.stringify({ username, password }),
  });
  assert(data.success === true, 'operations login did not return success');
  const cookie = parseSetCookie(response);
  assert(cookie?.name && cookie?.value, 'operations login did not set a session cookie');
  return cookie;
}

function hasSecretLikeText(value) {
  const text = String(value || '');
  return /sk-[A-Za-z0-9_-]+/.test(text) || /\*{8,}[A-Za-z0-9_-]{2,}/.test(text);
}

function transcriptLength(job = {}) {
  return String(job.transcript_text || '').trim().length;
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-class-upload-trace-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-class-upload-trace-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Class Upload Trace Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : report.result}`,
    `Content job: #${report.job_id || 'n/a'} ${report.job_title || ''}`.trim(),
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Trace Evidence',
    `- Source type: ${report.source_type || 'n/a'}`,
    `- Workspace/project: ${report.workspace_key || 'n/a'} / ${report.project_key || 'n/a'}`,
    `- Drive stage/status: ${report.drive_stage || 'n/a'} / ${report.status || 'n/a'}`,
    `- Drive file id: ${report.drive_file_id || 'n/a'}`,
    `- Created at: ${report.created_at || 'n/a'}`,
    `- Transcript chars: ${report.transcript_chars ?? 'n/a'}`,
    `- Parse run for source #${report.job_id || 'n/a'}: ${report.parse_run_id || 'none'}`,
    `- Blocker: ${report.blocker || 'none'}`,
    '',
    '## Guardrails',
    '- Readback evidence only; no transcript body is written to this report.',
    '- No parse-run apply, task filing, external send, billing, Zoom, Vimeo, Buffer, DNS, CRM/GHL, WhatsApp, or email write is performed by this smoke.',
    '- The live content job notes were checked for secret-like credential material before this smoke passed.',
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
  const targetJobId = Number(process.argv.find((arg) => /^\d+$/.test(arg)) || env.CLASS_UPLOAD_TRACE_JOB_ID || 78);
  assert(username && password, 'OPS_USERNAME and OPS_PASSWORD are required for live smoke');

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    job_id: targetJobId,
    steps: [],
    result: 'readback_started',
  };
  const step = async (name, fn) => {
    try {
      const detail = await fn();
      report.steps.push({ name, ok: true, detail: detail || '' });
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

  let job = null;
  await step('Content job source readback', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/content-jobs?limit=100`, {
      headers: {
        authorization: basicAuthHeader(username, password),
        cookie: `${cookie.name}=${cookie.value}`,
      },
    });
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    job = jobs.find((candidate) => Number(candidate.id) === targetJobId) || null;
    assert(job, `content job #${targetJobId} was not returned by live readback`);
    report.job_title = job.title || '';
    report.source_type = job.source_type || '';
    report.workspace_key = job.workspace_key || job.workspace || '';
    report.project_key = job.project_key || job.project || '';
    report.drive_stage = job.drive_stage || '';
    report.status = job.status || '';
    report.drive_file_id = job.drive_file_id || '';
    report.created_at = job.created_at || '';
    report.transcript_chars = transcriptLength(job);
    assert(job.source_type === 'google_drive', `expected google_drive source, got ${job.source_type || 'none'}`);
    assert(job.drive_file_id, 'content job is missing drive_file_id provenance');
    assert(job.created_at, 'content job is missing created_at provenance');
    return `${job.title || 'untitled'} (${job.status || 'unknown'}, ${job.drive_stage || 'no stage'})`;
  });

  await step('Drive-backed content job state is explicit', async () => {
    const status = String(job.status || '').toLowerCase();
    const driveStage = String(job.drive_stage || '');
    const notes = String(job.notes || '');
    assert(!hasSecretLikeText(notes), 'content job notes still contain secret-like material');

    if (status === 'blocked') {
      assert(driveStage === '02 Ingesting', `expected drive_stage 02 Ingesting, got ${job.drive_stage || 'none'}`);
      assert(transcriptLength(job) === 0, 'blocked job unexpectedly has transcript text');
      assert(/Batch 9B reprocess blocker/.test(notes), 'sanitized Batch 9B blocker note is missing');
      assert(/401 invalid_credential/.test(notes), 'sanitized credential blocker is missing');
      report.result = 'blocked_verified';
      report.blocker = 'OpenAI transcription credential rejected with 401 invalid_credential before transcript or parse run could be created.';
      return 'sanitized credential blocker present; no transcript body stored';
    }

    assert(
      ['transcribed', 'parsed', 'complete', 'completed'].includes(status) || /^0[34]\s/.test(driveStage),
      `expected blocked or processed content job state, got status=${job.status || 'none'} stage=${job.drive_stage || 'none'}`
    );
    assert(transcriptLength(job) > 0, 'processed Drive job is missing transcript text');
    report.result = 'processed_readback_verified';
    report.blocker = /401 invalid_credential/i.test(notes)
      ? 'Historical sanitized credential blocker note retained after the job reached processed state.'
      : '';
    return `processed state ${job.status || 'unknown'} / ${job.drive_stage || 'no stage'} with ${transcriptLength(job)} transcript chars`;
  });

  await step('Parse-run linkage matches content job state', async () => {
    const { data } = await requestJson(`${appUrl}/api/bna/intake/parse-runs?limit=80`, {
      headers: {
        authorization: basicAuthHeader(username, password),
        cookie: `${cookie.name}=${cookie.value}`,
      },
    });
    const runs = Array.isArray(data.runs) ? data.runs : [];
    const run = runs.find((candidate) => (
      String(candidate.source_type || '') === 'content_recording'
      && String(candidate.source_id || '') === String(targetJobId)
    ));
    report.parse_run_id = run?.id || null;
    if (String(job.status || '').toLowerCase() === 'blocked') {
      if (run) throw new Error(`blocked job unexpectedly has parse run #${run.id}`);
      return 'no parse run; blocker occurred before transcription completed';
    }
    if (String(job.drive_stage || '').startsWith('04') || String(job.status || '').toLowerCase() === 'parsed') {
      if (!run) return 'parsed Drive job was not present in the recent parse-run listing';
      return `linked parse run #${run.id}`;
    }
    return 'transcribed-only state does not require a parse run yet';
  });

  const paths = writeReports(report);
  console.log(JSON.stringify({
    ok: true,
    result: report.result,
    job_id: report.job_id,
    status: report.status,
    drive_stage: report.drive_stage,
    parse_run_id: report.parse_run_id,
    report: path.relative(root, paths.mdPath).replace(/\\/g, '/'),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
