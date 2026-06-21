const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  ONE_TIME_CANONICAL_ROLES,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  canOneTimeIdentity,
  decorateOneTimeIdentity,
} = require('../src/lib/bna/one-time-role-model');
const { normalizeRole, roleHasPermission } = require('../src/platform/rbac');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

test('workspace user role vocabulary is available in One Time and platform RBAC', () => {
  assert.equal(ONE_TIME_CANONICAL_ROLES.PLATFORM_MANAGER, 'platform_manager');
  assert.equal(ONE_TIME_CANONICAL_ROLES.SUPPORT_ADMIN, 'support_admin');
  assert.equal(ONE_TIME_CANONICAL_ROLES.TECHNICAL_AGENT, 'technical_agent');
  assert.equal(ONE_TIME_CANONICAL_ROLES.MODERATOR, 'moderator');
  assert.equal(normalizeRole('project_manager'), 'workspace_manager');
  assert.equal(normalizeRole('provider_staff'), 'provider_staff');
  assert.equal(normalizeRole('parent'), 'parent');
  assert.equal(roleHasPermission('workspace_manager', 'member:invite'), true);
  assert.equal(roleHasPermission('provider_staff', 'course:progress:write'), true);
});

test('scoped One Time manager cannot assign platform roles or cross-workspace users', () => {
  const manager = decorateOneTimeIdentity({
    username: 'shloimie-admin@example.test',
    role: 'project_manager',
    scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY },
  });

  const platformAssignment = canOneTimeIdentity('change_workspace_role', manager, {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    target_role: ONE_TIME_CANONICAL_ROLES.PLATFORM_MANAGER,
  });
  assert.equal(platformAssignment.allowed, false);
  assert.match(platformAssignment.reason, /Platform Super Admin/);

  const crossWorkspace = canOneTimeIdentity('read_workspace_users', manager, {
    workspace_key: 'bna',
    project_key: 'bna',
  });
  assert.equal(crossWorkspace.allowed, false);
  assert.match(crossWorkspace.reason, /workspace scope mismatch/);
});

test('server exposes scoped no-send workspace user management with audit logging', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_platform_role_audit_events/);
  assert.match(server, /ALTER TABLE bna_workspace_memberships ADD COLUMN IF NOT EXISTS invitation_state/);
  assert.match(server, /function requireWorkspaceUserPermission/);
  assert.match(server, /canOneTimeIdentity\(oneTimeAction, identity/);
  assert.match(server, /app\.get\('\/api\/bna\/workspace-users'/);
  assert.match(server, /app\.post\('\/api\/bna\/workspace-users'/);
  assert.match(server, /app\.patch\('\/api\/bna\/workspace-users\/:id'/);
  assert.match(server, /app\.get\('\/api\/bna\/workspace-users\/role-audit'/);
  assert.match(server, /no_send: true/);
  assert.match(server, /external_write_performed: false/);
  assert.match(server, /workspace_user_invited/);
  assert.match(server, /workspace_user_deactivated/);
  assert.match(server, /workspace_user_reactivated/);
  assert.match(server, /workspace_membership_archived/);
});

test('scoped Operations allowlist includes workspace user routes only for safe methods', () => {
  assert.match(server, /routePath === '\/api\/bna\/workspace-users' && \['GET', 'POST'\]\.includes\(method\)/);
  assert.match(server, /routePath === '\/api\/bna\/workspace-users\/role-audit' && method === 'GET'/);
  assert.match(server, /\^\\\/api\\\/bna\\\/workspace-users\\\/\\d\+\$/);
});

test('Operations Users screen has real workspace membership actions and no-send blockers', () => {
  assert.match(operations, /getWorkspaceUsers\(filters = \{\}\)/);
  assert.match(operations, /createWorkspaceUser\(payload = \{\}\)/);
  assert.match(operations, /updateWorkspaceUser\(id, payload = \{\}\)/);
  assert.match(operations, /getWorkspaceRoleAudit\(filters = \{\}\)/);
  assert.match(operations, /data-workspace-user-create-form/);
  assert.match(operations, /Add Member \/ Invite User/);
  assert.match(operations, /Invite User/);
  assert.match(operations, /Assign Role/);
  assert.match(operations, /Deactivate/);
  assert.match(operations, /Reactivate/);
  assert.match(operations, /Remove Membership/);
  assert.match(operations, /data-workspace-role-audit-log/);
  assert.match(operations, /No-send/);
  assert.doesNotMatch(operations, /showNotConfigured\('Provider users'\)/);
});
