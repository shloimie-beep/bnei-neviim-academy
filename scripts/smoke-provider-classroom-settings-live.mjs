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

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-provider-classroom-settings-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-provider-classroom-settings-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Provider Classroom Settings Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- provider_markers_checked: ${report.summary.provider_markers_checked}`,
    `- operations_markers_checked: ${report.summary.operations_markers_checked}`,
    `- health_status: ${report.summary.health_status || 'unknown'}`,
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
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    summary: {
      provider_markers_checked: 0,
      operations_markers_checked: 0,
      health_status: '',
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

    await step('provider portal exposes classroom draft setup', async () => {
      const { text } = await requestText(`${appUrl}/provider?smoke=${Date.now()}`);
      const markers = [
        'data-provider-classroom-setup',
        'data-provider-natural-language-classroom',
        'classroomDraftForm',
        '/api/provider-portal/classroom-drafts',
        'Preview No-Write',
        'student_to_teacher_replies',
        'teacher_moderation_required',
        'student_to_student_chat_enabled: false',
        'Classrooms',
      ];
      expectIncludes(text, markers, 'Provider portal');
      report.summary.provider_markers_checked = markers.length;
      return { markers: markers.length };
    });

    await step('operations exposes provider settings and Rabbi moderation markers', async () => {
      const { text } = await requestText(`${appUrl}/operations?view=settings&section=provider_onboarding&workspace=platform&smoke=${Date.now()}`, {
        headers: { Authorization: auth },
      });
      const markers = [
        'data-provider-index-settings-map',
        'Public Provider Index',
        'Provider Plans',
        'Provider Entitlements',
        'Provider Onboarding',
        'Commercial Models',
        'Free for now',
        'data-provider-classroom-setup-settings',
        'data-provider-natural-language-classroom-draft',
        'create_provider_classroom_draft',
        'data-rabbi-classroom-reply-publish-rules',
        'Display / publish controls',
        'Students can reply privately to Rabbi/admin threads',
      ];
      expectIncludes(text, markers, 'Operations bundle');
      report.summary.operations_markers_checked = markers.length;
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
