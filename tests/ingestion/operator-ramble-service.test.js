const assert = require('node:assert/strict');
const test = require('node:test');

const {
  OPERATOR_RAMBLE_SERVICE_VERSION,
  applyRequirementResult,
  buildOperatorRambleGraph,
  buildWorkerHealthReceipt,
  ingestOperatorRamble,
  normalizePacketLifecycleStatus,
  normalizeRambleSource,
  splitSourceStatements,
} = require('../../src/platform/ingestion/operator-ramble-service');

test('operator ramble service recognizes every canonical intake adapter', () => {
  const cases = [
    [{ source_type: 'codex_chat' }, 'codex_chat', 'codex_chat'],
    [{ source_type: 'telegram_ramble' }, 'telegram_ramble', 'telegram'],
    [{ source_type: 'telegram_scoped_task' }, 'telegram_scoped_task', 'telegram'],
    [{ source_channel: 'chatgpt_dropoff' }, 'chatgpt', 'chatgpt'],
    [{ source_provider: 'chatgpt' }, 'chatgpt', 'chatgpt'],
    [{ source_provider: 'operations_ui' }, 'operations_ui', 'operations_ui'],
    [{ source_type: 'file_intake' }, 'file_intake', 'local_file'],
    [{ source_channel: 'drive' }, 'file_intake', 'drive'],
  ];

  for (const [input, adapterKey, provider] of cases) {
    const source = normalizeRambleSource(input);
    assert.equal(source.adapter_key, adapterKey, JSON.stringify(input));
    assert.equal(source.source_provider, provider, JSON.stringify(input));
  }
});

test('operator ramble service maps raw source statements, requirements, jobs, and receipts', () => {
  const result = ingestOperatorRamble({
    raw_id: 'RAW-20260712-050',
    source_type: 'telegram_scoped_task',
    source_id: 'telegram:42:9001',
    raw_text: [
      'Task: Codex should wire the One Time signup reminder proof.',
      'Decision: operator must approve production send activation.',
      'Never show raw ramble wording as a visible task title.',
    ].join('\n'),
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    created_at: '2026-07-12T08:00:00.000Z',
    packet_status: 'queued',
  }, {
    generated_at: '2026-07-12T08:00:00.000Z',
    worker_status: {
      name: 'telegram-ramble-worker',
      status: 'online',
      last_seen_at: '2026-07-12T07:59:30.000Z',
    },
  });

  assert.equal(result.contract_version, OPERATOR_RAMBLE_SERVICE_VERSION);
  assert.equal(result.external_write_performed, false);
  assert.equal(result.adapter_key, 'telegram_scoped_task');
  assert.equal(result.raw_intake_stable_id, 'RAW-20260712-050');
  assert.match(result.requirement_register_path, /^tasks-pending\/2026-07-12-telegram_scoped_task-[a-f0-9]{10}-ramble-intake\.md$/);
  assert.equal(result.no_lost_sentence_gate.ok, true);
  assert.equal(result.source_statements.length, 3);
  assert.ok(result.source_statements.every((statement) => statement.statement_id.startsWith('RAW-20260712-050:S')));
  assert.ok(result.source_statements.every((statement) => Number.isInteger(statement.start_offset)));
  assert.ok(result.source_statements.every((statement) => statement.text_hash.length === 64));
  assert.ok(result.requirement_rows.length >= 2);
  assert.ok(result.requirement_rows.every((row) => /^REQ-20260712-\d{3}-[A-F0-9]{6}$/.test(row.requirement_id)));
  assert.ok(result.execution_requirements.every((row) => /^REQ-20260712-\d{3}$/.test(row.id)));
  assert.ok(result.requirement_rows.every((row) => row.source_statement_id));
  assert.equal(result.jobs.length, result.requirement_rows.length);
  assert.ok(result.jobs.every((job) => /^JOB-20260712-\d{3}-[A-F0-9]{6}$/.test(job.job_id)));
  assert.ok(result.receipts.some((item) => item.receipt_type === 'source_statements_mapped' && item.no_lost_sentence_gate_ok === true));
  assert.ok(result.receipts.some((item) => item.receipt_type === 'source_reconstruction' && item.offset_map_valid === true));
  assert.ok(result.receipts.some((item) => item.receipt_type === 'structured_compilation_gate' && item.status === 'implementation_ready'));
  const statusReceipt = result.receipts.find((item) => item.receipt_type === 'honest_status_contract');
  assert.ok(statusReceipt);
  for (const status of ['registered', 'implemented', 'deployed', 'live_verified', 'blocked', 'failed', 'superseded', 'done']) {
    assert.ok(statusReceipt.allowed_statuses.includes(status), `${status} should be an honest status receipt state`);
  }
  assert.equal(statusReceipt.done_requires_evidence, true);
  assert.equal(statusReceipt.live_verified_requires_deployment_and_live_smoke, true);
  assert.ok(result.receipts.some((item) => item.receipt_type === 'requirements_projected'));
  assert.ok(result.receipts.some((item) => item.receipt_type === 'worker_health' && item.status === 'online'));
  assert.equal(result.status_propagation.raw_intake_status, 'needs_review');
  assert.deepEqual(result.status_propagation.propagation_order, [
    'source_statement',
    'parse_item',
    'requirement',
    'job',
    'parent_prompt',
    'raw_intake',
    'packet',
    'execution_run',
  ]);
});

test('nontrivial rambles stay specification_pending when structured compilation is unavailable', () => {
  const result = ingestOperatorRamble({
    raw_id: 'RAW-20260712-055',
    source_type: 'codex_chat',
    raw_text: [
      'Task: Build the million-dollar app CRM contact workspace.',
      'Task: Make the pipeline professional and launch-ready.',
      'Task: Fix the community section so it is not sloppy.',
    ].join('\n'),
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    created_at: '2026-07-12T08:00:00.000Z',
    structured_compilation: {
      status: 'unavailable',
      error: 'model_unavailable',
    },
  }, {
    generated_at: '2026-07-12T08:00:00.000Z',
    worker_status: {
      name: 'ramble-compiler',
      status: 'online',
      last_seen_at: '2026-07-12T07:59:59.000Z',
    },
  });

  assert.equal(result.structured_compilation_gate.required, true);
  assert.equal(result.structured_compilation_gate.status, 'specification_pending');
  assert.equal(result.jobs.length, 0);
  assert.ok(result.requirement_rows.every((row) => row.status === 'specification_pending'));
  assert.ok(result.requirement_rows.every((row) => row.implementation_ready === false));
  assert.equal(result.status_propagation.execution_run_status, 'specification_pending');
  assert.ok(result.receipts.some((receipt) => (
    receipt.receipt_type === 'structured_compilation_gate'
    && receipt.status === 'specification_pending'
    && receipt.implementation_ready === false
  )));
});

test('validated structured compilation unlocks nontrivial ramble job materialization', () => {
  const result = ingestOperatorRamble({
    raw_id: 'RAW-20260712-056',
    source_type: 'codex_chat',
    raw_text: [
      'Task: Build the million-dollar app CRM contact workspace.',
      'Task: Make the pipeline professional and launch-ready.',
      'Task: Fix the community section so it is not sloppy.',
    ].join('\n'),
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    created_at: '2026-07-12T08:00:00.000Z',
    structured_compilation: {
      status: 'validated',
      schema_valid: true,
      requirements: [
        { id: 'REQ-A' },
        { id: 'REQ-B' },
        { id: 'REQ-C' },
      ],
    },
  }, {
    generated_at: '2026-07-12T08:00:00.000Z',
    worker_status: {
      name: 'ramble-compiler',
      status: 'online',
      last_seen_at: '2026-07-12T07:59:59.000Z',
    },
  });

  assert.equal(result.structured_compilation_gate.required, true);
  assert.equal(result.structured_compilation_gate.status, 'implementation_ready');
  assert.equal(result.jobs.length, result.requirement_rows.length);
  assert.ok(result.requirement_rows.every((row) => row.implementation_ready === true));
  assert.equal(result.status_propagation.execution_run_status, 'queued');
});

test('Telegram ramble message parts reconstruct before statement mapping', () => {
  const result = ingestOperatorRamble({
    raw_id: 'RAW-20260712-057',
    source_type: 'telegram_ramble',
    telegram_message_parts: [
      { part_index: 2, text: 'Task: second chunk should stay second.' },
      { part_index: 1, text: 'Task: first chunk should stay first.' },
    ],
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    created_at: '2026-07-12T08:00:00.000Z',
  }, {
    generated_at: '2026-07-12T08:00:00.000Z',
  });

  assert.deepEqual(
    result.source_statements.map((statement) => statement.normalized_text),
    ['Task: first chunk should stay first.', 'Task: second chunk should stay second.']
  );
  assert.ok(result.receipts.some((receipt) => (
    receipt.receipt_type === 'source_reconstruction'
    && receipt.reconstructed_from_parts === true
    && receipt.source_part_count === 2
    && receipt.offset_map_valid === true
  )));
});

test('operator ramble graph keeps independent executable work open when a decision is blocked', () => {
  const graph = buildOperatorRambleGraph({
    raw_id: 'RAW-20260712-053',
    raw_text: 'Task: Codex should wire the intake API. Decision: operator must approve production send activation.',
    source_type: 'codex_chat',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    created_at: '2026-07-12T08:00:00.000Z',
    generated_at: '2026-07-12T08:00:00.000Z',
  });

  assert.equal(graph.no_lost_sentence_gate.passed, true);
  assert.equal(graph.requirements.length, 2);
  assert.equal(graph.requirements.filter((requirement) => requirement.can_continue_without_operator).length, 1);
  assert.equal(graph.requirements.filter((requirement) => !requirement.can_continue_without_operator).length, 1);
  assert.equal(graph.observable_agent_jobs.length, 1);
  assert.equal(graph.decisions.length, 1);
  assert.equal(graph.status_propagation.independent_work_continues, true);
});

test('operator ramble graph does not close failed verification or UI work without deploy evidence', () => {
  const graph = buildOperatorRambleGraph({
    raw_id: 'RAW-20260712-054',
    raw_text: 'Task: Codex should update the public landing page route.',
    source_type: 'codex_chat',
    created_at: '2026-07-12T08:00:00.000Z',
    generated_at: '2026-07-12T08:00:00.000Z',
  });
  const requirementId = graph.requirements[0].id;

  const failed = applyRequirementResult(graph, {
    requirement_id: requirementId,
    verification_passed: false,
    summary: 'Screenshot mismatch.',
  });
  assert.equal(failed.requirements[0].status, 'implemented');
  assert.equal(failed.requirements[0].verification_status, 'failed');
  assert.match(failed.requirements[0].blocker, /Verification failed/);

  const locallyVerified = applyRequirementResult(graph, {
    requirement_id: requirementId,
    verification_passed: true,
    summary: 'Local browser proof passed.',
  });
  assert.equal(locallyVerified.requirements[0].status, 'verified');
  assert.match(locallyVerified.requirements[0].blocker, /Deployment\/live-smoke evidence is required/);
  assert.equal(locallyVerified.raw_lifecycle.status, 'running');
});

test('operator ramble service migrates codex_done and reports worker-offline truth', () => {
  const status = normalizePacketLifecycleStatus('codex_done');
  assert.equal(status.normalized_status, 'completed');
  assert.equal(status.migrated, true);
  assert.equal(status.rejected, false);

  const unknown = normalizePacketLifecycleStatus('invented_status');
  assert.equal(unknown.rejected, true);

  const offline = buildWorkerHealthReceipt({
    name: 'stored-worker',
    last_seen_at: '2026-07-12T07:00:00.000Z',
  }, {
    now: '2026-07-12T08:00:00.000Z',
  });
  assert.equal(offline.status, 'offline');
  assert.equal(offline.truthful, true);
  assert.equal(offline.reason, 'missing_or_stale_worker_signal');

  const result = ingestOperatorRamble({
    raw_id: 'RAW-20260712-051',
    source_provider: 'chatgpt',
    source_id: 'packet-051',
    raw_text: 'Task: Codex should verify status propagation. Decision: operator approval is still required.',
    created_at: '2026-07-12T08:00:00.000Z',
    packet_status: 'codex_done',
  }, {
    generated_at: '2026-07-12T08:00:00.000Z',
    worker_status: offline,
  });

  assert.equal(result.packet_status.normalized_status, 'completed');
  assert.ok(result.receipts.some((receipt) => receipt.receipt_type === 'packet_status_migrated'));
  assert.equal(result.worker_health.status, 'offline');
  assert.equal(result.status_propagation.execution_run_status, 'active_worker_offline');
});

test('source statement splitter records offsets and uncovered ranges deterministically', () => {
  const raw = 'Task: First sentence.  Decision: second sentence?\nThird line without punctuation';
  const statements = splitSourceStatements(raw, { raw_id: 'RAW-20260712-052' });

  assert.equal(statements.length, 3);
  assert.equal(raw.slice(statements[0].start_offset, statements[0].end_offset), 'Task: First sentence.');
  assert.equal(statements[1].classification, 'decision');
  assert.equal(statements[2].normalized_text, 'Third line without punctuation');
  assert.deepEqual(
    statements.map((statement) => statement.statement_id),
    ['RAW-20260712-052:S01', 'RAW-20260712-052:S02', 'RAW-20260712-052:S03']
  );
});
