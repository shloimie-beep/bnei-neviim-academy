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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
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
  const { response, text } = await requestText(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`${url} did not return JSON: ${error.message}`);
  }
  return { response, data };
}

function expectIncludes(text, terms, label) {
  for (const term of terms) {
    assert(text.includes(term), `${label} missing ${term}`);
  }
}

function expectNotIncludes(text, terms, label) {
  const hits = terms.filter((term) => text.includes(term));
  assert(!hits.length, `${label} exposes forbidden text: ${hits.join(', ')}`);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-operations-settings-dashboard-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-operations-settings-dashboard-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Operations Settings Dashboard Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => {
      const marker = step.ok ? 'PASS' : 'FAIL';
      const detail = step.error ? ` - ${step.error}` : '';
      return `- ${marker} ${step.name} (${step.duration_ms}ms)${detail}`;
    }),
    '',
    '## Summary',
    `- operations_markers_checked: ${report.summary.operations_markers_checked}`,
    `- automation_rows_loaded: ${report.summary.automation_rows_loaded}`,
    `- integration_readiness_loaded: ${report.summary.integration_readiness_loaded}`,
    `- forbidden_secret_terms_found: ${(report.summary.forbidden_secret_terms_found || []).join(', ') || 'none'}`,
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
      operations_markers_checked: 0,
      automation_rows_loaded: 0,
      integration_readiness_loaded: false,
      forbidden_secret_terms_found: [],
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
      report.steps.push({
        name,
        ok: false,
        duration_ms: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  try {
    await step('public health endpoint', async () => {
      const { data } = await requestJson(`${appUrl}/api/health`);
      assert(data.status === 'ok', 'Health endpoint did not return ok');
      assert(data.database === 'connected', 'Database is not connected');
      return { status: data.status, database: data.database };
    });

    await step('operations bundle exposes compact dashboard and settings markers', async () => {
      const { text } = await requestText(`${appUrl}/operations?view=settings&section=integrations_core&workspace=platform&smoke=${Date.now()}`, {
        headers: { Authorization: auth },
      });
      const expected = [
        'function renderDashboardCompactHeader()',
        'dashboard-compact-strip',
        "section === 'alerts'",
        'data-settings-compact-navigation',
        'Users & Roles Access Desk',
        'Learning Portal Access',
        'data-api-usage-limits-by-role',
        'data-billing-payment-workflows',
        'data-real-integrations-setup',
        'Resend Email Provider',
        'Buffer Social Scheduler',
        'WAPI / WhatsApp',
        'Payment Provider',
        'Email provider token via keyholder or provider-scoped secret reference',
        'Social scheduler token and organization/channel IDs',
        'Coming soon / internal-first',
        'Create automation with helper',
        'Automation / Purpose / Trigger',
        'automationEnabledStateLabel',
        'Edit / Details',
      ];
      expectIncludes(text, expected, 'Operations bundle');
      const forbidden = ['BUFFER_API_KEY', 'RESEND_API_KEY'];
      const hits = forbidden.filter((term) => text.includes(term));
      report.summary.forbidden_secret_terms_found = hits;
      expectNotIncludes(text, forbidden, 'Operations bundle');
      report.summary.operations_markers_checked = expected.length;
      return { markers: expected.length };
    });

    await step('automations API loads registry metadata', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/automations`, {
        headers: { Authorization: auth },
      });
      assert(data.success === true, 'Automations API did not return success');
      assert(Array.isArray(data.automations), 'Automations API did not return an automations array');
      report.summary.automation_rows_loaded = data.automations.length;
      return { automations: data.automations.length, filters: Object.keys(data.filters || {}) };
    });

    await step('integration readiness API remains available', async () => {
      const { data } = await requestJson(`${appUrl}/api/bna/integrations/status`, {
        headers: { Authorization: auth },
      });
      assert(data.success === true || Array.isArray(data.integrations) || data.status, 'Integration readiness payload was not recognized');
      report.summary.integration_readiness_loaded = true;
      return { keys: Object.keys(data).slice(0, 10) };
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
