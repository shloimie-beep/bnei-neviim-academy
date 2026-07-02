'use strict';

const fs = require('fs');
const path = require('path');

const ROUTE_REGISTRY_PATH = path.resolve(__dirname, '../../../../ops/route-registry.json');

function compactText(value = '', max = 500) {
  return String(value || '').replace(/\r/g, '').trim().slice(0, max);
}

function normalizeKey(value = '') {
  return compactText(value, 160)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function readRouteRegistry() {
  try {
    const parsed = JSON.parse(fs.readFileSync(ROUTE_REGISTRY_PATH, 'utf8'));
    return Array.isArray(parsed.routes) ? parsed.routes : [];
  } catch {
    return [];
  }
}

function normalizeSameOriginPath(value = '') {
  const raw = compactText(value, 1000);
  if (!raw) return '/';
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return `${url.pathname || '/'}${url.search || ''}${url.hash || ''}`;
    } catch {
      return null;
    }
  }
  if (!raw.startsWith('/')) return null;
  return raw;
}

function pathWithoutDecorations(value = '') {
  return compactText(value, 1000).split(/[?#]/, 1)[0] || '/';
}

function routePatternMatches(pattern = '', routePath = '') {
  if (pattern === routePath) return true;
  if (!pattern.includes(':')) return false;
  const escaped = pattern
    .split('/')
    .map((part) => (part.startsWith(':') ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${escaped}$`).test(routePath);
}

function routeRowFor(pathValue = '') {
  const routePath = pathWithoutDecorations(pathValue);
  return readRouteRegistry().find((row) => routePatternMatches(row.route, routePath)) || null;
}

function actorRole(actor = {}, context = {}) {
  return normalizeKey(
    actor.role ||
    context.userRole ||
    context.user_role ||
    context.identity?.role ||
    context.actor?.role ||
    'guest'
  ) || 'guest';
}

function actorScope(actor = {}, context = {}) {
  return actor.scope || context.identity?.scope || context.scope || context.effectiveScope || {};
}

function actorWorkspace(actor = {}, context = {}) {
  const scope = actorScope(actor, context);
  return normalizeKey(
    actor.workspace_key ||
    actor.workspaceKey ||
    scope.workspace_key ||
    scope.workspaceKey ||
    context.workspace_key ||
    context.workspaceKey
  );
}

function actorProject(actor = {}, context = {}) {
  const scope = actorScope(actor, context);
  return normalizeKey(
    actor.project_key ||
    actor.projectKey ||
    scope.project_key ||
    scope.projectKey ||
    context.project_key ||
    context.projectKey
  );
}

function targetWorkspace(target = {}) {
  return normalizeKey(target.workspace_key || target.workspaceKey || '');
}

function targetProject(target = {}) {
  return normalizeKey(target.project_key || target.projectKey || '');
}

function isAdminRole(role = '', scope = {}) {
  return ['super_admin', 'admin', 'bna_super_admin'].includes(role) || scope.type === 'all';
}

function requiredRoleAllowed(requiredRole, role, scope = {}) {
  const required = normalizeKey(requiredRole || '');
  if (!required) return true;
  if (isAdminRole(role, scope)) return true;
  if (required === 'parent') return role === 'parent';
  if (required === 'student') return role === 'student';
  if (required === 'provider') return ['provider', 'provider_admin', 'participant', 'provider_participant'].includes(role);
  if (required === 'member') return ['member', 'one_time_member'].includes(role);
  if (required === 'provider_or_member') {
    return ['provider', 'provider_admin', 'participant', 'provider_participant', 'member', 'one_time_member'].includes(role);
  }
  if (required === 'super_admin') return isAdminRole(role, scope);
  if (required === 'super_admin_or_project_admin') {
    return isAdminRole(role, scope) || ['provider_admin', 'project_admin'].includes(role);
  }
  return role === required;
}

function actionAllowed({ requireRegisteredAction, actionId, actionKey, helperTool }) {
  if (!requireRegisteredAction) return true;
  const key = normalizeKey(actionId || actionKey || helperTool || '');
  return [
    'open_operations_view',
    'action_helper_open_operations_view',
  ].includes(key);
}

function resolveHelperDestination(input = {}) {
  const target = input.target || {};
  const attemptedPath = normalizeSameOriginPath(target.route || target.path || target.url || target.href || '/');
  const role = actorRole(input.actor || {}, input.context || {});
  const scope = actorScope(input.actor || {}, input.context || {});
  const checks = {
    same_origin: Boolean(attemptedPath),
    route_registered: false,
    action_registered: actionAllowed(input),
    role_allowed: false,
    workspace_allowed: true,
    typed_action_allowed: actionAllowed(input),
  };

  if (!attemptedPath) {
    return {
      ok: false,
      reason: 'non_same_origin_or_invalid_route',
      attempted_path: target.route || target.path || target.url || null,
      checks,
      scope,
    };
  }

  const route = routeRowFor(attemptedPath);
  checks.route_registered = Boolean(route);
  if (!route) {
    return {
      ok: false,
      reason: 'route_not_registered',
      attempted_path: attemptedPath,
      checks,
      scope,
    };
  }

  if (input.context?.authStatus === 'expired' || input.context?.auth_status === 'expired') {
    return {
      ok: false,
      reason: 'expired_session',
      attempted_path: attemptedPath,
      route_key: route.surface,
      route: route.route,
      canonical_path: route.canonical_target || route.route,
      checks,
      scope,
    };
  }

  checks.role_allowed = requiredRoleAllowed(route.required_role, role, scope);
  if (!checks.role_allowed) {
    return {
      ok: false,
      reason: 'role_not_allowed',
      authorization_result: 'role_not_allowed',
      attempted_path: attemptedPath,
      route_key: route.surface,
      route: route.route,
      canonical_path: route.canonical_target || route.route,
      access: route.access,
      required_role: route.required_role,
      checks,
      scope,
    };
  }

  const wantedWorkspace = targetWorkspace(target);
  const wantedProject = targetProject(target);
  const scopedWorkspace = actorWorkspace(input.actor || {}, input.context || {});
  const scopedProject = actorProject(input.actor || {}, input.context || {});
  if (!isAdminRole(role, scope) && wantedWorkspace && scopedWorkspace && wantedWorkspace !== scopedWorkspace) {
    checks.workspace_allowed = false;
    return {
      ok: false,
      reason: 'workspace_scope_mismatch',
      authorization_result: 'workspace_scope_mismatch',
      attempted_path: attemptedPath,
      route_key: route.surface,
      route: route.route,
      canonical_path: route.canonical_target || route.route,
      access: route.access,
      required_role: route.required_role,
      workspace_key: scopedWorkspace,
      project_key: scopedProject,
      checks,
      scope,
    };
  }
  if (!isAdminRole(role, scope) && wantedProject && scopedProject && wantedProject !== scopedProject) {
    checks.workspace_allowed = false;
    return {
      ok: false,
      reason: 'project_scope_mismatch',
      authorization_result: 'project_scope_mismatch',
      attempted_path: attemptedPath,
      route_key: route.surface,
      route: route.route,
      canonical_path: route.canonical_target || route.route,
      access: route.access,
      required_role: route.required_role,
      workspace_key: scopedWorkspace,
      project_key: scopedProject,
      checks,
      scope,
    };
  }

  if (!checks.action_registered) {
    return {
      ok: false,
      reason: 'action_not_registered_or_not_allowed',
      attempted_path: attemptedPath,
      route_key: route.surface,
      route: route.route,
      canonical_path: route.canonical_target || route.route,
      access: route.access,
      required_role: route.required_role,
      checks,
      scope,
    };
  }

  return {
    ok: true,
    route_key: route.surface,
    route: route.route,
    path: attemptedPath,
    attempted_path: attemptedPath,
    canonical_path: route.canonical_target || route.route,
    section: target.section || target.view || route.surface,
    access: route.access,
    required_role: route.required_role,
    authorization_result: 'allowed',
    workspace_key: wantedWorkspace || scopedWorkspace || null,
    project_key: wantedProject || scopedProject || null,
    why_correct: route.expected_logged_in_behavior || route.expected_logged_out_behavior || 'Destination is allowed for the current scope.',
    checks,
    scope,
  };
}

module.exports = {
  resolveHelperDestination,
};
