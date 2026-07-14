const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const {
  generateChangeReceipt,
  generateCodexPrompt,
  sha256Text,
  withFingerprint,
} = require('../src/lib/bna/intent-preservation');

async function loadIngestor() {
  return import(pathToFileURL(path.join(process.cwd(), 'scripts', 'chatgpt-dropoff-ingestor.mjs')).href);
}

function makePacketDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bna-chatgpt-dropoff-'));
}

function makeNamedPacketDir(name) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-chatgpt-dropoff-root-'));
  const dir = path.join(root, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writePacket(dir, overrides = {}) {
  const packetId = overrides.packet_id || 'CHATGPT-DROPOFF-20990101-001';
  fs.writeFileSync(path.join(dir, 'packet.json'), `${JSON.stringify({
    packet_id: packetId,
    schema_version: 'bna.chatgpt_dropoff.v1',
    created_at: overrides.created_at || undefined,
    source: 'chatgpt',
    workspace: 'rabbi_sheller_provider',
    project: 'one_time_mishnah_class',
    status: 'ready_for_codex_audit',
    scope_summary: 'Helper bot scoped query tools',
    priority: 'normal',
    secrets_included: false,
    ...overrides.packet,
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, 'status.json'), `${JSON.stringify({
    packet_id: packetId,
    status: overrides.status || 'ready_for_codex_audit',
    implementation_status: 'not_started',
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, 'MANIFEST.json'), `${JSON.stringify({
    packet_id: packetId,
    proposed_repo_changes: ['server.js', 'tests/helper.test.js'],
    tests_expected: ['npm test'],
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, 'RAW.md'), '# Raw\n\nBuild the helper bot scoped query tools.\n');
  fs.writeFileSync(path.join(dir, 'CODEX_PROMPT.md'), '# Codex\n\nAudit and implement scoped helper bot query tools.\n');
  fs.writeFileSync(path.join(dir, 'PATCHES.md'), '# Patches\n\nNo patch yet.\n');
}

function sourceSpan(rawText) {
  return {
    span_id: 'SPAN-001',
    start: 0,
    end: rawText.length,
    quote: rawText,
  };
}

function buildReadyIntentSpec(rawText) {
  const span = sourceSpan(rawText);
  return withFingerprint({
    spec_version: 'intent-preservation-v1',
    spec_id: 'SPEC-20990101-001',
    raw: {
      raw_id: 'RAW-20990101-001',
      path: 'RAW.md',
      capture_mode: 'verbatim',
      sha256: sha256Text(rawText),
      character_count: rawText.length,
    },
    scope: {
      workspace: 'rabbi_sheller_provider',
      project: 'one_time_mishnah_class',
      routes: ['/one-time'],
    },
    global_invariants: [],
    changes: [{
      change_id: 'CHG-20990101-001',
      source_spans: [span],
      classification: 'HARD_EXACT',
      provenance: 'USER_STATED',
      confidence: 1,
      ambiguity_status: 'none',
      route: '/one-time',
      screen: 'One Time public landing',
      target: {
        section: 'Landing copy',
        component: 'feature card',
        selector: '',
        accessible_name: '',
        current_text_anchor: 'Monitored online platform',
      },
      primary_operation: 'remove',
      current_state: 'Current state inspected before implementation.',
      required_state: rawText,
      exact_payload: {},
      layout: { parent: '', sibling_before: '', sibling_after: '', order: [] },
      style_scope: { allowed_targets: [], forbidden_targets: [], properties: [] },
      viewport_behavior: [],
      must_preserve: [],
      must_remove: ['Monitored online platform', 'Questions with Rabbi Scheller'],
      conflicts: [],
      supersedes_ids: [],
      acceptance_assertions: {
        positive: [{ assertion_id: 'A-POS-001', text: rawText }],
        negative: [{ assertion_id: 'A-NEG-001', text: 'Monitored online platform is absent. Questions with Rabbi Scheller is absent.' }],
      },
      dependencies: [],
      resolution_question: { question: '', choices: [] },
    }],
    source_coverage: [{
      coverage_id: 'COV-20990101-001',
      span_id: span.span_id,
      start: span.start,
      end: span.end,
      quote: span.quote,
      classification: 'HARD_EXACT',
      coverage_status: 'covered',
      change_id: 'CHG-20990101-001',
      global_invariant_id: null,
      reason: 'Test packet atomic mapping.',
    }],
    readiness: {
      status: 'ready_for_implementation',
      blocking_change_ids: [],
      notes: [],
    },
  });
}

function writeReadyIntentArtifacts(dir) {
  const rawText = 'Remove Monitored online platform and Questions with Rabbi Scheller.';
  fs.writeFileSync(path.join(dir, 'RAW.md'), rawText);
  const spec = buildReadyIntentSpec(rawText);
  fs.writeFileSync(path.join(dir, 'SPEC.json'), `${JSON.stringify(spec, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, 'RECEIPT.md'), generateChangeReceipt(spec));
  fs.writeFileSync(path.join(dir, 'CODEX_PROMPT.md'), generateCodexPrompt(spec, { root: dir }));
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'MANIFEST.json'), 'utf8'));
  manifest.intent_preservation_required = true;
  manifest.intent_spec = {
    path: 'SPEC.json',
    fingerprint: spec.fingerprint,
    raw_sha256: spec.raw.sha256,
  };
  fs.writeFileSync(path.join(dir, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const status = JSON.parse(fs.readFileSync(path.join(dir, 'status.json'), 'utf8'));
  status.intent_preservation_required = true;
  status.intent_spec = {
    path: 'SPEC.json',
    fingerprint: spec.fingerprint,
    raw_sha256: spec.raw.sha256,
  };
  fs.writeFileSync(path.join(dir, 'status.json'), `${JSON.stringify(status, null, 2)}\n`);
  return spec;
}

test('ChatGPT dropoff ingestor validates a ready packet and builds a Codex task payload', async () => {
  const ingestor = await loadIngestor();
  const dir = makePacketDir();
  writePacket(dir);

  const loaded = ingestor.loadPacket(dir);
  const validation = ingestor.validatePacket(loaded);
  const payload = ingestor.buildCodexPickupTaskPayload(loaded, { defaultProject: 'bna' });

  assert.equal(validation.ok, true);
  assert.equal(validation.ready, true);
  assert.ok(validation.findings.some((finding) => finding.code === 'legacy_intent_spec_missing'));
  assert.equal(loaded.packetId, 'CHATGPT-DROPOFF-20990101-001');
  assert.equal(payload.assigned_to, 'Codex');
  assert.equal(payload.agent_executable, true);
  assert.equal(payload.task_kind, 'agent_job');
  assert.equal(payload.source_channel, 'chatgpt_dropoff');
  assert.equal(payload.project, 'one_time_mishnah_class');
  assert.equal(payload.source_context.packet_type, 'implementation_bundle');
  assert.equal(payload.source_context.canonical_ingestion.adapter_key, 'chatgpt');
  assert.equal(payload.source_context.canonical_ingestion.no_lost_sentence_gate.ok, true);
  assert.ok(payload.source_context.canonical_ingestion.source_statement_count >= 1);
  assert.ok(payload.source_context.canonical_ingestion.receipts.some((receipt) => receipt.receipt_type === 'worker_health' && receipt.status === 'online'));
  assert.equal(payload.source_context.canonical_ingestion.external_write_performed, false);
  assert.equal(payload.ai_parsed.source_packet_type, 'implementation_bundle');
  assert.equal(payload.ai_parsed.canonical_ingestion.adapter_key, 'chatgpt');
  assert.match(payload.title, /implementation bundle packet/);
  assert.match(payload.raw_text, /Packet path:/);
  assert.match(payload.raw_text, /Packet type: implementation_bundle/);
  assert.match(payload.raw_text, /Audit ChatGPT output against the current repo/);
});

test('ChatGPT dropoff ingestor carries memory candidate packet type into Codex task payload', async () => {
  const ingestor = await loadIngestor();
  const dir = makeNamedPacketDir('CHATGPT-DROPOFF-20990101-MEMORY-001');
  writePacket(dir, {
    packet_id: 'CHATGPT-DROPOFF-20990101-MEMORY-001',
    packet: {
      packet_type: 'memory_candidate',
      scope_summary: 'Operator publish and ChatGPT sidekick preference',
    },
  });

  const loaded = ingestor.loadPacket(dir);
  const validation = ingestor.validatePacket(loaded);
  const payload = ingestor.buildCodexPickupTaskPayload(loaded, { defaultProject: 'bna' });

  assert.equal(validation.ok, true);
  assert.equal(validation.ready, true);
  assert.equal(payload.source_context.packet_type, 'memory_candidate');
  assert.equal(payload.ai_parsed.source_packet_type, 'memory_candidate');
  assert.match(payload.title, /memory candidate packet/);
  assert.match(payload.raw_text, /promote only valid durable memory/);
});

test('ChatGPT dropoff ingestor blocks missing required files and secret-like content', async () => {
  const ingestor = await loadIngestor();
  const missingDir = makePacketDir();
  writePacket(missingDir);
  fs.unlinkSync(path.join(missingDir, 'CODEX_PROMPT.md'));

  const missing = ingestor.validatePacket(ingestor.loadPacket(missingDir));
  assert.equal(missing.ok, false);
  assert.ok(missing.findings.some((finding) => finding.code === 'missing_required_file'));

  const secretDir = makePacketDir();
  writePacket(secretDir);
  fs.writeFileSync(path.join(secretDir, 'PATCHES.md'), `api_key=sk-${'a'.repeat(24)}\n`);
  const secret = ingestor.validatePacket(ingestor.loadPacket(secretDir));
  assert.equal(secret.ok, false);
  assert.ok(secret.findings.some((finding) => finding.code === 'secret_like_text'));

  const invalidJsonDir = makePacketDir();
  writePacket(invalidJsonDir);
  fs.writeFileSync(path.join(invalidJsonDir, 'packet.json'), '{not json');
  const invalidJson = ingestor.validatePacket(ingestor.loadPacket(invalidJsonDir));
  assert.equal(invalidJson.ok, false);
  assert.ok(invalidJson.findings.some((finding) => finding.code === 'invalid_json'));
});

test('ChatGPT dropoff ingestor requires valid intent spec artifacts for new implementation packets', async () => {
  const ingestor = await loadIngestor();
  const missingSpecDir = makePacketDir();
  writePacket(missingSpecDir, { created_at: '2099-01-01T00:00:00.000Z' });
  const missingSpec = ingestor.validatePacket(ingestor.loadPacket(missingSpecDir));
  assert.equal(missingSpec.ok, false);
  assert.ok(missingSpec.findings.some((finding) => finding.code === 'missing_intent_spec'));

  const readyDir = makePacketDir();
  writePacket(readyDir, { created_at: '2099-01-01T00:00:00.000Z' });
  const spec = writeReadyIntentArtifacts(readyDir);
  const ready = ingestor.validatePacket(ingestor.loadPacket(readyDir));
  assert.equal(ready.ok, true);
  assert.equal(ready.ready, true);
  assert.ok(!ready.findings.some((finding) => finding.severity === 'blocker'));

  const loaded = ingestor.loadPacket(readyDir);
  const payload = ingestor.buildCodexPickupTaskPayload(loaded, { defaultProject: 'bna' });
  assert.equal(payload.source_context.intent_spec_fingerprint, spec.fingerprint);
  assert.equal(payload.source_context.intent_raw_sha256, spec.raw.sha256);
});

test('ChatGPT dropoff ingestor hardens status, ids, helper lanes, and write declarations', async () => {
  const ingestor = await loadIngestor();

  const missingStatusDir = makePacketDir();
  writePacket(missingStatusDir);
  fs.writeFileSync(path.join(missingStatusDir, 'status.json'), `${JSON.stringify({
    packet_id: 'CHATGPT-DROPOFF-20990101-001',
    implementation_status: 'not_started',
  }, null, 2)}\n`);
  const missingStatus = ingestor.validatePacket(ingestor.loadPacket(missingStatusDir));
  assert.equal(missingStatus.ok, false);
  assert.ok(missingStatus.findings.some((finding) => finding.code === 'missing_ready_status'));

  const mismatchDir = makePacketDir();
  writePacket(mismatchDir);
  fs.writeFileSync(path.join(mismatchDir, 'status.json'), `${JSON.stringify({
    packet_id: 'CHATGPT-DROPOFF-20990101-OTHER',
    status: 'ready_for_codex_audit',
  }, null, 2)}\n`);
  const mismatch = ingestor.validatePacket(ingestor.loadPacket(mismatchDir));
  assert.equal(mismatch.ok, false);
  assert.ok(mismatch.findings.some((finding) => finding.code === 'packet_id_mismatch'));

  const validHelperDir = makeNamedPacketDir('helper-bot-workspace-agent-02-query-filter-results');
  writePacket(validHelperDir, { packet_id: 'helper-bot-workspace-agent-02-query-filter-results' });
  const validHelper = ingestor.validatePacket(ingestor.loadPacket(validHelperDir));
  assert.equal(validHelper.ok, true);
  assert.equal(validHelper.ready, true);

  const unknownHelperDir = makeNamedPacketDir('helper-bot-workspace-agent-99-invented');
  writePacket(unknownHelperDir, { packet_id: 'helper-bot-workspace-agent-99-invented' });
  const unknownHelper = ingestor.validatePacket(ingestor.loadPacket(unknownHelperDir));
  assert.equal(unknownHelper.ok, false);
  assert.ok(unknownHelper.findings.some((finding) => finding.code === 'unknown_helper_bot_lane'));

  const externalWriteDir = makePacketDir();
  writePacket(externalWriteDir, { packet: { external_writes_performed: true } });
  const externalWrite = ingestor.validatePacket(ingestor.loadPacket(externalWriteDir));
  assert.equal(externalWrite.ok, false);
  assert.ok(externalWrite.findings.some((finding) => finding.code === 'declared_external_writes'));

  const statusSecretDir = makePacketDir();
  writePacket(statusSecretDir);
  fs.writeFileSync(path.join(statusSecretDir, 'status.json'), `${JSON.stringify({
    packet_id: 'CHATGPT-DROPOFF-20990101-001',
    status: 'ready_for_codex_audit',
    secrets_included: true,
  }, null, 2)}\n`);
  const statusSecret = ingestor.validatePacket(ingestor.loadPacket(statusSecretDir));
  assert.equal(statusSecret.ok, false);
  assert.ok(statusSecret.findings.some((finding) => finding.code === 'declared_secrets_included'));

  const codexDoneDir = makePacketDir();
  writePacket(codexDoneDir, { status: 'codex_done' });
  const codexDone = ingestor.validatePacket(ingestor.loadPacket(codexDoneDir));
  assert.equal(codexDone.ok, true);
  assert.equal(codexDone.ready, false);
  assert.ok(codexDone.findings.some((finding) => finding.code === 'packet_status_migrated'));

  const inventedStatusDir = makePacketDir();
  writePacket(inventedStatusDir, { status: 'codex_finished_magic' });
  const inventedStatus = ingestor.validatePacket(ingestor.loadPacket(inventedStatusDir));
  assert.equal(inventedStatus.ok, false);
  assert.ok(inventedStatus.findings.some((finding) => finding.code === 'unknown_packet_status'));
});

test('ChatGPT dropoff ingestor force retry can reprocess a terminal packet status', async () => {
  const ingestor = await loadIngestor();
  const dir = makePacketDir();
  writePacket(dir, { status: 'blocked_needs_operator_decision' });
  const loaded = ingestor.loadPacket(dir);

  const normalValidation = ingestor.validatePacket(loaded);
  assert.equal(normalValidation.ready, false);
  assert.ok(normalValidation.findings.some((finding) => finding.code === 'terminal_status'));

  const forcedValidation = ingestor.validatePacket(loaded, { force: true });
  assert.equal(forcedValidation.ok, true);
  assert.equal(forcedValidation.ready, true);
  assert.ok(forcedValidation.findings.every((finding) => finding.severity === 'info'));
});

test('ChatGPT dropoff package scripts and agent fleet hook are wired', async () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const supervisor = fs.readFileSync('scripts/agent-fleet-supervisor.mjs', 'utf8');
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const ingestor = await loadIngestor();

  assert.equal(packageJson.scripts['chatgpt:dropoff:scan'], 'node scripts/chatgpt-dropoff-ingestor.mjs --json');
  assert.equal(packageJson.scripts['chatgpt:dropoff:apply'], 'node scripts/chatgpt-dropoff-ingestor.mjs --apply --json');
  assert.equal(packageJson.scripts['chatgpt:dropoff:tower'], 'node scripts/chatgpt-dropoff-control-tower.mjs --write');
  assert.match(supervisor, /runChatGptDropoffIngestBeforeClaim/);
  assert.match(supervisor, /AGENT_FLEET_CHATGPT_DROPOFF_INGEST/);
  assert.match(envExample, /AGENT_FLEET_CHATGPT_DROPOFF_INGEST=1/);
  assert.equal(ingestor.safePacketId(' bad id / with spaces '), 'bad-id-with-spaces');
  assert.equal(ingestor.helperBotPacketIds.has('helper-bot-workspace-agent-05-tests-dropoff'), true);
});
