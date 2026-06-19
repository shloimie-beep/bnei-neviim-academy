const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createIntakeSourceRecord,
  validateIntakeSourceRecord,
  inferSourceKind,
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
  assert.equal(validateIntakeSourceRecord(first).ok, true);
});

test('W3 intake source kind detection covers docs, audio, video, transcript, and Telegram text', () => {
  assert.equal(inferSourceKind({ mime_type: 'application/vnd.google-apps.document' }), 'google_doc');
  assert.equal(inferSourceKind({ filename: 'class.m4a' }), 'audio');
  assert.equal(inferSourceKind({ filename: 'recording.mp4' }), 'video');
  assert.equal(inferSourceKind({ filename: 'lesson.vtt' }), 'transcript');
  assert.equal(inferSourceKind({ source_type: 'telegram' }), 'telegram_text');
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
