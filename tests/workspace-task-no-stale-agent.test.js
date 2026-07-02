const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('workspace task UI exposes primary lanes and owner filters', () => {
  assert.match(operationsHtml, /const TASK_LANE_IDS = TASK_SUBTABS\.map\(tab => tab\.id\)/);
  assert.match(operationsHtml, /\{ id: 'mine', label: 'My Tasks' \}/);
  assert.match(operationsHtml, /\{ id: 'one_time', label: 'One Time Tasks' \}/);
  assert.match(operationsHtml, /\{ id: 'codex_queue', label: 'Codex \/ Agent Work' \}/);
  assert.match(operationsHtml, /\{ id: 'pending', label: 'Blocked' \}/);
  assert.match(operationsHtml, /\{ id: 'done_activity', label: 'Done \/ Activity' \}/);
  assert.match(operationsHtml, /\{ id: 'assigned_shloimie', label: 'Me \/ Shloimie' \}/);
  assert.doesNotMatch(operationsHtml, /\{ id: 'agent_working', label: 'Agent Working' \}/);
  assert.doesNotMatch(operationsHtml, /\{ id: 'stale', label: 'Stale' \}/);
  assert.match(operationsHtml, /function taskStatusBucket/);
  assert.match(operationsHtml, /if \(waitingOn && !\/\(codex\|agent\|system\|openai\|kimi\)\/i\.test\(waitingOn\)\) return 'pending';/);
  assert.match(operationsHtml, /return 'tasks';/);
  assert.doesNotMatch(operationsHtml, /Ready for Codex|waiting_shloimie|waiting_sheller|waiting_access|buckets\.changelog/);
});

test('task sorting puts newest active work before stale history', () => {
  assert.match(operationsHtml, /function taskSortTime\(task = \{\}\)/);
  assert.match(operationsHtml, /task\.effective_last_activity_at/);
  assert.match(operationsHtml, /function taskIsTerminalTaskForSorting\(task = \{\}\)/);
  assert.match(operationsHtml, /if \(terminalA !== terminalB\) return terminalA \? 1 : -1;/);
  assert.match(operationsHtml, /const activity = taskSortTime\(b\) - taskSortTime\(a\);/);
  assert.match(server, /COALESCE\(effective_last_activity_at, updated_at, created_at\) DESC/);
  assert.match(server, /CASE WHEN status_bucket = 'done' OR \$\{archivedSql\} THEN 1 ELSE 0 END/);
});

test('One Time task cards expose workspace scope and hide internal tech from project-scoped provider users', () => {
  assert.match(operationsHtml, /function taskWorkspaceLabel\(task = \{\}\)/);
  assert.match(operationsHtml, /Workspace: \$\{escapeHtml\(taskWorkspaceLabel\(task\)\)\}/);
  assert.match(operationsHtml, /function currentTaskViewerIsProviderScoped\(\)/);
  assert.match(operationsHtml, /opsMe\?\.scope\?\.type === 'project'/);
  assert.match(operationsHtml, /function taskIsInternalTechOnly\(task = \{\}\)/);
  assert.match(operationsHtml, /taskSharedWithProvider\(task\) \|\| taskIsRabbi\(task\)/);
  assert.match(operationsHtml, /function taskVisibleToCurrentTaskWorkspace\(task = \{\}\)/);
  assert.match(operationsHtml, /buckets\.tasks\.filter\(taskVisibleToCurrentTaskWorkspace\)/);
  assert.match(operationsHtml, /visibleTaskRows = tasks\.filter\(taskVisibleToCurrentTaskWorkspace\)/);
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
