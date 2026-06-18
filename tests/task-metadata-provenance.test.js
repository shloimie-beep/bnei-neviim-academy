const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Task schema, migration, create, and patch paths keep blocker metadata separate', () => {
  const server = read('server.js');

  assert.match(server, /blocker_reason TEXT/);
  assert.match(server, /ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS blocker_reason TEXT;/);
  assert.match(server, /const blockerReason = String\(input\.blocker_reason \|\| input\.blocker \|\| input\.blocked_reason \|\| ''\)\.trim\(\) \|\| null;/);
  assert.match(server, /blocker_reason, source, source_context, created_by, assigned_to, ai_parsed, project_id, decision_required, author/);
  assert.match(server, /'blocker_reason'/);
  assert.match(server, /if \(key === 'blocker_reason'\) nextValue = String\(value \|\| ''\)\.trim\(\)\.slice\(0, 500\) \|\| null;/);
});

test('Operations task cards render labeled owner, status, urgency, due, blocker, and provenance metadata', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function renderTaskMetadataBadges\(task\) \{/);
  assert.match(operations, /renderTaskMetadataBadge\('Owner', taskOwnerLabel\(task\)\)/);
  assert.match(operations, /renderTaskMetadataBadge\('Status', taskStageLabel\(task\)/);
  assert.match(operations, /renderTaskMetadataBadge\('Urgency', formatUrgency\(task\.urgency\)/);
  assert.match(operations, /renderTaskMetadataBadge\('Due', task\.due_date \? formatDate\(task\.due_date\) : 'Not set'\)/);
  assert.match(operations, /renderTaskMetadataBadge\('Blocker', taskBlockerLabel\(task\)\)/);
  assert.match(operations, /renderTaskMetadataBadge\('Source', taskProvenanceLabel\(task\)\)/);
  assert.match(operations, /data-task-meta="\$\{escapeHtml\(String\(label \|\| ''\)\.toLowerCase\(\)\)\}"/);
  assert.match(operations, /\.task-row-meta\.primary-only \.badge:nth-child\(n\+9\)/);
});

test('Operations task modal edits blocker reason and shows source provenance separately from raw text', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /<label for="taskBlockerReason">Blocker \/ Waiting On<\/label>/);
  assert.match(operations, /id="taskBlockerReason" value="\$\{escapeHtml\(task\.blocker_reason \|\| ''\)\}"/);
  assert.match(operations, /blocker_reason: document\.getElementById\('taskBlockerReason'\)\.value \|\| null/);
  assert.match(operations, /function taskProvenanceLabel\(task\) \{/);
  assert.match(operations, /function renderTaskProvenancePanel\(task\) \{/);
  assert.match(operations, /aria-label="Task provenance"/);
  assert.match(operations, /parsed\.raw_id \|\| parsed\.rawId \|\| sourceContext\.raw_id/);
});
