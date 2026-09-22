const assert = require('node:assert/strict');
const test = require('node:test');

const {
  CANONICAL_INTAKE_SERVICE_VERSION,
  buildCanonicalIntakePacket,
} = require('../../src/platform/ingestion/intake-service');

test('canonical intake service builds one persistence-ready packet from source to parent prompt', () => {
  const packet = buildCanonicalIntakePacket({
    source_provider: 'manual',
    source_id: 'manual-ramble-001',
    raw_text: [
      'Task: Codex should wire the canonical intake service.',
      'Decision: choose whether Operations should show this as a parent prompt.',
    ].join(' '),
    workspace_key: 'internal_super_admin',
    project_key: 'bna_operations',
    created_at: '2026-06-23T11:30:00.000Z',
  }, {
    generated_at: '2026-06-23T11:30:00.000Z',
    agent: 'Codex',
  });

  assert.equal(packet.contract_version, CANONICAL_INTAKE_SERVICE_VERSION);
  assert.equal(packet.external_write_performed, false);
  assert.equal(packet.source_record.source_provider, 'manual');
  assert.equal(packet.parsed.schema_valid, true);
  assert.ok(packet.parsed.tasks.length >= 1);
  assert.ok(packet.parsed.decisions.length >= 1);
  assert.match(packet.parent_prompt.prompt_id, /^PROMPT-/);
  assert.ok(packet.parent_prompt.child_outcomes.some((item) => item.item_type === 'task'));
  assert.ok(packet.parent_prompt.child_outcomes.some((item) => item.item_type === 'decision'));

  assert.equal(packet.persistence.contract_version, CANONICAL_INTAKE_SERVICE_VERSION);
  assert.equal(packet.persistence.external_write_performed, false);
  assert.equal(packet.persistence.raw_intake.stable_id, packet.source_record.stable_key);
  assert.equal(packet.persistence.raw_intake.parse_status, 'parsed');
  assert.equal(packet.persistence.parse_run.source_id, packet.source_record.source_id);
  assert.equal(packet.persistence.parse_run.schema_valid, true);
  assert.ok(packet.persistence.parse_items.length >= packet.parent_prompt.child_outcomes.length);
  assert.ok(packet.persistence.parse_items.every((item) => item.source_stable_key === packet.source_record.stable_key));
  assert.ok(packet.persistence.parse_items.every((item) => item.parent_prompt_id === packet.parent_prompt.prompt_id));
});

test('canonical intake service gives GitHub packets first-class source persistence', () => {
  const packet = buildCanonicalIntakePacket({
    source_provider: 'github',
    source_kind: 'github_issue',
    source_type: 'github_issue',
    source_id: 'shloimie-beep/bnei-neviim-academy#8',
    source_link: 'https://github.com/shloimie-beep/bnei-neviim-academy/issues/8',
    raw_text: 'Issue #8: Codex should reconcile the canonical intake queue.',
    workspace_key: 'internal_super_admin',
    project_key: 'bna_operations',
    created_at: '2026-06-23T11:30:00.000Z',
  });

  assert.equal(packet.source_record.source_provider, 'github');
  assert.equal(packet.source_record.source_kind, 'github_issue');
  assert.equal(packet.persistence.raw_intake.source_provider, 'github');
  assert.equal(packet.persistence.raw_intake.source_kind, 'github_issue');
  assert.equal(packet.persistence.parse_run.source_type, 'github_issue');
  assert.equal(packet.parsed.source_envelope.default_context_type, 'operations_ramble');
});

test('canonical intake service rejects empty raw input before planning persistence', () => {
  assert.throws(
    () => buildCanonicalIntakePacket({ source_provider: 'manual', raw_text: '   ' }),
    /raw_text is required/
  );
});
