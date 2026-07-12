#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadSmokeEnv, loginOperations } from './lib/live-smoke-auth.mjs';

const { Pool } = pg;
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

const CONFIRM = 'APPROVE_ONE_TIME_PERSONAL_CONTINUATION_PROOF';
const startedAt = new Date().toISOString();
const stamp = startedAt.replace(/[:.]/g, '-');
const contactEmail = normalizeEmail(
  process.env.ONE_TIME_OPERATOR_TEST_EMAIL ||
  process.env.ONE_TIME_PERSONAL_TEST_EMAIL ||
  env.ONE_TIME_OPERATOR_TEST_EMAIL ||
  env.ONE_TIME_PERSONAL_TEST_EMAIL ||
  ''
);
const contactPhone = normalizePhone(
  process.env.ONE_TIME_OPERATOR_TEST_PHONE ||
  process.env.ONE_TIME_PERSONAL_TEST_PHONE ||
  env.ONE_TIME_OPERATOR_TEST_PHONE ||
  env.ONE_TIME_PERSONAL_TEST_PHONE ||
  ''
);
const confirmation = String(
  process.env.ONE_TIME_PERSONAL_TEST_CONFIRM ||
  env.ONE_TIME_PERSONAL_TEST_CONFIRM ||
  ''
).trim();
const databaseUrl = String(
  process.env.DATABASE_URL ||
  process.env.ONE_TIME_DATABASE_URL ||
  env.DATABASE_URL ||
  env.ONE_TIME_DATABASE_URL ||
  ''
).trim();

const created = [];
let authCookie = '';

const report = {
  started_at: startedAt,
  base_url: baseUrl,
  status: 'unknown',
  contact: {
    email_mask: maskEmail(contactEmail),
    phone_mask: maskPhone(contactPhone),
    contact_hash: hashValue(`${contactEmail}|${contactPhone}`).slice(0, 16),
  },
  steps: [],
  guardrails: [
    'Operator-approved personal test contact only.',
    'No raw personal email or phone is written into tracked files or smoke reports.',
    'No delivery cron dispatch is run; no email, WhatsApp/WAPI, Telegram, checkout, payment, access grant, Zoom, Vimeo, Drive, DNS, or external CRM write is performed.',
    'Queued test outbox rows are cancelled during cleanup.',
    'Test product and CRM leads are archived during cleanup.',
    'Generated onboarding tasks are deleted and support tickets are closed during cleanup.',
  ],
};

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value = '') {
  const digits = String(value || '').replace(/\D+/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) return `+972${digits.slice(1)}`;
  if (digits.startsWith('972')) return `+${digits}`;
  if (String(value || '').trim().startsWith('+')) return `+${digits}`;
  return digits;
}

function phoneDigits(value = '') {
  return String(value || '').replace(/\D+/g, '');
}

function hashValue(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function maskEmail(value = '') {
  const [local, domain] = String(value || '').split('@');
  if (!local || !domain) return '';
  return `${local.slice(0, 1)}***@${domain}`;
}

function maskPhone(value = '') {
  const digits = phoneDigits(value);
  if (!digits) return '';
  return `***${digits.slice(-4)}`;
}

function redact(value = '') {
  return String(value || '')
    .split(contactEmail).join('[operator-email]')
    .split(contactPhone).join('[operator-phone]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[phone]');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseJsonMaybe(value, fallback = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || ''));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function reportPath(ext) {
  return path.join(reportDir, `${stamp}-one-time-personal-continuation-live-smoke.${ext}`);
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
    data = { text: redact(text) };
  }
  return { response, data, text };
}

async function step(name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    report.steps.push({ name, ok: true, duration_ms: Date.now() - started, details: scrub(details) });
    console.log(`PASS ${name}`);
    return details;
  } catch (error) {
    const message = redact(error instanceof Error ? error.message : String(error));
    report.steps.push({ name, ok: false, duration_ms: Date.now() - started, error: message });
    console.error(`FAIL ${name}: ${message}`);
    throw error;
  }
}

function scrub(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redact(value);
  if (Array.isArray(value)) return value.map(scrub);
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, scrub(item)]));
  }
  return value;
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = reportPath('json');
  const mdPath = reportPath('md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(scrub(report), null, 2)}\n`);
  const lines = [
    `# One Time Personal Continuation Live Smoke - ${report.started_at}`,
    '',
    `Base URL: ${report.base_url}`,
    `Result: ${report.status}`,
    `Contact: ${report.contact.email_mask}, ${report.contact.phone_mask}`,
    `Contact hash: ${report.contact.contact_hash}`,
    '',
    '## Checks',
    ...report.steps.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name} (${item.duration_ms}ms)${item.error ? ` - ${item.error}` : ''}`),
    '',
    '## Created Records',
    ...created.map((item) => `- ${item.branch}: product_lead ${item.product_lead_id || '(none)'}, crm_lead ${item.crm_lead_id || '(none)'}, contact ${item.contact_id || '(none)'}, task ${item.task_id || '(none)'}, ticket ${item.ticket_id || '(none)'}`),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
  ];
  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`);
  return { jsonPath, mdPath };
}

async function withDb(fn) {
  assert(databaseUrl, 'DATABASE_URL or ONE_TIME_DATABASE_URL is required for private cleanup/readback. Run via Railway env or approved local secret.');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: /localhost|127\.0\.0\.1/i.test(databaseUrl) ? false : { rejectUnauthorized: false },
  });
  try {
    return await fn(pool);
  } finally {
    await pool.end();
  }
}

function signupPayload(branch) {
  const branchLabel = branch === 'school' ? 'School' : 'Family';
  return {
    parent_name: `TEST Operator Personal ${branchLabel} ${stamp}`,
    contact_name: `TEST Operator Personal ${branchLabel} ${stamp}`,
    email: contactEmail,
    phone: contactPhone,
    signup_as: branchLabel,
    city_id: 'ramat-beit-shemesh-il',
    city_label: 'Ramat Beit Shemesh, Israel',
    city_name: 'Ramat Beit Shemesh',
    city_region: 'Jerusalem District',
    city_country: 'Israel',
    city_country_code: 'IL',
    timezone: 'Asia/Jerusalem',
    browser_timezone: 'Asia/Jerusalem',
    source_landing_page: '/one-time/signup',
    signup_mode: 'one_time_class_signup',
    signup_acknowledgement: true,
    location_time_acknowledgement: true,
    reminder_preference: 'both',
    reminder_consent_ack: true,
    consent: true,
    metadata: {
      smoke: 'one_time_personal_continuation_live',
      operator_personal_test: true,
      synthetic_test_lead: true,
      test_e2e: true,
      no_external_send: true,
      external_write_expected: false,
      one_time_direct_signup: true,
      form_version: 'one-time-direct-signup-v1',
      signup_as: branchLabel,
      city: {
        id: 'ramat-beit-shemesh-il',
        label: 'Ramat Beit Shemesh, Israel',
        name: 'Ramat Beit Shemesh',
        region: 'Jerusalem District',
        country: 'Israel',
        country_code: 'IL',
        timezone: 'Asia/Jerusalem',
      },
      utm: {
        source: 'codex',
        medium: 'operator_personal_live_smoke',
        campaign: `onetime-continuation-${branch}-${stamp}`,
      },
      reminder_preference: 'both',
      reminder_channels: ['email', 'whatsapp'],
      reminder_consent: true,
      reminder_consent_acknowledged: true,
      reminder_consent_policy_version: 'one-time-class-reminders-v1-2026-07-12',
      browser_timezone: 'Asia/Jerusalem',
    },
  };
}

function continuationPayload(branch, direct) {
  const branchLabel = branch === 'school' ? 'School' : 'Family';
  const family = branch === 'family';
  return {
    parent_name: `TEST Operator Personal ${branchLabel} ${stamp}`,
    parent_email: contactEmail,
    parent_phone: contactPhone,
    product_lead_id: direct.product_lead_id,
    crm_lead_id: direct.crm_lead_id,
    audience_type: branch,
    intent: family ? 'family' : 'school',
    learner_name: family
      ? `TEST Operator Son ${stamp}`
      : `TEST Operator School ${stamp}`,
    learner_stage: family ? 'Grade 6' : 'Owner / administrator',
    city: 'Ramat Beit Shemesh, Israel',
    timezone: 'Asia/Jerusalem',
    schedule_notes: 'Operator-approved personal live smoke. No send.',
    learning_goals: family
      ? 'Test family continuation linkage and required student fields.'
      : 'Test school continuation linkage and school role fields.',
    questions: 'Please ignore; this is a Codex-approved personal test that must not send.',
    referral_source: 'Codex approved personal live continuation proof',
    source_landing_page: '/one-time/signup',
    referrer: 'https://join.onetimeonetime.com/one-time',
    route: '/one-time-onboarding',
    utm: {
      source: 'codex',
      medium: 'operator_personal_live_smoke',
      campaign: `onetime-continuation-${branch}-${stamp}`,
    },
    viewport: { width: family ? 430 : 390, height: 900, deviceScaleFactor: 1 },
    raw_intake: `Operator-approved ${branchLabel} continuation live smoke. No send, no checkout, no access grant.`,
  };
}

async function createDirectSignup(branch) {
  const payload = signupPayload(branch);
  const { response, data, text } = await fetchJson('/api/one-time/interest', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert(response.status === 200, `/api/one-time/interest returned ${response.status}: ${redact(text.slice(0, 700))}`);
  assert(data.success === true, 'direct signup did not return success');
  assert(data.direct_signup_workflow === true, 'direct signup workflow was not recognized');
  assert(data.internal_crm_recorded === true, 'CRM record was not reported as recorded');
  assert(Number(data.lead?.id) > 0, 'product lead id missing');
  assert(Number(data.crm_lead_id) > 0, 'crm lead id missing');
  assert(data.external_write_performed === false, 'external_write_performed was not false');
  assert(data.no_checkout === true && data.no_access_granted === true, 'checkout/access guardrail missing');
  assert(data.confirmation_email_queued === true, 'confirmation email outbox was not queued');
  assert(data.whatsapp_confirmation_queued === true, 'WhatsApp confirmation outbox was not queued');
  assert(data.rabbi_telegram_alert_queued === true, 'Rabbi Telegram outbox was not queued');
  assert(data.no_telegram_reminder_sent === true, 'public Telegram reminder was not skipped');
  return {
    branch,
    product_lead_id: Number(data.lead.id),
    crm_lead_id: Number(data.crm_lead_id),
    outbox: Array.isArray(data.transactional_follow_up?.outbox)
      ? data.transactional_follow_up.outbox.map((row) => ({
        id: row.id,
        channel_key: row.channel_key,
        status: row.status,
        created: row.created,
      }))
      : [],
  };
}

async function submitContinuation(branch, direct) {
  const payload = continuationPayload(branch, direct);
  const { response, data, text } = await fetchJson('/api/one-time/mishnah/onboarding', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert(response.status === 200, `/api/one-time/mishnah/onboarding returned ${response.status}: ${redact(text.slice(0, 700))}`);
  assert(data.success === true, 'continuation did not return success');
  assert(data.no_send === true, 'continuation no_send guardrail missing');
  assert(data.external_write_performed === false, 'continuation external_write_performed was not false');
  assert(data.local_write_performed === true, 'continuation did not report local write');
  assert(Number(data.lead_id) === Number(direct.crm_lead_id), `continuation lead mismatch: ${data.lead_id} vs ${direct.crm_lead_id}`);
  assert(Number(data.contact_id) > 0, 'continuation contact id missing');
  assert(Number(data.task_id) > 0, 'continuation task id missing');
  assert(Number(data.ticket?.id) > 0, 'continuation ticket id missing');
  return {
    ...direct,
    contact_id: Number(data.contact_id),
    task_id: Number(data.task_id),
    ticket_id: Number(data.ticket.id),
    communication_id: Number(data.communication_id || 0) || null,
  };
}

async function verifyDbReadback(pool, item) {
  const product = (await pool.query(
    `SELECT id, parent_email, parent_phone, source_landing_page, metadata, status
     FROM bna_product_leads
     WHERE id = $1`,
    [item.product_lead_id]
  )).rows[0];
  assert(product, `product lead ${item.product_lead_id} missing`);
  const productMetadata = parseJsonMaybe(product.metadata, {});
  assert(productMetadata.one_time_direct_signup === true, 'product lead direct-signup metadata missing');
  assert(productMetadata.operator_personal_test === true, 'product lead operator test metadata missing');
  assert(productMetadata.utm?.source === 'codex', 'product lead UTM source missing');
  assert(product.source_landing_page === '/one-time/signup', 'product lead source landing page mismatch');

  const crm = (await pool.query(
    `SELECT id, parent_email, parent_phone, status, tags, metadata
     FROM bna_parent_leads
     WHERE id = $1`,
    [item.crm_lead_id]
  )).rows[0];
  assert(crm, `CRM lead ${item.crm_lead_id} missing`);
  const crmMetadata = parseJsonMaybe(crm.metadata, {});
  assert(Number(crmMetadata.product_lead_id) === Number(item.product_lead_id), 'CRM metadata product_lead_id mismatch');
  assert(Number(crmMetadata.crm_lead_id) === Number(item.crm_lead_id), 'CRM metadata crm_lead_id mismatch');
  assert(crmMetadata.family_school_classification === item.branch, `CRM classification mismatch: ${crmMetadata.family_school_classification}`);
  assert(crmMetadata.exact_original_capture_verified === true, 'CRM exact original capture flag missing');
  assert(crmMetadata.utm?.source === 'codex', 'CRM UTM source missing');

  const communication = (await pool.query(
    `SELECT id, metadata, source_context
     FROM bna_contact_communications
     WHERE lead_id = $1
       AND source = 'dashboard'
     ORDER BY id DESC
     LIMIT 1`,
    [item.crm_lead_id]
  )).rows[0];
  assert(communication, 'onboarding communication row missing');
  const communicationMetadata = parseJsonMaybe(communication.metadata, {});
  assert(communicationMetadata.family_school_classification === item.branch, 'communication classification mismatch');
  assert(communicationMetadata.exact_original_capture_verified === true, 'communication exact capture flag missing');
  assert(communicationMetadata.no_send === true, 'communication no_send flag missing');

  const outbox = (await pool.query(
    `SELECT id, channel_key, status
     FROM assistant_delivery_outbox
     WHERE payload->>'crm_lead_id' = $1
        OR payload->>'contact_id' = $1
        OR conversation_key = $2
     ORDER BY id ASC`,
    [String(item.crm_lead_id), `one-time-direct-signup:${item.crm_lead_id}`]
  )).rows;
  assert(outbox.some((row) => row.channel_key === 'email:one_time_signup_confirmation'), 'email signup outbox row missing');
  assert(outbox.some((row) => row.channel_key === 'whatsapp:one_time_signup_confirmation'), 'WhatsApp signup outbox row missing');
  assert(outbox.some((row) => row.channel_key === 'telegram:one_time_rabbi_operator'), 'Rabbi Telegram outbox row missing');

  return {
    branch: item.branch,
    product_lead_id: item.product_lead_id,
    crm_lead_id: item.crm_lead_id,
    contact_id: item.contact_id,
    task_id: item.task_id,
    ticket_id: item.ticket_id,
    communication_id: communication.id,
    outbox_channels: outbox.map((row) => `${row.channel_key}:${row.status}`),
    classification: crmMetadata.family_school_classification,
    exact_original_capture_verified: crmMetadata.exact_original_capture_verified,
  };
}

async function verifyApiCrmReadback(item) {
  const route = `/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&search=${encodeURIComponent(contactEmail)}`;
  const { response, data, text } = await fetchJson(route, { headers: cookieHeader() });
  assert(response.status === 200, `CRM contact readback returned ${response.status}: ${redact(text.slice(0, 700))}`);
  const cards = Array.isArray(data.cards) ? data.cards : [];
  const card = cards.find((row) => String(row.id || '') === `bna_parent_leads:${item.crm_lead_id}`);
  assert(card, `CRM card for ${item.branch} lead missing`);
  assert(card.project_key === 'one_time_mishnah_class', `CRM card project mismatch: ${card.project_key}`);
  assert(data.external_write_performed !== true, 'CRM readback reported external write');
  return { branch: item.branch, card_id: card.id, project_key: card.project_key, visible: true };
}

async function cleanupItem(pool, item) {
  const archiveMetadata = {
    smoke_archived_at: new Date().toISOString(),
    smoke_source: 'one_time_personal_continuation_live_smoke',
    operator_personal_test: true,
  };
  const outbox = await pool.query(
    `UPDATE assistant_delivery_outbox
     SET status = 'cancelled',
         last_error = 'Cancelled after approved operator personal continuation live smoke.',
         updated_at = NOW()
     WHERE status IN ('queued', 'sending', 'failed')
       AND (
         payload->>'crm_lead_id' = $1
         OR payload->>'contact_id' = $1
         OR conversation_key = $2
       )
     RETURNING id, channel_key, status`,
    [String(item.crm_lead_id), `one-time-direct-signup:${item.crm_lead_id}`]
  );
  if (item.task_id) {
    await pool.query('DELETE FROM bna_tasks WHERE id = $1', [item.task_id]);
  }
  if (item.ticket_id) {
    await pool.query(
      `UPDATE bna_support_tickets
       SET status = 'closed',
           resolved_at = COALESCE(resolved_at, NOW()),
           updated_at = NOW()
       WHERE id = $1`,
      [item.ticket_id]
    );
  }
  await pool.query(
    `UPDATE bna_product_leads
     SET status = 'archived',
         metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
         updated_at = NOW()
     WHERE id = $1`,
    [item.product_lead_id, JSON.stringify(archiveMetadata)]
  );
  await pool.query(
    `UPDATE bna_parent_leads
     SET status = 'archived',
         metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
         updated_at = NOW(),
         archived_at = COALESCE(archived_at, NOW())
     WHERE id = $1`,
    [item.crm_lead_id, JSON.stringify(archiveMetadata)]
  );
  if (item.contact_id) {
    await pool.query(
      `UPDATE bna_contacts
       SET status = 'archived',
           metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
           updated_at = NOW()
       WHERE id = $1
         AND COALESCE(metadata->>'source', '') = 'one_time_onboarding'`,
      [item.contact_id, JSON.stringify(archiveMetadata)]
    );
  }
  return {
    branch: item.branch,
    outbox_cancelled: outbox.rows.length,
    task_deleted: Boolean(item.task_id),
    ticket_closed: Boolean(item.ticket_id),
    product_lead_archived: true,
    crm_lead_archived: true,
    contact_archived: Boolean(item.contact_id),
  };
}

async function verifyCleanup(pool, item) {
  const outbox = (await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM assistant_delivery_outbox
     WHERE payload->>'crm_lead_id' = $1
        OR payload->>'contact_id' = $1
        OR conversation_key = $2
     GROUP BY status`,
    [String(item.crm_lead_id), `one-time-direct-signup:${item.crm_lead_id}`]
  )).rows;
  assert(!outbox.some((row) => ['queued', 'sending', 'failed'].includes(row.status)), 'cleanup left dispatchable outbox rows');
  const product = (await pool.query('SELECT status FROM bna_product_leads WHERE id = $1', [item.product_lead_id])).rows[0];
  const crm = (await pool.query('SELECT status FROM bna_parent_leads WHERE id = $1', [item.crm_lead_id])).rows[0];
  const task = item.task_id
    ? (await pool.query('SELECT id FROM bna_tasks WHERE id = $1', [item.task_id])).rows[0]
    : null;
  assert(product?.status === 'archived', 'product lead was not archived');
  assert(crm?.status === 'archived', 'CRM lead was not archived');
  assert(!task, 'generated onboarding task was not deleted');
  return {
    branch: item.branch,
    outbox_statuses: outbox.map((row) => `${row.status}:${row.count}`),
    product_status: product?.status,
    crm_status: crm?.status,
    task_deleted: true,
  };
}

async function main() {
  assert(confirmation === CONFIRM, `Refusing to run without ONE_TIME_PERSONAL_TEST_CONFIRM=${CONFIRM}`);
  assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail), 'ONE_TIME_OPERATOR_TEST_EMAIL must be a valid email address');
  assert(phoneDigits(contactPhone).length >= 9, 'ONE_TIME_OPERATOR_TEST_PHONE must contain a real phone number');
  assert(!/example\.invalid$/i.test(contactEmail), 'personal continuation proof must use the approved real operator email, not example.invalid');

  await step('operations login uses One Time auth', async () => {
    const login = await loginOperations({ baseUrl, env, cwd: repoRoot });
    assert(login.cookie?.name === 'bna_ops_session' && login.cookie.value, login.reason || 'Operations login cookie missing');
    authCookie = `${login.cookie.name}=${login.cookie.value}`;
    return { source: login.source, role: login.role || login.user?.role || 'unknown' };
  });

  await withDb(async (pool) => {
    for (const branch of ['family', 'school']) {
      const direct = await step(`${branch} direct signup writes personal test capture`, () => createDirectSignup(branch));
      const item = await step(`${branch} continuation links to exact original capture`, () => submitContinuation(branch, direct));
      created.push(item);
      await step(`${branch} DB readback proves exact linkage and classification`, () => verifyDbReadback(pool, item));
      await step(`${branch} Operations CRM readback finds linked contact`, () => verifyApiCrmReadback(item));
      await step(`${branch} cleanup cancels queued sends and archives test records`, () => cleanupItem(pool, item));
      await step(`${branch} cleanup readback has no dispatchable rows`, () => verifyCleanup(pool, item));
    }
  });

  report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({
    ok: true,
    report: relative(paths.mdPath),
    contact_hash: report.contact.contact_hash,
    records: created.map((item) => ({
      branch: item.branch,
      product_lead_id: item.product_lead_id,
      crm_lead_id: item.crm_lead_id,
      task_id: item.task_id,
      ticket_id: item.ticket_id,
    })),
  }, null, 2));
}

main().catch(async (error) => {
  report.status = 'failed';
  try {
    if (databaseUrl && created.length) {
      await withDb(async (pool) => {
        for (const item of created) {
          try {
            await cleanupItem(pool, item);
          } catch (cleanupError) {
            report.steps.push({
              name: `${item.branch} failure cleanup`,
              ok: false,
              duration_ms: 0,
              error: redact(cleanupError instanceof Error ? cleanupError.message : String(cleanupError)),
            });
          }
        }
      });
    }
  } catch {
    // Preserve the original failure.
  }
  try {
    const paths = writeReports();
    console.error(`Report: ${relative(paths.mdPath)}`);
  } catch {
    // Preserve the original failure if report writing also fails.
  }
  console.error(redact(error instanceof Error ? error.stack || error.message : String(error)));
  process.exitCode = 1;
});
