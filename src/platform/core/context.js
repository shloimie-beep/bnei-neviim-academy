const { cleanString, normalizeKey, parseJsonObject, stableId } = require('./ids');

const DEPLOYMENT_MODES = new Set(['saas_tenant', 'single_tenant_partner']);

function normalizeDeploymentMode(value = 'saas_tenant') {
  const key = normalizeKey(value);
  return DEPLOYMENT_MODES.has(key) ? key : 'saas_tenant';
}

function normalizeInstance(input = {}) {
  const slug = normalizeKey(input.slug || input.instance_slug || input.key || input.id || 'bna-platform');
  return {
    id: cleanString(input.id || slug),
    slug,
    name: cleanString(input.name || input.label, slug.replace(/_/g, ' ')),
    deployment_mode: normalizeDeploymentMode(input.deployment_mode || input.deploymentMode),
    canonical_codebase: cleanString(input.canonical_codebase || input.canonicalCodebase, 'bna-platform'),
    database_scope: cleanString(input.database_scope || input.databaseScope, 'shared'),
    domain_scope: cleanString(input.domain_scope || input.domainScope, 'shared'),
    secret_scope: cleanString(input.secret_scope || input.secretScope, 'shared'),
    status: normalizeKey(input.status || 'active') || 'active',
    metadata: parseJsonObject(input.metadata, {}),
  };
}

function normalizeOrganization(input = {}, instance = {}) {
  const slug = normalizeKey(input.slug || input.organization_slug || input.key || input.id || 'bna');
  return {
    id: cleanString(input.id || slug),
    instance_id: cleanString(input.instance_id || input.instanceId || instance.id),
    slug,
    name: cleanString(input.name || input.label, slug.replace(/_/g, ' ')),
    status: normalizeKey(input.status || 'active') || 'active',
    metadata: parseJsonObject(input.metadata, {}),
  };
}

function normalizeWorkspace(input = {}, instance = {}, organization = {}) {
  const slug = normalizeKey(input.slug || input.workspace_slug || input.workspace_key || input.key || input.project_key || input.id || 'bna');
  const moduleVisibility = parseJsonObject(input.module_visibility || input.moduleVisibility, {});
  return {
    id: cleanString(input.id || input.workspace_id || slug),
    instance_id: cleanString(input.instance_id || input.instanceId || instance.id),
    organization_id: cleanString(input.organization_id || input.organizationId || organization.id),
    slug,
    key: slug,
    project_key: normalizeKey(input.project_key || input.projectKey || slug),
    brand_id: cleanString(input.brand_id || input.brandId || ''),
    visibility: normalizeKey(input.visibility || 'private') || 'private',
    module_visibility: moduleVisibility,
    status: normalizeKey(input.status || 'active') || 'active',
    metadata: parseJsonObject(input.metadata, {}),
  };
}

function normalizeMembership(input = {}, context = {}) {
  return {
    id: cleanString(input.id || stableId('MEMBERSHIP', [
      input.actor_id || input.actorId || context.actor?.id || 'actor',
      input.workspace_id || input.workspaceId || context.workspace?.id || '*',
      input.role || 'viewer',
    ])),
    actor_id: cleanString(input.actor_id || input.actorId || context.actor?.id || ''),
    instance_id: cleanString(input.instance_id || input.instanceId || context.instance?.id || ''),
    workspace_id: cleanString(input.workspace_id || input.workspaceId || context.workspace?.id || ''),
    role: normalizeKey(input.role || 'viewer'),
    status: normalizeKey(input.status || (input.active === false ? 'disabled' : 'active')) || 'active',
    global_access: input.global_access === true || input.globalAccess === true,
    assigned_run_ids: Array.isArray(input.assigned_run_ids || input.assignedRunIds)
      ? (input.assigned_run_ids || input.assignedRunIds).map(String)
      : [],
    metadata: parseJsonObject(input.metadata, {}),
  };
}

function buildPlatformContext(input = {}) {
  const instance = normalizeInstance(input.instance || input);
  const organization = normalizeOrganization(input.organization || {}, instance);
  const workspace = normalizeWorkspace(input.workspace || input, instance, organization);
  const actor = {
    id: cleanString(input.actor?.id || input.actor_id || input.actorId || 'anonymous'),
    person_id: cleanString(input.actor?.person_id || input.actor?.personId || input.person_id || input.personId || ''),
    student_id: cleanString(input.actor?.student_id || input.actor?.studentId || input.student_id || input.studentId || ''),
    role: normalizeKey(input.actor?.role || input.role || 'viewer'),
    global_super_admin: input.actor?.global_super_admin === true || input.global_super_admin === true,
    metadata: parseJsonObject(input.actor?.metadata, {}),
  };
  const context = {
    instance,
    organization,
    workspace,
    actor,
    request_id: cleanString(input.request_id || input.requestId || stableId('REQUEST', [actor.id, workspace.id, Date.now()])),
    audit: {
      source: cleanString(input.source || input.audit?.source || 'platform_service'),
      actor_id: actor.id,
      workspace_id: workspace.id,
      instance_id: instance.id,
    },
  };
  context.memberships = (Array.isArray(input.memberships) ? input.memberships : [])
    .map((membership) => normalizeMembership(membership, context));
  if (!context.memberships.length && actor.role) {
    context.memberships.push(normalizeMembership({
      actor_id: actor.id,
      instance_id: instance.id,
      workspace_id: workspace.id,
      role: actor.role,
      status: 'active',
      global_access: actor.global_super_admin === true,
    }, context));
  }
  return context;
}

function contextScopeFields(context = {}) {
  return {
    instance_id: cleanString(context.instance?.id),
    organization_id: cleanString(context.organization?.id),
    workspace_id: cleanString(context.workspace?.id),
    workspace_key: cleanString(context.workspace?.key || context.workspace?.slug),
    actor_id: cleanString(context.actor?.id),
  };
}

module.exports = {
  DEPLOYMENT_MODES,
  buildPlatformContext,
  contextScopeFields,
  normalizeDeploymentMode,
  normalizeInstance,
  normalizeMembership,
  normalizeOrganization,
  normalizeWorkspace,
};
