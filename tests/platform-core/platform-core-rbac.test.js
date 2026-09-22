const assert = require('node:assert/strict');
const test = require('node:test');

const { buildPlatformContext } = require('../../src/platform/core');
const { canAccess, listVisibleModules } = require('../../src/platform/rbac');

function contextFor(role, {
  actorId = `${role}-actor`,
  personId = `${role}-person`,
  studentId = '',
  instanceId = 'instance-bna',
  workspaceId = 'workspace-bna',
  status = 'active',
  global = false,
  assignedRunIds = [],
} = {}) {
  return buildPlatformContext({
    instance: { id: instanceId, slug: instanceId, deployment_mode: 'saas_tenant' },
    organization: { id: `${instanceId}-org`, slug: `${instanceId}-org` },
    workspace: { id: workspaceId, workspace_key: workspaceId, project_key: workspaceId, instance_id: instanceId },
    actor: {
      id: actorId,
      person_id: personId,
      student_id: studentId,
      role,
      global_super_admin: global,
    },
    memberships: [
      {
        actor_id: actorId,
        instance_id: instanceId,
        workspace_id: workspaceId,
        role,
        status,
        global_access: global,
        assigned_run_ids: assignedRunIds,
      },
    ],
  });
}

test('cross-workspace reads and mutations are denied', () => {
  const context = contextFor('workspace_admin');

  assert.equal(canAccess(context, 'course:create', { instance_id: 'instance-bna', workspace_id: 'workspace-bna' }).allowed, true);

  const readDenied = canAccess(context, 'course:read', { instance_id: 'instance-bna', workspace_id: 'workspace-one-time' });
  assert.equal(readDenied.allowed, false);
  assert.match(readDenied.reason, /workspace scope mismatch|active workspace membership/);

  const writeDenied = canAccess(context, 'community:create', { instance_id: 'instance-bna', workspace_id: 'workspace-one-time' });
  assert.equal(writeDenied.allowed, false);
  assert.match(writeDenied.reason, /workspace scope mismatch|active workspace membership/);
});

test('cross-instance access is denied unless global super admin is explicit', () => {
  const context = contextFor('instance_owner', { instanceId: 'instance-bna', workspaceId: 'workspace-bna' });

  const denied = canAccess(context, 'workspace:read', { instance_id: 'instance-one-time', workspace_id: 'workspace-one-time' });
  assert.equal(denied.allowed, false);
  assert.match(denied.reason, /instance scope mismatch/);

  const globalSuper = contextFor('super_admin', {
    instanceId: 'instance-bna',
    workspaceId: 'internal-super-admin',
    global: true,
  });
  assert.equal(
    canAccess(globalSuper, 'workspace:read', { instance_id: 'instance-one-time', workspace_id: 'workspace-one-time' }).allowed,
    true
  );
});

test('One Time workspace roles cannot enumerate BNA or family records', () => {
  const oneTime = contextFor('workspace_admin', {
    actorId: 'one-time-admin',
    instanceId: 'instance-bna',
    workspaceId: 'workspace-one-time',
  });

  for (const workspaceId of ['workspace-bna', 'workspace-family']) {
    const permission = canAccess(oneTime, 'workspace:read', { instance_id: 'instance-bna', workspace_id: workspaceId });
    assert.equal(permission.allowed, false, workspaceId);
  }

  assert.equal(
    canAccess(oneTime, 'workspace:read', { instance_id: 'instance-bna', workspace_id: 'workspace-one-time' }).allowed,
    true
  );
});

test('normal clients cannot access infrastructure or global settings', () => {
  const clientAdmin = contextFor('workspace_admin');
  const instanceOwner = contextFor('instance_owner');

  const denied = canAccess(clientAdmin, 'infrastructure:read', { instance_id: 'instance-bna', workspace_id: 'workspace-bna' });
  assert.equal(denied.allowed, false);
  assert.match(denied.reason, /infrastructure settings/);

  assert.equal(
    canAccess(instanceOwner, 'infrastructure:read', { instance_id: 'instance-bna', workspace_id: 'workspace-bna' }).allowed,
    true
  );
});

test('verifier access is limited to assigned runs', () => {
  const verifier = contextFor('agent_verifier', {
    actorId: 'verifier-1',
    workspaceId: 'workspace-bna',
    assignedRunIds: ['run-allowed'],
  });

  assert.equal(
    canAccess(verifier, 'agent_run:verify_assigned', { instance_id: 'instance-bna', workspace_id: 'workspace-bna', id: 'run-allowed' }).allowed,
    true
  );

  const denied = canAccess(verifier, 'agent_run:verify_assigned', {
    instance_id: 'instance-bna',
    workspace_id: 'workspace-bna',
    id: 'run-other',
  });
  assert.equal(denied.allowed, false);
  assert.match(denied.reason, /assigned runs/);
});

test('disabled membership loses access even when the actor carries a role label', () => {
  const disabled = contextFor('workspace_admin', { status: 'disabled' });
  const permission = canAccess(disabled, 'course:create', { instance_id: 'instance-bna', workspace_id: 'workspace-bna' });
  assert.equal(permission.allowed, false);
  assert.match(permission.reason, /active workspace membership/);
});

test('student and member self-view rules cannot read another record', () => {
  const student = contextFor('student', {
    actorId: 'student-actor',
    personId: 'person-student-1',
    studentId: 'student-1',
  });

  assert.equal(
    canAccess(student, 'student:self_read', {
      instance_id: 'instance-bna',
      workspace_id: 'workspace-bna',
      student_id: 'student-1',
    }).allowed,
    true
  );

  const denied = canAccess(student, 'student:self_read', {
    instance_id: 'instance-bna',
    workspace_id: 'workspace-bna',
    student_id: 'student-2',
  });
  assert.equal(denied.allowed, false);
  assert.match(denied.reason, /own record/);
});

test('module visibility respects role and workspace scope', () => {
  const teacher = contextFor('teacher');
  const modules = [
    { key: 'courses', workspace_id: 'workspace-bna', required_permission: 'course:read', visibility: { roles: ['teacher'] } },
    { key: 'rewards', workspace_id: 'workspace-bna', required_permission: 'reward:manage', visibility: { roles: ['workspace_admin'] } },
    { key: 'other-workspace', workspace_id: 'workspace-one-time', required_permission: 'course:read' },
  ];
  assert.deepEqual(listVisibleModules(teacher, modules).map((module) => module.key), ['courses']);
});
