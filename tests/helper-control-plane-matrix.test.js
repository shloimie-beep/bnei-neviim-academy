const assert = require('node:assert/strict');
const test = require('node:test');

const { buildRuntimeContext } = require('../src/lib/bna/helper/control-plane/runtime-context');
const { createEvidence } = require('../src/lib/bna/helper/control-plane/evidence');
const { resolveControlledRoute } = require('../src/lib/bna/helper/control-plane/route-control');

const CASES = [
  {
    name: 'public cannot open operations',
    context: { identity: { role: 'guest' }, pageContext: { route: '/' } },
    route: { intent: 'open_operations_view', target: { route: '/operations' } },
    expected_status: 'denied',
  },
  {
    name: 'parent can open parent portal',
    context: { identity: { role: 'parent', scope: { type: 'parent', linkedChildIds: [1] } }, pageContext: { route: '/parent' } },
    route: { intent: 'parent_portal', target: { route: '/parent' } },
    expected_status: 'resolved',
  },
  {
    name: 'student cannot open parent portal',
    context: { identity: { role: 'student', scope: { type: 'student', studentId: 7 } }, pageContext: { route: '/student' } },
    route: { intent: 'parent_portal', target: { route: '/parent' } },
    expected_status: 'denied',
  },
  {
    name: 'provider admin can open provider workspace',
    context: { identity: { role: 'provider_admin', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' } }, pageContext: { route: '/provider' } },
    route: { intent: 'provider_workspace', target: { route: '/provider' } },
    expected_status: 'resolved',
  },
  {
    name: 'expired session cannot open private provider route',
    context: { authStatus: 'expired', identity: { role: 'provider_admin' }, pageContext: { route: '/provider' } },
    route: { intent: 'provider_workspace', target: { route: '/provider' } },
    expected_status: 'denied',
  },
];

test('helper control-plane route matrix enforces role scope', async () => {
  for (const item of CASES) {
    const context = buildRuntimeContext(item.context);
    const evidence = createEvidence(context);
    const result = await resolveControlledRoute({
      message: item.name,
      ...item.route,
    }, context, { evidence });
    assert.equal(result.status, item.expected_status, item.name);
  }
});
