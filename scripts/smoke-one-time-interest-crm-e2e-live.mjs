#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
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
const editedEmail = `test-onetime-crm-e2e-edited-${stamp}@example.invalid`.toLowerCase();
const testParentName = `TEST One Time CRM E2E ${stamp}`;
const editedParentName = `TEST One Time CRM E2E Updated ${stamp}`;
const testStudentName = `TEST Student ${stamp}`;
let authCookie = '';
let createdLeadId = null;
let followUpTaskId = null;
let archivedLead = false;
let deletedFollowUpTask = false;

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
    `# One Time Interest CRM E2E Live Smoke - ${report.started_at}`,
    '',
    `Base URL: ${report.base_url}`,
    `Result: ${report.status}`,
    `Test email: ${report.test_email}`,
    `CRM lead id: ${createdLeadId || '(not created)'}`,
    `Follow-up task id: ${followUpTaskId || '(not created)'}`,
    `Deleted follow-up task: ${deletedFollowUpTask ? 'yes' : 'no'}`,
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

async function deleteFollowUpTaskIfNeeded() {
  if (!followUpTaskId || deletedFollowUpTask || !authCookie) return;
  const { response, data, text } = await fetchJson(`/api/bna/tasks/${encodeURIComponent(followUpTaskId)}`, {
    method: 'DELETE',
    headers: cookieHeader(),
  });
  assert(response.status === 200 && data.success === true, `cleanup task delete returned ${response.status}: ${text.slice(0, 500)}`);
  deletedFollowUpTask = true;
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
      notes: `Archived after One Time CRM E2E smoke ${stamp}. Product lead remains TEST/example.invalid proof.`,
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

async function runBrowserMailboxRoundTrip(crmCardId) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: cookieHeader(),
  });
  try {
    const route = '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts';
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 20000 });
    await page.waitForFunction((name) => document.body.innerText.includes(name), editedParentName, { timeout: 20000 });
    await page.locator('.crm-filter-search input').fill(editedParentName);
    await page.evaluate((name) => {
      if (typeof window.setFirstPartyCrmFilter === 'function') {
        window.setFirstPartyCrmFilter('search', name);
        return;
      }
      const input = document.querySelector('.crm-filter-search input');
      input?.dispatchEvent(new Event('change', { bubbles: true }));
    }, editedParentName);
    await page.waitForFunction((name) => {
      const input = document.querySelector('.crm-filter-search input');
      return input && input.value === name && document.body.innerText.includes(name);
    }, editedParentName, { timeout: 15000 });
    await page.locator('article.contact-card [data-action-id="ACTION-CRM-CONTACT-CARD-EXPAND"]').first().click();
    await page.waitForFunction((name) => {
      const text = document.body.innerText || '';
      return text.includes(name) && /Contact Timeline/.test(text);
    }, editedParentName, { timeout: 15000 });
    await page.locator('[data-action-id="ACTION-CRM-CONTACT-MAILBOX-OPEN"]').first().click();
    await page.waitForFunction(() => {
      return window.location.search.includes('view=communications')
        && window.location.search.includes('section=email')
        && window.location.search.includes('inbox=rabbi');
    }, null, { timeout: 15000 });
    const mailboxUrl = page.url();
    const mailboxText = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 1200));
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 15000 });
    await page.waitForFunction((id) => window.sessionStorage.getItem('oneTimeSelectedCrmContactId') === id, crmCardId, { timeout: 10000 });
    const screenshot = path.join(reportDir, `${stamp}-one-time-crm-live-mailbox-roundtrip.png`);
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
    return {
      mailbox_url_contains_targeted_inbox: /view=communications/.test(mailboxUrl) && /section=email/.test(mailboxUrl) && /inbox=rabbi/.test(mailboxUrl),
      mailbox_text_mentions_rabbi_inbox: /Rabbi \/ One Time Inbox|One Time Inbox/i.test(mailboxText),
      selected_contact_restored: true,
      screenshot: relative(screenshot),
    };
  } finally {
    await browser.close();
  }
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
    const item = (data.timeline || []).find((row) => /One Time free-class public signup captured/i.test(`${row.body || ''} ${row.notes || ''}`));
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

  const edited = await step('edit TEST CRM contact and create fake follow-up task through API', async () => {
    const { response, data, text } = await fetchJson(`/api/bna/crm/contacts/${encodeURIComponent(crmCard.id)}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        ...cookieHeader(),
      },
      body: JSON.stringify({
        workspace_key: 'rabbi_sheller_provider',
        project_key: 'one_time_mishnah_class',
        display_name: editedParentName,
        email: editedEmail,
        phone: '+1 555 010 2200',
        lifecycle_stage: 'follow_up',
        next_follow_up_at: '2026-07-20',
        assigned_owner: 'Rabbi Scheller team',
        tags: ['free-class-interest', 'operator-test', 'live-crm-smoke'],
        note_body: `Live fake CRM persistence note ${stamp}. No send.`,
        create_follow_up_task: true,
        no_send: true,
      }),
    });
    assert(response.status === 200, `CRM PATCH returned ${response.status}: ${text.slice(0, 500)}`);
    assert(data.success === true, 'CRM PATCH did not return success');
    assert(data.external_write_performed === false, 'CRM PATCH external_write_performed was not false');
    assert(data.no_send === true, 'CRM PATCH no_send flag missing');
    assert(data.no_checkout === true, 'CRM PATCH no_checkout guard missing');
    assert(data.no_access_granted === true, 'CRM PATCH no_access_granted guard missing');
    assert(data.follow_up_task?.id || data.follow_up_task?.task_id, 'CRM PATCH did not create a follow-up task');
    followUpTaskId = Number(data.follow_up_task.id || data.follow_up_task.task_id);
    return {
      contact_id: crmCard.id,
      follow_up_task_id: followUpTaskId,
      timeline_items: data.timeline?.length || 0,
    };
  });

  await step('reload confirms persisted fake CRM edit and follow-up task', async () => {
    const route = `/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&search=${encodeURIComponent(editedEmail)}`;
    const { response, data, text } = await fetchJson(route, { headers: cookieHeader() });
    assert(response.status === 200, `CRM reload returned ${response.status}: ${text.slice(0, 500)}`);
    const card = (data.cards || []).find((row) => String(row.id || '') === crmCard.id);
    assert(card, 'edited CRM contact was not visible after reload');
    assert(card.display_name === editedParentName, `display_name did not persist: ${card.display_name}`);
    assert(String(card.email || '').toLowerCase() === editedEmail, `email did not persist: ${card.email}`);
    assert(card.follow_up_task?.task_id || card.follow_up_task?.id, 'follow-up task not visible after reload');
    assert(Number(card.follow_up_task.task_id || card.follow_up_task.id) === Number(edited.follow_up_task_id), 'follow-up task id mismatch after reload');
    return {
      contact_id: card.id,
      status: card.status,
      follow_up_task_id: Number(card.follow_up_task.task_id || card.follow_up_task.id),
    };
  });

  await step('cross-workspace CRM denial stays enforced for fake contact', async () => {
    const { response, data } = await fetchJson(`/api/bna/crm/contacts?workspace=bna&project=bna&search=${encodeURIComponent(editedEmail)}`, {
      headers: cookieHeader(),
    });
    assert(response.status === 403, `Expected cross-workspace denial 403, got ${response.status}`);
    assert(data.external_write_performed === false, 'cross-workspace denial external_write_performed was not false');
    assert(/cannot access BNA CRM/i.test(data.error || ''), `unexpected denial error: ${data.error || ''}`);
    return { status: response.status, external_write_performed: data.external_write_performed };
  });

  await step('timeline shows fake note and follow-up task before cleanup', async () => {
    const route = `/api/bna/crm/contacts/${encodeURIComponent(crmCard.id)}/timeline?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class`;
    const { response, data, text } = await fetchJson(route, { headers: cookieHeader() });
    assert(response.status === 200, `CRM timeline after edit returned ${response.status}: ${text.slice(0, 500)}`);
    const timelineText = JSON.stringify(data.timeline || []);
    assert(timelineText.includes(`Live fake CRM persistence note ${stamp}`), 'fake persistence note missing from timeline');
    assert(/follow_up_task/.test(timelineText), 'follow-up task missing from timeline');
    assert(data.no_send === true, 'timeline after edit no_send flag missing');
    assert(data.external_write_performed === false, 'timeline after edit external_write_performed was not false');
    return { timeline_items: data.timeline?.length || 0 };
  });

  await step('browser opens targeted mailbox and returns to same fake contact', async () => {
    const result = await runBrowserMailboxRoundTrip(crmCard.id);
    assert(result.mailbox_url_contains_targeted_inbox, 'targeted mailbox URL was not reached');
    assert(result.selected_contact_restored === true, 'selected contact was not restored after mailbox return');
    return result;
  });

  await step('delete fake follow-up task after readback', deleteFollowUpTaskIfNeeded);
  await step('archive TEST CRM lead after readback', archiveLeadIfNeeded);

  report.status = 'passed';
  const paths = writeReports();
  console.log(JSON.stringify({ ok: true, report: relative(paths.mdPath), crm_lead_id: createdLeadId, archived: archivedLead }, null, 2));
}

main().catch(async (error) => {
  report.status = 'failed';
  try {
    await deleteFollowUpTaskIfNeeded();
  } catch (cleanupError) {
    report.cleanup_task_error = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
  }
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
