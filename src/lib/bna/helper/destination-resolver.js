const fs = require('fs');
const path = require('path');

const { getAction } = require('../../actions/registry');
const { checkActionPermission } = require('../../actions/permissions');
const { normalizeRole, normalizeWorkspace } = require('../../actions/types');
const { normalizeProjectKey, normalizeWorkspaceKey } = require('./permissions');

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const DEFAULT_ROUTE_REGISTRY_PATH = path.join(REPO_ROOT, 'ops', 'route-registry.json');
const DEFAULT_ACTION_REGISTRY_PATH = path.join(REPO_ROOT, 'ops', 'action-registry.json');

const ADMIN_ROLES = new Set([
  'super_admin',
  'platform_manager',
  'support_admin',
  'technical_agent',
  'admin',
  'bna_admin',
  'school_manager',
  'operator',
  'system',
]);

const PROVIDER_ROLES = new Set([
  'provider_admin',
  'provider_manager',
  'provider_staff',
  'participant',
  'service_provider',
  'project_owner',
  'one_time_admin',
]);

const ROLE_ALIASES = new Map([
  ['owner', 'super_admin'],
  ['platform_admin', 'super_admin'],
  ['one_time_admin', 'provider_admin'],
  ['project_owner', 'provider_admin'],
  ['service_provider_admin', 'provider_admin'],
  ['service_provider', 'provider_admin'],
  ['provider', 'provider_admin'],
  ['member', 'participant'],
]);

let routeRegistryCache = null;
let actionRegistryCache = null;

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function loadRouteRegistry(file = DEFAULT_ROUTE_REGISTRY_PATH) {
  if (!routeRegistryCache || routeRegistryCache.file !== file) {
    const data = readJson(file, { routes: [] });
    routeRegistryCache = {
      file,
      routes: Array.isArray(data.routes) ? data.routes : [],
    };
  }
  return routeRegistryCache.routes;
}

function loadActionRegistry(file = DEFAULT_ACTION_REGISTRY_PATH) {
  if (!actionRegistryCache || actionRegistryCache.file !== file) {
    const data = readJson(file, { actions: [] });
    actionRegistryCache = {
      file,
      actions: Array.isArray(data.actions) ? data.actions : [],
    };
  }
  return actionRegistryCache.actions;
}

function normalizeKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeActorRole(value = '') {
  const role = normalizeRole(value || 'operator');
  return ROLE_ALIASES.get(role) || role;
}

function actorFromInput(actor = {}, context = {}) {
  const identity = actor.identity || context.identity || {};
  const scope = actor.scope || identity.scope || context.scope || {};
  const role = normalizeActorRole(actor.role || actor.userRole || context.userRole || identity.role || scope.role || 'operator');
  const workspaceKey = normalizeWorkspaceKey(
    actor.workspace_key ||
    actor.workspaceKey ||
    context.workspaceKey ||
    context.workspace_key ||
    scope.workspaceKey ||
    scope.workspace_key ||
    identity.workspaceKey ||
    identity.workspace_key ||
    normalizeWorkspace(actor.workspace_id || actor.workspaceId || '')
  );
  const projectKey = normalizeProjectKey(
    actor.project_key ||
    actor.projectKey ||
    context.projectKey ||
    context.project_key ||
    scope.projectKey ||
    scope.project_key ||
    identity.projectKey ||
    identity.project_key ||
    ''
  );
  return {
    role,
    workspace_key: workspaceKey || (role === 'provider_admin' ? 'rabbi_sheller_provider' : 'bna'),
    project_key: projectKey || (role === 'provider_admin' ? 'one_time_mishnah_class' : 'bna'),
    scope_type: String(scope.type || actor.scope_type || context.scopeType || '').toLowerCase(),
    scope,
    user_id: actor.user_id || actor.userId || identity.user_id || identity.username || context.userName || 'helper',
  };
}

function sameOriginPath(value = '/') {
  const raw = String(value || '/').trim() || '/';
  try {
    const parsed = new URL(raw, 'https://bneineviimacademy.org');
    if (!['https:', 'http:'].includes(parsed.protocol)) return null;
    if (/^https?:\/\//i.test(raw) && !/^(www\.)?bneineviimacademy\.org$/i.test(parsed.hostname)) return null;
    return `${parsed.pathname || '/'}${parsed.search || ''}${parsed.hash || ''}`;
  } catch {
    return raw.startsWith('/') ? raw : null;
  }
}

function routePathOnly(route = '/') {
  const pathOnly = sameOriginPath(route);
  if (!pathOnly) return '';
  return pathOnly.split('#')[0].split('?')[0] || '/';
}

function routeWithSearch(route = '/') {
  const pathOnly = sameOriginPath(route);
  if (!pathOnly) return '';
  return pathOnly.split('#')[0] || '/';
}

function routeMatchesPattern(pattern = '', route = '') {
  if (!pattern.includes(':')) return false;
  const patternParts = routePathOnly(pattern).split('/').filter(Boolean);
  const routeParts = routePathOnly(route).split('/').filter(Boolean);
  if (patternParts.length !== routeParts.length) return false;
  return patternParts.every((part, index) => part.startsWith(':') || part === routeParts[index]);
}

function findRouteRecord(route = '', routes = loadRouteRegistry()) {
  const full = routeWithSearch(route);
  const pathname = routePathOnly(route);
  return routes.find((entry) => routeWithSearch(entry.route) === full)
    || routes.find((entry) => routePathOnly(entry.route) === pathname)
    || routes.find((entry) => routeMatchesPattern(entry.route, pathname))
    || null;
}

function findRegisteredAction({ actionKey = '', helperTool = '', actions = loadActionRegistry() } = {}) {
  const key = String(actionKey || '').trim();
  if (key) return actions.find((action) => action.action_id === key) || null;
  const tool = String(helperTool || '').trim();
  if (tool) return actions.find((action) => action.helper_tool === tool) || null;
  return null;
}

function buildOperationsPath(target = {}) {
  const view = normalizeKey(target.view || 'tasks') || 'tasks';
  const params = new URLSearchParams();
  params.set('view', view);
  if (target.section) params.set('section', normalizeKey(target.section));
  if (target.workspace_key || target.workspaceKey || target.workspace) {
    params.set('workspace', normalizeWorkspaceKey(target.workspace_key || target.workspaceKey || target.workspace));
  }
  if (target.task_id || target.taskId) params.set('task', String(target.task_id || target.taskId));
  if (target.student_id || target.studentId) params.set('student', String(target.student_id || target.studentId));
  if (target.content_job_id || target.contentJobId) params.set('content_job', String(target.content_job_id || target.contentJobId));
  if (target.calendar_mode || target.calendarMode) params.set('calendar_mode', normalizeKey(target.calendar_mode || target.calendarMode));
  if (target.date) params.set('date', String(target.date).trim().slice(0, 40));
  return `/operations?${params.toString()}`;
}

function inferredRouteForIntent(intent = '', target = {}) {
  const key = normalizeKey(intent);
  if (target.route || target.path || target.url) return sameOriginPath(target.route || target.path || target.url);
  if (target.view || key.includes('operations') || key.includes('task') || key.includes('decision')) return buildOperationsPath(target);
  if (key.includes('parent')) return '/parent';
  if (key.includes('student')) return '/student';
  if (key.includes('provider') || key.includes('rabbi')) return '/provider';
  if (key.includes('classroom')) return '/one-time-classroom';
  if (key.includes('public_provider') || key.includes('service_provider')) return '/service-providers';
  if (key.includes('signup')) return '/signup.html';
  return null;
}

function routeExpectedWorkspace(routeRecord = {}, target = {}) {
  const route = routePathOnly(routeRecord.route || target.route || '');
  if (target.workspace_key || target.workspaceKey || target.workspace) {
    return normalizeWorkspaceKey(target.workspace_key || target.workspaceKey || target.workspace);
  }
  if (route.startsWith('/provider') || route.startsWith('/one-time') || route.startsWith('/rabbi')) {
    return 'rabbi_sheller_provider';
  }
  if (route.startsWith('/parent') || route.startsWith('/student') || route.startsWith('/operations')) {
    return 'bna';
  }
  return '';
}

function routeExpectedLandmark(routeRecord = {}, target = {}) {
  return target.expected_landmark
    || target.expectedLandmark
    || routeRecord.expected_page_landmark
    || routeRecord.expected_logged_in_behavior
    || routeRecord.expected_logged_out_behavior
    || '';
}

function targetSection(target = {}) {
  return normalizeKey(target.section || target.tab || target.view_mode || target.viewMode || '') || null;
}

function roleAllows(requiredRole = '', actor = {}) {
  const required = normalizeKey(requiredRole);
  if (!required) return true;
  if (actor.scope_type === 'all' || actor.scope?.type === 'all') return true;
  if (required.includes('super_admin') || required.includes('platform_super_admin')) return actor.role === 'super_admin';
  if (ADMIN_ROLES.has(actor.role)) return true;
  if (required.includes('parent')) return actor.role === 'parent';
  if (required.includes('student')) return actor.role === 'student';
  if (required.includes('provider') || required.includes('member')) return PROVIDER_ROLES.has(actor.role);
  return required.split('_or_').includes(actor.role) || required === actor.role;
}

function workspaceAllows(routeRecord = {}, actor = {}, target = {}) {
  const expected = routeExpectedWorkspace(routeRecord, target);
  if (!expected || actor.scope_type === 'all' || actor.scope?.type === 'all' || ADMIN_ROLES.has(actor.role)) return true;
  const actorWorkspace = normalizeWorkspaceKey(actor.workspace_key);
  return !actorWorkspace || actorWorkspace === expected;
}

function fallbackForActor(actor = {}, routeRecord = null) {
  if (actor.role === 'parent') return { path: '/parent', reason: 'parent_safe_fallback' };
  if (actor.role === 'student') return { path: '/student', reason: 'student_safe_fallback' };
  if (PROVIDER_ROLES.has(actor.role)) return { path: '/provider', reason: 'provider_safe_fallback' };
  if (routeRecord?.access === 'public') return { path: routeRecord.route, reason: 'public_route_fallback' };
  return { path: '/operations-login.html', reason: 'operations_login_fallback' };
}

function resolveHelperDestination({
  intent = '',
  actor = {},
  context = {},
  channel = 'operations_helper',
  target = {},
  actionId = '',
  actionKey = '',
  helperTool = '',
  reason = '',
  requireRegisteredAction = Boolean(actionId || actionKey || helperTool),
} = {}) {
  const normalizedActor = actorFromInput(actor, context);
  const path = inferredRouteForIntent(intent, target);
  const routeRecord = path ? findRouteRecord(path) : null;
  const registeredAction = findRegisteredAction({ actionKey, helperTool });
  const typedAction = actionId ? getAction(actionId) : null;
  const typedPermission = typedAction
    ? checkActionPermission(typedAction, {
      user_id: normalizedActor.user_id,
      role: normalizedActor.role,
      workspace_id: normalizedActor.workspace_key,
    })
    : { allowed: true, reason: 'no_typed_action' };

  const routeRegistered = Boolean(routeRecord);
  const actionRegistered = Boolean(registeredAction || typedAction);
  const sameOrigin = Boolean(path);
  const roleAllowed = routeRecord ? roleAllows(routeRecord.required_role, normalizedActor) : true;
  const workspaceAllowed = routeRecord ? workspaceAllows(routeRecord, normalizedActor, target) : true;
  const actionAllowed = Boolean(typedPermission.allowed) && (!requireRegisteredAction || actionRegistered);
  const ok = Boolean(sameOrigin && routeRegistered && roleAllowed && workspaceAllowed && actionAllowed);
  const fallback = ok ? null : fallbackForActor(normalizedActor, routeRecord);
  const denialReasons = [];
  if (!sameOrigin) denialReasons.push('non_same_origin_or_invalid_route');
  if (!routeRegistered) denialReasons.push('route_not_registered');
  if (!roleAllowed) denialReasons.push('role_not_allowed');
  if (!workspaceAllowed) denialReasons.push('workspace_scope_mismatch');
  if (!actionAllowed) denialReasons.push(typedPermission.reason || 'action_not_registered_or_not_allowed');
  const canonicalPath = routeRecord?.canonical_target || routeRecord?.route || path || null;
  const authorizationResult = ok
    ? 'allowed'
    : denialReasons.join(',') || 'blocked';

  return {
    ok,
    path: ok ? path : null,
    attempted_path: path || null,
    canonical_path: ok ? canonicalPath : null,
    route_key: routeRecord?.surface || null,
    route: routeRecord?.route || null,
    access: routeRecord?.access || null,
    required_role: routeRecord?.required_role || null,
    role: normalizedActor.role,
    workspace_key: normalizedActor.workspace_key || null,
    project_key: normalizedActor.project_key || null,
    section: targetSection(target),
    expected_page_landmark: routeExpectedLandmark(routeRecord || {}, target) || null,
    why_correct: ok
      ? (reason || `Resolved through registered route ${routeRecord?.surface || routeRecord?.route || path}`)
      : `Blocked by ${authorizationResult}`,
    authorization_result: authorizationResult,
    public_allowed: Boolean(routeRecord?.public_allowed),
    scope: {
      role: normalizedActor.role,
      workspace_key: normalizedActor.workspace_key || null,
      project_key: normalizedActor.project_key || null,
      channel,
    },
    action_key: registeredAction?.action_id || actionKey || null,
    helper_tool: registeredAction?.helper_tool || helperTool || null,
    action_id: typedAction?.action_id || actionId || null,
    reason: ok ? (reason || 'registry_resolved') : denialReasons.join(','),
    fallback,
    checks: {
      same_origin: sameOrigin,
      route_registered: routeRegistered,
      action_registered: actionRegistered,
      role_allowed: roleAllowed,
      workspace_allowed: workspaceAllowed,
      typed_action_allowed: Boolean(typedPermission.allowed),
      browser_click_substitution_allowed: false,
    },
  };
}

function evaluateHelperIntentMatrix(cases = []) {
  return cases.map((item) => {
    const result = resolveHelperDestination(item);
    const expectedOk = Object.prototype.hasOwnProperty.call(item, 'expected_ok') ? Boolean(item.expected_ok) : true;
    const expectedPath = item.expected_path || null;
    const passed = result.ok === expectedOk && (!expectedPath || result.path === expectedPath || result.fallback?.path === expectedPath);
    return {
      case_id: item.case_id || item.intent || item.target?.route || 'case',
      passed,
      expected_ok: expectedOk,
      expected_path: expectedPath,
      result,
    };
  });
}

module.exports = {
  buildOperationsPath,
  evaluateHelperIntentMatrix,
  findRegisteredAction,
  findRouteRecord,
  loadActionRegistry,
  loadRouteRegistry,
  resolveHelperDestination,
};
