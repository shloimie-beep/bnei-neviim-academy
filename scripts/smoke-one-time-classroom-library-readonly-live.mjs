#!/usr/bin/env node
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { REVIEW_ACCESS_CODE } = require('../src/platform/instances/one-time-shared-review-data.js');
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
    'Read-only live smoke; no access code, class package, library item, classroom thread, progress row, notification, Vimeo, Drive, payment, or external-provider write is performed.',
    'The report stores counts, booleans, enum counts, and route statuses only; it does not store titles, descriptions, media URLs, access codes, cookies, tokens, or private transcript data.',
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
  return path.join(reportDir, `${stamp}-one-time-classroom-library-readonly-live-smoke.${ext}`);
}

function cookieHeader(value) {
  return `${value.name}=${value.value}`;
}

async function fetchJson(route, { headers = {}, acceptStatuses = [200] } = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    headers: {
      accept: 'application/json',
      ...headers,
    },
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`${route} did not return JSON: ${error.message}`);
  }
  assert(acceptStatuses.includes(response.status), `${route} returned ${response.status}: ${text.slice(0, 300)}`);
  return { status: response.status, data };
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

function countBy(rows = [], field) {
  return rows.reduce((counts, row) => {
    const key = String(row?.[field] || 'missing');
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function assertNoPrivatePayload(value = {}, label = 'payload') {
  const serialized = JSON.stringify(value);
  assert(!/"(?:access_code|code|cookie|token|password|authorization)"\s*:/i.test(serialized), `${label} contained credential-like field`);
  assert(
    !/"(?:content_job_id|newsletter_draft|source_media_url|transcript_text|transcript_notes|transcript_review_state|transcript_privacy_class|transcript_segments|transcript_versions|transcript_glossary|transcript_release_audit|metadata_draft|bot_knowledge_handoff|bot_knowledge_status|source_sheet_draft|package_status|updated_by|private_admin_only)"\s*:/i.test(serialized),
    `${label} exposed private transcript/admin field`
  );
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = reportPath('json');
  const mdPath = reportPath('md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((item) => !item.ok);
  fs.writeFileSync(mdPath, `${[
    `# One Time Classroom Library Read-only Live Smoke - ${report.started_at}`,
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
    `- admin_classes_returned: ${report.summary?.admin_classes_returned ?? 'n/a'}`,
    `- admin_published_classes: ${report.summary?.admin_published_classes ?? 'n/a'}`,
    `- admin_classes_with_library_items: ${report.summary?.admin_classes_with_library_items ?? 'n/a'}`,
    `- review_today_video_present: ${report.summary?.review_today_video_present ? 'yes' : 'no'}`,
    `- synthetic_member_items_visible: ${report.summary?.synthetic_member_items_visible ?? 'n/a'}`,
    `- synthetic_member_tier: ${report.summary?.synthetic_member_tier ?? 'n/a'}`,
    `- anonymous_member_library_status: ${report.summary?.anonymous_member_library_status ?? 'n/a'}`,
    `- anonymous_classroom_status: ${report.summary?.anonymous_classroom_status ?? 'n/a'}`,
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
    const { data } = await fetchJson('/api/deploy-info');
    assert(data.status === 'ok', 'deploy-info did not return ok');
    assert(data.target_app === 'one-time', `deploy target was ${data.target_app || '(missing)'}`);
    if (expectedSha) assert(data.commit_sha === expectedSha, `deployed SHA ${data.commit_sha || '(missing)'} did not match ${expectedSha}`);
    report.deployed_sha = data.commit_sha || '';
    return {
      target_app: data.target_app,
      commit_sha: data.commit_sha || '',
      deployment_source: data.deployment_source || '',
    };
  });

  await step('admin class package list has published library items', async () => {
    const { data } = await fetchJson('/api/bna/one-time/classes?limit=10&status=all', { headers: authHeaders });
    assert(data.success === true, 'admin class list did not return success');
    assert(data.project_key === report.project_key, `project key was ${data.project_key || '(missing)'}`);
    const classes = Array.isArray(data.classes) ? data.classes : [];
    const published = classes.filter((item) => item.package_status === 'published');
    const withLibraryItems = classes.filter((item) => Array.isArray(item.library_items) && item.library_items.some((libraryItem) => libraryItem.publish_status === 'published'));
    assert(classes.length > 0, 'no admin class packages returned');
    assert(published.length > 0, 'no published class packages returned');
    assert(withLibraryItems.length > 0, 'no class packages with published library items returned');
    report.summary = {
      ...(report.summary || {}),
      admin_classes_returned: classes.length,
      admin_published_classes: published.length,
      admin_classes_with_library_items: withLibraryItems.length,
      admin_package_statuses: countBy(classes, 'package_status'),
    };
    return {
      classes_returned: classes.length,
      published_classes: published.length,
      classes_with_library_items: withLibraryItems.length,
    };
  });

  await step('review classroom exposes latest-video shape without private fields', async () => {
    const { data } = await fetchJson('/api/one-time-classroom?review=one-time');
    assert(data.success === true, 'review classroom did not return success');
    assert(data.test_only === true, 'review classroom did not mark test_only');
    assert(data.internal_fields_hidden === true, 'review classroom did not mark internal fields hidden');
    const classroom = data.classroom || {};
    assert(classroom.today_video, 'review classroom did not expose today_video');
    assert(classroom.today_video.member_library_item, 'today_video did not include member library item summary');
    assertNoPrivatePayload(classroom, 'review classroom');
    report.summary = {
      ...(report.summary || {}),
      review_today_video_present: true,
      review_class_count: Array.isArray(classroom.classes) ? classroom.classes.length : null,
      review_threads_count: Array.isArray(classroom.threads) ? classroom.threads.length : null,
    };
    return {
      today_video_present: true,
      class_count: report.summary.review_class_count,
      threads_count: report.summary.review_threads_count,
    };
  });

  await step('synthetic review member access reads entitled library without private fields', async () => {
    const { data } = await fetchJson(`/api/member-library?code=${encodeURIComponent(REVIEW_ACCESS_CODE)}`);
    assert(data.success === true, 'member-library synthetic review access did not return success');
    assert(data.internal_fields_hidden === true, 'member-library did not mark internal fields hidden');
    const library = data.member_library || {};
    const access = library.access || {};
    const items = Array.isArray(library.items) ? library.items : [];
    assert(access.status === 'active', `synthetic review access status was ${access.status || '(missing)'}`);
    assert(['live_class', 'library_only'].includes(String(access.tier || '')), `unexpected synthetic review tier ${access.tier || '(missing)'}`);
    assert(items.length > 0, 'synthetic review member access returned no library items');
    assert(items.some((item) => item.media_provider === 'vimeo' || item.vimeo_id), 'synthetic review member item did not include Vimeo media shape');
    assert(data.classroom?.today_video, 'member-library payload did not include classroom today_video');
    assertNoPrivatePayload(data, 'synthetic member-library');
    const serialized = JSON.stringify(data);
    assert(!serialized.includes(REVIEW_ACCESS_CODE), 'member-library response echoed the access code');
    report.summary = {
      ...(report.summary || {}),
      synthetic_member_items_visible: items.length,
      synthetic_member_tier: access.tier || '',
      synthetic_member_status: access.status || '',
      synthetic_member_vimeo_items: items.filter((item) => item.media_provider === 'vimeo' || item.vimeo_id).length,
      synthetic_member_access_code_echoed: false,
    };
    return {
      items_visible: items.length,
      tier: access.tier || '',
      status: access.status || '',
      vimeo_items: report.summary.synthetic_member_vimeo_items,
      access_code_echoed: false,
    };
  });

  await step('anonymous member-library and classroom access stay blocked', async () => {
    const member = await fetchJson('/api/member-library', { acceptStatuses: [401] });
    const classroom = await fetchJson('/api/one-time-classroom', { acceptStatuses: [401] });
    assert(/member session token is required/i.test(String(member.data.error || '')), 'member-library anonymous error was unexpected');
    assert(/member session token is required/i.test(String(classroom.data.error || '')), 'classroom anonymous error was unexpected');
    report.summary = {
      ...(report.summary || {}),
      anonymous_member_library_status: member.status,
      anonymous_classroom_status: classroom.status,
      entitlement_required: true,
    };
    return {
      member_library_status: member.status,
      classroom_status: classroom.status,
      entitlement_required: true,
    };
  });

  report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({
    ok: true,
    report: relative(paths.mdPath),
    deployed_sha: report.deployed_sha,
    external_write_performed: false,
    entitlement_required: true,
  }, null, 2));
}

main().catch((error) => {
  report.status = 'failed';
  try {
    const paths = writeReports();
    console.error(`Report: ${relative(paths.mdPath)}`);
  } catch {
    // Preserve the original failure.
  }
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
