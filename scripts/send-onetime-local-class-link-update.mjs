#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { loadSmokeEnv, loginOperations, parseSetCookie } from './lib/live-smoke-auth.mjs';

const root = process.cwd();
const DEFAULT_APP_URL = 'https://join.onetimeonetime.com';
const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';
const DEFAULT_RAW_ID = 'RAW-20260708-018';

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

function parseEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[line.slice(0, index).trim()] = value;
  }
  return env;
}

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function maskEmail(email = '') {
  const [local = '', domain = ''] = normalizeEmail(email).split('@');
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

function redactSecrets(text = '', secrets = []) {
  let output = String(text || '');
  for (const secret of secrets.filter(Boolean)) {
    output = output.split(secret).join('[redacted]');
  }
  output = output.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => maskEmail(email));
  output = output.replace(/https:\/\/us06web\.zoom\.us\/j\/[^\s"')]+/gi, '[redacted zoom url]');
  output = output.replace(/bna_ops_session=[^;\s"]+/gi, 'bna_ops_session=[redacted]');
  output = output.replace(/provider_session=[^;\s"]+/gi, 'provider_session=[redacted]');
  return output;
}

function sanitizeJson(value, secrets = []) {
  return JSON.parse(redactSecrets(JSON.stringify(value), secrets));
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
    data = { raw: redactSecrets(text, secrets) };
  }
  if (!response.ok || data.success === false) {
    throw new Error(`${options.method || 'GET'} ${url} returned ${response.status}: ${redactSecrets(JSON.stringify(data).slice(0, 800), secrets)}`);
  }
  return { response, data };
}

function prepareEnv() {
  const env = loadSmokeEnv();
  if (hasFlag('railway-auth')) {
    delete env.OPS_USERNAME;
    delete env.OPS_PASSWORD;
    env.BNA_SMOKE_RAILWAY_PROJECT_ID = argValue('railway-project', env.BNA_SMOKE_RAILWAY_PROJECT_ID || 'ce55ef20-1418-4ad3-aafa-f877fb992dc8');
    env.BNA_SMOKE_RAILWAY_SERVICE = argValue('railway-service', env.BNA_SMOKE_RAILWAY_SERVICE || 'one-time-web');
    env.BNA_SMOKE_RAILWAY_ENVIRONMENT = argValue('railway-environment', env.BNA_SMOKE_RAILWAY_ENVIRONMENT || 'production');
  }
  return env;
}

function loadRuntime() {
  const env = prepareEnv();
  const providerSecrets = parseEnvFile(argValue('provider-credentials', path.join(root, '.secrets', 'one-time-provider-mailbox-login-20260706.txt')));
  const defaultAppUrl = hasFlag('railway-auth')
    ? DEFAULT_APP_URL
    : (env.ONE_TIME_APP_URL || env.BNA_APP_URL || DEFAULT_APP_URL);
  const appUrl = String(argValue('base', defaultAppUrl)).replace(/\/+$/, '');
  const zoomUrl = argValue('zoom-url', process.env.ONE_TIME_LOCAL_CLASS_ZOOM_URL || env.ONE_TIME_LOCAL_CLASS_ZOOM_URL || '');
  const rawId = argValue('raw-id', DEFAULT_RAW_ID);
  const expectedCount = Number(argValue('expected-count', '0'));
  const confirm = argValue('confirm-current-link-send', '');
  return {
    env,
    appUrl,
    zoomUrl,
    rawId,
    expectedCount,
    confirm,
    providerUsername: providerSecrets.Username || providerSecrets.PROVIDER_USERNAME || '',
    providerPassword: providerSecrets.Password || providerSecrets.PROVIDER_PASSWORD || '',
  };
}

function localClassLead(lead = {}) {
  const tags = Array.isArray(lead.tags) ? lead.tags : [];
  const metadata = lead.metadata || {};
  return tags.includes('local_class_attendee')
    || tags.includes('zoom_mishnayos_class')
    || tags.includes('local_student')
    || metadata.local_class_attendee === true
    || metadata.local_student === true;
}

function classLinkBody(zoomUrl) {
  return [
    'Hi,',
    '',
    "Here is the current Zoom link for today's Mishnayos class:",
    zoomUrl,
    '',
    "Please use this latest link for tonight's shiur.",
    '',
    'Looking forward to learning together,',
    'One Time Mishnayos',
  ].join('\n');
}

async function loginProvider(runtime, secrets = []) {
  if (!runtime.providerUsername || !runtime.providerPassword) return '';
  const { response, data } = await requestJson(`${runtime.appUrl}/api/provider-portal/login`, {
    method: 'POST',
    body: JSON.stringify({
      username: runtime.providerUsername,
      password: runtime.providerPassword,
    }),
  }, secrets);
  const cookie = parseSetCookie(response.headers.get('set-cookie') || '');
  if (!data.success || !cookie?.name || !cookie.value) return '';
  return `${cookie.name}=${cookie.value}`;
}

async function run() {
  const runtime = loadRuntime();
  const startedAt = new Date().toISOString();
  const send = hasFlag('send');
  const secrets = [runtime.zoomUrl, runtime.providerPassword];

  if (!send) throw new Error('This runner requires --send after operator approval.');
  if (runtime.confirm !== 'SEND_TO_LOCAL_STUDENTS') throw new Error('Current-link sends require --confirm-current-link-send=SEND_TO_LOCAL_STUDENTS.');
  if (!runtime.expectedCount || runtime.expectedCount < 1) throw new Error('Use --expected-count with the exact local-student count read from the scoped CRM.');
  if (!runtime.zoomUrl || !/^https:\/\/us06web\.zoom\.us\/j\//i.test(runtime.zoomUrl)) throw new Error('A valid One Time Zoom URL is required.');

  const report = {
    ok: false,
    started_at: startedAt,
    app_url: runtime.appUrl,
    raw_id: runtime.rawId,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    zoom_url_redacted: redactedZoomUrl(runtime.zoomUrl),
    expected_count: runtime.expectedCount,
    resolved_count: 0,
    external_send_performed: false,
    contact_mutation_performed: false,
    steps: [],
    recipients: [],
    sends: [],
    provider_mailbox_readback: null,
  };

  const step = async (name, fn) => {
    try {
      const detail = await fn();
      report.steps.push({ name, ok: true, detail });
      return detail;
    } catch (error) {
      report.steps.push({ name, ok: false, detail: redactSecrets(error.message, secrets) });
      throw error;
    }
  };

  let opsCookie = '';
  await step('Operations login', async () => {
    const login = await loginOperations({ baseUrl: runtime.appUrl, env: runtime.env, cwd: root });
    if (!login.cookie?.name || !login.cookie.value) throw new Error(login.reason || 'Operations login did not return a session cookie.');
    opsCookie = `${login.cookie.name}=${login.cookie.value}`;
    return `session established from ${login.source}`;
  });

  const authHeaders = { cookie: opsCookie };
  const leads = await step('Resolve scoped local-student recipients', async () => {
    const { data } = await requestJson(`${runtime.appUrl}/api/bna/parent-leads?project_key=${PROJECT_KEY}&workspace=${WORKSPACE_KEY}`, {
      headers: authHeaders,
    }, secrets);
    const found = (data.leads || [])
      .filter(localClassLead)
      .map((lead) => ({
        id: lead.id,
        email: normalizeEmail(lead.parent_email),
        email_mask: maskEmail(lead.parent_email),
        fingerprint: fingerprint(normalizeEmail(lead.parent_email)),
        tags: Array.isArray(lead.tags) ? lead.tags : [],
      }))
      .filter((lead) => lead.id && lead.email);
    const unique = new Map(found.map((lead) => [lead.email, lead]));
    const resolved = [...unique.values()].sort((a, b) => Number(a.id) - Number(b.id));
    report.resolved_count = resolved.length;
    report.recipients = resolved.map(({ email, ...safe }) => safe);
    if (resolved.length !== runtime.expectedCount) {
      throw new Error(`Expected ${runtime.expectedCount} local-student recipients but scoped CRM resolved ${resolved.length}.`);
    }
    return resolved;
  });

  const subject = "Current Zoom link for today's Mishnayos class";
  const bodyText = classLinkBody(runtime.zoomUrl);
  const commonMetadata = {
    raw_id: runtime.rawId,
    workspace_key: WORKSPACE_KEY,
    project_key: PROJECT_KEY,
    source: 'operator_local_student_current_link_resend',
    current_link_resend: true,
    zoom_url_redacted: redactedZoomUrl(runtime.zoomUrl),
    exact_zoom_url_not_stored_in_evidence: true,
  };

  for (const lead of leads) {
    const sendReport = {
      lead_id: lead.id,
      email_mask: lead.email_mask,
      fingerprint: lead.fingerprint,
      draft_id: null,
      provider_message_id_fingerprint: null,
      note_id: null,
    };

    await step(`Create email draft ${lead.email_mask}`, async () => {
      const { data } = await requestJson(`${runtime.appUrl}/api/bna/communications/email/drafts`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          workspace_key: WORKSPACE_KEY,
          project_key: PROJECT_KEY,
          to: [lead.email],
          subject,
          text: bodyText,
          source: 'one_time_local_student_current_link_resend',
          source_id: runtime.rawId,
          metadata: {
            ...commonMetadata,
            lead_id: lead.id,
            recipient_fingerprint: lead.fingerprint,
            resolved_tags: lead.tags.filter((tag) => /local|zoom|one_time|student|class|attendee/i.test(tag)).slice(0, 10),
          },
        }),
      }, secrets);
      if (!data.draft?.id) throw new Error(`Draft id missing for ${lead.email_mask}.`);
      sendReport.draft_id = data.draft.id;
      return `draft #${data.draft.id}`;
    });

    await step(`Send email ${lead.email_mask}`, async () => {
      const { data } = await requestJson(`${runtime.appUrl}/api/bna/communications/email/send`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          draft_id: sendReport.draft_id,
          confirm: 'SEND_RESEND_EMAIL',
        }),
      }, secrets);
      if (!data.sent || !data.provider_message_id) throw new Error(`Provider send did not return message id for ${lead.email_mask}.`);
      sendReport.provider_message_id_fingerprint = fingerprint(data.provider_message_id);
      report.external_send_performed = true;
      return `provider message ${sendReport.provider_message_id_fingerprint}`;
    });

    await step(`Log CRM note ${lead.email_mask}`, async () => {
      const { data } = await requestJson(`${runtime.appUrl}/api/bna/contact-communications`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          workspace_key: WORKSPACE_KEY,
          project_key: PROJECT_KEY,
          contact_type: 'lead',
          lead_id: lead.id,
          channel: 'email',
          direction: 'outbound',
          summary: 'Current Zoom link email sent for One Time Mishnayos class',
          body: "Sent an individual One Time current-link email for today's Mishnayos class. The raw Zoom password URL is intentionally not stored in CRM evidence.",
          follow_up_required: false,
          created_by: 'codex',
          source: 'dashboard',
          source_context: {
            raw_id: runtime.rawId,
            source_detail: 'codex_local_student_current_link_resend',
            provider_message_id_fingerprint: sendReport.provider_message_id_fingerprint,
            recipient_fingerprint: lead.fingerprint,
          },
          metadata: {
            ...commonMetadata,
            provider_message_id_fingerprint: sendReport.provider_message_id_fingerprint,
            recipient_fingerprint: lead.fingerprint,
          },
        }),
      }, secrets);
      report.contact_mutation_performed = true;
      sendReport.note_id = data.communication?.id || null;
      return sendReport.note_id ? `note #${sendReport.note_id}` : 'note logged';
    });

    report.sends.push(sendReport);
  }

  await step('Provider mailbox readback', async () => {
    const providerCookie = await loginProvider(runtime, secrets);
    if (!providerCookie) return 'provider mailbox readback skipped; provider credentials unavailable';
    const { data } = await requestJson(`${runtime.appUrl}/api/provider-portal/mailbox?q=${encodeURIComponent(subject)}`, {
      headers: { cookie: providerCookie },
    }, secrets);
    const threads = data.mailbox?.threads || [];
    const matchingThreads = threads.filter((thread) => String(thread.subject || '').includes(subject));
    report.provider_mailbox_readback = {
      search_subject: subject,
      matching_thread_count: matchingThreads.length,
      total_search_thread_count: threads.length,
      mailbox_inbox_address_present: Boolean(data.mailbox?.inbox_address),
      warning: matchingThreads.length < runtime.expectedCount
        ? `Expected at least ${runtime.expectedCount} provider mailbox current-link threads; saw ${matchingThreads.length}.`
        : '',
    };
    return report.provider_mailbox_readback.warning || `${matchingThreads.length} current-link threads visible`;
  });

  report.ok = true;
  const safeReport = sanitizeJson(report, secrets);
  const stamp = startedAt.replace(/[:.]/g, '-');
  const outDir = path.join(root, 'ops', 'live-smokes');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${stamp}-one-time-local-student-current-link-resend.json`);
  const mdPath = path.join(outDir, `${stamp}-one-time-local-student-current-link-resend.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(safeReport, null, 2)}\n`);
  fs.writeFileSync(mdPath, [
    `# One Time Local Student Current-Link Resend - ${startedAt}`,
    '',
    `Result: ${safeReport.ok ? 'passed' : 'failed'}`,
    `Raw ID: ${safeReport.raw_id}`,
    `Workspace/project: ${WORKSPACE_KEY} / ${PROJECT_KEY}`,
    `Zoom URL: ${safeReport.zoom_url_redacted}`,
    `Expected/resolved recipients: ${safeReport.expected_count} / ${safeReport.resolved_count}`,
    `External send performed: ${safeReport.external_send_performed}`,
    `Contact timeline mutation performed: ${safeReport.contact_mutation_performed}`,
    '',
    '## Recipients',
    '',
    ...safeReport.recipients.map((recipient) => `- lead #${recipient.id}: ${recipient.email_mask} (${recipient.fingerprint})`),
    '',
    '## Sends',
    '',
    ...safeReport.sends.map((sendItem) => `- lead #${sendItem.lead_id}: draft #${sendItem.draft_id}, provider ${sendItem.provider_message_id_fingerprint}, CRM note ${sendItem.note_id || 'logged'}`),
    '',
    '## Provider Mailbox Readback',
    '',
    safeReport.provider_mailbox_readback
      ? `- Matching current-link threads: ${safeReport.provider_mailbox_readback.matching_thread_count}`
      : '- Skipped',
    '',
    '## Guardrails',
    '',
    '- Sent as individual one-recipient drafts.',
    '- Evidence redacts recipient emails and the Zoom password URL.',
    '- No WhatsApp/WAPI, payment/access, DNS, Zoom meeting creation, Vimeo, Drive, or external CRM write was performed.',
    '',
  ].join('\n'));
  console.log(JSON.stringify({
    ok: safeReport.ok,
    report: path.relative(root, mdPath).replace(/\\/g, '/'),
    resolved_count: safeReport.resolved_count,
    sent_count: safeReport.sends.length,
    recipients: safeReport.recipients,
  }, null, 2));
}

run().catch((error) => {
  console.error(redactSecrets(error.message, [process.env.ONE_TIME_LOCAL_CLASS_ZOOM_URL]));
  process.exit(1);
});
