#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_AUDIT_DIR = path.join('ops', 'class-drive-intake', '2026-06-26-two-week-class-intake-audit');
const DEFAULT_DIGEST_DIR = path.join('content-memory', 'transcript-digests');
const DECISION_ID = 'DEC-20260626-101';

function parseArgs(argv) {
  const args = {
    command: argv[0] || 'backfill',
    jobs: '',
    outDir: DEFAULT_AUDIT_DIR,
    digestDir: DEFAULT_DIGEST_DIR,
  };
  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--jobs') args.jobs = argv[++index] || '';
    else if (arg.startsWith('--jobs=')) args.jobs = arg.slice('--jobs='.length);
    else if (arg === '--out-dir') args.outDir = argv[++index] || args.outDir;
    else if (arg.startsWith('--out-dir=')) args.outDir = arg.slice('--out-dir='.length);
    else if (arg === '--digest-dir') args.digestDir = argv[++index] || args.digestDir;
    else if (arg.startsWith('--digest-dir=')) args.digestDir = arg.slice('--digest-dir='.length);
    else if (arg === '--apply') throw new Error('--apply is not supported by this no-write planner.');
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.command !== 'backfill') throw new Error(`Unsupported command: ${args.command}`);
  return args;
}

function parseJobSelector(value) {
  const ids = new Set();
  for (const part of String(value || '').split(',').map((item) => item.trim()).filter(Boolean)) {
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      for (let id = Math.min(start, end); id <= Math.max(start, end); id += 1) ids.add(id);
    } else if (/^\d+$/.test(part)) {
      ids.add(Number(part));
    }
  }
  return ids;
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
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

function stage(trace, name) {
  return trace?.stages?.[name]?.status || 'UNKNOWN';
}

function stageEvidence(trace, name) {
  return trace?.stages?.[name]?.evidence || '';
}

function jobIdFromSourceRef(value) {
  return Number(String(value || '').match(/content_job:(\d+)/)?.[1] || 0) || null;
}

function zeroJobId(jobId) {
  return String(jobId || '').padStart(6, '0');
}

function loadDigest(repoRoot, digestDir, jobId) {
  const dir = path.resolve(repoRoot, digestDir, 'recordings', zeroJobId(jobId));
  return {
    manifest: readJson(path.join(dir, 'MANIFEST.json'), {}),
    parseGaps: readJson(path.join(dir, 'PARSE-GAPS.json'), []),
    categories: readJson(path.join(dir, 'CATEGORIES.json'), {}),
  };
}

function loadContext(repoRoot, outDir, digestDir) {
  const auditDir = path.resolve(repoRoot, outDir);
  return {
    auditDir,
    summary: readJson(path.join(auditDir, 'AUDIT-SUMMARY.json'), {}),
    traces: readJson(path.join(auditDir, 'JOB-PIPELINE-TRACE.json'), []),
    questions: readJson(path.join(auditDir, 'STUDENT-QUESTION-MATRIX.json'), []),
    repairPlan: readJson(path.join(auditDir, 'REPROCESS-DRY-RUN-PLAN.json'), {}),
    manifest: readJson(path.resolve(repoRoot, digestDir, 'manifest.json'), { recordings: [] }),
  };
}

function determineIssueKinds(trace, manifest, questions) {
  const kinds = [];
  if (!stageEvidence(trace, 'parser_request') && !manifest.parser_used) kinds.push('missing parser metadata');
  if (stage(trace, 'structured_output') === 'MISSING') kinds.push('missing structured parse');
  if (stage(trace, 'structured_output') === 'NEEDS_REVIEW') kinds.push('malformed or partial parse');
  if (stage(trace, 'profile_note_proposal') !== 'CONFIRMED') kinds.push('partial class notes');
  if (stage(trace, 'question_proposal') === 'MISSING' && !questions.length) kinds.push('no student-question extraction');
  if (questions.some((row) => row.match_status !== 'matched')) kinds.push('ambiguous student-question matching');
  if (stage(trace, 'score_progress_proposal') === 'MISSING') kinds.push('no score/progress extraction');
  if (manifest.private_review_flag) kinds.push('private review required');
  return [...new Set(kinds)];
}

function buildParserResults(ctx, repoRoot, digestDir, selectedJobIds) {
  const traceByJob = new Map(toArray(ctx.traces).map((trace) => [Number(trace.job_id), trace]));
  const repairJobIds = toArray(ctx.repairPlan.dry_run_repair_candidates)
    .map((row) => jobIdFromSourceRef(row.source_ref))
    .filter(Boolean)
    .filter((jobId) => !selectedJobIds.size || selectedJobIds.has(jobId));
  const jobIds = [...new Set(repairJobIds)].sort((a, b) => a - b);

  const rows = jobIds.map((jobId) => {
    const trace = traceByJob.get(jobId) || { job_id: jobId, stages: {} };
    const { manifest, parseGaps } = loadDigest(repoRoot, digestDir, jobId);
    const questions = toArray(ctx.questions).filter((row) => Number(row.job_id) === Number(jobId));
    const matched = questions.filter((row) => row.match_status === 'matched');
    const unmatched = questions.filter((row) => row.match_status !== 'matched');
    const issueKinds = determineIssueKinds(trace, manifest, questions);
    const scoreProgressCount = stage(trace, 'score_progress_proposal') === 'CONFIRMED' ? 1 : 0;
    return {
      job_id: jobId,
      title: manifest.generated_title || `Class Recording Job ${String(jobId).padStart(3, '0')}`,
      transcript_chars: manifest.transcript_chars || trace.transcript_chars || 0,
      current_parse_state: manifest.category_list?.includes('parser_error') || !manifest.parser_used
        ? 'needs parser review'
        : 'parsed',
      proposed_parse_state: 'dry-run review only; no production reparse or canonical write performed',
      issue_kinds: issueKinds,
      lanes_detected: manifest.category_list || [],
      student_question_count: questions.length,
      matched_student_question_count: matched.length,
      unmatched_ambiguous_question_count: unmatched.length,
      task_candidate_count: manifest.tasks_extracted || 0,
      score_progress_candidate_count: scoreProgressCount,
      private_review_needed: Boolean(manifest.private_review_flag),
      safe_next_action: unmatched.length
        ? 'Human student-match review, then exact row-level plan before any production write.'
        : 'Owner-approved dry-run reparse review can be prepared; production writes remain blocked.',
      blocker: `${DECISION_ID}: no production reparse/canonical write/apply approval; raw transcript review must stay private.`,
      parse_gap_stages: toArray(parseGaps).map((gap) => `${gap.stage}:${gap.status}`),
    };
  });

  return {
    generated_at: new Date().toISOString(),
    mode: 'no_write_parser_repair_review',
    requested_jobs: selectedJobIds.size ? [...selectedJobIds].sort((a, b) => a - b) : [],
    isolated_repair_candidate_jobs: jobIds,
    production_writes_performed: false,
    safe_to_apply: false,
    decision_gate: DECISION_ID,
    rows,
    summary: {
      requested_job_count: selectedJobIds.size,
      repair_candidate_count: rows.length,
      student_question_rows: rows.reduce((sum, row) => sum + row.student_question_count, 0),
      matched_student_question_rows: rows.reduce((sum, row) => sum + row.matched_student_question_count, 0),
      blocked_student_question_rows: rows.reduce((sum, row) => sum + row.unmatched_ambiguous_question_count, 0),
      task_candidate_count: rows.reduce((sum, row) => sum + row.task_candidate_count, 0),
      score_progress_candidate_count: rows.reduce((sum, row) => sum + row.score_progress_candidate_count, 0),
    },
  };
}

function buildStudentQuestionReview(ctx) {
  const rows = toArray(ctx.questions).map((row) => {
    const blocked = row.match_status !== 'matched';
    return {
      job_id: row.job_id,
      question_ref: row.question_ref,
      question_text_hash: row.question_text_hash,
      current_match_status: row.match_status,
      proposed_match_status: row.match_status === 'matched' ? 'already matched; still needs learning review' : 'blocked_needs_human_student_match_review',
      matched_student_ref: row.match_status === 'matched' ? row.matched_student_ref || null : null,
      confidence: row.confidence || 0,
      source_kind: row.source_kind || '',
      resolved_by_this_pass: false,
      blocker: blocked
        ? 'Sanitized evidence does not contain clear student identity; no guessing or cross-assignment allowed.'
        : '',
      exact_human_decision_needed: blocked
        ? 'Review the private transcript/app source for this question ref and choose the correct student or mark it not student-specific.'
        : '',
      production_write_allowed: false,
    };
  });
  return {
    generated_at: new Date().toISOString(),
    mode: 'no_write_student_question_match_review',
    production_writes_performed: false,
    rows,
    summary: {
      total_rows: rows.length,
      matched_before: rows.filter((row) => row.current_match_status === 'matched').length,
      matched_after: rows.filter((row) => row.proposed_match_status.startsWith('already matched')).length,
      resolved_by_this_pass: rows.filter((row) => row.resolved_by_this_pass).length,
      blocked_needing_human_review: rows.filter((row) => row.current_match_status !== 'matched').length,
    },
  };
}

function buildScoreProgressPlan(parserResults) {
  const blockedRows = parserResults.rows.map((row) => ({
    job_id: row.job_id,
    reason: row.score_progress_candidate_count
      ? 'Candidate exists but still needs row-level reviewed before/after values.'
      : 'No score/progress proposal in sanitized audit evidence.',
    blocker: `${DECISION_ID}: production score/progress writes require exact reviewed row-level approval.`,
  }));
  return {
    generated_at: new Date().toISOString(),
    mode: 'no_write_score_progress_plan',
    safe_to_apply: false,
    row_count: 0,
    rows: [],
    blocked_rows: blockedRows,
    privacy_review: 'required before any student score/progress write; no raw transcript text included here',
    rollback_plan: 'No production writes performed. Future approved apply packet must include before values and a transaction rollback/readback plan.',
    requires_owner_approval: true,
    exact_apply_command: null,
  };
}

function buildTaskResearchPlan(parserResults) {
  const candidates = [];
  for (const row of parserResults.rows) {
    candidates.push({
      candidate_id: `TASK-RESEARCH-CANDIDATE-${String(row.job_id).padStart(3, '0')}-PARSER`,
      owner: 'Codex',
      category: 'operations/support/parser repair',
      priority: row.issue_kinds.includes('missing structured parse') ? 'high' : 'medium',
      depends_on: [DECISION_ID],
      related_source_job: `content_job:${row.job_id}`,
      related_file: `content-memory/transcript-digests/recordings/${zeroJobId(row.job_id)}/MANIFEST.json`,
      notes: `No-write parser review candidate. Issues: ${row.issue_kinds.join('; ') || 'needs review'}.`,
      privacy_classification: row.private_review_needed ? 'private_review_required' : 'repo_safe_digest',
      confidence: 0.72,
      apply_readiness: 'not_ready_without_owner_approval',
      blocker: `${DECISION_ID}: no production task/research-card creation approval.`,
    });
    if (row.student_question_count) {
      candidates.push({
        candidate_id: `TASK-RESEARCH-CANDIDATE-${String(row.job_id).padStart(3, '0')}-FAQ`,
        owner: 'Shloimie/Rabbi review',
        category: 'parent-facing FAQ candidate',
        priority: row.unmatched_ambiguous_question_count ? 'low' : 'medium',
        depends_on: ['human_student_match_review', DECISION_ID],
        related_source_job: `content_job:${row.job_id}`,
        related_file: `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/STUDENT-QUESTION-MATRIX.json`,
        notes: `${row.student_question_count} question candidate(s); ${row.unmatched_ambiguous_question_count} still blocked for identity review.`,
        privacy_classification: 'private_review_required',
        confidence: row.unmatched_ambiguous_question_count ? 0.45 : 0.68,
        apply_readiness: 'not_ready_private_review_required',
        blocker: 'Questions must be reviewed privately before any parent-facing card or FAQ is created.',
      });
    }
    if (row.lanes_detected.includes('class_notes')) {
      candidates.push({
        candidate_id: `TASK-RESEARCH-CANDIDATE-${String(row.job_id).padStart(3, '0')}-SOURCE`,
        owner: 'Rabbi/Content review',
        category: 'research/source-sheet candidate',
        priority: 'low',
        depends_on: [DECISION_ID],
        related_source_job: `content_job:${row.job_id}`,
        related_file: `content-memory/transcript-digests/recordings/${zeroJobId(row.job_id)}/DIGEST.md`,
        notes: 'Digest confirms class-note material, but source-sheet content needs private transcript/source review.',
        privacy_classification: 'private_review_required',
        confidence: 0.52,
        apply_readiness: 'planning_only',
        blocker: 'No source-sheet card should be created from sanitized metadata alone.',
      });
    }
  }
  return {
    generated_at: new Date().toISOString(),
    mode: 'no_write_task_research_card_apply_plan',
    production_writes_performed: false,
    safe_to_apply: false,
    candidates,
    summary: {
      candidate_count: candidates.length,
      ready_to_apply_count: candidates.filter((row) => row.apply_readiness === 'ready').length,
      private_review_required_count: candidates.filter((row) => row.privacy_classification === 'private_review_required').length,
      production_task_or_card_rows_created: 0,
    },
  };
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

function renderParserMarkdown(result) {
  return [
    '# Parser Repair Results',
    '',
    `Generated: ${result.generated_at}`,
    `Mode: ${result.mode}`,
    `Production writes performed: ${result.production_writes_performed}`,
    `Safe to apply: ${result.safe_to_apply}`,
    `Decision gate: ${result.decision_gate}`,
    '',
    '## Summary',
    '',
    '```json',
    JSON.stringify(result.summary, null, 2),
    '```',
    '',
    '## Job Results',
    '',
    markdownTable(result.rows, [
      { label: 'Job', value: (row) => `#${row.job_id}` },
      { label: 'Title', value: 'title' },
      { label: 'Chars', value: 'transcript_chars' },
      { label: 'Current parse', value: 'current_parse_state' },
      { label: 'Proposed parse', value: 'proposed_parse_state' },
      { label: 'Lanes', value: (row) => row.lanes_detected.join(', ') },
      { label: 'Questions', value: 'student_question_count' },
      { label: 'Matched', value: 'matched_student_question_count' },
      { label: 'Blocked Qs', value: 'unmatched_ambiguous_question_count' },
      { label: 'Tasks', value: 'task_candidate_count' },
      { label: 'Score', value: 'score_progress_candidate_count' },
      { label: 'Private review', value: (row) => row.private_review_needed ? 'yes' : 'no' },
      { label: 'Safe next action', value: 'safe_next_action' },
      { label: 'Blocker', value: 'blocker' },
    ]),
    '',
  ].join('\n');
}

function renderQuestionMarkdown(result) {
  return [
    '# Student Question Match Review',
    '',
    `Generated: ${result.generated_at}`,
    `Production writes performed: ${result.production_writes_performed}`,
    '',
    '## Summary',
    '',
    '```json',
    JSON.stringify(result.summary, null, 2),
    '```',
    '',
    markdownTable(result.rows, [
      { label: 'Job', value: (row) => `#${row.job_id}` },
      { label: 'Question', value: 'question_ref' },
      { label: 'Current match', value: 'current_match_status' },
      { label: 'Proposed match', value: 'proposed_match_status' },
      { label: 'Student ref', value: 'matched_student_ref' },
      { label: 'Resolved here', value: (row) => row.resolved_by_this_pass ? 'yes' : 'no' },
      { label: 'Decision needed', value: 'exact_human_decision_needed' },
    ]),
    '',
  ].join('\n');
}

function renderScoreMarkdown(plan) {
  return [
    '# Student Score Progress Plan',
    '',
    `Generated: ${plan.generated_at}`,
    `Safe to apply: ${plan.safe_to_apply}`,
    `Row count: ${plan.row_count}`,
    `Requires owner approval: ${plan.requires_owner_approval}`,
    '',
    'No score/progress production write is safe from the current sanitized evidence.',
    '',
    '## Blocked Rows',
    '',
    markdownTable(plan.blocked_rows, [
      { label: 'Job', value: (row) => `#${row.job_id}` },
      { label: 'Reason', value: 'reason' },
      { label: 'Blocker', value: 'blocker' },
    ]),
    '',
  ].join('\n');
}

function renderTaskMarkdown(plan) {
  return [
    '# Task Research Card Apply Plan',
    '',
    `Generated: ${plan.generated_at}`,
    `Production writes performed: ${plan.production_writes_performed}`,
    `Safe to apply: ${plan.safe_to_apply}`,
    '',
    '## Summary',
    '',
    '```json',
    JSON.stringify(plan.summary, null, 2),
    '```',
    '',
    markdownTable(plan.candidates, [
      { label: 'Candidate', value: 'candidate_id' },
      { label: 'Owner', value: 'owner' },
      { label: 'Category', value: 'category' },
      { label: 'Priority', value: 'priority' },
      { label: 'Source', value: 'related_source_job' },
      { label: 'Privacy', value: 'privacy_classification' },
      { label: 'Readiness', value: 'apply_readiness' },
      { label: 'Blocker', value: 'blocker' },
    ]),
    '',
  ].join('\n');
}

function main() {
  const repoRoot = process.cwd();
  const args = parseArgs(process.argv.slice(2));
  const selectedJobIds = parseJobSelector(args.jobs);
  const ctx = loadContext(repoRoot, args.outDir, args.digestDir);
  const parserResults = buildParserResults(ctx, repoRoot, args.digestDir, selectedJobIds);
  const questionReview = buildStudentQuestionReview(ctx);
  const scorePlan = buildScoreProgressPlan(parserResults);
  const taskPlan = buildTaskResearchPlan(parserResults);

  writeJson(path.join(ctx.auditDir, 'PARSER-REPAIR-RESULTS.json'), parserResults);
  writeText(path.join(ctx.auditDir, 'PARSER-REPAIR-RESULTS.md'), renderParserMarkdown(parserResults));
  writeJson(path.join(ctx.auditDir, 'STUDENT-QUESTION-MATCH-REVIEW.json'), questionReview);
  writeText(path.join(ctx.auditDir, 'STUDENT-QUESTION-MATCH-REVIEW.md'), renderQuestionMarkdown(questionReview));
  writeJson(path.join(ctx.auditDir, 'STUDENT-SCORE-PROGRESS-PLAN.json'), scorePlan);
  writeText(path.join(ctx.auditDir, 'STUDENT-SCORE-PROGRESS-PLAN.md'), renderScoreMarkdown(scorePlan));
  writeJson(path.join(ctx.auditDir, 'TASK-RESEARCH-CARD-APPLY-PLAN.json'), taskPlan);
  writeText(path.join(ctx.auditDir, 'TASK-RESEARCH-CARD-APPLY-PLAN.md'), renderTaskMarkdown(taskPlan));

  console.log([
    'Class Drive intake no-write planner complete.',
    `Output: ${path.relative(repoRoot, ctx.auditDir)}`,
    `Requested jobs: ${selectedJobIds.size ? [...selectedJobIds].sort((a, b) => a - b).join(', ') : 'all repair candidates'}`,
    `Repair candidate jobs: ${parserResults.isolated_repair_candidate_jobs.join(', ')}`,
    `Student questions: ${questionReview.summary.total_rows}`,
    `Blocked student matches: ${questionReview.summary.blocked_needing_human_review}`,
    `Safe score/progress rows: ${scorePlan.row_count}`,
    `Task/research candidates: ${taskPlan.summary.candidate_count}`,
    'No production writes performed.',
  ].join('\n'));
}

main();
