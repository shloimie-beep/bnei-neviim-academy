const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildActionPlannerSchema,
  buildAssistantActionPlan,
  runPlannedAssistantAction,
} = require('../src/platform/assistant/action-planner');

const parentActor = { user_id: 'parent-local', role: 'parent', workspace_id: 'bna' };
const superAdminActor = { user_id: 'shloimie-local', role: 'super_admin', workspace_id: 'bna' };
const operatorActor = { user_id: 'operator-local', role: 'operator', workspace_id: 'bna' };

test('Telegram and website assistant produce the same registry action plan for the same actor and message', () => {
  const message = 'The Zoom link is broken and I cannot open the worksheet.';
  const telegramPlan = buildAssistantActionPlan({
    channel: 'telegram',
    actor: parentActor,
    message,
  });
  const websitePlan = buildAssistantActionPlan({
    channel: 'website_assistant',
    actor: parentActor,
    message,
  });

  assert.equal(telegramPlan.actions.length, 1);
  assert.equal(websitePlan.actions.length, 1);
  assert.equal(telegramPlan.actions[0].action_id, websitePlan.actions[0].action_id);
  assert.equal(telegramPlan.actions[0].action_id, 'create_ticket');
  assert.equal(telegramPlan.actions[0].inputs.message, message);
  assert.equal(websitePlan.actions[0].inputs.message, message);
  assert.deepEqual(telegramPlan.actions[0].missing_inputs, []);
});

test('planner schema is role scoped and excludes actions the actor cannot perform', () => {
  const parentSchema = buildActionPlannerSchema({
    channel: 'website_assistant',
    actor: parentActor,
  });
  const adminSchema = buildActionPlannerSchema({
    channel: 'operations_helper',
    actor: superAdminActor,
  });

  assert.ok(parentSchema.actions.some((action) => action.action_id === 'create_ticket'));
  assert.ok(!parentSchema.actions.some((action) => action.action_id === 'route_bug_to_codex'));
  assert.ok(adminSchema.actions.some((action) => action.action_id === 'route_bug_to_codex'));
});

test('planner rejects unknown and permission-denied requested action IDs without falling through to execution', () => {
  const deniedPlan = buildAssistantActionPlan({
    channel: 'telegram',
    actor: parentActor,
    requested_action_id: 'route_bug_to_codex',
    message: 'Fix this server bug.',
  });
  assert.deepEqual(deniedPlan.actions, []);
  assert.deepEqual(deniedPlan.rejected_actions, [
    { action_id: 'route_bug_to_codex', reason: 'permission_denied' },
  ]);

  const unknownPlan = buildAssistantActionPlan({
    channel: 'website_assistant',
    actor: superAdminActor,
    requested_action_id: 'make_up_a_new_action',
    message: 'Do this thing.',
  });
  assert.deepEqual(unknownPlan.actions, []);
  assert.deepEqual(unknownPlan.rejected_actions, [
    { action_id: 'make_up_a_new_action', reason: 'unknown_action_id' },
  ]);
});

test('technical implementation requests become approved super-admin Agent Work, not parent actions', () => {
  const adminPlan = buildAssistantActionPlan({
    channel: 'operations_helper',
    actor: superAdminActor,
    message: 'Fix this broken parent portal button in Codex and test it.',
  });
  assert.equal(adminPlan.actions[0].action_id, 'route_bug_to_codex');
  assert.equal(adminPlan.actions[0].approval_required, true);
  assert.equal(adminPlan.actions[0].preview_required, true);
  assert.equal(adminPlan.actions[0].dry_run, true);
  assert.equal(adminPlan.actions[0].can_execute, true);
  assert.equal(adminPlan.actions[0].inputs.title, 'Fix this broken parent portal button in Codex and test it.');

  const parentPlan = buildAssistantActionPlan({
    channel: 'website_assistant',
    actor: parentActor,
    message: 'Fix this broken parent portal button in Codex and test it.',
  });
  assert.equal(parentPlan.actions[0].action_id, 'create_ticket');
  assert.notEqual(parentPlan.actions[0].action_id, 'route_bug_to_codex');
});

test('missing required inputs are collected before execution', () => {
  const plan = buildAssistantActionPlan({
    channel: 'telegram',
    actor: operatorActor,
    requested_action_id: 'capture_provider_google_business_link',
    message: 'Save this Google Maps link https://maps.app.goo.gl/example on the provider profile.',
  });

  assert.equal(plan.actions[0].action_id, 'capture_provider_google_business_link');
  assert.deepEqual(plan.actions[0].missing_inputs, ['provider_id']);
  assert.equal(plan.actions[0].can_execute, false);
  assert.equal(plan.actions[0].inputs.google_business_profile_url, 'https://maps.app.goo.gl/example');
  assert.deepEqual(plan.reply.questions, ['What should I use for provider id?']);
});

test('planned actions execute only through the canonical action runner and preserve preview approval', async () => {
  const plan = buildAssistantActionPlan({
    channel: 'telegram',
    actor: operatorActor,
    requested_action_id: 'queue_telegram_report',
    message: 'Report this completion back to Telegram.',
    inputs: { message: 'Deployment and smoke checks passed.' },
  });

  assert.equal(plan.actions[0].action_id, 'queue_telegram_report');
  assert.equal(plan.actions[0].approval_required, true);
  assert.equal(plan.actions[0].can_execute, true);

  const preview = await runPlannedAssistantAction({ plan });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.dry_run, true);
  assert.equal(preview.approval_required, true);
  assert.equal(preview.action.action_id, 'queue_telegram_report');
  assert.equal(preview.actor.role, 'operator');
  assert.equal(preview.audit_log.source, 'telegram');
  assert.equal(preview.preview.live_send_performed, false);

  const missingPlanResult = await runPlannedAssistantAction({
    plan: buildAssistantActionPlan({
      channel: 'website_assistant',
      actor: operatorActor,
      requested_action_id: 'capture_provider_google_business_link',
      message: 'Save a provider maps link.',
    }),
  });
  assert.equal(missingPlanResult.success, false);
  assert.equal(missingPlanResult.error, 'Missing required input(s): provider_id');
  assert.equal(missingPlanResult.executed, false);
});
