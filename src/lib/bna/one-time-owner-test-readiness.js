const crypto = require('crypto');
const path = require('path');

const {
  loadSecret,
  safeSecretSourceLabel,
  usableSecretValue,
} = require('../integrations/secret-loader');

const ONE_TIME_OWNER_TEST_CONFIRM = 'APPROVE_ONE_TIME_OWNER_TEST_SENDS';
const ONE_TIME_OWNER_TEST_EMAIL_LIMIT = 3;
const ONE_TIME_OWNER_TEST_WHATSAPP_LIMIT = 5;
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';

const OWNER_TEST_EMAIL_ENV_NAMES = Object.freeze([
  'ONE_TIME_OWNER_TEST_EMAIL',
  'ONETIME_OWNER_TEST_EMAIL',
  'ONE_TIME_SHLOIMIE_TEST_EMAIL',
  'SHLOIMIE_OWNER_TEST_EMAIL',
  'OWNER_TEST_EMAIL',
  'BNA_OWNER_TEST_EMAIL',
]);

const OWNER_TEST_WHATSAPP_ENV_NAMES = Object.freeze([
  'ONE_TIME_OWNER_TEST_WHATSAPP',
  'ONE_TIME_OWNER_TEST_PHONE',
  'ONETIME_OWNER_TEST_WHATSAPP',
  'ONETIME_OWNER_TEST_PHONE',
  'ONE_TIME_SHLOIMIE_TEST_WHATSAPP',
  'ONE_TIME_SHLOIMIE_TEST_PHONE',
  'SHLOIMIE_OWNER_TEST_WHATSAPP',
  'SHLOIMIE_OWNER_TEST_PHONE',
  'OWNER_TEST_WHATSAPP',
  'OWNER_TEST_PHONE',
  'BNA_OWNER_TEST_WHATSAPP',
  'BNA_OWNER_TEST_PHONE',
]);

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizePhoneDigits(value = '') {
  return String(value || '').replace(/\D+/g, '');
}

function fingerprint(value = '') {
  const input = String(value || '');
  return input ? `sha256:${crypto.createHash('sha256').update(input).digest('hex').slice(0, 16)}` : null;
}

function slugForEnvName(envName = '') {
  return String(envName || '').toLowerCase().replace(/_/g, '-');
}

function secretNamesForEnvName(envName = '') {
  const slug = slugForEnvName(envName);
  return [
    slug,
    `${slug}.txt`,
    envName,
    `${envName}.txt`,
  ];
}

function safeAliasSummary({ configured = false, valid = false, source = 'not configured', envName = '', value = '', kind = '' } = {}) {
  const normalized = kind === 'whatsapp' ? normalizePhoneDigits(value) : normalizeEmail(value);
  return {
    configured: Boolean(configured),
    valid: Boolean(valid),
    source,
    env_name: envName || null,
    fingerprint: configured && normalized ? fingerprint(normalized) : null,
    normalized_length: normalized ? normalized.length : 0,
    raw_value_returned: false,
  };
}

function readAliasFromEnv(env = {}, envNames = []) {
  for (const envName of envNames) {
    const value = usableSecretValue(env[envName]);
    if (value) return { configured: true, source: 'env', envName, value };
  }
  return null;
}

function readAliasFromKeyholder({ envNames = [], repoRoot = process.cwd(), inspectKeyholder = true } = {}) {
  if (!inspectKeyholder) return null;
  for (const envName of envNames) {
    const loaded = loadSecret({
      envName,
      names: secretNamesForEnvName(envName),
      fileNames: secretNamesForEnvName(envName),
      repoRoot,
    });
    const value = usableSecretValue(loaded.value);
    if (value) {
      return {
        configured: true,
        source: safeSecretSourceLabel(loaded),
        envName,
        value,
      };
    }
  }
  return null;
}

function loadOwnerAlias({
  env = process.env,
  envNames = [],
  repoRoot = process.cwd(),
  kind = 'email',
  inspectKeyholder = true,
} = {}) {
  const found = readAliasFromEnv(env, envNames) || readAliasFromKeyholder({ envNames, repoRoot, inspectKeyholder });
  if (!found) return safeAliasSummary({ kind });
  const normalized = kind === 'whatsapp'
    ? normalizePhoneDigits(found.value)
    : normalizeEmail(found.value);
  const valid = kind === 'whatsapp'
    ? normalized.length >= 8 && normalized.length <= 18
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  return safeAliasSummary({
    configured: true,
    valid,
    source: found.source,
    envName: found.envName,
    value: found.value,
    kind,
  });
}

function safeResendReadiness(readiness = {}, error = null) {
  return {
    configured: Boolean(readiness.configured),
    connected: Boolean(readiness.connected),
    send_allowed: Boolean(readiness.send_allowed),
    domain_verified: Boolean(readiness.domain_verified),
    domain_status: readiness.domain_status || null,
    account_owner: readiness.account_owner || 'unknown',
    provider_account_configured: Boolean(readiness.provider_account),
    from_configured: Boolean(readiness.from_email || readiness.from),
    reply_to_configured: Boolean(readiness.reply_to),
    blocker: readiness.blocker || (error ? String(error.blocker || error.message || error).slice(0, 240) : null),
  };
}

function safeWapiReadiness(readiness = {}, error = null) {
  const providerSetup = readiness.provider_setup || {};
  const outbound = readiness.outbound || {};
  return {
    checked: Boolean(readiness.checked_at || readiness.success),
    provider_setup_ready: Boolean(providerSetup.ready),
    outbound_configured: Boolean(outbound.configured),
    credential_scope: outbound.credential_scope || 'missing',
    one_time_token_present: Boolean(outbound.one_time_token_present),
    instance_id_present: Boolean(providerSetup.instance_id_present),
    phone_metadata_present: Boolean(providerSetup.phone_metadata_present),
    webhook_secret_present: Boolean(readiness.auto_reply?.webhook_secret_present),
    auto_reply_ready: Boolean(readiness.auto_reply?.ready),
    telegram_notifications_ready: Boolean(readiness.telegram_notifications?.ready),
    blockers: Array.isArray(providerSetup.blockers) ? providerSetup.blockers : [],
    auto_reply_blockers: Array.isArray(readiness.auto_reply?.blockers) ? readiness.auto_reply.blockers : [],
    error: error ? String(error.message || error).slice(0, 240) : null,
  };
}

function safeRailwayOwnerAliasReadback(railwayVariables = null) {
  if (!railwayVariables) {
    return {
      attempted: false,
      ok: false,
      owner_test_email_present: false,
      owner_test_whatsapp_present: false,
    };
  }
  return {
    attempted: railwayVariables.attempted === true,
    ok: railwayVariables.ok === true,
    source: railwayVariables.source || null,
    key_count: Number.isFinite(Number(railwayVariables.key_count)) ? Number(railwayVariables.key_count) : null,
    owner_test_email_present: railwayVariables.one_time_owner_test_email_present === true,
    owner_test_whatsapp_present: railwayVariables.one_time_owner_test_whatsapp_present === true,
    owner_test_alias_values_returned: false,
  };
}

function buildOneTimeOwnerTestReadiness({
  env = process.env,
  repoRoot = process.cwd(),
  resendReadiness = {},
  resendError = null,
  wapiReadiness = {},
  wapiError = null,
  railwayVariables = null,
  inspectKeyholder = true,
  confirm = '',
  now = new Date(),
} = {}) {
  const ownerEmail = loadOwnerAlias({
    env,
    repoRoot,
    envNames: OWNER_TEST_EMAIL_ENV_NAMES,
    kind: 'email',
    inspectKeyholder,
  });
  const ownerWhatsapp = loadOwnerAlias({
    env,
    repoRoot,
    envNames: OWNER_TEST_WHATSAPP_ENV_NAMES,
    kind: 'whatsapp',
    inspectKeyholder,
  });
  const resend = safeResendReadiness(resendReadiness, resendError);
  const wapi = safeWapiReadiness(wapiReadiness, wapiError);
  const railway = safeRailwayOwnerAliasReadback(railwayVariables);
  const ownerEmailAvailable = ownerEmail.configured || railway.owner_test_email_present;
  const ownerWhatsappAvailable = ownerWhatsapp.configured || railway.owner_test_whatsapp_present;
  const emailPreflightReady = Boolean(ownerEmailAvailable && (ownerEmail.valid || railway.owner_test_email_present) && resend.send_allowed);
  const whatsappPreflightReady = Boolean(
    ownerWhatsappAvailable
      && (ownerWhatsapp.valid || railway.owner_test_whatsapp_present)
      && wapi.provider_setup_ready
      && wapi.credential_scope === 'one_time_scoped'
  );
  const blockers = [];
  if (!ownerEmailAvailable) blockers.push('owner_test_email_alias_missing');
  if (ownerEmail.configured && !ownerEmail.valid) blockers.push('owner_test_email_alias_invalid');
  if (!resend.send_allowed) blockers.push(resend.blocker || 'resend_send_not_allowed');
  if (!ownerWhatsappAvailable) blockers.push('owner_test_whatsapp_alias_missing');
  if (ownerWhatsapp.configured && !ownerWhatsapp.valid) blockers.push('owner_test_whatsapp_alias_invalid');
  if (!wapi.provider_setup_ready) blockers.push(...(wapi.blockers.length ? wapi.blockers : ['one_time_wapi_provider_setup_not_ready']));
  if (wapi.provider_setup_ready && wapi.credential_scope !== 'one_time_scoped') {
    blockers.push('one_time_wapi_owner_test_requires_one_time_scoped_credentials');
  }

  const sendConfirmed = String(confirm || '').trim() === ONE_TIME_OWNER_TEST_CONFIRM;
  return {
    success: true,
    checked_at: now instanceof Date ? now.toISOString() : new Date(now).toISOString(),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    mode: 'owner_test_readiness_no_send',
    owner_aliases: {
      email: ownerEmail,
      whatsapp: ownerWhatsapp,
      railway,
    },
    resend,
    wapi,
    readiness: {
      email_preflight_ready: emailPreflightReady,
      whatsapp_preflight_ready: whatsappPreflightReady,
      owner_send_confirmed: sendConfirmed,
      send_confirmation_phrase: ONE_TIME_OWNER_TEST_CONFIRM,
      max_owner_test_emails: ONE_TIME_OWNER_TEST_EMAIL_LIMIT,
      max_owner_test_whatsapp_messages: ONE_TIME_OWNER_TEST_WHATSAPP_LIMIT,
      public_auto_reply_enabled_by_this_check: false,
      external_send_performed: false,
      whatsapp_send_performed: false,
      email_send_performed: false,
    },
    blockers: [...new Set(blockers.filter(Boolean))],
    guardrails: [
      'No email or WhatsApp message is sent by this readiness check.',
      'Owner destinations are resolved only by configured aliases and are reported only by source, validity, length, and fingerprint.',
      'Public WhatsApp auto-reply is not enabled by owner-test readiness.',
      'Live owner sends require the explicit owner-test confirmation phrase and a separate guarded send step.',
    ],
  };
}

function renderOneTimeOwnerTestReadinessMarkdown(report = {}) {
  const blockers = report.blockers?.length ? report.blockers : ['None'];
  return [
    '# One Time Owner-Test Readiness',
    '',
    `Checked at: ${report.checked_at}`,
    `Workspace/project: \`${report.workspace_key}\` / \`${report.project_key}\``,
    `Mode: ${report.mode}`,
    '',
    '## Summary',
    '',
    `- Email owner alias configured: ${report.owner_aliases?.email?.configured || report.owner_aliases?.railway?.owner_test_email_present || false}`,
    `- WhatsApp owner alias configured: ${report.owner_aliases?.whatsapp?.configured || report.owner_aliases?.railway?.owner_test_whatsapp_present || false}`,
    `- Resend send allowed: ${report.resend?.send_allowed === true}`,
    `- WAPI provider setup ready: ${report.wapi?.provider_setup_ready === true}`,
    `- WAPI credential scope: ${report.wapi?.credential_scope || 'missing'}`,
    `- Email preflight ready: ${report.readiness?.email_preflight_ready === true}`,
    `- WhatsApp preflight ready: ${report.readiness?.whatsapp_preflight_ready === true}`,
    `- External send performed: ${report.readiness?.external_send_performed === true}`,
    '',
    '## Blockers',
    '',
    ...blockers.map((item) => `- ${item}`),
    '',
    '## Guardrails',
    '',
    ...(report.guardrails || []).map((item) => `- ${item}`),
    '',
  ].join('\n');
}

module.exports = {
  ONE_TIME_OWNER_TEST_CONFIRM,
  ONE_TIME_OWNER_TEST_EMAIL_LIMIT,
  ONE_TIME_OWNER_TEST_WHATSAPP_LIMIT,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  OWNER_TEST_EMAIL_ENV_NAMES,
  OWNER_TEST_WHATSAPP_ENV_NAMES,
  buildOneTimeOwnerTestReadiness,
  fingerprint,
  loadOwnerAlias,
  normalizeEmail,
  normalizePhoneDigits,
  renderOneTimeOwnerTestReadinessMarkdown,
  safeAliasSummary,
  safeResendReadiness,
  safeWapiReadiness,
};
