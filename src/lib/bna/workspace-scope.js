const WORKSPACE_TYPES = Object.freeze(['school', 'service_provider', 'family']);
const SUPER_ADMIN_ROLE = 'super_admin';

const WORKSPACE_TYPE_ALIASES = Object.freeze({
  academy: 'school',
  bna: 'school',
  provider: 'service_provider',
  service: 'service_provider',
  serviceprovider: 'service_provider',
  service_provider: 'service_provider',
  parent: 'family',
  household: 'family'
});

function normalizeWorkspaceType(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (!normalized) return '';
  return WORKSPACE_TYPE_ALIASES[normalized] || (WORKSPACE_TYPES.includes(normalized) ? normalized : '');
}

function assertWorkspaceType(value) {
  const workspaceType = normalizeWorkspaceType(value);
  if (!workspaceType) {
    throw new Error(`Invalid workspace type: ${value}`);
  }
  return workspaceType;
}

function isGlobalOpsScope(scope) {
  return scope?.type === 'global' || scope?.type === 'all';
}

function createSuperAdminIdentity(username, allowedViews) {
  return {
    username,
    role: SUPER_ADMIN_ROLE,
    scope: {
      type: 'global',
      workspaceType: null,
      workspaceKey: null,
      projectKey: null
    },
    allowedViews
  };
}

function createWorkspaceIdentity({ username, role = 'workspace_member', workspaceType, workspaceKey, projectKey, allowedViews }) {
  return {
    username,
    role,
    scope: {
      type: 'workspace',
      workspaceType: assertWorkspaceType(workspaceType),
      workspaceKey: workspaceKey || projectKey || null,
      projectKey: projectKey || workspaceKey || null
    },
    allowedViews
  };
}

module.exports = {
  SUPER_ADMIN_ROLE,
  WORKSPACE_TYPES,
  assertWorkspaceType,
  createSuperAdminIdentity,
  createWorkspaceIdentity,
  isGlobalOpsScope,
  normalizeWorkspaceType
};
