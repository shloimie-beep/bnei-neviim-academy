const assert = require('assert');
const { spawnSync } = require('child_process');
const path = require('path');
const test = require('node:test');

const {
  APPLY_GATE_PHRASE,
  buildGuardedBackfillDryRun,
  buildPipelineTraceRows,
  evaluateSuspectedCauses,
  extractStructuredOutput,
  jobSourceFingerprint,
} = require('../src/lib/bna/class-drive-intake-reconcile');

const students = [
  { id: 1, name: 'Moshe Cohen', status: 'active' },
  { id: 2, name: 'Moshe Levy', status: 'active' },
  { id: 3, name: 'Amitai Kosovsky', status: 'active', notes: 'Amitai Kosovsky' },
  { id: 4, name: 'Eitan Chaim Golambo', status: 'active', notes: 'Golambo' },
  { id: 5, name: 'Inactive Student', status: 'inactive' },
];

function jobFixture(overrides = {}) {
  return {
    id: 64,
    title: 'Class recording - Torah progress',
    source_type: 'google_drive',
    drive_file_id: 'drive-file-64',
    drive_folder_id: 'drive-folder-stage',
    status: 'parsed',
    drive_stage: '04 Parsed',
    transcript_text: 'Amitai learned inside for 10 minutes and asked why the pasuk repeats itself.',
    created_at: '2026-06-23T08:00:00.000Z',
    parse_json: {
      mixed_recording_parse: {
        parser: 'class-progress-parser',
        parsed_at: '2026-06-23T08:30:00.000Z',
        parsed: {
          daily_torah_updates: [
            {
              student_name: 'Amitai',
              date: '2026-06-23',
              goal_type: 'INSIDE',
              goal_minutes: 20,
              inside_engaged_minutes: 10,
              listening_without_following_minutes: 0,
              distracted_minutes: 0,
            },
          ],
          group_goal_entries: [
            {
              student_name: 'Amitai Kosovsky',
              recorded_date: '2026-06-23',
              target_minutes: 20,
              inside_following_minutes: 10,
              inside_listening_minutes: 0,
              distracted_minutes: 0,
            },
          ],
          class_notes: [
            {
              title: 'Torah class',
              summary: 'The class reviewed a pasuk and student understanding.',
              topics: ['pasuk review'],
              student_questions: ['Amitai: Why does the pasuk repeat this phrase?'],
            },
          ],
          accountability_events: [
            {
              student_name: 'Amitai',
              title: 'Amitai stayed engaged',
              event_type: 'learning_note',
            },
          ],
          report: { summary: 'Parsed class progress.' },
        },
      },
    },
    ...overrides,
  };
}

test('multi-student transcript produces one class-session proposal plus progress rows', () => {
  const job = jobFixture({
    parse_json: {
      mixed_recording_parse: {
        parser: 'class-progress-parser',
        parsed: {
          daily_torah_updates: [
            { student_name: 'Amitai', date: '2026-06-23', goal_minutes: 20, goal_type: 'INSIDE', inside_engaged_minutes: 10 },
            { student_name: 'Eitan', date: '2026-06-23', goal_minutes: 20, goal_type: 'INSIDE', inside_engaged_minutes: 20 },
          ],
          class_notes: [{ title: 'Torah class', summary: 'Two students learned.', student_questions: [] }],
        },
      },
    },
  });
  const plan = buildGuardedBackfillDryRun({ jobs: [job], students, jobRange: [64, 74] });
  assert.equal(plan.row_level_change_plan.filter((row) => row.table === 'bna_class_sessions').length, 1);
  assert.equal(plan.row_level_change_plan.filter((row) => row.table === 'bna_torah_learning_entries').length, 2);
  assert.equal(plan.no_production_mutation, true);
});

test('score and progress extraction are normalized into row-level before/after plans', () => {
  const plan = buildGuardedBackfillDryRun({ jobs: [jobFixture()], students, jobRange: [64, 74] });
  const torahRow = plan.row_level_change_plan.find((row) => row.table === 'bna_torah_learning_entries');
  assert.equal(torahRow.after.student_id, 3);
  assert.equal(torahRow.after.goal_type, 'INSIDE');
  assert.equal(torahRow.after.inside_engaged_minutes, 10);
  assert.equal(torahRow.after.daily_completion_percentage, 50);
  assert.equal(plan.expected_row_counts.bna_torah_learning_entries, 2);
});

test('student question extraction links the question to the matched student', () => {
  const plan = buildGuardedBackfillDryRun({ jobs: [jobFixture()], students, jobRange: [64, 74] });
  const questionRow = plan.row_level_change_plan.find((row) => (
    row.table === 'bna_accountability_events'
    && row.after.event_type === 'question'
  ));
  assert.equal(questionRow.after.student_id, 3);
  assert.equal(typeof questionRow.after.question_text_hash, 'string');
  assert.equal(questionRow.after.question_text_hash.length, 12);
  assert.equal(questionRow.after.metadata.question_scope, 'student_question');
  assert.equal(questionRow.after.metadata.class_question_broadcast, false);
});

test('unmatched questions are planned as class questions for every active student', () => {
  const job = jobFixture({
    id: 65,
    parse_json: {
      mixed_recording_parse: {
        parser: 'class-progress-parser',
        parsed: {
          daily_torah_updates: [],
          class_notes: [{
            title: 'Torah class',
            summary: 'The class raised a question without a named student.',
            student_questions: ['Why does the pasuk repeat itself?'],
          }],
        },
      },
    },
  });
  const plan = buildGuardedBackfillDryRun({ jobs: [job], students, jobRange: [64, 74] });
  const questionRows = plan.row_level_change_plan.filter((row) => (
    row.table === 'bna_accountability_events'
    && row.after.event_type === 'question'
  ));
  assert.deepEqual(questionRows.map((row) => row.after.student_id), [1, 2, 3, 4]);
  assert.equal(questionRows.some((row) => row.after.student_id === 5), false);
  assert.equal(questionRows.every((row) => row.after.title === 'Class question'), true);
  assert.equal(questionRows.every((row) => row.after.metadata.question_scope === 'class_question'), true);
  assert.equal(questionRows.every((row) => row.after.metadata.class_question_broadcast === true), true);
  assert.equal(questionRows.every((row) => row.after.metadata.not_personal_student_question === true), true);
  assert.equal(plan.class_question_fallbacks.length, 1);
  assert.equal(plan.class_question_fallbacks[0].target_student_count, 4);
  assert.equal(plan.blocking_ambiguities.length, 0);
  assert.equal(plan.safe_to_apply, true);
});

test('ambiguous question names are class-question fallbacks instead of blocking student matching', () => {
  const job = jobFixture({
    id: 66,
    parse_json: {
      mixed_recording_parse: {
        parser: 'class-progress-parser',
        parsed: {
          daily_torah_updates: [],
          class_notes: [{
            title: 'Torah class',
            summary: 'The class raised a question from an ambiguous first name.',
            student_questions: ['Moshe: Why does this become a class question?'],
          }],
        },
      },
    },
  });
  const plan = buildGuardedBackfillDryRun({ jobs: [job], students, jobRange: [64, 74] });
  const questionRows = plan.row_level_change_plan.filter((row) => (
    row.table === 'bna_accountability_events'
    && row.after.event_type === 'question'
  ));
  assert.equal(questionRows.length, 4);
  assert.equal(plan.class_question_fallbacks[0].reason, 'ambiguous question student match');
  assert.equal(plan.blocking_ambiguities.length, 0);
  assert.equal(plan.safe_to_apply, true);
});

test('class note questions and question-shaped discussions become class-question fallbacks', () => {
  const job = jobFixture({
    id: 67,
    parse_json: {
      mixed_recording_parse: {
        parser: 'class-progress-parser',
        parsed: {
          daily_torah_updates: [],
          class_notes: [{
            title: 'Torah class',
            summary: 'The class had broader discussion questions.',
            student_questions: [],
            questions: ['Why is this listed in the questions field?'],
            discussions: ['What should everyone think about from this source?'],
          }],
        },
      },
    },
  });
  const plan = buildGuardedBackfillDryRun({ jobs: [job], students, jobRange: [64, 74] });
  const questionRows = plan.row_level_change_plan.filter((row) => (
    row.table === 'bna_accountability_events'
    && row.after.event_type === 'question'
  ));
  assert.equal(questionRows.length, 8);
  assert.equal(questionRows.every((row) => row.after.metadata.question_scope === 'class_question'), true);
  assert.deepEqual([...new Set(questionRows.map((row) => row.after.metadata.source_kind))], [
    'class_notes.questions',
    'class_notes.discussions_question',
  ]);
  assert.equal(plan.class_question_fallbacks.length, 2);
  assert.equal(plan.blocking_ambiguities.length, 0);
  assert.equal(plan.safe_to_apply, true);
});

test('ambiguous names are excluded instead of auto-merged', () => {
  const job = jobFixture({
    id: 65,
    parse_json: {
      mixed_recording_parse: {
        parser: 'class-progress-parser',
        parsed: {
          daily_torah_updates: [
            { student_name: 'Moshe', date: '2026-06-23', goal_minutes: 20, goal_type: 'INSIDE', inside_engaged_minutes: 10 },
          ],
          class_notes: [],
        },
      },
    },
  });
  const plan = buildGuardedBackfillDryRun({ jobs: [job], students, jobRange: [64, 74] });
  assert.equal(plan.row_level_change_plan.some((row) => [1, 2].includes(row.after?.student_id)), false);
  assert.equal(plan.safe_to_apply, false);
  assert.match(plan.blocking_ambiguities[0].reason, /ambiguous/);
});

test('duplicate upload fingerprints are idempotently excluded', () => {
  const first = jobFixture({ id: 66, drive_file_id: 'same-drive-file' });
  const second = jobFixture({ id: 67, drive_file_id: 'same-drive-file' });
  const plan = buildGuardedBackfillDryRun({ jobs: [first, second], students, jobRange: [64, 74] });
  assert.deepEqual(plan.duplicate_groups[0].job_ids, [66, 67]);
  assert.equal(plan.duplicate_exclusions[0].job_id, 67);
  assert.equal(plan.candidate_jobs.some((job) => job.job_id === 67), false);
});

test('retry and transcript failures are visible in the pipeline trace', () => {
  const failed = jobFixture({
    id: 68,
    status: 'failed',
    transcript_text: '',
    error: 'OpenAI transcription failed: 401 invalid_api_key',
    parse_json: {},
  });
  const rows = buildPipelineTraceRows({ jobs: [failed], students });
  assert.equal(rows[0].stages.transcription_result.status, 'FAILED');
  assert.equal(rows[0].stages.retry_dedup_status.status, 'NEEDS_RETRY');
  assert.match(rows[0].stages.transcription_request.evidence, /401 invalid_api_key/);
});

test('parser output apply is idempotent against existing rows', () => {
  const job = jobFixture({ id: 69 });
  const plan = buildGuardedBackfillDryRun({
    jobs: [job],
    students,
    groupGoalEntries: [{
      id: 900,
      source_content_job_id: 69,
      student_id: 3,
      recorded_date: '2026-06-23',
      progress_percent: 50,
    }],
    torahEntries: [{
      id: 901,
      student_id: 3,
      date: '2026-06-23',
      progress_percent: 50,
      note: 'content job #69',
    }],
    jobRange: [64, 74],
  });
  assert.ok(plan.idempotency.natural_keys.includes('student:3:date:2026-06-23:torah_learning'));
  assert.equal(plan.idempotency.rerun_after_success_expected_writes, 0);
  assert.ok(plan.row_level_change_plan.some((row) => row.action === 'skip_existing'));
});

test('Operations and parent/student read-model visibility are classified from persisted rows', () => {
  const job = jobFixture({ id: 70 });
  const rows = buildPipelineTraceRows({
    jobs: [job],
    students,
    classSessions: [{ id: 1, content_job_id: 70 }],
    groupGoalEntries: [{ id: 2, source_content_job_id: 70, student_id: 3 }],
    accountabilityEvents: [{ id: 3, student_id: 3, metadata: { source_content_job_id: 70 } }],
    torahEntries: [{ id: 4, student_id: 3, date: '2026-06-23' }],
  });
  assert.equal(rows[0].stages.operations_read_model_visibility.status, 'CONFIRMED');
  assert.equal(rows[0].stages.parent_student_visibility.status, 'CONFIRMED');
  assert.equal(rows[0].stages.canonical_write_status.status, 'CONFIRMED');
});

test('dry-run output includes transaction boundaries and rollback strategy', () => {
  const plan = buildGuardedBackfillDryRun({ jobs: [jobFixture()], students, jobRange: [64, 74] });
  assert.equal(plan.mode, 'dry_run_no_writes');
  assert.equal(plan.idempotency.dry_run_performs_no_writes, true);
  assert.ok(plan.transaction_boundaries.includes('BEGIN'));
  assert.match(plan.rollback_strategy.join('\n'), /snapshot/i);
  assert.equal(plan.required_gate_phrase, APPLY_GATE_PHRASE);
});

test('suspected causes confirm generic parser and missing apply defects', () => {
  const job = jobFixture({
    id: 71,
    parse_json: {
      mixed_recording_parse: {
        parser: 'canonical-intake-parser',
        parsed: {
          daily_torah_updates: [{ student_name: 'Amitai', date: '2026-06-23', progress_percent: 50 }],
        },
      },
    },
  });
  const rows = buildPipelineTraceRows({ jobs: [job], students });
  const causes = evaluateSuspectedCauses({ jobs: [job], pipelineRows: rows, authReadiness: {} });
  assert.equal(causes.generic_ramble_parser_used_instead_of_class_parser.status, 'CONFIRMED');
  assert.equal(causes.parser_output_exists_but_apply_step_did_not_run.status, 'CONFIRMED');
});

test('structured output extraction supports progress-only parser payloads', () => {
  const structured = extractStructuredOutput(jobFixture({
    parse_json: {
      mixed_recording_parse: {
        progress_only: {
          parsed: {
            daily_torah_updates: [{ student_name: 'Amitai', progress_percent: 100 }],
          },
        },
      },
    },
  }));
  assert.equal(structured.daily_torah_updates.length, 1);
});

test('CLI refuses guarded apply because this lane is read-only', () => {
  const result = spawnSync(process.execPath, [
    path.join(__dirname, '..', 'scripts', 'class-drive-intake-reconcile.cjs'),
    'backfill',
    '--apply',
    '--gate',
    APPLY_GATE_PHRASE,
  ], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    env: { ...process.env, DATABASE_URL: '', PGHOST: '' },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /read-only/);
});

test('source fingerprint is stable for retry/dedup comparisons', () => {
  const one = jobFixture({ id: 72 });
  const two = jobFixture({ id: 73 });
  assert.equal(jobSourceFingerprint(one), jobSourceFingerprint(two));
});
