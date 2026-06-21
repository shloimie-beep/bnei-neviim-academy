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

function loadInventorySource() {
  const inventoryPath = path.join(root, 'ops', 'one-time-mishnah', 'downloads-spreadsheet-inventory.json');
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const item = inventory.items.find((candidate) => candidate.classification === 'one_time_rabbi_scheller_followers');
  assert(item, 'one_time_rabbi_scheller_followers inventory item was not found');
  return item;
}

function writeReports(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-one-time-crm-import-dedupe-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-one-time-crm-import-dedupe-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  const failed = report.steps.filter((step) => !step.ok);
  const lines = [
    `# One Time CRM Import Dedupe Live Smoke - ${report.started_at}`,
    '',
    `App: ${report.app_url}`,
    `Result: ${failed.length ? 'failed' : 'passed'}`,
    '',
    '## Checks',
    ...report.steps.map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.detail ? `: ${step.detail}` : ''}`),
    '',
    '## Preview Evidence',
    `- Source inventory ID: ${report.source_inventory_id || 'n/a'}`,
    `- Scope: ${report.scope || 'n/a'}`,
    `- Preview rows: ${report.preview_rows ?? 'n/a'}`,
    `- Possible duplicates: ${report.possible_duplicates ?? 'n/a'}`,
    `- Commit blocked: ${report.commit_blocked === true ? 'true' : 'false'}`,
    '',
    '## Guardrails',
    '- Synthetic `.invalid` rows only; no real private contact rows are submitted or written to this report.',
    '- Dry-run preview only; no contact, tag, email, WhatsApp, external CRM, GHL/LeadConnector, billing, or local import write.',
    '- Preview response is checked for scoped dedupe keys and absence of raw `source_row` dumps.',
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

  const source = loadInventorySource();
  const report = {
    started_at: new Date().toISOString(),
    app_url: appUrl,
    source_inventory_id: source.id,
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
  await step('Operations login', async () => {
    cookie = await loginOperationsSession(appUrl, username, password);
    return `cookie ${cookie.name}`;
  });

  let previewData;
  await step('Preview One Time CRM import without writes', async () => {
    const csv = [
      'name,email,phone,tags,student_name',
      'Codex One Time Warm Lead,codex-onetime-lead@example.invalid,+972501234567,warm lead;one time,Codex Child',
      'Codex One Time Referral,codex-onetime-referral@example.invalid,+972509876543,referral;one time,',
    ].join('\n');
    const { data } = await requestJson(`${appUrl}/api/bna/contact-imports/preview`, {
      method: 'POST',
      headers: {
        authorization: basicAuthHeader(username, password),
        cookie: `${cookie.name}=${cookie.value}`,
      },
      body: JSON.stringify({
        content: csv,
        format: 'csv',
        dry_run: true,
        project_key: 'one_time_mishnah_class',
        workspace_key: 'rabbi_sheller_provider',
        source_inventory_id: source.id,
        source_sha256: source.sha256,
        source_classification: source.classification,
        recommended_lane: source.recommended_lane,
      }),
    });
    previewData = data;
    report.preview_rows = data.preview?.length || 0;
    report.possible_duplicates = data.summary?.possible_duplicates || 0;
    report.commit_blocked = data.commit_blocked === true;
    report.scope = `${data.scope?.workspace_key || 'n/a'} / ${data.scope?.project_key || 'n/a'}`;
    return `${report.preview_rows} rows`;
  });

  await step('Preview response has 9D safety policy', async () => {
    assert(previewData.success === true, 'preview did not return success');
    assert(previewData.dry_run === true, 'preview was not dry_run');
    assert(previewData.no_send === true, 'preview was not no_send');
    assert(previewData.external_write_performed === false, 'preview performed external write');
    assert(previewData.external_crm_write_performed === false, 'preview performed external CRM write');
    assert(previewData.local_write_performed === false, 'preview performed local import write');
    assert(previewData.commit_blocked === true, 'commit was not blocked');
    assert(previewData.import_policy?.mode === 'preview_only', 'preview_only policy missing');
    assert(previewData.import_policy?.warm_leads_no_send_until_approval === true, 'warm lead no-send policy missing');
    assert(previewData.import_policy?.raw_upload_content_returned === false, 'raw upload return flag missing');
    assert((previewData.import_policy?.forbidden_external_runtimes || []).includes('ghl'), 'GHL forbidden runtime missing');
    return 'preview-only/no-send/no-GHL policy present';
  });

  await step('Inventory source and One Time scope are attached', async () => {
    assert(previewData.source_inventory?.source_inventory_id === source.id, 'source inventory id was not echoed');
    assert(previewData.source_inventory?.source_sha256 === source.sha256, 'source inventory hash was not echoed');
    assert(previewData.source_inventory?.raw_source_committed === false, 'raw source committed flag was not false');
    assert(previewData.scope?.project_key === 'one_time_mishnah_class', `unexpected project scope ${previewData.scope?.project_key}`);
    assert(previewData.scope?.workspace_key === 'rabbi_sheller_provider', `unexpected workspace scope ${previewData.scope?.workspace_key}`);
    return 'inventory source and One Time scope present';
  });

  await step('Rows have scoped dedupe metadata and no raw source rows', async () => {
    const rows = previewData.preview || [];
    assert(rows.length === 2, `expected 2 preview rows, got ${rows.length}`);
    for (const row of rows) {
      assert(row.project_key === 'one_time_mishnah_class', 'row missing One Time project');
      assert(row.workspace_key === 'rabbi_sheller_provider', 'row missing One Time workspace');
      assert(row.no_send === true, 'row no_send missing');
      assert(row.external_write_performed === false, 'row external write flag missing');
      assert(row.local_write_performed === false, 'row local write flag missing');
      assert(row.dedupe_key && /^[a-f0-9]{24,48}$/i.test(row.dedupe_key), 'row dedupe key missing');
      assert(['email', 'phone', 'row'].includes(row.dedupe_basis), 'row dedupe basis missing');
      assert(!Object.prototype.hasOwnProperty.call(row, 'source_row'), 'row exposed raw source_row');
      assert(row.import_status === 'preview_only_approval_required', 'row import status missing');
    }
    return 'scoped row dedupe metadata present';
  });

  const paths = writeReports(report);
  console.log(JSON.stringify({
    ok: true,
    report: path.relative(root, paths.mdPath).replace(/\\/g, '/'),
    preview_rows: report.preview_rows,
    source_inventory_id: report.source_inventory_id,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
