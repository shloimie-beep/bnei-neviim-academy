const { cleanString, normalizeArray, normalizeKey } = require('../core/ids');
const { fail, ok } = require('../core/result');

const CANONICAL_ROLES = Object.freeze([
  'super_admin',
  'instance_owner',
  'workspace_owner',
  'workspace_admin',
  'staff',
  'teacher',
  'service_provider',
  'member',
  'student',
  'viewer',
  'agent_worker',
  'agent_verifier',
]);

const ROLE_ALIASES = Object.freeze({
  admin: 'workspace_admin',
  owner: 'workspace_owner',
  manager: 'workspace_admin',
  rabbi: 'teacher',
  provider: 'service_provider',
  parent: 'member',
  child: 'student',
  bna_admin: 'workspace_admin',
  platform_super_admin: 'super_admin',
});

const ROLE_PERMISSIONS = Object.freeze({
  super_admin: ['*'],
  instance_owner: [
    'instance:read',
    'workspace:*',
    'member:*',
    'community:*',
    'course:*',
    'reward:*',
    'domain:link',
    'task:link',
    'decision:link',
    'calendar:link',
    'module:*',
    'infrastructure:read',
    'agent_run:read',
  ],
  workspace_owner: [
    'workspace:read',
    'workspace:manage',
    'member:*',
    'community:*',
    'course:*',
    'reward:*',
    'domain:link',
    'task:link',
    'decision:link',
    'calendar:link',
    'module:*',
    'agent_run:read',
  ],
  workspace_admin: [
    'workspace:read',
    'member:invite',
    'member:read',
    'community:*',
    'course:*',
    'reward:*',
    'domain:link',
    'task:link',
    'decision:link',
    'calendar:link',
    'module:read',
    'module:manage',
  ],
  staff: [
    'workspace:read',
    'member:read',
    'community:*',
    'course:read',
    'course:create',
    'course:progress:write',
    'reward:read',
    'reward:manage',
    'domain:link',
    'task:link',
    'calendar:link',
    'module:read',
  ],
  teacher: [
    'workspace:read',
    'member:read',
    'community:read',
    'community:create',
    'community:comment',
    'course:*',
    'reward:read',
    'reward:nominate',
    'domain:link',
    'task:link',
    'module:read',
  ],
  service_provider: [
    'workspace:read',
    'community:read',
    'community:create',
    'community:comment',
    'course:read',
    'course:create',
    'course:progress:write',
    'reward:read',
    'domain:link',
    'module:read',
  ],
  member: [
    'workspace:read',
    'community:read',
    'community:comment',
    'course:read',
    'course:progress:read_own',
    'reward:read',
    'member:self_read',
    'module:read',
  ],
  student: [
    'workspace:read',
    'community:read',
    'community:comment',
    'course:read',
    'course:progress:read_own',
    'course:progress:write_own',
    'reward:read',
    'student:self_read',
    'module:read',
  ],
  viewer: ['workspace:read', 'community:read', 'course:read', 'module:read'],
  agent_worker: ['workspace:read', 'agent_run:read', 'agent_run:evidence', 'task:link', 'domain:link', 'module:read'],
  agent_verifier: ['workspace:read', 'agent_run:read_assigned', 'agent_run:verify_assigned', 'module:read'],
});

function normalizeRole(value = '') {
  const key = normalizeKey(value);
  return ROLE_ALIASES[key] || (CANONICAL_ROLES.includes(key) ? key : 'viewer');
}

function permissionMatches(grant, action) {
  if (grant === '*') return true;
  if (grant === action) return true;
  if (grant.endsWith(':*')) return action.startsWith(grant.slice(0, -1));
  return false;
}

function roleHasPermission(role, action) {
  const canonical = normalizeRole(role);
  return (ROLE_PERMISSIONS[canonical] || []).some((grant) => permissionMatches(grant, action));
}

function normalizeAction(value = '') {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return 'workspace:read';
  return raw
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9:_-]+/g, '_')
    .replace(/-+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function activeMemberships(context = {}) {
  return normalizeArray(context.memberships || context.actor?.memberships)
    .map((membership) => ({
      ...membership,
      role: normalizeRole(membership.role),
      status: normalizeKey(membership.status || (membership.active === false ? 'disabled' : 'active')),
      actor_id: cleanString(membership.actor_id || membership.actorId || context.actor?.id),
      instance_id: cleanString(membership.instance_id || membership.instanceId || context.instance?.id),
      workspace_id: cleanString(membership.workspace_id || membership.workspaceId || ''),
      assigned_run_ids: normalizeArray(membership.assigned_run_ids || membership.assignedRunIds).map(String),
      global_access: membership.global_access === true || membership.globalAccess === true,
    }))
    .filter((membership) => membership.status === 'active');
}

function isExplicitGlobalSuperAdmin(context = {}) {
  if (context.actor?.global_super_admin !== true) return false;
  return activeMemberships(context).some((membership) => membership.role === 'super_admin' && membership.global_access === true);
}

function resourceInstanceId(resource = {}) {
  return cleanString(resource.instance_id || resource.instanceId || resource.instance?.id || '');
}

function resourceWorkspaceId(resource = {}) {
  return cleanString(resource.workspace_id || resource.workspaceId || resource.workspace?.id || resource.workspace_key || resource.workspaceKey || '');
}

function contextInstanceId(context = {}) {
  return cleanString(context.instance?.id || context.instance_id || context.instanceId || '');
}

function contextWorkspaceId(context = {}) {
  return cleanString(context.workspace?.id || context.workspace_id || context.workspaceId || context.workspace?.key || '');
}

function membershipMatchesResource(context = {}, membership = {}, resource = {}) {
  const resourceInstance = resourceInstanceId(resource);
  const resourceWorkspace = resourceWorkspaceId(resource);
  const ctxInstance = contextInstanceId(context);
  const ctxWorkspace = contextWorkspaceId(context);

  if (resourceInstance && membership.instance_id && resourceInstance !== membership.instance_id) return false;
  if (resourceInstance && !membership.instance_id && ctxInstance && resourceInstance !== ctxInstance) return false;

  if (!resourceWorkspace) return true;
  if (membership.workspace_id && resourceWorkspace === membership.workspace_id) return true;
  if (!membership.workspace_id && ctxWorkspace && resourceWorkspace === ctxWorkspace) return true;
  return false;
}

function bestMembership(context = {}, resource = {}) {
  const memberships = activeMemberships(context);
  return memberships.find((membership) => membershipMatchesResource(context, membership, resource))
    || memberships.find((membership) => !resourceWorkspaceId(resource) && (!resourceInstanceId(resource) || resourceInstanceId(resource) === membership.instance_id))
    || null;
}

function assignedRunAllowed(context = {}, membership = {}, resource = {}) {
  const runId = cleanString(resource.run_id || resource.runId || resource.agent_run_id || resource.agentRunId || resource.id);
  if (!runId) return false;
  const assigned = new Set([
    ...normalizeArray(context.assigned_run_ids || context.assignedRunIds).map(String),
    ...normalizeArray(membership.assigned_run_ids || membership.assignedRunIds).map(String),
  ]);
  return assigned.has(runId) || cleanString(resource.assigned_verifier_id || resource.assignedVerifierId) === cleanString(context.actor?.id);
}

function ownRecordAllowed(context = {}, resource = {}) {
  const actor = context.actor || {};
  const personId = cleanString(actor.person_id || actor.personId || actor.id);
  const studentId = cleanString(actor.student_id || actor.studentId || actor.id);
  if (resource.owner_actor_id && cleanString(resource.owner_actor_id) === cleanString(actor.id)) return true;
  if (resource.person_id && cleanString(resource.person_id) === personId) return true;
  if (resource.member_person_id && cleanString(resource.member_person_id) === personId) return true;
  if (resource.student_id && cleanString(resource.student_id) === studentId) return true;
  if (resource.student_person_id && cleanString(resource.student_person_id) === personId) return true;
  return false;
}

function canAccess(context = {}, action = 'workspace:read', resource = {}) {
  const normalizedAction = normalizeAction(action);
  const resourceInstance = resourceInstanceId(resource);
  const ctxInstance = contextInstanceId(context);
  const globalSuper = isExplicitGlobalSuperAdmin(context);

  if (resourceInstance && ctxInstance && resourceInstance !== ctxInstance && !globalSuper) {
    return {
      allowed: false,
      code: 'instance_scope_mismatch',
      reason: 'permission_denied: instance scope mismatch',
      status: 403,
    };
  }

  const membership = bestMembership(context, resource);
  if (!membership && !globalSuper) {
    return {
      allowed: false,
      code: 'missing_workspace_membership',
      reason: 'permission_denied: active workspace membership is required',
      status: 403,
    };
  }

  const role = membership?.role || (globalSuper ? 'super_admin' : normalizeRole(context.actor?.role));
  if (role === 'agent_verifier' && ['agent_run:verify', 'agent_run:verify_assigned', 'agent_run:read_assigned'].includes(normalizedAction)) {
    if (!assignedRunAllowed(context, membership || {}, resource)) {
      return {
        allowed: false,
        code: 'agent_run_not_assigned',
        reason: 'permission_denied: verifier access is limited to assigned runs',
        status: 403,
      };
    }
    return { allowed: true, role, reason: 'allowed: assigned verifier' };
  }

  if (['student:self_read', 'member:self_read', 'course:progress:read_own', 'course:progress:write_own'].includes(normalizedAction)) {
    if (!ownRecordAllowed(context, resource)) {
      return {
        allowed: false,
        code: 'record_owner_mismatch',
        reason: 'permission_denied: role can access only its own record',
        status: 403,
      };
    }
    return { allowed: true, role, reason: 'allowed: own record' };
  }

  if (normalizedAction.startsWith('infrastructure:') && !['super_admin', 'instance_owner'].includes(role)) {
    return {
      allowed: false,
      code: 'infrastructure_scope_denied',
      reason: 'permission_denied: normal workspace clients cannot access infrastructure settings',
      status: 403,
    };
  }

  if (!globalSuper && !membershipMatchesResource(context, membership || {}, resource)) {
    return {
      allowed: false,
      code: 'workspace_scope_mismatch',
      reason: 'permission_denied: workspace scope mismatch',
      status: 403,
    };
  }

  if (!roleHasPermission(role, normalizedAction)) {
    return {
      allowed: false,
      code: 'permission_denied',
      reason: `permission_denied: ${role} cannot ${normalizedAction}`,
      status: 403,
    };
  }

  return { allowed: true, role, reason: 'allowed' };
}

function requirePermission(context = {}, action = 'workspace:read', resource = {}) {
  const permission = canAccess(context, action, resource);
  return permission.allowed ? ok(permission) : fail(permission.code, permission.reason, permission, permission.status);
}

function requireWorkspaceRole(context = {}, allowedRoles = [], resource = {}) {
  const allowed = new Set(normalizeArray(allowedRoles).map(normalizeRole));
  const membership = bestMembership(context, resource);
  const role = membership?.role || (isExplicitGlobalSuperAdmin(context) ? 'super_admin' : normalizeRole(context.actor?.role));
  if (allowed.has(role) || role === 'super_admin') return ok({ role });
  return fail('role_denied', `permission_denied: ${role} is not one of ${[...allowed].join(', ')}`, { role, allowed: [...allowed] }, 403);
}

function assertWorkspaceIsolation(context = {}, record = {}) {
  const permission = canAccess(context, 'workspace:read', record);
  return permission.allowed ? ok({ isolated: true }) : fail(permission.code, permission.reason, permission, permission.status);
}

function listVisibleModules(context = {}, modules = []) {
  return normalizeArray(modules).filter((module) => {
    const resource = {
      instance_id: module.instance_id || context.instance?.id,
      workspace_id: module.workspace_id || context.workspace?.id,
    };
    const visibility = module.visibility || {};
    const roleList = normalizeArray(visibility.roles || module.roles).map(normalizeRole);
    const permission = canAccess(context, module.required_permission || module.requiredPermission || 'module:read', resource);
    if (!permission.allowed) return false;
    if (roleList.length && !roleList.includes(permission.role) && permission.role !== 'super_admin') return false;
    return visibility.enabled !== false && module.enabled !== false;
  });
}

module.exports = {
  CANONICAL_ROLES,
  ROLE_ALIASES,
  ROLE_PERMISSIONS,
  assertWorkspaceIsolation,
  canAccess,
  isExplicitGlobalSuperAdmin,
  listVisibleModules,
  normalizeRole,
  normalizeAction,
  requirePermission,
  requireWorkspaceRole,
  roleHasPermission,
};
