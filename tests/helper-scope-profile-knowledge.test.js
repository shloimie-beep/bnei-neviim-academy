const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const { confirmationPolicyForTool } = require('../src/lib/bna/helper/confirmation-gates');
const { normalizeVisibility } = require('../src/lib/bna/helper/knowledge');
const { helperPermissionForTool } = require('../src/lib/bna/helper/permissions');
const { questionnaireForScope } = require('../src/lib/bna/helper/profile');
const { resolveHelperScope } = require('../src/lib/bna/helper/scope');
const { buildToolRegistry } = require('../src/lib/bna/helper/tool-registry');

test('helper scope resolver names admin, Rabbi, provider, parent, student, and family helpers', () => {
  assert.equal(resolveHelperScope({ userRole: 'super_admin', workspaceKey: 'platform', projectKey: 'bna' }).helperName, 'BNA Operations Helper');
  assert.equal(resolveHelperScope({ userRole: 'super_admin', workspaceKey: 'platform', projectKey: 'bna', userName: 'shlomo' }).helperName, "Shlomo's BNA Helper");
  assert.equal(resolveHelperScope({ userRole: 'super_admin', workspaceKey: 'bna', project: { name: 'Bnei Neviim Academy' } }).helperName, 'Bnei Neviim Academy Helper');
  assert.equal(resolveHelperScope({ userRole: 'project_owner', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' }).helperName, 'Rabbi Scheller Helper');
  assert.equal(resolveHelperScope({ userRole: 'project_manager', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class', identity: { displayName: 'Shloimie' } }).helperName, "Shloimie's One Time Helper");
  assert.equal(resolveHelperScope({ userRole: 'provider_admin', workspaceKey: 'provider_demo', identity: { scope: { type: 'provider', providerId: 'p1' } } }).scopeType, 'provider');
  assert.equal(resolveHelperScope({ userRole: 'parent', pageContext: { page: 'parent' }, identity: { scope: { type: 'parent', parentId: 'parent-1' } } }).helperName, 'Parent Helper');
  const student = resolveHelperScope({ userRole: 'student', studentId: 'student-1', identity: { scope: { type: 'student', studentId: 'student-1' } } });
  assert.equal(student.helperName, 'Student Helper');
  assert.equal(student.safetyPolicy.safetyLevel, 'student');
  assert.ok(student.safetyPolicy.avoidRules.some((rule) => /other students/i.test(rule)));
  assert.equal(resolveHelperScope({ userRole: 'parent', workspaceKey: 'family_home' }).scopeType, 'family');
});

test('helper permissions block cross-scope parent, student, and provider access', () => {
  const registry = buildToolRegistry();
  const parentContext = {
    userRole: 'parent',
    identity: { role: 'parent', scope: { type: 'parent', familyId: 'family-1' } },
    helperScope: { scopeType: 'parent' },
  };
  assert.equal(helperPermissionForTool(registry.get('create_task'), parentContext, { family_id: 'family-1' }).allowed, true);
  assert.equal(helperPermissionForTool(registry.get('create_task'), parentContext, { family_id: 'family-2' }).allowed, false);
  assert.equal(helperPermissionForTool(registry.get('send_email'), parentContext, { family_id: 'family-1' }).allowed, false);

  const studentContext = {
    userRole: 'student',
    studentId: 'student-1',
    identity: { role: 'student', scope: { type: 'student', studentId: 'student-1' } },
    helperScope: { scopeType: 'student' },
  };
  assert.equal(helperPermissionForTool(registry.get('request_missing_input'), studentContext, { student_id: 'student-1' }).allowed, true);
  assert.equal(helperPermissionForTool(registry.get('request_missing_input'), studentContext, { student_id: 'student-2' }).allowed, false);
  assert.equal(helperPermissionForTool(registry.get('create_student'), studentContext, { name: 'Other Student' }).allowed, false);

  const providerContext = {
    userRole: 'provider_admin',
    providerId: 'provider-1',
    identity: { role: 'provider_admin', scope: { type: 'provider', providerId: 'provider-1' } },
    helperScope: { scopeType: 'provider' },
  };
  assert.equal(helperPermissionForTool(registry.get('show_integration_status'), providerContext, { provider_id: 'provider-1' }).allowed, true);
  assert.equal(helperPermissionForTool(registry.get('show_integration_status'), providerContext, { provider_id: 'provider-2' }).allowed, false);
  assert.equal(helperPermissionForTool(registry.get('create_student'), providerContext, { provider_id: 'provider-1', name: 'Student' }).allowed, false);
});

test('helper permissions reject workspace switching for project-scoped helpers', () => {
  const registry = buildToolRegistry();
  const context = {
    userRole: 'one_time_admin',
    workspaceKey: 'rabbi_sheller_provider',
    projectKey: 'one_time_mishnah_class',
    identity: {
      role: 'one_time_admin',
      scope: {
        type: 'project',
        workspaceKey: 'rabbi_sheller_provider',
        projectKey: 'one_time_mishnah_class',
      },
    },
    helperScope: {
      scopeType: 'rabbi',
      workspaceKey: 'rabbi_sheller_provider',
    },
    pageContext: {
      workspace: {
        workspaceKey: 'rabbi_sheller_provider',
        projectKey: 'one_time_mishnah_class',
      },
    },
  };

  assert.equal(
    helperPermissionForTool(registry.get('open_operations_view'), context, {
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      view: 'tasks',
    }).allowed,
    true
  );
  assert.equal(
    helperPermissionForTool(registry.get('create_task'), context, {
      workspace_key: 'bna',
      project_key: 'one_time_mishnah_class',
      title: 'Review provider classroom',
    }).allowed,
    false
  );
  assert.equal(
    helperPermissionForTool(registry.get('create_task'), context, {
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'bna',
      title: 'Review provider classroom',
    }).allowed,
    false
  );
});

test('confirmation gates encode external, financial, access, and destructive actions', () => {
  assert.deepEqual(
    confirmationPolicyForTool({ name: 'show_integration_status' }),
    { sideEffectLevel: 'read_only', requiresConfirmation: false, policy: 'safe_without_confirmation' }
  );
  assert.equal(confirmationPolicyForTool({ name: 'send_email' }).requiresConfirmation, true);
  assert.equal(confirmationPolicyForTool({ name: 'update_payment_status' }).sideEffectLevel, 'financial');
  assert.equal(confirmationPolicyForTool({ name: 'create_checkout_draft_only' }).requiresConfirmation, true);
  assert.equal(confirmationPolicyForTool({ name: 'save_provider_api_key' }).sideEffectLevel, 'access_grant');
  assert.equal(confirmationPolicyForTool({ name: 'archive_duplicate_pending' }).sideEffectLevel, 'destructive');
});

test('profile questionnaire keeps student prompts minimal and scoped', () => {
  const studentQuestions = questionnaireForScope('student').join(' ');
  assert.doesNotMatch(studentQuestions, /family dynamics|payment|medical|sensitive/i);
  assert.match(questionnaireForScope('parent').join(' '), /What tone helps you most/);
  assert.match(questionnaireForScope('provider').join(' '), /brand voice/);
  assert.match(questionnaireForScope('rabbi').join(' '), /Teaching voice/i);
});

test('knowledge visibility defaults to scope-safe audiences', () => {
  assert.equal(normalizeVisibility('', 'student'), 'student');
  assert.equal(normalizeVisibility('', 'parent'), 'parent');
  assert.equal(normalizeVisibility('', 'provider'), 'provider');
  assert.equal(normalizeVisibility('public', 'admin'), 'public');
});

test('helper parity map is generated with required record fields and statuses', () => {
  const records = JSON.parse(fs.readFileSync('ops/helper-tool-parity-map.json', 'utf8'));
  assert.ok(records.length >= 100);
  const allowedStatuses = new Set([
    'tool_available',
    'tool_needed',
    'not_allowed_for_helper',
    'requires_confirmation',
    'external_blocker',
    'admin_only',
    'student_safe_only',
  ]);
  for (const record of records) {
    assert.equal(typeof record.surface, 'string');
    assert.equal(typeof record.label, 'string');
    assert.equal(typeof record.current_file, 'string');
    assert.equal(typeof record.api_endpoint, 'string');
    assert.equal(typeof record.method, 'string');
    assert.equal(typeof record.helper_tool_name, 'string');
    assert.ok(Array.isArray(record.scope_rules));
    assert.equal(typeof record.confirmation_required, 'boolean');
    assert.ok(allowedStatuses.has(record.status), `unexpected status ${record.status}`);
  }
  assert.ok(records.some((record) => record.helper_tool_name === 'create_task' && record.status === 'tool_available'));
  assert.ok(records.some((record) => record.helper_tool_name === 'send_email' && record.status === 'requires_confirmation'));
  assert.ok(records.some((record) => record.status === 'external_blocker'));
  assert.ok(records.some((record) => record.surface === 'student' && record.status === 'student_safe_only'));
});
