const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

function serverSlice(startNeedle, endNeedle) {
  const start = server.indexOf(startNeedle);
  assert.notEqual(start, -1, `${startNeedle} should exist`);
  const end = server.indexOf(endNeedle, start);
  assert.notEqual(end, -1, `${endNeedle} should exist after ${startNeedle}`);
  return server.slice(start, end);
}

test('Operations task lanes keep internal handoff briefs out of operator-facing views', () => {
  assert.doesNotMatch(operations, /Planned Briefs|Pending Briefs|Implementation Briefs/);
  assert.doesNotMatch(operations, /pending-briefs/);
  assert.match(operations, /Codex Queue/);
  for (const label of [
    'My Tasks',
    'One Time Tasks',
    'Codex / Agent Work',
    'Blocked',
    'Due Soon',
    'Calendar',
    'Done / Activity',
    'Needs My Decision',
    'Needs Rabbi Scheller',
    'Needs External Owner',
    'Decided',
    'Superseded',
    'Archived Decisions'
  ]) {
    assert.match(operations, new RegExp(label.replace(/[ /]/g, '[ /]')));
  }
  assert.match(operations, /Blocked means access or outside input, not Codex queue work/);
  assert.match(operations, /It is not the human Pending lane/);
  assert.match(operations, /if \(taskKind === 'pending_access'\) return 'pending';/);
  assert.match(operations, /if \(taskKind === 'agent_job'\) return 'tasks';/);
  assert.match(operations, /const codexQueueTasks = buckets\.tasks\.filter\(taskMatchesCodexQueue\)/);
});

test('tasks API exposes server-side filters for default Task and Decision views', () => {
  const route = serverSlice(
    "app.get('/api/bna/tasks'",
    "app.post('/api/bna/tasks'"
  );

  assert.match(route, /task_view/);
  assert.match(route, /decision_view/);
  assert.match(route, /my_tasks/);
  assert.match(route, /one_time_tasks/);
  assert.match(route, /codex_agent_work/);
  assert.match(route, /due_soon/);
  assert.match(route, /completed_activity/);
  assert.match(route, /needs_my_decision/);
  assert.match(route, /needs_rabbi_scheller/);
  assert.match(route, /needs_external_owner/);
  assert.match(route, /duplicate_of_task_id IS NOT NULL OR canonical_task_id IS NOT NULL/);
  assert.match(route, /decision_outcome/);
});
