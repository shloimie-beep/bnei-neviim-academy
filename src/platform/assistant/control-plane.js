const CANONICAL_CHANNELS = Object.freeze([
  'telegram',
  'website_assistant',
  'operations_helper',
  'provider_portal_assistant',
  'parent_portal_assistant',
  'student_portal_assistant',
  'codex_chat',
  'future_approved_channel',
]);

const CHANNEL_ALIASES = Object.freeze({
  website: 'website_assistant',
  website_bot: 'website_assistant',
  in_app: 'website_assistant',
  in_app_assistant: 'website_assistant',
  operations: 'operations_helper',
  operations_assistant: 'operations_helper',
  provider: 'provider_portal_assistant',
  provider_assistant: 'provider_portal_assistant',
  parent: 'parent_portal_assistant',
  parent_assistant: 'parent_portal_assistant',
  student: 'student_portal_assistant',
  student_assistant: 'student_portal_assistant',
  codex: 'codex_chat',
  future: 'future_approved_channel',
});

const ACTION_CATEGORIES = Object.freeze([
  'provider_profile',
  'provider_listing',
  'provider_website',
  'brand',
  'landing_page',
  'seo',
  'course',
  'class',
  'lesson',
  'video',
  'worksheet',
  'community',
  'announcement',
  'chart',
  'dashboard_layout',
  'email_campaign',
  'drip_sequence',
  'template_version',
  'automation',
  'segment',
  'reminder',
  'ticket',
  'support',
  'file_intake',
  'integration',
  'billing',
  'agent_work',
  'deployment_status',
]);

const ROLE_ALIASES = Object.freeze({
  admin: 'super_admin',
  operations_admin: 'super_admin',
  platform_super_admin: 'super_admin',
  superadmin: 'super_admin',
  project_owner: 'service_provider',
  project_manager: 'service_provider',
  workspace_owner: 'service_provider',
  workspace_admin: 'service_provider',
  provider_admin: 'service_provider',
  provider_owner: 'service_provider',
  service_provider_admin: 'service_provider',
  service_provider_owner: 'service_provider',
  one_time_admin: 'service_provider',
  one_time_owner: 'service_provider',
  one_time_manager: 'service_provider',
  rabbi: 'service_provider',
  family: 'parent',
  family_owner: 'parent',
  parent_guardian: 'parent',
  child: 'student',
});

const ROLE_ALLOWED_CATEGORIES = Object.freeze({
  super_admin: new Set(ACTION_CATEGORIES),
  service_provider: new Set([
    'provider_profile',
    'provider_listing',
    'provider_website',
    'brand',
    'landing_page',
    'seo',
    'course',
    'class',
    'lesson',
    'video',
    'worksheet',
    'community',
    'announcement',
    'template_version',
    'automation',
    'reminder',
    'ticket',
    'support',
    'file_intake',
    'integration',
  ]),
  parent: new Set([
    'chart',
    'dashboard_layout',
    'reminder',
    'ticket',
    'support',
    'file_intake',
    'template_version',
  ]),
  student: new Set([
    'class',
    'course',
    'lesson',
    'video',
    'worksheet',
    'chart',
    'reminder',
    'ticket',
    'support',
    'file_intake',
  ]),
});

const PREVIEW_REQUIRED_CATEGORIES = new Set([
  'provider_listing',
  'provider_website',
  'landing_page',
  'chart',
  'dashboard_layout',
  'email_campaign',
  'drip_sequence',
  'template_version',
  'automation',
  'announcement',
  'segment',
]);

const APPROVAL_REQUIRED_CATEGORIES = new Set([
  'provider_listing',
  'provider_website',
  'landing_page',
  'email_campaign',
  'drip_sequence',
  'automation',
  'announcement',
  'integration',
  'billing',
  'agent_work',
  'deployment_status',
]);

const EXTERNAL_ACTION_CATEGORIES = new Set([
  'email_campaign',
  'drip_sequence',
  'announcement',
  'integration',
  'billing',
  'deployment_status',
]);

function normalizeKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeChannel(value = '') {
  const key = normalizeKey(value);
  return CHANNEL_ALIASES[key] || (CANONICAL_CHANNELS.includes(key) ? key : '');
}

function normalizeRole(value = '') {
  const key = normalizeKey(value);
  return ROLE_ALIASES[key] || key || 'viewer';
}

function normalizeActionCategory(value = '') {
  const key = normalizeKey(value);
  return ACTION_CATEGORIES.includes(key) ? key : '';
}

function projectKey(value = '') {
  const key = normalizeKey(value);
  if (['one_time', 'one_time_mishnah', 'one_time_mishna', 'one_time_mishnah_class', 'mishnah', 'mishna'].includes(key)) return 'one_time_mishnah_class';
  if (['rabbi_sheller_provider', 'rabbi_scheller_provider'].includes(key)) return 'one_time_mishnah_class';
  if (['family', 'dratler_family', 'household'].includes(key)) return 'dratler_family';
  if (['bna', 'school', 'bnei_neviim', 'bnei_neviim_academy'].includes(key)) return 'bna';
  return key;
}

function workspaceKey(value = '') {
  const key = normalizeKey(value);
  if (['one_time', 'one_time_mishnah', 'one_time_mishna', 'one_time_mishnah_class', 'mishnah', 'mishna', 'rabbi_sheller', 'rabbi_scheller', 'rabbi_sheller_provider', 'rabbi_scheller_provider'].includes(key)) return 'rabbi_sheller_provider';
  if (['family', 'dratler_family', 'household'].includes(key)) return 'dratler_family';
  if (['bna', 'school', 'bnei_neviim', 'bnei_neviim_academy'].includes(key)) return 'bna';
  if (['platform', 'super_admin', 'operations'].includes(key)) return 'platform';
  return key;
}

function actorWorkspaceScope(actor = {}) {
  const role = normalizeRole(actor.role || actor.actor_role || actor.userRole);
  const scope = actor.scope || {};
  const rawProject = actor.project_key || actor.projectKey || scope.projectKey || scope.project_key || '';
  const rawWorkspace = actor.workspace_key || actor.workspaceKey || scope.workspaceKey || scope.workspace_key || rawProject;
  const project = projectKey(rawProject);
  const workspace = workspaceKey(rawWorkspace || project);
  if (role === 'super_admin' || scope.type === 'all') {
    return {
      role,
      scope_type: 'all',
      project_key: project || null,
      workspace_key: workspace || 'platform',
      all_workspaces: true,
    };
  }
  if (role === 'parent') {
    return {
      role,
      scope_type: 'parent',
      project_key: project || 'bna',
      workspace_key: workspace || 'bna',
      parent_id: String(actor.parent_id || actor.parentId || scope.parentId || scope.parent_id || ''),
      family_id: String(actor.family_id || actor.familyId || scope.familyId || scope.family_id || ''),
      linked_child_ids: new Set((actor.linked_child_ids || actor.linkedChildIds || scope.linkedChildIds || []).map(String)),
      all_workspaces: false,
    };
  }
  if (role === 'student') {
    return {
      role,
      scope_type: 'student',
      project_key: project || 'bna',
      workspace_key: workspace || 'bna',
      student_id: String(actor.student_id || actor.studentId || scope.studentId || scope.student_id || ''),
      all_workspaces: false,
    };
  }
  return {
    role,
    scope_type: 'workspace',
    project_key: project || 'one_time_mishnah_class',
    workspace_key: workspace || 'rabbi_sheller_provider',
    provider_id: String(actor.provider_id || actor.providerId || scope.providerId || scope.provider_id || ''),
    all_workspaces: false,
  };
}

function targetWorkspaceScope(target = {}) {
  return {
    project_key: projectKey(target.project_key || target.projectKey || ''),
    workspace_key: workspaceKey(target.workspace_key || target.workspaceKey || target.workspace || target.project_key || target.projectKey || ''),
    provider_id: String(target.provider_id || target.providerId || ''),
    child_id: String(target.child_id || target.childId || target.student_id || target.studentId || ''),
    parent_id: String(target.parent_id || target.parentId || ''),
  };
}

function workspaceMatches(actorScope, targetScope) {
  if (actorScope.all_workspaces) return true;
  if (targetScope.project_key && actorScope.project_key && targetScope.project_key !== actorScope.project_key) return false;
  if (targetScope.workspace_key && actorScope.workspace_key && targetScope.workspace_key !== actorScope.workspace_key) return false;
  if (actorScope.provider_id && targetScope.provider_id && actorScope.provider_id !== targetScope.provider_id) return false;
  return true;
}

function relationshipMatches(actorScope, targetScope) {
  if (actorScope.role === 'parent') {
    if (targetScope.parent_id && actorScope.parent_id && targetScope.parent_id !== actorScope.parent_id) return false;
    if (targetScope.child_id && actorScope.linked_child_ids.size && !actorScope.linked_child_ids.has(targetScope.child_id)) return false;
  }
  if (actorScope.role === 'student') {
    if (targetScope.child_id && actorScope.student_id && targetScope.child_id !== actorScope.student_id) return false;
  }
  return true;
}

function actionPolicy({ actor = {}, channel = '', action_category = '', actionCategory = '', operation = '', target = {}, dry_run = true } = {}) {
  const canonicalChannel = normalizeChannel(channel);
  const category = normalizeActionCategory(action_category || actionCategory);
  const actorScope = actorWorkspaceScope(actor);
  const targetScope = targetWorkspaceScope(target);
  const allowedCategories = ROLE_ALLOWED_CATEGORIES[actorScope.role] || new Set();
  const op = normalizeKey(operation);
  const reasons = [];

  if (!canonicalChannel) reasons.push('unsupported_channel');
  if (!category) reasons.push('unknown_action_category');
  if (category && !allowedCategories.has(category)) reasons.push('role_category_denied');
  if (!workspaceMatches(actorScope, targetScope)) reasons.push('workspace_scope_mismatch');
  if (!relationshipMatches(actorScope, targetScope)) reasons.push('relationship_scope_mismatch');

  const external = EXTERNAL_ACTION_CATEGORIES.has(category) || ['send', 'publish', 'charge', 'deploy', 'enable'].includes(op);
  const previewRequired = PREVIEW_REQUIRED_CATEGORIES.has(category) || external;
  const approvalRequired = APPROVAL_REQUIRED_CATEGORIES.has(category) || external;

  if (external && dry_run === false && !actor.explicit_approval && !actor.approval_phrase) {
    reasons.push('approval_required_for_external_action');
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    channel: canonicalChannel,
    role: actorScope.role,
    scope: {
      type: actorScope.scope_type,
      workspace_key: actorScope.workspace_key,
      project_key: actorScope.project_key,
    },
    action_category: category,
    typed_action_required: true,
    browser_click_substitution_allowed: false,
    preview_required: previewRequired,
    approval_required: approvalRequired,
    dry_run: dry_run !== false,
    external_action: external,
  };
}

function assertActionPolicy(input = {}) {
  const policy = actionPolicy(input);
  if (policy.allowed) return policy;
  const error = new Error(`permission_denied: ${policy.reasons.join(', ')}`);
  error.statusCode = 403;
  error.policy = policy;
  throw error;
}

module.exports = {
  ACTION_CATEGORIES,
  CANONICAL_CHANNELS,
  actionPolicy,
  actorWorkspaceScope,
  assertActionPolicy,
  normalizeActionCategory,
  normalizeChannel,
  normalizeRole,
};
