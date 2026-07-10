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
const baseUrl = String(
  process.env.ONE_TIME_PUBLIC_BASE_URL ||
  process.env.ONE_TIME_APP_URL ||
  process.env.ONETIME_BASE_URL ||
  env.ONE_TIME_PUBLIC_BASE_URL ||
  env.ONE_TIME_APP_URL ||
  env.ONETIME_BASE_URL ||
  'https://join.onetimeonetime.com'
).replace(/\/+$/, '');
const startedAt = new Date().toISOString();
const stamp = startedAt.replace(/[:.]/g, '-');
const testEmail = `test-onetime-crm-e2e-${stamp}@example.invalid`.toLowerCase();
const testParentName = `TEST OneTime CRM E2E ${stamp}`;
const testStudentName = `TEST Student ${stamp}`;
let authCookie = '';
let createdLeadId = null;
let archivedLead = false;

const report = {
  started_at: startedAt,
  base_url: baseUrl,
  status: 'unknown',
  test_email: testEmail,
  steps: [],
  guardrails: [
    'Synthetic TEST/example.invalid lead only.',
    'Telegram reminder must be skipped by the public interest route.',
    'No email, WhatsApp/WAPI, checkout, access grant, Zoom, Vimeo, Drive, DNS, or external CRM write is performed.',
    'CRM lead is archived after visible CRM/timeline readback.',
    'Append-only product lead row may remain as TEST proof; no raw private data is submitted.',
  ],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-one-time-interest-crm-e2e-live-smoke.${ext}`);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function cookieHeader() {
  return authCookie ? { cookie: authCookie } : {};
}

async function fetchText(route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, options);
  const text = await response.text();
  return { response, text };
}

async function fetchJson(route, options = {}) {
  const { response, text } = await fetchText(route, options);
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  return { response, data, text };
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

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = reportPath('json');
  const mdPath = reportPath('md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, `${[
    `# OneTime Interest CRM E2E Live Smoke - ${report.started_at}`,
    '',
    `Base URL: ${report.base_url}`,
    `Result: ${report.status}`,
    `Test email: ${report.test_email}`,
    `CRM lead id: ${createdLeadId || '(not created)'}`,
    `Archived lead: ${archivedLead ? 'yes' : 'no'}`,
    '',
    '## Checks',
    ...report.steps.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name} (${item.duration_ms}ms)${item.error ? ` - ${item.error}` : ''}`),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
  ].join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function archiveLeadIfNeeded() {
  if (!createdLeadId || archivedLead || !authCookie) return;
  const { response, data, text } = await fetchJson(`/api/bna/parent-leads/${encodeURIComponent(createdLeadId)}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      ...cookieHeader(),
    },
    body: JSON.stringify({
      status: 'archived',
      notes: `Archived after OneTime CRM E2E smoke ${stamp}. Product lead remains TEST/example.invalid proof.`,
      metadata: {
        smoke: 'one_time_interest_crm_e2e',
        cleanup: 'archived_after_visible_crm_readback',
        archived_at: new Date().toISOString(),
        test_email: testEmail,
      },
    }),
  });
  assert(response.status === 200 && data.success === true, `cleanup archive returned ${response.status}: ${text.slice(0, 500)}`);
  archivedLead = true;
}

async function main() {
  await step('operations login uses One Time Railway auth fallback', async () => {
    const login = await loginOperations({ baseUrl, env: oneTimeRailwayEnv, cwd: repoRoot });
    assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, login.reason || 'Operations login cookie missing');
    authCookie = `${login.cookie.name}=${login.cookie.value}`;
    return { source: login.source, role: login.role || login.user?.role || 'unknown' };
  });

  const created = await step('public interest submit writes scoped TEST CRM lead without Telegram reminder', async () => {
    const payload = {
      parent_name: testParentName,
      email: testEmail,
      student_name: testStudentName,
      phone: '+1 555 010 1188',
      consent: true,
      source_landing_page: '/one-time#crm-e2e-smoke',
      preferred_class_format: 'free_zoom_intro',
      metadata: {
        smoke: 'one_time_interest_crm_e2e',
        synthetic_test_lead: true,
        test_e2e: true,
        external_write_expected: false,
      },
    };
    const { response, data, text } = await fetchJson('/api/one-time/interest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert(response.status === 200, `/api/one-time/interest returned ${response.status}: ${text.slice(0, 500)}`);
    assert(data.success === true, 'public interest submit did not return success');
    assert(data.internal_crm_recorded === true, 'CRM record was not reported as recorded');
    assert(Number(data.crm_lead_id) > 0, 'crm_lead_id missing');
    assert(data.no_telegram_reminder_sent === true, 'synthetic route did not skip Telegram reminder');
    assert(data.telegram_reminder_skipped === true, 'telegram_reminder_skipped flag missing');
    assert(data.transactional_follow_up_logged === true, 'transactional follow-up ledger was not reported');
    assert(data.transactional_follow_up_send_blocked === true, 'transactional follow-up send_blocked flag missing');
    assert(data.no_email_sent === true, 'email send guardrail missing');
    assert(data.no_whatsapp_or_wapi_sent === true, 'WhatsApp/WAPI send guardrail missing');
    assert(Array.isArray(data.transactional_follow_up?.attempts), 'transactional follow-up attempts missing');
    assert(data.transactional_follow_up.attempts.some((attempt) => attempt.channel === 'email'), 'email follow-up attempt missing');
    assert(data.transactional_follow_up.attempts.some((attempt) => attempt.channel === 'whatsapp'), 'WhatsApp follow-up attempt missing');
    assert(data.external_write_performed === false, 'external_write_performed was not false');
    assert(data.no_checkout === true, 'checkout guardrail missing');
    assert(data.no_access_granted === true, 'access grant guardrail missing');
    createdLeadId = Number(data.crm_lead_id);
    return {
      product_lead_id: data.lead?.id || null,
      crm_lead_id: createdLeadId,
      telegram_reminder_skip_reason: data.telegram_reminder_skip_reason,
      transactional_follow_up: {
        logged: data.transactional_follow_up_logged,
        send_blocked: data.transactional_follow_up_send_blocked,
        attempts: data.transactional_follow_up.attempts.map((attempt) => ({
          channel: attempt.channel,
          created: attempt.created,
          skipped: attempt.skipped || false,
          delivery_status: attempt.delivery_status,
        })),
      },
    };
  });

  await step('admin parent-lead search finds the TEST CRM lead', async () => {
    const route = `/api/bna/parent-leads?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&status=follow_up`;
    const { response, data, text } = await fetchJson(route, { headers: cookieHeader() });
    assert(response.status === 200, `parent-leads readback returned ${response.status}: ${text.slice(0, 500)}`);
    const lead = (data.leads || []).find((row) => Number(row.id) === Number(created.crm_lead_id) || String(row.parent_email || '').toLowerCase() === testEmail);
    assert(lead, 'created lead was not visible in parent-leads readback');
    assert(lead.project_key === 'one_time_mishnah_class', `lead project_key mismatch: ${lead.project_key}`);
    assert(String(lead.status || '').toLowerCase() === 'follow_up', `lead status mismatch: ${lead.status}`);
    assert((lead.tags || []).includes('free-class-interest'), 'free-class-interest tag missing');
    return { id: lead.id, project_key: lead.project_key, status: lead.status, tags: lead.tags };
  });

  const crmCard = await step('CRM contact search finds the TEST lead card', async () => {
    const route = `/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&search=${encodeURIComponent(testEmail)}`;
    const { response, data, text } = await fetchJson(route, { headers: cookieHeader() });
    assert(response.status === 200, `CRM contact search returned ${response.status}: ${text.slice(0, 500)}`);
    const card = (data.cards || []).find((row) => String(row.email || '').toLowerCase() === testEmail || String(row.id || '') === `bna_parent_leads:${createdLeadId}`);
    assert(card, 'created lead was not visible in CRM contact cards');
    assert(card.id === `bna_parent_leads:${createdLeadId}`, `CRM card id mismatch: ${card.id}`);
    assert(card.project_key === 'one_time_mishnah_class', `CRM card project mismatch: ${card.project_key}`);
    return { id: card.id, display_name: card.display_name, status: card.status, project_key: card.project_key };
  });

  await step('CRM timeline shows the captured signup and blocked follow-up attempts', async () => {
    const route = `/api/bna/crm/contacts/${encodeURIComponent(crmCard.id)}/timeline?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class`;
    const { response, data, text } = await fetchJson(route, { headers: cookieHeader() });
    assert(response.status === 200, `CRM timeline returned ${response.status}: ${text.slice(0, 500)}`);
    const item = (data.timeline || []).find((row) => /OneTime free-class public signup captured/i.test(`${row.body || ''} ${row.notes || ''}`));
    assert(item, 'signup capture timeline item missing');
    const emailAttempt = (data.timeline || []).find((row) => /transactional email follow-up blocked/i.test(`${row.body || ''} ${row.summary || ''}`));
    const whatsappAttempt = (data.timeline || []).find((row) => /transactional WhatsApp follow-up blocked/i.test(`${row.body || ''} ${row.summary || ''}`));
    assert(emailAttempt, 'blocked transactional email follow-up timeline item missing');
    assert(whatsappAttempt, 'blocked transactional WhatsApp follow-up timeline item missing');
    assert(data.no_send === true, 'timeline no_send flag missing');
    assert(data.external_write_performed === false, 'timeline external_write_performed was not false');
    return {
      timeline_items: data.timeline.length,
      matched_type: item.communication_type || item.channel || 'unknown',
      blocked_follow_up_channels: [emailAttempt.channel || 'email', whatsappAttempt.channel || 'whatsapp'],
    };
  });

  await step('archive TEST CRM lead after readback', archiveLeadIfNeeded);

  report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({ ok: true, report: relative(paths.mdPath), crm_lead_id: createdLeadId, archived: archivedLead }, null, 2));
}

main().catch(async (error) => {
  report.status = 'failed';
  try {
    await archiveLeadIfNeeded();
  } catch (cleanupError) {
    report.cleanup_error = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
  }
  try {
    const paths = writeReports();
    console.error(`Report: ${relative(paths.mdPath)}`);
  } catch {
    // Preserve the original failure if report writing also fails.
  }
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
