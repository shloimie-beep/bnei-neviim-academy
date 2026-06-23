const { ROLES, WORKSPACES, normalizeRole, normalizeWorkspace } = require('./types');

const ADMIN_ROLES = new Set([
  ROLES.SUPER_ADMIN,
  ROLES.PLATFORM_MANAGER,
  ROLES.SUPPORT_ADMIN,
  ROLES.TECHNICAL_AGENT,
  ROLES.ADMIN,
  ROLES.BNA_ADMIN,
  ROLES.SCHOOL_MANAGER,
  ROLES.OPERATOR,
  ROLES.SYSTEM,
]);

function actorFrom(input = {}) {
  return {
    user_id: input.user_id || input.userId || input.id || 'system',
    role: normalizeRole(input.role || input.actor_role || input.actorRole),
    workspace_id: normalizeWorkspace(input.workspace_id || input.workspaceId || input.workspace || WORKSPACES.BNA),
  };
}

function roleAllowed(action, role) {
  const normalizedRole = normalizeRole(role);
  const allowedRoles = Array.isArray(action.allowed_roles) ? action.allowed_roles.map(normalizeRole) : [];
  if (allowedRoles.includes('*')) return true;
  if (allowedRoles.includes(normalizedRole)) return true;
  if (ADMIN_ROLES.has(normalizedRole) && allowedRoles.some((allowed) => ADMIN_ROLES.has(allowed))) return true;
  return false;
}

function workspaceAllowed(action, workspaceId) {
  const normalizedWorkspace = normalizeWorkspace(workspaceId);
  const allowedWorkspaces = Array.isArray(action.allowed_workspaces)
    ? action.allowed_workspaces.map(normalizeWorkspace)
    : [];
  return allowedWorkspaces.includes('*') || allowedWorkspaces.includes(normalizedWorkspace);
}

function checkActionPermission(action, actor = {}) {
  const normalizedActor = actorFrom(actor);
  if (!action) {
    return { allowed: false, actor: normalizedActor, reason: 'Action was not found.' };
  }
  if (!roleAllowed(action, normalizedActor.role)) {
    return {
      allowed: false,
      actor: normalizedActor,
      reason: `Role ${normalizedActor.role} is not allowed to run ${action.action_id}.`,
    };
  }
  if (!workspaceAllowed(action, normalizedActor.workspace_id)) {
    return {
      allowed: false,
      actor: normalizedActor,
      reason: `Workspace ${normalizedActor.workspace_id} is not allowed to run ${action.action_id}.`,
    };
  }
  return { allowed: true, actor: normalizedActor, reason: 'allowed' };
}

function visibleActionsForActor(actions = [], actor = {}) {
  return actions.filter((action) => checkActionPermission(action, actor).allowed);
}

module.exports = {
  ADMIN_ROLES,
  actorFrom,
  checkActionPermission,
  roleAllowed,
  visibleActionsForActor,
  workspaceAllowed,
};
