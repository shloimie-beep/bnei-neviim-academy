const assert = require('node:assert/strict');
const test = require('node:test');

const {
  DEFAULT_GENERAL_CLASS_QUESTION_REFS,
  buildOwnerDecisionArtifacts,
  parseArgs,
} = require('../scripts/class-drive-intake-owner-decision-packet.cjs');

function questionRow(questionRef, index) {
  return {
    job_id: index < 2 ? 58 : index < 5 ? 26 : 25,
    question_ref: questionRef,
    question_text_hash: questionRef.replace('question:', ''),
    question_text: 'raw question text must not survive into repo evidence',
    current_match_status: index === 2 ? 'unmatched' : 'no_student_name',
    proposed_match_status: 'blocked_needs_human_student_match_review',
    matched_student_ref: null,
    confidence: 0,
    source_kind: 'class_notes.discussions_question',
    resolved_by_this_pass: false,
    blocker: 'needs review',
    exact_human_decision_needed: 'choose student',
    production_write_allowed: false,
  };
}

test('owner decision packet makes six unresolved refs general class questions without raw text', () => {
  const questionReview = {
    generated_at: 'before',
    rows: [
      {
        job_id: 30,
        question_ref: 'question:matched',
        question_text_hash: 'matched',
        question_text: 'private matched question body',
        current_match_status: 'matched',
        proposed_match_status: 'already matched; still needs learning review',
        matched_student_ref: 'student:2436',
        confidence: 100,
        source_kind: 'class_notes.student_questions',
        resolved_by_this_pass: false,
        blocker: '',
        exact_human_decision_needed: '',
        production_write_allowed: false,
      },
      ...DEFAULT_GENERAL_CLASS_QUESTION_REFS.map(questionRow),
    ],
  };
  const scorePlan = { row_count: 0, rows: [], blocked_rows: [{ job_id: 25, reason: 'none' }] };
  const taskPlan = {
    candidates: [
      { candidate_id: 'parser', category: 'operations/support/parser repair' },
      { candidate_id: 'faq', category: 'parent-facing FAQ candidate' },
      { candidate_id: 'source', category: 'research/source-sheet candidate' },
    ],
  };

  const artifacts = buildOwnerDecisionArtifacts({ questionReview, scorePlan, taskPlan });

  assert.equal(artifacts.updatedReview.summary.total_rows, 7);
  assert.equal(artifacts.updatedReview.summary.matched_student_specific_rows, 1);
  assert.equal(artifacts.updatedReview.summary.approved_general_class_question_rows, 6);
  assert.equal(artifacts.updatedReview.summary.blocked_needing_human_review, 0);
  assert.equal(artifacts.ownerDecision.resolved_question_count, 6);
  assert.equal(artifacts.studentQuestionScorePacket.safe_to_apply, false);
  assert.equal(artifacts.studentQuestionScorePacket.exact_apply_command, null);
  assert.equal(artifacts.studentQuestionScorePacket.unresolved_question_rows, 0);
  assert.equal(artifacts.taskResearchPacket.summary.candidate_count, 3);
  assert.equal(artifacts.taskResearchPacket.production_writes_performed, false);

  const serialized = JSON.stringify(artifacts);
  assert.equal(serialized.includes('raw question text must not survive'), false);
  assert.equal(serialized.includes('private matched question body'), false);
});

test('owner decision packet fails loudly if an approved question ref is missing', () => {
  const rows = DEFAULT_GENERAL_CLASS_QUESTION_REFS.slice(1).map(questionRow);
  assert.throws(
    () => buildOwnerDecisionArtifacts({
      questionReview: { rows },
      scorePlan: { row_count: 0, rows: [], blocked_rows: [] },
      taskPlan: { candidates: [] },
    }),
    /missing refs: question:c516d14ee4e5d49f/
  );
});

test('owner decision packet CLI refuses apply mode', () => {
  assert.throws(() => parseArgs(['--apply']), /--apply is not supported/);
});
