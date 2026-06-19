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
