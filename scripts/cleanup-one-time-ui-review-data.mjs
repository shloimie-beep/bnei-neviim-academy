#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const WORKSPACE_KEY = 'rabbi_sheller_provider';
const PROJECT_KEY = 'one_time_mishnah_class';
const SEED_KEY = 'one_time_ui_review_20260702';
const CONFIRM_PHRASE = 'CLEANUP_ONE_TIME_UI_REVIEW_DATA';
const DEFAULT_OUT_DIR = 'ops/one-time-mishnah/mock-data/2026-07-02-ui-review';
const DEFAULT_REPORT = 'ops/one-time-mishnah/mock-data/2026-07-02-ui-review-cleanup-readback.json';

function parseArgs(argv) {
  const options = {
    apply: false,
    confirm: '',
    json: false,
    writeReport: false,
    outDir: DEFAULT_OUT_DIR,
    reportPath: DEFAULT_REPORT,
    databaseUrlEnv: 'DATABASE_URL',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--confirm') {
      options.confirm = argv[index + 1] || '';
      index += 1;
    } else if (arg === '--json') options.json = true;
    else if (arg === '--write-report') options.writeReport = true;
    else if (arg === '--out-dir') {
      options.outDir = argv[index + 1] || DEFAULT_OUT_DIR;
      index += 1;
    } else if (arg === '--report') {
      options.reportPath = argv[index + 1] || DEFAULT_REPORT;
      options.writeReport = true;
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
  return `Usage: node scripts/cleanup-one-time-ui-review-data.mjs [--json] [--write-report]
       node scripts/cleanup-one-time-ui-review-data.mjs --apply --confirm ${CONFIRM_PHRASE}

Dry-run by default. Cleanup deletes only rows tagged with cleanup marker
${SEED_KEY}. Apply mode requires APP_INSTANCE=onetime,
DEFAULT_WORKSPACE_KEY=${WORKSPACE_KEY}, DEFAULT_PROJECT_KEY=${PROJECT_KEY}, a
database URL, and the exact confirmation phrase.`;
}

function rel(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

function sqlLiteral(value) {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

function buildCleanupSql() {
  const marker = sqlLiteral(SEED_KEY);
  return `-- Cleanup One Time UI review TEST data.
-- Deletes only rows with cleanup marker ${SEED_KEY}.

BEGIN;

DELETE FROM bna_communications WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_contact_pipeline_events WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_contacts WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_support_tickets
 WHERE source_context->>'cleanup_marker' = ${marker}
    OR authenticated_context->>'cleanup_marker' = ${marker}
    OR ticket_number LIKE 'TEST-OT-UI-%';
DELETE FROM bna_tasks WHERE ai_parsed->>'cleanup_marker' = ${marker};
DELETE FROM one_time_member_library_items WHERE package_snapshot->>'cleanup_marker' = ${marker};
DELETE FROM bna_class_sessions WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM one_time_member_access WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_project_members WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_workspace_memberships WHERE metadata->>'cleanup_marker' = ${marker};
DELETE FROM bna_people WHERE metadata->>'cleanup_marker' = ${marker};

COMMIT;
`;
}

function writeSql(options, sql) {
  const outDir = path.resolve(options.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  const sqlPath = path.join(outDir, 'cleanup-ui-review-data.sql');
  fs.writeFileSync(sqlPath, sql);
  return rel(sqlPath);
}

function assertApplyGuards(options) {
  const blockers = [];
  if (options.confirm !== CONFIRM_PHRASE) blockers.push(`Missing confirmation phrase: --confirm ${CONFIRM_PHRASE}`);
  if (String(process.env.APP_INSTANCE || '').trim().toLowerCase() !== 'onetime') blockers.push('APP_INSTANCE must be onetime.');
  if (String(process.env.DEFAULT_WORKSPACE_KEY || '').trim() !== WORKSPACE_KEY) blockers.push(`DEFAULT_WORKSPACE_KEY must be ${WORKSPACE_KEY}.`);
  if (String(process.env.DEFAULT_PROJECT_KEY || '').trim() !== PROJECT_KEY) blockers.push(`DEFAULT_PROJECT_KEY must be ${PROJECT_KEY}.`);
  if (!String(process.env[options.databaseUrlEnv] || '').trim()) blockers.push(`${options.databaseUrlEnv} is not configured.`);
  return blockers;
}

async function applyCleanup(options, sql) {
  const blockers = assertApplyGuards(options);
  if (blockers.length) return { ok: false, mutation_performed: false, blockers };
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env[options.databaseUrlEnv],
    ssl: /localhost|127\.0\.0\.1/i.test(process.env[options.databaseUrlEnv]) ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    return { ok: true, mutation_performed: true, blockers: [] };
  } finally {
    await client.end();
  }
}

function writeReport(reportPath, report) {
  const fullPath = path.resolve(reportPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(report, null, 2)}\n`);
  const mdPath = fullPath.replace(/\.json$/i, '.md');
  fs.writeFileSync(mdPath, `# One Time UI Review Cleanup Readback

- Generated: ${report.generated_at}
- Mode: ${report.mode}
- OK: ${report.ok ? 'yes' : 'no'}
- Mutation performed: ${report.mutation_performed ? 'yes' : 'no'}
- Workspace/project: ${WORKSPACE_KEY} / ${PROJECT_KEY}
- Cleanup SQL: ${report.cleanup_sql_path}

## Blockers

${(report.blockers || []).length ? report.blockers.map((item) => `- ${item}`).join('\n') : '- None'}
`);
  return { json: rel(fullPath), md: rel(mdPath) };
}

function printReport(report, options) {
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`One Time UI review cleanup: ${report.ok ? 'ok' : 'blocked'}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`Mutation performed: ${report.mutation_performed ? 'yes' : 'no'}`);
  for (const blocker of report.blockers || []) console.log(`Blocked: ${blocker}`);
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }
  const sql = buildCleanupSql();
  const cleanupSqlPath = writeSql(options, sql);
  const applyResult = options.apply
    ? await applyCleanup(options, sql)
    : { ok: true, mutation_performed: false, blockers: [] };
  const report = {
    ok: applyResult.ok,
    mode: options.apply ? 'apply' : 'dry_run',
    generated_at: new Date().toISOString(),
    mutation_performed: Boolean(applyResult.mutation_performed),
    external_writes_performed: false,
    cleanup_marker: SEED_KEY,
    database_url_env: options.databaseUrlEnv,
    cleanup_sql_path: cleanupSqlPath,
    blockers: applyResult.blockers || [],
  };
  if (options.writeReport || options.apply) {
    report.report_paths = writeReport(options.reportPath, report);
  }
  printReport(report, options);
  if (!report.ok) process.exitCode = options.apply ? 2 : 1;
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    mode: 'error',
    mutation_performed: false,
    error: error.message,
  }, null, 2));
  process.exit(1);
}
