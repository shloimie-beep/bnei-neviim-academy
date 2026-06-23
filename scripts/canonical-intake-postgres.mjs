#!/usr/bin/env node
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

const { buildCanonicalIntakePacket } = require('../src/platform/ingestion/intake-service');
const {
  applyCanonicalIntakePacketToPostgres,
  buildCanonicalIntakePostgresPlan,
  readCanonicalIntakePersistenceFromPostgres,
} = require('../src/platform/ingestion/intake-postgres-persistence');

export const APPLY_CONFIRM_PHRASE = 'APPLY_CANONICAL_INTAKE_POSTGRES';
export const READBACK_CONFIRM_PHRASE = 'READ_CANONICAL_INTAKE_POSTGRES';
export const APPLY_APPROVAL_ENV = 'BNA_CANONICAL_INTAKE_POSTGRES_APPLY_APPROVED';
export const READBACK_APPROVAL_ENV = 'BNA_CANONICAL_INTAKE_POSTGRES_READBACK_APPROVED';

const DEFAULT_SOURCE_PROVIDER = 'operations_ui';
const DEFAULT_SOURCE_KIND = 'text';

function readNext(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    apply: false,
    readback: false,
    json: false,
    stdin: false,
    confirm: '',
    confirmReadback: '',
    databaseUrlEnv: 'DATABASE_URL',
    sourceProvider: DEFAULT_SOURCE_PROVIDER,
    sourceKind: DEFAULT_SOURCE_KIND,
    actor: 'canonical_intake_postgres_cli',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--readback') options.readback = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--stdin') options.stdin = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--confirm') {
      options.confirm = readNext(argv, index, '--confirm');
      index += 1;
    } else if (arg.startsWith('--confirm=')) options.confirm = arg.slice('--confirm='.length);
    else if (arg === '--confirm-readback') {
      options.confirmReadback = readNext(argv, index, '--confirm-readback');
      index += 1;
    } else if (arg.startsWith('--confirm-readback=')) options.confirmReadback = arg.slice('--confirm-readback='.length);
    else if (arg === '--database-url-env') {
      options.databaseUrlEnv = readNext(argv, index, '--database-url-env');
      index += 1;
    } else if (arg.startsWith('--database-url-env=')) options.databaseUrlEnv = arg.slice('--database-url-env='.length);
    else if (arg === '--packet') {
      options.packetPath = readNext(argv, index, '--packet');
      index += 1;
    } else if (arg.startsWith('--packet=')) options.packetPath = arg.slice('--packet='.length);
    else if (arg === '--file') {
      options.filePath = readNext(argv, index, '--file');
      index += 1;
    } else if (arg.startsWith('--file=')) options.filePath = arg.slice('--file='.length);
    else if (arg === '--text') {
      options.text = readNext(argv, index, '--text');
      index += 1;
    } else if (arg.startsWith('--text=')) options.text = arg.slice('--text='.length);
    else if (arg === '--source-provider') {
      options.sourceProvider = readNext(argv, index, '--source-provider');
      index += 1;
    } else if (arg.startsWith('--source-provider=')) options.sourceProvider = arg.slice('--source-provider='.length);
    else if (arg === '--source-kind') {
      options.sourceKind = readNext(argv, index, '--source-kind');
      index += 1;
    } else if (arg.startsWith('--source-kind=')) options.sourceKind = arg.slice('--source-kind='.length);
    else if (arg === '--source-id') {
      options.sourceId = readNext(argv, index, '--source-id');
      index += 1;
    } else if (arg.startsWith('--source-id=')) options.sourceId = arg.slice('--source-id='.length);
    else if (arg === '--source-link') {
      options.sourceLink = readNext(argv, index, '--source-link');
      index += 1;
    } else if (arg.startsWith('--source-link=')) options.sourceLink = arg.slice('--source-link='.length);
    else if (arg === '--actor') {
      options.actor = readNext(argv, index, '--actor');
      index += 1;
    } else if (arg.startsWith('--actor=')) options.actor = arg.slice('--actor='.length);
    else if (arg === '--raw-intake-stable-id') {
      options.rawIntakeStableId = readNext(argv, index, '--raw-intake-stable-id');
      index += 1;
    } else if (arg.startsWith('--raw-intake-stable-id=')) options.rawIntakeStableId = arg.slice('--raw-intake-stable-id='.length);
    else if (arg === '--parse-run-id') {
      options.parseRunId = readNext(argv, index, '--parse-run-id');
      index += 1;
    } else if (arg.startsWith('--parse-run-id=')) options.parseRunId = arg.slice('--parse-run-id='.length);
    else if (arg === '--parent-prompt-id') {
      options.parentPromptId = readNext(argv, index, '--parent-prompt-id');
      index += 1;
    } else if (arg.startsWith('--parent-prompt-id=')) options.parentPromptId = arg.slice('--parent-prompt-id='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export function usage() {
  return `Usage:
  node scripts/canonical-intake-postgres.mjs --text "Task: ..." [--json]
  node scripts/canonical-intake-postgres.mjs --file raw.txt [--json]
  node scripts/canonical-intake-postgres.mjs --packet packet.json [--json]
  node scripts/canonical-intake-postgres.mjs --readback --raw-intake-stable-id ID --confirm ${READBACK_CONFIRM_PHRASE}
  node scripts/canonical-intake-postgres.mjs --apply --packet packet.json --confirm ${APPLY_CONFIRM_PHRASE}
  node scripts/canonical-intake-postgres.mjs --apply --readback --packet packet.json --confirm ${APPLY_CONFIRM_PHRASE} --confirm-readback ${READBACK_CONFIRM_PHRASE}

Dry-run by default. Readback requires ${READBACK_APPROVAL_ENV}=approved and a
database URL. Apply requires ${APPLY_APPROVAL_ENV}=approved, --confirm
${APPLY_CONFIRM_PHRASE}, and a packet/text input. Combined apply/readback
requires both approval gates and both confirmation phrases. The script never prints the database URL, SQL text, or SQL values.`;
}

function approved(value) {
  return /^(?:1|true|yes|approved)$/i.test(String(value || '').trim());
}

function hasPacketInput(options = {}) {
  return Boolean(options.packetPath || options.filePath || options.text || options.stdin);
}

function hasReadbackLocator(options = {}) {
  return Boolean(options.rawIntakeStableId || options.parseRunId || options.parentPromptId);
}

function readbackConfirmed(options = {}) {
  if (options.confirmReadback === READBACK_CONFIRM_PHRASE) return true;
  return !options.apply && options.confirm === READBACK_CONFIRM_PHRASE;
}

function normalizeLoadedPacket(value) {
  if (value?.packet) return normalizeLoadedPacket(value.packet);
  if (value?.source && !value.source_record) value.source_record = value.source;
  return value;
}

export function loadPacket(options = {}) {
  if (options.packetPath) {
    return normalizeLoadedPacket(JSON.parse(fs.readFileSync(options.packetPath, 'utf8')));
  }

  let rawText = '';
  if (options.text) rawText = options.text;
  else if (options.filePath) rawText = fs.readFileSync(options.filePath, 'utf8');
  else if (options.stdin) rawText = fs.readFileSync(0, 'utf8');

  if (!String(rawText || '').trim()) return null;
  return buildCanonicalIntakePacket({
    source_provider: options.sourceProvider || DEFAULT_SOURCE_PROVIDER,
    source_kind: options.sourceKind || DEFAULT_SOURCE_KIND,
    source_id: options.sourceId || null,
    source_link: options.sourceLink || null,
    raw_text: rawText,
    actor: options.actor || 'canonical_intake_postgres_cli',
    parser_version: 'w3-platform-parser-v1',
  }, {
    agent: options.actor || 'canonical_intake_postgres_cli',
  });
}

export function buildGuardReport(options = {}, env = process.env) {
  const blockers = [];
  const databaseUrl = String(env[options.databaseUrlEnv || 'DATABASE_URL'] || '').trim();

  if (options.apply) {
    if (options.confirm !== APPLY_CONFIRM_PHRASE) {
      blockers.push(`Missing confirmation phrase: --confirm ${APPLY_CONFIRM_PHRASE}`);
    }
    if (!approved(env[APPLY_APPROVAL_ENV])) {
      blockers.push(`${APPLY_APPROVAL_ENV}=approved is required before apply.`);
    }
    if (!hasPacketInput(options)) {
      blockers.push('Apply mode requires --packet, --text, --file, or --stdin.');
    }
  }
  if (options.readback) {
    if (!readbackConfirmed(options)) {
      const flag = options.apply ? '--confirm-readback' : '--confirm';
      blockers.push(`Missing readback confirmation phrase: ${flag} ${READBACK_CONFIRM_PHRASE}`);
    }
    if (!approved(env[READBACK_APPROVAL_ENV])) {
      blockers.push(`${READBACK_APPROVAL_ENV}=approved is required before readback.`);
    }
    if (!hasPacketInput(options) && !hasReadbackLocator(options)) {
      blockers.push('Readback mode requires --raw-intake-stable-id, --parse-run-id, --parent-prompt-id, or packet/text input.');
    }
  }
  if (!options.apply && !options.readback && !hasPacketInput(options)) {
    blockers.push('Dry-run mode requires --packet, --text, --file, or --stdin.');
  }

  if ((options.apply || options.readback) && !databaseUrl) {
    blockers.push(`${options.databaseUrlEnv || 'DATABASE_URL'} is not configured.`);
  }

  return {
    ok: blockers.length === 0,
    blockers,
    database_url_env: options.databaseUrlEnv || 'DATABASE_URL',
  };
}

function summarizePlan(plan) {
  if (!plan) return null;
  return {
    contract_version: plan.contract_version,
    storage_kind: plan.storage_kind,
    external_write_performed: plan.external_write_performed,
    applied: plan.applied,
    raw_intake_stable_id: plan.raw_intake_stable_id,
    parse_run_id: plan.parse_run_id,
    parent_prompt_id: plan.parent_prompt_id,
    counts: plan.counts,
    statement_names: plan.statements.map((statement) => statement.name),
    parse_item_statement_count: plan.parse_item_statements.length,
    parsed_entity_statement_count: plan.parsed_entity_statements.length,
    readback_locator: plan.readback_locator,
  };
}

function summarizeApply(result) {
  if (!result) return null;
  return {
    contract_version: result.contract_version,
    storage_kind: result.storage_kind,
    external_write_performed: result.external_write_performed,
    applied: result.applied,
    database_mutation_performed: Boolean(result.applied),
    raw_intake_stable_id: result.raw_intake_stable_id,
    parse_run_id: result.parse_run_id,
    parent_prompt_id: result.parent_prompt_id,
    legacy_parse_run_id: result.legacy_parse_run_id,
    legacy_parse_item_count: result.legacy_parse_item_ids?.length || 0,
    parse_item_count: result.parse_item_ids?.length || 0,
    parsed_entity_count: result.parsed_entity_ids?.length || 0,
    statements_executed: result.statements_executed || [],
    readback_locator: result.readback_locator,
  };
}

function summarizeReadback(readback) {
  if (!readback) return null;
  return {
    contract_version: readback.contract_version,
    storage_kind: readback.storage_kind,
    external_write_performed: readback.external_write_performed,
    found: readback.found,
    counts: readback.counts,
    entity_counts_by_group: readback.entity_counts_by_group,
    raw_intake_stable_id: readback.raw_intake?.stable_id || readback.parse_run?.raw_intake_stable_id || readback.parent_prompt?.raw_intake_stable_id || null,
    parse_run_id: readback.parse_run?.parse_run_id || readback.parent_prompt?.parse_run_id || null,
    parent_prompt_id: readback.parent_prompt?.prompt_id || readback.parse_run?.parent_prompt_id || null,
  };
}

function readbackLocator(options = {}, plan = null, applyResult = null) {
  return {
    raw_intake_stable_id: options.rawIntakeStableId || applyResult?.readback_locator?.raw_intake_stable_id || plan?.readback_locator?.raw_intake_stable_id || null,
    parse_run_id: options.parseRunId || applyResult?.readback_locator?.parse_run_id || plan?.readback_locator?.parse_run_id || null,
    parent_prompt_id: options.parentPromptId || applyResult?.readback_locator?.parent_prompt_id || plan?.readback_locator?.parent_prompt_id || null,
  };
}

function sslFor(connectionString) {
  return /(?:localhost|127\.0\.0\.1|\[::1\])/i.test(connectionString)
    ? false
    : { rejectUnauthorized: false };
}

async function connectClient(options = {}, env = process.env) {
  const { Client } = require('pg');
  const connectionString = env[options.databaseUrlEnv || 'DATABASE_URL'];
  const client = new Client({
    connectionString,
    ssl: sslFor(connectionString),
  });
  await client.connect();
  return client;
}

function printReport(report, options = {}) {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  console.log(`Canonical intake Postgres: ${report.ok ? 'ready' : 'blocked'}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`Mutation performed: ${report.database_mutation_performed ? 'yes' : 'no'}`);
  for (const blocker of report.blockers || []) console.log(`Blocked: ${blocker}`);
  if (report.plan?.readback_locator) {
    console.log(`Raw intake: ${report.plan.readback_locator.raw_intake_stable_id}`);
    console.log(`Parse run: ${report.plan.readback_locator.parse_run_id}`);
    console.log(`Parent prompt: ${report.plan.readback_locator.parent_prompt_id}`);
  }
}

export async function buildReport(options = {}, env = process.env) {
  const guard = buildGuardReport(options, env);
  let packet = null;
  let plan = null;
  if (hasPacketInput(options)) {
    packet = loadPacket(options);
    if (packet) plan = buildCanonicalIntakePostgresPlan(packet, { applied_at: packet.generated_at });
  }

  const report = {
    ok: guard.ok,
    mode: options.apply && options.readback ? 'apply_readback' : options.apply ? 'apply' : options.readback ? 'readback' : 'dry_run',
    database_url_env: guard.database_url_env,
    database_mutation_performed: false,
    blockers: [...guard.blockers],
    plan: summarizePlan(plan),
    apply: null,
    readback: null,
  };

  if (hasPacketInput(options) && !packet) {
    report.ok = false;
    report.blockers.push('No canonical intake packet could be built from the provided input.');
  }
  if (report.blockers.length) {
    report.ok = false;
    return report;
  }
  if (!options.apply && !options.readback) return report;

  const client = await connectClient(options, env);
  try {
    let applyResult = null;
    if (options.apply) {
      applyResult = await applyCanonicalIntakePacketToPostgres(packet, {
        client,
        applied_at: packet.generated_at,
      });
      report.apply = summarizeApply(applyResult);
      report.database_mutation_performed = true;
    }
    if (options.readback) {
      const locator = readbackLocator(options, plan, applyResult);
      const readback = await readCanonicalIntakePersistenceFromPostgres(client, locator);
      report.readback = summarizeReadback(readback);
    }
  } finally {
    await client.end();
  }

  return report;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const report = await buildReport(options);
  printReport(report, options);
  if (!report.ok) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(JSON.stringify({
      ok: false,
      mode: 'error',
      database_mutation_performed: false,
      error: error.message,
    }, null, 2));
    process.exit(1);
  });
}
