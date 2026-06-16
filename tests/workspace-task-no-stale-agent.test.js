const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('workspace task UI exposes primary buckets and signal filters', () => {
  assert.match(operationsHtml, /const TASK_LANE_IDS = \['decisions', 'pending', 'tasks', 'schedule', 'done', 'activity'\]/);
  assert.match(operationsHtml, /\{ id: 'agent_working', label: 'Agent Working' \}/);
  assert.match(operationsHtml, /\{ id: 'stale', label: 'Stale' \}/);
  assert.match(operationsHtml, /function taskStatusBucket/);
  assert.match(operationsHtml, /if \(waitingOn && !\/\(codex\|agent\|system\|openai\|kimi\)\/i\.test\(waitingOn\)\) return 'pending';/);
  assert.match(operationsHtml, /return 'tasks';/);
  assert.doesNotMatch(operationsHtml, /Ready for Codex|waiting_shloimie|waiting_sheller|waiting_access|buckets\.changelog/);
});

test('comments default to shared dialogue without implicit agent requeue', () => {
  assert.match(operationsHtml, /function taskCommentDefaultVisibility/);
  assert.match(operationsHtml, /return taskProjectKey\(task\) === 'one_time_mishnah_class' \? 'project' : 'workspace';/);
  assert.match(operationsHtml, /visibility: taskCommentDefaultVisibility/);
  assert.match(operationsHtml, /requeue: false/);
  assert.doesNotMatch(operationsHtml, /Add Comment &amp; Requeue|requeue: true/);
  assert.match(server, /function isTaskCommentRequeueRequest/);
  assert.match(server, /if \(!isTaskCommentRequeueRequest\(requeue\)\) return false;/);
});

test('agent jobs and stale status are first-party lifecycle state', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_agent_jobs/);
  assert.match(server, /blocked_needs_human_decision/);
  assert.match(server, /ensureAgentJobForTask/);
  assert.match(server, /agent_status = 'queued'/);
  assert.match(server, /INTERVAL '10 minutes'/);
  assert.match(server, /INTERVAL '2 hours'/);
  assert.match(server, /status_bucket/);
  assert.match(server, /is_stale/);
  assert.match(server, /recommended_next_action/);
});

test('calendar shows Hebrew dates for task due dates', () => {
  assert.match(operationsHtml, /function formatHebrewDate/);
  assert.match(operationsHtml, /new Intl\.DateTimeFormat\('en-u-ca-hebrew'/);
  assert.match(operationsHtml, /renderTaskMonthCalendar/);
  assert.match(operationsHtml, /renderTaskWeekCalendar/);
});
