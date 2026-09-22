const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CHART_TEMPLATES,
  applyChartDashboardPatch,
  buildChartDashboardConfiguration,
  compareChartDashboardVersions,
  compileNaturalLanguageChartPatch,
  createChartDashboardPreview,
  createSavedDashboardView,
  rollbackChartDashboardConfiguration,
} = require('../src/platform/assistant/chart-dashboard-config');
const {
  createParentChartLayout,
} = require('../src/platform/assistant/parent-self-service');

const parent = {
  user_id: 'parent-local',
  identity_key: 'identity_parent_1',
  role: 'parent',
  parent_id: 'parent-1',
  linked_child_ids: ['101'],
  workspace_id: 'bna',
  scope: { type: 'parent', projectKey: 'bna', workspaceKey: 'bna' },
};

const provider = {
  user_id: 'provider-local',
  identity_key: 'identity_provider_1',
  role: 'provider_admin',
  provider_id: 'sheller',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
};

const superAdmin = {
  user_id: 'shloimie-local',
  identity_key: 'identity_admin_1',
  role: 'super_admin',
  scope: { type: 'all' },
};

test('parent natural-language patch compiles to a structured dashboard configuration update', () => {
  const first = buildChartDashboardConfiguration({
    actor: parent,
    channel: 'parent_portal_assistant',
    role_scope: 'parent',
    layout_name: 'My Weekly View',
    template: 'progress_first',
    sections: ['progress', 'attendance', 'milestones'],
    student_scope: { child_id: '101', parent_id: 'parent-1' },
    metric_visibility: { attendance: true, progress: true },
    date_range: { preset: 'weekly' },
  });
  const plan = compileNaturalLanguageChartPatch({
    actor: parent,
    current_config: first,
    message: 'Move attendance above progress. Use bars instead of a line. Show the last 30 days. Save this as Parent Summary.',
  });
  const next = applyChartDashboardPatch({
    current_config: first,
    actor: parent,
    channel: 'website_assistant',
    patch: plan.patch,
  });
  const preview = createChartDashboardPreview({
    configuration: next,
    actor: parent,
    channel: 'website_assistant',
    real_data: true,
    sample_data: false,
  });
  const saved = createSavedDashboardView({
    configuration: next,
    actor: parent,
    name: plan.patch.saved_view_name,
  });

  assert.equal(first.requirement_id, 'REQ-20260623-019');
  assert.equal(plan.requires_schema_validation, true);
  assert.equal(plan.patch.saved_view_name, 'Parent Summary');
  assert.deepEqual(next.dashboard_layout.sections.slice(0, 2), ['attendance', 'progress']);
  assert.equal(next.date_range.preset, 'last_30_days');
  assert.equal(next.display_preferences.chart_type, 'bars');
  assert.equal(next.layout_version.parent_version_id, first.layout_version.version_id);
  assert.equal(next.official_data_mutated, false);
  assert.equal(preview.payload.responsive_frames.includes('mobile'), true);
  assert.equal(preview.payload.accessible_alternatives.data_table_required, true);
  assert.equal(preview.real_data, true);
  assert.equal(saved.name, 'Parent Summary');
});

test('parent chart config rejects guessed child IDs and protected fields', () => {
  assert.throws(() => buildChartDashboardConfiguration({
    actor: parent,
    channel: 'parent_portal_assistant',
    role_scope: 'parent',
    template: 'attendance_first',
    student_scope: { child_id: '999', parent_id: 'parent-1' },
  }), /permission_denied: relationship_scope_mismatch/);

  assert.throws(() => buildChartDashboardConfiguration({
    actor: parent,
    channel: 'parent_portal_assistant',
    role_scope: 'parent',
    template: 'attendance_first',
    student_scope: { child_id: '101', parent_id: 'parent-1' },
    metric_visibility: { admin_notes: true },
  }), /chart_dashboard_config_rejected:metric_denied:admin_notes/);

  assert.throws(() => buildChartDashboardConfiguration({
    actor: parent,
    channel: 'parent_portal_assistant',
    role_scope: 'parent',
    template: 'attendance_first',
    student_scope: { child_id: '101', parent_id: 'parent-1' },
    display_preferences: { custom_css: '.x { display:none }' },
  }), /chart_dashboard_config_rejected:raw_code_or_css_field/);
});

test('official data mutation requests are denied instead of becoming dashboard patches', () => {
  const first = buildChartDashboardConfiguration({
    actor: parent,
    channel: 'telegram',
    role_scope: 'parent',
    student_scope: { child_id: '101', parent_id: 'parent-1' },
  });
  const plan = compileNaturalLanguageChartPatch({
    actor: parent,
    current_config: first,
    message: 'Change official attendance and rewrite score to 100.',
  });

  assert.equal(plan.patch.official_record_change_requested, true);
  assert.throws(() => applyChartDashboardPatch({
    current_config: first,
    actor: parent,
    channel: 'telegram',
    patch: plan.patch,
  }), /chart_dashboard_patch_denied:official_record_mutation_requested/);
});

test('provider and super-admin templates share the same model with role-scoped metrics', () => {
  const providerConfig = buildChartDashboardConfiguration({
    actor: provider,
    channel: 'provider_portal_assistant',
    role_scope: 'service_provider',
    template: 'provider_class_overview',
    layout_name: 'Class Overview',
    metric_visibility: { attendance: true, support: true, enrollment: true },
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  });
  const providerPreview = createChartDashboardPreview({
    configuration: providerConfig,
    actor: provider,
    channel: 'telegram',
  });

  assert.equal(providerConfig.chart_template, 'provider_class_overview');
  assert.deepEqual(providerConfig.dashboard_layout.sections.slice(0, 3), ['attendance', 'progress', 'questions']);
  assert.equal(providerConfig.metric_visibility.support, true);
  assert.equal(providerPreview.payload.renderer, 'telegram_snapshot_and_secure_deep_link');

  const adminConfig = buildChartDashboardConfiguration({
    actor: superAdmin,
    channel: 'operations_helper',
    role_scope: 'super_admin',
    template: 'super_admin_operations_dashboard',
    layout_name: 'Operations Command View',
    metric_visibility: { campaigns: true, deployments: true, reminders: true },
    workspace_key: 'platform',
    project_key: 'bna',
  });

  assert.equal(CHART_TEMPLATES.super_admin_operations_dashboard.role_scopes.includes('super_admin'), true);
  assert.equal(adminConfig.chart_template, 'super_admin_operations_dashboard');
  assert.equal(adminConfig.metric_visibility.deployments, true);
  assert.equal(adminConfig.policy.approval_required, false);
});

test('compare and rollback preserve version history without mutating data', () => {
  const first = buildChartDashboardConfiguration({
    actor: parent,
    channel: 'parent_portal_assistant',
    role_scope: 'parent',
    template: 'parent_weekly_summary',
    student_scope: { child_id: '101', parent_id: 'parent-1' },
  });
  const second = applyChartDashboardPatch({
    current_config: first,
    actor: parent,
    channel: 'parent_portal_assistant',
    patch: {
      sections: ['attendance', 'progress'],
      display_preferences: { chart_type: 'line' },
      saved_view_name: 'Short View',
    },
  });
  const diff = compareChartDashboardVersions(first, second);
  const rollback = rollbackChartDashboardConfiguration({
    current_config: second,
    target_config: first,
    actor: parent,
    channel: 'parent_portal_assistant',
    reason: 'Undo that.',
  });

  assert.equal(diff.same_layout, false);
  assert.ok(diff.changed_fields.includes('display_preferences'));
  assert.equal(rollback.layout_version.parent_version_id, second.layout_version.version_id);
  assert.equal(rollback.layout_version.rollback_to_version_id, first.layout_version.version_id);
  assert.equal(rollback.official_data_mutated, false);
  assert.equal(rollback.underlying_record_change_allowed, false);
});

test('parent self-service chart content now uses the canonical chart/dashboard model', () => {
  const layout = createParentChartLayout({
    actor: parent,
    channel: 'parent_portal_assistant',
    child_id: '101',
    parent_id: 'parent-1',
    template: 'attendance_first',
  });

  assert.equal(layout.version.content.requirement_id, 'REQ-20260623-019');
  assert.equal(layout.version.content.contract_version, 'assistant-chart-dashboard-config-v1');
  assert.equal(layout.version.content.chart_definition.renderer, 'canonical_chart_renderer');
  assert.equal(layout.version.content.policy.typed_action_required, true);
});
