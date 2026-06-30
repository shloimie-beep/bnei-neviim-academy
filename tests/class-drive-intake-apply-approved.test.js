const assert = require('assert');
const test = require('node:test');

const {
  REQUIRED_APPROVAL_ID,
  buildPlan,
} = require('../scripts/class-drive-intake-apply-approved.cjs');

const ownerDecision = {
  question_rows_total: 13,
  student_specific_matched_rows: 7,
  general_class_question_rows: 6,
  student_match_blocked_rows: 0,
  score_progress_rows_approved: 0,
  task_research_candidates_approved: 25,
  general_class_question_fanout_approved: false,
  general_class_question_target: 'class_scoped_question_or_review_record',
  production_writes_allowed_only_through_guarded_apply: true,
  parser_backlog_job_ids: [21, 25, 26, 30, 31, 56, 57, 58, 59, 71],
  general_class_question_refs: [
    'question:class-1',
    'question:class-2',
    'question:class-3',
    'question:class-4',
    'question:class-5',
    'question:class-6',
  ],
};

function questionRows() {
  const personal = Array.from({ length: 7 }, (_item, index) => ({
    job_id: 25 + index,
    question_ref: `question:personal-${index + 1}`,
    question_text_hash: `personalhash${index + 1}`,
    matched_student_ref: `student:${100 + index}`,
    match_status: 'matched',
    confidence: 100,
  }));
  const general = ownerDecision.general_class_question_refs.map((ref, index) => ({
    job_id: 58,
    question_ref: ref,
    question_text_hash: `classhash${index + 1}`,
    match_status: 'no_student_name',
    confidence: 0,
  }));
  return [...personal, ...general];
}

function taskRows(count = 25) {
  return Array.from({ length: count }, (_item, index) => ({
    job_id: 56 + (index % 4),
    candidate_id: `TASK-CANDIDATE-${String(index + 1).padStart(6, '0')}-PRIVATE-REVIEW`,
    canonical_task_key: `bna|issue41|task:${index + 1}`,
    title: `Private content review ${index + 1}`,
  }));
}

test('final apply plan accepts exact approved Issue 41 counts', () => {
  const plan = buildPlan({
    ownerDecision,
    questionPacket: { question_rows: questionRows() },
    taskPacket: { approved_rows: taskRows() },
  });

  assert.equal(plan.dry_run_passed, true);
  assert.equal(plan.summary.question_rows_total, 13);
  assert.equal(plan.summary.student_specific_matched_rows, 7);
  assert.equal(plan.summary.general_class_question_rows, 6);
  assert.equal(plan.summary.class_question_fanout_rows, 0);
  assert.equal(plan.summary.score_progress_rows, 0);
  assert.equal(plan.summary.task_research_private_review_rows, 25);
  assert.equal(plan.general_class_question_rows.every((row) => row.student_id === null), true);
  assert.equal(plan.general_class_question_rows.every((row) => row.target_table === 'bna_one_time_question_reviews'), true);
  assert.equal(plan.privacy_scan.passed, true);
  assert.equal(REQUIRED_APPROVAL_ID, 'ISSUE41-FINAL-SHLOIMIE-QUESTION-TASK-PARSER-APPLY-NO-SCORE-PROGRESS');
});

test('final apply plan fails closed on broadcast-style overexpansion', () => {
  const plan = buildPlan({
    ownerDecision,
    questionPacket: { question_rows: [...questionRows(), {
      job_id: 58,
      question_ref: 'question:extra',
      question_text_hash: 'extrahash',
      matched_student_ref: 'student:999',
      match_status: 'matched',
    }] },
    taskPacket: { approved_rows: taskRows() },
  });

  assert.equal(plan.dry_run_passed, false);
  assert.ok(plan.blocking_checks.some((check) => check.id === 'question_rows_total_13'));
});

test('final apply plan fails closed when task approval count is not exact', () => {
  const plan = buildPlan({
    ownerDecision,
    questionPacket: { question_rows: questionRows() },
    taskPacket: { approved_rows: taskRows(24) },
  });

  assert.equal(plan.dry_run_passed, false);
  assert.ok(plan.blocking_checks.some((check) => check.id === 'task_private_review_rows_25'));
});
