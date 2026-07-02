const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildRuntimeContext,
  HELPER_ROLES,
} = require('../src/lib/bna/helper/control-plane/runtime-context');
const {
  resolveControlledRoute,
} = require('../src/lib/bna/helper/control-plane/route-control');
const {
  createEvidence,
} = require('../src/lib/bna/helper/control-plane/evidence');
const {
  responseSafetyReport,
} = require('../src/lib/bna/helper/control-plane/response-safety');
const {
  renderControlledResponse,
} = require('../src/lib/bna/helper/control-plane/conversation');

test('control plane builds repo-compatible runtime context for key roles', () => {
  assert.equal(buildRuntimeContext({}).helperRole, HELPER_ROLES.PUBLIC_VISITOR);

  const admin = buildRuntimeContext({
    identity: { role: 'super_admin', username: 'owner', scope: { type: 'all' } },
    pageContext: { route: '/operations', page: 'operations' },
  });
  assert.equal(admin.helperRole, HELPER_ROLES.BNA_SUPER_ADMIN);
  assert.equal(admin.effectiveScope.type, 'all');
  assert.ok(admin.capabilities.includes('helper.action.execute'));

  const parent = buildRuntimeContext({
    identity: { role: 'parent', user_id: 'parent-1', scope: { type: 'parent', linkedChildIds: [42] } },
    pageContext: { route: '/parent' },
  });
  assert.equal(parent.helperRole, HELPER_ROLES.PARENT);
  assert.deepEqual(parent.effectiveScope.linkedChildIds, ['42']);

  const student = buildRuntimeContext({
    identity: { role: 'student', user_id: '7', scope: { type: 'student', studentId: 7 } },
    pageContext: { route: '/student' },
  });
  assert.equal(student.helperRole, HELPER_ROLES.STUDENT);
  assert.equal(String(student.effectiveScope.studentId), '7');
});

test('generic Mishnah language does not auto-route to One Time without One Time context', async () => {
  const context = buildRuntimeContext({
    identity: { role: 'parent', user_id: 'parent-1', scope: { type: 'parent', linkedChildIds: [1] } },
    pageContext: { route: '/parent' },
  });
  const evidence = createEvidence(context);
  const result = await resolveControlledRoute({
    intent: 'mishnayos',
    message: 'take me to Mishnayos',
    target: { route: '/one-time' },
  }, context, { evidence });

  assert.equal(result.status, 'denied');
  assert.equal(result.reason_code, 'ambiguous_mishnah_one_time_context_missing');
  assert.equal(evidence.denials.length, 1);
});

test('One Time context may resolve One Time member route through existing registry', async () => {
  const context = buildRuntimeContext({
    identity: { role: 'member', user_id: 'member-1', scope: { type: 'member', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' } },
    pageContext: { route: '/rabbi-member' },
  });
  const evidence = createEvidence(context);
  const result = await resolveControlledRoute({
    intent: 'member_library',
    message: 'open my Mishnayos member page',
    target: { route: '/rabbi-member' },
  }, context, { evidence });

  assert.equal(result.status, 'resolved');
  assert.equal(result.url, '/rabbi-member');
  assert.equal(evidence.route_resolutions.length, 1);
});

test('response guard rejects raw internal links not backed by resolver evidence', () => {
  const context = buildRuntimeContext({
    identity: { role: 'parent', user_id: 'parent-1', scope: { type: 'parent', linkedChildIds: [1] } },
  });
  const evidence = createEvidence(context);
  const report = responseSafetyReport('Go to /operations?view=tasks', evidence);
  assert.equal(report.ok, false);
  assert.deepEqual(report.unbacked_internal_links, ['/operations?view=tasks']);
});

test('super-admin response renderer adds explicit scope banner', () => {
  const context = buildRuntimeContext({
    identity: { role: 'super_admin', username: 'owner', scope: { type: 'all' } },
    pageContext: { route: '/operations' },
  });
  const evidence = createEvidence(context);
  const response = renderControlledResponse({
    context,
    evidence,
    assistantDraft: 'No route was needed for this explanation.',
  });
  assert.match(response, /^Current scope:/);
});
