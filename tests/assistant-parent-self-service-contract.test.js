const test = require('node:test');
const assert = require('node:assert/strict');

const {
  PARENT_CAPABILITIES,
  PARENT_CHART_TEMPLATES,
  buildParentAssistantContext,
  createParentChartLayout,
  createParentSupportTicketPlan,
  patchParentChartLayout,
  requestOfficialCorrection,
  setParentReminderPlan,
  submitHomePracticeUpdate,
} = require('../src/platform/assistant/parent-self-service');

const parent = {
  user_id: 'parent-local',
  identity_key: 'identity_parent_1',
  role: 'parent',
  parent_id: 'parent-1',
  linked_child_ids: ['101', '102'],
  workspace_id: 'bna',
  scope: { type: 'parent', projectKey: 'bna', workspaceKey: 'bna' },
};

test('parent assistant context is linked-child scoped and exposes only parent capabilities', () => {
  const context = buildParentAssistantContext({
    actor: parent,
    channel: 'telegram',
    selected_child_id: '101',
    active_layout_key: 'weekly-view',
  });

  assert.equal(context.channel_key, 'telegram');
  assert.equal(context.role_scope, 'parent');
  assert.deepEqual(context.linked_child_ids, ['101', '102']);
  assert.equal(context.selected_child_id, '101');
  assert.ok(context.capabilities.includes('configure_display'));
  assert.deepEqual(context.capabilities, [...PARENT_CAPABILITIES]);
  assert.equal(context.admin_private_notes_visible, false);
  assert.equal(context.other_child_records_visible, false);

  assert.throws(() => buildParentAssistantContext({
    actor: parent,
    channel: 'parent_portal_assistant',
    selected_child_id: '999',
  }), /relationship_scope_mismatch/);
});

test('parent can create a linked-child chart layout preview without mutating official data', () => {
  const layout = createParentChartLayout({
    actor: parent,
    channel: 'parent_portal_assistant',
    child_id: '101',
    parent_id: 'parent-1',
    layout_name: 'My Weekly View',
    template: 'attendance_first',
    sections: ['attendance', 'progress', 'course_completion'],
    date_range: { preset: 'last_30_days' },
    metric_visibility: { attendance: true, progress: true, milestones: false },
    display_preferences: { chart_type: 'bars', density: 'simple' },
    real_data: true,
    sample_data: false,
  });

  assert.equal(layout.requirement_id, 'REQ-20260623-018');
  assert.equal(layout.capability, 'configure_display');
  assert.equal(layout.draft.object_type, 'chart_layout');
  assert.equal(layout.draft.object_category, 'dashboard_layout');
  assert.equal(layout.version.content.chart_template, 'attendance_first');
  assert.deepEqual(layout.version.content.dashboard_layout.sections, ['attendance', 'progress', 'course_completion']);
  assert.equal(layout.version.content.official_data_mutated, false);
  assert.equal(layout.version.content.underlying_record_change_allowed, false);
  assert.equal(layout.preview.preview_type, 'parent_chart_layout');
  assert.equal(layout.preview.real_data, true);
  assert.equal(layout.preview.sample_data, false);
  assert.equal(layout.preview.payload.renderer, 'interactive_parent_chart_preview');
  assert.equal(layout.preview.payload.official_data_mutated, false);
  assert.ok(PARENT_CHART_TEMPLATES.includes('parent_weekly_summary'));
});

test('parent chart layouts reject unlinked children and private/admin-only fields', () => {
  assert.throws(() => createParentChartLayout({
    actor: parent,
    channel: 'telegram',
    child_id: '999',
    parent_id: 'parent-1',
  }), /permission_denied: relationship_scope_mismatch/);

  assert.throws(() => createParentChartLayout({
    actor: parent,
    channel: 'parent_portal_assistant',
    child_id: '101',
    parent_id: 'parent-1',
    sections: ['attendance', 'admin_notes'],
  }), /parent_field_denied:sections:admin_notes/);

  assert.throws(() => createParentChartLayout({
    actor: parent,
    channel: 'parent_portal_assistant',
    child_id: '101',
    parent_id: 'parent-1',
    metric_visibility: { official_score: true },
  }), /parent_field_denied:metric_visibility:official_score/);
});

test('natural-language chart edits create a new version and still protect records', () => {
  const first = createParentChartLayout({
    actor: parent,
    channel: 'telegram',
    child_id: '101',
    parent_id: 'parent-1',
    template: 'progress_first',
  });

  const second = patchParentChartLayout({
    current: first,
    actor: parent,
    channel: 'website_assistant',
    changes: {
      sections: ['attendance', 'progress', 'milestones'],
      display_preferences: { chart_type: 'bars', density: 'simple' },
      change_summary: 'Move attendance above progress and use bars.',
    },
  });

  assert.equal(second.version.parent_version_key, first.version.version_key);
  assert.deepEqual(second.version.content.dashboard_layout.sections, ['attendance', 'progress', 'milestones']);
  assert.equal(second.version.content.display_preferences.chart_type, 'bars');
  assert.equal(second.preview.payload.renderer, 'interactive_parent_chart_preview');
  assert.equal(second.official_data_mutated, false);
});

test('home-practice updates are review plans and official corrections never mutate records', () => {
  const practice = submitHomePracticeUpdate({
    actor: parent,
    channel: 'telegram',
    child_id: '101',
    parent_id: 'parent-1',
    note: 'Avi practiced at home for 20 minutes.',
    date: '2026-06-23',
    evidence: ['voice-note-123'],
  });

  assert.equal(practice.capability, 'submit_allowed_update');
  assert.equal(practice.status, 'queued_for_review');
  assert.equal(practice.update_type, 'home_practice');
  assert.equal(practice.official_data_mutated, false);
  assert.equal(practice.review_required, true);

  const correction = requestOfficialCorrection({
    actor: parent,
    channel: 'parent_portal_assistant',
    child_id: '101',
    parent_id: 'parent-1',
    field: 'official_attendance',
    note: 'The attendance date looks wrong.',
  });

  assert.equal(correction.capability, 'request_correction');
  assert.equal(correction.status, 'needs_review');
  assert.equal(correction.blocked_reason, 'official_record_changes_require_review');
  assert.equal(correction.official_data_mutated, false);
  assert.equal(correction.underlying_record_change_allowed, false);
});

test('parent tickets and reminders are scoped, deduped, and private for sensitive contexts', () => {
  const ticket = createParentSupportTicketPlan({
    actor: parent,
    channel: 'telegram',
    child_id: '102',
    parent_id: 'parent-1',
    message: 'The payment page charged me twice.',
    route: '/parent/billing',
    source_metadata: { chat_type: 'group' },
  });

  assert.equal(ticket.action_id, 'create_ticket');
  assert.equal(ticket.category, 'billing');
  assert.equal(ticket.child_id, '102');
  assert.equal(ticket.codex_task_created, false);
  assert.equal(ticket.delivery_restrictions.private_reply_required, true);
  assert.equal(ticket.delivery_restrictions.public_group_summary_allowed, false);
  assert.match(ticket.idempotency_key, /^parent_ticket_/);

  const reminder = setParentReminderPlan({
    actor: parent,
    channel: 'parent_portal_assistant',
    child_id: '102',
    parent_id: 'parent-1',
    reminder_text: 'Remind me 30 minutes before class.',
    trigger: '30 minutes before class',
    recurrence: 'before_every_class',
    delivery_channels: ['telegram', 'email'],
  });

  assert.equal(reminder.action_id, 'create_parent_reminder');
  assert.equal(reminder.status, 'planned');
  assert.deepEqual(reminder.delivery_channels, ['telegram', 'email']);
  assert.equal(reminder.consent_checked, true);
  assert.equal(reminder.external_action, false);
  assert.equal(reminder.official_data_mutated, false);

  const portalReminder = setParentReminderPlan({
    actor: parent,
    channel: 'parent_portal_assistant',
    child_id: '101',
    parent_id: 'parent-1',
    reminder_text: 'Remind me before class.',
    trigger: '30 minutes before class',
  });
  assert.deepEqual(portalReminder.delivery_channels, ['in_app']);

  assert.throws(() => setParentReminderPlan({
    actor: parent,
    channel: 'parent_portal_assistant',
    child_id: '999',
    parent_id: 'parent-1',
    reminder_text: 'Wrong child reminder.',
  }), /permission_denied: relationship_scope_mismatch/);
});
