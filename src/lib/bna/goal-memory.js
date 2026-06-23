const { affectedGoalIdsForText } = require('./goal-registry');
const { defaultItemFields } = require('./intake-schema');
const { compactWhitespace, formatStableId, sourceQuote, titleFromText } = require('./ramble-protocol');

function sourceDateStamp(value = null) {
  const explicit = String(value || '').match(/\b(20\d{2})-?(\d{2})-?(\d{2})\b/);
  if (explicit) return `${explicit[1]}${explicit[2]}${explicit[3]}`;
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function titleForGoal(text = '') {
  return titleFromText(text, 'Preserve durable BNA goal');
}

function createGoalCandidateFromText({
  text = '',
  raw_id = null,
  source = 'manual',
  scope_type = 'workspace',
  scope_id = null,
  workspace_key = 'bna',
  project_key = null,
  date = null,
  index = 1,
  confidence = 0.82,
} = {}) {
  const clean = compactWhitespace(text);
  const relatedGoalIds = affectedGoalIdsForText(clean);
  return defaultItemFields({
    stable_id: formatStableId('goal_candidate', date || sourceDateStamp(), index),
    item_type: 'goal_candidate',
    goal_type: 'standing_goal_candidate',
    title: titleForGoal(clean),
    short_title: titleForGoal(clean),
    plain_english_goal: clean,
    source_quote: sourceQuote(clean),
    source_excerpt: sourceQuote(clean),
    source,
    related_goal_ids: relatedGoalIds,
    expected_result: 'Review this durable rule or goal and promote it when it should constrain future BNA agent behavior.',
    done_definition: 'The goal candidate is promoted, superseded, or rejected with a reason and linked to its raw input.',
    verification_method: 'Check source wording, scope, related standing goals, and watchdog coverage before promotion.',
    target_lane: 'Goal Memory',
    confidence,
    needs_review: confidence < 0.9,
    metadata: {
      promotion_signals: goalPromotionSignals(clean),
    },
  }, 'goal_candidate', {
    raw_id,
    scope_type,
    scope_id,
    workspace_key,
    project_key,
  });
}

function goalPromotionSignals(text = '') {
  const signals = [];
  if (/\b(always|never|every time|from now on|standing rule|source of truth)\b/i.test(text)) signals.push('explicit_durable_rule');
  if (/\b(goal mode|set .* as a goal|make .* a goal)\b/i.test(text)) signals.push('explicit_goal_mode');
  if (/\b(privacy|security|student data|parent data|scope|workspace)\b/i.test(text)) signals.push('safety_or_scope');
  if (/\b(watchdog|proof|evidence|done|verified)\b/i.test(text)) signals.push('quality_gate');
  return signals;
}

function shouldPromoteGoalCandidate(candidate = {}) {
  const text = `${candidate.plain_english_goal || ''} ${candidate.source_quote || ''} ${candidate.title || ''}`;
  const signals = goalPromotionSignals(text);
  return signals.includes('explicit_durable_rule')
    || signals.includes('explicit_goal_mode')
    || signals.includes('safety_or_scope')
    || signals.includes('quality_gate')
    || Number(candidate.confidence || 0) >= 0.92;
}

function promoteGoalCandidate(candidate = {}, overrides = {}) {
  const promotedAt = overrides.promoted_at || new Date().toISOString();
  return {
    stable_id: overrides.stable_id || candidate.stable_id,
    goal_type: overrides.goal_type || candidate.goal_type || 'standing',
    title: overrides.title || candidate.title || titleForGoal(candidate.plain_english_goal || ''),
    plain_english_goal: overrides.plain_english_goal || candidate.plain_english_goal || candidate.source_quote || candidate.title || '',
    why_it_matters: overrides.why_it_matters || 'Captured from natural-language intake as a durable BNA operating goal.',
    scope_type: overrides.scope_type || candidate.scope_type || 'workspace',
    scope_id: overrides.scope_id || candidate.scope_id || null,
    source_raw_id: overrides.source_raw_id || candidate.related_raw_id || candidate.raw_id || null,
    source_item_id: overrides.source_item_id || candidate.stable_id || null,
    related_goal_ids: overrides.related_goal_ids || candidate.related_goal_ids || [],
    watchdog_checks: overrides.watchdog_checks || [],
    evidence_required: overrides.evidence_required || ['Linked raw intake', 'Promotion reason', 'Watchdog coverage or explicit blocker'],
    failure_behavior: overrides.failure_behavior || 'Create a watchdog repair task and leave the affected work open.',
    repair_task_template: overrides.repair_task_template || 'WATCH-* goal violation: restore the invariant and link evidence.',
    promotion_reason: overrides.promotion_reason || goalPromotionSignals(candidate.source_quote || candidate.plain_english_goal || '').join(', ') || 'manual_review',
    status: overrides.status || 'active',
    promoted_at: promotedAt,
    metadata: {
      ...(candidate.metadata || {}),
      ...(overrides.metadata || {}),
    },
  };
}

function linkParsedItemsToRaw(parsed = {}, rawId = null) {
  const raw_id = rawId || parsed.raw_id || parsed.raw_intake?.stable_id || null;
  const keys = Object.keys(parsed).filter((key) => Array.isArray(parsed[key]));
  for (const key of keys) {
    for (const item of parsed[key] || []) {
      if (!item.related_raw_id) item.related_raw_id = raw_id;
      if (!Array.isArray(item.related_goal_ids) || !item.related_goal_ids.length) {
        item.related_goal_ids = affectedGoalIdsForText(`${item.title || ''} ${item.source_quote || item.summary || ''}`);
      }
    }
  }
  return parsed;
}

function assertGoalCoverage(parsed = {}, { required_goal_ids = [] } = {}) {
  const linked = new Set();
  for (const key of Object.keys(parsed).filter((candidate) => Array.isArray(parsed[candidate]))) {
    for (const item of parsed[key] || []) {
      for (const id of item.related_goal_ids || []) linked.add(id);
    }
  }
  return required_goal_ids
    .filter((id) => !linked.has(id))
    .map((goal_id) => ({
      goal_id,
      severity: 'medium',
      message: `Parsed intake has no item linked to required goal ${goal_id}.`,
    }));
}

function recordGoalCheckResult({
  goal_id,
  check_name,
  status = 'passed',
  severity = 'info',
  evidence_path = '',
  report_path = '',
  finding_id = '',
  repair_task_id = '',
  details = {},
  date = null,
  index = 1,
} = {}) {
  return {
    stable_id: formatStableId('watchdog_finding', date || sourceDateStamp(), index),
    goal_id,
    check_name,
    status,
    severity,
    evidence_path,
    report_path,
    finding_id,
    repair_task_id,
    details,
    checked_at: new Date().toISOString(),
  };
}

function createWatchdogRepairTask({
  finding_id,
  goal_id,
  title,
  route = '',
  selector = '',
  evidence_path = '',
  expected_behavior = '',
  suggested_fix = '',
  severity = 'medium',
  date = null,
  index = 1,
} = {}) {
  const stable_id = formatStableId('task', date || sourceDateStamp(), index);
  const routeText = route ? ` on ${route}` : '';
  return {
    stable_id,
    item_type: 'task',
    title: title || `Repair watchdog finding ${finding_id || ''}`.trim(),
    source_quote: finding_id || goal_id || 'watchdog',
    related_goal_ids: goal_id ? [goal_id] : [],
    metadata: {
      watchdog_finding_id: finding_id || null,
      route,
      selector,
      evidence_path,
      expected_behavior,
      suggested_fix,
      severity,
    },
    expected_result: expected_behavior || `Resolve watchdog finding${routeText}.`,
    done_definition: 'The repair is implemented, verified, linked to evidence, and the watchdog passes or the blocker is explicit.',
    verification_method: 'Rerun the relevant watchdog command and record the report path.',
    target_lane: 'Tasks',
    confidence: 0.9,
    needs_review: false,
  };
}

module.exports = {
  sourceDateStamp,
  createGoalCandidateFromText,
  shouldPromoteGoalCandidate,
  promoteGoalCandidate,
  linkParsedItemsToRaw,
  assertGoalCoverage,
  recordGoalCheckResult,
  createWatchdogRepairTask,
  goalPromotionSignals,
};
