import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const {
  getResendConfig,
  getResendReadiness,
  sendResendEmail,
} = require('../src/lib/integrations/resend-client.js');

const root = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
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

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function normalizeIdentity(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['one_time', 'onetime', 'rabbi', 'rabbi_sheller', 'sheller', 'mishnah', 'mishna'].includes(normalized)) return 'one_time';
  if (['bna', 'bna_office', 'office', 'academy'].includes(normalized)) return 'bna_office';
  return normalized || 'bna_office';
}

function resendProfileForIdentity(identity = '') {
  return normalizeIdentity(identity) === 'one_time' ? 'rabbi' : '';
}

function redactEmail(value = '') {
  return String(value || '').replace(/^(.).+(@.+)$/, '$1***$2');
}

function fingerprint(value = '') {
  const input = String(value || '');
  return input ? `sha256:${createHash('sha256').update(input).digest('hex').slice(0, 12)}` : null;
}

function safeResendConfigSummary(config = {}) {
  return {
    configured: Boolean(config.apiKey),
    api_key_fingerprint: fingerprint(config.apiKey),
    account_owner: config.accountOwner || 'unknown',
    provider_account: config.providerAccount || null,
    domain: config.domain || null,
    from_email: config.fromEmail || null,
    from_name: config.fromName || null,
    reply_to: config.replyTo || null,
    profile: config.profile || null,
  };
}

function safeReadinessSummary(readiness = {}) {
  return {
    configured: Boolean(readiness.configured),
    connected: Boolean(readiness.connected),
    provider: readiness.provider || 'resend',
    account_owner: readiness.account_owner || 'unknown',
    provider_account: readiness.provider_account || null,
    domain: readiness.domain || null,
    from_email: readiness.from_email || null,
    reply_to: readiness.reply_to || null,
    domain_verified: Boolean(readiness.domain_verified),
    send_allowed: Boolean(readiness.send_allowed),
    blocker: readiness.blocker || null,
    domain_status: readiness.domain_status || null,
  };
}

async function runActionRegistrySmoke({ baseUrl, to, subject, body, send, identity, workspace, project }) {
  const username = process.env.OPS_USERNAME || '';
  const password = process.env.OPS_PASSWORD || '';

  if (!username || !password) {
    throw new Error('OPS_USERNAME and OPS_PASSWORD are required for action-registry email smoke.');
  }

  const payload = {
    action_id: 'send_test_email',
    source: 'email_smoke_script',
    dry_run: !send,
    approved: send,
    confirm: send ? 'APPROVE_TYPED_ACTION' : undefined,
    inputs: {
      to,
      subject,
      body,
      identity,
      workspace_key: workspace || undefined,
      project_key: project || undefined,
    },
  };

  const response = await fetch(`${baseUrl}/api/bna/actions/run`, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(username, password),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  const summary = {
    ok: response.ok && data?.success !== false,
    status: response.status,
    mode: send ? 'action_registry_approved_guarded_preview' : 'action_registry_dry_run',
    base_url: baseUrl,
    recipient: redactEmail(to),
    action_id: 'send_test_email',
    identity,
    workspace_key: workspace || null,
    project_key: project || null,
    executed: Boolean(data?.executed),
    external_send_performed: false,
    message: data?.message || data?.result?.note || data?.result_summary || data?.error || '',
    connector: data?.result?.connector || data?.result?.result?.connector || '',
    connector_ready: data?.result?.connector_ready ?? data?.result?.result?.connector_ready ?? null,
  };

  return summary;
}

async function runResendClientSmoke({ to, subject, body, send, identity, workspace, project, profile }) {
  const config = getResendConfig({ repoRoot: root, profile });
  const readiness = await getResendReadiness({ config, fetchImpl: fetch });
  const base = {
    ok: Boolean(!send || readiness.send_allowed),
    mode: send ? 'resend_client_guarded_send' : 'resend_client_readiness_only',
    recipient: redactEmail(to),
    action_id: 'resend_client_send_test_email',
    identity,
    workspace_key: workspace || null,
    project_key: project || null,
    external_send_performed: false,
    resend_config: safeResendConfigSummary(config),
    readiness: safeReadinessSummary(readiness),
  };

  if (!send) return base;
  if (!readiness.send_allowed) {
    return {
      ...base,
      ok: false,
      send_blocked: true,
      message: readiness.blocker || 'Resend readiness did not allow a guarded send.',
    };
  }

  try {
    const sent = await sendResendEmail({
      to: [to],
      subject,
      text: body,
      metadata: {
        source: 'email_smoke_script',
        workspace_key: workspace || null,
        project_key: project || null,
        identity,
        test_run: true,
      },
    }, {
      config,
      fetchImpl: fetch,
      confirm: 'SEND_RESEND_EMAIL',
    });

    return {
      ...base,
      ok: true,
      executed: true,
      external_send_performed: true,
      provider: sent.provider,
      provider_message_id: sent.id || null,
      message: sent.id ? 'Guarded Resend test email accepted by provider.' : 'Guarded Resend test email returned without a provider message id.',
    };
  } catch (error) {
    return {
      ...base,
      ok: false,
      executed: false,
      send_blocked: true,
      message: error?.blocker || error?.message || 'Guarded Resend test email failed.',
      status: error?.status || error?.statusCode || null,
    };
  }
}

for (const envFile of [
  process.env.BNA_LOCAL_ENV_FILE,
  process.env.BNA_ENV_FILE,
  path.join(root, '.env.local'),
].filter(Boolean)) {
  loadEnvFile(envFile);
}

const identity = normalizeIdentity(argValue('identity', process.env.EMAIL_SMOKE_IDENTITY || 'bna_office'));
const workspace = argValue('workspace', identity === 'one_time' ? 'rabbi_sheller_provider' : '');
const project = argValue('project', identity === 'one_time' ? 'one_time_mishnah_class' : '');
const profile = argValue('profile', resendProfileForIdentity(identity));
const baseUrl = (argValue('base', process.env.APP_BASE_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:8080')).replace(/\/+$/, '');
const to = argValue('to', process.env.OFFICE_TEST_EMAIL || process.env.PARENT_HELP_EMAIL || process.env.GMAIL_FROM || '');
const subject = argValue('subject', `BNA email smoke ${new Date().toISOString().slice(0, 10)}`);
const body = argValue('body', 'Controlled BNA email smoke through the action registry. This path should not bypass approval or connector guards.');
const send = hasFlag('send');
const adapter = String(argValue('adapter', 'action-registry')).trim().toLowerCase().replace(/_/g, '-');

if (!to) {
  throw new Error('Provide --to=email@example.com or set OFFICE_TEST_EMAIL/PARENT_HELP_EMAIL/GMAIL_FROM.');
}

const summary = adapter === 'resend-client' || adapter === 'resend'
  ? await runResendClientSmoke({ to, subject, body, send, identity, workspace, project, profile })
  : await runActionRegistrySmoke({ baseUrl, to, subject, body, send, identity, workspace, project });

console.log(JSON.stringify(summary, null, 2));

if (!summary.ok) {
  process.exitCode = 1;
}
