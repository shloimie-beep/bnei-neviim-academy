const assert = require('node:assert/strict');
const test = require('node:test');

const {
  parsePlatformIntake,
} = require('../../src/platform/ingestion/canonical-parser');
const {
  createIntakeSourceRecord,
} = require('../../src/platform/ingestion/intake-source');
const {
  normalizePromptStatus,
  normalizeChildOutcomeStatus,
  isTerminalChildOutcomeStatus,
  createParentPrompt,
  appendChildOutcome,
  transitionPrompt,
  buildPromptAutoResumePlan,
  applyPromptAutoResumePlan,
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
  assert.equal(parsed.source_envelope.default_workspace, 'rabbi_sheller_provider');
  assert.equal(parsed.source_envelope.default_context_type, 'class_recording');
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
  assert.ok(parsed.tasks.every((task) => task.workspace_key === 'rabbi_sheller_provider'));
});

test('W3 parser preserves source envelope defaults while local Operations fragments override item routing', () => {
  const parsed = parsePlatformIntake({
    raw_text: [
      'Menachem should practice the new bedtime routine.',
      'Operations task: Codex should update parser status evidence.',
    ].join('\n'),
    source_provider: 'drive',
    filename: 'Dratler family meeting 2026-06-21 transcript.txt',
  });

  assert.equal(parsed.schema_valid, true);
  assert.equal(parsed.source_envelope.default_context_type, 'family_meeting');
  assert.equal(parsed.source_envelope.default_workspace, 'dratler_family');
  assert.ok(parsed.tasks.some((task) => (
    task.workspace_key === 'internal_super_admin'
    && task.project_key === 'bna_operations'
    && task.metadata.source_context.override_applied === true
  )));
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

test('W3 prompt queue closes passed verification packages through canonical parent statuses', () => {
  const source = createIntakeSourceRecord({
    source_provider: 'manual',
    raw_text: 'Prompt packet: verify the lifecycle bridge.',
  });
  let prompt = createParentPrompt({ source_record: source, status: 'verifying', agent: 'Codex' });
  prompt = appendChildOutcome(prompt, {
    item_type: 'work_package',
    title: 'Verify lifecycle bridge',
    status: 'passed',
    evidence: ['ops/playwright-smokes/lifecycle-bridge/report.md'],
  });

  const status = buildRambleStatusViewModel(prompt);
  assert.equal(normalizePromptStatus('passed'), 'completed');
  assert.equal(normalizeChildOutcomeStatus('sealed_pass'), 'passed');
  assert.equal(isTerminalChildOutcomeStatus('passed'), true);
  assert.equal(prompt.child_outcomes[0].status, 'passed');
  assert.equal(status.child_outcome_count, 1);
  assert.equal(status.terminal_child_outcome_count, 1);
  assert.equal(
    status.next_action,
    'All child outcomes are terminal; move the parent prompt to completed, failed, or needs_decision with evidence.'
  );

  const closed = transitionPrompt(prompt, 'passed', {
    timestamp: '2026-06-23T14:20:00.000Z',
    evidence: ['ops/playwright-smokes/lifecycle-bridge/report.md'],
    result: 'Lifecycle bridge verified.',
  });
  assert.equal(closed.status, 'completed');
  assert.equal(closed.current_phase, 'completed');
  assert.equal(closed.completed_at, '2026-06-23T14:20:00.000Z');
  assert.deepEqual(closed.evidence, ['ops/playwright-smokes/lifecycle-bridge/report.md']);
});

test('W3 prompt auto-resume plans resolved decisions, terminal children, and stale heartbeats', () => {
  const source = createIntakeSourceRecord({
    source_provider: 'manual',
    raw_text: 'Prompt packet: verify auto-resume lifecycle.',
  });
  const needsDecision = createParentPrompt({
    source_record: source,
    status: 'needs_decision',
    agent: 'Codex',
    blocker: 'Operator approval required.',
  });
  const resumePlan = buildPromptAutoResumePlan(needsDecision, {
    now: '2026-06-23T15:00:00.000Z',
    decision_resolution: { status: 'resolved', summary: 'Approved to continue.' },
    resume_status: 'in_progress',
  });
  assert.equal(resumePlan.action, 'resume_after_decision');
  assert.equal(resumePlan.target_status, 'in_progress');
  assert.equal(resumePlan.external_write_performed, false);

  const resumed = applyPromptAutoResumePlan(needsDecision, resumePlan, {
    timestamp: '2026-06-23T15:00:00.000Z',
    current_phase: 'implementation',
  });
  assert.equal(resumed.applied, true);
  assert.equal(resumed.prompt.status, 'in_progress');
  assert.equal(resumed.prompt.blocker, null);
  assert.equal(resumed.prompt.current_phase, 'implementation');

  const verifying = appendChildOutcome(createParentPrompt({
    source_record: source,
    status: 'verifying',
    agent: 'Codex',
  }), {
    item_type: 'work_package',
    title: 'Verify auto-resume lifecycle',
    status: 'passed',
  });
  const closePlan = buildPromptAutoResumePlan(verifying, { now: '2026-06-23T15:01:00.000Z' });
  assert.equal(closePlan.action, 'close_completed');
  assert.equal(closePlan.target_status, 'completed');
  assert.equal(closePlan.terminal_child_outcome_count, 1);

  const stalePrompt = transitionPrompt(createParentPrompt({
    source_record: source,
    status: 'queued',
    agent: 'Codex',
    heartbeat_at: '2026-06-23T14:00:00.000Z',
  }), 'in_progress', {
    timestamp: '2026-06-23T14:00:00.000Z',
    heartbeat_at: '2026-06-23T14:00:00.000Z',
  });
  const stalePlan = buildPromptAutoResumePlan(stalePrompt, {
    now: '2026-06-23T15:00:00.000Z',
    stale_after_ms: 30 * 60 * 1000,
  });
  assert.equal(stalePlan.action, 'route_to_decision');
  assert.equal(stalePlan.reason, 'stale_heartbeat');
  assert.equal(stalePlan.target_status, 'needs_decision');
  assert.equal(stalePlan.can_transition, true);
});
