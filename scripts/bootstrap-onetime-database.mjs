#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const DEFAULT_SEED = 'ops/one-time-mishnah/separate-instance-seed.sql';
const DEFAULT_SCAN = 'ops/one-time-mishnah/separate-instance-isolation-scan.sql';
const DEFAULT_REPORT = 'ops/one-time-mishnah/onetime-database-bootstrap-report.json';
const CONFIRM_PHRASE = 'BOOTSTRAP_ONE_TIME_DATABASE';

function parseArgs(argv) {
  const options = {
    apply: false,
    confirm: '',
    json: false,
    writeReport: false,
    reportPath: DEFAULT_REPORT,
    seedPath: DEFAULT_SEED,
    scanPath: DEFAULT_SCAN,
    databaseUrlEnv: 'DATABASE_URL',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--confirm') {
      options.confirm = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--write-report') {
      options.writeReport = true;
    } else if (arg === '--report') {
      options.reportPath = argv[index + 1];
      options.writeReport = true;
      index += 1;
    } else if (arg === '--seed') {
      options.seedPath = argv[index + 1];
      index += 1;
    } else if (arg === '--scan') {
      options.scanPath = argv[index + 1];
      index += 1;
    } else if (arg === '--database-url-env') {
      options.databaseUrlEnv = argv[index + 1] || 'DATABASE_URL';
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function usage() {
  return `Usage: node scripts/bootstrap-onetime-database.mjs [--json] [--write-report]
       node scripts/bootstrap-onetime-database.mjs --apply --confirm ${CONFIRM_PHRASE}

Dry-run by default. In apply mode this requires APP_INSTANCE=onetime, reads the
database URL from DATABASE_URL unless --database-url-env is supplied, applies
tracked idempotent SQL files, applies the One Time-only seed, and runs the
isolation scan. It never prints the database URL or SQL contents.`;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function relative(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

function listSqlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listSqlFiles(fullPath));
    else if (/\.sql$/i.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function migrationSortKey(filePath) {
  const name = path.basename(filePath);
  const dated = name.match(/(\d{4})-?(\d{2})-?(\d{2})/);
  if (dated) return `${dated[1]}${dated[2]}${dated[3]}-${name}`;
  const compact = name.match(/(\d{8})/);
  if (compact) return `${compact[1]}-${name}`;
  return `99999999-${name}`;
}

function collectMigrationFiles() {
  const rootMigrations = fs.readdirSync(process.cwd(), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^railway-migration-.*\.sql$/i.test(entry.name))
    .map((entry) => path.join(process.cwd(), entry.name));
  const migrationDirFiles = listSqlFiles(path.join(process.cwd(), 'migrations'));
  return [...rootMigrations, ...migrationDirFiles]
    .sort((a, b) => migrationSortKey(a).localeCompare(migrationSortKey(b)));
}

function fileManifest(filePath, role = 'migration') {
  const sql = fs.readFileSync(filePath, 'utf8');
  return {
    role,
    path: relative(path.resolve(filePath)),
    bytes: Buffer.byteLength(sql),
    sha256: sha256(sql),
  };
}

function buildPlan(options) {
  const migrations = collectMigrationFiles().map((filePath) => fileManifest(filePath, 'migration'));
  const seed = fileManifest(path.resolve(options.seedPath), 'seed');
  const scan = fileManifest(path.resolve(options.scanPath), 'isolation_scan');
  return {
    mode: 'dry_run',
    ok: true,
    mutation_performed: false,
    confirmation_required: CONFIRM_PHRASE,
    database_url_env: options.databaseUrlEnv,
    instance_guard: {
      required_app_instance: 'onetime',
      current_app_instance: process.env.APP_INSTANCE || '',
      current_default_workspace_key: process.env.DEFAULT_WORKSPACE_KEY || '',
      current_default_project_key: process.env.DEFAULT_PROJECT_KEY || '',
    },
    migration_count: migrations.length,
    migrations,
    seed,
    isolation_scan: scan,
    apply_command: `npm run one-time:db:bootstrap -- --apply --confirm ${CONFIRM_PHRASE}`,
  };
}

function normalizeScanResults(queryResult) {
  const results = Array.isArray(queryResult) ? queryResult : [queryResult];
  return results
    .flatMap((result) => result?.rows || [])
    .filter((row) => row && row.check_name);
}

function assertApplyGuards(options) {
  const blockers = [];
  if (!options.apply) blockers.push('Run with --apply to mutate the database.');
  if (options.apply && options.confirm !== CONFIRM_PHRASE) {
    blockers.push(`Missing confirmation phrase: --confirm ${CONFIRM_PHRASE}`);
  }
  if (options.apply && String(process.env.APP_INSTANCE || '').trim().toLowerCase() !== 'onetime') {
    blockers.push('APP_INSTANCE must be onetime before applying One Time database bootstrap.');
  }
  if (options.apply && String(process.env.DEFAULT_WORKSPACE_KEY || '').trim() !== 'rabbi_sheller_provider') {
    blockers.push('DEFAULT_WORKSPACE_KEY must be rabbi_sheller_provider before applying One Time database bootstrap.');
  }
  if (options.apply && String(process.env.DEFAULT_PROJECT_KEY || '').trim() !== 'one_time_mishnah_class') {
    blockers.push('DEFAULT_PROJECT_KEY must be one_time_mishnah_class before applying One Time database bootstrap.');
  }
  if (options.apply && !String(process.env[options.databaseUrlEnv] || '').trim()) {
    blockers.push(`${options.databaseUrlEnv} is not configured.`);
  }
  return blockers;
}

async function applyBootstrap(options, plan) {
  const report = {
    ...plan,
    mode: 'apply',
    ok: false,
    mutation_performed: false,
    started_at: new Date().toISOString(),
    blockers: assertApplyGuards(options),
    applied: [],
    isolation_results: [],
  };
  if (report.blockers.length) return report;

  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env[options.databaseUrlEnv],
    ssl: /localhost|127\.0\.0\.1/i.test(process.env[options.databaseUrlEnv]) ? false : { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    const database = await client.query('SELECT current_database() AS database_name');
    report.database = { name: database.rows?.[0]?.database_name || '[unknown]' };

    for (const item of plan.migrations) {
      const sql = fs.readFileSync(path.resolve(item.path), 'utf8');
      await client.query(sql);
      report.applied.push(item);
      report.mutation_performed = true;
    }

    const seedSql = fs.readFileSync(path.resolve(plan.seed.path), 'utf8');
    await client.query(seedSql);
    report.applied.push(plan.seed);

    const scanSql = fs.readFileSync(path.resolve(plan.isolation_scan.path), 'utf8');
    const scanResult = await client.query(scanSql);
    report.isolation_results = normalizeScanResults(scanResult);
    const failures = report.isolation_results.filter((row) => row.check_name !== 'one_time_test_fixtures' && Number(row.count) !== 0);
    if (failures.length) {
      report.blockers.push(`Isolation scan failed: ${failures.map((row) => `${row.check_name}=${row.count}`).join(', ')}`);
    }
    report.ok = report.blockers.length === 0;
  } finally {
    await client.end();
  }
  report.completed_at = new Date().toISOString();
  return report;
}

function writeReport(reportPath, report) {
  const fullPath = path.resolve(reportPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(report, null, 2)}\n`);
  return relative(fullPath);
}

function printReport(report, options) {
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`One Time database bootstrap: ${report.ok ? 'ready' : 'blocked'}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`Migrations: ${report.migration_count}`);
  console.log(`Mutation performed: ${report.mutation_performed ? 'yes' : 'no'}`);
  for (const blocker of report.blockers || []) console.log(`Blocked: ${blocker}`);
  if (report.apply_command) console.log(`Apply command: ${report.apply_command}`);
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }
  const plan = buildPlan(options);
  const report = options.apply ? await applyBootstrap(options, plan) : plan;
  if (options.writeReport || options.apply) {
    report.report_path = writeReport(options.reportPath, report);
  }
  printReport(report, options);
  if (options.apply && !report.ok) process.exitCode = 2;
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    mode: 'error',
    mutation_performed: false,
    error: error.message,
  }, null, 2));
  process.exit(1);
}
