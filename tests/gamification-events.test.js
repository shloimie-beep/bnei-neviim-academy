const assert = require('node:assert/strict');
const test = require('node:test');

const {
  DEFAULT_GAMIFICATION_POINTS,
  courseEnrollmentSummary,
  gamificationIdempotencyKey,
  normalizeGamificationEventType,
  parentVisibleGamificationEvents,
  pointsForGamificationEventType,
  summarizeGamificationEvents,
} = require('../src/lib/bna/gamification');

test('default gamification points and legacy mappings are stable', () => {
  assert.equal(normalizeGamificationEventType('question'), 'ask_question');
  assert.equal(normalizeGamificationEventType('student_goal'), 'parent_visible_milestone');
  assert.equal(normalizeGamificationEventType('class_session'), 'class_attended');
  assert.equal(pointsForGamificationEventType('ask_question'), DEFAULT_GAMIFICATION_POINTS.ask_question);
  assert.equal(pointsForGamificationEventType('worksheet_submitted', 99), 99);
});

test('gamification idempotency keys are stable and do not include raw text', () => {
  const first = gamificationIdempotencyKey({
    event_type: 'question',
    student_id: 42,
    source: 'student portal',
    source_ref: 'bna_accountability_events:123',
    title: 'A very raw question title',
  });
  const second = gamificationIdempotencyKey({
    eventType: 'ask_question',
    studentId: 42,
    source: 'student-portal',
    sourceRef: 'bna_accountability_events:123',
    title: 'Different raw title',
  });
  assert.equal(first, second);
  assert.doesNotMatch(first, /very raw question/i);
});

test('parent-visible gamification filtering requires approval', () => {
  const rows = [
    { event_type: 'ask_question', points: 5, parent_visible: true, approval_status: 'pending' },
    { event_type: 'shoutout_received', points: 10, parent_visible: true, approval_status: 'approved' },
    { event_type: 'source_reviewed', points: 7, parent_visible: false, approval_status: 'approved' },
  ];
  assert.deepEqual(parentVisibleGamificationEvents(rows).map((row) => row.event_type), ['shoutout_received']);
});

test('gamification summary and course enrollment summary are compact', () => {
  assert.deepEqual(summarizeGamificationEvents([
    { event_type: 'ask_question', points: 5 },
    { event_type: 'worksheet_submitted', points: 10 },
    { event_type: 'question', points: 5 },
  ]), {
    total_points: 20,
    event_count: 3,
    by_type: {
      ask_question: 2,
      worksheet_submitted: 1,
    },
  });

  assert.deepEqual(courseEnrollmentSummary([
    { status: 'active', progress_percent: 50 },
    { status: 'completed', progress_percent: 100 },
    { status: 'archived', progress_percent: 100 },
  ]), {
    enrollment_count: 2,
    completed_count: 1,
    average_progress_percent: 75,
  });
});
