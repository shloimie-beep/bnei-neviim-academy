const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';

const ONE_TIME_CANONICAL_ROLES = Object.freeze({
  PLATFORM_SUPER_ADMIN: 'platform_super_admin',
  PLATFORM_MANAGER: 'platform_manager',
  SUPPORT_ADMIN: 'support_admin',
  TECHNICAL_AGENT: 'technical_agent',
  WORKSPACE_OWNER: 'workspace_owner',
  WORKSPACE_ADMIN: 'workspace_admin',
  WORKSPACE_MANAGER: 'workspace_manager',
  AI_STUDIO_OPERATOR: 'ai_studio_operator',
  AI_VIDEO_WORKER: 'ai_video_worker',
  PROVIDER_STAFF: 'provider_staff',
  MODERATOR: 'moderator',
  PARENT: 'parent',
  STUDENT: 'student',
});

const ONE_TIME_ROLE_LABELS = Object.freeze({
  [ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN]: 'Platform Super Admin',
  [ONE_TIME_CANONICAL_ROLES.PLATFORM_MANAGER]: 'Platform Manager',
  [ONE_TIME_CANONICAL_ROLES.SUPPORT_ADMIN]: 'Support Admin',
  [ONE_TIME_CANONICAL_ROLES.TECHNICAL_AGENT]: 'Technical Agent',
  [ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER]: 'Workspace Owner',
  [ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN]: 'Workspace Admin',
  [ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER]: 'Workspace Manager',
  [ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR]: 'AI Studio Operator',
  [ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER]: 'AI Video Worker',
  [ONE_TIME_CANONICAL_ROLES.PROVIDER_STAFF]: 'Provider Staff',
  [ONE_TIME_CANONICAL_ROLES.MODERATOR]: 'Moderator',
  [ONE_TIME_CANONICAL_ROLES.PARENT]: 'Parent',
  [ONE_TIME_CANONICAL_ROLES.STUDENT]: 'Student',
});

const ONE_TIME_ROLE_COMPATIBILITY = Object.freeze({
  super_admin: ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN,
  platform_super_admin: ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN,
  platform_manager: ONE_TIME_CANONICAL_ROLES.PLATFORM_MANAGER,
  support_admin: ONE_TIME_CANONICAL_ROLES.SUPPORT_ADMIN,
  technical_agent: ONE_TIME_CANONICAL_ROLES.TECHNICAL_AGENT,
  project_owner: ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
  owner: ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
  rabbi: ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
  project_admin: ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
  admin: ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
  one_time_admin: ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
  project_manager: ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER,
  manager: ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER,
  one_time_ai_studio_operator: ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR,
  ai_studio_operator: ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR,
  studio_operator: ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR,
  one_time_ai_video_worker: ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER,
  ai_video_worker: ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER,
  one_time_video_worker: ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER,
  video_worker: ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER,
  service_provider: ONE_TIME_CANONICAL_ROLES.PROVIDER_STAFF,
  provider_staff: ONE_TIME_CANONICAL_ROLES.PROVIDER_STAFF,
  teacher: ONE_TIME_CANONICAL_ROLES.PROVIDER_STAFF,
  moderator: ONE_TIME_CANONICAL_ROLES.MODERATOR,
  parent: ONE_TIME_CANONICAL_ROLES.PARENT,
  student: ONE_TIME_CANONICAL_ROLES.STUDENT,
  child: ONE_TIME_CANONICAL_ROLES.STUDENT,
});

const ONE_TIME_IDENTITY_COMPATIBILITY = Object.freeze({
  project_owner: {
    canonicalRole: ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
    label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER],
    roleContract: 'one-time-workspace-owner-v1',
  },
  project_manager: {
    canonicalRole: ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER,
    label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER],
    roleContract: 'one-time-workspace-manager-v1',
  },
  one_time_ai_studio_operator: {
    canonicalRole: ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR,
    label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR],
    roleContract: 'one-time-ai-studio-operator-v1',
  },
  one_time_ai_video_worker: {
    canonicalRole: ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER,
    label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER],
    roleContract: 'one-time-ai-video-worker-v1',
  },
  one_time_admin: {
    canonicalRole: ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
    label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN],
    roleContract: 'one-time-workspace-admin-v1',
  },
});

const ONE_TIME_ROLE_CAPABILITIES = Object.freeze({
  [ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN]: new Set([
    'switch_workspace',
    'read_all_workspaces',
    'assign_platform_role',
    'read_workspace_users',
    'invite_workspace_user',
    'change_workspace_role',
    'deactivate_workspace_user',
    'remove_workspace_user',
    'read_role_audit_log',
    'read_parent_child_link',
    'read_student_enrollment',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.PLATFORM_MANAGER]: new Set([
    'switch_workspace',
    'read_workspace_users',
    'invite_workspace_user',
    'change_workspace_role',
    'deactivate_workspace_user',
    'read_role_audit_log',
    'read_parent_child_link',
    'read_student_enrollment',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.SUPPORT_ADMIN]: new Set([
    'switch_workspace',
    'read_workspace_users',
    'read_role_audit_log',
    'read_parent_child_link',
    'read_student_enrollment',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.TECHNICAL_AGENT]: new Set([
    'switch_workspace',
    'read_workspace_users',
    'read_role_audit_log',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER]: new Set([
    'read_workspace_users',
    'invite_workspace_user',
    'change_workspace_role',
    'deactivate_workspace_user',
    'read_role_audit_log',
    'read_parent_child_link',
    'read_student_enrollment',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN]: new Set([
    'read_workspace_users',
    'invite_workspace_user',
    'change_workspace_role',
    'deactivate_workspace_user',
    'read_role_audit_log',
    'read_parent_child_link',
    'read_student_enrollment',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER]: new Set([
    'read_workspace_users',
    'invite_workspace_user',
    'change_workspace_role',
    'read_role_audit_log',
    'read_parent_child_link',
    'read_student_enrollment',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR]: new Set([]),
  [ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER]: new Set([]),
  [ONE_TIME_CANONICAL_ROLES.PROVIDER_STAFF]: new Set([
    'read_workspace_users',
    'read_student_enrollment',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.MODERATOR]: new Set([
    'read_workspace_users',
    'read_student_enrollment',
    'read_provider_class',
  ]),
  [ONE_TIME_CANONICAL_ROLES.PARENT]: new Set(['read_parent_child_link']),
  [ONE_TIME_CANONICAL_ROLES.STUDENT]: new Set(['read_student_enrollment']),
});

const ONE_TIME_PLATFORM_ROLES = new Set([
  ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN,
  ONE_TIME_CANONICAL_ROLES.PLATFORM_MANAGER,
  ONE_TIME_CANONICAL_ROLES.SUPPORT_ADMIN,
  ONE_TIME_CANONICAL_ROLES.TECHNICAL_AGENT,
]);

const ONE_TIME_ROLE_ACCESS_MATRIX = Object.freeze({
  [ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR]: Object.freeze({
    role_key: 'one_time_ai_studio_operator',
    canonical_role: ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR,
    label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR],
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    allowed_views: Object.freeze(['studio', 'tasks']),
    allowed_route_groups: Object.freeze([
      'one_time_studio',
      'one_time_task_manager',
      'studio_repair_lane',
    ]),
    denied_route_groups: Object.freeze([
      'bna_school',
      'cross_workspace',
      'contacts_crm',
      'payments_accounting',
      'settings_integrations',
      'member_access_grants',
      'raw_shell_codex_deploy',
    ]),
    data_boundary: 'rabbi_sheller_provider / one_time_mishnah_class only',
  }),
  [ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER]: Object.freeze({
    role_key: 'one_time_ai_video_worker',
    canonical_role: ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER,
    label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER],
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    allowed_views: Object.freeze(['studio', 'tasks']),
    allowed_route_groups: Object.freeze([
      'one_time_studio',
      'one_time_task_manager',
      'studio_repair_lane',
    ]),
    allowed_actions: Object.freeze([
      'view_studio_dashboard',
      'view_studio_projects',
      'create_or_update_studio_project',
      'save_studio_source',
      'prepare_studio_review_pack',
      'generate_studio_outline',
      'generate_studio_storyboard',
      'compile_studio_prompt',
      'preview_studio_prompt_patch',
      'export_openart_prompt_no_live',
      'create_ai_video_worker_handoff',
      'run_mock_studio_render',
      'plan_studio_repair_no_shell',
      'view_one_time_tasks',
      'create_one_time_task',
      'update_one_time_task',
      'comment_on_one_time_task',
    ]),
    denied_route_groups: Object.freeze([
      'bna_school',
      'rabbi_provider_admin',
      'cross_workspace',
      'contacts_crm',
      'payments_accounting',
      'content_handoff',
      'agent_fleet',
      'queue_health',
      'task_artifacts',
      'settings_integrations',
      'member_access_grants',
      'external_sends_publishes_uploads',
      'raw_shell_codex_deploy',
    ]),
    data_boundary: 'Only One Time Studio records and One Time task-manager records for rabbi_sheller_provider / one_time_mishnah_class.',
  }),
});

function normalizeKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeOneTimeProjectKey(value = '') {
  const key = normalizeKey(value);
  if (
    [
      'one_time',
      'one_time_mishnah',
      'one_time_mishna',
      'one_time_mishnah_class',
      'one_time_mishna_class',
      'mishnah',
      'mishna',
      'rabbi_sheller_provider',
      'rabbi_scheller_provider',
    ].includes(key)
  ) {
    return ONE_TIME_PROJECT_KEY;
  }
  return key;
}

function normalizeOneTimeWorkspaceKey(value = '') {
  const key = normalizeKey(value);
  if (
    [
      'one_time',
      'one_time_mishnah',
      'one_time_mishna',
      'one_time_mishnah_class',
      'one_time_mishna_class',
      'mishnah',
      'mishna',
      'rabbi_elie',
      'rabbi_elie_scheller',
      'elie_scheller',
      'rabbi_sheller',
      'rabbi_sheller_provider',
      'rabbi_scheller_provider',
    ].includes(key)
  ) {
    return ONE_TIME_WORKSPACE_KEY;
  }
  return key;
}

function isOneTimeScope(value = {}) {
  const workspaceKey = normalizeOneTimeWorkspaceKey(value.workspace_key || value.workspaceKey || value.workspace || '');
  const projectKey = normalizeOneTimeProjectKey(value.project_key || value.projectKey || value.project || '');
  return workspaceKey === ONE_TIME_WORKSPACE_KEY || projectKey === ONE_TIME_PROJECT_KEY;
}

function normalizeOneTimeRole(value = '') {
  const key = normalizeKey(value);
  return ONE_TIME_ROLE_COMPATIBILITY[key] || key || '';
}

function oneTimeRoleLabel(role = '') {
  const canonical = normalizeOneTimeRole(role);
  return ONE_TIME_ROLE_LABELS[canonical] || String(role || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function oneTimeCanonicalOwnerAssignments() {
  return [
    {
      person_name: 'Rabbi Ellie Scheller',
      legacy_person_names: ['Rabbi Elie Scheller', 'Rabbi Sheller', 'Rabbi Scheller'],
      canonical_role: ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
      canonical_roles: [
        ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
        ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
      ],
      canonical_role_label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER],
      compatibility_role: 'project owner',
      identity_role: 'project_owner',
      access_level: 'owner',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      account_type: 'external_user',
    },
    {
      person_name: 'Shloimie',
      canonical_role: ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
      canonical_roles: [
        ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
        ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER,
      ],
      canonical_role_label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN],
      platform_role: ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN,
      platform_role_label: ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN],
      compatibility_role: 'project admin',
      identity_role: 'project_manager',
      access_level: 'manager',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      account_type: 'internal_admin',
    },
  ];
}

function roleCapabilities(role = '') {
  const canonical = normalizeOneTimeRole(role);
  return ONE_TIME_ROLE_CAPABILITIES[canonical] || new Set();
}

function oneTimeRoleAccessMatrix(role = '') {
  const canonical = normalizeOneTimeRole(role);
  return ONE_TIME_ROLE_ACCESS_MATRIX[canonical] || null;
}

function oneTimeAllowedViewsForRole(role = '') {
  const matrix = oneTimeRoleAccessMatrix(role);
  return Array.isArray(matrix?.allowed_views) ? matrix.allowed_views.slice() : [];
}

function canonicalRolesForIdentity(identity = {}) {
  const role = normalizeKey(identity.role || identity.actor_role || '');
  const roles = new Set();
  if (identity.scope?.type === 'all' || role === 'super_admin') {
    roles.add(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN);
  }
  const mapped = ONE_TIME_IDENTITY_COMPATIBILITY[role]?.canonicalRole || normalizeOneTimeRole(role);
  if (Object.values(ONE_TIME_CANONICAL_ROLES).includes(mapped)) roles.add(mapped);
  if (
    roles.has(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN) &&
    isOneTimeScope(identity.scope || identity)
  ) {
    roles.add(ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN);
  }
  return [...roles];
}

function decorateOneTimeIdentity(identity = {}) {
  const roles = canonicalRolesForIdentity(identity);
  const scopedToOneTime = identity.scope?.type === 'project'
    && normalizeOneTimeProjectKey(identity.scope.projectKey || identity.scope.project_key) === ONE_TIME_PROJECT_KEY;
  const primaryRole = roles.find((role) => role !== ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN)
    || roles[0]
    || '';
  const compatibility = ONE_TIME_IDENTITY_COMPATIBILITY[normalizeKey(identity.role || '')] || {};
  const scope = scopedToOneTime
    ? {
        ...identity.scope,
        projectKey: ONE_TIME_PROJECT_KEY,
        workspaceKey: ONE_TIME_WORKSPACE_KEY,
      }
    : identity.scope;
  return {
    ...identity,
    scope,
    canonical_roles: roles,
    canonical_role: primaryRole,
    canonical_role_label: oneTimeRoleLabel(primaryRole),
    workspace_role: scopedToOneTime ? primaryRole : '',
    workspace_role_label: scopedToOneTime ? oneTimeRoleLabel(primaryRole) : '',
    platform_role: roles.includes(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN)
      ? ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN
      : '',
    platform_role_label: roles.includes(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN)
      ? ONE_TIME_ROLE_LABELS[ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN]
      : '',
    role_contract: compatibility.roleContract || (roles.length ? 'one-time-role-model-v1' : ''),
    workspace_key: scopedToOneTime ? ONE_TIME_WORKSPACE_KEY : identity.workspace_key,
    project_key: scopedToOneTime ? ONE_TIME_PROJECT_KEY : identity.project_key,
  };
}

function hasOneTimeCapability(identity = {}, action = '') {
  const roles = canonicalRolesForIdentity(identity);
  return roles.some((role) => roleCapabilities(role).has(action));
}

function sameOneTimeWorkspace(resource = {}) {
  const workspaceKey = normalizeOneTimeWorkspaceKey(resource.workspace_key || resource.workspaceKey || resource.workspace || '');
  const projectKey = normalizeOneTimeProjectKey(resource.project_key || resource.projectKey || resource.project || '');
  if (!workspaceKey && !projectKey) return true;
  return workspaceKey === ONE_TIME_WORKSPACE_KEY || projectKey === ONE_TIME_PROJECT_KEY;
}

function canOneTimeIdentityAccessWorkspace(identity = {}, workspaceKey = ONE_TIME_WORKSPACE_KEY) {
  if (identity.scope?.type === 'all') return true;
  if (identity.scope?.type === 'project') {
    const scopedProject = normalizeOneTimeProjectKey(identity.scope.projectKey || identity.scope.project_key);
    return scopedProject === ONE_TIME_PROJECT_KEY
      && normalizeOneTimeWorkspaceKey(workspaceKey) === ONE_TIME_WORKSPACE_KEY;
  }
  return false;
}

function canOneTimeIdentity(action = '', identity = {}, resource = {}) {
  if (!action) return { allowed: false, reason: 'missing_action' };
  const roles = canonicalRolesForIdentity(identity);
  if (
    action === 'remove_workspace_user' &&
    !roles.includes(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN)
  ) {
    return { allowed: false, reason: 'permission_denied: permanent removal is Platform Super Admin only; use deactivate for workspace admins' };
  }
  if (!hasOneTimeCapability(identity, action)) {
    return { allowed: false, reason: `permission_denied: ${action} requires a One Time role with that capability` };
  }
  if (!sameOneTimeWorkspace(resource)) {
    return { allowed: false, reason: 'permission_denied: workspace scope mismatch' };
  }
  if (!canOneTimeIdentityAccessWorkspace(identity, resource.workspace_key || resource.workspaceKey || ONE_TIME_WORKSPACE_KEY)) {
    return { allowed: false, reason: 'permission_denied: identity is not scoped to the One Time workspace' };
  }
  const targetRole = normalizeOneTimeRole(resource.target_role || resource.targetRole || resource.role || '');
  if (
    ['change_workspace_role', 'invite_workspace_user'].includes(action) &&
    ONE_TIME_PLATFORM_ROLES.has(targetRole) &&
    !roles.includes(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN)
  ) {
    return { allowed: false, reason: 'permission_denied: only Platform Super Admin can assign platform roles' };
  }
  if (
    ['change_workspace_role', 'deactivate_workspace_user', 'remove_workspace_user'].includes(action) &&
    targetRole === ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER &&
    !roles.includes(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN)
  ) {
    return { allowed: false, reason: 'permission_denied: only Platform Super Admin can change or deactivate the workspace owner' };
  }
  return { allowed: true, reason: 'allowed' };
}

function canReadParentChildLink(identity = {}, link = {}) {
  const permission = canOneTimeIdentity('read_parent_child_link', identity, link);
  if (!permission.allowed) return permission;
  if (normalizeOneTimeRole(identity.role) !== ONE_TIME_CANONICAL_ROLES.PARENT) return permission;
  const scopedParentId = String(identity.parent_id || identity.parentId || identity.person_id || identity.personId || '');
  const linkParentId = String(link.parent_id || link.parentId || '');
  if (scopedParentId && linkParentId && scopedParentId !== linkParentId) {
    return { allowed: false, reason: 'permission_denied: parent can read only linked children' };
  }
  return permission;
}

function canReadStudentEnrollment(identity = {}, enrollment = {}) {
  const permission = canOneTimeIdentity('read_student_enrollment', identity, enrollment);
  if (!permission.allowed) return permission;
  const canonicalRole = normalizeOneTimeRole(identity.role);
  if (canonicalRole === ONE_TIME_CANONICAL_ROLES.STUDENT) {
    const scopedStudentId = String(identity.student_id || identity.studentId || identity.person_id || identity.personId || '');
    const studentId = String(enrollment.student_id || enrollment.studentId || enrollment.person_id || enrollment.personId || '');
    if (scopedStudentId && studentId && scopedStudentId !== studentId) {
      return { allowed: false, reason: 'permission_denied: student can read only their own enrollment' };
    }
  }
  return permission;
}

function oneTimeUserBelongsToWorkspace(user = {}) {
  return sameOneTimeWorkspace(user)
    || normalizeOneTimeWorkspaceKey(user.canonical_workspace || user.workspace_scope || '') === ONE_TIME_WORKSPACE_KEY
    || normalizeOneTimeProjectKey(user.project_scope || '') === ONE_TIME_PROJECT_KEY;
}

function oneTimeDisplayName(value = '') {
  const normalized = normalizeKey(value);
  if (['rabbi_elie_scheller', 'rabbi_ellie_scheller', 'rabbi_sheller', 'rabbi_scheller'].includes(normalized)) {
    return 'Rabbi Ellie Scheller';
  }
  return String(value || '');
}

function oneTimeUserView(user = {}) {
  const canonicalRole = normalizeOneTimeRole(user.canonical_role || user.workspace_role || user.role || user.access_level || '');
  return {
    id: user.id || user.person_id || null,
    person_id: user.person_id || user.id || null,
    person_name: oneTimeDisplayName(user.person_name || user.display_name || user.full_name || user.name || ''),
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    canonical_role: canonicalRole,
    canonical_role_label: oneTimeRoleLabel(canonicalRole),
    compatibility_role: user.role || user.compatibility_role || '',
    access_level: user.access_level || '',
    active: user.active !== false,
    account_type: user.account_type || user.metadata?.account_type || '',
  };
}

function filterOneTimeUsersForIdentity(users = [], identity = {}) {
  const permission = canOneTimeIdentity('read_workspace_users', identity, { workspace_key: ONE_TIME_WORKSPACE_KEY });
  if (!permission.allowed) return [];
  return users.filter(oneTimeUserBelongsToWorkspace).map(oneTimeUserView);
}

function buildOneTimeRoleChangeAuditEvent({
  actor = {},
  target = {},
  action = 'change_workspace_role',
  from_role = '',
  to_role = '',
  reason = '',
} = {}) {
  const permission = canOneTimeIdentity(action, actor, {
    ...target,
    target_role: from_role || target.canonical_role || target.role,
  });
  return {
    event_type: 'one_time_role_change_preview',
    role_contract: 'one-time-role-model-v1',
    external_write_performed: false,
    approval_required_for_live_write: true,
    allowed: permission.allowed,
    denial_reason: permission.allowed ? '' : permission.reason,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    action,
    actor: {
      username: actor.username || actor.user || '',
      role: actor.role || '',
      canonical_roles: canonicalRolesForIdentity(actor),
    },
    target: oneTimeUserView(target),
    from_role: normalizeOneTimeRole(from_role || target.canonical_role || target.role || ''),
    to_role: normalizeOneTimeRole(to_role || ''),
    reason: String(reason || '').trim(),
  };
}

module.exports = {
  ONE_TIME_CANONICAL_ROLES,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_ROLE_ACCESS_MATRIX,
  ONE_TIME_ROLE_LABELS,
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeRoleChangeAuditEvent,
  canOneTimeIdentity,
  canOneTimeIdentityAccessWorkspace,
  canReadParentChildLink,
  canReadStudentEnrollment,
  canonicalRolesForIdentity,
  decorateOneTimeIdentity,
  filterOneTimeUsersForIdentity,
  isOneTimeScope,
  normalizeOneTimeProjectKey,
  normalizeOneTimeRole,
  normalizeOneTimeWorkspaceKey,
  oneTimeCanonicalOwnerAssignments,
  oneTimeAllowedViewsForRole,
  oneTimeDisplayName,
  oneTimeRoleAccessMatrix,
  oneTimeRoleLabel,
  oneTimeUserView,
};
