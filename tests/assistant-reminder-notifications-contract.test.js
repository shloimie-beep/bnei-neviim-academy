const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildReminderPlan,
  normalizeDeliveryChannels,
  parseReminderIntent,
  pauseCancelReminderPlan,
} = require('../src/platform/assistant/reminder-notifications');
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
  identity_key: 'identity_parent_1',
  role: 'parent',
  workspace_id: 'bna',
  parent_id: 'parent-1',
  linked_child_ids: ['101'],
};

test('time-based reminders create a shared preview plan without sending', () => {
  const plan = buildReminderPlan({
    actor: superAdmin,
    channel: 'telegram',
    message: 'Remind me tomorrow to finish the provider website.',
    current_time: '2026-06-23T10:00:00.000Z',
    consent_state: { telegram: true },
  });

  assert.equal(plan.requirement_id, 'REQ-20260623-023');
  assert.equal(plan.status, 'draft_schedule_preview');
  assert.equal(plan.channel_key, 'telegram');
  assert.equal(plan.reminder.trigger.trigger_type, 'time');
  assert.equal(plan.reminder.trigger.schedule_label, 'tomorrow');
  assert.equal(plan.reminder.next_run_at, '2026-06-24T10:00:00.000Z');
  assert.equal(plan.reminder.metadata.preview_required, false);
  assert.equal(plan.external_send_performed, false);
  assert.equal(plan.reminder_sent, false);
  assert.equal(plan.delivery_outbox[0].channel_key, 'telegram');
  assert.equal(plan.delivery_outbox[0].status, 'queued');
  assert.equal(plan.quiet_hours_enforced, true);
});

test('threshold notifications and class reminders preserve typed triggers and recurrence', () => {
  const threshold = parseReminderIntent('Notify me if attendance drops below 70%.');
  assert.equal(threshold.trigger_type, 'threshold');
  assert.equal(threshold.threshold_percent, 70);

  const recurring = buildReminderPlan({
    actor: provider,
    channel: 'provider_portal_assistant',
    message: 'Remind this parent before every class.',
    audience_scope: { audience: 'parent', parent_id: 'parent-1' },
    delivery_channels: ['in_app', 'email'],
    consent_state: {},
  });

  assert.equal(recurring.reminder.workspace_key, 'rabbi_sheller_provider');
  assert.equal(recurring.reminder.project_key, 'one_time_mishnah_class');
  assert.equal(recurring.reminder.trigger.trigger_type, 'class_reminder');
  assert.equal(recurring.reminder.recurrence_rule, 'RRULE:FREQ=CLASS_SESSION');
  assert.equal(recurring.reminder.trigger.before_class_minutes, 30);
  assert.deepEqual(recurring.consent_blockers, ['email']);
  assert.equal(recurring.delivery_outbox.find((item) => item.channel_key === 'email').status, 'cancelled');
  assert.equal(recurring.delivery_outbox.find((item) => item.channel_key === 'email').last_error, 'consent_required');
});

test('delivery channel normalization enforces consent before external delivery', () => {
  const channels = normalizeDeliveryChannels({
    requested: ['telegram', 'in_app', 'whatsapp'],
    source_channel: 'website_assistant',
    consent: { telegram: true },
  });

  assert.deepEqual(channels.map((item) => item.channel_key), ['telegram', 'in_app', 'whatsapp']);
  assert.equal(channels.find((item) => item.channel_key === 'telegram').enabled, true);
  assert.equal(channels.find((item) => item.channel_key === 'in_app').enabled, true);
  assert.equal(channels.find((item) => item.channel_key === 'whatsapp').enabled, false);
});

test('pause cancel and resume are typed state transitions, not sends', () => {
  const pause = pauseCancelReminderPlan({
    actor: superAdmin,
    channel: 'operations_helper',
    reminder_key: 'reminder_abc',
    action: 'pause',
  });
  const cancel = pauseCancelReminderPlan({
    actor: superAdmin,
    channel: 'operations_helper',
    reminder_key: 'reminder_abc',
    action: 'cancel',
  });

  assert.equal(pause.status_after, 'paused');
  assert.equal(cancel.status_after, 'cancelled');
  assert.equal(pause.external_send_performed, false);
  assert.throws(() => pauseCancelReminderPlan({
    actor: superAdmin,
    reminder_key: 'reminder_abc',
    action: 'delete',
  }), /unsupported_reminder_state_action/);
});

test('shared planner routes reminder language through the canonical action runner', async () => {
  const message = 'Notify me if attendance drops below 70%.';
  const plan = buildAssistantActionPlan({
    actor: parent,
    channel: 'parent_portal_assistant',
    message,
    inputs: {
      current_time: '2026-06-23T10:00:00.000Z',
    },
  });

  assert.equal(plan.actions[0].action_id, 'schedule_assistant_reminder');
  assert.equal(plan.actions[0].approval_required, true);
  assert.equal(plan.actions[0].preview_required, true);
  assert.equal(plan.actions[0].dry_run, true);
  assert.equal(plan.actions[0].inputs.message, message);
  assert.equal(plan.actions[0].inputs.audience_scope.audience, 'self');

  const preview = await runPlannedAssistantAction({ plan });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.dry_run, true);
  assert.equal(preview.preview.requirement_id, 'REQ-20260623-023');
  assert.equal(preview.preview.reminder.trigger.trigger_type, 'threshold');
  assert.equal(preview.preview.reminder.trigger.threshold_percent, 70);
  assert.equal(preview.preview.external_send_performed, false);
});

test('reminder action is available across Telegram and website assistants for the same actor', () => {
  const message = 'Remind me tomorrow to finish the website.';
  const telegramPlan = buildAssistantActionPlan({
    actor: superAdmin,
    channel: 'telegram',
    message,
  });
  const websitePlan = buildAssistantActionPlan({
    actor: superAdmin,
    channel: 'website_assistant',
    message,
  });

  assert.equal(telegramPlan.actions[0].action_id, 'schedule_assistant_reminder');
  assert.equal(websitePlan.actions[0].action_id, 'schedule_assistant_reminder');
  assert.equal(telegramPlan.actions[0].inputs.message, websitePlan.actions[0].inputs.message);
});
