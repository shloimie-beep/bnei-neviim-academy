const assert = require('node:assert/strict');
const test = require('node:test');

async function loadModule() {
  return import('../scripts/task-decision-census.mjs');
}

test('task decision census separates Decisions, Tasks, Codex Queue, Pending, and Done', async () => {
  const { buildTaskDecisionCensus, canonicalTaskLane } = await loadModule();
  const tasks = [
    {
      id: 1,
      title: 'Choose payment provider',
      item_type: 'decision',
      task_kind: 'decision',
      decision_required: true,
      decision_owner: 'Shloimie',
      decision_prompt: 'Choose a payment provider.'
    },
    {
      id: 2,
      title: 'Implement task census',
      assigned_to: 'Codex',
      task_kind: 'agent_job',
      agent_status: 'queued'
    },
    {
      id: 3,
      title: 'Wait for DNS access',
      task_kind: 'pending_access',
      waiting_on: 'external DNS owner'
    },
    {
      id: 4,
      title: 'Review parent copy',
      assigned_to: 'Shloimie',
      task_kind: 'task'
    },
    {
      id: 5,
      title: 'Verified old item',
      stage: 'done',
      verified_at: '2026-06-19T00:00:00+03:00'
    }
  ];

  assert.equal(canonicalTaskLane(tasks[0]), 'decisions');
  assert.equal(canonicalTaskLane(tasks[1]), 'codex_queue');
  assert.equal(canonicalTaskLane(tasks[2]), 'pending');
  assert.equal(canonicalTaskLane(tasks[3]), 'tasks');
  assert.equal(canonicalTaskLane(tasks[4]), 'done_activity');

  const census = buildTaskDecisionCensus({ tasks, source: 'fixture' });
  assert.equal(census.counts.by_lane.decisions, 1);
  assert.equal(census.counts.by_lane.codex_queue, 1);
  assert.equal(census.counts.by_lane.pending, 1);
  assert.equal(census.counts.by_lane.tasks, 1);
  assert.equal(census.counts.by_lane.done_activity, 1);
  assert.equal(census.read_only, true);
});

test('task decision census flags duplicates and internal handoff cards without exposing titles', async () => {
  const { buildTaskDecisionCensus } = await loadModule();
  const tasks = [
    {
      id: 10,
      title: 'Clean duplicate One Time decision cards',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class'
    },
    {
      id: 11,
      title: 'Clean duplicate One Time decision cards',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class'
    },
    {
      id: 12,
      title: 'tasks-pending/2026-06-19-one-time-master-recovery-register.md',
      notes: 'Internal implementation brief should not be a visible task.'
    }
  ];

  const census = buildTaskDecisionCensus({ tasks, source: 'fixture' });
  assert.equal(census.duplicate_groups.length, 1);
  assert.deepEqual(census.duplicate_groups[0].task_ids, [10, 11]);
  assert.ok(census.duplicate_groups[0].title_fingerprints.every((value) => /^[a-f0-9]{16}$/.test(value)));
  assert.ok(!JSON.stringify(census.duplicate_groups).includes('Clean duplicate One Time decision cards'));
  assert.ok(census.violations.some((violation) => violation.type === 'internal_brief_visible_as_task'));
  assert.ok(census.cleanup_plan.some((item) => item.action === 'archive_or_link_duplicates_after_operator_review'));
  assert.ok(census.cleanup_plan.every((item) => item.apply_gate === 'operator approval required'));
});

test('task decision census flags pending and decision records that lack actionable ownership', async () => {
  const { buildTaskDecisionCensus } = await loadModule();
  const census = buildTaskDecisionCensus({
    source: 'fixture',
    tasks: [
      {
        id: 20,
        title: 'Blocked but unclear',
        stage: 'blocked'
      },
      {
        id: 21,
        title: 'Needs a choice',
        item_type: 'decision',
        decision_required: true
      },
      {
        id: 22,
        title: 'Codex item marked as pending access',
        assigned_to: 'Codex',
        task_kind: 'pending_access'
      }
    ]
  });

  const violationTypes = new Set(census.violations.map((violation) => violation.type));
  assert.equal(violationTypes.has('pending_without_human_or_external_blocker'), true);
  assert.equal(violationTypes.has('decision_without_owner'), true);
  assert.equal(violationTypes.has('decision_without_prompt_or_next_action'), true);
  assert.equal(violationTypes.has('machine_work_marked_pending_access'), true);
  assert.ok(census.cleanup_plan.some((item) => item.action === 'add_blocker_owner_next_action_or_return_to_tasks'));
  assert.ok(census.cleanup_plan.some((item) => item.action === 'move_machine_work_to_codex_queue_or_create_decision'));
});

test('task decision census exposes required default views, card contract, and audit dimensions', async () => {
  const {
    buildTaskDecisionCensus,
    TASK_OPERATIONAL_VIEWS,
    TASK_DEFAULT_VIEWS,
    DECISION_DEFAULT_VIEWS
  } = await loadModule();
  const census = buildTaskDecisionCensus({
    source: 'fixture',
    tasks: [
      {
        id: 30,
        title: 'Create One Time member-library blocker Decision',
        workspace_key: 'rabbi_sheller_provider',
        project_key: 'one_time_mishnah_class',
        source_id: 'RAW-1',
        requirement_id: 'REQ-1',
        assigned_to: 'Shloimie',
        contact_id: 99,
        student_id: 22,
        provider_id: 7,
        due_date: '2026-06-24',
        created_at: '2026-06-21T08:00:00+03:00',
        updated_at: '2026-06-21T09:00:00+03:00'
      }
    ]
  });

  assert.deepEqual(TASK_DEFAULT_VIEWS.map((view) => view.label), [
    'Active Now',
    'Needs Your Decision',
    'Waiting Externally',
    'Recently Completed',
    'Full History / Search'
  ]);
  assert.deepEqual(TASK_OPERATIONAL_VIEWS.map((view) => view.label), [
    'My Tasks',
    'One Time Tasks',
    'Codex Queue',
    'Due Soon',
    'Calendar',
    'Archived'
  ]);
  assert.deepEqual(DECISION_DEFAULT_VIEWS.map((view) => view.label), [
    'Needs My Decision',
    'Needs Rabbi Scheller',
    'Needs External Owner',
    'Decided',
    'Superseded',
    'Archived'
  ]);
  for (const dimension of [
    'by_workspace',
    'by_project',
    'by_source',
    'by_owner',
    'by_status',
    'by_requirement',
    'by_agent_run',
    'by_contact',
    'by_student',
    'by_provider',
    'by_duplicate_fingerprint',
    'by_age',
    'by_last_activity'
  ]) {
    assert.ok(census.counts[dimension], `${dimension} should be present`);
  }
  assert.ok(census.card_contract.includes('latest meaningful activity'));
  assert.ok(census.operational_task_views.some((view) => view.label === 'Codex Queue'));
  assert.equal(census.cleanup_behavior.mode, 'dry_run_only_no_production_mutation');
  assert.equal(census.cleanup_behavior.no_private_parent_student_data_deleted, true);
});

test('task decision census uses a stable deterministic dedupe key from provenance and target fields', async () => {
  const { deterministicTaskDedupeKey, buildTaskDecisionCensus } = await loadModule();
  const base = {
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    source_id: 'RAW-20260619-1',
    source_statement: 'Attach Vimeo URL to session',
    action_key: 'attach_vimeo_video',
    contact_id: 12,
    requirement_id: 'REQ-20260619-306',
    target_route: '/operations/content/library'
  };
  const first = { ...base, id: 41, title: 'Attach the Vimeo URL' };
  const second = { ...base, id: 42, title: 'Please add this video to the member library now' };

  assert.equal(deterministicTaskDedupeKey(first), deterministicTaskDedupeKey(second));

  const census = buildTaskDecisionCensus({ source: 'fixture', tasks: [first, second] });
  assert.equal(census.duplicate_groups.length, 1);
  assert.deepEqual(census.duplicate_groups[0].stable_key_basis, [
    'workspace',
    'project',
    'source_id_or_statement',
    'canonical_action',
    'related_entity',
    'requirement_id',
    'target_file_or_route'
  ]);
});
