#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');
const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function absoluteUrl(baseUrl, route) {
  return `${String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '')}${route}`;
}

async function requestText(baseUrl, route, { cookie = '', accept = 'text/html,application/json;q=0.9,*/*;q=0.8' } = {}) {
  const response = await fetch(absoluteUrl(baseUrl, route), {
    headers: {
      accept,
      'cache-control': 'no-cache',
      ...(cookie ? { cookie } : {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${route} returned ${response.status}: ${text.slice(0, 500)}`);
  return { response, text };
}

async function requestJson(baseUrl, route, { cookie = '' } = {}) {
  const { text } = await requestText(baseUrl, route, {
    cookie,
    accept: 'application/json,*/*;q=0.8',
  });
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${route} did not return JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function expectIncludes(text, terms, label) {
  const missing = terms.filter((term) => !text.includes(term));
  assert(!missing.length, `${label} missing markers: ${missing.join(', ')}`);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-rabbi-scheller-workspace-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-rabbi-scheller-workspace-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Rabbi Scheller Workspace Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Deployment: ${report.deployment_id || 'unknown'}`,
    `Commit: ${report.commit || 'unknown'}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Steps',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name} (${step.duration_ms}ms)${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Summary',
    `- operations_auth_source: ${report.summary.operations_auth_source || 'unknown'}`,
    `- scoped_task_count_sample: ${report.summary.scoped_task_count_sample}`,
    `- provider_markers_checked: ${report.summary.provider_markers_checked}`,
    `- operations_markers_checked: ${report.summary.operations_markers_checked}`,
    '',
    'No database writes, external sends, charges, access grants, credential rotations, DNS changes, provider account changes, or integration mutations were performed.',
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return {
    json: path.relative(repoRoot, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(repoRoot, mdPath).replace(/\\/g, '/'),
  };
}

async function main() {
  const env = loadSmokeEnv({ root: repoRoot });
  const appUrl = (env.BNA_APP_URL || env.BNA_LIVE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    deployment_id: env.BNA_SMOKE_DEPLOYMENT_ID || '',
    commit: env.BNA_SMOKE_COMMIT || '',
    steps: [],
    summary: {
      operations_auth_source: '',
      scoped_task_count_sample: 0,
      provider_markers_checked: 0,
      operations_markers_checked: 0,
    },
  };
  let operationsCookie = '';

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
      const data = await requestJson(appUrl, '/api/health');
      assert(data.status === 'ok', 'Health endpoint did not return ok');
      return { status: data.status, database: data.database || 'unknown' };
    });

    await step('provider portal exposes honest API Usage preview bundle', async () => {
      const { text } = await requestText(appUrl, `/provider?api_usage_preview=1&section=api_usage&smoke=${Date.now()}`);
      const markers = [
        'ACTION-PROVIDER-SECTION-NAVIGATION',
        'api_usage_preview',
        'providerApiUsagePreviewEnabled',
        'API Usage',
        'No usage events recorded',
        'This page is intentionally empty until the backend recorder and aggregation endpoint are enabled',
      ];
      expectIncludes(text, markers, 'Provider portal bundle');
      for (const forbiddenLabel of ['Platform Suite', 'Team/Admin', 'Accounting']) {
        assert(!text.includes(forbiddenLabel), `Provider bundle exposes super-admin label: ${forbiddenLabel}`);
      }
      const textWithoutBoundaryDenials = text
        .replace(/No cross-account super-admin access/gi, '')
        .replace(/does not receive super-admin access/gi, '');
      assert(!/\bsuper[-\s]?admin\b/i.test(textWithoutBoundaryDenials), 'Provider bundle exposes super-admin labels outside boundary denial copy');
      report.summary.provider_markers_checked = markers.length;
      return { markers: markers.length };
    });

    await step('operations login exposes portal chooser bundle', async () => {
      const { text } = await requestText(appUrl, `/operations-login.html?smoke=${Date.now()}`);
      const markers = [
        'id="chooser"',
        'showChooser',
        'ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION',
        '/api/operations/login',
        'returnTo',
      ];
      expectIncludes(text, markers, 'Operations login bundle');
      return { markers: markers.length };
    });

    await step('operations login session', async () => {
      const login = await loginOperations({ baseUrl: appUrl, env, cwd: repoRoot });
      assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, 'Operations session cookie missing');
      operationsCookie = `${login.cookie.name}=${login.cookie.value}`;
      report.summary.operations_auth_source = login.source || 'unknown';
      return { auth_source: login.source, role: login.role || login.user?.role || 'unknown' };
    });

    await step('operations Rabbi workspace route bundle is deployed', async () => {
      const { text } = await requestText(appUrl, `/operations?workspace=rabbi_sheller_provider&view=api_usage&smoke=${Date.now()}`, {
        cookie: operationsCookie,
      });
      const markers = [
        'rabbi_sheller_provider',
        'one_time_mishnah_class',
        'Token/cost values stay blank until backend tracking is added',
        'No fake cost is shown until API metering persistence exists',
      ];
      expectIncludes(text, markers, 'Operations Rabbi workspace bundle');
      report.summary.operations_markers_checked = markers.length;
      return { markers: markers.length };
    });

    await step('operations scoped task API accepts Rabbi project filter', async () => {
      const data = await requestJson(appUrl, '/api/bna/tasks?project_key=one_time_mishnah_class&limit=5', {
        cookie: operationsCookie,
      });
      const tasks = Array.isArray(data.tasks) ? data.tasks : [];
      report.summary.scoped_task_count_sample = tasks.length;
      return { task_count_sample: tasks.length };
    });
  } finally {
    const paths = writeReports(report);
    report.report_paths = paths;
    console.log(JSON.stringify({ ok: report.steps.every((stepItem) => stepItem.ok), report: paths.markdown }, null, 2));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
