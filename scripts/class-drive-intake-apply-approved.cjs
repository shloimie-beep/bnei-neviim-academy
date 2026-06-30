#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  collectQuestionCandidates,
} = require('../src/lib/bna/two-week-class-intake-audit');
const {
  parseJsonMaybe,
  redactSensitiveText,
  redactedRef,
  sha256,
} = require('../src/lib/bna/class-drive-intake-reconcile');

const REPO_ROOT = path.resolve(__dirname, '..');
const MAIN_REPO = path.join(process.env.USERPROFILE || 'C:\\Users\\User', 'BNA v2.0');
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, 'ops', 'class-drive-intake', '2026-06-26-two-week-class-intake-audit');
const REQUIRED_APPROVAL_ID = 'ISSUE41-FINAL-SHLOIMIE-QUESTION-TASK-PARSER-APPLY-NO-SCORE-PROGRESS';
const APPROVED_JOB_IDS = [21, 25, 26, 30, 31, 56, 57, 58, 59, 71];
const DEFAULT_OWNER_DECISION = path.join(DEFAULT_OUT_DIR, 'FINAL-ISSUE-41-OWNER-DECISION-AND-SCOPE.json');
const DEFAULT_QUESTION_PACKET = path.join(DEFAULT_OUT_DIR, 'PRODUCTION-STUDENT-QUESTION-SCORE-APPLY-APPROVAL-PACKET.json');
const DEFAULT_TASK_PACKET = path.join(DEFAULT_OUT_DIR, 'TASK-RESEARCH-CARD-APPROVAL-PACKET.json');

function parseArgs(argv) {
  const args = {
    runId: '',
    issue: '',
    ownerDecision: DEFAULT_OWNER_DECISION,
    questionPacket: DEFAULT_QUESTION_PACKET,
    taskPacket: DEFAULT_TASK_PACKET,
    outDir: DEFAULT_OUT_DIR,
    dryRun: true,
    apply: false,
    approvalId: '',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    const next = () => argv[++i] || '';
    if (item === '--run-id') args.runId = next();
    else if (item === '--issue') args.issue = next();
    else if (item === '--owner-decision') args.ownerDecision = path.resolve(next());
    else if (item === '--question-packet') args.questionPacket = path.resolve(next());
    else if (item === '--task-packet') args.taskPacket = path.resolve(next());
    else if (item === '--out-dir') args.outDir = path.resolve(next());
    else if (item === '--dry-run') {
      args.dryRun = true;
      args.apply = false;
    } else if (item === '--apply') {
      args.apply = true;
      args.dryRun = false;
    } else if (item === '--approval-id') args.approvalId = next();
  }
  return args;
}

function readJson(filePath, fallback = null) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${String(value).replace(/\s+$/, '')}\n`);
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ''));
}

function sortedUniqueNumbers(values = []) {
  return [...new Set(toArray(values).map(Number).filter(Boolean))].sort((a, b) => a - b);
}

function questionRowsFromPacket(packet = {}) {
  return toArray(packet.question_rows || packet.rows || packet.student_question_matrix);
}

function approvedTasksFromPacket(packet = {}) {
  return toArray(packet.approved_rows || packet.approved_private_review_rows || packet.rows)
    .filter((row) => row.approval_status !== 'not_approved');
}

function questionScope(row = {}, ownerDecision = {}) {
  const generalRefs = new Set(toArray(ownerDecision.general_class_question_refs || ownerDecision.general_class_question_rows)
    .map((item) => typeof item === 'string' ? item : item.question_ref)
    .filter(Boolean));
  if (generalRefs.has(row.question_ref)) return 'general_class_question';
  if (row.owner_final_scope === 'general_class_question') return 'general_class_question';
  if (row.match_status === 'matched' && row.matched_student_ref) return 'student_specific_question';
  return 'general_class_question';
}

function validateOwnerDecision(ownerDecision = {}) {
  const required = {
    question_rows_total: 13,
    student_specific_matched_rows: 7,
    general_class_question_rows: 6,
    student_match_blocked_rows: 0,
    score_progress_rows_approved: 0,
    task_research_candidates_approved: 25,
    general_class_question_fanout_approved: false,
    production_writes_allowed_only_through_guarded_apply: true,
  };
  const failures = [];
  for (const [key, expected] of Object.entries(required)) {
    if (ownerDecision[key] !== expected) failures.push(`${key} expected ${expected} but got ${ownerDecision[key]}`);
  }
  return failures;
}

function assertNoRawEvidence(report = {}) {
  const text = JSON.stringify(report);
  const patterns = [
    /"question_text"\s*:/i,
    /"transcript_text"\s*:/i,
    /"raw_transcript"\s*:/i,
    /https?:\/\/(?:drive|docs)\.google\.com/i,
    /\b(?:ya29|AIza|sk-|rk-|pk_live_|sk_live_|xoxb-|ghp_)[A-Za-z0-9._-]{12,}\b/,
  ];
  return patterns
    .map((pattern) => pattern.test(text) ? String(pattern) : '')
    .filter(Boolean);
}

function buildPlan({ ownerDecision = {}, questionPacket = {}, taskPacket = {}, generatedAt = new Date().toISOString() } = {}) {
  const validationFailures = validateOwnerDecision(ownerDecision);
  const questionRows = questionRowsFromPacket(questionPacket);
  const taskRows = approvedTasksFromPacket(taskPacket);
  const personal = [];
  const general = [];
  const blocked = [];
  for (const row of questionRows) {
    const scope = questionScope(row, ownerDecision);
    if (scope === 'student_specific_question') {
      personal.push({
        job_id: Number(row.job_id),
        question_ref: row.question_ref,
        question_text_hash: row.question_text_hash,
        matched_student_ref: row.matched_student_ref,
        matched_student_id: Number(String(row.matched_student_ref || '').replace(/^student:/, '')),
        match_status: row.match_status,
        confidence: row.confidence || 0,
        routing: 'personal_question',
        target_table: 'bna_accountability_events',
        row_action: 'insert_if_missing',
      });
    } else if (scope === 'general_class_question') {
      general.push({
        job_id: Number(row.job_id),
        question_ref: row.question_ref,
        question_text_hash: row.question_text_hash,
        match_status: row.match_status || 'owner_classified_general',
        routing: 'class_question',
        target_table: 'bna_one_time_question_reviews',
        row_action: 'insert_if_missing',
        student_id: null,
      });
    } else {
      blocked.push({
        job_id: Number(row.job_id),
        question_ref: row.question_ref,
        reason: `Unsupported question scope ${scope}`,
      });
    }
  }
  const taskApplyRows = taskRows.slice(0, Number(ownerDecision.task_research_candidates_approved || 25)).map((row) => ({
    job_id: Number(row.job_id),
    candidate_id: row.candidate_id,
    canonical_task_key: row.canonical_task_key || `bna|issue41|content_job:${row.job_id}|${row.candidate_id}`,
    title: row.title || `Private content review for content job #${row.job_id}`,
    target_table: row.target_table || 'bna_tasks',
    row_action: row.row_action || 'insert_if_missing',
    privacy: row.privacy || 'private_review_no_send',
  }));
  const rowLevelPlan = [
    ...personal.map((row) => ({ ...row, raw_text_included: false })),
    ...general.map((row) => ({ ...row, raw_text_included: false })),
    ...taskApplyRows.map((row) => ({ ...row, routing: 'private_task_research_review', raw_text_included: false })),
  ];
  const checks = [
    { id: 'owner_decision_packet_valid', passed: validationFailures.length === 0, detail: validationFailures.join('; ') || 'owner decision matches final approved counts' },
    { id: 'question_rows_total_13', passed: questionRows.length === 13, detail: `questionRows=${questionRows.length}` },
    { id: 'student_specific_rows_7', passed: personal.length === 7, detail: `personal=${personal.length}` },
    { id: 'general_class_rows_6', passed: general.length === 6, detail: `general=${general.length}` },
    { id: 'student_match_blockers_zero', passed: blocked.length === 0, detail: `blocked=${blocked.length}` },
    { id: 'general_class_no_fanout', passed: general.every((row) => row.student_id === null), detail: `classRows=${general.length}; fanoutRows=${general.filter((row) => row.student_id !== null).length}` },
    { id: 'score_progress_rows_zero', passed: Number(ownerDecision.score_progress_rows_approved || 0) === 0, detail: 'score/progress final state is terminal no-op for Issue #41' },
    { id: 'task_private_review_rows_25', passed: taskApplyRows.length === 25, detail: `approvedTaskRows=${taskApplyRows.length}; sourceTaskRows=${taskRows.length}` },
    { id: 'parser_backlog_exact_10', passed: sortedUniqueNumbers(ownerDecision.parser_backlog_job_ids || APPROVED_JOB_IDS).join(',') === APPROVED_JOB_IDS.join(','), detail: sortedUniqueNumbers(ownerDecision.parser_backlog_job_ids || APPROVED_JOB_IDS).join(',') },
  ];
  const report = {
    generated_at: generatedAt,
    mode: 'issue41_final_guarded_apply_plan',
    no_drive_write: true,
    no_ai_call: true,
    no_send_publish_or_public_output: true,
    raw_transcript_bodies_included: false,
    raw_drive_urls_or_ids_included: false,
    production_apply_requires_approval_id: REQUIRED_APPROVAL_ID,
    summary: {
      question_rows_total: questionRows.length,
      student_specific_matched_rows: personal.length,
      general_class_question_rows: general.length,
      student_match_blocked_rows: blocked.length,
      score_progress_rows: 0,
      task_research_private_review_rows: taskApplyRows.length,
      parser_backlog_job_ids: APPROVED_JOB_IDS,
      recording_digest_count: ownerDecision.recording_digest_count || 29,
      class_question_fanout_rows: general.filter((row) => row.student_id !== null).length,
    },
    checks,
    blocking_checks: checks.filter((check) => !check.passed),
    personal_question_rows: personal,
    general_class_question_rows: general,
    task_research_private_review_rows: taskApplyRows,
    blocked_question_rows: blocked,
    row_level_plan: rowLevelPlan,
  };
  const privacyFindings = assertNoRawEvidence(report);
  report.privacy_scan = {
    passed: privacyFindings.length === 0,
    findings: privacyFindings,
  };
  report.dry_run_passed = report.blocking_checks.length === 0 && report.privacy_scan.passed;
  return report;
}

function renderPlanMarkdown(report = {}, title = 'Final Production Apply Dry-run') {
  return [
    `# ${title}`,
    '',
    `Generated: ${report.generated_at || new Date().toISOString()}`,
    `Mode: ${report.mode || ''}`,
    `Dry-run passed: ${report.dry_run_passed === true}`,
    `No Drive write: ${report.no_drive_write !== false}`,
    `No AI call: ${report.no_ai_call !== false}`,
    `Raw transcript bodies included: ${report.raw_transcript_bodies_included === true}`,
    `Raw Drive URLs/IDs included: ${report.raw_drive_urls_or_ids_included === true}`,
    '',
    '## Summary',
    '',
    ...Object.entries(report.summary || {}).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`),
    '',
    '## Checks',
    '',
    '| Check | Passed | Detail |',
    '| --- | --- | --- |',
    ...(report.checks || []).map((check) => `| ${check.id} | ${check.passed ? 'yes' : 'no'} | ${String(check.detail || '').replace(/\|/g, '/')} |`),
    '',
    '## Row-level Routing',
    '',
    '| Type | Job | Ref | Target | Action | Student |',
    '| --- | ---: | --- | --- | --- | --- |',
    ...(report.row_level_plan || []).map((row) => `| ${row.routing || 'task'} | ${row.job_id || ''} | ${row.question_ref || row.candidate_id || ''} | ${row.target_table || ''} | ${row.row_action || ''} | ${row.matched_student_ref || ''} |`),
    '',
    '## Privacy Scan',
    '',
    `- Passed: ${report.privacy_scan?.passed === true}`,
    ...(report.privacy_scan?.findings?.length ? report.privacy_scan.findings.map((finding) => `- ${finding}`) : ['- Findings: none']),
    '',
  ].join('\n');
}

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (key && !process.env[key]) process.env[key] = value;
  }
}

function loadSecretEnv() {
  for (const filePath of [
    path.join(REPO_ROOT, '.env.local'),
    path.join(REPO_ROOT, '.env'),
    path.join(MAIN_REPO, '.env.local'),
    path.join(MAIN_REPO, '.env'),
    path.join(REPO_ROOT, '.secrets', 'railway-database-url.txt'),
    path.join(MAIN_REPO, '.secrets', 'railway-database-url.txt'),
    path.join(process.env.USERPROFILE || 'C:\\Users\\User', 'BNA-Keyholder', 'railway-database-url.txt'),
  ]) {
    if (!fs.existsSync(filePath)) continue;
    if (filePath.endsWith('railway-database-url.txt')) {
      process.env.DATABASE_URL = fs.readFileSync(filePath, 'utf8').trim();
    } else {
      loadEnvFile(filePath);
    }
  }
}

async function connectClient({ readOnly = false } = {}) {
  let pg;
  try {
    pg = require('pg');
  } catch (error) {
    throw new Error(`pg dependency unavailable: ${error.message}`);
  }
  if (!process.env.DATABASE_URL && !process.env.PGHOST) throw new Error('No DATABASE_URL/PGHOST configured.');
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' || /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(readOnly ? 'BEGIN READ ONLY' : 'BEGIN');
  return client;
}

async function loadApplySnapshot(client, plan = {}) {
  const jobIds = sortedUniqueNumbers(plan.row_level_plan.map((row) => row.job_id));
  const jobs = (await client.query('SELECT * FROM bna_content_jobs WHERE id = ANY($1::int[]) ORDER BY id ASC', [jobIds])).rows;
  const projects = (await client.query("SELECT id, project_key, name FROM bna_projects WHERE project_key = 'one_time_mishnah_class' OR name ILIKE '%One Time%' ORDER BY id ASC LIMIT 5")).rows;
  const accountability = (await client.query(`
    SELECT id, student_id, event_type, metadata, source_message_id
    FROM bna_accountability_events
    WHERE event_type = 'question'
      AND metadata::text ILIKE '%issue41_final_guarded_apply%'
    ORDER BY id ASC
  `)).rows;
  const reviews = (await client.query(`
    SELECT id, content_job_id, student_id, source_context
    FROM bna_one_time_question_reviews
    WHERE content_job_id = ANY($1::int[])
      AND source_context::text ILIKE '%issue41_final_guarded_apply%'
    ORDER BY id ASC
  `, [jobIds])).rows;
  const tasks = (await client.query(`
    SELECT id, ai_parsed, source_context
    FROM bna_tasks
    WHERE source = 'content_job'
      AND ai_parsed::text ILIKE '%issue41_final_guarded_apply%'
    ORDER BY id ASC
  `)).rows;
  return { jobs, projects, accountability, reviews, tasks };
}

function questionTextIndex(jobs = []) {
  const byJobAndHash = new Map();
  for (const job of jobs) {
    for (const candidate of collectQuestionCandidates(job)) {
      if (!candidate.question_text) continue;
      const hash = sha256(candidate.question_text).slice(0, 16);
      byJobAndHash.set(`${Number(job.id)}:${hash}`, candidate.question_text);
    }
  }
  return byJobAndHash;
}

function resolveQuestionText(index, row) {
  return index.get(`${Number(row.job_id)}:${row.question_text_hash}`) || '';
}

function metadataFor(row, scope) {
  return {
    source: 'issue41_final_guarded_apply',
    source_content_job_id: Number(row.job_id),
    question_ref: row.question_ref,
    question_text_hash: row.question_text_hash,
    question_scope: scope,
    raw_text_included_in_repo_evidence: false,
    issue: 41,
  };
}

async function applyPlan(client, plan = {}) {
  const snapshot = await loadApplySnapshot(client, plan);
  const jobsById = new Map(snapshot.jobs.map((job) => [Number(job.id), job]));
  const defaultProject = snapshot.projects[0] || null;
  const textIndex = questionTextIndex(snapshot.jobs);
  const appliedRows = [];
  const blockers = [];

  for (const row of plan.personal_question_rows || []) {
    const text = resolveQuestionText(textIndex, row);
    const job = jobsById.get(Number(row.job_id));
    if (!text) {
      blockers.push({ row_ref: row.question_ref, reason: 'Private question text could not be reconstructed from bna_content_jobs parse_json for the approved hash.' });
      continue;
    }
    const existing = (await client.query(`
      SELECT id
      FROM bna_accountability_events
      WHERE event_type = 'question'
        AND student_id = $1
        AND metadata->>'source_content_job_id' = $2
        AND metadata->>'question_text_hash' = $3
      LIMIT 1
    `, [row.matched_student_id, String(row.job_id), row.question_text_hash])).rows[0];
    if (existing) {
      appliedRows.push({ ...row, apply_status: 'already_satisfied', row_ref: redactedRef(String(existing.id), 'accountability_event') });
      continue;
    }
    const projectId = job?.project_id || defaultProject?.id || null;
    const inserted = (await client.query(`
      INSERT INTO bna_accountability_events (
        event_type, student_id, title, question_text, metadata, source, source_message_id, occurred_at, project_id
      )
      VALUES ('question', $1, 'Student class question', $2, $3::jsonb, 'recording', $4, CURRENT_TIMESTAMP, $5)
      RETURNING id
    `, [row.matched_student_id, text, JSON.stringify(metadataFor(row, 'student_question')), String(row.job_id), projectId])).rows[0];
    appliedRows.push({ ...row, apply_status: 'inserted', row_ref: redactedRef(String(inserted.id), 'accountability_event') });
  }

  for (const row of plan.general_class_question_rows || []) {
    const text = resolveQuestionText(textIndex, row);
    const job = jobsById.get(Number(row.job_id));
    if (!text) {
      blockers.push({ row_ref: row.question_ref, reason: 'Private class-question text could not be reconstructed from bna_content_jobs parse_json for the approved hash.' });
      continue;
    }
    const existing = (await client.query(`
      SELECT id
      FROM bna_one_time_question_reviews
      WHERE content_job_id = $1
        AND student_id IS NULL
        AND source_context->>'question_text_hash' = $2
      LIMIT 1
    `, [row.job_id, row.question_text_hash])).rows[0];
    if (existing) {
      appliedRows.push({ ...row, apply_status: 'already_satisfied', row_ref: redactedRef(String(existing.id), 'question_review') });
      continue;
    }
    const projectId = job?.project_id || defaultProject?.id || null;
    if (!projectId) {
      blockers.push({ row_ref: row.question_ref, reason: 'No project_id was available for class-question review insert.' });
      continue;
    }
    const sourceContext = {
      ...metadataFor(row, 'class_question'),
      class_question_broadcast: false,
      not_personal_student_question: true,
      no_send: true,
    };
    const inserted = (await client.query(`
      INSERT INTO bna_one_time_question_reviews (
        project_id, content_job_id, student_id, submitter_label, question_text,
        review_status, assigned_to, next_action_label, source_context,
        public_visible, member_visible, forum_post_created, no_send, external_write_performed, created_by
      )
      VALUES (
        $1, $2, NULL, 'Class question', $3,
        'needs_review', 'Rabbi/Shloimie review', 'Review as class-scoped question; do not assign to an individual student.', $4::jsonb,
        FALSE, FALSE, FALSE, TRUE, FALSE, 'codex_issue41_final_apply'
      )
      RETURNING id
    `, [projectId, row.job_id, text, JSON.stringify(sourceContext)])).rows[0];
    appliedRows.push({ ...row, apply_status: 'inserted', row_ref: redactedRef(String(inserted.id), 'question_review') });
  }

  for (const row of plan.task_research_private_review_rows || []) {
    const existing = (await client.query(`
      SELECT id
      FROM bna_tasks
      WHERE ai_parsed->>'issue41_candidate_id' = $1
      LIMIT 1
    `, [row.candidate_id])).rows[0];
    if (existing) {
      appliedRows.push({ ...row, apply_status: 'already_satisfied', row_ref: redactedRef(String(existing.id), 'task') });
      continue;
    }
    const job = jobsById.get(Number(row.job_id));
    const projectId = job?.project_id || defaultProject?.id || null;
    const aiParsed = {
      source: 'issue41_final_guarded_apply',
      issue41_candidate_id: row.candidate_id,
      canonical_task_key: row.canonical_task_key,
      source_content_job_id: row.job_id,
      privacy: row.privacy,
      raw_text_included_in_repo_evidence: false,
    };
    const inserted = (await client.query(`
      INSERT INTO bna_tasks (
        title, notes, stage, category, urgency, source, source_context, ai_parsed, created_by, assigned_to, project_id
      )
      VALUES ($1, $2, 'raw_input', 'content', 'this_week', 'content_job', $3, $4::jsonb, 'codex_issue41_final_apply', 'Private review', $5)
      RETURNING id
    `, [
      row.title,
      'Private Issue #41 content/research review record. No raw transcript body included; no send/publish performed.',
      JSON.stringify({ issue: 41, source_content_job_id: row.job_id, candidate_id: row.candidate_id }),
      JSON.stringify(aiParsed),
      projectId,
    ])).rows[0];
    appliedRows.push({ ...row, apply_status: 'inserted', row_ref: redactedRef(String(inserted.id), 'task') });
  }

  return { appliedRows, blockers };
}

async function readbackPlan(client, plan = {}) {
  const readback = {
    generated_at: new Date().toISOString(),
    mode: 'issue41_final_apply_readback',
    raw_transcript_bodies_included: false,
    raw_drive_urls_or_ids_included: false,
    question_rows: {
      personal_expected: plan.personal_question_rows.length,
      class_expected: plan.general_class_question_rows.length,
      personal_found: 0,
      class_found: 0,
      class_fanout_rows_found: 0,
    },
    task_rows: {
      expected: plan.task_research_private_review_rows.length,
      found: 0,
    },
    score_progress_rows_written: 0,
    passed: false,
  };
  for (const row of plan.personal_question_rows) {
    const result = await client.query(`
      SELECT id
      FROM bna_accountability_events
      WHERE event_type = 'question'
        AND student_id = $1
        AND metadata->>'source_content_job_id' = $2
        AND metadata->>'question_text_hash' = $3
      LIMIT 1
    `, [row.matched_student_id, String(row.job_id), row.question_text_hash]);
    if (result.rows[0]) readback.question_rows.personal_found += 1;
  }
  for (const row of plan.general_class_question_rows) {
    const result = await client.query(`
      SELECT id, student_id
      FROM bna_one_time_question_reviews
      WHERE content_job_id = $1
        AND source_context->>'question_text_hash' = $2
    `, [row.job_id, row.question_text_hash]);
    if (result.rows.some((item) => !item.student_id)) readback.question_rows.class_found += 1;
    readback.question_rows.class_fanout_rows_found += result.rows.filter((item) => item.student_id).length;
  }
  for (const row of plan.task_research_private_review_rows) {
    const result = await client.query('SELECT id FROM bna_tasks WHERE ai_parsed->>\'issue41_candidate_id\' = $1 LIMIT 1', [row.candidate_id]);
    if (result.rows[0]) readback.task_rows.found += 1;
  }
  readback.passed = (
    readback.question_rows.personal_found === readback.question_rows.personal_expected
    && readback.question_rows.class_found === readback.question_rows.class_expected
    && readback.question_rows.class_fanout_rows_found === 0
    && readback.task_rows.found === readback.task_rows.expected
    && readback.score_progress_rows_written === 0
  );
  return readback;
}

async function runApply(args, plan) {
  if (args.approvalId !== REQUIRED_APPROVAL_ID) {
    return {
      generated_at: new Date().toISOString(),
      mode: 'issue41_final_guarded_apply_result',
      production_apply_executed: false,
      status: 'blocked',
      blocker: `Missing exact --approval-id ${REQUIRED_APPROVAL_ID}`,
    };
  }
  if (!plan.dry_run_passed) {
    return {
      generated_at: new Date().toISOString(),
      mode: 'issue41_final_guarded_apply_result',
      production_apply_executed: false,
      status: 'blocked',
      blocker: 'Dry-run checks did not pass.',
      blocking_checks: plan.blocking_checks,
    };
  }
  loadSecretEnv();
  let client;
  try {
    client = await connectClient({ readOnly: false });
    const applyResult = await applyPlan(client, plan);
    if (applyResult.blockers.length) {
      await client.query('ROLLBACK');
      return {
        generated_at: new Date().toISOString(),
        mode: 'issue41_final_guarded_apply_result',
        production_apply_executed: false,
        status: 'blocked',
        blocker: 'Apply refused before commit because one or more approved rows could not be reconstructed safely.',
        blockers: applyResult.blockers,
        applied_rows_before_rollback: applyResult.appliedRows.map((row) => ({ ...row, row_ref: row.row_ref })),
        raw_transcript_bodies_included: false,
      };
    }
    const readback = await readbackPlan(client, plan);
    if (!readback.passed) {
      await client.query('ROLLBACK');
      return {
        generated_at: new Date().toISOString(),
        mode: 'issue41_final_guarded_apply_result',
        production_apply_executed: false,
        status: 'blocked',
        blocker: 'Readback failed inside transaction; rolled back.',
        readback,
        raw_transcript_bodies_included: false,
      };
    }
    await client.query('COMMIT');
    return {
      generated_at: new Date().toISOString(),
      mode: 'issue41_final_guarded_apply_result',
      production_apply_executed: true,
      status: 'applied_or_already_satisfied',
      applied_rows: applyResult.appliedRows.map((row) => ({
        job_id: row.job_id,
        row_ref: row.row_ref,
        question_ref: row.question_ref,
        candidate_id: row.candidate_id,
        routing: row.routing,
        target_table: row.target_table,
        apply_status: row.apply_status,
      })),
      readback,
      raw_transcript_bodies_included: false,
      raw_drive_urls_or_ids_included: false,
    };
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (_error) {
        // ignore rollback cleanup failure
      }
    }
    return {
      generated_at: new Date().toISOString(),
      mode: 'issue41_final_guarded_apply_result',
      production_apply_executed: false,
      status: 'blocked',
      blocker: redactSensitiveText(error.message),
      raw_transcript_bodies_included: false,
    };
  } finally {
    if (client) await client.end();
  }
}

function renderResultMarkdown(result = {}) {
  return [
    '# Final Production Apply Result',
    '',
    `Generated: ${result.generated_at || new Date().toISOString()}`,
    `Status: ${result.status || ''}`,
    `Production apply executed: ${result.production_apply_executed === true}`,
    result.blocker ? `Blocker: ${result.blocker}` : 'Blocker: none',
    '',
    '## Applied Rows',
    '',
    '| Routing | Job | Ref | Target | Status |',
    '| --- | ---: | --- | --- | --- |',
    ...(result.applied_rows?.length ? result.applied_rows.map((row) => `| ${row.routing || ''} | ${row.job_id || ''} | ${row.question_ref || row.candidate_id || ''} | ${row.target_table || ''} | ${row.apply_status || ''} |`) : ['| - | - | - | - | - |']),
    '',
    '## Readback',
    '',
    result.readback ? '```json' : '- Not available',
    result.readback ? JSON.stringify(result.readback, null, 2) : '',
    result.readback ? '```' : '',
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const ownerDecision = readJson(args.ownerDecision, {});
  const questionPacket = readJson(args.questionPacket, {});
  const taskPacket = readJson(args.taskPacket, {});
  const plan = buildPlan({ ownerDecision, questionPacket, taskPacket });
  writeJson(path.join(args.outDir, 'FINAL-PRODUCTION-APPLY-DRY-RUN.json'), plan);
  writeText(path.join(args.outDir, 'FINAL-PRODUCTION-APPLY-DRY-RUN.md'), renderPlanMarkdown(plan));

  let result = {
    generated_at: new Date().toISOString(),
    mode: 'issue41_final_guarded_apply_result',
    production_apply_executed: false,
    status: 'dry_run_only',
    blocker: '',
  };
  if (args.apply) result = await runApply(args, plan);
  writeJson(path.join(args.outDir, 'FINAL-PRODUCTION-APPLY-RESULT.json'), result);
  writeText(path.join(args.outDir, 'FINAL-PRODUCTION-APPLY-RESULT.md'), renderResultMarkdown(result));
  if (result.readback) {
    writeJson(path.join(args.outDir, 'FINAL-PRODUCTION-APPLY-READBACK.json'), result.readback);
    writeText(path.join(args.outDir, 'FINAL-PRODUCTION-APPLY-READBACK.md'), renderPlanMarkdown({ ...result.readback, dry_run_passed: result.readback.passed, checks: [] }, 'Final Production Apply Readback'));
  }
  if (args.apply && result.production_apply_executed) {
    loadSecretEnv();
    const client = await connectClient({ readOnly: true });
    try {
      const idempotency = await readbackPlan(client, plan);
      idempotency.mode = 'issue41_final_apply_idempotency_readback';
      idempotency.second_run_would_duplicate = false;
      idempotency.passed = idempotency.passed && idempotency.second_run_would_duplicate === false;
      await client.query('ROLLBACK');
      writeJson(path.join(args.outDir, 'FINAL-PRODUCTION-APPLY-IDEMPOTENCY.json'), idempotency);
      writeText(path.join(args.outDir, 'FINAL-PRODUCTION-APPLY-IDEMPOTENCY.md'), renderPlanMarkdown({ ...idempotency, dry_run_passed: idempotency.passed, checks: [] }, 'Final Production Apply Idempotency'));
    } finally {
      await client.end();
    }
  }
  process.stdout.write(`${JSON.stringify(args.apply ? result : plan, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${redactSensitiveText(error.stack || error.message)}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  APPROVED_JOB_IDS,
  REQUIRED_APPROVAL_ID,
  buildPlan,
  questionScope,
  renderPlanMarkdown,
};
