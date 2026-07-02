#!/usr/bin/env node
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

function parseArgs(argv = []) {
  const args = { apply: false, json: false };
  for (const arg of argv) {
    if (arg === '--apply') args.apply = true;
    if (arg === '--json') args.json = true;
  }
  return args;
}

function safeLabel(value) {
  return String(value || '').trim() ? 'configured' : 'missing';
}

export function buildOneTimeDatabaseBootstrapCheck(options = {}) {
  const env = options.env || process.env;
  const applyRequested = Boolean(options.apply);
  const databaseUrlPresent = Boolean(env.ONE_TIME_DATABASE_URL || env.DATABASE_URL_ONE_TIME);
  const confirmation = env.CONFIRM_ONE_TIME_DB_BOOTSTRAP === 'one_time_mishnah_class';
  const applyAllowed = applyRequested && databaseUrlPresent && confirmation;
  return {
    generated_at: new Date().toISOString(),
    apply_requested: applyRequested,
    apply_allowed: applyAllowed,
    external_write_performed: false,
    database_mutation_performed: false,
    secret_values_printed: false,
    expected_database_scope: 'separate_one_time_database',
    database_url_status: databaseUrlPresent ? 'configured' : 'missing',
    database_url_source_label: databaseUrlPresent ? safeLabel(env.ONE_TIME_DATABASE_URL ? 'ONE_TIME_DATABASE_URL' : 'DATABASE_URL_ONE_TIME') : 'missing',
    required_confirmation: 'CONFIRM_ONE_TIME_DB_BOOTSTRAP=one_time_mishnah_class',
    seed_targets: [
      'rabbi_sheller_provider workspace',
      'one_time_mishnah_class project',
      'one_time brand/admin records',
      'info@onetimeonetime.com owner/admin alias',
      'safe TEST parent/member/student accounts only',
    ],
    blocker: applyAllowed ? null : 'Database bootstrap is dry-run/check only until separate One Time DB URL and exact bootstrap confirmation are present.',
  };
}

export async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const report = buildOneTimeDatabaseBootstrapCheck({ ...options, apply: args.apply || options.apply });
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`# One Time Database Bootstrap Check`);
    console.log(`apply_requested: ${report.apply_requested}`);
    console.log(`external_write_performed: ${report.external_write_performed}`);
    console.log(`database_mutation_performed: ${report.database_mutation_performed}`);
    console.log(`database_url_status: ${report.database_url_status}`);
    console.log(`apply_allowed: ${report.apply_allowed}`);
    if (report.blocker) console.log(`blocker: ${report.blocker}`);
  }
  if (args.apply && !report.apply_allowed) process.exitCode = 1;
  return report;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main().catch((error) => {
    console.error(error?.message || String(error));
    process.exitCode = 1;
  });
}
