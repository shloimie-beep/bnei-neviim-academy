const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  createSuperAdminIdentity,
  createWorkspaceIdentity
} = require('../src/lib/bna/workspace-scope');
const {
  assertScopedTaskAccess,
  scopedRouteAllowed,
  scopedTaskAccessAllowed
} = require('../src/lib/bna/workspace-auth');

const repoRoot = path.resolve(__dirname, '..');

function oneTimeIdentity() {
  return createWorkspaceIdentity({
    username: 'rabbi',
    workspaceType: 'service_provider',
    workspaceKey: 'one_time_mishnah_class',
    projectKey: 'one_time_mishnah_class',
    allowedViews: ['tasks', 'calendar']
  });
}

function accountingIdentity() {
  return createWorkspaceIdentity({
    username: 'bookkeeper',
    workspaceType: 'school',
    workspaceKey: 'bna',
    projectKey: 'bna',
    allowedViews: ['tasks', 'calendar', 'accounting']
  });
}

function studentIdentity() {
  return createWorkspaceIdentity({
    username: 'student-ops',
    workspaceType: 'school',
    workspaceKey: 'bna',
    projectKey: 'bna',
    allowedViews: ['tasks', 'calendar', 'students']
  });
}

test('super admin can reach scoped and cross-module operation routes intentionally', () => {
  const identity = createSuperAdminIdentity('Shloimie', ['tasks', 'students', 'content']);

  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/students', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/content-jobs', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/payments', method: 'GET' }), true);
});

test('ordinary workspace users cannot enumerate students accounting content or users routes', () => {
  const identity = oneTimeIdentity();

  for (const pathName of [
    '/api/bna/students',
    '/api/bna/signups',
    '/api/bna/payment-intake',
    '/api/bna/payments',
    '/api/bna/content-jobs',
    '/api/bna/class-sessions',
    '/api/bna/content-bundles',
    '/api/bna/pending-briefs',
    '/api/bna/agent-fleet/status'
  ]) {
    assert.equal(scopedRouteAllowed(identity, { path: pathName, method: 'GET' }), false, pathName);
  }
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/agent-fleet/status', method: 'POST' }), false);
});

test('ordinary workspace users may use only scoped task routes and safe shared context routes', () => {
  const identity = oneTimeIdentity();

  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/tasks', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/tasks', method: 'POST' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/tasks/42', method: 'PATCH' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/tasks/42/comments', method: 'POST' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/calendar', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/automations/status', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/integrations/status', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/users', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/invitations', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/projects', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/auth/me', method: 'GET' }), true);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/automations/status', method: 'POST' }), false);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/integrations/status', method: 'POST' }), false);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/users', method: 'POST' }), false);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/invitations', method: 'POST' }), false);
});

test('workspace users with accounting view may use only scoped accounting routes', () => {
  const identity = accountingIdentity();

  for (const { method, path: pathName } of [
    { method: 'GET', path: '/api/bna/signups' },
    { method: 'GET', path: '/api/bna/payments' },
    { method: 'POST', path: '/api/bna/payments' },
    { method: 'GET', path: '/api/bna/payment-intake' },
    { method: 'POST', path: '/api/bna/payment-intake' },
    { method: 'PATCH', path: '/api/bna/payment-intake/7' },
    { method: 'DELETE', path: '/api/bna/payment-intake/7' },
    { method: 'POST', path: '/api/bna/payment-intake/reconcile-paid' },
    { method: 'GET', path: '/api/bna/payment-reminders/due' },
    { method: 'POST', path: '/api/bna/payment-reminders/run' },
    { method: 'GET', path: '/api/bna/green-invoice/webhooks' },
    { method: 'POST', path: '/api/bna/green-invoice/webhooks/7/reprocess' }
  ]) {
    assert.equal(scopedRouteAllowed(identity, { path: pathName, method }), true, `${method} ${pathName}`);
  }

  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/students', method: 'GET' }), false);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/agent-fleet/status', method: 'GET' }), false);
});

test('workspace users with students view may use only scoped student routes', () => {
  const identity = studentIdentity();

  for (const { method, path: pathName } of [
    { method: 'GET', path: '/api/bna/students' },
    { method: 'POST', path: '/api/bna/students' },
    { method: 'PATCH', path: '/api/bna/students/7' },
    { method: 'DELETE', path: '/api/bna/students/7' },
    { method: 'POST', path: '/api/bna/students/7/access-code' },
    { method: 'POST', path: '/api/bna/students/7/merge' },
    { method: 'GET', path: '/api/bna/devices' },
    { method: 'POST', path: '/api/bna/students/7/devices' },
    { method: 'PATCH', path: '/api/bna/devices/7' },
    { method: 'POST', path: '/api/bna/devices/7/actions' },
    { method: 'GET', path: '/api/bna/device-access-rules' },
    { method: 'POST', path: '/api/bna/device-access-rules' },
    { method: 'PATCH', path: '/api/bna/device-access-rules/7' },
    { method: 'GET', path: '/api/bna/students/7/goal-board' },
    { method: 'POST', path: '/api/bna/students/7/goal-board' },
    { method: 'PATCH', path: '/api/bna/goal-board/7' },
    { method: 'GET', path: '/api/bna/accountability' },
    { method: 'POST', path: '/api/bna/accountability' },
    { method: 'PATCH', path: '/api/bna/accountability/7' },
    { method: 'DELETE', path: '/api/bna/accountability/7' },
    { method: 'GET', path: '/api/bna/group-goals' },
    { method: 'POST', path: '/api/bna/group-goals' },
    { method: 'POST', path: '/api/bna/group-goals/7/entries' },
    { method: 'GET', path: '/api/bna/torah-learning' },
    { method: 'POST', path: '/api/bna/torah-learning/entries' },
    { method: 'POST', path: '/api/bna/torah-learning/reconcile-trip-progress' }
  ]) {
    assert.equal(scopedRouteAllowed(identity, { path: pathName, method }), true, `${method} ${pathName}`);
  }

  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/payments', method: 'GET' }), false);
  assert.equal(scopedRouteAllowed(identity, { path: '/api/bna/content-jobs', method: 'GET' }), false);
});

test('ordinary workspace users cannot access another project task row by changing ID', () => {
  const identity = oneTimeIdentity();

  assert.equal(scopedTaskAccessAllowed(identity, { id: 1, project_key: 'bna' }), false);
  assert.throws(
    () => assertScopedTaskAccess(identity, { id: 1, project_key: 'bna' }),
    /scoped workspace tasks/
  );
});

test('ordinary workspace users can access only their own workspace task row', () => {
  const identity = oneTimeIdentity();

  assert.equal(scopedTaskAccessAllowed(identity, { id: 2, project_key: 'one_time_mishnah_class' }), true);
  assert.doesNotThrow(() => assertScopedTaskAccess(identity, { id: 2, project_key: 'one_time_mishnah_class' }));
});

test('server middleware and direct task access use the shared workspace auth helper', () => {
  const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');

  assert.match(server, /scopedRouteAllowed\(req\.opsIdentity/);
  assert.match(server, /assertScopedTaskAccess\(req\.opsIdentity, task/);
  assert.match(server, /INSERT INTO bna_task_comments \(workspace_id, task_id/);
});
