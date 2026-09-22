const assert = require('node:assert/strict');
const test = require('node:test');

const { parseIntakeText } = require('../src/lib/bna/intake-parser');

test('unclear workspace intake creates one routing decision and blocks task fan-out', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'Not sure whether this belongs to BNA or One Time.',
      'Fix the signup routing, create the calendar task, and add the source-sheet workflow.',
      'Please figure out the workspace before filing it.',
    ].join(' '),
    source_type: 'telegram',
    source_date: '2026-06-19',
  });

  assert.equal(parsed.tasks.length, 0);
  assert.equal(parsed.decisions.length, 1);
  assert.equal(parsed.decisions[0].title, 'Decide intake workspace routing');
  assert.equal(parsed.decisions[0].workspace_key, 'needs_routing_decision');
  assert.equal(parsed.decisions[0].project_key, null);
  assert.equal(parsed.decisions[0].metadata.auto_task_creation_blocked, true);

  assert.equal(parsed.workspace_routing.length, 1);
  assert.equal(parsed.workspace_routing[0].workspace_key, 'needs_routing_decision');
  assert.equal(parsed.workspace_routing[0].project_key, null);
  assert.equal(parsed.workspace_routing[0].metadata.routing_basis, 'ambiguous_workspace_routing');
  assert.ok(parsed.review_items.some((item) => item.review_type === 'ambiguous_workspace_routing'));
  assert.ok(parsed.filing_plan.every((plan) => plan.item_type !== 'task'));
});

test('explicit One Time routing still files to the One Time workspace', () => {
  const parsed = parseIntakeText({
    raw_input: 'Route this to One Time: create the Vimeo library task for Rabbi Elie Scheller.',
    source_type: 'telegram',
    source_date: '2026-06-19',
  });

  assert.ok(parsed.tasks.length >= 1);
  assert.ok(parsed.workspace_routing.length >= 1);
  assert.equal(parsed.tasks[0].workspace_key, 'rabbi_sheller_provider');
  assert.equal(parsed.tasks[0].project_key, 'one_time_mishnah_class');
});

test('source envelope keeps Dratler family default while Operations fragment overrides locally', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'Menachem should practice the new bedtime routine.',
      'Operations task: Codex should update BATCH-STATUS.md with parser evidence.',
    ].join('\n'),
    source_type: 'drive',
    filename: 'Dratler family meeting 2026-06-21 transcript.txt',
    source_date: '2026-06-21',
  });

  const operationsTask = parsed.tasks.find((task) => /BATCH-STATUS\.md/i.test(task.source_excerpt));
  assert.equal(parsed.source_envelope.default_context_type, 'family_meeting');
  assert.equal(parsed.source_envelope.default_workspace, 'dratler_family');
  assert.equal(parsed.source_envelope.default_project, 'dratler_family');
  assert.ok(operationsTask, 'expected Operations task fragment to parse');
  assert.equal(operationsTask.workspace_key, 'internal_super_admin');
  assert.equal(operationsTask.project_key, 'bna_operations');
  assert.equal(operationsTask.metadata.source_context.default_context_type, 'family_meeting');
  assert.equal(operationsTask.metadata.source_context.context_type, 'operations_ramble');
  assert.equal(operationsTask.metadata.source_context.override_applied, true);
  assert.equal(operationsTask.metadata.source_context.default_workspace, 'dratler_family');
});
