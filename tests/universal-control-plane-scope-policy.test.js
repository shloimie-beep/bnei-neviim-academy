const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ACTION_CATEGORIES,
  ADAPTER_ONLY_RESPONSIBILITIES,
  CANONICAL_CHANNELS,
  CONTROL_PLANE_CONTRACT,
  FORBIDDEN_DUPLICATE_SYSTEMS,
  SHARED_CONTROL_PLANE_LAYERS,
  actionPolicy,
  actorWorkspaceScope,
  assertActionPolicy,
  normalizeChannel,
  normalizeRole,
} = require('../src/platform/assistant/control-plane');

test('Telegram and website assistant normalize to the same control-plane policy shape', () => {
  assert.equal(normalizeChannel('website_bot'), 'website_assistant');
  assert.equal(normalizeChannel('in-app assistant'), 'website_assistant');
  assert.equal(normalizeChannel('Telegram'), 'telegram');
  assert.ok(CANONICAL_CHANNELS.includes('operations_helper'));
  assert.ok(ACTION_CATEGORIES.includes('provider_website'));

  const actor = {
    role: 'service_provider_admin',
    scope: { type: 'project', projectKey: 'one_time_mishnah_class', workspaceKey: 'rabbi_sheller_provider' },
  };
  const telegramPlan = actionPolicy({
    actor,
    channel: 'telegram',
    action_category: 'provider_website',
    operation: 'edit',
    target: { workspace_key: 'rabbi_sheller_provider' },
  });
  const websitePlan = actionPolicy({
    actor,
    channel: 'website_assistant',
    action_category: 'provider_website',
    operation: 'edit',
    target: { workspace_key: 'rabbi_sheller_provider' },
  });

  assert.equal(telegramPlan.allowed, true);
  assert.equal(websitePlan.allowed, true);
  assert.equal(telegramPlan.action_category, websitePlan.action_category);
  assert.equal(telegramPlan.typed_action_required, true);
  assert.equal(telegramPlan.browser_click_substitution_allowed, false);
  assert.equal(websitePlan.browser_click_substitution_allowed, false);
});

test('One Time provider roles are workspace-scoped service-provider actors', () => {
  assert.equal(normalizeRole('project_owner'), 'service_provider');
  assert.equal(normalizeRole('one_time_admin'), 'service_provider');
  const scope = actorWorkspaceScope({
    role: 'project_owner',
    scope: { type: 'project', projectKey: 'one_time_mishnah_class' },
  });
  assert.equal(scope.role, 'service_provider');
  assert.equal(scope.project_key, 'one_time_mishnah_class');
  assert.equal(scope.workspace_key, 'rabbi_sheller_provider');

  const allowed = actionPolicy({
    actor: { role: 'project_owner', scope: { type: 'project', projectKey: 'one_time_mishnah_class' } },
    channel: 'provider_portal_assistant',
    action_category: 'class',
    target: { project_key: 'one_time_mishnah_class' },
  });
  assert.equal(allowed.allowed, true);

  const denied = actionPolicy({
    actor: { role: 'project_owner', scope: { type: 'project', projectKey: 'one_time_mishnah_class' } },
    channel: 'provider_portal_assistant',
    action_category: 'class',
    target: { project_key: 'bna', workspace_key: 'bna' },
  });
  assert.equal(denied.allowed, false);
  assert.ok(denied.reasons.includes('workspace_scope_mismatch'));
});

test('parent chart control is linked-child scoped and cannot alter official records', () => {
  const parent = {
    role: 'parent',
    parent_id: 'p1',
    linked_child_ids: ['c1'],
    scope: { type: 'parent', projectKey: 'bna', workspaceKey: 'bna' },
  };
  const chart = actionPolicy({
    actor: parent,
    channel: 'parent_portal_assistant',
    action_category: 'dashboard_layout',
    target: { child_id: 'c1', workspace_key: 'bna' },
  });
  assert.equal(chart.allowed, true);
  assert.equal(chart.preview_required, true);

  const otherChild = actionPolicy({
    actor: parent,
    channel: 'telegram',
    action_category: 'chart',
    target: { child_id: 'c2', workspace_key: 'bna' },
  });
  assert.equal(otherChild.allowed, false);
  assert.ok(otherChild.reasons.includes('relationship_scope_mismatch'));

  const officialChange = actionPolicy({
    actor: parent,
    channel: 'website_assistant',
    action_category: 'billing',
    target: { child_id: 'c1', workspace_key: 'bna' },
  });
  assert.equal(officialChange.allowed, false);
  assert.ok(officialChange.reasons.includes('role_category_denied'));
});

test('students remain own-record scoped and cannot use admin/provider actions', () => {
  const student = {
    role: 'student',
    student_id: 's1',
    scope: { type: 'student', projectKey: 'bna', workspaceKey: 'bna' },
  };
  const ownWorksheet = actionPolicy({
    actor: student,
    channel: 'student_portal_assistant',
    action_category: 'worksheet',
    target: { student_id: 's1', workspace_key: 'bna' },
  });
  assert.equal(ownWorksheet.allowed, true);

  const otherStudent = actionPolicy({
    actor: student,
    channel: 'student_portal_assistant',
    action_category: 'worksheet',
    target: { student_id: 's2', workspace_key: 'bna' },
  });
  assert.equal(otherStudent.allowed, false);
  assert.ok(otherStudent.reasons.includes('relationship_scope_mismatch'));

  const providerWebsite = actionPolicy({
    actor: student,
    channel: 'telegram',
    action_category: 'provider_website',
    target: { workspace_key: 'bna' },
  });
  assert.equal(providerWebsite.allowed, false);
  assert.ok(providerWebsite.reasons.includes('role_category_denied'));
});

test('super-admin campaign and deployment actions require typed previews and explicit approval', () => {
  const actor = { role: 'super_admin', scope: { type: 'all' } };
  const dryRun = actionPolicy({
    actor,
    channel: 'operations_helper',
    action_category: 'drip_sequence',
    operation: 'schedule',
    target: { workspace_key: 'bna' },
    dry_run: true,
  });
  assert.equal(dryRun.allowed, true);
  assert.equal(dryRun.preview_required, true);
  assert.equal(dryRun.approval_required, true);
  assert.equal(dryRun.typed_action_required, true);

  const liveWithoutApproval = actionPolicy({
    actor,
    channel: 'telegram',
    action_category: 'drip_sequence',
    operation: 'send',
    target: { workspace_key: 'bna' },
    dry_run: false,
  });
  assert.equal(liveWithoutApproval.allowed, false);
  assert.ok(liveWithoutApproval.reasons.includes('approval_required_for_external_action'));

  const liveApproved = actionPolicy({
    actor: { ...actor, explicit_approval: true },
    channel: 'telegram',
    action_category: 'deployment_status',
    operation: 'deploy',
    target: { workspace_key: 'bna' },
    dry_run: false,
  });
  assert.equal(liveApproved.allowed, true);
  assert.equal(liveApproved.browser_click_substitution_allowed, false);
});

test('unsupported channels and unknown action categories are rejected', () => {
  const policy = actionPolicy({
    actor: { role: 'super_admin', scope: { type: 'all' } },
    channel: 'random_chat_app',
    action_category: 'raw_browser_click',
  });
  assert.equal(policy.allowed, false);
  assert.ok(policy.reasons.includes('unsupported_channel'));
  assert.ok(policy.reasons.includes('unknown_action_category'));

  assert.throws(
    () => assertActionPolicy({
      actor: { role: 'parent', linked_child_ids: ['1'], scope: { type: 'parent' } },
      channel: 'parent_portal_assistant',
      action_category: 'agent_work',
    }),
    /permission_denied/
  );
});

test('shared control-plane contract covers required layers without duplicate systems', () => {
  for (const layer of [
    'authenticated_identity',
    'workspace_and_role',
    'conversation_state',
    'source_envelope',
    'file_media_intake',
    'action_registry',
    'action_planner',
    'permission_engine',
    'preview_system',
    'approval_system',
    'audit_event',
    'draft_template_versioning',
    'reminders_notifications',
    'ticketing',
    'agent_work_handoff',
    'progress_completion_state',
  ]) {
    assert.ok(SHARED_CONTROL_PLANE_LAYERS.includes(layer), `${layer} is part of the shared contract`);
  }

  assert.equal(CONTROL_PLANE_CONTRACT.requirement_id, 'REQ-20260623-011');
  assert.equal(CONTROL_PLANE_CONTRACT.provider_creation_system, 'service_provider_studio');
  assert.equal(CONTROL_PLANE_CONTRACT.typed_actions_required, true);
  assert.equal(CONTROL_PLANE_CONTRACT.browser_click_substitution_allowed, false);

  for (const forbidden of [
    'telegram_architecture',
    'website_bot_action_system',
    'action_registry',
    'intake_pipeline',
    'agent_queue',
    'provider_onboarding_system',
    'provider_page_builder',
    'browser_click_substitution',
  ]) {
    assert.ok(FORBIDDEN_DUPLICATE_SYSTEMS.includes(forbidden), `${forbidden} is explicitly forbidden`);
  }
});

test('channel adapters expose transport responsibilities only', () => {
  assert.deepEqual(
    ADAPTER_ONLY_RESPONSIBILITIES.telegram.filter((item) => item.includes('registry') || item.includes('planner')),
    []
  );
  assert.ok(ADAPTER_ONLY_RESPONSIBILITIES.telegram.includes('telegram_buttons'));
  assert.ok(ADAPTER_ONLY_RESPONSIBILITIES.telegram.includes('forwarded_messages'));
  assert.ok(ADAPTER_ONLY_RESPONSIBILITIES.website_assistant.includes('browser_previews'));
  assert.ok(ADAPTER_ONLY_RESPONSIBILITIES.website_assistant.includes('page_aware_context'));
  assert.ok(ADAPTER_ONLY_RESPONSIBILITIES.provider_portal_assistant.includes('studio_deep_links'));
  assert.ok(ADAPTER_ONLY_RESPONSIBILITIES.parent_portal_assistant.includes('linked_child_picker'));
  assert.ok(ADAPTER_ONLY_RESPONSIBILITIES.student_portal_assistant.includes('student_safe_preview_cards'));
});
