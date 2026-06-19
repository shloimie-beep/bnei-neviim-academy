const GAMIFICATION_EVENT_TYPES = [
  'answer_question',
  'ask_question',
  'worksheet_completed',
  'worksheet_submitted',
  'answer_helpful',
  'class_attended',
  'source_reviewed',
  'shoutout_received',
  'referenced_in_class',
  'streak_continued',
  'parent_visible_milestone',
];

const LEGACY_EVENT_TYPE_MAP = {
  question: 'ask_question',
  student_question: 'ask_question',
  student_goal: 'parent_visible_milestone',
  goal_completed: 'parent_visible_milestone',
  class_session: 'class_attended',
  attendance: 'class_attended',
  learning_note: 'source_reviewed',
  source_sheet_reviewed: 'source_reviewed',
  shoutout: 'shoutout_received',
  reference: 'referenced_in_class',
};

const DEFAULT_GAMIFICATION_POINTS = {
  answer_question: 8,
  ask_question: 5,
  worksheet_completed: 15,
  worksheet_submitted: 10,
  answer_helpful: 12,
  class_attended: 6,
  source_reviewed: 7,
  shoutout_received: 10,
  referenced_in_class: 8,
  streak_continued: 3,
  parent_visible_milestone: 12,
};

const ONE_TIME_GAMIFICATION_REQUIREMENT_ID = 'REQ-20260619-310';

const DEFAULT_BADGE_THRESHOLDS = {
  five_on_time_classes: 5,
  three_week_consistency: 3,
  chazarah_streak_events: 3,
};

const AUTOMATIC_BADGE_DEFINITIONS = [
  {
    slug: 'first_class',
    title: 'First Class',
    description: 'Attended the first reviewed One Time class session.',
    event_type: 'class_attended',
    points_required: 6,
    threshold_key: 'first_class',
    parent_safe_explanation: 'Attended a reviewed One Time class session.',
  },
  {
    slug: 'on_time',
    title: 'On Time',
    description: 'Joined a reviewed class on time.',
    event_type: 'class_attended',
    points_required: 6,
    threshold_key: 'on_time',
    parent_safe_explanation: 'Joined a reviewed class on time.',
  },
  {
    slug: 'five_on_time_classes',
    title: 'Five On-Time Classes',
    description: 'Joined five reviewed classes on time.',
    event_type: 'class_attended',
    points_required: 30,
    threshold_key: 'five_on_time_classes',
    parent_safe_explanation: 'Built consistency by joining reviewed classes on time.',
  },
  {
    slug: 'full_shiur',
    title: 'Full Shiur',
    description: 'Stayed through a full reviewed shiur.',
    event_type: 'class_attended',
    points_required: 6,
    threshold_key: 'full_shiur',
    parent_safe_explanation: 'Stayed through a full reviewed shiur.',
  },
  {
    slug: 'three_week_consistency',
    title: 'Three-Week Consistency',
    description: 'Participated across three reviewed learning weeks.',
    event_type: 'streak_continued',
    points_required: 9,
    threshold_key: 'three_week_consistency',
    parent_safe_explanation: 'Showed steady reviewed participation across multiple weeks.',
  },
  {
    slug: 'first_review',
    title: 'First Review',
    description: 'Completed the first reviewed chazarah/source review activity.',
    event_type: 'source_reviewed',
    points_required: 7,
    threshold_key: 'first_review',
    parent_safe_explanation: 'Completed a reviewed learning review activity.',
  },
  {
    slug: 'chazarah_streak',
    title: 'Chazarah Streak',
    description: 'Continued a reviewed chazarah streak.',
    event_type: 'streak_continued',
    points_required: 9,
    threshold_key: 'chazarah_streak',
    parent_safe_explanation: 'Kept a reviewed chazarah streak going.',
  },
  {
    slug: 'perek_completed',
    title: 'Perek Completed',
    description: 'Completed a reviewed perek milestone.',
    event_type: 'parent_visible_milestone',
    points_required: 12,
    threshold_key: 'perek_completed',
    parent_safe_explanation: 'Completed a reviewed perek milestone.',
  },
  {
    slug: 'masechta_completed',
    title: 'Masechta Completed',
    description: 'Completed a reviewed Masechta milestone.',
    event_type: 'parent_visible_milestone',
    points_required: 12,
    threshold_key: 'masechta_completed',
    parent_safe_explanation: 'Completed a reviewed Masechta milestone.',
  },
  {
    slug: 'watched_missed_class',
    title: 'Watched the Missed Class',
    description: 'Caught up on a missed class through reviewed recording watch progress.',
    event_type: 'parent_visible_milestone',
    points_required: 12,
    threshold_key: 'watched_missed_class',
    parent_safe_explanation: 'Caught up on a missed class through a reviewed recording.',
  },
  {
    slug: 'comeback',
    title: 'Comeback',
    description: 'Returned to reviewed participation after a gap.',
    event_type: 'parent_visible_milestone',
    points_required: 12,
    threshold_key: 'comeback',
    parent_safe_explanation: 'Returned to reviewed participation after a gap.',
  },
];

const RABBI_AWARDED_BADGE_DEFINITIONS = [
  ['thoughtful_question', 'Thoughtful Question', 'Asked a thoughtful reviewed question.', 'ask_question'],
  ['clear_explanation', 'Clear Explanation', 'Explained a Torah idea clearly after review.', 'answer_question'],
  ['strong_source_work', 'Strong Source Work', 'Used sources carefully after review.', 'source_reviewed'],
  ['excellent_preparation', 'Excellent Preparation', 'Prepared well for shiur after review.', 'worksheet_completed'],
  ['helped_the_class', 'Helped the Class', 'Helped the class learn after Rabbi review.', 'referenced_in_class'],
  ['exceptional_improvement', 'Exceptional Improvement', 'Showed exceptional improvement after review.', 'parent_visible_milestone'],
].map(([slug, title, description, eventType]) => ({
  slug,
  title,
  description,
  event_type: eventType,
  points_required: DEFAULT_GAMIFICATION_POINTS[eventType] || 0,
  threshold_key: slug,
  parent_safe_explanation: description,
}));

function normalizeToken(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeGamificationEventType(value = '') {
  const normalized = normalizeToken(value);
  const mapped = LEGACY_EVENT_TYPE_MAP[normalized] || normalized;
  return GAMIFICATION_EVENT_TYPES.includes(mapped) ? mapped : 'parent_visible_milestone';
}

function pointsForGamificationEventType(value = '', override = undefined) {
  const numeric = Number(override);
  if (Number.isFinite(numeric) && numeric >= 0) return Math.round(numeric);
  return DEFAULT_GAMIFICATION_POINTS[normalizeGamificationEventType(value)] || 0;
}

function oneTimeBadgeDefinitions() {
  return [
    ...AUTOMATIC_BADGE_DEFINITIONS.map((badge) => ({ ...badge, award_mode: 'automatic' })),
    ...RABBI_AWARDED_BADGE_DEFINITIONS.map((badge) => ({ ...badge, award_mode: 'rabbi_awarded' })),
  ];
}

function badgeDefinitionBySlug(slug = '') {
  const normalized = normalizeToken(slug);
  return oneTimeBadgeDefinitions().find((badge) => badge.slug === normalized) || null;
}

function parseMetadata(value = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function eventDateKey(event = {}) {
  const date = new Date(event.occurred_at || event.occurredAt || event.created_at || event.createdAt || '');
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function eventWeekKey(event = {}) {
  const date = new Date(event.occurred_at || event.occurredAt || event.created_at || event.createdAt || '');
  if (Number.isNaN(date.getTime())) return '';
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diff = Math.floor((date - start) / 86400000);
  return `${date.getUTCFullYear()}-W${String(Math.floor(diff / 7) + 1).padStart(2, '0')}`;
}

function normalizedGamificationEvents(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((row, index) => {
    const metadata = parseMetadata(row.metadata);
    return {
      event_ref: String(row.idempotency_key || row.idempotencyKey || row.source_ref || row.sourceRef || row.id || `event_${index + 1}`),
      student_id: Number(row.student_id || row.studentId || 0) || null,
      event_type: normalizeGamificationEventType(row.event_type || row.eventType),
      points: pointsForGamificationEventType(row.event_type || row.eventType, row.points),
      approval_status: normalizeToken(row.approval_status || row.approvalStatus || 'approved'),
      parent_visible: row.parent_visible === true,
      visibility: normalizeToken(row.visibility || 'student'),
      source: normalizeToken(row.source || 'manual'),
      source_ref: String(row.source_ref || row.sourceRef || row.idempotency_key || row.idempotencyKey || ''),
      class_session_id: Number(row.class_session_id || row.classSessionId || 0) || null,
      course_id: Number(row.course_id || row.courseId || 0) || null,
      metadata,
      date_key: eventDateKey(row),
      week_key: eventWeekKey(row),
    };
  });
}

function badgeStats(events = []) {
  const rows = normalizedGamificationEvents(events).filter((event) => event.approval_status === 'approved');
  const onTime = rows.filter((event) => (
    event.event_type === 'class_attended' &&
    (
      event.metadata.on_time === true ||
      event.metadata.arrived_on_time === true ||
      normalizeToken(event.metadata.attendance_status || event.metadata.status) === 'on_time'
    )
  ));
  const fullShiur = rows.filter((event) => (
    event.event_type === 'class_attended' &&
    (
      event.metadata.full_shiur === true ||
      event.metadata.full_session === true ||
      normalizeToken(event.metadata.attendance_status || event.metadata.status) === 'full_shiur'
    )
  ));
  const milestoneType = (event) => normalizeToken(event.metadata.milestone_type || event.metadata.milestone || event.metadata.badge_signal);
  return {
    approved_event_count: rows.length,
    class_attended_count: rows.filter((event) => event.event_type === 'class_attended').length,
    on_time_count: onTime.length,
    full_shiur_count: fullShiur.length,
    review_count: rows.filter((event) => ['source_reviewed', 'worksheet_completed', 'worksheet_submitted'].includes(event.event_type)).length,
    chazarah_streak_events: rows.filter((event) => event.event_type === 'streak_continued' || Number(event.metadata.chazarah_streak_days || 0) > 0).length,
    consistency_weeks: new Set(rows.filter((event) => event.event_type === 'class_attended' || event.event_type === 'streak_continued').map((event) => event.week_key).filter(Boolean)).size,
    perek_completed_count: rows.filter((event) => milestoneType(event) === 'perek_completed').length,
    masechta_completed_count: rows.filter((event) => milestoneType(event) === 'masechta_completed').length,
    watched_missed_class_count: rows.filter((event) => milestoneType(event) === 'watched_missed_class' || event.metadata.watched_missed_class === true).length,
    comeback_count: rows.filter((event) => milestoneType(event) === 'comeback' || event.metadata.comeback === true).length,
  };
}

function existingBadgeSlugs(badges = []) {
  return new Set((Array.isArray(badges) ? badges : [])
    .filter((badge) => normalizeToken(badge.status || 'active') === 'active')
    .map((badge) => normalizeToken(badge.slug || badge.badge_slug || badge.title))
    .filter(Boolean));
}

function badgeThresholds(overrides = {}) {
  const input = overrides && typeof overrides === 'object' ? overrides : {};
  return {
    ...DEFAULT_BADGE_THRESHOLDS,
    five_on_time_classes: Math.max(1, Number(input.five_on_time_classes || DEFAULT_BADGE_THRESHOLDS.five_on_time_classes)),
    three_week_consistency: Math.max(1, Number(input.three_week_consistency || DEFAULT_BADGE_THRESHOLDS.three_week_consistency)),
    chazarah_streak_events: Math.max(1, Number(input.chazarah_streak_events || DEFAULT_BADGE_THRESHOLDS.chazarah_streak_events)),
  };
}

function automaticBadgeSatisfied(slug, stats = {}, thresholds = {}) {
  const config = badgeThresholds(thresholds);
  return ({
    first_class: stats.class_attended_count >= 1,
    on_time: stats.on_time_count >= 1,
    five_on_time_classes: stats.on_time_count >= config.five_on_time_classes,
    full_shiur: stats.full_shiur_count >= 1,
    three_week_consistency: stats.consistency_weeks >= config.three_week_consistency,
    first_review: stats.review_count >= 1,
    chazarah_streak: stats.chazarah_streak_events >= config.chazarah_streak_events,
    perek_completed: stats.perek_completed_count >= 1,
    masechta_completed: stats.masechta_completed_count >= 1,
    watched_missed_class: stats.watched_missed_class_count >= 1,
    comeback: stats.comeback_count >= 1,
  })[slug] === true;
}

function badgeAwardIdempotencyKey({ student_id: studentId, badge_slug: badgeSlug, source_event_ref: sourceEventRef = 'review' } = {}) {
  return ['badge_award', `student_${Number(studentId) || 'unknown'}`, normalizeToken(badgeSlug || 'badge'), normalizeToken(sourceEventRef || 'review')].join(':');
}

function badgeReversalIdempotencyKey({ student_id: studentId, badge_slug: badgeSlug, reversal_ref: reversalRef = 'manual' } = {}) {
  return ['badge_reversal', `student_${Number(studentId) || 'unknown'}`, normalizeToken(badgeSlug || 'badge'), normalizeToken(reversalRef || 'manual')].join(':');
}

function buildBadgeAwardDraft(input = {}) {
  const badge = badgeDefinitionBySlug(input.badge_slug || input.badgeSlug || input.slug) || {
    slug: normalizeToken(input.badge_slug || input.badgeSlug || input.slug || 'badge'),
    title: String(input.title || 'Badge'),
    award_mode: normalizeToken(input.award_mode || input.awardMode || 'manual'),
    parent_safe_explanation: 'A reviewed badge is ready for approval.',
  };
  const studentId = Number(input.student_id || input.studentId || 0) || null;
  const sourceEvent = input.source_event || input.sourceEvent || {};
  const sourceRef = String(input.source_event_ref || input.sourceEventRef || sourceEvent.idempotency_key || sourceEvent.id || badge.slug);
  return {
    requirement_id: ONE_TIME_GAMIFICATION_REQUIREMENT_ID,
    badge_slug: badge.slug,
    badge_title: badge.title,
    award_mode: badge.award_mode || normalizeToken(input.award_mode || input.awardMode || 'manual'),
    student_id: studentId,
    status: badge.award_mode === 'rabbi_awarded' ? 'requires_rabbi_approval' : 'ready_for_review',
    idempotency_key: badgeAwardIdempotencyKey({ student_id: studentId, badge_slug: badge.slug, source_event_ref: sourceRef }),
    parent_safe_explanation: badge.parent_safe_explanation || badge.description || 'Reviewed learning progress badge.',
    reason: badge.parent_safe_explanation || badge.description || 'Reviewed learning progress badge.',
    evidence: {
      source_event_type: normalizeGamificationEventType(sourceEvent.event_type || sourceEvent.eventType || badge.event_type),
      source_event_ref_present: Boolean(sourceRef),
      class_session_id: Number(sourceEvent.class_session_id || sourceEvent.classSessionId || input.class_session_id || input.classSessionId || 0) || null,
      source_ref: sourceRef ? normalizeToken(sourceRef).slice(0, 120) : '',
    },
    write_enabled: false,
    external_write_performed: false,
    production_mutation_performed: false,
  };
}

function buildBadgeReversalDraft(input = {}) {
  const badgeSlug = normalizeToken(input.badge_slug || input.badgeSlug || input.slug || 'badge');
  const studentId = Number(input.student_id || input.studentId || 0) || null;
  const reason = String(input.reversal_reason || input.reversalReason || input.reason || '').trim();
  return {
    requirement_id: ONE_TIME_GAMIFICATION_REQUIREMENT_ID,
    badge_slug: badgeSlug,
    student_id: studentId,
    status: reason ? 'ready_for_human_review' : 'needs_reversal_reason',
    idempotency_key: badgeReversalIdempotencyKey({ student_id: studentId, badge_slug: badgeSlug, reversal_ref: input.reversal_ref || input.reversalRef || reason || 'manual' }),
    reversal_reason_present: Boolean(reason),
    parent_safe_explanation: 'A badge reversal is under human review.',
    write_enabled: false,
    external_write_performed: false,
    production_mutation_performed: false,
  };
}

function evaluateAutomaticBadgeAwards(input = {}) {
  const stats = badgeStats(input.events || []);
  const existing = existingBadgeSlugs(input.existing_badges || input.existingBadges || []);
  const studentId = Number(input.student_id || input.studentId || normalizedGamificationEvents(input.events || [])[0]?.student_id || 0) || null;
  return AUTOMATIC_BADGE_DEFINITIONS
    .filter((badge) => !existing.has(badge.slug))
    .filter((badge) => automaticBadgeSatisfied(badge.slug, stats, input.thresholds || {}))
    .map((badge) => buildBadgeAwardDraft({
      student_id: studentId,
      badge_slug: badge.slug,
      source_event_ref: `${badge.slug}:${stats.approved_event_count}`,
      source_event: { event_type: badge.event_type },
    }));
}

function buildGamificationBadgeReadiness(input = {}) {
  const events = input.events || [];
  const thresholds = badgeThresholds(input.thresholds || {});
  const automaticCandidates = evaluateAutomaticBadgeAwards(input);
  const rabbiAwardDrafts = (Array.isArray(input.rabbi_awards || input.rabbiAwards) ? (input.rabbi_awards || input.rabbiAwards) : [])
    .map((award) => buildBadgeAwardDraft({ ...award, award_mode: 'rabbi_awarded' }))
    .filter((award) => RABBI_AWARDED_BADGE_DEFINITIONS.some((badge) => badge.slug === award.badge_slug));
  const reversalDrafts = (Array.isArray(input.reversals) ? input.reversals : []).map(buildBadgeReversalDraft);
  return {
    requirement_id: ONE_TIME_GAMIFICATION_REQUIREMENT_ID,
    status: 'needs_operator_decision',
    preview_only: true,
    external_write_performed: false,
    production_mutation_performed: false,
    definitions: {
      automatic_badges: AUTOMATIC_BADGE_DEFINITIONS.map((badge) => badge.slug),
      rabbi_awarded_badges: RABBI_AWARDED_BADGE_DEFINITIONS.map((badge) => badge.slug),
      thresholds,
    },
    sections: [
      { key: 'automatic_badges', label: 'Automatic Badges', status: 'local_contract_present' },
      { key: 'rabbi_awarded_badges', label: 'Rabbi-Awarded Badges', status: 'local_contract_present' },
      { key: 'configurable_thresholds', label: 'Configurable Thresholds', status: 'local_contract_present' },
      { key: 'idempotency', label: 'Idempotency', status: 'preview_ready' },
      { key: 'source_event_evidence', label: 'Source Event And Evidence', status: 'preview_ready' },
      { key: 'parent_safe_explanation', label: 'Parent-Safe Explanation', status: 'preview_ready' },
      { key: 'manual_reversal', label: 'Manual Reversal', status: 'preview_ready' },
      { key: 'audit_trail', label: 'Audit Trail', status: 'blocked_live_release' },
      { key: 'no_public_leaderboard', label: 'No Public Individual Leaderboard', status: 'guarded' },
    ],
    stats: badgeStats(events),
    award_candidates: {
      automatic: automaticCandidates,
      rabbi_awarded: rabbiAwardDrafts,
      reversals: reversalDrafts,
    },
    gates: {
      automatic_badge_write_enabled: false,
      rabbi_badge_write_enabled: false,
      reversal_write_enabled: false,
      public_individual_leaderboard_enabled: false,
      external_notification_enabled: false,
      prize_coupon_credit_enabled: false,
      live_badge_smoke_complete: false,
    },
    blockers: [
      'Production badge award/reversal writes, live badge smoke, and parent/student readback require explicit operator approval.',
      'No public individual leaderboard, negative points, automatic prizes, coupons, discounts, credits, access grants, or external notifications are enabled.',
    ],
  };
}

function gamificationIdempotencyKey(input = {}) {
  const eventType = normalizeGamificationEventType(input.event_type || input.eventType || input.type);
  const studentId = Number(input.student_id || input.studentId || 0) || 'unknown';
  const source = normalizeToken(input.source || 'manual');
  const sourceRef = normalizeToken(
    input.idempotency_key ||
    input.idempotencyKey ||
    input.source_ref ||
    input.sourceRef ||
    input.worksheet_submission_id ||
    input.worksheetSubmissionId ||
    input.assignment_student_id ||
    input.assignmentStudentId ||
    input.class_session_id ||
    input.classSessionId ||
    input.reference_id ||
    input.referenceId ||
    input.occurred_at ||
    input.occurredAt ||
    'manual'
  );
  return [eventType, `student_${studentId}`, source, sourceRef].join(':');
}

function isApprovedParentVisible(row = {}) {
  const approvalStatus = normalizeToken(row.approval_status || row.approvalStatus || 'draft');
  return row.parent_visible === true && approvalStatus === 'approved';
}

function parentVisibleGamificationEvents(rows = []) {
  return (Array.isArray(rows) ? rows : []).filter(isApprovedParentVisible);
}

function summarizeGamificationEvents(rows = []) {
  const summary = {
    total_points: 0,
    event_count: 0,
    by_type: {},
  };
  for (const row of Array.isArray(rows) ? rows : []) {
    const eventType = normalizeGamificationEventType(row.event_type || row.eventType);
    const points = Number(row.points || 0);
    summary.total_points += Number.isFinite(points) ? points : 0;
    summary.event_count += 1;
    summary.by_type[eventType] = (summary.by_type[eventType] || 0) + 1;
  }
  return summary;
}

function courseEnrollmentSummary(enrollments = []) {
  const rows = Array.isArray(enrollments) ? enrollments : [];
  const active = rows.filter((row) => !['dropped', 'archived'].includes(normalizeToken(row.status)));
  const completed = active.filter((row) => normalizeToken(row.status) === 'completed' || Number(row.progress_percent || 0) >= 100);
  const averageProgress = active.length
    ? Math.round(active.reduce((sum, row) => sum + Math.max(0, Math.min(100, Number(row.progress_percent || 0))), 0) / active.length)
    : 0;
  return {
    enrollment_count: active.length,
    completed_count: completed.length,
    average_progress_percent: averageProgress,
  };
}

module.exports = {
  AUTOMATIC_BADGE_DEFINITIONS,
  DEFAULT_GAMIFICATION_POINTS,
  DEFAULT_BADGE_THRESHOLDS,
  GAMIFICATION_EVENT_TYPES,
  LEGACY_EVENT_TYPE_MAP,
  ONE_TIME_GAMIFICATION_REQUIREMENT_ID,
  RABBI_AWARDED_BADGE_DEFINITIONS,
  badgeAwardIdempotencyKey,
  badgeReversalIdempotencyKey,
  badgeStats,
  buildBadgeAwardDraft,
  buildBadgeReversalDraft,
  buildGamificationBadgeReadiness,
  courseEnrollmentSummary,
  evaluateAutomaticBadgeAwards,
  gamificationIdempotencyKey,
  isApprovedParentVisible,
  normalizeGamificationEventType,
  oneTimeBadgeDefinitions,
  parentVisibleGamificationEvents,
  pointsForGamificationEventType,
  summarizeGamificationEvents,
};
