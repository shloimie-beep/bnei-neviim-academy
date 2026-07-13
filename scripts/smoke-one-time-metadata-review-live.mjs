#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');
const env = loadSmokeEnv({ root: repoRoot });
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

const baseUrl = String(
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
const startedAt = new Date().toISOString();
const stamp = startedAt.replace(/[:.]/g, '-');

const report = {
  started_at: startedAt,
  base_url: baseUrl,
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
  status: 'unknown',
  expected_sha: expectedSha || '',
  external_write_performed: false,
  production_mutation_performed: false,
  steps: [],
  guardrails: [
    'Read-only live smoke; no class, library, transcript, helper-knowledge, Vimeo, Drive, member-access, notification, payment, or external-provider write is performed.',
    'The report stores deploy metadata, counts, field-presence booleans, enum states, and no raw transcript body, title, description, note, cookie, token, or credential value.',
  ],
};

let cookie = null;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-one-time-metadata-review-live-smoke.${ext}`);
}

function cookieHeader(value) {
  return `${value.name}=${value.value}`;
}

async function fetchJson(route, headers = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: {
      accept: 'application/json',
      ...headers,
    },
  });
  const text = await response.text();
  assert(response.status === 200, `${route} returned ${response.status}: ${text.slice(0, 300)}`);
  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`${route} did not return JSON: ${error.message}`);
  }
}

async function step(name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details });
    console.log(`PASS ${name}`);
    return details;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: message });
    console.error(`FAIL ${name}: ${message}`);
    throw error;
  }
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function enumCounts(rows = [], field) {
  return rows.reduce((counts, row) => {
    const key = String(row?.[field] || 'missing');
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = reportPath('json');
  const mdPath = reportPath('md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((item) => !item.ok);
  fs.writeFileSync(mdPath, `${[
    `# One Time Metadata Review Live Smoke - ${report.started_at}`,
    '',
    `Base URL: ${report.base_url}`,
    `Workspace: ${report.workspace_key}`,
    `Project: ${report.project_key}`,
    `Result: ${failed.length ? 'failed' : report.status}`,
    `Expected SHA: ${report.expected_sha || '(not provided)'}`,
    `Deployed SHA: ${report.deployed_sha || '(not checked)'}`,
    '',
    '## Checks',
    ...report.steps.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name} (${item.duration_ms}ms)${item.error ? ` - ${item.error}` : ''}`),
    '',
    '## Summary',
    `- classes_returned: ${report.summary?.classes_returned ?? 'n/a'}`,
    `- list_fields_present: ${report.summary?.list_fields_present ? 'yes' : 'no'}`,
    `- package_fields_present: ${report.summary?.package_fields_present ? 'yes' : 'no'}`,
    `- metadata_review_states: ${JSON.stringify(report.summary?.metadata_review_states || {})}`,
    `- bot_knowledge_statuses: ${JSON.stringify(report.summary?.bot_knowledge_statuses || {})}`,
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
  ].join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  await step('operations login uses One Time Railway auth fallback', async () => {
    const login = await loginOperations({ baseUrl, env: oneTimeRailwayEnv, cwd: repoRoot });
    assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, login.reason || 'Operations login cookie missing');
    cookie = login.cookie;
    return { source: login.source, role: login.role || login.user?.role || 'unknown' };
  });

  const authHeaders = { cookie: cookieHeader(cookie) };

  await step('deploy-info is One Time and matches expected SHA when supplied', async () => {
    const deploy = await fetchJson('/api/deploy-info');
    assert(deploy.status === 'ok', 'deploy-info did not return ok');
    assert(deploy.target_app === 'one-time', `deploy target was ${deploy.target_app || '(missing)'}`);
    if (expectedSha) assert(deploy.commit_sha === expectedSha, `deployed SHA ${deploy.commit_sha || '(missing)'} did not match ${expectedSha}`);
    report.deployed_sha = deploy.commit_sha || '';
    report.deployment_source = deploy.deployment_source || '';
    return {
      target_app: deploy.target_app,
      commit_sha: deploy.commit_sha || '',
      deployment_source: deploy.deployment_source || '',
    };
  });

  await step('class list exposes metadata review and bot-knowledge fields read-only', async () => {
    const data = await fetchJson('/api/bna/one-time/classes?limit=5&status=all', authHeaders);
    assert(data.success === true, 'class list did not return success');
    assert(data.project_key === report.project_key, `project key was ${data.project_key || '(missing)'}`);
    const classes = Array.isArray(data.classes) ? data.classes : [];
    assert(classes.length > 0, 'no One Time classes returned to prove deployed field shape');
    const required = ['metadata_draft', 'metadata_review_state', 'bot_knowledge_handoff', 'bot_knowledge_status'];
    const missing = required.filter((field) => !hasOwn(classes[0], field));
    assert(!missing.length, `class list missing field(s): ${missing.join(', ')}`);
    report.first_class_id_for_detail_probe = classes[0].id;
    report.summary = {
      ...(report.summary || {}),
      classes_returned: classes.length,
      list_fields_present: true,
      metadata_review_states: enumCounts(classes, 'metadata_review_state'),
      bot_knowledge_statuses: enumCounts(classes, 'bot_knowledge_status'),
      package_statuses: enumCounts(classes, 'package_status'),
      media_providers: enumCounts(classes, 'media_provider'),
    };
    return {
      classes_returned: classes.length,
      metadata_review_states: report.summary.metadata_review_states,
      bot_knowledge_statuses: report.summary.bot_knowledge_statuses,
    };
  });

  await step('class package detail exposes private admin review sections read-only', async () => {
    const id = report.first_class_id_for_detail_probe;
    assert(id, 'no class id available for detail probe');
    const data = await fetchJson(`/api/bna/one-time/classes/${encodeURIComponent(id)}`, authHeaders);
    assert(data.success === true, 'class package detail did not return success');
    const pkg = data.package || {};
    const privateOnly = pkg.private_admin_only || {};
    const checks = {
      package_has_metadata_review: Boolean(pkg.metadata_review),
      package_has_bot_knowledge: Boolean(pkg.bot_knowledge),
      private_admin_only_has_metadata_draft: hasOwn(privateOnly, 'metadata_draft'),
      private_admin_only_has_metadata_review_state: hasOwn(privateOnly, 'metadata_review_state'),
      private_admin_only_has_bot_knowledge_handoff: hasOwn(privateOnly, 'bot_knowledge_handoff'),
      private_admin_only_has_bot_knowledge_status: hasOwn(privateOnly, 'bot_knowledge_status'),
    };
    assert(Object.values(checks).every(Boolean), `package detail field check failed: ${JSON.stringify(checks)}`);
    report.summary = {
      ...(report.summary || {}),
      package_fields_present: true,
      sample_detail_states: {
        metadata_review_state: pkg.metadata_review?.state || null,
        bot_knowledge_status: pkg.bot_knowledge?.status || null,
        package_status: pkg.package_status || null,
      },
    };
    delete report.first_class_id_for_detail_probe;
    return checks;
  });

  report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({
    ok: true,
    report: relative(paths.mdPath),
    deployed_sha: report.deployed_sha,
    classes_returned: report.summary.classes_returned,
    external_write_performed: false,
  }, null, 2));
}

main().catch((error) => {
  report.status = 'failed';
  try {
    const paths = writeReports();
    console.error(`Report: ${relative(paths.mdPath)}`);
  } catch {
    // Keep the original smoke failure visible.
  }
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
