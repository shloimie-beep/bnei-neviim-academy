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
