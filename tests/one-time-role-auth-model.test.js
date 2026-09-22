const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  ONE_TIME_CANONICAL_ROLES,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeRoleChangeAuditEvent,
  canOneTimeIdentity,
  canReadParentChildLink,
  canReadStudentEnrollment,
  decorateOneTimeIdentity,
  filterOneTimeUsersForIdentity,
  oneTimeCanonicalOwnerAssignments,
  oneTimeRoleAccessMatrix,
} = require('../src/lib/bna/one-time-role-model');

const root = path.resolve(__dirname, '..');
const serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const operationsHtml = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');

function oneTimeOwnerIdentity() {
  return decorateOneTimeIdentity({
    username: 'rabbi-owner@example.test',
    role: 'project_owner',
    scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY },
    displayName: 'Rabbi Ellie Scheller',
  });
}

function oneTimeManagerIdentity() {
  return decorateOneTimeIdentity({
    username: 'shloimie-admin@example.test',
    role: 'project_manager',
    scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY },
    displayName: 'Shloimie',
  });
}

test('One Time canonical assignments name Rabbi Scheller and Shloimie without changing legacy roles', () => {
  assert.deepEqual(oneTimeCanonicalOwnerAssignments(), [
    {
      person_name: 'Rabbi Ellie Scheller',
      legacy_person_names: ['Rabbi Elie Scheller', 'Rabbi Sheller', 'Rabbi Scheller'],
      canonical_role: ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
      canonical_roles: [
        ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
        ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
      ],
      canonical_role_label: 'Workspace Owner',
      compatibility_role: 'project owner',
      identity_role: 'project_owner',
      access_level: 'owner',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      account_type: 'external_user',
    },
    {
      person_name: 'Shloimie',
      canonical_role: ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
      canonical_roles: [
        ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN,
        ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER,
      ],
      canonical_role_label: 'Workspace Admin',
      platform_role: ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN,
      platform_role_label: 'Platform Super Admin',
      compatibility_role: 'project admin',
      identity_role: 'project_manager',
      access_level: 'manager',
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      account_type: 'internal_admin',
    },
  ]);
});

test('server identity payload exposes canonical One Time role metadata with backwards-compatible roles', () => {
  assert.match(serverJs, /decorateOneTimeIdentity\(\{[\s\S]*role: 'project_owner'[\s\S]*displayName: 'Rabbi Ellie Scheller'/);
  assert.match(serverJs, /decorateOneTimeIdentity\(\{[\s\S]*role: 'project_manager'[\s\S]*displayName: 'Shloimie'/);
  assert.match(serverJs, /canonical_role: identity\?\.canonical_role/);
  assert.match(serverJs, /workspace_role_label: identity\?\.workspace_role_label/);
  assert.match(serverJs, /canonical_role_label: oneTimeOwnerCanonical\.canonical_role_label/);
  assert.match(serverJs, /platform_role: oneTimeManagerCanonical\.platform_role/);
});

test('decorated One Time identities keep route roles while adding canonical labels', () => {
  const owner = oneTimeOwnerIdentity();
  assert.equal(owner.role, 'project_owner');
  assert.equal(owner.workspace_role, ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER);
  assert.equal(owner.workspace_role_label, 'Workspace Owner');
  assert.equal(owner.scope.workspaceKey, ONE_TIME_WORKSPACE_KEY);

  const manager = oneTimeManagerIdentity();
  assert.equal(manager.role, 'project_manager');
  assert.equal(manager.workspace_role, ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER);
  assert.equal(manager.workspace_role_label, 'Workspace Manager');
  assert.equal(manager.platform_role, '');

  const superAdmin = decorateOneTimeIdentity({ username: 'ops', role: 'super_admin', scope: { type: 'all', projectKey: null } });
  assert.equal(superAdmin.platform_role, ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN);
  assert.ok(superAdmin.canonical_roles.includes(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN));
});

test('One Time user list filtering excludes unrelated BNA and family users', () => {
  const users = [
    { id: 1, person_name: 'Rabbi Elie Scheller', role: 'project owner', access_level: 'owner', project_key: ONE_TIME_PROJECT_KEY, workspace_key: ONE_TIME_WORKSPACE_KEY },
    { id: 2, person_name: 'Shloimie', role: 'project admin', access_level: 'manager', project_key: ONE_TIME_PROJECT_KEY, workspace_key: ONE_TIME_WORKSPACE_KEY },
    { id: 3, person_name: 'One Time Parent', role: 'parent', project_scope: ONE_TIME_PROJECT_KEY, account_type: 'member_parent' },
    { id: 4, person_name: 'BNA Parent', role: 'parent', project_key: 'bna', workspace_key: 'bna' },
    { id: 5, person_name: 'Family Child', role: 'child', workspace_key: 'dratler_family' },
  ];

  const visible = filterOneTimeUsersForIdentity(users, oneTimeOwnerIdentity());
  assert.deepEqual(visible.map((item) => item.person_name), ['Rabbi Ellie Scheller', 'Shloimie', 'One Time Parent']);
  assert.ok(visible.every((item) => item.workspace_key === ONE_TIME_WORKSPACE_KEY));
  assert.ok(visible.every((item) => item.project_key === ONE_TIME_PROJECT_KEY));
});

test('One Time role vocabulary includes platform, workspace, and member roles', () => {
  assert.equal(ONE_TIME_CANONICAL_ROLES.PLATFORM_SUPER_ADMIN, 'platform_super_admin');
  assert.equal(ONE_TIME_CANONICAL_ROLES.PLATFORM_MANAGER, 'platform_manager');
  assert.equal(ONE_TIME_CANONICAL_ROLES.SUPPORT_ADMIN, 'support_admin');
  assert.equal(ONE_TIME_CANONICAL_ROLES.TECHNICAL_AGENT, 'technical_agent');
  assert.equal(ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER, 'workspace_owner');
  assert.equal(ONE_TIME_CANONICAL_ROLES.WORKSPACE_ADMIN, 'workspace_admin');
  assert.equal(ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER, 'workspace_manager');
  assert.equal(ONE_TIME_CANONICAL_ROLES.AI_STUDIO_OPERATOR, 'ai_studio_operator');
  assert.equal(ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER, 'ai_video_worker');
  assert.equal(ONE_TIME_CANONICAL_ROLES.PROVIDER_STAFF, 'provider_staff');
  assert.equal(ONE_TIME_CANONICAL_ROLES.MODERATOR, 'moderator');
  assert.equal(ONE_TIME_CANONICAL_ROLES.PARENT, 'parent');
  assert.equal(ONE_TIME_CANONICAL_ROLES.STUDENT, 'student');
});

test('One Time AI video worker has a scoped Studio and task-manager access matrix only', () => {
  const worker = decorateOneTimeIdentity({
    username: 'video-worker@example.test',
    role: 'one_time_ai_video_worker',
    scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY },
    displayName: 'AI Video Worker',
  });
  const matrix = oneTimeRoleAccessMatrix(worker.role);

  assert.equal(worker.role, 'one_time_ai_video_worker');
  assert.equal(worker.workspace_role, ONE_TIME_CANONICAL_ROLES.AI_VIDEO_WORKER);
  assert.equal(worker.workspace_role_label, 'AI Video Worker');
  assert.equal(worker.role_contract, 'one-time-ai-video-worker-v1');
  assert.equal(worker.scope.workspaceKey, ONE_TIME_WORKSPACE_KEY);
  assert.deepEqual(matrix.allowed_views, ['studio', 'tasks']);
  assert.ok(matrix.allowed_route_groups.includes('one_time_studio'));
  assert.ok(matrix.allowed_route_groups.includes('one_time_task_manager'));
  assert.ok(matrix.denied_route_groups.includes('contacts_crm'));
  assert.ok(matrix.denied_route_groups.includes('raw_shell_codex_deploy'));
  assert.equal(canOneTimeIdentity('read_workspace_users', worker, { workspace_key: ONE_TIME_WORKSPACE_KEY }).allowed, false);
  assert.equal(canOneTimeIdentity('read_workspace_users', worker, { workspace_key: 'bna', project_key: 'bna' }).allowed, false);
});

test('One Time role permissions deny cross-workspace writes and protect workspace owner changes', () => {
  const owner = oneTimeOwnerIdentity();
  const manager = oneTimeManagerIdentity();

  assert.equal(canOneTimeIdentity('read_workspace_users', owner, { workspace_key: ONE_TIME_WORKSPACE_KEY }).allowed, true);
  const crossWorkspace = canOneTimeIdentity('read_workspace_users', owner, { workspace_key: 'bna', project_key: 'bna' });
  assert.equal(crossWorkspace.allowed, false);
  assert.match(crossWorkspace.reason, /workspace scope mismatch/);

  const managerOwnerChange = canOneTimeIdentity('change_workspace_role', manager, {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    target_role: ONE_TIME_CANONICAL_ROLES.WORKSPACE_OWNER,
  });
  assert.equal(managerOwnerChange.allowed, false);
  assert.match(managerOwnerChange.reason, /workspace owner/);

  const managerRemoval = canOneTimeIdentity('remove_workspace_user', manager, {
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    target_role: ONE_TIME_CANONICAL_ROLES.PROVIDER_STAFF,
  });
  assert.equal(managerRemoval.allowed, false);
  assert.match(managerRemoval.reason, /Platform Super Admin only/);
});

test('parent and student scoped roles can read only their own One Time links/enrollments', () => {
  const parent = { role: 'parent', scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY }, parent_id: 10 };
  const student = { role: 'student', scope: { type: 'project', projectKey: ONE_TIME_PROJECT_KEY }, student_id: 20 };

  assert.equal(canReadParentChildLink(parent, { workspace_key: ONE_TIME_WORKSPACE_KEY, parent_id: 10, student_id: 20 }).allowed, true);
  const otherChild = canReadParentChildLink(parent, { workspace_key: ONE_TIME_WORKSPACE_KEY, parent_id: 11, student_id: 21 });
  assert.equal(otherChild.allowed, false);
  assert.match(otherChild.reason, /linked children/);

  assert.equal(canReadStudentEnrollment(student, { workspace_key: ONE_TIME_WORKSPACE_KEY, student_id: 20 }).allowed, true);
  const otherEnrollment = canReadStudentEnrollment(student, { workspace_key: ONE_TIME_WORKSPACE_KEY, student_id: 21 });
  assert.equal(otherEnrollment.allowed, false);
  assert.match(otherEnrollment.reason, /own enrollment/);
});

test('role-change audit preview is explicit no-write evidence', () => {
  const event = buildOneTimeRoleChangeAuditEvent({
    actor: oneTimeOwnerIdentity(),
    target: { id: 7, person_name: 'One Time Staff', role: 'provider_staff', workspace_key: ONE_TIME_WORKSPACE_KEY },
    from_role: 'provider_staff',
    to_role: 'workspace_manager',
    reason: 'Staff needs temporary launch help',
  });

  assert.equal(event.event_type, 'one_time_role_change_preview');
  assert.equal(event.external_write_performed, false);
  assert.equal(event.approval_required_for_live_write, true);
  assert.equal(event.allowed, true);
  assert.equal(event.target.canonical_role, ONE_TIME_CANONICAL_ROLES.PROVIDER_STAFF);
  assert.equal(event.to_role, ONE_TIME_CANONICAL_ROLES.WORKSPACE_MANAGER);
});

test('Operations users UI prefers canonical role labels when available', () => {
  assert.match(operationsHtml, /function adminUserRoleLabel\(row\)/);
  assert.match(operationsHtml, /metadata\.canonical_role_label/);
  assert.match(operationsHtml, /opsMe\?\.workspace_role_label/);
  assert.match(operationsHtml, /Workspace Owner/);
});
