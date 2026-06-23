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
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${text.slice(0, 700)}`);
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

function allParsedItems(parsed = {}) {
  const keys = [
    'tasks',
    'decisions',
    'tickets',
    'calendar_events',
    'content_items',
    'communications',
    'contact_items',
    'integration_items',
    'student_notes',
    'student_questions',
    'student_observations',
    'class_session_notes',
    'research_items',
    'accounting_items',
    'goals',
    'attendance',
    'assignments',
    'behavior_notes',
    'provider_leads',
    'workspace_routing',
  ];
  return keys.flatMap((key) => Array.isArray(parsed[key]) ? parsed[key] : []);
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-source-envelope-parser-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-source-envelope-parser-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# Source Envelope Parser Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    `Dry run: ${report.dry_run === true ? 'true' : 'false'}`,
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Parse Evidence',
    `- Raw intake: ${report.raw_intake_stable_id || 'n/a'}`,
    `- Parse run: ${report.parse_run_id || 'n/a'}`,
    `- Source envelope: ${report.source_envelope_summary || 'n/a'}`,
    `- Operations override: ${report.operations_override_summary || 'n/a'}`,
    '',
    '## Guardrails',
    '- Synthetic fixture only; no private source text.',
    '- `dry_run: true`; no parse-run apply, task filing, external send, billing, Zoom, Vimeo, Buffer, DNS, or CRM/GHL write.',
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

  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    steps: [],
    dry_run: true,
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

  let parseData;
  await step('Dry-run parse source envelope fixture', async () => {
    const smokeId = `batch9a-source-envelope-${Date.now()}`;
    const { data } = await requestJson(`${appUrl}/api/bna/intake/parse`, {
      method: 'POST',
      headers: {
        authorization: basicAuthHeader(username, password),
        cookie: `${cookie.name}=${cookie.value}`,
      },
      body: JSON.stringify({
        dry_run: true,
        source_type: 'codex_chat',
        source_channel: 'codex_chat',
        source_id: smokeId,
        filename: 'Dratler family meeting 2026-06-21 transcript.txt',
        raw_input: [
          'Menachem should practice the synthetic bedtime routine.',
          'Operations task: Codex should update synthetic parser evidence.',
        ].join('\n'),
      }),
    });
    assert(data.success === true, 'parse endpoint did not return success');
    assert(data.dry_run === true, 'parse endpoint did not remain dry-run');
    assert(!data.apply, 'dry-run parse unexpectedly returned an apply result');
    parseData = data;
    report.raw_intake_stable_id = data.raw_intake?.stable_id || null;
    report.parse_run_id = data.parse_run?.id || null;
    return `parse run ${report.parse_run_id || 'n/a'}`;
  });

  await step('Envelope has required fields and Dratler default', async () => {
    const envelope = parseData.parsed?.source_envelope || parseData.parse_run?.parse_json?.source_envelope || null;
    assert(envelope && typeof envelope === 'object', 'missing parsed source_envelope');
    for (const field of [
      'source_id',
      'source_hash',
      'filename',
      'source_channel',
      'upload_time',
      'language',
      'default_workspace',
      'default_project',
      'default_context_type',
      'source_level_confidence',
      'privacy_level',
      'parser_version',
      'processing_status',
    ]) {
      assert(envelope[field] !== undefined && envelope[field] !== null, `source_envelope missing ${field}`);
    }
    assert(envelope.default_context_type === 'family_meeting', `expected family_meeting, got ${envelope.default_context_type}`);
    assert(envelope.default_workspace === 'dratler_family', `expected dratler_family workspace, got ${envelope.default_workspace}`);
    assert(envelope.default_project === 'dratler_family', `expected dratler_family project, got ${envelope.default_project}`);
    assert(envelope.privacy_level === 'private', `expected private privacy, got ${envelope.privacy_level}`);
    report.source_envelope_summary = `${envelope.default_context_type} ${envelope.default_workspace}/${envelope.default_project}`;
    return report.source_envelope_summary;
  });

  await step('Operations fragment overrides local item scope', async () => {
    const items = allParsedItems(parseData.parsed || {});
    const override = items.find((item) => (
      item?.metadata?.source_context?.override_applied === true
      && item.metadata.source_context.context_type === 'operations_ramble'
      && item.workspace_key === 'internal_super_admin'
      && item.project_key === 'bna_operations'
    ));
    assert(override, 'missing Operations local override item');
    report.operations_override_summary = `${override.item_type || 'item'} ${override.workspace_key}/${override.project_key}`;
    return report.operations_override_summary;
  });

  const paths = writeReports(report);
  console.log(`Source envelope parser live smoke passed: ${paths.mdPath}`);
}

main().catch((error) => {
  const report = {
    started_at: new Date().toISOString(),
    app_url: (process.env.BNA_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, ''),
    dry_run: true,
    steps: [{ name: 'fatal', ok: false, detail: error.message }],
  };
  const paths = writeReports(report);
  console.error(`Source envelope parser live smoke failed: ${error.message}`);
  console.error(`Report: ${paths.mdPath}`);
  process.exit(1);
});
