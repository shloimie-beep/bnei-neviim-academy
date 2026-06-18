const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Task overview counts derive from live scoped task buckets', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /const \{ buckets \} = getTaskBuckets\(\);/);
  assert.match(operations, /const visibleTasks = \[\.\.\.buckets\.decisions, \.\.\.buckets\.mine, \.\.\.buckets\.changelog\];/);
  assert.match(operations, /const urgentCount = visibleTasks\.filter\(t => \['urgent', 'today'\]\.includes\(t\.urgency\)\)\.length;/);
  assert.match(operations, /const blockedTasks = visibleTasks\.filter\(task => normalizeTaskStage\(task\.stage\) === 'blocked'\);/);
  assert.match(operations, /const blockedCount = blockedTasks\.length;/);
  assert.match(operations, /\$\{state\.blockedCount \? `<span class="page-status-pill">/);
});

test('Blocked count links to visible task records with blocker explanations', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /renderMetricButton\('Blocked', state\.blockedCount, 'Open blocked records with blocker notes\.', "openTaskBlocked\(\)"\)/);
  assert.match(operations, /function openTaskBlocked\(\) \{/);
  assert.match(operations, /document\.getElementById\('blockedTasksSection'\)\?\.scrollIntoView\(\{ block: 'start' \}\)/);
  assert.match(operations, /renderTaskListSection\('Blocked Work', state\.blockedTasks, 'blocked'\)/);
  assert.match(operations, /function taskBlockerLabel\(task\) \{/);
  assert.match(operations, /task\.blocker_reason \|\| parsed\.blocker_reason \|\| parsed\.blocker \|\| sourceContext\.blocker_reason \|\| sourceContext\.blocker/);
});
