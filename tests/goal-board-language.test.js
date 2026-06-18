const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Goal Board controls use plain product language for tablet access', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /const DEVICE_ACCESS_STATES = \[[\s\S]*label: 'Paused'[\s\S]*label: 'Checkoff Only'[\s\S]*label: 'Open'[\s\S]*label: 'Ended'[\s\S]*label: 'Temporary Open'/);
  assert.match(operations, /function deviceAccessChangeLabel\(value, durationMinutes = null\)/);
  assert.match(operations, /Add Tablet Record/);
  assert.match(operations, /Pause Access/);
  assert.match(operations, /Open 60m/);
  assert.match(operations, /Open Tablet/);
  assert.match(operations, /Keep Closed/);
  assert.match(operations, /Open Temporarily/);
  assert.match(operations, /If Goal Is Missed/);
  assert.match(operations, /When Student Checks Off/);
  assert.match(operations, /Add Goal/);

  assert.doesNotMatch(operations, />Create Goal Board Item</);
  assert.doesNotMatch(operations, />Approve Device State</);
  assert.doesNotMatch(operations, />Deny Device State</);
  assert.doesNotMatch(operations, />Manual Override</);
  assert.doesNotMatch(operations, /Missed Goal Device State/);
  assert.doesNotMatch(operations, /Auto after checkoff/);
  assert.doesNotMatch(operations, /No mock tablet/);
  assert.doesNotMatch(operations, /Add Mock Tablet/);
  assert.doesNotMatch(operations, /Provider: \$\{escapeHtml\(device\.provider/);
});

test('Goal Board actions are grouped into horizontal purpose toolbars', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /\.goal-board-toolbar \{/);
  assert.match(operations, /\.goal-board-toolbar-label \{/);
  assert.match(operations, /class="goal-board-toolbar" aria-label="Goal form actions"/);
  assert.match(operations, /class="goal-board-toolbar" aria-label="Progress actions"/);
  assert.match(operations, /class="goal-board-toolbar" aria-label="Review actions"/);
  assert.match(operations, /class="goal-board-toolbar" aria-label="Board actions"/);
  assert.match(operations, /class="goal-board-toolbar" aria-label="Tablet access actions"/);
  assert.match(operations, /class="goal-board-toolbar" aria-label="Tablet setup actions"/);
});
