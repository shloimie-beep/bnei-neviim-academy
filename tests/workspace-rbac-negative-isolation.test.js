const assert = require('node:assert/strict');
const test = require('node:test');

const { buildToolRegistry } = require('../src/lib/bna/helper/tool-registry');
const { helperPermissionForTool } = require('../src/lib/bna/helper/permissions');

function permission(toolName, context, args = {}) {
  const registry = buildToolRegistry();
  return helperPermissionForTool(registry.get(toolName), context, args);
}

test('provider scoped helpers cannot cross provider or use admin secret tools', () => {
  const context = {
    userRole: 'provider',
    providerId: 41,
    identity: { role: 'provider', scope: { type: 'provider', providerId: 41 } },
  };

  assert.equal(permission('draft_email', context, { provider_id: 41 }).allowed, true);

  const otherProvider = permission('draft_email', context, { provider_id: 42 });
  assert.equal(otherProvider.allowed, false);
  assert.match(otherProvider.reason, /provider scope mismatch/);

  const secretTool = permission('save_provider_api_key', context, { provider_id: 41 });
  assert.equal(secretTool.allowed, false);
  assert.match(secretTool.reason, /provider helper cannot use admin\/private BNA tools/);
});

test('parent scoped helpers cannot cross families or create admin/student records', () => {
  const context = {
    userRole: 'parent',
    identity: { role: 'parent', scope: { type: 'parent', familyId: 'fam-100' } },
  };

  assert.equal(permission('draft_email', context, { family_id: 'fam-100' }).allowed, true);

  const otherFamily = permission('draft_email', context, { family_id: 'fam-200' });
  assert.equal(otherFamily.allowed, false);
  assert.match(otherFamily.reason, /parent\/family scope mismatch/);

  const createStudent = permission('create_student', context, { family_id: 'fam-100' });
  assert.equal(createStudent.allowed, false);
  assert.match(createStudent.reason, /parent helper cannot use admin, provider, or other-family tools/);
});

test('student scoped helpers remain student-safe and cannot act for another student', () => {
  const context = {
    userRole: 'student',
    studentId: 7001,
    identity: { role: 'student', scope: { type: 'student', studentId: 7001 } },
  };

  assert.equal(permission('request_missing_input', context, { student_id: 7001 }).allowed, true);

  const otherStudent = permission('request_missing_input', context, { student_id: 7002 });
  assert.equal(otherStudent.allowed, false);
  assert.match(otherStudent.reason, /student scope mismatch/);

  const taskTool = permission('create_task', context, { student_id: 7001 });
  assert.equal(taskTool.allowed, false);
  assert.match(taskTool.reason, /student helper is student-safe only/);
});
