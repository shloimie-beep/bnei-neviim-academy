const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Operations task modal has dialog semantics, labels, and close description', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /class="modal-overlay \$\{isModalOpen \? 'show' : ''\}" id="taskModal" aria-hidden="\$\{isModalOpen \? 'false' : 'true'\}" onkeydown="handleTaskModalKeydown\(event\)"/);
  assert.match(operations, /<div class="modal" role="dialog" aria-modal="true" aria-labelledby="taskModalTitle" aria-describedby="taskModalDescription">/);
  assert.match(operations, /<h2 id="taskModalTitle">/);
  assert.match(operations, /id="taskModalDescription" class="sr-only"/);
  assert.match(operations, /class="modal-close" aria-label="Close task details"/);
  assert.match(operations, /<span aria-hidden="true">&times;<\/span>/);

  for (const id of [
    'taskTitle',
    'taskNotes',
    'taskProject',
    'taskAssignedTo',
    'taskStage',
    'taskCategory',
    'taskUrgency',
    'taskEnergy',
    'taskDueDate',
    'taskMinutes',
    'taskNewComment'
  ]) {
    assert.match(operations, new RegExp(`<label for="${id}">`), `${id} should have an explicit label`);
  }
});

test('Operations modal focus opens, closes, restores, and handles Escape', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /let taskModalOpen = false;/);
  assert.match(operations, /let taskModalReturnFocus = null;/);
  assert.match(operations, /function focusTaskModal\(\) \{[\s\S]*?document\.getElementById\('taskTitle'\)\?\.focus\?\.\(\);/);
  assert.match(operations, /function restoreTaskModalFocus\(\) \{[\s\S]*?document\.querySelector\(taskModalReturnFocusSelector\)[\s\S]*?target\.focus\(\);/);
  assert.match(operations, /function handleTaskModalKeydown\(event\) \{[\s\S]*?if \(event\.key !== 'Escape'\) return;[\s\S]*?closeTaskModal\(\);/);
  assert.match(operations, /function closeTaskModal\(\) \{[\s\S]*?taskModalOpen = false;[\s\S]*?render\(\);[\s\S]*?window\.setTimeout\(restoreTaskModalFocus, 0\);/);
});

test('Operations clickable cards are keyboard activatable and announced', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function activateOnEnterOrSpace\(event\) \{[\s\S]*?event\.key !== 'Enter' && event\.key !== ' '[\s\S]*?event\.currentTarget\?\.click\?\.\(\);/);
  assert.match(operations, /class="task-row" data-task-row-id="\$\{taskId\}" role="button" tabindex="0" aria-label="Open task: \$\{escapeHtml\(taskTitle\)\}"[\s\S]*?onkeydown="activateOnEnterOrSpace\(event\)"/);
  assert.match(operations, /class="content-card-compact" role="button" tabindex="0" aria-expanded="\$\{expanded \? 'true' : 'false'\}" aria-label="\$\{expanded \? 'Collapse' : 'Open'\} content item: \$\{escapeHtml\(displayTitle\)\}"[\s\S]*?onkeydown="activateOnEnterOrSpace\(event\)"/);
});

test('Operations filter-style controls expose pressed/current state', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /class="section-tab \$\{activeId === tab\.id \? 'active' : ''\}"[\s\S]*?aria-pressed="\$\{activeId === tab\.id \? 'true' : 'false'\}"[\s\S]*?aria-current="page"/);
  assert.match(operations, /class="task-filter \$\{taskFocus === id \? 'active' : ''\}"[\s\S]*?aria-pressed="\$\{taskFocus === id \? 'true' : 'false'\}"/);
  assert.match(operations, /class="task-overview-card \$\{taskFocus === focus \? 'active' : ''\}"[\s\S]*?aria-pressed="\$\{taskFocus === focus \? 'true' : 'false'\}"/);
  assert.match(operations, /class="filter-chip \$\{currentValue === value \? 'active' : ''\}" onclick="setTaskFilter\('\$\{kind\}', '\$\{value\}'\)" aria-pressed="\$\{currentValue === value \? 'true' : 'false'\}"/);
  assert.match(operations, /class="filter-chip \$\{currentValue === value \? 'active' : ''\}" onclick="setContentFilter\('\$\{kind\}', '\$\{value\}'\)" aria-pressed="\$\{currentValue === value \? 'true' : 'false'\}"/);
});

test('Operations stylesheet includes screen-reader and disabled-control accessibility primitives', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /\.sr-only \{[\s\S]*?position: absolute;[\s\S]*?clip: rect\(0, 0, 0, 0\);[\s\S]*?white-space: nowrap;/);
  assert.match(operations, /button:disabled,[\s\S]*?\.filter-chip:disabled \{[\s\S]*?cursor: not-allowed;[\s\S]*?opacity: 0\.72;/);
});
