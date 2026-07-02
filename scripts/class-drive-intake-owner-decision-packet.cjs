#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_AUDIT_DIR = path.join('ops', 'class-drive-intake', '2026-06-26-two-week-class-intake-audit');
const DEFAULT_RAW_ID = 'RAW-20260629-001';
const DEFAULT_DECISION_ID = 'DEC-20260626-101';
const DEFAULT_GENERATED_AT = '2026-06-29T00:00:00+03:00';

const DEFAULT_GENERAL_CLASS_QUESTION_REFS = [
  'question:c516d14ee4e5d49f',
  'question:1a8cf5034c4c839f',
  'question:51aa618b95a7d29d',
  'question:2158d47f6c0c2923',
  'question:8f9c41ec6da4ca8c',
  'question:e1d44fb96cef6915',
];

function buildConfig(options = {}) {
  return {
    rawId: options.rawId || DEFAULT_RAW_ID,
    decisionId: options.decisionId || DEFAULT_DECISION_ID,
    generatedAt: options.generatedAt || DEFAULT_GENERATED_AT,
    generalQuestionRefs: new Set(options.generalQuestionRefs || DEFAULT_GENERAL_CLASS_QUESTION_REFS),
  };
}

function parseArgs(argv) {
  const args = { auditDir: DEFAULT_AUDIT_DIR };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--out-dir' || arg === '--audit-dir') args.auditDir = argv[++index] || args.auditDir;
    else if (arg.startsWith('--out-dir=')) args.auditDir = arg.slice('--out-dir='.length);
    else if (arg.startsWith('--audit-dir=')) args.auditDir = arg.slice('--audit-dir='.length);
    else if (arg === '--apply') throw new Error('--apply is not supported by this evidence-only packet generator.');
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${String(text || '').replace(/\s+$/, '')}\n`);
}

function toArray(value) {
  return Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
}

function markdownTable(rows, columns) {
  return [
    `| ${columns.map((column) => column.label).join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${columns.map((column) => {
      const value = typeof column.value === 'function' ? column.value(row) : row[column.value];
      return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    }).join(' | ')} |`),
  ].join('\n');
}

function safeQuestionRow(row = {}) {
  return {
    job_id: row.job_id,
    question_ref: row.question_ref,
    question_text_hash: row.question_text_hash,
    current_match_status: row.current_match_status,
    proposed_match_status: row.proposed_match_status,
    matched_student_ref: row.matched_student_ref || null,
    confidence: Number(row.confidence || 0),
    source_kind: row.source_kind || '',
    resolved_by_this_pass: Boolean(row.resolved_by_this_pass),
    blocker: row.blocker || '',
    exact_human_decision_needed: row.exact_human_decision_needed || '',
    production_write_allowed: false,
    owner_decision: row.owner_decision || undefined,
    owner_decision_raw_id: row.owner_decision_raw_id || undefined,
    class_question_scope: row.class_question_scope || undefined,
  };
}

function assertExpectedGeneralRows(rows, generalQuestionRefs) {
  const counts = new Map();
  for (const row of rows) {
    if (!generalQuestionRefs.has(row.question_ref)) continue;
    counts.set(row.question_ref, (counts.get(row.question_ref) || 0) + 1);
  }

  const missing = [...generalQuestionRefs].filter((ref) => !counts.has(ref));
  const duplicates = [...counts.entries()].filter(([, count]) => count !== 1);
  if (missing.length || duplicates.length) {
    const details = [
      missing.length ? `missing refs: ${missing.join(', ')}` : '',
      duplicates.length ? `duplicate refs: ${duplicates.map(([ref, count]) => `${ref} x${count}`).join(', ')}` : '',
    ].filter(Boolean).join('; ');
    throw new Error(`Owner decision packet cannot be generated safely: ${details}`);
  }
}

function questionScope(row, generalQuestionRefs) {
  if (row.class_question_scope) return row.class_question_scope;
  if (generalQuestionRefs.has(row.question_ref) || row.proposed_match_status === 'approved_general_class_question') return 'general_class';
  if (row.matched_student_ref) return 'student_specific';
  return 'unresolved';
}

function updateStudentQuestionReview(review, options = {}) {
  const config = buildConfig(options);
  const safeRows = toArray(review.rows).map(safeQuestionRow);
  assertExpectedGeneralRows(safeRows, config.generalQuestionRefs);

  const rows = safeRows.map((row) => {
    if (!config.generalQuestionRefs.has(row.question_ref)) return row;
    return {
      ...row,
      proposed_match_status: 'approved_general_class_question',
      matched_student_ref: null,
      confidence: 100,
      resolved_by_this_pass: true,
      blocker: '',
      exact_human_decision_needed: '',
      production_write_allowed: false,
      owner_decision: 'Do not map to a specific student; file as a general class question.',
      owner_decision_raw_id: config.rawId,
      class_question_scope: 'general_class',
    };
  });

  return {
    generated_at: config.generatedAt,
    mode: 'student_question_match_review_with_owner_general_class_decision',
    production_writes_performed: false,
    rows,
    summary: {
      total_rows: rows.length,
      matched_student_specific_rows: rows.filter((row) => questionScope(row, config.generalQuestionRefs) === 'student_specific').length,
      approved_general_class_question_rows: rows.filter((row) => questionScope(row, config.generalQuestionRefs) === 'general_class').length,
      unresolved_question_rows: rows.filter((row) => questionScope(row, config.generalQuestionRefs) === 'unresolved').length,
      blocked_needing_human_review: rows.filter((row) => row.blocker).length,
      resolved_by_owner_decision: rows.filter((row) => row.resolved_by_this_pass).length,
      production_writes_performed: false,
    },
    owner_decision_raw_id: config.rawId,
    owner_decision_applied_to_repo_evidence: true,
  };
}

function buildOwnerDecisionPacket(updatedReview, options = {}) {
  const config = buildConfig(options);
  const rows = updatedReview.rows
    .filter((row) => config.generalQuestionRefs.has(row.question_ref))
    .map((row) => ({
      job_id: row.job_id,
      question_ref: row.question_ref,
      question_text_hash: row.question_text_hash,
      before: {
        match_status: row.current_match_status,
        matched_student_ref: null,
        review_status: 'needs_student_match_review',
        newsletter_ready: 'blocked_unmatched_student',
      },
      after: {
        match_status: 'general_class_question',
        matched_student_ref: null,
        review_status: 'approved_general_class_question',
        newsletter_ready: 'candidate_after_private_content_review',
      },
      privacy: 'repo evidence uses refs and hashes only; no raw question text included',
      operator_decision: 'Question is class-level, not student-specific.',
    }));

  assertExpectedGeneralRows(rows, config.generalQuestionRefs);

  return {
    generated_at: config.generatedAt,
    raw_id: config.rawId,
    decision_id: config.decisionId,
    mode: 'owner_decision_general_class_questions',
    production_writes_performed: false,
    safe_repo_evidence_update: true,
    production_apply_safe_now: false,
    reason_production_apply_not_run: 'No existing guarded production apply command supports writing these class-level question decisions from sanitized refs only. The repo evidence is updated; production writes still need a dedicated exact apply command with readback.',
    exact_apply_command: null,
    resolved_question_count: rows.length,
    rows,
  };
}

function buildStudentQuestionScorePacket(updatedReview, scorePlan, options = {}) {
  const config = buildConfig(options);
  const questionRows = updatedReview.rows.map((row) => {
    const scope = questionScope(row, config.generalQuestionRefs);
    return {
      job_id: row.job_id,
      question_ref: row.question_ref,
      question_text_hash: row.question_text_hash,
      before_status: row.current_match_status,
      proposed_status: row.proposed_match_status,
      matched_student_ref: row.matched_student_ref || null,
      class_question_scope: scope,
      approved_by_raw_id: config.generalQuestionRefs.has(row.question_ref) ? config.rawId : null,
      production_write_ready: false,
      blocker: 'Production question writes require an existing guarded apply command and row-level readback; this packet does not include raw question text.',
    };
  });

  return {
    generated_at: config.generatedAt,
    raw_id: config.rawId,
    decision_id: config.decisionId,
    mode: 'production_student_question_score_apply_approval_packet',
    production_writes_performed: false,
    safe_to_apply: false,
    requires_owner_approval: true,
    exact_apply_command: null,
    question_row_count: questionRows.length,
    general_class_question_rows: questionRows.filter((row) => row.class_question_scope === 'general_class').length,
    student_specific_question_rows: questionRows.filter((row) => row.class_question_scope === 'student_specific').length,
    unresolved_question_rows: questionRows.filter((row) => row.class_question_scope === 'unresolved').length,
    score_progress: {
      safe_to_apply: false,
      row_count: scorePlan.row_count || 0,
      rows: toArray(scorePlan.rows),
      blocked_rows: toArray(scorePlan.blocked_rows),
      reason: 'No safe score/progress row-level before/after rows exist in sanitized evidence.',
    },
    privacy_review: 'No raw transcript bodies or raw question text are included in this packet.',
    rollback_plan: 'No production writes performed. A future apply must snapshot before values, run in a transaction when possible, and verify readback before closeout.',
    question_rows: questionRows,
  };
}

function buildTaskResearchApprovalPacket(taskPlan, options = {}) {
  const config = buildConfig(options);
  const candidates = toArray(taskPlan.candidates).map((candidate) => {
    const isFaq = candidate.category === 'parent-facing FAQ candidate';
    const isParser = candidate.category === 'operations/support/parser repair';
    return {
      ...candidate,
      owner_approval_raw_id: config.rawId,
      owner_decision: 'Prepare approved Operations/review items from this plan.',
      production_write_ready: false,
      apply_readiness: isParser
        ? 'approved_for_guarded_operations_item_packet'
        : isFaq
          ? 'approved_as_general_class_question_review_card_after_private_content_review'
          : 'approved_for_content_review_packet_only',
      blocker: isParser
        ? 'No existing exact production apply command selected in this packet.'
        : 'Needs private content/Rabbi review before any parent-facing or source-sheet publication.',
    };
  });

  return {
    generated_at: config.generatedAt,
    raw_id: config.rawId,
    decision_id: config.decisionId,
    mode: 'task_research_card_approval_packet',
    production_writes_performed: false,
    safe_to_apply: false,
    exact_apply_command: null,
    reason_production_apply_not_run: 'The existing evidence contains sanitized candidate metadata, but no existing guarded production creation command with row-level readback was selected.',
    candidates,
    summary: {
      candidate_count: candidates.length,
      parser_repair_candidates: candidates.filter((row) => row.category === 'operations/support/parser repair').length,
      faq_or_class_question_candidates: candidates.filter((row) => row.category === 'parent-facing FAQ candidate').length,
      source_sheet_candidates: candidates.filter((row) => row.category === 'research/source-sheet candidate').length,
      production_task_or_card_rows_created: 0,
    },
  };
}

function buildOwnerDecisionArtifacts({ questionReview, scorePlan, taskPlan, options = {} }) {
  const updatedReview = updateStudentQuestionReview(questionReview, options);
  return {
    updatedReview,
    ownerDecision: buildOwnerDecisionPacket(updatedReview, options),
    studentQuestionScorePacket: buildStudentQuestionScorePacket(updatedReview, scorePlan, options),
    taskResearchPacket: buildTaskResearchApprovalPacket(taskPlan, options),
  };
}

function renderQuestionReviewMarkdown(review) {
  return [
    '# Student Question Match Review',
    '',
    `Generated: ${review.generated_at}`,
    `Mode: ${review.mode}`,
    `Owner decision raw ID: ${review.owner_decision_raw_id}`,
    `Production writes performed: ${review.production_writes_performed}`,
    '',
    '## Summary',
    '',
    '```json',
    JSON.stringify(review.summary, null, 2),
    '```',
    '',
    markdownTable(review.rows, [
      { label: 'Job', value: (row) => `#${row.job_id}` },
      { label: 'Question', value: 'question_ref' },
      { label: 'Current match', value: 'current_match_status' },
      { label: 'Proposed match', value: 'proposed_match_status' },
      { label: 'Student ref', value: 'matched_student_ref' },
      { label: 'Scope', value: (row) => row.class_question_scope || (row.matched_student_ref ? 'student_specific' : '') },
      { label: 'Resolved here', value: (row) => row.resolved_by_this_pass ? 'yes' : 'no' },
      { label: 'Decision needed', value: 'exact_human_decision_needed' },
    ]),
    '',
  ].join('\n');
}

function renderOwnerDecisionMarkdown(packet) {
  return [
    '# Owner Decision - General Class Questions',
    '',
    `Generated: ${packet.generated_at}`,
    `Raw ID: ${packet.raw_id}`,
    `Decision ID: ${packet.decision_id}`,
    `Production writes performed: ${packet.production_writes_performed}`,
    '',
    'Shloimie decided that questions which cannot be mapped to a specific student should be kept as general class questions.',
    '',
    `Resolved question rows: ${packet.resolved_question_count}`,
    '',
    '## Row-Level Before / After',
    '',
    markdownTable(packet.rows, [
      { label: 'Job', value: (row) => `#${row.job_id}` },
      { label: 'Question', value: 'question_ref' },
      { label: 'Before', value: (row) => row.before.match_status },
      { label: 'After', value: (row) => row.after.match_status },
      { label: 'Privacy', value: 'privacy' },
    ]),
    '',
    '## Production Apply Status',
    '',
    `Safe to apply now: ${packet.production_apply_safe_now}`,
    `Exact apply command: ${packet.exact_apply_command || 'none'}`,
    '',
    packet.reason_production_apply_not_run,
    '',
  ].join('\n');
}

function renderStudentQuestionScoreMarkdown(packet) {
  return [
    '# Production Student Question Score Apply Approval Packet',
    '',
    `Generated: ${packet.generated_at}`,
    `Raw ID: ${packet.raw_id}`,
    `Decision ID: ${packet.decision_id}`,
    `Safe to apply: ${packet.safe_to_apply}`,
    `Production writes performed: ${packet.production_writes_performed}`,
    `Exact apply command: ${packet.exact_apply_command || 'none'}`,
    '',
    '## Summary',
    '',
    `- Question rows: ${packet.question_row_count}`,
    `- General class question rows: ${packet.general_class_question_rows}`,
    `- Student-specific question rows: ${packet.student_specific_question_rows}`,
    `- Unresolved question rows: ${packet.unresolved_question_rows}`,
    `- Score/progress safe rows: ${packet.score_progress.row_count}`,
    '',
    '## Question Rows',
    '',
    markdownTable(packet.question_rows, [
      { label: 'Job', value: (row) => `#${row.job_id}` },
      { label: 'Question', value: 'question_ref' },
      { label: 'Before', value: 'before_status' },
      { label: 'Proposed', value: 'proposed_status' },
      { label: 'Scope', value: 'class_question_scope' },
      { label: 'Ready', value: (row) => row.production_write_ready ? 'yes' : 'no' },
      { label: 'Blocker', value: 'blocker' },
    ]),
    '',
    '## Score / Progress',
    '',
    'No safe score/progress rows exist from the sanitized evidence.',
    '',
    packet.rollback_plan,
    '',
  ].join('\n');
}

function renderTaskResearchMarkdown(packet) {
  return [
    '# Task Research Card Approval Packet',
    '',
    `Generated: ${packet.generated_at}`,
    `Raw ID: ${packet.raw_id}`,
    `Decision ID: ${packet.decision_id}`,
    `Safe to apply: ${packet.safe_to_apply}`,
    `Production writes performed: ${packet.production_writes_performed}`,
    `Exact apply command: ${packet.exact_apply_command || 'none'}`,
    '',
    '## Summary',
    '',
    '```json',
    JSON.stringify(packet.summary, null, 2),
    '```',
    '',
    markdownTable(packet.candidates, [
      { label: 'Candidate', value: 'candidate_id' },
      { label: 'Owner', value: 'owner' },
      { label: 'Category', value: 'category' },
      { label: 'Priority', value: 'priority' },
      { label: 'Source', value: 'related_source_job' },
      { label: 'Readiness', value: 'apply_readiness' },
      { label: 'Blocker', value: 'blocker' },
    ]),
    '',
    packet.reason_production_apply_not_run,
    '',
  ].join('\n');
}

function writeArtifacts(auditDir, artifacts) {
  writeJson(path.join(auditDir, 'STUDENT-QUESTION-MATCH-REVIEW.json'), artifacts.updatedReview);
  writeText(path.join(auditDir, 'STUDENT-QUESTION-MATCH-REVIEW.md'), renderQuestionReviewMarkdown(artifacts.updatedReview));

  writeJson(path.join(auditDir, 'OWNER-DECISION-GENERAL-CLASS-QUESTIONS.json'), artifacts.ownerDecision);
  writeText(path.join(auditDir, 'OWNER-DECISION-GENERAL-CLASS-QUESTIONS.md'), renderOwnerDecisionMarkdown(artifacts.ownerDecision));

  writeJson(path.join(auditDir, 'PRODUCTION-STUDENT-QUESTION-SCORE-APPLY-APPROVAL-PACKET.json'), artifacts.studentQuestionScorePacket);
  writeText(path.join(auditDir, 'PRODUCTION-STUDENT-QUESTION-SCORE-APPLY-APPROVAL-PACKET.md'), renderStudentQuestionScoreMarkdown(artifacts.studentQuestionScorePacket));

  writeJson(path.join(auditDir, 'TASK-RESEARCH-CARD-APPROVAL-PACKET.json'), artifacts.taskResearchPacket);
  writeText(path.join(auditDir, 'TASK-RESEARCH-CARD-APPROVAL-PACKET.md'), renderTaskResearchMarkdown(artifacts.taskResearchPacket));
}

function main() {
  const repoRoot = process.cwd();
  const args = parseArgs(process.argv.slice(2));
  const auditDir = path.resolve(repoRoot, args.auditDir);
  const questionReview = readJson(path.join(auditDir, 'STUDENT-QUESTION-MATCH-REVIEW.json'));
  const scorePlan = readJson(path.join(auditDir, 'STUDENT-SCORE-PROGRESS-PLAN.json'));
  const taskPlan = readJson(path.join(auditDir, 'TASK-RESEARCH-CARD-APPLY-PLAN.json'));
  const artifacts = buildOwnerDecisionArtifacts({ questionReview, scorePlan, taskPlan });

  writeArtifacts(auditDir, artifacts);

  console.log([
    'Owner decision packet generated.',
    `Output: ${args.auditDir}`,
    `General class question rows: ${artifacts.ownerDecision.resolved_question_count}`,
    `Question rows still blocked for student match: ${artifacts.updatedReview.summary.blocked_needing_human_review}`,
    `Score/progress safe rows: ${artifacts.studentQuestionScorePacket.score_progress.row_count}`,
    `Task/research candidates: ${artifacts.taskResearchPacket.summary.candidate_count}`,
    'No production writes performed.',
  ].join('\n'));
}

if (require.main === module) {
  main();
}

module.exports = {
  DEFAULT_GENERAL_CLASS_QUESTION_REFS,
  buildOwnerDecisionArtifacts,
  buildOwnerDecisionPacket,
  buildStudentQuestionScorePacket,
  buildTaskResearchApprovalPacket,
  parseArgs,
  questionScope,
  safeQuestionRow,
  updateStudentQuestionReview,
};
