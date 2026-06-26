const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildOneTimeTaskViewModel,
  classifyOneTimeTask,
  ONE_TIME_BLOCKER_TYPES,
  ONE_TIME_TASK_CATEGORIES,
  ONE_TIME_TASK_LANES,
  ONE_TIME_TASK_OWNERS,
} = require('../src/platform/instances/one-time-task-view-model');

const scope = {
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
};

function laneIds(viewModel) {
  return viewModel.lanes.map((lane) => lane.id);
}

function idsForLane(viewModel, laneId) {
  return viewModel.lane_items[laneId].map((item) => item.id);
}

test('One Time task view model exposes the required clean lanes', () => {
  assert.deepEqual(ONE_TIME_TASK_LANES.map((lane) => lane.label), [
    'Needs Rabbi Decision',
    'Needs Shloimie',
    'In Progress',
    'Blocked External Setup',
    'Done / Activity',
  ]);

  const model = buildOneTimeTaskViewModel([
    {
      id: 1,
      ...scope,
      title: 'Approve class schedule policy',
      item_type: 'decision',
      task_kind: 'decision',
      stage: 'needs_decision',
      decision_owner: 'Rabbi Elie Scheller',
    },
    {
      id: 2,
      ...scope,
      title: 'Review trial pricing copy',
      stage: 'assigned',
      assigned_to: 'Shloimie',
    },
    {
      id: 3,
      ...scope,
      title: 'Prepare reviewed landing-page asset list',
      stage: 'in_progress',
      assigned_to: 'Future admin',
    },
    {
      id: 4,
      ...scope,
      title: 'Confirm Resend sender domain readiness',
      stage: 'assigned',
      waiting_on: 'External owner',
      blocked_reason: 'Resend sender domain DNS verification is missing.',
    },
    {
      id: 5,
      ...scope,
      title: 'Email preview templates reviewed',
      stage: 'done',
      completed_at: '2026-06-26T08:00:00.000Z',
    },
  ]);

  assert.deepEqual(laneIds(model), [
    'needs_rabbi_decision',
    'needs_shloimie',
    'in_progress',
    'blocked_external_setup',
    'done_activity',
  ]);
  assert.deepEqual(idsForLane(model, 'needs_rabbi_decision'), [1]);
  assert.deepEqual(idsForLane(model, 'needs_shloimie'), [2]);
  assert.deepEqual(idsForLane(model, 'in_progress'), [3]);
  assert.deepEqual(idsForLane(model, 'blocked_external_setup'), [4]);
  assert.deepEqual(idsForLane(model, 'done_activity'), [5]);
});

test('Codex work, raw prompts, and internal handoffs are hidden or demoted by default', () => {
  const model = buildOneTimeTaskViewModel([
    {
      id: 10,
      ...scope,
      title: 'Wire task card integration',
      task_kind: 'agent_job',
      assigned_to: 'Codex',
      agent_status: 'queued',
      stage: 'assigned',
    },
    {
      id: 11,
      ...scope,
      title: 'tasks-pending/2026-06-26-one-time-implementation-brief.md',
      source_path: 'tasks-pending/2026-06-26-one-time-implementation-brief.md',
      stage: 'assigned',
    },
    {
      id: 12,
      ...scope,
      title: 'Um so I need you to take this whole huge prompt and then also figure out the task board and then make sure it does not show all the weird raw prompt stuff and then do the thing',
      stage: 'assigned',
    },
  ]);

  assert.deepEqual(model.lanes.flatMap((lane) => lane.items.map((item) => item.id)), []);
  assert.deepEqual(model.agent_activity.map((item) => [item.id, item.demoted_to]), [[10, 'agent_activity']]);
  assert.deepEqual(model.hidden.map((item) => [item.id, item.hidden_reason]), [
    [11, 'internal_tasks_pending_handoff'],
    [12, 'raw_prompt_title'],
  ]);
});

test('blockers include owner, next action, and dependent module/action details', () => {
  const vimeo = classifyOneTimeTask({
    id: 20,
    ...scope,
    title: 'Approve Vimeo upload policy before automated class upload',
    stage: 'assigned',
    waiting_on: 'Rabbi Elie Scheller',
    blocked_reason: 'Vimeo user-level authorization and upload policy are missing.',
  });

  assert.equal(vimeo.lane, 'blocked_external_setup');
  assert.equal(vimeo.blocker.type, 'vimeo_user_authorization_upload_policy');
  assert.equal(vimeo.blocker.owner, 'Rabbi Sheller');
  assert.match(vimeo.blocker.exact_next_action, /Vimeo/i);
  assert.equal(vimeo.blocker.dependent_module_action, 'one_time.member_library.vimeo_upload');

  for (const key of [
    'resend_domain_readiness',
    'stripe_live_billing_approval',
    'zoom_owner_admin_meeting_policy',
    'vimeo_user_authorization_upload_policy',
    'hosted_transcription_credential',
    'separate_railway_domain_paused',
    'ghl_leadconnector_conflict',
  ]) {
    const blocker = ONE_TIME_BLOCKER_TYPES[key];
    assert.ok(blocker, `${key} should be modeled`);
    assert.ok(blocker.missing_information, `${key} has missing information`);
    assert.ok(blocker.owner, `${key} has owner`);
    assert.ok(blocker.recommended_option, `${key} has recommendation`);
    assert.ok(blocker.alternatives.length, `${key} has alternatives`);
    assert.ok(blocker.consequence, `${key} has consequence`);
    assert.ok(blocker.exact_next_action, `${key} has exact next action`);
    assert.ok(blocker.dependent_module_action, `${key} has dependent module/action`);
  }
});

test('duplicate parser fan-out and audit-output rows do not appear by default', () => {
  const model = buildOneTimeTaskViewModel([
    {
      id: 30,
      ...scope,
      title: 'Collect One Time website content assets',
      display_title: 'Collect One Time website content assets',
      stage: 'assigned',
      assigned_to: 'Shloimie',
      dedupe_key: 'one-time-assets',
    },
    {
      id: 31,
      ...scope,
      title: 'Collect One Time website content assets',
      stage: 'assigned',
      assigned_to: 'Shloimie',
      task_kind: 'parser_fanout',
      source: 'mixed-recording-parser',
      dedupe_key: 'one-time-assets',
    },
    {
      id: 32,
      ...scope,
      title: 'Generated task-decision census audit output row',
      stage: 'assigned',
      task_kind: 'audit_output',
      source: 'watchdog audit',
    },
  ]);

  assert.deepEqual(idsForLane(model, 'needs_shloimie'), [30]);
  assert.deepEqual(model.hidden.map((item) => [item.id, item.hidden_reason]), [
    [31, 'duplicate_parser_fanout'],
    [32, 'audit_output_not_human_task'],
  ]);
});

test('One Time scope is preserved and out-of-scope records are not surfaced', () => {
  const model = buildOneTimeTaskViewModel([
    {
      id: 40,
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      title: 'Prepare One Time member-library review',
      stage: 'assigned',
    },
    {
      id: 41,
      workspace_key: 'bna',
      project_key: 'bna',
      title: 'BNA student portal cleanup',
      stage: 'assigned',
    },
  ]);

  assert.equal(model.scope.workspace_key, 'rabbi_sheller_provider');
  assert.equal(model.scope.project_key, 'one_time_mishnah_class');
  assert.equal(model.lanes.flatMap((lane) => lane.items).length, 1);
  assert.equal(model.lanes.flatMap((lane) => lane.items)[0].scope.project_key, 'one_time_mishnah_class');
  assert.deepEqual(model.hidden.map((item) => [item.id, item.hidden_reason]), [[41, 'out_of_scope']]);
});

test('view model is pure and requires no production mutation', () => {
  const input = [{
    id: 50,
    ...scope,
    title: 'Confirm Stripe live billing approval',
    stage: 'assigned',
    waiting_on: 'Shloimie',
  }];
  const before = JSON.parse(JSON.stringify(input));
  const model = buildOneTimeTaskViewModel(input);

  assert.deepEqual(input, before);
  assert.equal(model.dry_run_only, true);
  assert.equal(model.mutation_required, false);
  assert.equal(model.production_mutation_required, false);
});

test('exported owner and category contracts include the required One Time values', () => {
  assert.deepEqual(ONE_TIME_TASK_OWNERS, [
    'Rabbi Sheller',
    'Shloimie',
    'Both',
    'Future admin',
    'Developer/agent',
    'External owner',
  ]);
  for (const label of [
    'Business model',
    'Partnership terms',
    'Pricing',
    'GHL setup',
    'Payment processor',
    'Banking/admin',
    'Landing pages',
    'Email sequences',
    'WhatsApp sequences',
    'Drive/content workflow',
    'Organic marketing',
    'Ads/ad tracking',
    'Support/ticketing',
    'Reporting/dashboard',
    'Testimonials/reputation',
    'Referral system',
    'Software/IP',
    'Open questions',
    'Tasks',
  ]) {
    assert.ok(ONE_TIME_TASK_CATEGORIES.includes(label), `${label} should be exported`);
  }
});
