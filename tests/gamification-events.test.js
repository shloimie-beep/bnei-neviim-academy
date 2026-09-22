const assert = require('node:assert/strict');
const test = require('node:test');

const {
  AUTOMATIC_BADGE_DEFINITIONS,
  DEFAULT_GAMIFICATION_POINTS,
  RABBI_AWARDED_BADGE_DEFINITIONS,
  badgeAwardIdempotencyKey,
  badgeReversalIdempotencyKey,
  buildBadgeAwardDraft,
  buildBadgeReversalDraft,
  buildGamificationBadgeReadiness,
  courseEnrollmentSummary,
  evaluateAutomaticBadgeAwards,
  gamificationIdempotencyKey,
  normalizeGamificationEventType,
  oneTimeBadgeDefinitions,
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

test('One Time badge catalog covers automatic and Rabbi-awarded requirements', () => {
  const definitions = oneTimeBadgeDefinitions();
  const slugs = definitions.map((badge) => badge.slug);
  [
    'first_class',
    'on_time',
    'five_on_time_classes',
    'full_shiur',
    'three_week_consistency',
    'first_review',
    'chazarah_streak',
    'perek_completed',
    'masechta_completed',
    'watched_missed_class',
    'comeback',
    'thoughtful_question',
    'clear_explanation',
    'strong_source_work',
    'excellent_preparation',
    'helped_the_class',
    'exceptional_improvement',
  ].forEach((slug) => assert.ok(slugs.includes(slug), `${slug} should be defined`));
  assert.equal(AUTOMATIC_BADGE_DEFINITIONS.length, 11);
  assert.equal(RABBI_AWARDED_BADGE_DEFINITIONS.length, 6);
});

test('automatic badge evaluation uses thresholds, existing badges, and stable idempotency', () => {
  const candidates = evaluateAutomaticBadgeAwards({
    student_id: 42,
    existing_badges: [{ slug: 'first_class', status: 'active' }],
    events: [
      { event_type: 'class_attended', student_id: 42, points: 6, approval_status: 'approved', metadata: { on_time: true, full_shiur: true }, occurred_at: '2026-06-01T10:00:00Z' },
      { event_type: 'class_attended', student_id: 42, points: 6, approval_status: 'approved', metadata: { on_time: true }, occurred_at: '2026-06-08T10:00:00Z' },
      { event_type: 'class_attended', student_id: 42, points: 6, approval_status: 'approved', metadata: { on_time: true }, occurred_at: '2026-06-15T10:00:00Z' },
      { event_type: 'class_attended', student_id: 42, points: 6, approval_status: 'approved', metadata: { on_time: true }, occurred_at: '2026-06-22T10:00:00Z' },
      { event_type: 'class_attended', student_id: 42, points: 6, approval_status: 'approved', metadata: { on_time: true }, occurred_at: '2026-06-29T10:00:00Z' },
      { event_type: 'source_reviewed', student_id: 42, points: 7, approval_status: 'approved', occurred_at: '2026-06-30T10:00:00Z' },
      { event_type: 'parent_visible_milestone', student_id: 42, points: 12, approval_status: 'approved', metadata: { milestone_type: 'perek_completed' } },
    ],
  });
  const slugs = candidates.map((candidate) => candidate.badge_slug);
  assert.equal(slugs.includes('first_class'), false);
  assert.ok(slugs.includes('on_time'));
  assert.ok(slugs.includes('five_on_time_classes'));
  assert.ok(slugs.includes('full_shiur'));
  assert.ok(slugs.includes('three_week_consistency'));
  assert.ok(slugs.includes('first_review'));
  assert.ok(slugs.includes('perek_completed'));
  candidates.forEach((candidate) => {
    assert.equal(candidate.write_enabled, false);
    assert.match(candidate.idempotency_key, /^badge_award:student_42:/);
  });
});

test('badge award and reversal drafts are review-only and parent safe', () => {
  const rawPrivateReason = 'Student privately shared a sensitive anxiety note.';
  const award = buildBadgeAwardDraft({
    student_id: 7,
    badge_slug: 'thoughtful_question',
    source_event_ref: 'bna_course_question_responses:77',
    reason: rawPrivateReason,
  });
  const reversal = buildBadgeReversalDraft({
    student_id: 7,
    badge_slug: 'thoughtful_question',
    reversal_reason: 'Entered for the wrong student.',
  });

  assert.equal(award.status, 'requires_rabbi_approval');
  assert.equal(award.write_enabled, false);
  assert.equal(award.external_write_performed, false);
  assert.equal(reversal.status, 'ready_for_human_review');
  assert.equal(reversal.write_enabled, false);
  assert.equal(reversal.reversal_reason_present, true);
  assert.equal(
    badgeAwardIdempotencyKey({ student_id: 7, badge_slug: 'thoughtful_question', source_event_ref: 'response 77' }),
    badgeAwardIdempotencyKey({ student_id: 7, badge_slug: 'Thoughtful Question', source_event_ref: 'response-77' })
  );
  assert.equal(
    badgeReversalIdempotencyKey({ student_id: 7, badge_slug: 'thoughtful_question', reversal_ref: 'wrong student' }),
    badgeReversalIdempotencyKey({ student_id: 7, badge_slug: 'Thoughtful Question', reversal_ref: 'wrong-student' })
  );
  assert.doesNotMatch(JSON.stringify(award), /sensitive anxiety note/i);
});

test('gamification badge readiness exposes implemented read-only pipelines and blocks public leaderboards', () => {
  const readiness = buildGamificationBadgeReadiness({
    student_id: 7,
    events: [
      { event_type: 'class_attended', student_id: 7, points: 6, approval_status: 'approved', metadata: { on_time: true, full_shiur: true } },
      { event_type: 'source_reviewed', student_id: 7, points: 7, approval_status: 'approved' },
    ],
    rabbi_awards: [{ student_id: 7, badge_slug: 'clear_explanation', source_event_ref: 'review:5' }],
    reversals: [{ student_id: 7, badge_slug: 'clear_explanation', reversal_reason: 'Duplicate review.' }],
  });

  assert.equal(readiness.requirement_id, 'REQ-20260619-310');
  assert.equal(readiness.status, 'implemented_read_only');
  assert.equal(readiness.preview_only, true);
  assert.equal(readiness.external_write_performed, false);
  assert.equal(readiness.production_mutation_performed, false);
  assert.equal(readiness.event_driven_award_pipeline_enabled, true);
  assert.equal(readiness.manual_reversal_pipeline_enabled, true);
  assert.equal(readiness.gates.readiness_route_award_write_enabled, false);
  assert.equal(readiness.gates.readiness_route_reversal_write_enabled, false);
  assert.equal(readiness.gates.public_individual_leaderboard_enabled, false);
  assert.equal(readiness.gates.external_notification_enabled, false);
  assert.equal(readiness.gates.prize_coupon_credit_enabled, false);
  assert.equal(readiness.gates.automatic_access_grant_enabled, false);
  assert.equal(readiness.definitions.automatic_badges.length, 11);
  assert.equal(readiness.definitions.rabbi_awarded_badges.length, 6);
  assert.equal(readiness.award_candidates.rabbi_awarded[0].badge_slug, 'clear_explanation');
  assert.equal(readiness.award_candidates.reversals[0].status, 'ready_for_human_review');
  assert.equal(readiness.blockers.length, 0);
  assert.match(readiness.guardrails.join(' '), /No public individual leaderboard/);
});
