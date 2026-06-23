const assert = require('node:assert/strict');
const test = require('node:test');

const { buildCanonicalIntakePacket } = require('../../src/platform/ingestion/intake-service');
const {
  CANONICAL_INTAKE_PERSISTENCE_VERSION,
  applyCanonicalIntakePacketToMemory,
  canonicalRowsFromPacket,
  createMemoryIntakePersistenceStore,
  readCanonicalIntakePersistence,
} = require('../../src/platform/ingestion/intake-persistence');

function fixturePacket() {
  return buildCanonicalIntakePacket({
    source_provider: 'operations_ui',
    source_kind: 'text',
    source_id: 'ops-ramble-memory-readback-001',
    raw_text: [
      'Task: Codex should persist the canonical intake packet locally.',
      'Decision: choose whether this packet is ready for approved database apply.',
    ].join(' '),
    workspace_key: 'internal_super_admin',
    project_key: 'bna_operations',
    created_at: '2026-06-23T11:45:00.000Z',
  }, {
    generated_at: '2026-06-23T11:45:00.000Z',
    agent: 'Codex',
  });
}

test('canonical intake memory persistence applies and reads back packets idempotently', () => {
  const packet = fixturePacket();
  const store = createMemoryIntakePersistenceStore();
  const first = applyCanonicalIntakePacketToMemory(packet, {
    store,
    applied_at: '2026-06-23T11:45:00.000Z',
  });

  assert.equal(first.contract_version, CANONICAL_INTAKE_PERSISTENCE_VERSION);
  assert.equal(first.storage_kind, 'memory');
  assert.equal(first.external_write_performed, false);
  assert.equal(first.before_counts.raw_intake, 0);
  assert.equal(first.after_counts.raw_intake, 1);
  assert.equal(first.after_counts.parse_runs, 1);
  assert.equal(first.after_counts.parent_prompts, 1);
  assert.ok(first.after_counts.parse_items >= packet.parent_prompt.child_outcomes.length);
  assert.equal(first.after_counts.parsed_entities, first.after_counts.parse_items);
  assert.equal(first.parsed_entity_ids.length, first.parse_item_ids.length);
  assert.equal(first.readback.raw_intake.stable_id, packet.persistence.raw_intake.stable_id);
  assert.equal(first.readback.parse_run.parent_prompt_id, packet.parent_prompt.prompt_id);
  assert.equal(first.readback.parent_prompt.parse_run_id, first.parse_run_id);
  assert.ok(first.readback.parse_items.every((item) => item.raw_intake_stable_id === first.raw_intake_stable_id));
  assert.ok(first.readback.parsed_entities.every((item) => item.raw_intake_stable_id === first.raw_intake_stable_id));
  assert.ok(first.readback.parsed_entities.every((item) => item.external_write_performed === false));

  const second = applyCanonicalIntakePacketToMemory(packet, {
    store,
    applied_at: '2026-06-23T11:45:00.000Z',
  });
  assert.deepEqual(second.before_counts, first.after_counts);
  assert.deepEqual(second.after_counts, first.after_counts);
  assert.deepEqual(second.parse_item_ids, first.parse_item_ids);
  assert.deepEqual(second.parsed_entity_ids, first.parsed_entity_ids);
  assert.equal(store.audit_events.length, 2);
  assert.equal(store.audit_events[1].parsed_entity_count, first.parsed_entity_ids.length);
});

test('canonical intake readback can locate rows by parent prompt or raw intake id', () => {
  const packet = fixturePacket();
  const rows = canonicalRowsFromPacket(packet, {
    applied_at: '2026-06-23T11:45:00.000Z',
  });
  assert.match(rows.parse_run.parse_run_id, /^parse_run_/);
  assert.ok(rows.parse_items.every((item) => /^parse_item_/.test(item.parse_item_id)));
  assert.equal(rows.parsed_entities.length, rows.parse_items.length);
  assert.ok(rows.parsed_entities.every((item) => /^entity_/.test(item.entity_id)));

  const store = createMemoryIntakePersistenceStore();
  const applied = applyCanonicalIntakePacketToMemory(packet, { store });
  const byPrompt = readCanonicalIntakePersistence(store, { prompt_id: packet.parent_prompt.prompt_id });
  assert.equal(byPrompt.found, true);
  assert.equal(byPrompt.parse_run.parse_run_id, applied.parse_run_id);
  assert.equal(byPrompt.raw_intake.stable_id, applied.raw_intake_stable_id);
  assert.equal(byPrompt.parent_prompt.prompt_id, packet.parent_prompt.prompt_id);
  assert.equal(byPrompt.counts.parse_items, applied.parse_item_ids.length);
  assert.equal(byPrompt.counts.parsed_entities, applied.parsed_entity_ids.length);

  const byRaw = readCanonicalIntakePersistence(store, { raw_intake_stable_id: applied.raw_intake_stable_id });
  assert.equal(byRaw.found, true);
  assert.equal(byRaw.raw_intake.stable_id, applied.raw_intake_stable_id);
  assert.equal(byRaw.parent_prompt.prompt_id, packet.parent_prompt.prompt_id);

  const missing = readCanonicalIntakePersistence(store, { raw_intake_stable_id: 'missing' });
  assert.equal(missing.found, false);
  assert.equal(missing.counts.parse_items, 0);
  assert.equal(missing.counts.parsed_entities, 0);
});

test('canonical intake memory persistence projects parsed entities for every local lane', () => {
  const packet = buildCanonicalIntakePacket({
    source_provider: 'manual',
    source_kind: 'text',
    source_id: 'ops-ramble-entity-readback-001',
    raw_text: [
      'Task: Codex should persist canonical entity rows.',
      'Decision: choose whether to approve production apply later.',
      'Schedule a calendar event for the review lesson tomorrow.',
      'Content idea: make a newsletter note from the class recap.',
      'Message the community with a short announcement draft only.',
      'Connect the Zoom integration for the class recording.',
    ].join(' '),
    workspace_key: 'internal_super_admin',
    project_key: 'bna_operations',
    created_at: '2026-06-23T12:00:00.000Z',
  }, {
    generated_at: '2026-06-23T12:00:00.000Z',
    agent: 'Codex',
  });
  const store = createMemoryIntakePersistenceStore();
  const applied = applyCanonicalIntakePacketToMemory(packet, {
    store,
    applied_at: '2026-06-23T12:00:00.000Z',
  });

  assert.equal(applied.readback.counts.parsed_entities, applied.readback.counts.parse_items);
  for (const group of ['decisions', 'tasks', 'calendar_events', 'content_items', 'community_items', 'integration_items']) {
    assert.ok(applied.readback.entity_counts_by_group[group] >= 1, `${group} should have a projected entity`);
  }
  assert.ok(applied.readback.entity_counts_by_group.notes >= 1);
  assert.ok(applied.readback.entity_counts_by_group.unresolved >= 1);
  assert.ok(applied.readback.parsed_entities.some((entity) => (
    entity.entity_group === 'tasks'
    && entity.owner === 'Codex'
    && entity.next_action
  )));
  assert.ok(applied.readback.parsed_entities.every((entity) => entity.parse_item_id));
  assert.ok(applied.readback.parsed_entities.every((entity) => entity.parent_prompt_id === packet.parent_prompt.prompt_id));
});

test('canonical intake memory persistence rejects incomplete packets', () => {
  const store = createMemoryIntakePersistenceStore();
  assert.throws(
    () => applyCanonicalIntakePacketToMemory({}, { store }),
    /packet persistence is required/
  );
  assert.throws(
    () => applyCanonicalIntakePacketToMemory({ persistence: { parse_run: {}, parent_prompt: { prompt_id: 'PROMPT-1' } } }, { store }),
    /raw_intake\.stable_id is required/
  );
});
