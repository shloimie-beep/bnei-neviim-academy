const GOAL_BOARD_SOURCES = new Set(['self', 'admin', 'classroom', 'private_meeting']);
const GOAL_BOARD_URGENCIES = new Set(['urgent', 'today', 'this_week', 'low']);
const GOAL_BOARD_STATUSES = new Set(['active', 'waiting', 'done', 'overdue', 'archived']);
const GOAL_BOARD_APPROVAL_STATUSES = new Set(['none', 'pending_review', 'approved', 'denied']);
const CONSEQUENCE_STATUSES = new Set(['none', 'pending_review', 'approved', 'denied', 'overridden', 'resolved']);

function parseMetadata(metadata) {
  if (!metadata) return {};
  if (typeof metadata === 'object' && !Array.isArray(metadata)) return metadata;
  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cleanString(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function cleanEnum(value, allowed, fallback) {
  const normalized = cleanString(value).toLowerCase();
  return allowed.has(normalized) ? normalized : fallback;
}

function asBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
}

function optionalNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundedPercent(value, fallback = 0) {
  const number = Number(value);
  const percent = Number.isFinite(number) ? number : fallback;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function isoOrNull(value) {
  const text = cleanString(value);
  if (!text) return null;
  const date = new Date(text);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString();
}

function dateOnly(value, now = new Date()) {
  const date = value ? new Date(value) : now;
  if (!Number.isFinite(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function mergeObjects(base, next) {
  return {
    ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}),
    ...(next && typeof next === 'object' && !Array.isArray(next) ? next : {}),
  };
}

function rawGoalBoardMetadata(metadata) {
  const parsed = parseMetadata(metadata);
  const nested = parsed.goal_board;
  return nested && typeof nested === 'object' && !Array.isArray(nested) ? nested : parsed;
}

function metadataWithGoalBoard(existingMetadata, goalBoardMetadata) {
  const parsed = parseMetadata(existingMetadata);
  return {
    ...parsed,
    goal_board: normalizeGoalBoardMetadata(goalBoardMetadata, rawGoalBoardMetadata(parsed)),
  };
}

function normalizeGoalBoardMetadata(input = {}, previous = {}) {
  const source = cleanEnum(input.source ?? previous.source, GOAL_BOARD_SOURCES, 'admin');
  const approvalRequired = asBoolean(input.approval_required, asBoolean(previous.approval_required, false));
  const defaultApproval = approvalRequired ? 'pending_review' : 'approved';
  const approvalStatus = cleanEnum(
    input.approval_status ?? previous.approval_status,
    GOAL_BOARD_APPROVAL_STATUSES,
    defaultApproval
  );
  const previousClassroom = previous.classroom || {};
  const inputClassroom = input.classroom || {};
  const previousConsequence = previous.consequence || {};
  const inputConsequence = input.consequence || {};
  const consequenceApprovalRequired = asBoolean(
    inputConsequence.approval_required ?? input.consequence_approval_required,
    asBoolean(previousConsequence.approval_required, true)
  );

  return {
    board: 'student_goal_board',
    source,
    category: cleanString(input.category ?? previous.category ?? input.topic ?? previous.topic, ''),
    urgency: cleanEnum(input.urgency ?? previous.urgency, GOAL_BOARD_URGENCIES, 'this_week'),
    status: cleanEnum(input.status ?? previous.status, GOAL_BOARD_STATUSES, approvalRequired && approvalStatus === 'pending_review' ? 'waiting' : 'active'),
    due_at: isoOrNull(input.due_at ?? previous.due_at),
    optional_scheduled_at: isoOrNull(input.optional_scheduled_at ?? previous.optional_scheduled_at),
    student_owned: asBoolean(input.student_owned, source === 'self' ? true : asBoolean(previous.student_owned, false)),
    school_tracked: asBoolean(input.school_tracked, asBoolean(previous.school_tracked, false)),
    approval_required: approvalRequired,
    approval_status: approvalStatus,
    student_summary: cleanString(input.student_summary ?? previous.student_summary, ''),
    private_note: cleanString(input.private_note ?? previous.private_note, ''),
    reflection_note: cleanString(input.reflection_note ?? previous.reflection_note, ''),
    checklist: Array.isArray(input.checklist)
      ? input.checklist.map((item) => cleanString(item)).filter(Boolean)
      : Array.isArray(previous.checklist) ? previous.checklist : [],
    classroom: {
      youtube_url: cleanString(inputClassroom.youtube_url ?? input.youtube_url ?? previousClassroom.youtube_url, ''),
      work_type: cleanString(inputClassroom.work_type ?? input.work_type ?? previousClassroom.work_type, 'assignment'),
      state: cleanString(inputClassroom.state ?? input.classroom_state ?? previousClassroom.state, source === 'classroom' ? 'draft' : ''),
      alternate_link: cleanString(inputClassroom.alternate_link ?? input.classroom_link ?? previousClassroom.alternate_link, ''),
    },
    agreement: {
      type: cleanString(input.agreement?.type ?? input.agreement_type ?? previous.agreement?.type, ''),
      bedtime_time: cleanString(input.agreement?.bedtime_time ?? input.bedtime_time ?? previous.agreement?.bedtime_time, ''),
      wake_time: cleanString(input.agreement?.wake_time ?? input.wake_time ?? previous.agreement?.wake_time, ''),
      student_commitment: cleanString(input.agreement?.student_commitment ?? input.student_commitment ?? previous.agreement?.student_commitment, ''),
      chosen_consequence: cleanString(input.agreement?.chosen_consequence ?? input.chosen_consequence ?? previous.agreement?.chosen_consequence, ''),
    },
    consequence: {
      status: cleanEnum(
        inputConsequence.status ?? input.consequence_status ?? previousConsequence.status,
        CONSEQUENCE_STATUSES,
        'none'
      ),
      approval_required: consequenceApprovalRequired,
      recovery_path: cleanString(inputConsequence.recovery_path ?? input.recovery_path ?? previousConsequence.recovery_path, ''),
      device_access_state: cleanString(inputConsequence.device_access_state ?? input.device_access_state ?? previousConsequence.device_access_state, ''),
      duration_minutes: optionalNumber(inputConsequence.duration_minutes ?? input.duration_minutes ?? previousConsequence.duration_minutes),
      auto_apply_on_completion: asBoolean(
        inputConsequence.auto_apply_on_completion ?? input.auto_apply_on_completion,
        asBoolean(previousConsequence.auto_apply_on_completion, false)
      ),
      success_device_access_state: cleanString(
        inputConsequence.success_device_access_state ?? input.success_device_access_state ?? previousConsequence.success_device_access_state,
        ''
      ),
      success_duration_minutes: optionalNumber(
        inputConsequence.success_duration_minutes ?? input.success_duration_minutes ?? previousConsequence.success_duration_minutes
      ),
      success_applied_at: isoOrNull(inputConsequence.success_applied_at ?? input.success_applied_at ?? previousConsequence.success_applied_at),
      success_applied_by: cleanString(inputConsequence.success_applied_by ?? input.success_applied_by ?? previousConsequence.success_applied_by, ''),
      approved_by: cleanString(inputConsequence.approved_by ?? input.approved_by ?? previousConsequence.approved_by, ''),
      approved_at: isoOrNull(inputConsequence.approved_at ?? previousConsequence.approved_at),
      review_reason: cleanString(inputConsequence.review_reason ?? input.review_reason ?? previousConsequence.review_reason, ''),
    },
  };
}

function goalBoardStatus(row, now = new Date()) {
  const metadata = normalizeGoalBoardMetadata(rawGoalBoardMetadata(row?.metadata));
  const progress = roundedPercent(row?.progress_percent, 0);
  if (metadata.status === 'archived') return 'archived';
  if (progress >= 100 || metadata.status === 'done') return 'done';
  if (
    metadata.status === 'waiting' ||
    metadata.approval_status === 'pending_review' ||
    metadata.consequence.status === 'pending_review'
  ) {
    return 'waiting';
  }
  if (metadata.due_at && dateOnly(metadata.due_at) < dateOnly(null, now)) return 'overdue';
  return 'active';
}

function goalBoardBucket(row, now = new Date()) {
  const status = goalBoardStatus(row, now);
  if (status === 'archived') return 'archived';
  if (status === 'done') return 'done';
  if (status === 'waiting') return 'waiting';
  const metadata = normalizeGoalBoardMetadata(rawGoalBoardMetadata(row?.metadata));
  if (metadata.due_at && dateOnly(metadata.due_at) > dateOnly(null, now)) return 'upcoming';
  return 'today';
}

function goalBoardSourceLabel(source) {
  return ({
    self: 'Self',
    admin: 'Admin',
    classroom: 'Classroom',
    private_meeting: 'Private Meeting',
  })[source] || 'Admin';
}

function safeGoalBoardStudentView(row, now = new Date()) {
  const metadata = normalizeGoalBoardMetadata(rawGoalBoardMetadata(row?.metadata), {
    category: row?.topic || '',
  });
  const status = goalBoardStatus(row, now);
  const bucket = goalBoardBucket(row, now);
  return {
    id: row?.id,
    title: row?.title || 'Personal goal',
    category: metadata.category || row?.topic || '',
    urgency: metadata.urgency,
    due_at: metadata.due_at,
    optional_scheduled_at: metadata.optional_scheduled_at,
    source: metadata.source,
    source_label: goalBoardSourceLabel(metadata.source),
    status,
    bucket,
    progress_percent: row?.progress_percent === null || row?.progress_percent === undefined
      ? 0
      : roundedPercent(row.progress_percent),
    goal_target_value: row?.goal_target_value !== null && row?.goal_target_value !== undefined ? Number(row.goal_target_value) : null,
    goal_actual_value: row?.goal_actual_value !== null && row?.goal_actual_value !== undefined ? Number(row.goal_actual_value) : null,
    goal_unit: row?.goal_unit || '',
    student_owned: Boolean(metadata.student_owned),
    approval_required: Boolean(metadata.approval_required),
    approval_status: metadata.approval_status,
    student_summary: metadata.student_summary,
    reflection_note: metadata.reflection_note,
    checklist: metadata.checklist,
    classroom: metadata.source === 'classroom' ? {
      youtube_url: metadata.classroom.youtube_url,
      work_type: metadata.classroom.work_type,
      state: metadata.classroom.state,
      alternate_link: metadata.classroom.alternate_link,
    } : null,
    agreement: {
      type: metadata.agreement.type,
      bedtime_time: metadata.agreement.bedtime_time,
      wake_time: metadata.agreement.wake_time,
      student_commitment: metadata.agreement.student_commitment,
      chosen_consequence: metadata.agreement.chosen_consequence,
    },
    consequence: {
      status: metadata.consequence.status,
      approval_required: Boolean(metadata.consequence.approval_required),
      recovery_path: metadata.consequence.recovery_path,
      device_access_state: metadata.consequence.device_access_state,
      auto_apply_on_completion: Boolean(metadata.consequence.auto_apply_on_completion),
      success_device_access_state: metadata.consequence.success_device_access_state,
      success_duration_minutes: metadata.consequence.success_duration_minutes,
      success_applied_at: metadata.consequence.success_applied_at,
    },
    occurred_at: row?.occurred_at,
    updated_at: row?.updated_at,
  };
}

function automaticDeviceAccessForCompletion(row, nextProgressPercent, now = new Date()) {
  const metadata = normalizeGoalBoardMetadata(rawGoalBoardMetadata(row?.metadata));
  const previousProgress = roundedPercent(row?.progress_percent, 0);
  const nextProgress = roundedPercent(nextProgressPercent, 0);
  const consequence = metadata.consequence || {};

  if (previousProgress >= 100 || nextProgress < 100) return null;
  if (!consequence.auto_apply_on_completion) return null;
  if (!consequence.success_device_access_state) return null;

  return {
    status: consequence.success_device_access_state,
    durationMinutes: consequence.success_duration_minutes || consequence.duration_minutes || 60,
    reason: metadata.agreement?.student_commitment
      || metadata.student_summary
      || row?.title
      || 'Student completed accountability goal',
    appliedAt: now.toISOString(),
  };
}

function shouldCreatePendingConsequenceReview(row, nextProgressPercent, now = new Date()) {
  const metadata = normalizeGoalBoardMetadata(rawGoalBoardMetadata(row?.metadata));
  if (roundedPercent(nextProgressPercent) >= 100) return false;
  if (!metadata.due_at || dateOnly(metadata.due_at) >= dateOnly(null, now)) return false;
  if (!metadata.consequence.recovery_path && !metadata.consequence.device_access_state) return false;
  return metadata.consequence.approval_required !== false && metadata.consequence.status !== 'approved';
}

function metadataAfterProgressUpdate(row, nextProgressPercent, now = new Date()) {
  const existing = normalizeGoalBoardMetadata(rawGoalBoardMetadata(row?.metadata));
  const next = mergeObjects(existing, {});
  if (roundedPercent(nextProgressPercent) >= 100) {
    next.status = 'done';
    if (next.consequence.status === 'pending_review') {
      next.consequence = {
        ...next.consequence,
        status: 'resolved',
      };
    }
  } else if (shouldCreatePendingConsequenceReview(row, nextProgressPercent, now)) {
    next.status = 'waiting';
    next.consequence = {
      ...next.consequence,
      status: 'pending_review',
      approval_required: true,
      review_reason: 'Goal was missed or overdue. Admin/parent review is required before any consequence or device action.',
    };
  } else if (next.status === 'done') {
    next.status = 'active';
  }
  return metadataWithGoalBoard(row?.metadata, next);
}

module.exports = {
  GOAL_BOARD_SOURCES,
  GOAL_BOARD_URGENCIES,
  GOAL_BOARD_STATUSES,
  parseMetadata,
  rawGoalBoardMetadata,
  metadataWithGoalBoard,
  normalizeGoalBoardMetadata,
  goalBoardStatus,
  goalBoardBucket,
  goalBoardSourceLabel,
  safeGoalBoardStudentView,
  shouldCreatePendingConsequenceReview,
  metadataAfterProgressUpdate,
  automaticDeviceAccessForCompletion,
  roundedPercent,
  dateOnly,
};
