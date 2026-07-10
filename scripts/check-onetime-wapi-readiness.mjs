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

  const credentialScope = summarizeCredential(oneTimeToken, defaultToken);
  const autoReplyEnabled = truthy(env.ONE_TIME_WAPI_AUTO_REPLY_ENABLED);
  const autoReplyApproved = String(env.ONE_TIME_WAPI_AUTO_REPLY_CONFIRM || '').trim() === 'APPROVE_ONE_TIME_WAPI_AUTO_REPLY';
  const outboundConfigured = oneTimeToken.configured || defaultToken.configured;
  const autoReplyBlockers = [];
  if (!oneTimeToken.configured) autoReplyBlockers.push('ONE_TIME_WAPI_API_TOKEN or RABBI_SHELLER_WAPI_API_TOKEN missing');
  if (defaultToken.configured && !oneTimeToken.configured) autoReplyBlockers.push('One Time auto-reply cannot use default/global WAPI credentials');
  if (!autoReplyEnabled) autoReplyBlockers.push('ONE_TIME_WAPI_AUTO_REPLY_ENABLED not enabled');
  if (!autoReplyApproved) autoReplyBlockers.push('ONE_TIME_WAPI_AUTO_REPLY_CONFIRM must equal APPROVE_ONE_TIME_WAPI_AUTO_REPLY');
  if (!classLinkConfigured) autoReplyBlockers.push('ONE_TIME_WHATSAPP_CLASS_LINK or current class link alias missing');

  const setupBlockers = [];
  if (!outboundConfigured) setupBlockers.push('WAPI/Whapi token missing');
  if (!oneTimeToken.configured) setupBlockers.push('One Time scoped WAPI token missing');
  if (!instanceConfigured) setupBlockers.push('Whapi/WAPI instance id missing');
  if (!phoneConfigured) setupBlockers.push('WhatsApp sender phone metadata missing');

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
      one_time_token_present: oneTimeToken.configured,
      default_token_present: defaultToken.configured,
      one_time_token_source: oneTimeToken.source,
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
      blockers: autoReplyBlockers,
      copy_version: '2026-07-08-r1',
    },
    required_next_actions: [...new Set([...setupBlockers, ...autoReplyBlockers])],
    guardrails: [
      'Readiness check only; no WhatsApp message is sent.',
      'No CRM contact, tag, lead, or communication row is created or updated.',
      'No secret values, chat IDs, raw class links, or phone numbers are printed.',
      'One Time auto-reply requires One Time scoped WAPI credentials, an approved flag, and a configured class link.',
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
  if (!report.provider_setup.ready || !report.auto_reply.ready) process.exitCode = 1;
  return payload;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 2;
  });
}
