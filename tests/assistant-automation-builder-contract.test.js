const test = require('node:test');
const assert = require('node:assert/strict');

const {
  assertAutomationPolicy,
  compileNaturalLanguageAutomation,
  createAutomationDraft,
  enableAutomationPlan,
  simulateAutomation,
  validateAutomationDefinition,
} = require('../src/platform/assistant/automation-builder');
const {
  buildAssistantActionPlan,
  runPlannedAssistantAction,
} = require('../src/platform/assistant/action-planner');

const superAdmin = {
  user_id: 'shloimie-local',
  identity_key: 'identity_admin_1',
  role: 'super_admin',
  scope: { type: 'all' },
  workspace_id: 'bna',
};

const provider = {
  user_id: 'provider-local',
  identity_key: 'identity_provider_1',
  role: 'provider_admin',
  provider_id: 'sheller',
  workspace_id: 'rabbi_sheller_provider',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
};

const parent = {
  user_id: 'parent-local',
  role: 'parent',
  workspace_id: 'bna',
  parent_id: 'parent-1',
  linked_child_ids: ['101'],
};

test('natural-language parent signup automation compiles into typed trigger, conditions, actions, and delays', () => {
  const definition = compileNaturalLanguageAutomation({
    actor: superAdmin,
    channel: 'operations_helper',
    message: 'When a parent signs up, send the welcome email. If they do not finish payment in 24 hours, remind them. If payment succeeds, enroll the child and send the class link. If the email bounces, create a follow-up task.',
  });

  assert.equal(definition.requirement_id, 'REQ-20260623-021');
  assert.equal(definition.trigger.trigger_type, 'parent_signup');
  assert.equal(definition.enabled_state, 'draft');
  assert.equal(definition.arbitrary_code_allowed, false);
  assert.ok(definition.steps.some((step) => step.type === 'delay' && step.duration === '24 hours'));
  assert.ok(definition.steps.some((step) => step.condition_type === 'payment_status_pending'));
  assert.ok(definition.steps.some((step) => step.action_type === 'send_reminder'));
  assert.ok(definition.steps.some((step) => step.action_type === 'enroll_student'));
  assert.ok(definition.steps.some((step) => step.action_type === 'send_class_link'));
  assert.ok(definition.steps.some((step) => step.condition_type === 'email_delivery_bounced'));
  assert.ok(definition.steps.some((step) => step.action_type === 'create_follow_up_task'));
});

test('automation drafts use shared draft/version previews and sample-event simulation without enabling', () => {
  const draft = createAutomationDraft({
    actor: superAdmin,
    channel: 'telegram',
    message: 'When a parent signs up, if payment succeeds, enroll the child and send the class link. If the email bounces, create a follow-up task.',
    sample_event: {
      payment_status: 'succeeded',
      email_delivery_status: 'bounced',
    },
  });

  assert.equal(draft.action_category, 'automation');
  assert.equal(draft.status, 'draft_preview');
  assert.equal(draft.draft.object_type, 'automation');
  assert.equal(draft.version.content.enabled_state, 'draft');
  assert.equal(draft.preview.external_action, true);
  assert.equal(draft.preview.payload.preview_type, 'automation_steps_and_dry_run');
  assert.ok(draft.preview.payload.readable_steps.some((line) => /Trigger:/i.test(line)));
  assert.ok(draft.preview.payload.diagram_mermaid.startsWith('flowchart TD'));
  assert.equal(draft.simulation.dry_run, true);
  assert.equal(draft.simulation.external_write_performed, false);
  assert.equal(draft.automation_enabled, false);
  assert.equal(draft.external_actions_enabled, false);
  assert.equal(draft.approval_required_before_enable, true);
});

test('automation validation rejects arbitrary code and unsupported typed nodes', () => {
  const badCode = validateAutomationDefinition({
    trigger: { trigger_type: 'parent_signup' },
    steps: [
      { step_id: 'trigger_1', type: 'trigger', trigger_type: 'parent_signup' },
      { step_id: 'action_1', type: 'action', action_type: 'send_reminder', script: 'alert(1)' },
    ],
  });
  assert.equal(badCode.valid, false);
  assert.ok(badCode.issues.some((issue) => issue.reason === 'raw_code_or_css_field'));

  const badNode = validateAutomationDefinition({
    trigger: { trigger_type: 'custom_webhook_exec' },
    steps: [
      { step_id: 'trigger_1', type: 'trigger', trigger_type: 'custom_webhook_exec' },
      { step_id: 'action_1', type: 'action', action_type: 'run_javascript' },
    ],
  });
  assert.equal(badNode.valid, false);
  assert.ok(badNode.issues.some((issue) => issue.reason === 'unknown_trigger_type'));
  assert.ok(badNode.issues.some((issue) => issue.reason === 'unknown_action_type'));
});

test('simulation and enable remain dry-run/approval gated', () => {
  const definition = compileNaturalLanguageAutomation({
    actor: provider,
    channel: 'provider_portal_assistant',
    message: 'When a parent signs up, if payment succeeds, enroll the child and send the class link.',
  });
  const simulation = simulateAutomation({
    definition,
    sample_event: { payment_status: 'succeeded' },
  });

  assert.equal(simulation.automation_enabled, false);
  assert.equal(simulation.external_write_performed, false);
  assert.ok(simulation.planned_actions.includes('enroll_student'));

  assert.throws(() => enableAutomationPlan({
    actor: provider,
    channel: 'provider_portal_assistant',
    definition,
    approved: false,
  }), /approval_required_for_external_action/);

  const enabled = enableAutomationPlan({
    actor: provider,
    channel: 'provider_portal_assistant',
    definition,
    approved: true,
  });
  assert.equal(enabled.enabled_state, 'enabled');
  assert.equal(enabled.approval_used, true);
});

test('workspace and role policy scopes provider automation and denies parent automation', () => {
  const providerDraft = createAutomationDraft({
    actor: provider,
    channel: 'provider_portal_assistant',
    message: 'When a parent signs up, send the welcome email.',
  });
  assert.equal(providerDraft.automation.workspace_scope.workspace_key, 'rabbi_sheller_provider');
  assert.equal(providerDraft.automation.workspace_scope.project_key, 'one_time_mishnah_class');

  assert.throws(() => assertAutomationPolicy({
    actor: parent,
    channel: 'parent_portal_assistant',
    operation: 'preview',
  }), /role_category_denied/);

  assert.throws(() => createAutomationDraft({
    actor: provider,
    channel: 'provider_portal_assistant',
    workspace_key: 'bna',
    project_key: 'bna',
    message: 'When a parent signs up, send the welcome email.',
  }), /workspace_scope_mismatch/);
});

test('shared planner exposes automation drafting to authorized actors and keeps parents out', async () => {
  const message = 'Create an automation: when a parent signs up, if payment succeeds enroll the child and send the class link. Show me the automation before turning it on.';
  const adminPlan = buildAssistantActionPlan({
    channel: 'operations_helper',
    actor: superAdmin,
    message,
  });

  assert.equal(adminPlan.actions[0].action_id, 'draft_automation');
  assert.equal(adminPlan.actions[0].approval_required, true);
  assert.equal(adminPlan.actions[0].preview_required, true);
  assert.equal(adminPlan.actions[0].dry_run, true);
  assert.equal(adminPlan.actions[0].inputs.message, message);

  const preview = await runPlannedAssistantAction({ plan: adminPlan });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.dry_run, true);
  assert.equal(preview.preview.requirement_id, 'REQ-20260623-021');
  assert.equal(preview.preview.action_category, 'automation');
  assert.equal(preview.preview.automation_enabled, false);

  const parentPlan = buildAssistantActionPlan({
    channel: 'parent_portal_assistant',
    actor: parent,
    requested_action_id: 'draft_automation',
    message,
  });
  assert.deepEqual(parentPlan.actions, []);
  assert.deepEqual(parentPlan.rejected_actions, [
    { action_id: 'draft_automation', reason: 'permission_denied' },
  ]);
});
