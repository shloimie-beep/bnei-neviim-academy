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
  const jsonPath = path.join(reportDir, `${stamp}-communications-screening-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-communications-screening-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Communications Screening Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- health_status: ${report.summary.health_status || 'unknown'}`,
    `- screening_pipeline: ${report.summary.screening_pipeline || 'unknown'}`,
    `- coaching_categories: ${report.summary.coaching_categories.join(', ') || 'none'}`,
    `- import_preview_rows: ${report.summary.import_preview_rows}`,
    `- wapi_sync_configured: ${report.summary.wapi_sync_configured}`,
    `- operations_markers_checked: ${report.summary.operations_markers_checked}`,
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
      screening_pipeline: '',
      coaching_categories: [],
      import_preview_rows: 0,
      wapi_sync_configured: false,
      operations_markers_checked: 0,
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

    await step('Operations communications bundle markers are deployed', async () => {
      const { text } = await requestText(`${appUrl}/operations?view=communications&section=overview&workspace=platform&smoke=${Date.now()}`, {
        headers: authedHeaders,
      });
      const markers = [
        'data-communication-top-news',
        'data-communication-screening-pipeline',
        'data-contact-import-preview',
        'data-communication-card',
        'communication-detail-grid',
        'Live WAPI pull',
        'Preview Import',
      ];
      expectIncludes(text, markers, 'Operations communications bundle');
      report.summary.operations_markers_checked = markers.length;
      return { markers: markers.length };
    });

    await step('screening preview flags parent accountability without writing', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/contact-communications/screening-preview`, {
        method: 'POST',
        headers: { ...authedHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({
          contact_type: 'lead',
          channel: 'whatsapp',
          direction: 'inbound',
          summary: 'Parent accountability message needs follow-up',
          body: 'Parent says the child is struggling with sleep routine, screens, responsibility, and needs urgent follow up.',
          source_context: { raw_intake_id: 'RAW-SMOKE-COMMUNICATIONS' },
        }),
      });
      assert(data.dry_run === true, 'screening preview was not dry_run');
      assert(data.external_write_performed === false, 'screening preview performed an external write');
      assert(data.screening?.pipeline_categories?.includes('parent_accountability'), 'parent_accountability was not detected');
      assert(data.screening?.coaching_categories?.includes('sleep_routine'), 'sleep_routine was not detected');
      assert(data.screening?.coaching_categories?.includes('screens'), 'screens was not detected');
      assert(data.would_create?.in_app_alert === true, 'preview did not show in-app alert');
      assert(data.would_create?.follow_up_task === true, 'preview did not show follow-up task');
      report.summary.screening_pipeline = data.screening.pipeline_category;
      report.summary.coaching_categories = data.screening.coaching_categories || [];
      return { screening: data.screening, would_create: data.would_create };
    });

    await step('contact import preview maps and dedupes sample export without writing', async () => {
      const csv = [
        'name,email,phone,tags,student_name',
        'Codex Smoke Parent,codex-smoke@example.invalid,+972501234567,parent accountability,Smoke Child',
        'Codex Smoke Provider,provider-smoke@example.invalid,+972509876543,provider,',
      ].join('\n');
      const { data } = await requestJson(`${appUrl}/api/bna/contact-imports/preview`, {
        method: 'POST',
        headers: { ...authedHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({ content: csv, format: 'csv', dry_run: true, workspace_key: 'bna' }),
      });
      assert(data.dry_run === true, 'contact import preview was not dry_run');
      assert(data.external_write_performed === false, 'contact import preview performed an external write');
      assert(data.commit_blocked === true, 'contact import commit was not blocked');
      assert((data.preview || []).length === 2, 'expected two contact preview rows');
      assert(data.summary?.classifications?.parent >= 1, 'parent classification missing');
      report.summary.import_preview_rows = data.preview.length;
      return { summary: data.summary };
    });

    await step('WAPI diagnostics report configured or blocked status', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/wapi/diagnostics`, { headers: authedHeaders });
      assert(data.success === true, 'WAPI diagnostics did not return success');
      assert(Array.isArray(data.required_sync_env), 'required_sync_env missing');
      report.summary.wapi_sync_configured = Boolean(data.sync_configured);
      return {
        sync_configured: Boolean(data.sync_configured),
        required_sync_env: data.required_sync_env,
      };
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
