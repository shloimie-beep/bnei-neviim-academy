const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  SUPER_ADMIN_ROLE,
  WORKSPACE_TYPES,
  assertWorkspaceType,
  createSuperAdminIdentity,
  createWorkspaceIdentity,
  isGlobalOpsScope,
  normalizeWorkspaceType
} = require('../src/lib/bna/workspace-scope');

const repoRoot = path.resolve(__dirname, '..');

test('workspace taxonomy has exactly the three BNA workspace types', () => {
  assert.deepEqual(WORKSPACE_TYPES, ['school', 'service_provider', 'family']);
  assert.equal(SUPER_ADMIN_ROLE, 'super_admin');
  assert.equal(WORKSPACE_TYPES.includes('super_admin'), false);
});

test('workspace aliases normalize without creating a super-admin workspace type', () => {
  assert.equal(normalizeWorkspaceType('school'), 'school');
  assert.equal(normalizeWorkspaceType('BNA'), 'school');
  assert.equal(normalizeWorkspaceType('service provider'), 'service_provider');
  assert.equal(normalizeWorkspaceType('family'), 'family');
  assert.equal(normalizeWorkspaceType('super_admin'), '');
  assert.throws(() => assertWorkspaceType('super_admin'), /Invalid workspace type/);
});

test('super admin identity is a global role/context, not a workspace', () => {
  const identity = createSuperAdminIdentity('Shloimie', ['tasks']);
  assert.equal(identity.role, 'super_admin');
  assert.deepEqual(identity.scope, {
    type: 'global',
    workspaceType: null,
    workspaceKey: null,
    projectKey: null
  });
  assert.equal(isGlobalOpsScope(identity.scope), true);
});

test('service-provider scoped identity keeps project compatibility without project role leakage', () => {
  const identity = createWorkspaceIdentity({
    username: 'rabbi',
    workspaceType: 'service_provider',
    workspaceKey: 'one_time_mishnah_class',
    projectKey: 'one_time_mishnah_class',
    allowedViews: ['tasks']
  });

  assert.equal(identity.role, 'workspace_member');
  assert.equal(identity.scope.type, 'workspace');
  assert.equal(identity.scope.workspaceType, 'service_provider');
  assert.equal(identity.scope.projectKey, 'one_time_mishnah_class');
  assert.equal(isGlobalOpsScope(identity.scope), false);
});

test('server auth identity uses workspace taxonomy helpers', () => {
  const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');

  assert.match(server, /createSuperAdminIdentity\(user/);
  assert.match(server, /workspaceType: 'service_provider'/);
  assert.match(server, /role: 'workspace_member'/);
  assert.match(server, /isGlobalOpsScope\(identity\.scope\)/);
  assert.doesNotMatch(server, /role: 'project_member'/);
  assert.doesNotMatch(server, /scope: \{ type: 'all'/);
});
