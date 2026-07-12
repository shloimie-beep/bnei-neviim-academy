const assert = require('node:assert/strict');
const test = require('node:test');

const {
  applyRequirementResult,
  buildOperatorRambleGraph,
  ingestOperatorRamble,
  normalizePacketLifecycleStatus,
  normalizeRambleSource,
} = require('../../src/platform/ingestion/operator-ramble-service');
const {
  isReadyPacketStatus,
  isTerminalPacketStatus,
  normalizePacketStatus,
} = require('../../src/platform/ingestion/packet-status');

function unique(values) {
  return new Set(values).size === values.length;
}

test('long rambles map every source statement to stable requirements and jobs', () => {
  const lines = Array.from({ length: 24 }, (_, index) => (
    index % 6 === 0
      ? `Decision: operator must approve release item ${index + 1}.`
      : `Task: Codex should verify One Time regression item ${index + 1}.`
  ));
  const result = ingestOperatorRamble({
    raw_id: 'RAW-20260712-080',
    source_type: 'codex_chat',
    raw_text: lines.join('\n'),
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    created_at: '2026-07-12T08:30:00.000Z',
  }, {
    generated_at: '2026-07-12T08:30:00.000Z',
    worker_status: {
      status: 'running',
      last_seen_at: '2026-07-12T08:29:50.000Z',
    },
  });

  assert.equal(result.adapter_key, 'codex_chat');
  assert.equal(result.no_lost_sentence_gate.ok, true);
  assert.equal(result.source_statements.length, lines.length);
  assert.equal(result.requirement_rows.length, lines.length);
  assert.equal(result.jobs.length, lines.length);
  assert.ok(unique(result.source_statements.map((statement) => statement.statement_id)));
  assert.ok(unique(result.requirement_rows.map((row) => row.requirement_id)));
  assert.ok(unique(result.jobs.map((job) => job.job_id)));
  assert.ok(result.source_statements.every((statement, index) => statement.normalized_text === lines[index]));
  assert.ok(result.requirement_rows.every((row) => row.source_statement_id));
  assert.ok(result.receipts.some((receipt) => receipt.receipt_type === 'source_statements_mapped' && receipt.no_lost_sentence_gate_ok));
});

test('duplicate Telegram submissions are idempotent by raw id, message source, and text', () => {
  const input = {
    raw_id: 'RAW-20260712-081',
    source_type: 'telegram_ramble',
    source_id: 'telegram:100:200',
    source_message_id: '200',
    raw_text: 'Task: Codex should preserve this Telegram item exactly once. Decision: operator approval remains separate.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    created_at: '2026-07-12T08:31:00.000Z',
  };
  const first = ingestOperatorRamble(input, { generated_at: '2026-07-12T08:31:01.000Z' });
  const replay = ingestOperatorRamble(input, { generated_at: '2026-07-12T08:31:02.000Z' });

  assert.equal(first.raw_intake_stable_id, replay.raw_intake_stable_id);
  assert.equal(first.raw_text_hash, replay.raw_text_hash);
  assert.deepEqual(
    first.source_statements.map((statement) => statement.text_hash),
    replay.source_statements.map((statement) => statement.text_hash)
  );
  assert.deepEqual(
    first.requirement_rows.map((row) => row.requirement_id),
    replay.requirement_rows.map((row) => row.requirement_id)
  );
  assert.deepEqual(
    first.jobs.map((job) => job.job_id),
    replay.jobs.map((job) => job.job_id)
  );
  assert.equal(first.status_propagation.raw_intake_status, 'needs_review');
});

test('codex_chat recognition, packet status migration, and worker state are shared invariants', () => {
  assert.equal(normalizeRambleSource({ source_type: 'codex_chat' }).adapter_key, 'codex_chat');

  const migrated = normalizePacketLifecycleStatus('codex_done');
  assert.equal(migrated.normalized_status, 'completed');
  assert.equal(migrated.migrated, true);
  assert.equal(migrated.rejected, false);

  const shared = normalizePacketStatus('codex_done');
  assert.equal(shared.status, 'done_verified');
  assert.equal(shared.migration_required, true);
  assert.equal(isTerminalPacketStatus('codex_done'), true);
  assert.equal(isReadyPacketStatus('codex_done'), false);

  const unknown = normalizePacketLifecycleStatus('codex_magic_done');
  assert.equal(unknown.rejected, true);
});

test('blocked decisions do not close independent work, failed verification stays open, and UI work waits for deploy', () => {
  const graph = buildOperatorRambleGraph({
    raw_id: 'RAW-20260712-082',
    source_type: 'codex_chat',
    raw_text: 'Task: Codex should update the public signup API route. Decision: operator must approve release.',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    created_at: '2026-07-12T08:32:00.000Z',
    generated_at: '2026-07-12T08:32:00.000Z',
  });
  const executable = graph.requirements.find((row) => row.can_continue_without_operator);
  const decision = graph.requirements.find((row) => !row.can_continue_without_operator);

  assert.ok(executable);
  assert.ok(decision);
  assert.equal(graph.observable_agent_jobs.length, 1);
  assert.equal(graph.decisions.length, 1);
  assert.equal(graph.status_propagation.independent_work_continues, true);

  const failed = applyRequirementResult(graph, {
    requirement_id: executable.id,
    verification_passed: false,
    summary: 'Regression failed.',
  });
  assert.equal(failed.requirements.find((row) => row.id === executable.id).status, 'implemented');
  assert.equal(failed.requirements.find((row) => row.id === executable.id).verification_status, 'failed');
  assert.equal(failed.raw_lifecycle.status, 'running');

  const localOnly = applyRequirementResult(graph, {
    requirement_id: executable.id,
    verification_passed: true,
    summary: 'Local proof passed.',
  });
  const updated = localOnly.requirements.find((row) => row.id === executable.id);
  assert.equal(updated.status, 'verified');
  assert.match(updated.blocker, /Deployment\/live-smoke evidence is required/);
  assert.equal(localOnly.raw_lifecycle.status, 'running');
});
