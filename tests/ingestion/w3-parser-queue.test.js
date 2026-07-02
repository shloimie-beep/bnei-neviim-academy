const assert = require('node:assert/strict');
const test = require('node:test');

const {
  parsePlatformIntake,
} = require('../../src/platform/ingestion/canonical-parser');
const {
  createIntakeSourceRecord,
} = require('../../src/platform/ingestion/intake-source');
const {
  createParentPrompt,
  appendChildOutcome,
  transitionPrompt,
  buildQueueViewModel,
  buildPromptDetailViewModel,
  buildRambleStatusViewModel,
} = require('../../src/platform/ingestion/prompt-queue');

test('W3 parser emits the required schema and resolves One Time aliases', () => {
  const parsed = parsePlatformIntake({
    raw_text: 'Rabbi Elie Scheller One Time Mishnah class: Task: Codex should fix the prompt queue parser.',
    source_provider: 'telegram',
  });

  assert.equal(parsed.schema_valid, true);
  assert.equal(parsed.workspace.project_key, 'one_time_mishnah_class');
  assert.equal(parsed.workspace.key, 'rabbi_sheller_provider');
  for (const key of [
    'participants',
    'decisions',
    'tasks',
    'calendar_events',
    'content_items',
    'community_items',
    'integration_items',
    'notes',
    'unresolved',
    'deduplication_keys',
  ]) {
    assert.ok(Array.isArray(parsed[key]), `${key} should be an array`);
  }
  assert.ok(parsed.tasks.length >= 1);
  assert.ok(parsed.tasks.every((task) => task.title !== parsed.raw_text));
});

test('W3 parser routes schedule language into Calendar with idempotency', () => {
  const parsed = parsePlatformIntake({
    raw_text: 'One Time Mishnah class: schedule a calendar event for the review lesson tomorrow and decide whether parents should get a reminder.',
    source_provider: 'manual',
  });

  assert.equal(parsed.schema_valid, true);
  assert.equal(parsed.workspace.project_key, 'one_time_mishnah_class');
  assert.ok(parsed.calendar_events.length >= 1);
  assert.equal(parsed.calendar_events[0].target_lane, 'Calendar');
  assert.equal(parsed.calendar_events[0].metadata.external_write_performed, false);
  assert.ok(parsed.calendar_events[0].idempotency_key);
});

test('W3 parser deduplicates against active or recent records', () => {
  const raw = 'Task: Codex should verify the parent prompt queue status.';
  const first = parsePlatformIntake({ raw_text: raw, source_provider: 'manual' });
  const key = first.tasks[0].idempotency_key;
  const second = parsePlatformIntake({
    raw_text: raw,
    source_provider: 'manual',
    existing_records: [{ idempotency_key: key }],
  });

  assert.equal(second.tasks.some((task) => task.idempotency_key === key), false);
  assert.ok(second.unresolved.some((item) => item.reason === 'duplicate_active_or_recent_record'));
});

test('W3 parser prevents private student details from becoming public content and does not invent Zoom attendance', () => {
  const parsed = parsePlatformIntake({
    raw_text: [
      'Content idea: make a WhatsApp post from Avi accountability behavior note.',
      'Zoom class link needs setup for tomorrow, but no attendance was recorded.',
      'Student dashboard parser is broken and Codex should fix it.',
    ].join(' '),
    source_provider: 'telegram',
  });

  assert.equal(parsed.content_items.some((item) => /accountability|behavior/i.test(item.provenance.source_excerpt)), false);
  assert.ok(parsed.notes.some((item) => item.metadata.privacy_reroute === 'not_public_content'));
  assert.ok(parsed.unresolved.some((item) => item.title === 'Do not infer Zoom attendance'));
  assert.ok(parsed.tasks.some((item) => item.owner === 'Codex' || /Codex|parser|dashboard/i.test(item.provenance.source_excerpt)));
});

test('W3 prompt queue exposes queue, prompt, and ramble status view models', () => {
  const source = createIntakeSourceRecord({
    source_provider: 'manual',
    raw_text: 'Prompt packet: build the durable ramble queue.',
  });
  let prompt = createParentPrompt({ source_record: source, status: 'queued', agent: 'Codex' });
  prompt = transitionPrompt(prompt, 'in_progress', { current_phase: 'implementation' });
  prompt = appendChildOutcome(prompt, {
    item_type: 'task',
    title: 'Build parent prompt queue',
    status: 'queued',
  });
  prompt = appendChildOutcome(prompt, {
    item_type: 'task',
    title: 'Build parent prompt queue',
    status: 'queued',
  });

  assert.equal(prompt.child_outcomes.length, 1, 'child outcomes should dedupe');
  const queue = buildQueueViewModel([prompt], { now: '2026-06-19T13:00:00.000Z' });
  const detail = buildPromptDetailViewModel(prompt);
  const status = buildRambleStatusViewModel(prompt);

  assert.equal(queue.routes.queue, '/queue');
  assert.equal(queue.prompts[0].queue_position, 1);
  assert.equal(queue.prompts[0].current_phase, 'implementation');
  assert.match(detail.route, /\/prompt PROMPT-/);
  assert.equal(status.child_outcome_count, 1);
  assert.equal(status.next_action, 'Continue the current work package and update heartbeat/evidence.');
});
