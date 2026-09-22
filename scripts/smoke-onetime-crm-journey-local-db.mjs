#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { chromium } from 'playwright';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, 'ops', 'evidence', 'one-time-crm-journey-local-db');
const startedAt = new Date().toISOString();
const stamp = startedAt.replace(/[:.]/g, '-');
const databaseUrl = process.env.BNA_ONETIME_CRM_TEST_DATABASE_URL || '';
const allowRemoteTestDb = /^(?:1|true|yes)$/i.test(String(process.env.BNA_ALLOW_REMOTE_ONETIME_CRM_TEST_DB || ''));
const marker = `one_time_crm_local_db_${stamp}`;
const testEmail = `test-onetime-crm-${stamp}@example.invalid`.toLowerCase();
const editedEmail = `test-onetime-crm-edited-${stamp}@example.invalid`.toLowerCase();
const authUser = 'crm_local_db_smoke';
const authPass = 'local-db-smoke-password';
const authHeader = `Basic ${Buffer.from(`${authUser}:${authPass}`).toString('base64')}`;

const report = {
  started_at: startedAt,
  status: 'unknown',
  marker,
  guardrails: [
    'Requires BNA_ONETIME_CRM_TEST_DATABASE_URL; production DATABASE_URL is intentionally ignored.',
    'Refuses remote-looking database URLs unless BNA_ALLOW_REMOTE_ONETIME_CRM_TEST_DB=1 is set for an approved test database.',
    'Uses only TEST/example.invalid data and deletes seeded local/test rows in cleanup.',
    'No email, WhatsApp, payment, access grant, import, or external CRM write is performed.',
  ],
  steps: [],
};

function ensureOutDir() {
  fs.mkdirSync(outDir, { recursive: true });
}

function reportPath(ext) {
  return path.join(outDir, `${stamp}-report.${ext}`);
}

function writeReports() {
  ensureOutDir();
  fs.writeFileSync(reportPath('json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportPath('md'), `${[
    `# One Time CRM Local/Test DB Journey - ${startedAt}`,
    '',
    `Status: ${report.status}`,
    `Marker: ${marker}`,
    '',
    '## Steps',
    ...(report.steps || []).map((step) => `- ${step.ok ? 'PASS' : 'FAIL'} ${step.name}${step.error ? ` - ${step.error}` : ''}`),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
    ...(report.blocker ? ['', `Blocker: ${report.blocker}`] : []),
  ].join('\n')}\n`);
}

function isApprovedTestDatabaseUrl(value) {
  if (!value) return false;
  let parsed = null;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  const host = String(parsed.hostname || '').toLowerCase();
  if (['localhost', '127.0.0.1', '::1', 'host.docker.internal'].includes(host)) return true;
  return allowRemoteTestDb && /test|local|staging|preview/.test(`${host} ${parsed.pathname}`);
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function step(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then((details = {}) => {
      report.steps.push({ name, ok: true, details });
      console.log(`PASS ${name}`);
      return details;
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      report.steps.push({ name, ok: false, error: message });
      console.error(`FAIL ${name}: ${message}`);
      throw error;
    });
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitForHttp(baseUrl) {
  const started = Date.now();
  while (Date.now() - started < 60000) {
    try {
      const response = await fetch(`${baseUrl}/api/bna/auth/me`, {
        headers: { authorization: authHeader, accept: 'application/json' },
      });
      if ([200, 401, 403].includes(response.status)) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Local server did not become ready within 60s.');
}

async function fetchJson(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    headers: {
      authorization: authHeader,
      accept: 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  if (!response.ok) throw new Error(`${route} returned ${response.status}: ${text.slice(0, 500)}`);
  return data;
}

async function seedRows(client) {
  const project = (await client.query(
    `INSERT INTO bna_projects (project_key, name, short_name, status, metadata)
     VALUES ('one_time_mishnah_class', 'One Time Mishnah Class', 'One Time', 'active', '{}'::jsonb)
     ON CONFLICT (project_key) DO UPDATE SET updated_at = NOW()
     RETURNING id`
  )).rows[0];
  await client.query(
    `INSERT INTO bna_workspace_settings (workspace_key, workspace_type, display_name, status, settings_json)
     VALUES ('rabbi_sheller_provider', 'service_provider', 'Rabbi Scheller / One Time', 'active', '{}'::jsonb)
     ON CONFLICT (workspace_key) DO UPDATE SET updated_at = NOW()`
  );
  const lead = (await client.query(
    `INSERT INTO bna_parent_leads (
       project_id, parent_name, parent_email, parent_phone, student_name, lead_type, status,
       interest_level, source, source_detail, next_follow_up_date, owner, tags, notes, metadata
     ) VALUES (
       $1, $2, $3, '+15550101188', 'TEST CRM Student', 'school_interest', 'follow_up',
       'hot', 'website_form', 'Local/test DB CRM journey seed', CURRENT_DATE + 1, 'Rabbi Scheller team',
       ARRAY['free-class-interest','local-db-smoke'], 'Seeded by local/test CRM smoke.', $4::jsonb
     ) RETURNING id`,
    [
      project.id,
      `TEST One Time CRM ${stamp}`,
      testEmail,
      JSON.stringify({ marker, synthetic_test_lead: true, no_send: true, external_write_performed: false }),
    ]
  )).rows[0];
  await client.query(
    `INSERT INTO bna_contact_communications (
       project_id, contact_type, lead_id, channel, direction, summary, body,
       follow_up_required, created_by, source, source_context, metadata
     ) VALUES (
       $1, 'school_interest', $2, 'internal_note', 'internal_note',
       'Local/test CRM seed captured', 'Seeded local/test contact timeline item.',
       true, 'crm_local_db_smoke', 'dashboard', $3::jsonb, $3::jsonb
     )`,
    [project.id, lead.id, JSON.stringify({ marker, no_send: true, external_write_performed: false })]
  );
  await client.query(
    `INSERT INTO bna_communications (
       project_id, channel, direction, communication_type, from_address, to_address, subject,
       body_text, thread_key, provider, status, metadata
     ) VALUES (
       $1, 'email', 'inbound', 'crm_local_db_smoke', $2, 'info@onetimeonetime.com',
       'TEST CRM mailbox thread', 'Local/test mailbox message.', $3, 'resend', 'logged', $4::jsonb
     )`,
    [project.id, testEmail, `local-db-thread-${stamp}`, JSON.stringify({ marker, no_send: true, external_write_performed: false })]
  );
  return { project_id: project.id, lead_id: lead.id };
}

async function cleanupRows(client) {
  await client.query(`DELETE FROM bna_tasks WHERE source_context LIKE $1 OR ai_parsed::text LIKE $1`, [`%${marker}%`]).catch(() => {});
  await client.query(`DELETE FROM bna_communications WHERE metadata::text LIKE $1`, [`%${marker}%`]).catch(() => {});
  await client.query(`DELETE FROM bna_contact_communications WHERE metadata::text LIKE $1 OR source_context::text LIKE $1`, [`%${marker}%`]).catch(() => {});
  await client.query(`DELETE FROM bna_parent_leads WHERE metadata::text LIKE $1`, [`%${marker}%`]).catch(() => {});
}

async function runBrowserRoundTrip(baseUrl, crmCardId) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { authorization: authHeader },
  });
  try {
    await page.goto(`${baseUrl}/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 20000 });
    await page.waitForFunction((name) => document.body.innerText.includes(name), `TEST One Time CRM Updated ${stamp}`, { timeout: 20000 });
    await page.locator(`[data-action-id="ACTION-CRM-CONTACT-CARD-EXPAND"]`).first().click();
    await page.locator('[data-action-id="ACTION-CRM-CONTACT-MAILBOX-OPEN"]').first().click();
    await page.waitForSelector('[data-crm-targeted-mailbox]', { timeout: 15000 });
    const mailboxText = await page.locator('[data-crm-targeted-mailbox]').innerText();
    await page.goto(`${baseUrl}/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-one-time-crm-workbench]', { timeout: 20000 });
    await page.waitForFunction((id) => window.sessionStorage.getItem('oneTimeSelectedCrmContactId') === id, crmCardId, { timeout: 10000 });
    const screenshot = path.join(outDir, `${stamp}-crm-mailbox-roundtrip.png`);
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
    return { mailbox_text: mailboxText, screenshot: relative(screenshot) };
  } finally {
    await browser.close();
  }
}

async function main() {
  ensureOutDir();
  if (!isApprovedTestDatabaseUrl(databaseUrl)) {
    report.status = 'blocked';
    report.blocker = 'Set BNA_ONETIME_CRM_TEST_DATABASE_URL to a local/test Postgres URL. The script intentionally ignores production DATABASE_URL.';
    writeReports();
    console.log(JSON.stringify({ ok: false, blocked: true, report: relative(reportPath('md')), blocker: report.blocker }, null, 2));
    process.exitCode = 2;
    return;
  }

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      PORT: String(port),
      HOST: '127.0.0.1',
      OPS_USERNAME: authUser,
      OPS_PASSWORD: authPass,
      SESSION_SECRET: 'one-time-crm-local-db-smoke-session',
      TELEGRAM_BOT_TOKEN: '',
      BNA_TELEGRAM_BOT_TOKEN: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  const client = new pg.Client({ connectionString: databaseUrl, ssl: false });
  try {
    await waitForHttp(baseUrl);
    await client.connect();
    await cleanupRows(client);
    const seeded = await step('seed local/test One Time CRM records', () => seedRows(client));

    const search = await step('search scoped CRM contacts API', async () => {
      const data = await fetchJson(baseUrl, `/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&search=${encodeURIComponent(testEmail)}`);
      const card = (data.cards || []).find((row) => String(row.id) === `bna_parent_leads:${seeded.lead_id}`);
      if (!card) throw new Error('Seeded lead was not returned by scoped CRM search.');
      return { card_id: card.id, project_key: card.project_key, mailbox_count: card.mailbox?.message_count || 0 };
    });

    await step('edit contact and assign follow-up through CRM API', async () => {
      const data = await fetchJson(baseUrl, `/api/bna/crm/contacts/${encodeURIComponent(search.card_id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workspace_key: 'rabbi_sheller_provider',
          project_key: 'one_time_mishnah_class',
          display_name: `TEST One Time CRM Updated ${stamp}`,
          email: editedEmail,
          phone: '+15550109999',
          lifecycle_stage: 'follow_up',
          next_follow_up_at: '2026-07-20',
          assigned_owner: 'Rabbi Scheller team',
          tags: ['free-class-interest', 'local-db-smoke', 'persisted-edit'],
          note_body: 'Local/test CRM persistence note.',
          create_follow_up_task: true,
          no_send: true,
        }),
      });
      if (data.external_write_performed !== false) throw new Error('CRM PATCH did not report external_write_performed=false.');
      if (!data.follow_up_task?.id) throw new Error('CRM PATCH did not return a follow-up task.');
      return { follow_up_task_id: data.follow_up_task.id, timeline_items: data.timeline?.length || 0 };
    });

    await step('reload confirms persisted edit and follow-up task', async () => {
      const data = await fetchJson(baseUrl, `/api/bna/crm/contacts?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class&search=${encodeURIComponent(editedEmail)}`);
      const card = (data.cards || []).find((row) => String(row.id) === search.card_id);
      if (!card) throw new Error('Edited contact was not found after reload.');
      if (card.display_name !== `TEST One Time CRM Updated ${stamp}`) throw new Error(`display_name did not persist: ${card.display_name}`);
      if (!card.follow_up_task?.task_id) throw new Error('follow_up_task was not visible after reload.');
      return { status: card.status, task_id: card.follow_up_task.task_id, email: card.email };
    });

    await step('targeted timeline contains note and follow-up task', async () => {
      const data = await fetchJson(baseUrl, `/api/bna/crm/contacts/${encodeURIComponent(search.card_id)}/timeline?workspace=rabbi_sheller_provider&project_key=one_time_mishnah_class`);
      const text = JSON.stringify(data.timeline || []);
      if (!/Local\/test CRM persistence note/.test(text)) throw new Error('Persistence note missing from timeline.');
      if (!/follow_up_task/.test(text)) throw new Error('Follow-up task missing from timeline.');
      return { timeline_items: data.timeline?.length || 0, no_send: data.no_send !== false };
    });

    await step('cross-workspace CRM denial', async () => {
      const response = await fetch(`${baseUrl}/api/bna/crm/contacts?workspace=bna&search=${encodeURIComponent(editedEmail)}`, {
        headers: { authorization: authHeader, accept: 'application/json' },
      });
      if (response.status !== 403) throw new Error(`Expected 403, received ${response.status}`);
      return { status: response.status };
    });

    await step('open targeted mailbox and return with selected contact restored', () => runBrowserRoundTrip(baseUrl, search.card_id));

    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';
    throw error;
  } finally {
    try {
      await cleanupRows(client);
    } catch {
      // report primary failure
    }
    await client.end().catch(() => {});
    child.kill();
    writeReports();
  }
  console.log(JSON.stringify({ ok: true, report: relative(reportPath('md')) }, null, 2));
}

main().catch((error) => {
  report.error = error instanceof Error ? error.message : String(error);
  writeReports();
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
