const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Server task schema and migration use canonical task states', () => {
  const server = read('server.js');
  const canonicalCheck = /stage TEXT (?:NOT NULL )?DEFAULT 'ready' CHECK \(stage IN \('decision_required', 'ready', 'in_progress', 'blocked', 'done', 'archived'\)\)/;

  assert.match(server, canonicalCheck);
  assert.match(server, /WHEN 'raw_input' THEN 'ready'/);
  assert.match(server, /WHEN 'needs_decision' THEN 'decision_required'/);
  assert.match(server, /WHEN 'assigned' THEN 'ready'/);
  assert.match(server, /WHEN 'archive' THEN 'archived'/);
  assert.match(server, /ALTER TABLE bna_tasks ALTER COLUMN stage SET DEFAULT 'ready';/);
  assert.match(server, /CHECK \(stage IN \('decision_required', 'ready', 'in_progress', 'blocked', 'done', 'archived'\)\);/);
});

test('Server create, filter, and patch paths normalize task state aliases', () => {
  const server = read('server.js');

  assert.match(server, /const CANONICAL_TASK_STAGES = new Set\(\[[\s\S]*?'decision_required',[\s\S]*?'ready',[\s\S]*?'blocked',[\s\S]*?'archived'/);
  assert.match(server, /const TASK_STAGE_ALIASES = \{[\s\S]*?needs_decision: 'decision_required',[\s\S]*?assigned: 'ready',[\s\S]*?archive: 'archived'/);
  assert.match(server, /function normalizeTaskStageValue\(stage, options = \{\}\) \{[\s\S]*?return options\.decisionRequired \? 'decision_required' : 'ready';/);
  assert.match(server, /function inferTaskStage\(text\) \{[\s\S]*?return 'decision_required';[\s\S]*?return 'ready';/);
  assert.match(server, /const stage = normalizeTaskStageValue\(input\.stage \|\| \(requestedDecisionRequired \? 'decision_required' : inferredStage \|\| 'ready'\)/);
  assert.match(server, /const decisionRequired = taskDecisionRequiredForStage\(stage, requestedDecisionRequired\);/);
  assert.match(server, /params\.push\(normalizeTaskStageValue\(stage\)\);/);
  assert.match(server, /normalizedStageUpdate = normalizeTaskStageValue\(value,[\s\S]*?decisionRequired: Boolean\(updates\.decision_required\),/);
  assert.match(server, /if \(normalizedStageUpdate === 'decision_required' && !sawDecisionRequiredUpdate\) \{[\s\S]*?decision_required =/);
  assert.match(server, /if \(normalizedStageUpdate === 'archived' && updates\.archived_at === undefined\) \{[\s\S]*?archived_at = NOW\(\)/);
});

test('Operations UI speaks canonical task states while accepting old values', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function normalizeTaskStage\(stage\) \{[\s\S]*?raw_input: 'ready',[\s\S]*?needs_decision: 'decision_required',[\s\S]*?assigned: 'ready',[\s\S]*?archive: 'archived'/);
  assert.match(operations, /return \['decision_required', 'ready', 'in_progress', 'blocked', 'done', 'archived'\]\.includes\(normalized\) \? normalized : 'ready';/);
  assert.match(operations, /\{ id: 'decision_required', label: 'Needs Your Decision'/);
  assert.match(operations, /\{ id: 'ready', label: 'Ready'/);
  assert.match(operations, /\{ id: 'blocked', label: 'Blocked'/);
  assert.match(operations, /\{ id: 'archived', label: 'Archived'/);
  assert.match(operations, /stage: decisionRequired && selectedStage === 'ready' \? 'decision_required' : selectedStage/);
  assert.match(operations, /stage: 'ready', decision_required: false, assigned_to: 'Shloimie'/);
  assert.match(operations, /stage: 'archived', archived_at: new Date\(\)\.toISOString\(\)/);
  assert.match(operations, /stage: 'blocked'/);
  assert.match(operations, /stage === 'decision_required' \|\| task\.decision_required/);
});
