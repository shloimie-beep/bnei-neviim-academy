const assert = require('node:assert/strict');
const test = require('node:test');

const {
  SOURCE_ENVELOPE_VERSION,
  SOURCE_CONTEXT_TYPES,
  createIntakeSourceRecord,
  validateIntakeSourceRecord,
  inferSourceKind,
  classifySourceEnvelope,
} = require('../../src/platform/ingestion/intake-source');
const {
  buildProviderNeutralFolderSetupPlan,
  stageForPromptStatus,
} = require('../../src/platform/ingestion/intake-folders');

test('W3 intake source records preserve provenance and deterministic fingerprints', () => {
  const input = {
    source_provider: 'Google Drive',
    file_id: 'drive-file-123',
    source_link: 'https://drive.example/file',
    filename: 'weekly-ramble.md',
    mime_type: 'text/markdown',
    raw_text: 'Task: Codex should fix the ramble queue.',
    actor: 'Shloimie',
    workspace_candidate: 'BNA',
    parser_version: 'w3-platform-parser-v1',
  };
  const first = createIntakeSourceRecord(input);
  const second = createIntakeSourceRecord(input);

  assert.equal(first.source_provider, 'drive');
  assert.equal(first.source_kind, 'markdown');
  assert.equal(first.workspace_candidate, 'bna');
  assert.equal(first.idempotency_key, second.idempotency_key);
  assert.equal(first.fingerprint, second.fingerprint);
  assert.equal(first.has_raw_text, true);
  assert.equal(first.source_envelope.envelope_version, SOURCE_ENVELOPE_VERSION);
  assert.equal(first.source_envelope.source_channel, 'drive');
  assert.equal(validateIntakeSourceRecord(first).ok, true);
});

test('W3 intake source kind detection covers docs, audio, video, transcript, and Telegram text', () => {
  assert.equal(inferSourceKind({ mime_type: 'application/vnd.google-apps.document' }), 'google_doc');
  assert.equal(inferSourceKind({ filename: 'class.m4a' }), 'audio');
  assert.equal(inferSourceKind({ filename: 'recording.mp4' }), 'video');
  assert.equal(inferSourceKind({ filename: 'lesson.vtt' }), 'transcript');
  assert.equal(inferSourceKind({ source_type: 'telegram' }), 'telegram_text');
});

test('source envelope applies title defaults and records mixed local overrides', () => {
  const envelope = classifySourceEnvelope({
    source_provider: 'Google Drive',
    file_id: 'drive-dratler-001',
    filename: 'Dratler family meeting 2026-06-21 transcript.txt',
    raw_text: [
      'Menachem should practice the new bedtime routine.',
      'Operations task: Codex should update the parser status evidence.',
    ].join('\n'),
    actor: 'Shloimie',
    source_date: '2026-06-21',
    parser_version: 'canonical-intake-parser-v1',
  });

  assert.ok(SOURCE_CONTEXT_TYPES.has('family_meeting'));
  assert.equal(envelope.default_context_type, 'family_meeting');
  assert.equal(envelope.default_workspace, 'dratler_family');
  assert.equal(envelope.default_project, 'dratler_family');
  assert.equal(envelope.source_channel, 'drive');
  assert.equal(envelope.source_date, '2026-06-21');
  assert.equal(envelope.language.primary, 'en');
  assert.equal(envelope.privacy_level, 'private');
  assert.ok(envelope.source_level_confidence >= 0.9);
  assert.ok(envelope.local_context_overrides.some((override) => (
    override.context_type === 'operations_ramble'
    && override.workspace_key === 'internal_super_admin'
    && override.project_key === 'bna_operations'
  )));
});

test('W3 folder setup plan is provider-neutral and dry-run only', () => {
  const plan = buildProviderNeutralFolderSetupPlan({ root_id: 'root-123' });
  const paths = plan.folders.map((folder) => folder.path);

  assert.equal(plan.dry_run_only, true);
  assert.equal(plan.external_mutation_allowed, false);
  assert.ok(paths.includes('BNA V2/00 Upload Here - Rambles & Prompts/10 Queued'));
  assert.ok(paths.includes('BNA V2/00 Upload Here - Rambles & Prompts/20 In Progress'));
  assert.ok(paths.includes('BNA V2/00 Upload Here - Rambles & Prompts/30 Needs Decision'));
  assert.ok(paths.includes('BNA V2/00 Upload Here - Rambles & Prompts/40 Completed'));
  assert.ok(paths.includes('BNA V2/00 Upload Here - Rambles & Prompts/90 Archive'));
  assert.equal(stageForPromptStatus('needs_decision'), '30 Needs Decision');
  assert.equal(stageForPromptStatus('completed'), '40 Completed');
});
