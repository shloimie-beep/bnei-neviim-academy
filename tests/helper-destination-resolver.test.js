const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildOperationsPath,
  evaluateHelperIntentMatrix,
  findRegisteredAction,
  findRouteRecord,
  resolveHelperDestination,
} = require('../src/lib/bna/helper/destination-resolver');
const { buildToolRegistry } = require('../src/lib/bna/helper/tool-registry');
const { resultLinksFromActions } = require('../src/lib/bna/helper/context');

test('helper destination resolver builds canonical Operations links from route and action registries', () => {
  const destination = resolveHelperDestination({
    intent: 'open_operations_view',
    channel: 'operations_helper',
    actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
    helperTool: 'open_operations_view',
    actor: {
      role: 'super_admin',
      scope: { type: 'all' },
      workspace_key: 'bna',
      project_key: 'bna',
    },
    target: {
      view: 'tasks',
      section: 'pending',
      workspace_key: 'bna',
      task_id: 42,
    },
  });

  assert.equal(buildOperationsPath({ view: 'tasks', section: 'pending', workspace_key: 'bna', task_id: 42 }), '/operations?view=tasks&section=pending&workspace=bna&task=42');
  assert.equal(destination.ok, true);
  assert.equal(destination.path, '/operations?view=tasks&section=pending&workspace=bna&task=42');
  assert.equal(destination.canonical_path, '/operations');
  assert.equal(destination.route_key, 'operations');
  assert.equal(destination.required_role, 'super_admin_or_scoped_one_time_studio_task_role');
  assert.equal(destination.role, 'super_admin');
  assert.equal(destination.workspace_key, 'bna');
  assert.equal(destination.project_key, 'bna');
  assert.equal(destination.section, 'pending');
  assert.equal(destination.expected_page_landmark, 'authorized_operations_view_limited_by_allowedViews');
  assert.equal(destination.authorization_result, 'allowed');
  assert.match(destination.why_correct, /registered route operations|Operations helper navigation request/);
  assert.equal(destination.action_key, 'ACTION-HELPER-OPEN-OPERATIONS-VIEW');
  assert.equal(destination.helper_tool, 'open_operations_view');
  assert.equal(destination.checks.route_registered, true);
  assert.equal(destination.checks.action_registered, true);
  assert.equal(destination.checks.browser_click_substitution_allowed, false);
});

test('helper destination resolver exposes route/action registry readbacks', () => {
  assert.equal(findRouteRecord('/operations?view=tasks')?.surface, 'operations_task_manager');
  assert.equal(findRouteRecord('/service-providers')?.access, 'public');
  assert.equal(findRouteRecord('/providers/example-slug')?.surface, 'public_provider_profile');
  assert.equal(findRegisteredAction({ helperTool: 'open_operations_view' })?.action_id, 'ACTION-HELPER-OPEN-OPERATIONS-VIEW');
});

test('helper destination matrix covers role-scoped success and denial cases', () => {
  const cases = [
    {
      case_id: 'owner_operations_tasks',
      intent: 'open_operations_view',
      actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
      helperTool: 'open_operations_view',
      actor: { role: 'super_admin', scope: { type: 'all' }, workspace_key: 'bna' },
      target: { view: 'tasks', section: 'decisions', workspace_key: 'bna' },
      expected_ok: true,
      expected_path: '/operations?view=tasks&section=decisions&workspace=bna',
    },
    {
      case_id: 'parent_portal_self',
      intent: 'parent_progress',
      actor: { role: 'parent', scope: { type: 'parent' }, workspace_key: 'bna' },
      target: { route: '/parent' },
      expected_ok: true,
      expected_path: '/parent',
    },
    {
      case_id: 'student_portal_self',
      intent: 'student_assignment',
      actor: { role: 'student', scope: { type: 'student' }, workspace_key: 'bna' },
      target: { route: '/student' },
      expected_ok: true,
      expected_path: '/student',
    },
    {
      case_id: 'provider_workspace_self',
      intent: 'provider_workspace',
      actor: { role: 'provider_admin', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' } },
      target: { route: '/provider' },
      expected_ok: true,
      expected_path: '/provider',
    },
    {
      case_id: 'public_provider_index',
      intent: 'public_provider_index',
      actor: { role: 'guest', workspace_key: 'bna' },
      target: { route: '/service-providers' },
      expected_ok: true,
      expected_path: '/service-providers',
    },
    {
      case_id: 'parent_cannot_open_operations',
      intent: 'open_operations_view',
      actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
      helperTool: 'open_operations_view',
      actor: { role: 'parent', scope: { type: 'parent' }, workspace_key: 'bna' },
      target: { view: 'tasks', section: 'tasks', workspace_key: 'bna' },
      expected_ok: false,
      expected_path: '/parent',
    },
    {
      case_id: 'provider_cannot_cross_to_bna_operations',
      intent: 'open_operations_view',
      actionKey: 'ACTION-HELPER-OPEN-OPERATIONS-VIEW',
      helperTool: 'open_operations_view',
      actor: { role: 'provider_admin', scope: { type: 'project', workspaceKey: 'rabbi_sheller_provider', projectKey: 'one_time_mishnah_class' } },
      target: { view: 'tasks', workspace_key: 'bna' },
      expected_ok: false,
      expected_path: '/provider',
    },
    {
      case_id: 'missing_route_rejected',
      intent: 'missing_route',
      actor: { role: 'super_admin', scope: { type: 'all' } },
      target: { route: '/totally-missing-route' },
      expected_ok: false,
      expected_path: '/operations-login.html',
    },
    {
      case_id: 'external_url_rejected',
      intent: 'external_url',
      actor: { role: 'super_admin', scope: { type: 'all' } },
      target: { route: 'https://example.com/private' },
      expected_ok: false,
      expected_path: '/operations-login.html',
    },
  ];

  const results = evaluateHelperIntentMatrix(cases);
  assert.equal(results.every((result) => result.passed), true, JSON.stringify(results, null, 2));
  const parentDenied = results.find((result) => result.case_id === 'parent_cannot_open_operations').result;
  assert.match(parentDenied.reason, /role_not_allowed/);
  assert.equal(parentDenied.fallback.path, '/parent');
  const providerDenied = results.find((result) => result.case_id === 'provider_cannot_cross_to_bna_operations').result;
  assert.match(providerDenied.reason, /role_not_allowed|workspace_scope_mismatch/);
  assert.equal(providerDenied.fallback.path, '/provider');
});

test('typed action permissions are included in destination decisions', () => {
  const allowedParentAction = resolveHelperDestination({
    intent: 'parent_calendar',
    actionId: 'show_child_calendar',
    actor: { role: 'parent', workspace_key: 'bna', scope: { type: 'parent' } },
    target: { route: '/parent' },
  });
  assert.equal(allowedParentAction.ok, true);
  assert.equal(allowedParentAction.action_id, 'show_child_calendar');
  assert.equal(allowedParentAction.checks.typed_action_allowed, true);

  const deniedStudentAction = resolveHelperDestination({
    intent: 'parent_calendar',
    actionId: 'show_child_calendar',
    actor: { role: 'student', workspace_key: 'bna', scope: { type: 'student' } },
    target: { route: '/parent' },
  });
  assert.equal(deniedStudentAction.ok, false);
  assert.equal(deniedStudentAction.checks.typed_action_allowed, false);
  assert.equal(deniedStudentAction.fallback.path, '/student');
});

test('open_operations_view tool returns resolver metadata with the direct deep link', async () => {
  const registry = buildToolRegistry();
  const result = await registry.execute(
    'open_operations_view',
    { view: 'settings', section: 'calendar_classroom', workspace_key: 'bna' },
    { userRole: 'admin', projectKey: 'bna', identity: { role: 'admin', scope: { type: 'all' } } }
  );

  assert.equal(result.ok, true);
  assert.equal(result.url, '/operations?view=settings&section=calendar_classroom&workspace=bna');
  assert.equal(result.data.destination.route_key, 'operations');
  assert.equal(result.data.destination.canonical_path, '/operations');
  assert.equal(result.data.destination.section, 'calendar_classroom');
  assert.equal(result.data.destination.authorization_result, 'allowed');
  assert.equal(result.data.destination.action_key, 'ACTION-HELPER-OPEN-OPERATIONS-VIEW');
  assert.equal(result.data.destination.checks.route_registered, true);
  assert.equal(result.data.destination.checks.action_registered, true);
});

test('helper result links expose route/action resolver proof for internal links', async () => {
  const registry = buildToolRegistry();
  const result = await registry.execute(
    'open_operations_view',
    { view: 'tasks', section: 'pending', workspace_key: 'bna' },
    { userRole: 'admin', projectKey: 'bna', identity: { role: 'admin', scope: { type: 'all' } } }
  );

  const links = resultLinksFromActions([{ result }]);
  assert.equal(links.length, 1);
  assert.equal(links[0].url, '/operations?view=tasks&section=pending&workspace=bna');
  assert.equal(links[0].destination.routeKey, 'operations');
  assert.equal(links[0].destination.canonicalPath, '/operations');
  assert.equal(links[0].destination.role, 'admin');
  assert.equal(links[0].destination.workspace, 'bna');
  assert.equal(links[0].destination.project, 'bna');
  assert.equal(links[0].destination.section, 'pending');
  assert.equal(links[0].destination.expectedPageLandmark, 'authorized_operations_view_limited_by_allowedViews');
  assert.equal(links[0].destination.authorizationResult, 'allowed');
  assert.match(links[0].destination.whyCorrect, /Operations helper navigation request/);
  assert.equal(links[0].destination.safeFallback, null);
});
