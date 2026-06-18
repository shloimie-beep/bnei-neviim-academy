const { isGlobalOpsScope } = require('./workspace-scope');

const SCOPED_TASK_ROUTE_PATTERNS = [
  { method: 'GET', pattern: /^\/api\/bna\/tasks$/ },
  { method: 'POST', pattern: /^\/api\/bna\/tasks$/ },
  { method: 'POST', pattern: /^\/api\/bna\/tasks\/create-from-text$/ },
  { method: 'POST', pattern: /^\/api\/bna\/create_task_from_text$/ },
  { method: 'GET', pattern: /^\/api\/bna\/tasks\/\d+$/ },
  { method: 'PATCH', pattern: /^\/api\/bna\/tasks\/\d+$/ },
  { method: 'GET', pattern: /^\/api\/bna\/tasks\/\d+\/comments$/ },
  { method: 'POST', pattern: /^\/api\/bna\/tasks\/\d+\/comments$/ }
];

const SCOPED_SHARED_ROUTE_PATTERNS = [
  { method: 'GET', pattern: /^\/operations$/ },
  { method: 'GET', pattern: /^\/api\/bna\/auth\/me$/ },
  { method: 'GET', pattern: /^\/api\/bna\/projects$/ },
  { method: 'GET', pattern: /^\/api\/bna\/calendar$/ },
  { method: 'GET', pattern: /^\/api\/bna\/automations\/status$/ },
  { method: 'GET', pattern: /^\/api\/bna\/integrations\/status$/ },
  { method: 'GET', pattern: /^\/api\/bna\/users$/ },
  { method: 'GET', pattern: /^\/api\/bna\/invitations$/ }
];

function normalizeProjectKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function scopedRouteAllowed(identity, { path, method }) {
  if (isGlobalOpsScope(identity?.scope)) return true;
  const routePath = String(path || '');
  const routeMethod = String(method || '').toUpperCase();
  const allowedPatterns = [...SCOPED_SHARED_ROUTE_PATTERNS, ...SCOPED_TASK_ROUTE_PATTERNS];
  return allowedPatterns.some((entry) => entry.method === routeMethod && entry.pattern.test(routePath));
}

function scopedTaskAccessAllowed(identity, task = {}) {
  if (isGlobalOpsScope(identity?.scope)) return true;
  const scopedProjectKey = normalizeProjectKey(identity?.scope?.projectKey || identity?.scope?.workspaceKey);
  if (!scopedProjectKey) return false;
  return normalizeProjectKey(task.project_key) === scopedProjectKey;
}

function assertScopedTaskAccess(identity, task = {}, message = 'This login can only access its scoped workspace tasks.') {
  if (scopedTaskAccessAllowed(identity, task)) return;
  const error = new Error(message);
  error.statusCode = 403;
  throw error;
}

module.exports = {
  assertScopedTaskAccess,
  scopedRouteAllowed,
  scopedTaskAccessAllowed
};
