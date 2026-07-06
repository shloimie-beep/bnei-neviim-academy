#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const secretsDir = path.join(repoRoot, '.secrets');
const CONFIRM_PHRASE = 'CLEAN_JOB101_REVIEW_QUEUE';
const DEFAULT_REPORT = 'ops/drive-transcript-visibility/2026-07-06/job101-review-cleanup-report.json';

const TRIAGE_CLUSTERS = [
  {
    cluster_id: 'J101-UI-001',
    title: 'Fix Operations top filter controls and compact filter-box layout',
    source_review_ids: [49755],
  },
  {
    cluster_id: 'J101-UI-002',
    title: 'Unify Contacts, Interested Parents, tags, and communication filters',
    source_review_ids: [49752, 49753, 49754, 49756, 50153, 50689, 50690, 50691, 51090],
  },
  {
    cluster_id: 'J101-UI-003',
    title: 'Repair mobile bot/helper text input behavior on Android/Samsung-style keyboard',
    source_review_ids: [49759, 49760],
  },
];

const PROTECTED_PATTERNS = [
  /\bscore\b/i,
  /\bprogress\b/i,
  /\bgrading\b/i,
  /\bgrade\b/i,
  /\bstudent\b/i,
  /\baccountability\b/i,
  /\bprivate\b/i,
  /\bparent\b/i,
  /\bclass note\b/i,
  /\btorah\b/i,
  /\bmishnah\b/i,
];

const INSTRUCTION_LEAKAGE_PATTERNS = [
  /split coding\/app\/dashboard\/parser\/website\/bot\/railway\/legacy crm/i,
  /this recording may include both operator tasks and student accountability/i,
  /parser instruction leakage/i,
];

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    apply: false,
    confirm: '',
    json: false,
    writeReport: false,
    reportPath: DEFAULT_REPORT,
    parseRunId: 59,
    contentJobId: 101,
    status: 'open',
    limit: 1000,
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
    else if (arg === '--report') {
      options.reportPath = argv[index + 1] || options.reportPath;
      options.writeReport = true;
      index += 1;
    } else if (arg === '--parse-run-id') {
      options.parseRunId = Number(argv[index + 1] || options.parseRunId);
      index += 1;
    } else if (arg.startsWith('--parse-run-id=')) {
      options.parseRunId = Number(arg.split('=')[1]);
    } else if (arg === '--content-job-id') {
      options.contentJobId = Number(argv[index + 1] || options.contentJobId);
      index += 1;
    } else if (arg.startsWith('--content-job-id=')) {
      options.contentJobId = Number(arg.split('=')[1]);
    } else if (arg === '--status') {
      options.status = argv[index + 1] || options.status;
      index += 1;
    } else if (arg.startsWith('--status=')) {
      options.status = arg.split('=')[1] || options.status;
    } else if (arg === '--limit') {
      options.limit = Number(argv[index + 1] || options.limit);
      index += 1;
    } else if (arg.startsWith('--limit=')) {
      options.limit = Number(arg.split('=')[1]);
    } else if (arg === '--database-url-env') {
      options.databaseUrlEnv = argv[index + 1] || options.databaseUrlEnv;
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  options.limit = Math.max(1, Math.min(Number(options.limit || 1000), 2000));
  if (!Number.isInteger(options.parseRunId) || options.parseRunId <= 0) throw new Error('parse run id must be a positive integer');
  return options;
}

function usage() {
  return `Usage: node scripts/cleanup-job101-review-queue.mjs --json --write-report
       node scripts/cleanup-job101-review-queue.mjs --apply --confirm ${CONFIRM_PHRASE} --json --write-report

Dry-run by default. The script redacts DB URLs and review payloads, audits which
database source is selected, and only applies known Job 101 triage cleanup rows
or parser-instruction artifacts. Score/progress/grading/private/student rows
remain open.`;
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    env[key] = value;
  }
  return env;
}

function readSecret(name) {
  const filePath = path.join(secretsDir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function usableDatabaseUrl(value) {
  const text = String(value || '').trim();
  if (!text || text.includes('[YOUR-PASSWORD]') || text.includes('REPLACE_ME')) return '';
  if (!/^postgres(?:ql)?:\/\//i.test(text)) return '';
  return text;
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function safeUrlFingerprint(value) {
  const text = usableDatabaseUrl(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    return sha256(`${url.protocol}//${url.hostname}:${url.port || ''}${url.pathname}`);
  } catch {
    return null;
  }
}

function redactDatabaseUrl(value) {
  const text = usableDatabaseUrl(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    const database = decodeURIComponent((url.pathname || '').replace(/^\//, '')) || '[default]';
    return {
      protocol: url.protocol.replace(':', ''),
      host: url.hostname,
      port_present: Boolean(url.port),
      database,
      fingerprint: safeUrlFingerprint(text),
    };
  } catch {
    return { fingerprint: safeUrlFingerprint(text), parse_error: true };
  }
}

function databaseCandidates(options) {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...process.env,
  };
  const candidates = [
    { label: `env:${options.databaseUrlEnv}`, value: process.env[options.databaseUrlEnv] },
    { label: 'secret:railway-database-url.txt', value: readSecret('railway-database-url.txt') },
    { label: `env-file:${options.databaseUrlEnv}`, value: env[options.databaseUrlEnv] },
    { label: 'env:ONE_TIME_DATABASE_URL', value: process.env.ONE_TIME_DATABASE_URL },
    { label: 'env:DATABASE_URL_ONE_TIME', value: process.env.DATABASE_URL_ONE_TIME },
    { label: 'secret:one-time-database-url.txt', value: readSecret('one-time-database-url.txt') },
    { label: 'secret:DATABASE_URL_ONE_TIME.txt', value: readSecret('DATABASE_URL_ONE_TIME.txt') },
  ].map((candidate) => {
    const usable = usableDatabaseUrl(candidate.value);
    return {
      label: candidate.label,
      present: Boolean(String(candidate.value || '').trim()),
      usable: Boolean(usable),
      redacted: redactDatabaseUrl(usable),
      value: usable,
    };
  });
  const selected = candidates.find((candidate) =>
    ['env:', 'secret:railway-database-url.txt', 'env-file:'].some((prefix) => candidate.label.startsWith(prefix))
    && candidate.usable
    && !candidate.label.includes('ONE_TIME')
  ) || candidates.find((candidate) => candidate.usable);
  return { candidates, selected };
}

function jsonText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function payloadKeys(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.keys(value).sort().slice(0, 25);
}

function rowSearchText(row) {
  return [
    row.reason,
    row.item_type,
    row.item_title,
    row.item_summary,
    jsonText(row.payload),
    jsonText(row.item_payload),
  ].join('\n');
}

function protectedReason(row) {
  const text = rowSearchText(row);
  const match = PROTECTED_PATTERNS.find((pattern) => pattern.test(text));
  return match ? `protected_pattern:${String(match).replace(/^\/|\/[a-z]*$/gi, '')}` : '';
}

function instructionLeakageReason(row) {
  const text = rowSearchText(row);
  const match = INSTRUCTION_LEAKAGE_PATTERNS.find((pattern) => pattern.test(text));
  return match ? `instruction_leakage:${String(match).replace(/^\/|\/[a-z]*$/gi, '')}` : '';
}

function triageClusterForReviewId(id) {
  return TRIAGE_CLUSTERS.find((cluster) => cluster.source_review_ids.includes(Number(id))) || null;
}

function classifyRow(row) {
  const cluster = triageClusterForReviewId(row.id);
  if (cluster) {
    return {
      action: 'resolve_to_triage_cluster',
      proposed_status: 'resolved',
      reason: 'known_job101_triage_cluster',
      cluster_id: cluster.cluster_id,
      canonical_title: cluster.title,
      apply_allowed: true,
    };
  }
  const protectedMatch = protectedReason(row);
  if (protectedMatch) {
    return {
      action: 'keep_open',
      proposed_status: row.status,
      reason: protectedMatch,
      apply_allowed: false,
    };
  }
  const leakageMatch = instructionLeakageReason(row);
  if (leakageMatch) {
    return {
      action: 'ignore_parser_artifact',
      proposed_status: 'ignored',
      reason: leakageMatch,
      apply_allowed: true,
    };
  }
  return {
    action: 'keep_open',
    proposed_status: row.status,
    reason: 'not_safe_to_auto_close',
    apply_allowed: false,
  };
}

function safeReviewRow(row, classification) {
  return {
    review_id: Number(row.id),
    parse_item_id: row.parse_item_id ? Number(row.parse_item_id) : null,
    review_type: row.review_type || '',
    review_status: row.status || '',
    item_type: row.item_type || '',
    item_status: row.item_status || '',
    reason_hash: sha256(row.reason || '').slice(0, 16),
    item_title_hash: sha256(row.item_title || '').slice(0, 16),
    payload_keys: payloadKeys(row.payload),
    item_payload_keys: payloadKeys(row.item_payload),
    action: classification.action,
    proposed_status: classification.proposed_status,
    classification_reason: classification.reason,
    cluster_id: classification.cluster_id || null,
    canonical_title: classification.canonical_title || null,
  };
}

async function queryReadback(pool, options) {
  const database = (await pool.query(`
    SELECT current_database() AS database_name,
           current_schema() AS schema_name,
           inet_server_addr()::text AS server_addr,
           inet_server_port() AS server_port
  `)).rows[0] || {};
  const parseRun = (await pool.query(
    `SELECT id, source_type, source_id, source_table, parser_version, dry_run, status, summary, metadata, created_at, updated_at
     FROM bna_intake_parse_runs
     WHERE id = $1
     LIMIT 1`,
    [options.parseRunId]
  )).rows[0] || null;
  const statusCounts = (await pool.query(
    `SELECT status, count(*)::integer AS count
     FROM bna_parse_review_queue
     WHERE parse_run_id = $1
     GROUP BY status
     ORDER BY status`,
    [options.parseRunId]
  )).rows;
  const reviewTypeCounts = (await pool.query(
    `SELECT review_type, status, count(*)::integer AS count
     FROM bna_parse_review_queue
     WHERE parse_run_id = $1
     GROUP BY review_type, status
     ORDER BY review_type, status`,
    [options.parseRunId]
  )).rows;
  const params = [options.parseRunId];
  const conditions = ['q.parse_run_id = $1'];
  if (options.status && options.status !== 'all') {
    params.push(options.status);
    conditions.push(`q.status = $${params.length}`);
  }
  params.push(options.limit);
  const reviews = (await pool.query(
    `SELECT q.id, q.parse_item_id, q.review_type, q.reason, q.payload, q.status, q.created_at, q.updated_at,
            i.item_type, i.title AS item_title, i.summary AS item_summary, i.payload AS item_payload, i.status AS item_status
     FROM bna_parse_review_queue q
     LEFT JOIN bna_intake_parse_items i ON i.id = q.parse_item_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY q.id ASC
     LIMIT $${params.length}`,
    params
  )).rows;
  return { database, parseRun, statusCounts, reviewTypeCounts, reviews };
}

async function applyCleanup(pool, rows, options) {
  if (!options.apply) return { mutation_performed: false, changed: [], skipped: [] };
  if (options.confirm !== CONFIRM_PHRASE) {
    return {
      mutation_performed: false,
      changed: [],
      skipped: [],
      blocker: `Missing confirmation phrase: --confirm ${CONFIRM_PHRASE}`,
    };
  }

  const candidates = rows.filter((row) => row.classification.apply_allowed);
  const changed = [];
  const skipped = [];
  await pool.query('BEGIN');
  try {
    for (const row of candidates) {
      const resolution = {
        action: row.classification.action,
        source_raw_id: 'RAW-20260706-906',
        source_requirement_id: 'REQ-20260706-907',
        job_id: options.contentJobId,
        parse_run_id: options.parseRunId,
        classification_reason: row.classification.reason,
        cluster_id: row.classification.cluster_id || null,
        canonical_title: row.classification.canonical_title || null,
        score_progress_grading_untouched: true,
        raw_payload_hidden: true,
        cleanup_script: 'scripts/cleanup-job101-review-queue.mjs',
      };
      const update = await pool.query(
        `UPDATE bna_parse_review_queue
         SET status = $1,
             resolution_json = $2::jsonb,
             resolved_by = 'codex-job101-cleanup',
             resolved_at = NOW(),
             updated_at = NOW()
         WHERE id = $3
           AND parse_run_id = $4
           AND status IN ('open', 'reviewing')
         RETURNING id, status`,
        [row.classification.proposed_status, JSON.stringify(resolution), row.raw.id, options.parseRunId]
      );
      if (!update.rows.length) {
        skipped.push({ review_id: row.raw.id, reason: 'not_open_or_not_found' });
        continue;
      }
      if (row.classification.action === 'ignore_parser_artifact' && row.raw.parse_item_id) {
        await pool.query(
          `UPDATE bna_intake_parse_items
           SET status = 'ignored',
               updated_at = NOW()
           WHERE id = $1
             AND parse_run_id = $2
             AND status IN ('parsed', 'needs_review')`,
          [row.raw.parse_item_id, options.parseRunId]
        );
      }
      changed.push({
        review_id: Number(row.raw.id),
        status: row.classification.proposed_status,
        action: row.classification.action,
        cluster_id: row.classification.cluster_id || null,
      });
    }
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
  return { mutation_performed: changed.length > 0, changed, skipped };
}

function summarizeRows(classifiedRows) {
  const byAction = {};
  const byProposedStatus = {};
  for (const row of classifiedRows) {
    byAction[row.classification.action] = (byAction[row.classification.action] || 0) + 1;
    byProposedStatus[row.classification.proposed_status] = (byProposedStatus[row.classification.proposed_status] || 0) + 1;
  }
  return { by_action: byAction, by_proposed_status: byProposedStatus };
}

function writeReport(reportPath, report) {
  const fullPath = path.resolve(repoRoot, reportPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(report, null, 2)}\n`);
  return path.relative(repoRoot, fullPath).replace(/\\/g, '/');
}

function printHuman(report) {
  console.log(`Job 101 review cleanup: ${report.ok ? 'ok' : 'blocked'}`);
  console.log(`Mode: ${report.mode}`);
  console.log(`Target source: ${report.database.selected_source || 'none'}`);
  console.log(`Parse run: ${report.parse_run?.id || 'missing'}`);
  console.log(`Rows reviewed: ${report.summary.rows_reviewed}`);
  console.log(`Safe apply candidates: ${report.summary.safe_apply_candidates}`);
  console.log(`Mutation performed: ${report.mutation_performed ? 'yes' : 'no'}`);
  for (const blocker of report.blockers || []) console.log(`Blocked: ${blocker}`);
  if (report.report_path) console.log(`Report: ${report.report_path}`);
}

async function main() {
  const options = parseArgs();
  if (options.help) {
    console.log(usage());
    return;
  }
  const { candidates, selected } = databaseCandidates(options);
  const report = {
    ok: false,
    mode: options.apply ? 'apply' : 'dry_run',
    generated_at: new Date().toISOString(),
    raw_id: 'RAW-20260706-906',
    requirements: ['REQ-20260706-907', 'REQ-20260706-908'],
    content_job_id: options.contentJobId,
    parse_run_id: options.parseRunId,
    mutation_performed: false,
    no_raw_payloads: true,
    confirmation_required_for_apply: CONFIRM_PHRASE,
    database: {
      selected_source: selected?.label || '',
      selected_redacted: selected?.redacted || null,
      candidates: candidates.map(({ label, present, usable, redacted }) => ({ label, present, usable, redacted })),
      note: 'Job 101 parser/review queue lives in the active app database. One Time database aliases are audited here for confusion, but they are not selected unless no active app DATABASE_URL is available.',
    },
    blockers: [],
  };

  if (!selected?.value) {
    report.blockers.push('DATABASE_URL or .secrets/railway-database-url.txt is required.');
    if (options.writeReport) report.report_path = writeReport(options.reportPath, report);
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else printHuman(report);
    process.exitCode = 2;
    return;
  }

  const pool = new Pool({
    connectionString: selected.value,
    ssl: /localhost|127\.0\.0\.1/i.test(selected.value) ? false : { rejectUnauthorized: false },
  });
  try {
    const before = await queryReadback(pool, options);
    const classifiedRows = before.reviews.map((raw) => ({ raw, classification: classifyRow(raw) }));
    const applyResult = await applyCleanup(pool, classifiedRows, options);
    if (applyResult.blocker) report.blockers.push(applyResult.blocker);
    const after = options.apply ? await queryReadback(pool, { ...options, status: 'all' }) : null;
    const safeApplyCandidates = classifiedRows.filter((row) => row.classification.apply_allowed).length;
    report.ok = !report.blockers.length;
    report.database.readback = before.database;
    report.parse_run = before.parseRun
      ? {
        id: before.parseRun.id,
        source_type: before.parseRun.source_type,
        source_id: before.parseRun.source_id,
        source_table: before.parseRun.source_table,
        parser_version: before.parseRun.parser_version,
        dry_run: before.parseRun.dry_run,
        status: before.parseRun.status,
        metadata_keys: payloadKeys(before.parseRun.metadata),
        created_at: before.parseRun.created_at,
        updated_at: before.parseRun.updated_at,
      }
      : null;
    if (!before.parseRun) report.blockers.push(`parse_run_id ${options.parseRunId} was not found in the selected database.`);
    report.before = {
      status_counts: before.statusCounts,
      review_type_counts: before.reviewTypeCounts,
    };
    if (after) {
      report.after = {
        status_counts: after.statusCounts,
        review_type_counts: after.reviewTypeCounts,
      };
    }
    report.summary = {
      rows_reviewed: classifiedRows.length,
      safe_apply_candidates: safeApplyCandidates,
      ...summarizeRows(classifiedRows),
    };
    report.safe_apply_rows = classifiedRows
      .filter((row) => row.classification.apply_allowed)
      .map((row) => safeReviewRow(row.raw, row.classification));
    report.kept_open_sample = classifiedRows
      .filter((row) => !row.classification.apply_allowed)
      .slice(0, 25)
      .map((row) => safeReviewRow(row.raw, row.classification));
    report.apply_result = applyResult;
    report.mutation_performed = Boolean(applyResult.mutation_performed);
    if (options.writeReport || options.apply) report.report_path = writeReport(options.reportPath, report);
  } finally {
    await pool.end();
  }

  if (options.json) console.log(JSON.stringify(report, null, 2));
  else printHuman(report);
  if (!report.ok) process.exitCode = 2;
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    mode: 'error',
    mutation_performed: false,
    no_raw_payloads: true,
    error: error.message,
  }, null, 2));
  process.exitCode = 1;
});
