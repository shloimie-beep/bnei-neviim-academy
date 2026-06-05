const GOAL_TYPES = {
  LISTENING: 'LISTENING',
  INSIDE: 'INSIDE',
};

function normalizeGoalType(goalType) {
  const normalized = String(goalType || '').trim().toUpperCase();
  if (!GOAL_TYPES[normalized]) {
    throw new Error('goal_type must be LISTENING or INSIDE');
  }
  return normalized;
}

function toFiniteNumber(value, fieldName) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return numeric;
}

function validateNonNegativeMinutes(value, fieldName) {
  const numeric = toFiniteNumber(value ?? 0, fieldName);
  if (numeric < 0) {
    throw new Error(`${fieldName} cannot be negative`);
  }
  return numeric;
}

function validatePositiveNumber(value, fieldName) {
  const numeric = toFiniteNumber(value, fieldName);
  if (numeric <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return numeric;
}

function validateGoalMinutes(goalMinutes) {
  return validatePositiveNumber(goalMinutes, 'goal_minutes');
}

function capPercentage(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function normalizeGoalTypeLoose(goalType, fallback = GOAL_TYPES.LISTENING) {
  const fallbackType = GOAL_TYPES[String(fallback || '').trim().toUpperCase()]
    ? String(fallback || '').trim().toUpperCase()
    : GOAL_TYPES.LISTENING;
  const normalized = String(goalType || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (GOAL_TYPES[normalized]) return normalized;
  if (['INSIDE', 'FOLLOW', 'FOLLOWING', 'TEXT', 'SEFER'].some((token) => normalized.includes(token))) {
    return GOAL_TYPES.INSIDE;
  }
  if (['LISTEN', 'LISTENING', 'HEARD', 'HEARING'].some((token) => normalized.includes(token))) {
    return GOAL_TYPES.LISTENING;
  }
  return fallbackType;
}

function optionalNonNegativeNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return numeric;
}

function firstNonNegativeNumber(source, keys = []) {
  for (const key of keys) {
    const value = optionalNonNegativeNumber(source?.[key]);
    if (value !== null) return value;
  }
  return null;
}

function firstProgressPercent(source, keys = []) {
  for (const key of keys) {
    if (source?.[key] === undefined || source?.[key] === null || source?.[key] === '') continue;
    const numeric = Number(source[key]);
    if (!Number.isFinite(numeric)) continue;
    return Math.round(capPercentage(numeric));
  }
  return null;
}

function engagementLevelFromPercent(value) {
  if (value === null || value === undefined) return null;
  const percent = Number(value);
  if (!Number.isFinite(percent)) return null;
  if (percent >= 85) return 'high';
  if (percent >= 50) return 'medium';
  return 'low';
}

function normalizeParsedTorahEngagement(update = {}, options = {}) {
  const optionGoalMinutes = optionalNonNegativeNumber(options.goalMinutes ?? options.goal_minutes);
  const parsedGoalMinutes = firstNonNegativeNumber(update, [
    'goal_minutes',
    'target_minutes',
    'goal_target_minutes',
    'target_goal_minutes',
  ]);
  const goalMinutes = validateGoalMinutes(parsedGoalMinutes || optionGoalMinutes || 10);
  const goalType = normalizeGoalTypeLoose(
    update.goal_type || update.goalType || update.goal_kind,
    normalizeGoalTypeLoose(options.goalType || options.goal_type, GOAL_TYPES.LISTENING)
  );

  const insideValue = firstNonNegativeNumber(update, [
    'inside_engaged_minutes',
    'inside_following_minutes',
    'following_inside_minutes',
    'followed_inside_minutes',
    'following_minutes',
    'inside_minutes',
    'inside_time_minutes',
  ]);
  const halfListeningValue = firstNonNegativeNumber(update, [
    'listening_without_following_minutes',
    'inside_listening_minutes',
    'listening_only_minutes',
    'listening_not_following_minutes',
    'not_following_minutes',
  ]);
  const engagedListeningValue = firstNonNegativeNumber(update, [
    'engaged_listening_minutes',
    'listening_engaged_minutes',
    'active_listening_minutes',
  ]);
  const genericListeningValue = firstNonNegativeNumber(update, [
    'listening_minutes',
    'listened_minutes',
  ]);
  const distractedMinutes = firstNonNegativeNumber(update, [
    'distracted_minutes',
    'distraction_minutes',
    'off_task_minutes',
    'outside_minutes',
    'not_engaged_minutes',
  ]) || 0;
  const explicitTimerTotal = firstNonNegativeNumber(update, [
    'timer_total_minutes',
    'total_timer_minutes',
    'elapsed_minutes',
    'observed_minutes',
    'session_minutes',
  ]);

  let insideEngagedMinutes = insideValue || 0;
  let listeningWithoutFollowingMinutes = halfListeningValue || 0;
  let engagedListeningMinutes = engagedListeningValue;
  if (genericListeningValue !== null) {
    if (goalType === GOAL_TYPES.INSIDE && insideValue === null && halfListeningValue === null) {
      listeningWithoutFollowingMinutes = genericListeningValue;
    } else if (engagedListeningMinutes === null) {
      engagedListeningMinutes = genericListeningValue;
    }
  }
  if (engagedListeningMinutes === null) {
    engagedListeningMinutes = insideValue !== null || halfListeningValue !== null
      ? insideEngagedMinutes + listeningWithoutFollowingMinutes
      : 0;
  }

  const hasTimerBreakdown = [
    insideValue,
    halfListeningValue,
    engagedListeningValue,
    genericListeningValue,
    distractedMinutes > 0 ? distractedMinutes : null,
    explicitTimerTotal,
  ].some((value) => value !== null);
  const explicitProgress = firstProgressPercent(update, [
    'daily_completion_percentage',
    'progress_percent',
    'completion_percentage',
  ]);
  const explicitEngagementPercent = firstProgressPercent(update, [
    'engagement_percentage',
    'observed_engagement_percentage',
  ]);
  const explicitCompleted = update.daily_completed_boolean === true
    || update.completed === true
    || update.did_complete === true;

  if (!hasTimerBreakdown) {
    const completion = explicitProgress !== null ? explicitProgress : (explicitCompleted ? 100 : null);
    if (completion === null) {
      return {
        hasProgressSignal: false,
        hasTimerBreakdown: false,
        goalMinutes,
        goalType,
        engagedListeningMinutes: 0,
        insideEngagedMinutes: 0,
        listeningWithoutFollowingMinutes: 0,
        distractedMinutes,
        timerTotalMinutes: explicitTimerTotal || 0,
        countedMinutes: 0,
        dailyCompletionPercentage: null,
        dailyCompletedBoolean: false,
        progressPercent: null,
        engagementPercent: null,
        engagementLevel: null,
      };
    }
    const completedMinutes = Math.max(0, Math.min(goalMinutes, goalMinutes * (completion / 100)));
    if (goalType === GOAL_TYPES.INSIDE) {
      insideEngagedMinutes = completedMinutes;
      listeningWithoutFollowingMinutes = 0;
      engagedListeningMinutes = completedMinutes;
    } else {
      engagedListeningMinutes = completedMinutes;
      insideEngagedMinutes = 0;
      listeningWithoutFollowingMinutes = 0;
    }
  }

  const progress = calculateStudentTorahProgress({
    goalMinutes,
    goalType,
    engagedListeningMinutes,
    insideEngagedMinutes,
    listeningWithoutFollowingMinutes,
  });
  const rawEngagedMinutes = insideValue !== null || halfListeningValue !== null
    ? insideEngagedMinutes + listeningWithoutFollowingMinutes
    : engagedListeningMinutes;
  const timerTotalMinutes = explicitTimerTotal !== null
    ? explicitTimerTotal
    : rawEngagedMinutes + distractedMinutes;
  const engagementPercent = timerTotalMinutes > 0
    ? Math.round(capPercentage((rawEngagedMinutes / timerTotalMinutes) * 100))
    : explicitEngagementPercent;

  return {
    hasProgressSignal: true,
    hasTimerBreakdown,
    goalMinutes,
    goalType,
    engagedListeningMinutes,
    insideEngagedMinutes,
    listeningWithoutFollowingMinutes,
    distractedMinutes,
    timerTotalMinutes,
    rawEngagedMinutes,
    countedMinutes: progress.countedMinutes,
    dailyCompletionPercentage: progress.individualPercentageRaw,
    dailyCompletedBoolean: progress.individualComplete,
    progressPercent: progress.individualPercentage,
    engagementPercent,
    engagementLevel: update.engagement_level || engagementLevelFromPercent(engagementPercent ?? progress.individualPercentage),
  };
}

function calculateStudentTorahProgress({
  goalMinutes,
  goalType,
  engagedListeningMinutes = 0,
  insideEngagedMinutes = 0,
  listeningWithoutFollowingMinutes = 0,
}) {
  const safeGoalMinutes = validateGoalMinutes(goalMinutes);
  const safeGoalType = normalizeGoalType(goalType);
  const safeEngagedListeningMinutes = validateNonNegativeMinutes(
    engagedListeningMinutes,
    'engaged_listening_minutes'
  );
  const safeInsideEngagedMinutes = validateNonNegativeMinutes(
    insideEngagedMinutes,
    'inside_engaged_minutes'
  );
  const safeListeningWithoutFollowingMinutes = validateNonNegativeMinutes(
    listeningWithoutFollowingMinutes,
    'listening_without_following_minutes'
  );

  const countedMinutes =
    safeGoalType === GOAL_TYPES.LISTENING
      ? safeEngagedListeningMinutes
      : safeInsideEngagedMinutes + safeListeningWithoutFollowingMinutes * 0.5;

  const individualPercentageRaw = capPercentage((countedMinutes / safeGoalMinutes) * 100);
  const individualPercentage = Math.round(individualPercentageRaw);
  const individualComplete = individualPercentage === 100;

  return {
    countedMinutes,
    individualPercentageRaw,
    individualPercentage,
    individualComplete,
  };
}

function calculateStudentTripProgress({
  carriedOverCompletedUnits = 0,
  completedDailyUnits = 0,
  totalRequiredUnits = 30,
}) {
  const safeCarriedOverCompletedUnits = validateNonNegativeMinutes(
    carriedOverCompletedUnits,
    'carried_over_completed_units'
  );
  const safeCompletedDailyUnits = validateNonNegativeMinutes(
    completedDailyUnits,
    'completed_daily_units'
  );
  const safeTotalRequiredUnits = validatePositiveNumber(
    totalRequiredUnits,
    'total_required_units'
  );

  const totalCompletedUnits = safeCarriedOverCompletedUnits + safeCompletedDailyUnits;
  const totalTripProgressPercentageRaw = capPercentage(
    (totalCompletedUnits / safeTotalRequiredUnits) * 100
  );
  const totalTripProgressPercentage = Math.round(totalTripProgressPercentageRaw);
  const totalTripComplete = totalCompletedUnits >= safeTotalRequiredUnits;

  return {
    carriedOverCompletedUnits: safeCarriedOverCompletedUnits,
    completedDailyUnits: safeCompletedDailyUnits,
    totalCompletedUnits,
    totalRequiredUnits: safeTotalRequiredUnits,
    totalTripProgressPercentageRaw,
    totalTripProgressPercentage,
    totalTripComplete,
  };
}

function calculateGroupTorahProgress(studentPercentages = []) {
  const cappedPercentages = (Array.isArray(studentPercentages) ? studentPercentages : [])
    .map((value) => capPercentage(value))
    .map((value) => Number(value));

  if (!cappedPercentages.length) {
    return {
      groupPercentageRaw: 0,
      groupPercentage: 0,
      tripUnlocked: false,
    };
  }

  const groupPercentageRaw =
    cappedPercentages.reduce((sum, value) => sum + value, 0) / cappedPercentages.length;
  const groupPercentage = Math.round(groupPercentageRaw);
  const tripUnlocked = cappedPercentages.every((value) => value >= 100);

  return {
    groupPercentageRaw,
    groupPercentage,
    tripUnlocked,
  };
}

module.exports = {
  GOAL_TYPES,
  calculateGroupTorahProgress,
  calculateStudentTorahProgress,
  calculateStudentTripProgress,
  normalizeParsedTorahEngagement,
  normalizeGoalType,
  validateGoalMinutes,
  validateNonNegativeMinutes,
  validatePositiveNumber,
};
