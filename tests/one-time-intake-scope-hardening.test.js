const assert = require('node:assert/strict');
const test = require('node:test');

const { parseIntakeText } = require('../src/lib/bna/intake-parser');

const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';

function parsedLaneItems(parsed) {
  return [
    'tasks',
    'decisions',
    'content_items',
    'integration_items',
    'service_provider_items',
    'class_session_notes',
    'student_questions',
    'research_items',
    'workspace_routing',
  ].flatMap((key) => (parsed[key] || []).map((item) => ({ key, item })));
}

test('future Rabbi Elie and One Time intake inherits provider workspace scope', () => {
  const parsed = parseIntakeText({
    raw_input: [
      'Drive transcript from Rabbi Elie Scheller for the One Time Mishnah class.',
      'Create the Vimeo library content job, prepare the Zoom calendar reminder, and ask for Resend sender approval.',
      'Decision: Shloimie should confirm the owner-only Vimeo account action before anything live is changed.',
      'Route this to the One Time workspace only.',
    ].join(' '),
    source_type: 'drive',
    source_date: '2026-06-19',
  });

  assert.ok(parsed.workspace_routing.length >= 1);
  assert.ok(parsed.content_items.length >= 1);
  assert.ok(parsed.integration_items.length >= 1);
  assert.ok(parsed.decisions.length >= 1);

  for (const { key, item } of parsedLaneItems(parsed)) {
    assert.equal(item.workspace_key, ONE_TIME_WORKSPACE_KEY, `${key} should stay in the One Time provider workspace`);
    assert.equal(item.project_key, ONE_TIME_PROJECT_KEY, `${key} should carry the One Time project key`);
  }
});

test('generic BNA source-sheet intake does not inherit One Time scope', () => {
  const parsed = parseIntakeText({
    raw_input: 'Task: build source sheets for the BNA class recordings and route this under the BNA workspace.',
    source_type: 'telegram',
    source_date: '2026-06-19',
  });

  assert.ok(parsed.tasks.length >= 1);
  assert.ok(parsed.workspace_routing.length >= 1);
  for (const { item } of parsedLaneItems(parsed)) {
    assert.notEqual(item.workspace_key, ONE_TIME_WORKSPACE_KEY);
    assert.notEqual(item.project_key, ONE_TIME_PROJECT_KEY);
  }
});
