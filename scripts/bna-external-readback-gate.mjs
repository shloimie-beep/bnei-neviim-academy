#!/usr/bin/env node
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { loadSecret, safeSecretSourceLabel } = require('../src/lib/integrations/secret-loader');

export const READBACK_CONFIRM_PHRASE = 'READ_EXTERNAL_PRODUCTION_STATE';
export const BACKFILL_CONFIRM_PHRASE = 'APPLY_GUARDED_CLASS_BACKFILL';
export const READBACK_APPROVAL_ENV = 'BNA_EXTERNAL_READBACK_APPROVED';
export const BACKFILL_APPROVAL_ENV = 'BNA_BACKFILL_APPLY_APPROVED';

const SECRET_GROUPS = {
  database: [
    { envName: 'DATABASE_URL', names: ['railway-database-url', 'DATABASE_URL'] },
  ],
  railway: [
    { envName: 'RAILWAY_TOKEN', names: ['railway-token', 'RAILWAY_TOKEN'] },
  ],
  drive: [
    { envName: 'GOOGLE_APPLICATION_CREDENTIALS', names: ['google-application-credentials', 'GOOGLE_APPLICATION_CREDENTIALS'] },
    { envName: 'GOOGLE_CLIENT_EMAIL', names: ['google-client-email', 'GOOGLE_CLIENT_EMAIL'] },
    { envName: 'GOOGLE_PRIVATE_KEY', names: ['google-private-key', 'GOOGLE_PRIVATE_KEY'] },
    { envName: 'GOOGLE_REFRESH_TOKEN', names: ['google-refresh-token', 'GOOGLE_REFRESH_TOKEN'] },
  ],
};

const CONFIG_GROUPS = {
  railway: [
    'RAILWAY_PROJECT_ID',
    'RAILWAY_PROJECT_NAME',
    'RAILWAY_ENVIRONMENT_ID',
    'RAILWAY_ENVIRONMENT_NAME',
    'RAILWAY_SERVICE_ID',
    'RAILWAY_SERVICE_NAME',
  ],
  drive: [
    'BNA_DRIVE_ROOT_FOLDER_ID',
    'GOOGLE_DRIVE_ROOT_FOLDER_ID',
    'GOOGLE_DRIVE_FOLDER_ID',
    'BNA_CLASS_INTAKE_FOLDER_ID',
  ],
};

function readNext(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    json: false,
    readback: false,
    backfillApply: false,
    scopes: new Set(),
    confirmReadback: '',
    confirmBackfill: '',
    jobRange: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--readback') options.readback = true;
    else if (arg === '--backfill-apply') options.backfillApply = true;
    else if (arg === '--database') options.scopes.add('database');
    else if (arg === '--railway') options.scopes.add('railway');
    else if (arg === '--drive') options.scopes.add('drive');
    else if (arg === '--all') ['database', 'railway', 'drive'].forEach((scope) => options.scopes.add(scope));
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--confirm-readback') {
      options.confirmReadback = readNext(argv, index, '--confirm-readback');
      index += 1;
    } else if (arg.startsWith('--confirm-readback=')) options.confirmReadback = arg.slice('--confirm-readback='.length);
    else if (arg === '--confirm-backfill') {
      options.confirmBackfill = readNext(argv, index, '--confirm-backfill');
      index += 1;
    } else if (arg.startsWith('--confirm-backfill=')) options.confirmBackfill = arg.slice('--confirm-backfill='.length);
    else if (arg === '--job-range') {
      options.jobRange = readNext(argv, index, '--job-range');
      index += 1;
    } else if (arg.startsWith('--job-range=')) options.jobRange = arg.slice('--job-range='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.scopes.size === 0) ['database', 'railway', 'drive'].forEach((scope) => options.scopes.add(scope));
  return options;
}

export function usage() {
  return `Usage:
  node scripts/bna-external-readback-gate.mjs --json
  node scripts/bna-external-readback-gate.mjs --readback --all --confirm-readback ${READBACK_CONFIRM_PHRASE}
  node scripts/bna-external-readback-gate.mjs --backfill-apply --database --job-range 64-74 --confirm-backfill ${BACKFILL_CONFIRM_PHRASE}

Dry-run by default. This command reports configured/not-configured readiness
for database, Railway, and Drive gates by source label only. It does not perform
external reads, database writes, backfills, deploys, or live smokes.`;
}

function approved(value) {
  return /^(?:1|true|yes|approved)$/i.test(String(value || '').trim());
}

function envConfigured(env, name) {
  return String(env?.[name] || '').trim().length > 0;
}

function safeConfigState(env, names = []) {
  return names.map((name) => ({
    name,
    configured: envConfigured(env, name),
    source: envConfigured(env, name) ? 'env' : 'not configured',
  }));
}

function secretState(spec, context = {}) {
  const loadSecretFn = context.loadSecretFn || loadSecret;
  const loaded = loadSecretFn({
    envName: spec.envName,
    names: spec.names || [],
    fileNames: spec.fileNames || [],
    repoRoot: context.repoRoot || process.cwd(),
  });
  return {
    name: spec.envName,
    configured: Boolean(loaded?.configured),
    source: loaded?.configured ? safeSecretSourceLabel(loaded) : 'not configured',
  };
}

function anyConfigured(states = []) {
  return states.some((state) => state.configured);
}

function allConfigured(states = []) {
  return states.every((state) => state.configured);
}

function scopeReadiness(scope, context = {}) {
  const env = context.env || process.env;
  const secrets = (SECRET_GROUPS[scope] || []).map((spec) => secretState(spec, context));
  const config = safeConfigState(env, CONFIG_GROUPS[scope] || []);
  const secretReady = scope === 'drive' ? anyConfigured(secrets) : allConfigured(secrets);
  const configReady = scope === 'railway'
    ? anyConfigured(config.filter((state) => /PROJECT/.test(state.name))) &&
      anyConfigured(config.filter((state) => /ENVIRONMENT/.test(state.name))) &&
      anyConfigured(config.filter((state) => /SERVICE/.test(state.name)))
    : scope === 'drive'
      ? anyConfigured(config)
      : true;
  return {
    scope,
    ready: Boolean(secretReady && configReady),
    secrets,
    config,
  };
}

function selectedScopes(options = {}) {
  return [...(options.scopes || new Set(['database', 'railway', 'drive']))];
}

function buildBlockers(options = {}, readiness = {}, context = {}) {
  const env = context.env || process.env;
  const blockers = [];
  for (const scope of selectedScopes(options)) {
    if (!readiness[scope]?.ready) {
      blockers.push(`${scope} readback gate is not ready; required configured state is missing.`);
    }
  }
  if (options.readback) {
    if (options.confirmReadback !== READBACK_CONFIRM_PHRASE) {
      blockers.push(`Missing readback confirmation phrase: --confirm-readback ${READBACK_CONFIRM_PHRASE}`);
    }
    if (!approved(env[READBACK_APPROVAL_ENV])) {
      blockers.push(`${READBACK_APPROVAL_ENV}=approved is required before external readback.`);
    }
  }
  if (options.backfillApply) {
    if (options.confirmBackfill !== BACKFILL_CONFIRM_PHRASE) {
      blockers.push(`Missing backfill confirmation phrase: --confirm-backfill ${BACKFILL_CONFIRM_PHRASE}`);
    }
    if (!approved(env[BACKFILL_APPROVAL_ENV])) {
      blockers.push(`${BACKFILL_APPROVAL_ENV}=approved is required before guarded backfill apply.`);
    }
    if (!approved(env[READBACK_APPROVAL_ENV])) {
      blockers.push(`${READBACK_APPROVAL_ENV}=approved is required before applying backfill after readback.`);
    }
    if (!String(options.jobRange || '').trim()) {
      blockers.push('Backfill apply gate requires --job-range.');
    }
    if (!selectedScopes(options).includes('database')) {
      blockers.push('Backfill apply gate must include --database.');
    }
  }
  return blockers;
}

export function buildExternalReadbackGateReport(options = {}, context = {}) {
  const scopes = selectedScopes(options);
  const readiness = Object.fromEntries(scopes.map((scope) => [scope, scopeReadiness(scope, context)]));
  const blockers = buildBlockers(options, readiness, context);
  return {
    ok: blockers.length === 0,
    mode: options.backfillApply ? 'backfill_apply_gate' : options.readback ? 'external_readback_gate' : 'dry_run',
    generated_at: new Date().toISOString(),
    scopes,
    external_read_performed: false,
    production_mutation_performed: false,
    safe_apply_performed: false,
    deploy_performed: false,
    secrets_redacted: true,
    blockers,
    readiness,
    approval_gates: {
      readback: {
        requested: Boolean(options.readback),
        confirmation_phrase: READBACK_CONFIRM_PHRASE,
        approval_env: READBACK_APPROVAL_ENV,
        approved: approved((context.env || process.env)[READBACK_APPROVAL_ENV]),
      },
      backfill_apply: {
        requested: Boolean(options.backfillApply),
        confirmation_phrase: BACKFILL_CONFIRM_PHRASE,
        approval_env: BACKFILL_APPROVAL_ENV,
        approved: approved((context.env || process.env)[BACKFILL_APPROVAL_ENV]),
      },
    },
    next_command_plan: [
      `npm run bna:external-readback-gate -- --readback --all --confirm-readback ${READBACK_CONFIRM_PHRASE}`,
      `npm run bna:external-readback-gate -- --backfill-apply --database --job-range 64-74 --confirm-backfill ${BACKFILL_CONFIRM_PHRASE}`,
      'npm run drive:intake:truth',
      'npm run bna:intake:postgres -- --readback --confirm READ_CANONICAL_INTAKE_POSTGRES',
      'npm run bna:release-gate -- --json',
    ],
  };
}

export function summarizeExternalReadbackGateReport(report = {}) {
  const alreadySummarized = Array.isArray(report.scopes) &&
    report.scopes.some((scope) => scope && typeof scope === 'object' && Object.hasOwn(scope, 'ready'));
  const scopes = alreadySummarized
    ? report.scopes.map((scope) => ({
        scope: String(scope.scope || ''),
        ready: Boolean(scope.ready),
        secrets_configured: Number(scope.secrets_configured || 0),
        secrets_required: Number(scope.secrets_required || 0),
        config_configured: Number(scope.config_configured || 0),
        config_required: Number(scope.config_required || 0),
      }))
    : Object.entries(report.readiness || {}).map(([scope, state]) => {
        const secrets = Array.isArray(state.secrets) ? state.secrets : [];
        const config = Array.isArray(state.config) ? state.config : [];
        return {
          scope,
          ready: Boolean(state.ready),
          secrets_configured: secrets.filter((item) => item.configured).length,
          secrets_required: secrets.length,
          config_configured: config.filter((item) => item.configured).length,
          config_required: config.length,
        };
      });
  const approvalGates = report.approval_gates || {};
  return {
    ok: Boolean(report.ok),
    mode: report.mode || 'unknown',
    scopes,
    external_read_performed: Boolean(report.external_read_performed),
    production_mutation_performed: Boolean(report.production_mutation_performed),
    safe_apply_performed: Boolean(report.safe_apply_performed),
    deploy_performed: Boolean(report.deploy_performed),
    secrets_redacted: report.secrets_redacted !== false,
    blockers: Array.isArray(report.blockers) ? report.blockers : [],
    approval_gates: {
      readback: {
        requested: Boolean(approvalGates.readback?.requested),
        approved: Boolean(approvalGates.readback?.approved),
      },
      backfill_apply: {
        requested: Boolean(approvalGates.backfill_apply?.requested),
        approved: Boolean(approvalGates.backfill_apply?.approved),
      },
    },
    next_command_plan: Array.isArray(report.next_command_plan) ? report.next_command_plan : [],
  };
}

export function externalReadbackGateBlockers(report = {}) {
  const summary = summarizeExternalReadbackGateReport(report);
  return summary.scopes
    .filter((scope) => !scope.ready)
    .map((scope) => `${scope.scope} external readback readiness is blocked.`);
}

function printReport(report, options = {}) {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  console.log(`BNA external readback gate: ${report.ok ? 'ready' : 'blocked'}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`External read performed: ${report.external_read_performed ? 'yes' : 'no'}`);
  console.log(`Production mutation performed: ${report.production_mutation_performed ? 'yes' : 'no'}`);
  for (const [scope, state] of Object.entries(report.readiness)) {
    console.log(`${scope}: ${state.ready ? 'ready' : 'blocked'}`);
  }
  for (const blocker of report.blockers) console.log(`Blocked: ${blocker}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const report = buildExternalReadbackGateReport(options);
  printReport(report, options);
  if (!report.ok) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(JSON.stringify({
      ok: false,
      mode: 'error',
      external_read_performed: false,
      production_mutation_performed: false,
      error: error.message,
    }, null, 2));
    process.exit(1);
  });
}
