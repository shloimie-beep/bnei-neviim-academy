#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { runRailwayVariablesReadback } from './check-onetime-external-setup-readiness.mjs';

const require = createRequire(import.meta.url);
const {
  loadSecret,
  safeSecretSourceLabel,
  usableSecretValue,
} = require('../src/lib/integrations/secret-loader');
const {
  loadProviderLeadBotProfile,
  validateProviderLeadBotProfile,
} = require('../src/lib/bna/provider-lead-bot');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const DEFAULT_REPORT_BASE = path.join('ops', 'watchdog-audits', '2026-07-09-onetime-wapi-readiness');

const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const DEFAULT_WAPI_BASE_URL = 'https://gate.whapi.cloud';

function parseArgs(argv = []) {
  const args = {
    json: false,
    writeReport: false,
  };
  for (const arg of argv) {
    if (arg === '--json') args.json = true;
    if (arg === '--write-report') args.writeReport = true;
  }
  return args;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function truthy(value) {
  return /^(?:1|true|yes|live)$/i.test(String(value || '').trim());
}

function firstConfiguredEnv(env, names = []) {
  for (const name of names) {
    const value = usableSecretValue(env[name]);
    if (value) return { configured: true, source: 'env', env_name: name, value };
  }
  return null;
}

function loadCandidateSecret({ env, envNames = [], names = [], fileNames = [], repoRoot: root, inspectKeyholder }) {
  const envMatch = firstConfiguredEnv(env, envNames);
  if (envMatch) return envMatch;
  if (!inspectKeyholder) {
    return {
      configured: false,
      source: 'not configured',
      env_name: envNames[0] || '',
      value: '',
    };
  }
  for (const envName of envNames) {
    const loaded = loadSecret({ envName, names, fileNames, repoRoot: root });
    if (loaded.configured && usableSecretValue(loaded.value)) {
      return {
        configured: true,
        source: safeSecretSourceLabel(loaded),
        env_name: envName,
        value: usableSecretValue(loaded.value),
      };
    }
  }
  return {
    configured: false,
    source: 'not configured',
    env_name: envNames[0] || '',
    value: '',
  };
}

function configuredValue(env, names = []) {
  for (const name of names) {
    const value = usableSecretValue(env[name]);
    if (value) return { configured: true, source: 'env', env_name: name, value };
  }
  return { configured: false, source: 'not configured', env_name: names[0] || '', value: '' };
}

function summarizeCredential(token, fallbackToken) {
  if (token.configured) return 'one_time_scoped';
  if (fallbackToken.configured) return 'default_fallback';
  return 'missing';
}

function scopedTokenConfigured(token, railwayVariables = null) {
  return token.configured || railwayVariables?.one_time_wapi_token_present === true;
}

function scopedTokenSource(token, railwayVariables = null) {
  if (token.configured) return token.source;
  if (railwayVariables?.one_time_wapi_token_present === true) {
    return `${railwayVariables.source}:one_time_wapi_token_present`;
  }
  return token.source;
}

export function buildOneTimeWapiReadiness(options = {}) {
  const root = options.repoRoot || repoRoot;
  const env = options.env || {
    ...parseEnvFile(path.join(root, '.env.local')),
    ...process.env,
  };
  const inspectKeyholder = options.inspectKeyholder ?? !options.env;
  const inspectRailway = options.inspectRailway ?? !options.env;
  const railwayVariables = options.railwayVariables || (inspectRailway ? runRailwayVariablesReadback({
    repoRoot: root,
    env,
    runner: options.railwayRunner,
  }) : null);

  const oneTimeToken = loadCandidateSecret({
    env,
    repoRoot: root,
    inspectKeyholder,
    envNames: [
      'ONE_TIME_WAPI_API_TOKEN',
      'ONETIME_WAPI_API_TOKEN',
      'RABBI_SHELLER_WAPI_API_TOKEN',
      'RABBI_SCHELLER_WAPI_API_TOKEN',
    ],
    names: [
      'one-time-wapi-api-token',
      'onetime-wapi-api-token',
      'rabbi-sheller-wapi-api-token',
      'rabbi-scheller-wapi-api-token',
    ],
    fileNames: [
      'one-time-wapi-api-token.txt',
      'onetime-wapi-api-token.txt',
      'rabbi-sheller-wapi-api-token.txt',
      'rabbi-scheller-wapi-api-token.txt',
    ],
  });
  const defaultToken = loadCandidateSecret({
    env,
    repoRoot: root,
    inspectKeyholder,
    envNames: ['WAPI_API_TOKEN', 'WHAPI_API_TOKEN'],
    names: ['wapi-api-token', 'whapi-api-token', 'wapi-token', 'whapi-token'],
    fileNames: ['wapi-api-token.txt', 'whapi-api-token.txt', 'wapi-token.txt', 'whapi-token.txt'],
  });
  const baseUrl = configuredValue(env, [
    'ONE_TIME_WAPI_API_BASE_URL',
    'ONETIME_WAPI_API_BASE_URL',
    'RABBI_SHELLER_WAPI_API_BASE_URL',
    'RABBI_SCHELLER_WAPI_API_BASE_URL',
    'WAPI_API_BASE_URL',
    'WHAPI_API_BASE_URL',
  ]);
  const classLink = configuredValue(env, [
    'ONE_TIME_WHATSAPP_CLASS_LINK',
    'ONE_TIME_LIVE_CLASS_URL',
    'ONE_TIME_ZOOM_JOIN_URL',
    'ONE_TIME_TONIGHT_CLASS_LINK',
    'ONE_TIME_CURRENT_CLASS_LINK',
    'ONETIME_CLASS_LINK',
  ]);
  const classLinkConfigured = classLink.configured || railwayVariables?.one_time_class_link_present === true;
  const classLinkSource = classLink.configured
    ? classLink.source
    : railwayVariables?.one_time_class_link_present === true
      ? `${railwayVariables.source}:one_time_class_link_present`
      : classLink.source;
  const instance = configuredValue(env, [
    'ONE_TIME_WHAPI_INSTANCE_ID',
    'ONE_TIME_WAPI_INSTANCE_ID',
    'WHAPI_INSTANCE_ID',
    'WAPI_INSTANCE_ID',
  ]);
  const phone = configuredValue(env, [
    'ONE_TIME_WHAPI_PHONE',
    'ONE_TIME_WAPI_PHONE',
    'WHAPI_PHONE',
    'WAPI_PHONE',
    'BNA_WHATSAPP_NUMBER',
  ]);
  const instanceConfigured = instance.configured || railwayVariables?.one_time_whapi_instance_present === true;
  const instanceSource = instance.configured
    ? instance.source
    : railwayVariables?.one_time_whapi_instance_present === true
      ? `${railwayVariables.source}:one_time_whapi_instance_present`
      : instance.source;
  const phoneConfigured = phone.configured || railwayVariables?.one_time_whapi_phone_present === true;
  const phoneSource = phone.configured
    ? phone.source
    : railwayVariables?.one_time_whapi_phone_present === true
      ? `${railwayVariables.source}:one_time_whapi_phone_present`
      : phone.source;

  const oneTimeTokenConfigured = scopedTokenConfigured(oneTimeToken, railwayVariables);
  const credentialScope = oneTimeTokenConfigured ? 'one_time_scoped' : summarizeCredential(oneTimeToken, defaultToken);
  const providerBotProfileKey = String(env.ONE_TIME_PROVIDER_LEAD_BOT_PROFILE || 'one-time').trim() || 'one-time';
  let providerBotProfile = null;
  let providerBotProfileError = '';
  try {
    providerBotProfile = loadProviderLeadBotProfile(providerBotProfileKey, { configDir: path.join(root, 'config', 'service-provider-bots') });
    const validation = validateProviderLeadBotProfile(providerBotProfile);
    if (!validation.valid) providerBotProfileError = validation.errors.join('; ');
  } catch (error) {
    providerBotProfileError = error instanceof Error ? error.message : String(error);
  }
  const railwayProviderBotModeLive = railwayVariables?.one_time_provider_lead_bot_mode_live === true;
  const providerBotMode = railwayProviderBotModeLive
    ? 'live'
    : String(env.ONE_TIME_PROVIDER_LEAD_BOT_MODE || providerBotProfile?.policies?.activation_mode || 'observe_only').trim().toLowerCase();
  const webhookSecret = configuredValue(env, [
    'ONE_TIME_WAPI_WEBHOOK_SECRET',
    'ONETIME_WAPI_WEBHOOK_SECRET',
    'RABBI_SHELLER_WAPI_WEBHOOK_SECRET',
    'RABBI_SCHELLER_WAPI_WEBHOOK_SECRET',
    'WAPI_WEBHOOK_SECRET',
  ]);
  const webhookSecretConfigured =
    webhookSecret.configured ||
    railwayVariables?.one_time_wapi_webhook_secret_present === true;
  const autoReplyEnabled =
    truthy(env.ONE_TIME_WAPI_AUTO_REPLY_ENABLED) ||
    railwayVariables?.one_time_wapi_auto_reply_enabled_true === true;
  const autoReplyApproved =
    String(env.ONE_TIME_WAPI_AUTO_REPLY_CONFIRM || '').trim() === 'APPROVE_ONE_TIME_WAPI_AUTO_REPLY' ||
    railwayVariables?.one_time_wapi_auto_reply_confirm_approved === true;
  const telegramApproved =
    String(env.ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM || '').trim() === 'APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM' ||
    railwayVariables?.one_time_provider_lead_bot_telegram_confirm_approved === true;
  const outboundConfigured = oneTimeTokenConfigured || defaultToken.configured;
  const autoReplyBlockers = [];
  if (!oneTimeTokenConfigured) autoReplyBlockers.push('ONE_TIME_WAPI_API_TOKEN or RABBI_SHELLER_WAPI_API_TOKEN missing');
  if (defaultToken.configured && !oneTimeTokenConfigured) autoReplyBlockers.push('One Time auto-reply cannot use default/global WAPI credentials');
  if (!autoReplyEnabled) autoReplyBlockers.push('ONE_TIME_WAPI_AUTO_REPLY_ENABLED not enabled');
  if (!autoReplyApproved) autoReplyBlockers.push('ONE_TIME_WAPI_AUTO_REPLY_CONFIRM must equal APPROVE_ONE_TIME_WAPI_AUTO_REPLY');
  if (providerBotMode !== 'live') autoReplyBlockers.push('ONE_TIME_PROVIDER_LEAD_BOT_MODE must equal live');
  if (!providerBotProfile || providerBotProfileError) autoReplyBlockers.push('One Time provider lead-bot profile is missing or invalid');
  if (!webhookSecretConfigured) autoReplyBlockers.push('One Time WAPI webhook secret missing');
  if (!classLinkConfigured) autoReplyBlockers.push('ONE_TIME_WHATSAPP_CLASS_LINK or current class link alias missing');
  if (!telegramApproved) {
    autoReplyBlockers.push('ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM must equal APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM');
  }

  const setupBlockers = [];
  if (!outboundConfigured) setupBlockers.push('WAPI/Whapi token missing');
  if (!oneTimeTokenConfigured) setupBlockers.push('One Time scoped WAPI token missing');
  if (!instanceConfigured) setupBlockers.push('Whapi/WAPI instance id missing');
  if (!phoneConfigured) setupBlockers.push('WhatsApp sender phone metadata missing');
  if (!webhookSecretConfigured) setupBlockers.push('WAPI webhook secret missing');
  if (!providerBotProfile || providerBotProfileError) setupBlockers.push('Provider lead-bot profile missing or invalid');

  const telegramBlockers = [];
  if (providerBotMode !== 'live') telegramBlockers.push('ONE_TIME_PROVIDER_LEAD_BOT_MODE must equal live');
  if (!telegramApproved) telegramBlockers.push('ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM must equal APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM');

  const autoReplyReady = autoReplyBlockers.length === 0;
  const providerSetupReady = setupBlockers.length === 0;

  return {
    success: true,
    checked_at: new Date().toISOString(),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    external_write_performed: false,
    whatsapp_send_performed: false,
    crm_mutation_performed: false,
    secret_values_printed: false,
    mode: 'readiness_no_send',
    outbound: {
      configured: outboundConfigured,
      credential_scope: credentialScope,
      one_time_token_present: oneTimeTokenConfigured,
      default_token_present: defaultToken.configured,
      one_time_token_source: scopedTokenSource(oneTimeToken, railwayVariables),
      default_token_source: defaultToken.source,
      base_url_configured: Boolean(baseUrl.configured || DEFAULT_WAPI_BASE_URL),
      base_url_source: baseUrl.configured ? baseUrl.source : 'default',
      railway_readback: railwayVariables
        ? {
          attempted: railwayVariables.attempted,
          ok: railwayVariables.ok,
          source: railwayVariables.source,
          key_count: railwayVariables.key_count,
          class_link_present: railwayVariables.one_time_class_link_present === true,
          instance_id_present: railwayVariables.one_time_whapi_instance_present === true,
          phone_metadata_present: railwayVariables.one_time_whapi_phone_present === true,
          webhook_secret_present: railwayVariables.one_time_wapi_webhook_secret_present === true,
          auto_reply_enabled: railwayVariables.one_time_wapi_auto_reply_enabled_true === true,
          auto_reply_confirm_approved: railwayVariables.one_time_wapi_auto_reply_confirm_approved === true,
          provider_bot_mode_live: railwayVariables.one_time_provider_lead_bot_mode_live === true,
          telegram_confirm_approved: railwayVariables.one_time_provider_lead_bot_telegram_confirm_approved === true,
        }
        : null,
    },
    provider_setup: {
      ready: providerSetupReady,
      instance_id_present: instanceConfigured,
      instance_id_source: instanceSource,
      phone_metadata_present: phoneConfigured,
      phone_metadata_source: phoneSource,
      blockers: setupBlockers,
    },
    auto_reply: {
      ready: autoReplyReady,
      enabled: autoReplyEnabled,
      approved: autoReplyApproved,
      class_link_configured: classLinkConfigured,
      class_link_source: classLinkSource,
      credential_scope: credentialScope,
      provider_bot_profile: providerBotProfile?.profile_key || providerBotProfileKey,
      provider_bot_profile_version: providerBotProfile?.version || null,
      provider_bot_profile_valid: Boolean(providerBotProfile && !providerBotProfileError),
      provider_bot_mode: providerBotMode,
      webhook_secret_present: webhookSecretConfigured,
      webhook_header_auth_only_required: true,
      instance_binding_required: true,
      destination_number_binding_required: true,
      telegram_notifications_approved: telegramApproved,
      blockers: autoReplyBlockers,
      copy_version: providerBotProfile?.version || 'unavailable',
    },
    telegram_notifications: {
      ready: telegramBlockers.length === 0,
      approved: telegramApproved,
      provider_bot_mode: providerBotMode,
      blockers: telegramBlockers,
    },
    required_next_actions: [...new Set([...setupBlockers, ...autoReplyBlockers, ...telegramBlockers])],
    guardrails: [
      'Readiness check only; no WhatsApp message is sent.',
      'No CRM contact, tag, lead, or communication row is created or updated.',
      'No secret values, chat IDs, raw class links, or phone numbers are printed.',
      'One Time auto-reply requires One Time scoped WAPI credentials, a valid provider-bot profile, header-authenticated instance/destination binding, live mode, explicit WhatsApp and Telegram approvals, and a configured class link.',
    ],
  };
}

function renderMarkdown(report) {
  const blockers = report.required_next_actions.length
    ? report.required_next_actions.map((item) => `- ${item}`)
    : ['- None'];
  return [
    '# One Time WAPI / WhatsApp Readiness',
    '',
    `Checked at: ${report.checked_at}`,
    '',
    `Workspace/project: \`${report.workspace_key}\` / \`${report.project_key}\``,
    `Mode: ${report.mode}`,
    `External write performed: ${report.external_write_performed}`,
    `WhatsApp send performed: ${report.whatsapp_send_performed}`,
    `CRM mutation performed: ${report.crm_mutation_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    '',
    '## Summary',
    '',
    `- Outbound configured: ${report.outbound.configured}`,
    `- Credential scope: ${report.outbound.credential_scope}`,
    `- Provider setup ready: ${report.provider_setup.ready}`,
    `- Auto-reply ready: ${report.auto_reply.ready}`,
    `- Auto-reply enabled: ${report.auto_reply.enabled}`,
    `- Auto-reply approved: ${report.auto_reply.approved}`,
    `- Telegram notifications approved: ${report.auto_reply.telegram_notifications_approved}`,
    `- Telegram notifications ready: ${report.telegram_notifications.ready}`,
    `- Class link configured: ${report.auto_reply.class_link_configured}`,
    '',
    '## Blockers / Next Actions',
    '',
    ...blockers,
    '',
    '## Guardrails',
    '',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
  ].join('\n');
}

function writeReport(report, root = repoRoot) {
  const basePath = path.resolve(root, DEFAULT_REPORT_BASE);
  fs.mkdirSync(path.dirname(basePath), { recursive: true });
  fs.writeFileSync(`${basePath}.json`, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(`${basePath}.md`, renderMarkdown(report));
  return {
    json: path.relative(root, `${basePath}.json`).replace(/\\/g, '/'),
    md: path.relative(root, `${basePath}.md`).replace(/\\/g, '/'),
  };
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const report = buildOneTimeWapiReadiness(options);
  const paths = args.writeReport ? writeReport(report, options.repoRoot || repoRoot) : null;
  const payload = { ...report, report_paths: paths };
  if (args.json) console.log(JSON.stringify(payload, null, 2));
  else console.log(renderMarkdown(report));
  if (!report.provider_setup.ready || !report.auto_reply.ready || !report.telegram_notifications.ready) process.exitCode = 1;
  return payload;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 2;
  });
}
