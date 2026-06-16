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
  DEFAULT_GAMIFICATION_POINTS,
  GAMIFICATION_EVENT_TYPES,
  LEGACY_EVENT_TYPE_MAP,
  courseEnrollmentSummary,
  gamificationIdempotencyKey,
  isApprovedParentVisible,
  normalizeGamificationEventType,
  parentVisibleGamificationEvents,
  pointsForGamificationEventType,
  summarizeGamificationEvents,
};
