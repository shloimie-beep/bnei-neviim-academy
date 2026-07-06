#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DEFAULT_APP_URL = 'https://join.onetimeonetime.com';
const DEFAULT_RAW_ID = 'RAW-20260706-960';
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';

function parseEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
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

function argValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (match) return match.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function emailList(value = '') {
  return String(value || '')
    .split(/[,\s;]+/)
    .map(normalizeEmail)
    .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
}

function maskEmail(email = '') {
  const [local = '', domain = ''] = String(email).split('@');
  const [domainName = '', ...domainRest] = domain.split('.');
  const suffix = domainRest.length ? `.${domainRest.join('.')}` : '';
  return `${local.slice(0, 1) || '*'}***@${domainName.slice(0, 1) || '*'}***${suffix}`;
}

function fingerprint(value = '') {
  return `sha256:${createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16)}`;
}

function redactedZoomUrl(value = '') {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}?pwd=[redacted]`;
  } catch {
    return '[redacted zoom url]';
  }
}

function displayNameForEmail(email = '') {
  const local = email.split('@')[0] || '';
  const readable = local
    .replace(/[._-]+/g, ' ')
    .replace(/[^a-z0-9 ]/gi, '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 48);
  return `Local Class Attendee - ${readable || fingerprint(email).slice(-8)}`;
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

function sanitizeText(text, secrets = []) {
  let output = String(text || '');
  for (const secret of secrets.filter(Boolean)) {
    output = output.split(secret).join('[redacted]');
  }
  output = output.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => maskEmail(email.toLowerCase()));
  output = output.replace(/https:\/\/us06web\.zoom\.us\/j\/[^\s"')]+/gi, '[redacted zoom url]');
  output = output.replace(/bna_ops_session=[^;\s"]+/gi, 'bna_ops_session=[redacted]');
  output = output.replace(/provider_session=[^;\s"]+/gi, 'provider_session=[redacted]');
  return output;
}

function sanitizeJson(value, secrets = []) {
  return JSON.parse(sanitizeText(JSON.stringify(value), secrets));
}

async function requestJson(url, options = {}, secrets = []) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: sanitizeText(text, secrets) };
  }
  if (!response.ok || data.success === false) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${sanitizeText(JSON.stringify(data).slice(0, 800), secrets)}`);
  }
  return { response, data };
}

function loadRuntime() {
  const opsSecrets = parseEnvFile(argValue('ops-credentials', 'C:/Users/User/BNA v2.0/.secrets/one-time-ops-credentials.txt'));
  const providerSecrets = parseEnvFile(argValue('provider-credentials', 'C:/Users/User/BNA v2.0/.secrets/one-time-provider-mailbox-login-20260706.txt'));
  const env = { ...opsSecrets, ...providerSecrets, ...process.env };
  const appUrl = String(argValue('base', env.ONE_TIME_APP_URL || env.BNA_APP_URL || DEFAULT_APP_URL)).replace(/\/+$/, '');
  const recipients = emailList(argValue('recipients', env.ONE_TIME_LOCAL_CLASS_RECIPIENTS || ''));
  const zoomUrl = argValue('zoom-url', env.ONE_TIME_LOCAL_CLASS_ZOOM_URL || '');
  const rawId = argValue('raw-id', env.ONE_TIME_LOCAL_CLASS_RAW_ID || DEFAULT_RAW_ID);
  const opsUsername = env.OPS_USERNAME || env.ONE_TIME_OPS_USERNAME || '';
  const opsPassword = env.OPS_PASSWORD || env.ONE_TIME_OPS_PASSWORD || '';
  const providerUsername = env.PROVIDER_USERNAME || env.Username || env.ONE_TIME_PROVIDER_USERNAME || '';
  const providerPassword = env.PROVIDER_PASSWORD || env.Password || env.ONE_TIME_PROVIDER_PASSWORD || '';
  return { appUrl, recipients, zoomUrl, rawId, opsUsername, opsPassword, providerUsername, providerPassword };
}

async function loginOperations(runtime, secrets) {
  const { response, data } = await requestJson(`${runtime.appUrl}/api/operations/login`, {
    method: 'POST',
    headers: { authorization: basicAuthHeader(runtime.opsUsername, runtime.opsPassword) },
    body: JSON.stringify({ username: runtime.opsUsername, password: runtime.opsPassword }),
  }, secrets);
  const cookie = parseSetCookie(response);
  if (!data.success || !cookie?.name || !cookie.value) throw new Error('Operations login did not return a session cookie.');
  return `${cookie.name}=${cookie.value}`;
}

async function loginProvider(runtime, secrets) {
  if (!runtime.providerUsername || !runtime.providerPassword) return '';
  const { response, data } = await requestJson(`${runtime.appUrl}/api/provider-portal/login`, {
    method: 'POST',
    body: JSON.stringify({ username: runtime.providerUsername, password: runtime.providerPassword }),
  }, secrets);
  const cookie = parseSetCookie(response);
  if (!data.success || !cookie?.name || !cookie.value) return '';
  return `${cookie.name}=${cookie.value}`;
}

function welcomeBody(zoomUrl) {
  return [
    'Hi,',
    '',
    'Welcome to our Zoom Mishnayos class. We are just getting started, and we would love your feedback.',
    '',
    'Here is the Zoom link for the Mishnayos class:',
    zoomUrl,
    '',
    'Looking forward to learning together,',
    '',
    'OneTimeOneTime Mishnah',
  ].join('\n');
}

async function run() {
  const runtime = loadRuntime();
  const startedAt = new Date().toISOString();
  const send = hasFlag('send');
  const secrets = [
    runtime.zoomUrl,
    runtime.opsPassword,
    runtime.providerPassword,
    ...runtime.recipients,
  ];
  if (!send) throw new Error('This runner requires --send after operator approval.');
  if (!runtime.opsUsername || !runtime.opsPassword) throw new Error('One Time Operations credentials are required.');
  if (runtime.recipients.length !== 3) throw new Error(`Expected exactly 3 recipients; received ${runtime.recipients.length}.`);
  if (!runtime.zoomUrl || !/^https:\/\/us06web\.zoom\.us\/j\//i.test(runtime.zoomUrl)) throw new Error('A valid One Time Zoom URL is required.');

  const report = {
    ok: false,
    started_at: startedAt,
    app_url: runtime.appUrl,
    raw_id: runtime.rawId,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    zoom_url_redacted: redactedZoomUrl(runtime.zoomUrl),
    external_send_performed: false,
    contact_mutation_performed: false,
    recipients: runtime.recipients.map((email) => ({ email_mask: maskEmail(email), fingerprint: fingerprint(email) })),
    steps: [],
    sends: [],
    provider_mailbox_readback: null,
  };

  const step = async (name, fn) => {
    try {
      const detail = await fn();
      report.steps.push({ name, ok: true, detail });
      return detail;
    } catch (error) {
      report.steps.push({ name, ok: false, detail: sanitizeText(error.message, secrets) });
      throw error;
    }
  };

  let opsCookie = '';
  await step('Operations login', async () => {
    opsCookie = await loginOperations(runtime, secrets);
    return 'session established';
  });

  const authHeaders = {
    authorization: basicAuthHeader(runtime.opsUsername, runtime.opsPassword),
    cookie: opsCookie,
  };
  const subject = 'Welcome to the Zoom Mishnayos class';
  const bodyText = welcomeBody(runtime.zoomUrl);
  const commonMetadata = {
    raw_id: runtime.rawId,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    source: 'operator_local_class_zoom_welcome',
    local_class_attendee: true,
    zoom_url_redacted: redactedZoomUrl(runtime.zoomUrl),
    exact_zoom_url_not_stored_in_evidence: true,
  };

  for (const email of runtime.recipients) {
    const recipientReport = {
      email_mask: maskEmail(email),
      fingerprint: fingerprint(email),
      display_name: displayNameForEmail(email),
      lead_id: null,
      lead_merged_existing: false,
      draft_id: null,
      provider_message_id: null,
      note_id: null,
    };

    await step(`Upsert local class CRM record ${recipientReport.email_mask}`, async () => {
      const { data } = await requestJson(`${runtime.appUrl}/api/bna/parent-leads`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          workspace_key: WORKSPACE_KEY,
          project_key: PROJECT_KEY,
          parent_name: displayNameForEmail(email),
          parent_email: email,
          lead_type: 'school_interest',
          status: 'interested',
          interest_level: 'warm',
          source: 'event',
          source_detail: 'Operator-provided local Zoom Mishnayos class attendee; welcome email approved and sent individually.',
          owner: 'Rabbi Elie Scheller',
          tags: [
            'one_time',
            'local_class_attendee',
            'zoom_mishnayos_class',
            'welcome_email_sent',
            'needs_name',
          ],
          notes: 'Name not confirmed. Added from operator-provided local Zoom Mishnayos class attendee email.',
          metadata: {
            ...commonMetadata,
            contact_name_status: 'unknown',
            recipient_fingerprint: fingerprint(email),
          },
        }),
      }, secrets);
      if (!data.lead?.id) throw new Error(`Parent lead was not returned for ${recipientReport.email_mask}.`);
      recipientReport.lead_id = data.lead.id;
      recipientReport.lead_merged_existing = Boolean(data.merged_existing);
      report.contact_mutation_performed = true;
      return `lead #${data.lead.id}${data.merged_existing ? ' merged' : ' created'}`;
    });

    await step(`Create email draft ${recipientReport.email_mask}`, async () => {
      const { data } = await requestJson(`${runtime.appUrl}/api/bna/communications/email/drafts`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          workspace_key: WORKSPACE_KEY,
          project_key: PROJECT_KEY,
          to: [email],
          subject,
          text: bodyText,
          source: 'one_time_local_class_zoom_welcome',
          source_id: runtime.rawId,
          metadata: {
            ...commonMetadata,
            lead_id: recipientReport.lead_id,
            recipient_fingerprint: fingerprint(email),
          },
        }),
      }, secrets);
      if (!data.draft?.id) throw new Error(`Draft id missing for ${recipientReport.email_mask}.`);
      recipientReport.draft_id = data.draft.id;
      return `draft #${data.draft.id}`;
    });

    await step(`Send email ${recipientReport.email_mask}`, async () => {
      const { data } = await requestJson(`${runtime.appUrl}/api/bna/communications/email/send`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          draft_id: recipientReport.draft_id,
          confirm: 'SEND_RESEND_EMAIL',
        }),
      }, secrets);
      if (!data.sent || !data.provider_message_id) throw new Error(`Provider send did not return message id for ${recipientReport.email_mask}.`);
      recipientReport.provider_message_id = data.provider_message_id;
      report.external_send_performed = true;
      return `provider message ${fingerprint(data.provider_message_id)}`;
    });

    await step(`Log CRM note ${recipientReport.email_mask}`, async () => {
      const { data } = await requestJson(`${runtime.appUrl}/api/bna/contact-communications`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          workspace_key: WORKSPACE_KEY,
          project_key: PROJECT_KEY,
          contact_type: 'lead',
          lead_id: recipientReport.lead_id,
          channel: 'email',
          direction: 'outbound',
          summary: 'Welcome email sent for Zoom Mishnayos class',
          body: 'Sent an individual welcome email with the current Zoom Mishnayos class link and a request for feedback. Student name is not confirmed yet.',
          follow_up_required: true,
          created_by: 'codex',
          source: 'dashboard',
          source_context: {
            raw_id: runtime.rawId,
            source_detail: 'codex_local_class_welcome_send',
            provider_message_id_fingerprint: fingerprint(recipientReport.provider_message_id),
            recipient_fingerprint: fingerprint(email),
          },
          metadata: {
            ...commonMetadata,
            provider_message_id_fingerprint: fingerprint(recipientReport.provider_message_id),
            recipient_fingerprint: fingerprint(email),
          },
        }),
      }, secrets);
      recipientReport.note_id = data.communication?.id || null;
      return recipientReport.note_id ? `note #${recipientReport.note_id}` : 'note logged';
    });

    report.sends.push(recipientReport);
  }

  await step('Scoped parent-lead readback', async () => {
    const { data } = await requestJson(`${runtime.appUrl}/api/bna/parent-leads?project_key=${PROJECT_KEY}&workspace=${WORKSPACE_KEY}`, {
      headers: authHeaders,
    }, secrets);
    const found = new Set((data.leads || []).map((lead) => normalizeEmail(lead.parent_email)).filter(Boolean));
    const missing = runtime.recipients.filter((email) => !found.has(email));
    if (missing.length) throw new Error(`Readback missing ${missing.map(maskEmail).join(', ')}`);
    return `${runtime.recipients.length} recipients present in scoped parent leads`;
  });

  await step('Provider mailbox readback', async () => {
    const providerCookie = await loginProvider(runtime, secrets);
    if (!providerCookie) return 'provider mailbox readback skipped; provider credentials unavailable';
    const { data } = await requestJson(`${runtime.appUrl}/api/provider-portal/mailbox?q=${encodeURIComponent(subject)}`, {
      headers: { cookie: providerCookie },
    }, secrets);
    const threads = data.mailbox?.threads || [];
    const recentThreads = threads.filter((thread) => String(thread.subject || '').includes(subject));
    report.provider_mailbox_readback = {
      search_subject: subject,
      matching_thread_count: recentThreads.length,
      total_search_thread_count: threads.length,
      mailbox_inbox_address: data.mailbox?.inbox_address || null,
    };
    if (recentThreads.length < 3) throw new Error(`Expected at least 3 provider mailbox welcome threads; saw ${recentThreads.length}.`);
    return `${recentThreads.length} welcome threads visible`;
  });

  report.ok = true;
  const reportForEvidence = {
    ...report,
    sends: report.sends.map((item) => {
      const { provider_message_id: providerMessageId, ...rest } = item;
      return {
        ...rest,
        provider_message_id_fingerprint: providerMessageId ? fingerprint(providerMessageId) : null,
      };
    }),
  };
  const safeReport = sanitizeJson(reportForEvidence, secrets);
  const stamp = startedAt.replace(/[:.]/g, '-');
  const outDir = path.join(root, 'ops', 'live-smokes');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${stamp}-one-time-local-class-welcome-send.json`);
  const mdPath = path.join(outDir, `${stamp}-one-time-local-class-welcome-send.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(safeReport, null, 2)}\n`);
  fs.writeFileSync(mdPath, [
    `# One Time Local Class Welcome Send - ${startedAt}`,
    '',
    `Result: ${safeReport.ok ? 'passed' : 'failed'}`,
    `Workspace/project: ${WORKSPACE_KEY} / ${PROJECT_KEY}`,
    `Raw ID: ${runtime.rawId}`,
    `Zoom URL: ${safeReport.zoom_url_redacted}`,
    '',
    '## Sends',
    ...safeReport.sends.map((item) => `- ${item.email_mask} (${item.fingerprint}): lead #${item.lead_id}, draft #${item.draft_id}, provider ${item.provider_message_id_fingerprint}, note #${item.note_id}`),
    '',
    '## Checks',
    ...safeReport.steps.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`),
    '',
    '## Provider Mailbox',
    `- Matching welcome threads: ${safeReport.provider_mailbox_readback?.matching_thread_count ?? 'n/a'}`,
    `- Inbox address: ${safeReport.provider_mailbox_readback?.mailbox_inbox_address || 'n/a'}`,
    '',
    '## Guardrails',
    '- Sent three individual emails; no shared recipient list or bulk campaign endpoint was used.',
    '- Full Zoom URL, raw recipient emails, credentials, cookies, and message body were not written to this report.',
    '- No payment, access grant, WhatsApp send, DNS change, external CRM write, or member/library entitlement change was performed.',
  ].join('\n') + '\n');
  console.log(JSON.stringify({
    ok: true,
    report: path.relative(root, mdPath).replace(/\\/g, '/'),
    sent_count: safeReport.sends.length,
    mailbox_matching_threads: safeReport.provider_mailbox_readback?.matching_thread_count ?? null,
    deployment_expected: 'one-time-web deployment 05f259e2-19fd-4efd-a385-955c3e3f4a72 or later',
  }, null, 2));
}

run().catch((error) => {
  console.error(sanitizeText(error.stack || error.message));
  process.exit(1);
});
