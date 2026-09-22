const assert = require('node:assert/strict');
const test = require('node:test');

async function loadModule() {
  return import('../scripts/task-decision-production-cleanup.mjs');
}

test('task decision production cleanup plans only reversible scoped actions', async () => {
  const { buildPlan } = await loadModule();
  const plan = buildPlan([
    {
      id: 1,
      title: 'One Time Mishnah class setup',
      project_key: 'bna',
      assigned_to: 'Shloimie',
      source_id: 'RAW-1',
      created_at: '2026-06-21T08:00:00+03:00'
    },
    {
      id: 2,
      title: 'tasks-pending/one-time-handoff.md',
      notes: 'Internal implementation brief for One Time',
      project_key: 'one_time_mishnah_class',
      task_kind: 'decision',
      item_type: 'decision',
      decision_required: true,
      decision_owner: 'Shloimie',
      source_id: 'RAW-2'
    },
    {
      id: 3,
      title: 'Duplicate One Time setup action',
      project_key: 'one_time_mishnah_class',
      source_id: 'RAW-3',
      action_key: 'same_action',
      assigned_to: 'Shloimie'
    },
    {
      id: 4,
      title: 'Duplicate One Time setup action',
      project_key: 'one_time_mishnah_class',
      source_id: 'RAW-3',
      action_key: 'same_action',
      assigned_to: 'Shloimie'
    },
    {
      id: 5,
      title: 'Private duplicate should not auto-archive',
      project_key: 'one_time_mishnah_class',
      source_id: 'RAW-4',
      action_key: 'private_action',
      student_id: 123,
      assigned_to: 'Shloimie'
    },
    {
      id: 6,
      title: 'Private duplicate should not auto-archive',
      project_key: 'one_time_mishnah_class',
      source_id: 'RAW-4',
      action_key: 'private_action',
      student_id: 123,
      assigned_to: 'Shloimie'
    }
  ]);

  assert.equal(plan.actions.some((action) => action.action === 'reclassify_one_time_record' && action.task_id === 1), true);
  assert.equal(plan.actions.some((action) => action.action === 'quarantine_internal_handoff' && action.task_id === 2), true);
  assert.equal(plan.actions.some((action) => action.action === 'archive_duplicate_task' && action.task_id === 4 && action.canonical_task_id === 3), true);
  assert.equal(plan.actions.some((action) => action.task_id === 6), false);
  assert.equal(plan.actions.every((action) => action.reversible), true);
  assert.equal(plan.actions.every((action) => action.before && action.before.title_fingerprint), true);
});
