const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const operations = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'railway-migration-2026-06-15-decision-lifecycle.sql'), 'utf8');
const auditScript = fs.readFileSync(path.join(root, 'scripts', 'audit-decision-lifecycle.mjs'), 'utf8');

test('decision lifecycle schema is non-destructive and has a deduped active queue', () => {
  for (const column of [
    'decision_status',
    'decision_route',
    'decision_outcome',
    'decision_reprocess_requested_at',
    'decision_reprocessed_at',
    'decision_last_activity_at',
    'decision_hidden_at',
  ]) {
    assert.match(server, new RegExp(`ADD COLUMN IF NOT EXISTS ${column}`));
    assert.match(migration, new RegExp(`ADD COLUMN IF NOT EXISTS ${column}`));
  }
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_decision_reprocess_queue/);
  assert.match(server, /bna_decision_reprocess_queue_one_active/);
  assert.match(migration, /WHERE status IN \('queued', 'processing'\)/);
});

test('decision comments reprocess meaningful human input without looping on system comments', () => {
  assert.match(server, /function isMeaningfulDecisionComment/);
  assert.match(server, /\['system', 'agent_fleet', 'agent-fleet', 'automation'\]\.includes/);
  assert.match(server, /requestDecisionReprocess\(currentTask/);
  assert.match(server, /decision_event/);
  assert.match(server, /duplicate_queue_entry/);
});

test('decision actions create linked executable work instead of assigning the parent decision to Codex', () => {
  assert.match(server, /app\.post\('\/api\/bna\/tasks\/:id\/decision-action'/);
  assert.match(server, /findActiveLinkedCodexTask/);
  assert.match(server, /createLinkedDecisionTask/);
  assert.match(server, /parent_task_id = \$1/);
  assert.match(server, /decision_required: false/);
  assert.match(server, /decision_status: 'sent_to_codex'/);
});

test('operations UI renders decision-specific state and uses decision-action endpoint', () => {
  assert.match(operations, /decisionAction\(id, payload = \{\}\)/);
  assert.match(operations, /Add Decision Comment/);
  assert.match(operations, /Missing decision detail/);
  assert.match(operations, /renderDecisionActionButtons/);
  assert.match(operations, /decisionStatusLabel/);
  assert.doesNotMatch(operations, /taskAction\(event, \$\{id\}, \{ stage: 'assigned', assigned_to: 'Codex', decision_required: false \}\)">Send to Codex/);
});

test('decision audit script is dry-run first and reports missing named decisions', () => {
  assert.match(auditScript, /APPLY_DECISION_CLASSIFICATION/);
  assert.match(auditScript, /missing_expected/);
  assert.match(auditScript, /Decide Analytics/);
  assert.match(auditScript, /Parent\/student login model/);
});
