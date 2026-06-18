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
