const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Goal Board renders separate lanes for goals progress approvals and history', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function goalBoardLane\(item, deviceList = \[\]\)/);
  assert.match(operations, /function goalBoardLaneGroups\(items, deviceList = \[\]\)/);
  assert.match(operations, /function renderGoalBoardSection\(title, items, emptyText\)/);
  assert.match(operations, /function renderGoalBoardSections\(items, deviceList = \[\], activeFilter = 'all'\)/);
  assert.match(operations, /renderGoalBoardSections\(filtered, deviceList, activeFilter\)/);

  assert.match(operations, /Current Goals/);
  assert.match(operations, /Progress \/ Check-ins/);
  assert.match(operations, /Approvals/);
  assert.match(operations, /History/);
  assert.match(operations, /class="goal-board-section-grid"/);
  assert.match(operations, /class="goal-board-section" aria-label="\$\{escapeHtml\(title\)\}"/);

  assert.doesNotMatch(operations, /filtered\.length \? filtered\.map\(renderGoalBoardAdminCard\)/);
});

test('Goal Board lane assignment keeps waiting done and partial goals separate', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /if \(goalBoardFilterMatches\(item, 'needs_review', deviceList\)\) return 'approvals';/);
  assert.match(operations, /if \(status === 'done' \|\| progress >= 100\) return 'history';/);
  assert.match(operations, /if \(progress > 0\) return 'progress';/);
  assert.match(operations, /return 'goals';/);
});
