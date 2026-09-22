const test = require('node:test');
const assert = require('node:assert/strict');

const {
  closeProblemTicketPlan,
  planProblemResolution,
} = require('../src/platform/assistant/problem-resolution');
const {
  buildAssistantActionPlan,
  runPlannedAssistantAction,
} = require('../src/platform/assistant/action-planner');
const { runAction } = require('../src/lib/actions/runner');

const parent = {
  user_id: 'parent-local',
  role: 'parent',
  workspace_id: 'bna',
  parent_id: 'parent-1',
  linked_child_ids: ['101'],
};

const superAdmin = {
  user_id: 'shloimie-local',
  role: 'super_admin',
  workspace_id: 'bna',
  scope: { type: 'all' },
};

const provider = {
  user_id: 'provider-local',
  role: 'provider_admin',
  workspace_id: 'rabbi_sheller_provider',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
  provider_id: 'sheller',
};

test('parent problem reports preserve website context, require private reply for sensitive group chat issues, and do not create Codex tasks', () => {
  const plan = planProblemResolution({
    actor: parent,
    channel: 'website_assistant',
    message: 'The payment page charged me twice and the receipt screen shows the wrong date.',
    context: {
      route: '/parent?section=billing',
      viewport: { width: 390, height: 844 },
      group_chat: true,
      student_id: '101',
    },
    files: [{ filename: 'receipt.png', fingerprint: 'sha256-receipt', privacy_classification: 'billing' }],
  });

  assert.equal(plan.requirement_id, 'REQ-20260623-022');
  assert.equal(plan.classification.category, 'billing');
  assert.equal(plan.classification.private_reply_required, true);
  assert.equal(plan.source_envelope.route, '/parent?section=billing');
  assert.equal(plan.source_envelope.file_refs[0].fingerprint, 'sha256-receipt');
  assert.equal(plan.ticket.action_id, 'create_ticket');
  assert.equal(plan.personal_pending_task_created, false);
  assert.equal(plan.codex_task_created, false);
  assert.equal(plan.external_write_performed, false);
  assert.equal(plan.browser_click_substitution_allowed, false);
});

test('technical bug reports prepare Agent Work packages without executing them from model text', () => {
  const plan = planProblemResolution({
    actor: superAdmin,
    channel: 'operations_helper',
    message: 'This parent portal button does nothing. Fix it and have Codex verify it.',
    context: {
      route: '/parent?section=calendar',
      object_type: 'button',
      object_id: 'calendar-save',
    },
  });

  assert.equal(plan.classification.category, 'bug');
  assert.equal(plan.classification.technical_issue, true);
  assert.equal(plan.agent_work_package.action_id, 'route_bug_to_codex');
  assert.equal(plan.agent_work_package.status, 'planned_not_created');
  assert.equal(plan.agent_work_package.created, false);
  assert.ok(plan.agent_work_package.acceptance_criteria.some((item) => /Deploy and live-smoke/i.test(item)));
  assert.equal(plan.ticket.inputs.source_context.problem_resolution.agent_work_required, true);
});

test('dedupe returns the open existing ticket instead of creating duplicate outcomes', () => {
  const first = planProblemResolution({
    actor: provider,
    channel: 'provider_portal_assistant',
    message: 'The Zoom link is broken for tonight class.',
    context: { route: '/provider?section=classes' },
  });
  const duplicate = planProblemResolution({
    actor: provider,
    channel: 'telegram',
    message: 'The Zoom link is broken for tonight class.',
    context: { route: '/provider?section=classes' },
    existing_tickets: [
      {
        id: 44,
        status: 'open',
        title: 'Zoom link is broken',
        metadata: { dedupe_key: first.dedupe_key },
      },
    ],
  });

  assert.equal(duplicate.status, 'duplicate_found');
  assert.equal(duplicate.ticket.status, 'duplicate_existing_ticket');
  assert.equal(duplicate.duplicate_ticket.ticket_id, 44);
  assert.equal(duplicate.codex_task_created, false);
});

test('existing ticket actions include the shared problem-resolution plan', async () => {
  const ticket = await runAction({
    action_id: 'create_ticket',
    source: 'website_assistant',
    inputs: {
      message: 'The Zoom link is broken and parents cannot join.',
      route: '/parent?section=classes',
      viewport: { width: 390, height: 844 },
    },
    actor: parent,
  });

  assert.equal(ticket.success, true);
  assert.equal(ticket.executed, true);
  assert.equal(ticket.result.requirement_id, 'REQ-20260623-022');
  assert.equal(ticket.result.problem_resolution.classification.technical_issue, true);
  assert.equal(ticket.result.problem_resolution.agent_work_package.status, 'planned_not_created');
  assert.equal(ticket.result.no_codex_task_created, true);

  const report = await runAction({
    action_id: 'create_report_problem_ticket',
    source: 'ui_button',
    inputs: {
      message: 'This screen is unclear and the button does nothing.',
      route: '/parent',
      viewport: { width: 390, height: 844 },
    },
    actor: parent,
  });
  assert.equal(report.success, true);
  assert.equal(report.result.review_ticket, true);
  assert.equal(report.result.codex_task_created, false);
  assert.equal(report.result.problem_resolution.requirement_id, 'REQ-20260623-022');
});

test('planner keeps parent technical reports as tickets while super admin can preview Agent Work routing', async () => {
  const message = 'Fix this broken parent portal button in Codex and test it.';
  const parentPlan = buildAssistantActionPlan({
    channel: 'website_assistant',
    actor: parent,
    message,
  });
  assert.equal(parentPlan.actions[0].action_id, 'create_ticket');

  const adminPlan = buildAssistantActionPlan({
    channel: 'operations_helper',
    actor: superAdmin,
    message,
  });
  assert.equal(adminPlan.actions[0].action_id, 'route_bug_to_codex');
  assert.equal(adminPlan.actions[0].approval_required, true);
  const preview = await runPlannedAssistantAction({ plan: adminPlan });
  assert.equal(preview.success, true);
  assert.equal(preview.executed, false);
  assert.equal(preview.preview.codex_task_created, false);
  assert.equal(preview.preview.approval_required_before_queue, true);
});

test('problem tickets cannot be closed without evidence or user confirmation', () => {
  const blocked = closeProblemTicketPlan({ ticket_id: 123 });
  assert.equal(blocked.can_close, false);
  assert.equal(blocked.status, 'needs_evidence_or_user_confirmation');

  const withEvidence = closeProblemTicketPlan({
    ticket_id: 123,
    evidence: ['ops/live-smokes/example.md'],
    resolution_note: 'Fixed and verified.',
  });
  assert.equal(withEvidence.can_close, true);
  assert.equal(withEvidence.status, 'ready_to_close');

  const confirmed = closeProblemTicketPlan({
    ticket_id: 124,
    user_confirmed: true,
  });
  assert.equal(confirmed.can_close, true);
});
