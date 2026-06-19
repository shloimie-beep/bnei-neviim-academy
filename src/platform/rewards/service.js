const { contextScopeFields } = require('../core/context');
const { cleanString, normalizeKey, stableId } = require('../core/ids');
const { fail, ok } = require('../core/result');
const { assertWorkspaceIsolation, requirePermission } = require('../rbac');

function rewardScope(context = {}, input = {}) {
  return {
    ...contextScopeFields(context),
    instance_id: cleanString(input.instance_id || context.instance?.id),
    workspace_id: cleanString(input.workspace_id || context.workspace?.id),
    workspace_key: cleanString(input.workspace_key || context.workspace?.key),
  };
}

function createGoal(context = {}, input = {}) {
  const scope = rewardScope(context, input);
  const permission = requirePermission(context, 'reward:manage', scope);
  if (!permission.ok) return permission;
  const title = cleanString(input.title);
  if (!title) return fail('missing_goal_title', 'Goal title is required', {}, 400);
  return ok({
    id: cleanString(input.id || stableId('GOAL', [scope.workspace_id, title, input.assignee_person_id || input.group_id])),
    ...scope,
    title,
    description: cleanString(input.description),
    goal_type: normalizeKey(input.goal_type || input.type || 'learning') || 'learning',
    assignee_person_id: cleanString(input.assignee_person_id || input.person_id),
    group_id: cleanString(input.group_id),
    target_value: Number.isFinite(Number(input.target_value)) ? Number(input.target_value) : null,
    unit: cleanString(input.unit),
    status: normalizeKey(input.status || 'active') || 'active',
    policy_key: normalizeKey(input.policy_key || 'workspace_configured') || 'workspace_configured',
    metadata: input.metadata || {},
  });
}

function createMilestone(context = {}, goal = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, goal);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'reward:manage', goal);
  if (!permission.ok) return permission;
  const title = cleanString(input.title);
  if (!title) return fail('missing_milestone_title', 'Milestone title is required', {}, 400);
  return ok({
    id: cleanString(input.id || stableId('MILESTONE', [goal.id, title])),
    goal_id: goal.id,
    ...rewardScope(context, goal),
    title,
    target_value: Number.isFinite(Number(input.target_value)) ? Number(input.target_value) : goal.target_value,
    sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 100,
    status: normalizeKey(input.status || 'active') || 'active',
    metadata: input.metadata || {},
  });
}

function createRewardCatalogItem(context = {}, input = {}) {
  const scope = rewardScope(context, input);
  const permission = requirePermission(context, 'reward:manage', scope);
  if (!permission.ok) return permission;
  const title = cleanString(input.title);
  if (!title) return fail('missing_reward_title', 'Reward catalog title is required', {}, 400);
  return ok({
    id: cleanString(input.id || stableId('REWARD', [scope.workspace_id, title])),
    ...scope,
    title,
    description: cleanString(input.description),
    reward_type: normalizeKey(input.reward_type || 'recognition') || 'recognition',
    status: normalizeKey(input.status || 'draft') || 'draft',
    policy_state: normalizeKey(input.policy_state || 'workspace_policy_required') || 'workspace_policy_required',
    metadata: input.metadata || {},
  });
}

function createRewardRule(context = {}, reward = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, reward);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'reward:manage', reward);
  if (!permission.ok) return permission;
  return ok({
    id: cleanString(input.id || stableId('REWARDRULE', [reward.id, input.goal_id || input.milestone_id || input.threshold_value])),
    reward_id: reward.id,
    goal_id: cleanString(input.goal_id),
    milestone_id: cleanString(input.milestone_id),
    ...rewardScope(context, reward),
    rule_type: normalizeKey(input.rule_type || 'progress_threshold') || 'progress_threshold',
    threshold_value: Number.isFinite(Number(input.threshold_value)) ? Number(input.threshold_value) : 100,
    status: normalizeKey(input.status || 'active') || 'active',
    metadata: input.metadata || {},
  });
}

function assignReward(context = {}, reward = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, reward);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'reward:manage', reward);
  if (!permission.ok) return permission;
  const assignee = cleanString(input.assignee_person_id || input.student_id || input.group_id);
  if (!assignee) return fail('missing_reward_assignee', 'assignee_person_id, student_id, or group_id is required', {}, 400);
  return ok({
    id: cleanString(input.id || stableId('REWARDASSIGNMENT', [reward.id, assignee])),
    reward_id: reward.id,
    ...rewardScope(context, reward),
    assignee_person_id: cleanString(input.assignee_person_id),
    student_id: cleanString(input.student_id),
    group_id: cleanString(input.group_id),
    eligibility_state: normalizeKey(input.eligibility_state || 'pending') || 'pending',
    award_state: normalizeKey(input.award_state || 'not_awarded') || 'not_awarded',
    redeem_state: normalizeKey(input.redeem_state || 'not_redeemed') || 'not_redeemed',
    metadata: input.metadata || {},
  });
}

function evaluateRewardEligibility(context = {}, assignment = {}, rule = {}, progress = {}) {
  const isolation = assertWorkspaceIsolation(context, assignment);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'reward:read', assignment);
  if (!permission.ok) return permission;
  const value = Number(progress.value ?? progress.progress_percent ?? progress.percent ?? 0);
  const threshold = Number(rule.threshold_value ?? 100);
  const eligible = Number.isFinite(value) && Number.isFinite(threshold) && value >= threshold;
  return ok({
    assignment_id: assignment.id,
    reward_id: assignment.reward_id,
    eligible,
    eligibility_state: eligible ? 'eligible_for_review' : 'not_yet_eligible',
    progress_value: Number.isFinite(value) ? value : 0,
    threshold_value: Number.isFinite(threshold) ? threshold : 100,
    policy_state: 'neutral_model_workspace_policy_required',
    automatic_award_performed: false,
  });
}

function awardReward(context = {}, assignment = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, assignment);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'reward:manage', assignment);
  if (!permission.ok) return permission;
  if (normalizeKey(input.operator_approved || input.approval_state) !== 'approved' && input.approved !== true) {
    return fail('reward_award_needs_approval', 'Reward award requires explicit workspace policy/operator approval', {
      assignment_id: assignment.id,
    }, 409);
  }
  return ok({
    ...assignment,
    eligibility_state: 'approved',
    award_state: 'awarded',
    awarded_at: input.awarded_at || new Date().toISOString(),
    awarded_by: cleanString(input.awarded_by || context.actor?.id),
  });
}

function redeemReward(context = {}, assignment = {}, input = {}) {
  const isolation = assertWorkspaceIsolation(context, assignment);
  if (!isolation.ok) return isolation;
  const permission = requirePermission(context, 'reward:manage', assignment);
  if (!permission.ok) return permission;
  if (assignment.award_state !== 'awarded') {
    return fail('reward_not_awarded', 'Reward must be awarded before redemption', { assignment_id: assignment.id }, 409);
  }
  return ok({
    ...assignment,
    redeem_state: 'redeemed',
    redeemed_at: input.redeemed_at || new Date().toISOString(),
    redeemed_by: cleanString(input.redeemed_by || context.actor?.id),
  });
}

module.exports = {
  assignReward,
  awardReward,
  createGoal,
  createMilestone,
  createRewardCatalogItem,
  createRewardRule,
  evaluateRewardEligibility,
  redeemReward,
};
