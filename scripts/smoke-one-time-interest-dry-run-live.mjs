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

function visibleText(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  await step('public One Time direct signup form points to interest endpoint', async () => {
    const { response, text } = await fetchText('/one-time/signup');
    const customerText = visibleText(text);
    assert(response.status === 200, `/one-time/signup returned ${response.status}`);
    assert(/data-one-time-direct-signup-form/.test(text), 'direct signup form missing');
    assert(/href="\/one-time"[^>]*>Back to Home<\/a>/.test(text), 'Back to Home link missing');
    assert(/name="contact_name"/.test(text), 'contact name input missing');
    assert(/name="signup_as"/.test(text), 'Family/School value field missing');
    assert(/data-signup-type-picker/.test(text), 'Family/School visible button group missing');
    assert(/data-signup-type-option[^>]+data-value="Family"/.test(text), 'Family visible choice missing');
    assert(/data-signup-type-option[^>]+data-value="School"/.test(text), 'School visible choice missing');
    assert(/ACTION-ONETIME-SIGNUP-AS-FAMILY/.test(text), 'Family choice action missing');
    assert(/ACTION-ONETIME-SIGNUP-AS-SCHOOL/.test(text), 'School choice action missing');
    assert(!/<select[^>]+name="signup_as"/i.test(text), 'retired Family/School select remains');
    assert(!/<option value="Family">Family<\/option>/.test(text), 'retired Family option remains');
    assert(!/<option value="School">School<\/option>/.test(text), 'retired School option remains');
    assert(!/data-signup-type-trigger|data-signup-type-menu/.test(text), 'retired Family/School dropdown markup remains');
    assert(/name="city_label"/.test(text), 'city free-text input missing');
    assert(/name="city_id"/.test(text), 'city id field missing');
    assert(/name="city_region"/.test(text), 'city region field missing');
    assert(/name="city_country_code"/.test(text), 'city country code field missing');
    assert(/name="timezone"/.test(text), 'city timezone field missing');
    assert(/name="browser_timezone"/.test(text), 'browser timezone fallback field missing');
    assert(/name="timezone_fallback"/.test(text), 'manual timezone fallback field missing');
    assert(!/cityOptions|CITY_OPTIONS|Choose the matching city|unambiguous city/.test(text), 'retired city option list remains');
    assert(/name="email"/.test(text), 'email input missing');
    assert(/name="phone"/.test(text), 'phone input missing');
    assert(/name="reminder_preference" value="email"/.test(text), 'email reminders choice missing');
    assert(/name="reminder_preference" value="whatsapp"/.test(text), 'WhatsApp reminders choice missing');
    assert(/name="reminder_preference" value="both"/.test(text), 'email and WhatsApp reminders choice missing');
    assert(/name="reminder_preference" value="none"/.test(text), 'no daily reminders choice missing');
    assert(/name="signup_acknowledgement"/.test(text), 'city/reminder acknowledgement checkbox missing');
    assert(/\.consent-check input:checked::before/.test(text), 'acknowledgement checkbox checkmark style missing');
    assert(/class="required-dot"/.test(text), 'required red dots missing');
    assert(/data-phone-required-dot[^>]*hidden/.test(text), 'phone required dot should start hidden');
    assert(/data-phone-hint hidden>Required for WhatsApp reminders\./.test(text), 'WhatsApp phone hint missing');
    assert(!/<input[^>]+name="reminder_preference"[^>]+checked/i.test(text), 'reminder choice should not be preselected');
    assert(/\/api\/one-time\/interest/.test(text), 'interest endpoint missing');
    assert(!/signup-strip|id="interestForm"|signupStudentName|name="student/i.test(text), 'retired inline/student signup field is still visible');
    assert(!/phone\s*(?:\/\s*WhatsApp)?\s*[-:]?\s*optional/i.test(customerText), 'phone optional copy leaked into customer-facing form');
    assert(!/parent access next steps|Parent portal setup instructions|Stripe checkout|GreenInvoice checkout|No billing|No checkout|No external send|CRM|Codex|guardrail|approval|password setup|configuration/i.test(customerText), 'internal or portal/payment copy leaked into customer-facing form');
    return { status: response.status };
  });

  await step('public dry-run validates lead capture mapping without writes', async () => {
    const payload = {
      dry_run: true,
      parent_name: 'Smoke Test Family',
      contact_name: 'Smoke Test Family',
      email: `onetime-dry-run-${stamp}@example.invalid`,
      phone: '',
      signup_as: 'Family',
      city_id: '',
      city_label: 'Buenos Aires',
      city_name: 'Buenos Aires',
      city_region: '',
      city_country: '',
      city_country_code: '',
      timezone: 'America/Buenos_Aires',
      browser_timezone: 'America/Buenos_Aires',
      source_landing_page: '/one-time/signup',
      signup_mode: 'one_time_class_signup',
      signup_acknowledgement: true,
      location_time_acknowledgement: true,
      reminder_preference: 'email',
      reminder_consent_ack: true,
      consent: true,
      metadata: {
        smoke: 'one_time_interest_dry_run',
        external_write_expected: false,
        one_time_direct_signup: true,
        form_version: 'one-time-direct-signup-v2',
        signup_as: 'Family',
        city: {
          id: '',
          label: 'Buenos Aires',
          name: 'Buenos Aires',
          region: '',
          country: '',
          country_code: '',
          timezone: 'America/Buenos_Aires',
        },
        reminder_preference: 'email',
        reminder_consent: true,
        reminder_consent_acknowledged: true,
        signup_acknowledgement: true,
        location_time_acknowledgement: true,
        reminder_consent_policy_version: 'one-time-class-reminders-v1-2026-07-12',
        browser_timezone: 'America/Buenos_Aires',
        timezone_source: 'browser',
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
    assert(data.preview?.direct_signup_workflow === true, 'direct signup workflow was not recognized');
    assert(data.preview?.product_lead_preview?.parent_email === payload.email.toLowerCase(), 'email was not preserved in product preview');
    assert(data.preview?.product_lead_preview?.parent_phone === null, 'phone should remain blank for email reminders');
    assert(data.preview?.product_lead_preview?.parent_whatsapp === null, 'WhatsApp should remain blank for email-only reminders');
    assert(data.preview?.product_lead_preview?.student_name === null, 'student name should be absent from modal preview');
    assert(data.preview?.product_lead_preview?.preferred_class_format === 'daily_live_mishnah_class', 'preferred format missing');
    assert(data.preview?.product_lead_preview?.source_landing_page === '/one-time/signup', 'signup source route mismatch');
    assert(data.preview?.product_lead_preview?.signup_as === 'Family', 'Family signup type missing');
    assert(data.preview?.product_lead_preview?.city?.id === '', 'custom city should not require a registry id');
    assert(data.preview?.product_lead_preview?.city?.label === 'Buenos Aires', 'custom city label missing from product preview');
    assert(data.preview?.product_lead_preview?.city?.timezone === 'America/Buenos_Aires', 'custom city timezone missing from product preview');
    assert(data.preview?.product_lead_preview?.reminder_preference === 'email', 'email reminder preference missing');
    assert(data.preview?.product_lead_preview?.reminder_channels?.includes('email'), 'email reminder channel missing');
    assert(Boolean(data.preview?.product_lead_preview?.reminder_consent_at), 'reminder consent timestamp missing');
    assert(data.preview?.product_lead_preview?.reminder_consent_policy_version === 'one-time-class-reminders-v1-2026-07-12', 'reminder consent policy version mismatch');
    assert(data.preview?.crm_lead_preview?.table === 'bna_parent_leads', 'CRM lead table mismatch');
    assert(data.preview?.crm_lead_preview?.status === 'follow_up', 'CRM follow-up status mismatch');
    assert(data.preview?.crm_lead_preview?.tags?.includes('free-class-interest'), 'free-class tag missing');
    assert(data.preview?.crm_lead_preview?.tags?.includes('one-time-direct-signup'), 'direct signup tag missing');
    assert(data.preview?.communication_preview?.table === 'bna_contact_communications', 'communication preview table mismatch');
    assert(data.preview?.transactional_follow_up_preview?.some((event) => event.channel_key === 'email:one_time_signup_confirmation'), 'confirmation email outbox preview missing');
    assert(data.preview?.transactional_follow_up_preview?.some((event) => event.channel_key === 'telegram:one_time_rabbi_operator'), 'Rabbi Telegram outbox preview missing');
    assert(!data.preview?.transactional_follow_up_preview?.some((event) => event.channel_key === 'whatsapp:one_time_signup_confirmation'), 'WhatsApp preview should not queue for email-only signup');
    assert(data.preview?.transactional_follow_up_preview?.every((event) => event.raw_join_url_in_payload === false), 'raw Zoom URL leaked into outbox preview');
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
      direct_signup_workflow: data.preview.direct_signup_workflow,
      reminder_preference: data.preview.product_lead_preview.reminder_preference,
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
