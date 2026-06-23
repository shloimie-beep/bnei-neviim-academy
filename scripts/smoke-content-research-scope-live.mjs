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
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requestText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
      'cache-control': 'no-cache',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
  }
  return { response, text };
}

async function requestJson(url, options = {}) {
  const { text } = await requestText(url, {
    ...options,
    headers: { accept: 'application/json', ...(options.headers || {}) },
  });
  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    throw new Error(`${url} did not return JSON: ${error.message}`);
  }
}

function expectIncludes(text, terms, label) {
  const missing = terms.filter((term) => !text.includes(term));
  assert(!missing.length, `${label} missing markers: ${missing.join(', ')}`);
}

function assertProjectRows(rows, expectedProjectKey, label) {
  const badRows = rows.filter((row) => row.project_key && row.project_key !== expectedProjectKey);
  assert(!badRows.length, `${label} returned rows outside ${expectedProjectKey}: ${badRows.map((row) => row.id).slice(0, 8).join(', ')}`);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-content-research-scope-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-content-research-scope-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Content Research Scope Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- health_status: ${report.summary.health_status || 'unknown'}`,
    `- bna_content_jobs: ${report.summary.bna_content_jobs}`,
    `- one_time_content_jobs: ${report.summary.one_time_content_jobs}`,
    `- bna_class_sessions: ${report.summary.bna_class_sessions}`,
    `- one_time_class_sessions: ${report.summary.one_time_class_sessions}`,
    `- prompt_rows: ${report.summary.prompt_rows}`,
    `- operations_markers_checked: ${report.summary.operations_markers_checked}`,
    `- student_markers_checked: ${report.summary.student_markers_checked}`,
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(root, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(root, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const env = { ...loadEnvFile(path.join(root, '.env.local')), ...process.env };
  const appUrl = (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, '');
  const username = env.OPS_USERNAME || '';
  const password = env.OPS_PASSWORD || '';
  if (!username || !password) throw new Error('OPS_USERNAME and OPS_PASSWORD are required');
  const auth = basicAuthHeader(username, password);
  const authedHeaders = { Authorization: auth };
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    summary: {
      health_status: '',
      bna_content_jobs: 0,
      one_time_content_jobs: 0,
      bna_class_sessions: 0,
      one_time_class_sessions: 0,
      prompt_rows: 0,
      operations_markers_checked: 0,
      student_markers_checked: 0,
    },
  };

  async function step(name, fn) {
    const started = Date.now();
    try {
      const details = await fn();
      report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
      console.log(`PASS ${name}`);
      return details;
    } catch (error) {
      report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: error instanceof Error ? error.message : String(error) });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  try {
    await step('public health endpoint', async () => {
      const { data } = await requestJson(`${appUrl}/api/health`);
      assert(data.status === 'ok', 'Health endpoint did not return ok');
      report.summary.health_status = `${data.status}/${data.database || 'unknown'}`;
      return { status: data.status, database: data.database };
    });

    await step('content job project filters are enforced', async () => {
      const { data: bnaData } = await requestJson(`${appUrl}/api/bna/content-jobs?project_key=bna`, { headers: authedHeaders });
      const { data: oneTimeData } = await requestJson(`${appUrl}/api/bna/content-jobs?project_key=one_time_mishnah_class`, { headers: authedHeaders });
      const bnaJobs = Array.isArray(bnaData.jobs) ? bnaData.jobs : [];
      const oneTimeJobs = Array.isArray(oneTimeData.jobs) ? oneTimeData.jobs : [];
      assertProjectRows(bnaJobs, 'bna', 'BNA content jobs');
      assertProjectRows(oneTimeJobs, 'one_time_mishnah_class', 'One Time content jobs');
      report.summary.bna_content_jobs = bnaJobs.length;
      report.summary.one_time_content_jobs = oneTimeJobs.length;
      return { bna: bnaJobs.length, one_time: oneTimeJobs.length };
    });

    await step('class session project filters are enforced', async () => {
      const { data: bnaData } = await requestJson(`${appUrl}/api/bna/class-sessions?project_key=bna`, { headers: authedHeaders });
      const { data: oneTimeData } = await requestJson(`${appUrl}/api/bna/class-sessions?project_key=one_time_mishnah_class`, { headers: authedHeaders });
      const bnaSessions = Array.isArray(bnaData.sessions) ? bnaData.sessions : [];
      const oneTimeSessions = Array.isArray(oneTimeData.sessions) ? oneTimeData.sessions : [];
      assertProjectRows(bnaSessions, 'bna', 'BNA class sessions');
      assertProjectRows(oneTimeSessions, 'one_time_mishnah_class', 'One Time class sessions');
      report.summary.bna_class_sessions = bnaSessions.length;
      report.summary.one_time_class_sessions = oneTimeSessions.length;
      return { bna: bnaSessions.length, one_time: oneTimeSessions.length };
    });

    await step('BNA admin prompt library API returns usable prompts', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/content-prompts`, { headers: authedHeaders });
      const prompts = Array.isArray(data.prompts) ? data.prompts : [];
      const required = ['whatsapp_update', 'facebook_post', 'weekly_newsletter', 'blog_draft', 'parent_email'];
      const missing = required.filter((platform) => !prompts.some((prompt) => prompt.platform === platform && String(prompt.prompt_text || '').trim()));
      assert(!missing.length, `Missing prompt_text for: ${missing.join(', ')}`);
      report.summary.prompt_rows = prompts.length;
      return { prompts: prompts.length };
    });

    await step('Operations content research and prompt markers are deployed', async () => {
      const { text } = await requestText(`${appUrl}/operations?view=content&section=prompts&workspace=bna&smoke=${Date.now()}`, {
        headers: authedHeaders,
      });
      const markers = [
        'data-bna-admin-prompt-library',
        'prompt?.prompt_text',
        'contentDataProjectFilters',
        'Research',
        'Create Student Source Sheet Task',
        'Student Questions',
      ];
      expectIncludes(text, markers, 'Operations content bundle');
      report.summary.operations_markers_checked = markers.length;
      return { markers: markers.length };
    });

    await step('student portal question markers are public-shell safe', async () => {
      const { text } = await requestText(`${appUrl}/student?smoke=${Date.now()}`);
      const markers = [
        'questionsSection',
        'questionList',
        'Review the questions you asked',
        'renderQuestionSources(question.sources)',
        'renderQuestionAssignments(question.assignments)',
      ];
      expectIncludes(text, markers, 'Student portal question bundle');
      report.summary.student_markers_checked = markers.length;
      return { markers: markers.length };
    });
  } finally {
    const paths = writeReports(report);
    report.report_paths = paths;
    const failed = report.steps.filter((step) => !step.ok);
    console.log(JSON.stringify({ ok: failed.length === 0, report: paths.markdown }, null, 2));
    if (failed.length) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
