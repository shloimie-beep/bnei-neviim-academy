const test = require('node:test');
const assert = require('node:assert/strict');

const {
  goalBoardBucket,
  goalBoardStatus,
  automaticDeviceAccessForCompletion,
  metadataAfterProgressUpdate,
  metadataWithGoalBoard,
  parseMetadata,
  safeGoalBoardStudentView,
} = require('../src/lib/bna/goal-board');

const NOW = new Date('2026-06-05T10:00:00.000Z');

test('Goal Board buckets Today, Upcoming, Waiting, and Done', () => {
  const today = {
    id: 1,
    title: 'Review Mishnah',
    progress_percent: 0,
    metadata: metadataWithGoalBoard({}, { due_at: '2026-06-05T14:00:00.000Z' }),
  };
  const upcoming = {
    id: 2,
    title: 'Prepare question',
    progress_percent: 0,
    metadata: metadataWithGoalBoard({}, { due_at: '2026-06-08T14:00:00.000Z' }),
  };
  const waiting = {
    id: 3,
    title: 'Device-linked agreement',
    progress_percent: 0,
    metadata: metadataWithGoalBoard({}, { approval_required: true, approval_status: 'pending_review' }),
  };
  const done = {
    id: 4,
    title: 'Done item',
    progress_percent: 100,
    metadata: metadataWithGoalBoard({}, {}),
  };

  assert.equal(goalBoardBucket(today, NOW), 'today');
  assert.equal(goalBoardBucket(upcoming, NOW), 'upcoming');
  assert.equal(goalBoardBucket(waiting, NOW), 'waiting');
  assert.equal(goalBoardBucket(done, NOW), 'done');
});

test('Student Goal Board view does not expose private notes or Torah internals', () => {
  const row = {
    id: 10,
    title: 'Wake up on time',
    notes: 'Private meeting detail that stays admin-only',
    topic: 'Routine',
    goal_target_value: 1,
    goal_actual_value: 0,
    goal_unit: 'day',
    progress_percent: 0,
    metadata: metadataWithGoalBoard({}, {
      source: 'private_meeting',
      private_note: 'Raw private Torah minutes and agreement notes',
      student_summary: 'Morning routine goal',
      consequence: {
        recovery_path: 'Check in with the rebbi before device access resumes.',
        device_access_state: 'accountability_only',
      },
    }),
  };

  const view = safeGoalBoardStudentView(row, NOW);
  const serialized = JSON.stringify(view);

  assert.equal(view.source, 'private_meeting');
  assert.equal(view.student_summary, 'Morning routine goal');
  assert.match(view.consequence.recovery_path, /Check in/);
  assert.doesNotMatch(serialized, /Private meeting detail/);
  assert.doesNotMatch(serialized, /Raw private Torah minutes/);
  assert.doesNotMatch(serialized, /goal_type|inside_engaged_minutes|engaged_listening_minutes/);
});

test('Overdue missed device-linked goal creates pending review, not an applied action', () => {
  const row = {
    id: 20,
    title: 'Wake up on time',
    progress_percent: 0,
    metadata: metadataWithGoalBoard({}, {
      due_at: '2026-06-04T06:30:00.000Z',
      consequence: {
        recovery_path: 'Reset alarm plan with parent.',
        device_access_state: 'accountability_only',
        approval_required: true,
      },
    }),
  };

  const nextMetadata = metadataAfterProgressUpdate(row, 0, NOW);
  const parsed = parseMetadata(nextMetadata).goal_board;

  assert.equal(goalBoardStatus({ ...row, metadata: nextMetadata }, NOW), 'waiting');
  assert.equal(parsed.consequence.status, 'pending_review');
  assert.equal(parsed.consequence.approval_required, true);
  assert.notEqual(parsed.consequence.status, 'approved');
});

test('Completed student accountability goal requests automatic approved access', () => {
  const row = {
    id: 30,
    title: 'Wake up on time',
    progress_percent: 0,
    metadata: metadataWithGoalBoard({}, {
      source: 'self',
      agreement_type: 'bedtime_wakeup',
      bedtime_time: '22:00',
      wake_time: '07:00',
      student_commitment: 'Be in bed by 10:00 PM and out of bed by 7:00 AM.',
      chosen_consequence: 'Tablet opens after honest checkoff.',
      consequence: {
        auto_apply_on_completion: true,
        success_device_access_state: 'approved_access',
        success_duration_minutes: 45,
        recovery_path: 'Stay accountability-only and review the morning plan.',
        device_access_state: 'accountability_only',
        approval_required: false,
      },
    }),
  };

  const access = automaticDeviceAccessForCompletion(row, 100, NOW);

  assert.equal(access.status, 'approved_access');
  assert.equal(access.durationMinutes, 45);
  assert.match(access.reason, /bed by 10:00 PM/);
});

test('Partial accountability checkoff does not open tablet access', () => {
  const row = {
    id: 31,
    title: 'Wake up on time',
    progress_percent: 0,
    metadata: metadataWithGoalBoard({}, {
      consequence: {
        auto_apply_on_completion: true,
        success_device_access_state: 'approved_access',
        success_duration_minutes: 60,
      },
    }),
  };

  assert.equal(automaticDeviceAccessForCompletion(row, 50, NOW), null);
});

test('Already completed accountability goal does not reopen access repeatedly', () => {
  const row = {
    id: 32,
    title: 'Wake up on time',
    progress_percent: 100,
    metadata: metadataWithGoalBoard({}, {
      consequence: {
        auto_apply_on_completion: true,
        success_device_access_state: 'approved_access',
        success_duration_minutes: 60,
      },
    }),
  };

  assert.equal(automaticDeviceAccessForCompletion(row, 100, NOW), null);
});
