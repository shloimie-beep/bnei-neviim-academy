const assert = require('node:assert/strict');
const test = require('node:test');

const {
  RAMBLE_ROUTING_VERSION,
  activeQueueItems,
  buildRambleRoutingPackage,
  canonicalItemKey,
  reevaluateRambleQueueAfterDecision,
} = require('../src/lib/bna/ramble-routing');

test('mixed ramble produces raw provenance, statement mappings, Codex work, Decision, and memory context', () => {
  const packet = buildRambleRoutingPackage({
    raw_id: 'RAW-20260624-900',
    source_channel: 'codex_chat',
    source_date: '2026-06-24',
    workspace_key: 'bna',
    project_key: 'assistant_runtime',
    raw_input: [
      'Fix the parent portal helper button so it opens the shared assistant.',
      'Persist API usage for the provider bot with workspace isolation.',
      'Decision: Shloimie must approve any real Telegram send.',
      'Remember from now on ordinary chat should not say queued Codex in the background.',
    ].join(' '),
  });

  assert.equal(packet.routing_version, RAMBLE_ROUTING_VERSION);
  assert.equal(packet.source_envelope.raw_id, 'RAW-20260624-900');
  assert.equal(packet.source_envelope.raw_text_sha256.length, 64);
  assert.ok(packet.statements.length >= 4);
  assert.equal(packet.no_lost_sentence, true);
  assert.equal(packet.source_statement_mappings.length, packet.statements.length);
  assert.ok(packet.executable_codex_tasks.some((item) => /parent portal helper/i.test(item.title)));
  assert.ok(packet.executable_codex_tasks.some((item) => /Persist API usage/i.test(item.title)));
  assert.equal(packet.decisions.length, 1);
  assert.match(packet.decisions[0].source_quote, /approve any real Telegram send/i);
  assert.equal(packet.memory_context_updates.length, 1);
  assert.match(packet.memory_context_updates[0].source_quote, /ordinary chat/i);
  assert.ok(packet.queue_visibility.active_count >= 3);
});

test('repeated ramble deduplicates against historical canonical work', () => {
  const existing = {
    items: [{
      stable_id: 'REQ-20260624-OLD',
      canonical_key: canonicalItemKey('task', 'Fix the parent portal helper button so it opens the shared assistant.', 'bna'),
      title: 'Fix the parent portal helper button so it opens the shared assistant.',
      status: 'Done',
      evidence_paths: ['ops/qa-runs/example.md'],
      workspace_key: 'bna',
    }],
  };
  const packet = buildRambleRoutingPackage({
    raw_id: 'RAW-20260624-901',
    source_date: '2026-06-24',
    raw_input: 'Fix the parent portal helper button so it opens the shared assistant.',
  }, existing);

  assert.equal(packet.dedupe.duplicate_count, 1);
  assert.equal(packet.executable_codex_tasks[0].status, 'Already satisfied');
  assert.equal(packet.queue_visibility.active_count, 0);
  assert.equal(packet.queue_visibility.completed_hidden_from_active.length, 1);
});

test('contradiction or instead wording supersedes prior work without deleting history', () => {
  const packet = buildRambleRoutingPackage({
    raw_id: 'RAW-20260624-902',
    source_date: '2026-06-24',
    raw_input: 'Actually replace the provider helper draft flow with an approval preview before execution.',
  }, {
    items: [{
      stable_id: 'REQ-20260624-PRIOR',
      canonical_key: 'task:bna:provider_helper_draft_flow',
      title: 'Build provider helper draft flow',
      status: 'queued',
      workspace_key: 'bna',
    }],
  });

  assert.ok(packet.dedupe.superseded_item_ids.includes('REQ-20260624-PRIOR'));
  assert.equal(packet.queue_visibility.active_items.length, 1);
  assert.equal(packet.queue_visibility.active_items[0].supersedes[0], 'REQ-20260624-PRIOR');
});

test('unsupported done claims stay open for verification instead of becoming Done', () => {
  const packet = buildRambleRoutingPackage({
    raw_id: 'RAW-20260624-903',
    source_date: '2026-06-24',
    raw_input: 'The API usage persistence is done and shipped.',
  });

  assert.equal(packet.executable_codex_tasks[0].status, 'needs_verification');
  assert.equal(packet.executable_codex_tasks[0].unsupported_done_claim, true);
  assert.equal(packet.queue_visibility.active_count, 1);
});

test('Decision completion unblocks dependent task automatically', () => {
  const decision = { stable_id: 'DEC-20260624-900', status: 'Decided' };
  const tasks = [{
    stable_id: 'TASK-20260624-900',
    status: 'Blocked',
    blocked_by_decision_id: 'DEC-20260624-900',
    blocker: 'Needs owner approval',
    blocker_owner: 'Shloimie',
  }];

  const [task] = reevaluateRambleQueueAfterDecision({ tasks, decisions: [decision] });
  assert.equal(task.status, 'queued');
  assert.equal(task.blocker, null);
  assert.equal(task.unblocked_by_decision_id, 'DEC-20260624-900');
});

test('completed work leaves active queue while historical evidence remains available', () => {
  const items = [
    { stable_id: 'TASK-1', status: 'Done', evidence_paths: ['ops/proof.md'] },
    { stable_id: 'TASK-2', status: 'Archived' },
    { stable_id: 'TASK-3', status: 'queued' },
  ];

  const active = activeQueueItems(items);
  assert.deepEqual(active.map((item) => item.stable_id), ['TASK-3']);
});
