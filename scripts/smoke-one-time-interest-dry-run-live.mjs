#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSmokeEnv } from './lib/live-smoke-auth.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');
const env = loadSmokeEnv({ root: repoRoot });
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

const report = {
  started_at: startedAt,
  base_url: baseUrl,
  status: 'unknown',
  steps: [],
  guardrails: [
    'Dry-run only; no product lead is inserted.',
    'No CRM lead is created or updated.',
    'No internal communication note is created.',
    'No Telegram, email, WhatsApp/WAPI, checkout, access grant, Zoom meeting, or external write is performed.',
  ],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-one-time-interest-dry-run-live-smoke.${ext}`);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
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
    `# One Time Interest Dry-Run Live Smoke - ${report.started_at}`,
    '',
    `Base URL: ${report.base_url}`,
    `Result: ${report.status}`,
    '',
    '## Checks',
    ...report.steps.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name} (${item.duration_ms}ms)${item.error ? ` - ${item.error}` : ''}`),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
  ].join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function main() {
  await step('public One Time landing form points to interest endpoint', async () => {
    const { response, text } = await fetchText('/');
    assert(response.status === 200, `/ returned ${response.status}`);
    assert(/Give your son a love for Torah you never thought possible\./i.test(text), 'headline missing');
    assert(/data-signup-modal/.test(text), 'signup modal missing');
    assert(/name="parent_name"/.test(text), 'parent/contact name input missing');
    assert(/name="email"/.test(text), 'email input missing');
    assert(/name="phone"/.test(text), 'optional phone input missing');
    assert(/name="signup_audience"\s+value="family"/.test(text), 'family audience choice missing');
    assert(/name="signup_audience"\s+value="school"/.test(text), 'school audience choice missing');
    assert(/\/api\/one-time\/interest/.test(text), 'interest endpoint missing');
    assert(!/signup-strip|id="interestForm"|signupStudentName|name="student/i.test(text), 'retired inline/student signup field is still visible');
    assert(!/parent access next steps|Parent portal setup instructions|Stripe checkout|GreenInvoice checkout/i.test(text), 'portal/payment promise leaked into public form');
    return { status: response.status };
  });

  await step('public dry-run validates lead capture mapping without writes', async () => {
    const payload = {
      dry_run: true,
      parent_name: 'Smoke Test Parent',
      email: `onetime-dry-run-${stamp}@example.invalid`,
      phone: '+1 555 010 7878',
      signup_audience: 'family',
      source_landing_page: '/one-time',
      preferred_class_format: 'live_mishnayos_intro',
      addendum_raw_intake_id: 'RAW-20260710-008',
      metadata: {
        smoke: 'one_time_interest_dry_run',
        external_write_expected: false,
      },
    };
    const { response, data, text } = await fetchJson('/api/one-time/interest?dry_run=true', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert(response.status === 200, `/api/one-time/interest dry-run returned ${response.status}: ${text.slice(0, 500)}`);
    assert(data.success === true, 'dry-run did not return success');
    assert(data.dry_run === true, 'dry_run flag missing');
    assert(data.preview?.workspace_key === 'rabbi_sheller_provider', 'workspace scope mismatch');
    assert(data.preview?.project_key === 'one_time_mishnah_class', 'project scope mismatch');
    assert(data.preview?.program_key === 'one_time_mishnah_class', 'program key mismatch');
    assert(data.preview?.project_id_present === true, 'project was not resolved');
    assert(data.preview?.product_lead_preview?.parent_email === payload.email.toLowerCase(), 'email was not preserved in product preview');
    assert(data.preview?.product_lead_preview?.student_name === null, 'student name should be absent from modal preview');
    assert(data.preview?.product_lead_preview?.preferred_class_format === 'live_mishnayos_intro', 'preferred format missing');
    assert(data.preview?.crm_lead_preview?.table === 'bna_parent_leads', 'CRM lead table mismatch');
    assert(data.preview?.crm_lead_preview?.status === 'follow_up', 'CRM follow-up status mismatch');
    assert(data.preview?.crm_lead_preview?.tags?.includes('free-class-interest'), 'free-class tag missing');
    assert(data.preview?.communication_preview?.table === 'bna_contact_communications', 'communication preview table mismatch');
    for (const key of [
      'no_database_write_performed',
      'no_product_lead_created',
      'no_crm_lead_created_or_updated',
      'no_internal_note_created',
      'no_telegram_reminder_sent',
      'no_email_sent',
      'no_whatsapp_or_wapi_sent',
      'no_checkout',
      'no_access_granted',
      'no_zoom_meeting_created',
    ]) {
      assert(data[key] === true || data.preview?.guardrails?.[key] === true, `guardrail ${key} missing`);
    }
    assert(data.external_write_performed === false, 'external write flag was not false');
    assert(data.preview?.guardrails?.external_write_performed === false, 'preview external write flag was not false');
    return {
      dry_run: data.dry_run,
      project_key: data.preview.project_key,
      product_preview: data.preview.product_lead_preview.product_key,
      crm_preview: data.preview.crm_lead_preview.table,
      no_database_write_performed: data.no_database_write_performed,
    };
  });

  report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({ ok: true, report: relative(paths.mdPath) }, null, 2));
}

main().catch((error) => {
  report.status = 'failed';
  try {
    const paths = writeReports();
    console.error(`Report: ${relative(paths.mdPath)}`);
  } catch {
    // Preserve the original failure if report writing also fails.
  }
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
