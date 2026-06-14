const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const agentFleet = fs.readFileSync('scripts/agent-fleet-supervisor.mjs', 'utf8');

function loadCommentRequeueHelper() {
  const start = server.indexOf('function isTaskCommentRequeueOptOut');
  const end = server.indexOf("app.post('/api/bna/tasks/:id/comments'", start);
  assert.ok(start > 0 && end > start, 'comment requeue helper should be found');
  const sandbox = {};
  vm.runInNewContext(`${server.slice(start, end)}
result = shouldRequeueTaskAfterHumanComment;`, sandbox);
  return sandbox.result;
}

test('Operations expanded task details can add comments inline', () => {
  assert.match(operationsHtml, /function renderTaskInlineCommentForm/);
  assert.match(operationsHtml, /taskInlineComment-\$\{id\}/);
  assert.match(operationsHtml, /onsubmit="addInlineTaskComment\(event, \$\{id\}\)"/);
  assert.match(operationsHtml, /function addInlineTaskComment/);
  assert.match(operationsHtml, /api\.addTaskComment\(id/);
  assert.match(operationsHtml, /visibility: 'workspace'/);
  assert.match(operationsHtml, /requeue: false/);
  assert.match(operationsHtml, /\.\.\.\(saved\?\.task \|\| \{\}\)/);
  assert.match(operationsHtml, /expandedTaskComments = \{[\s\S]*\.\.\.expandedTaskComments[\s\S]*\[id\]: comments/);
});

test('Human task comments are shared dialogue; explicit requeue creates agent work', () => {
  assert.match(server, /function shouldRequeueTaskAfterHumanComment/);
  assert.match(server, /function isTaskCommentRequeueOptOut/);
  assert.match(server, /function isTaskCommentRequeueRequest/);
  assert.match(server, /if \(!isTaskCommentRequeueRequest\(requeue\)\) return false;/);
  assert.match(server, /\['dashboard', 'telegram', 'api'\]\.includes\(normalizedSource\)/);
  assert.match(server, /source = 'dashboard'/);
  assert.match(server, /stage = 'assigned'[\s\S]*assigned_to = 'Codex'[\s\S]*agent_status = 'queued'[\s\S]*decision_required = FALSE/);
  assert.match(server, /item_type = 'task'[\s\S]*waiting_on = NULL/);
  assert.match(server, /next_action_label = 'Agent working'/);
  assert.match(server, /started_at = NULL[\s\S]*completed_at = NULL[\s\S]*verified_at = NULL/);
  assert.match(server, /res\.json\(\{ success: true, comment: result\.rows\[0\], requeued: Boolean\(task\), task \}\)/);
  assert.match(operationsHtml, /Add comment/);
  assert.match(operationsHtml, /source: 'dashboard',[\s\S]*requeue: false/);
  assert.doesNotMatch(operationsHtml, /Add Comment &amp; Requeue/);
  assert.match(operationsHtml, /\.\.\.\(saved\?\.task \|\| \{\}\)/);
});

test('Comment requeue gate distinguishes human comments, explicit opt-outs, and agent comments', () => {
  const shouldRequeue = loadCommentRequeueHelper();

  assert.equal(shouldRequeue({ source: 'dashboard', author: 'dashboard' }), false);
  assert.equal(shouldRequeue({ source: 'telegram', author: 'Shloimie' }), false);
  assert.equal(shouldRequeue({ source: 'api', author: 'operator' }), false);
  assert.equal(shouldRequeue({ source: 'dashboard', author: 'dashboard', requeue: true }), true);
  assert.equal(shouldRequeue({ source: 'telegram', author: 'Shloimie', requeue: 'yes' }), true);
  assert.equal(shouldRequeue({ source: 'api', author: 'operator', requeue: 'requeue' }), true);

  assert.equal(shouldRequeue({ source: 'dashboard', author: 'dashboard', requeue: false }), false);
  assert.equal(shouldRequeue({ source: 'telegram', author: 'Shloimie', requeue: 'no' }), false);
  assert.equal(shouldRequeue({ source: 'api', author: 'operator', requeue: 0 }), false);
  assert.equal(shouldRequeue({ source: 'api', author: 'operator', requeue: 'off' }), false);

  assert.equal(shouldRequeue({ source: 'system', author: 'agent-fleet' }), false);
  assert.equal(shouldRequeue({ source: 'api', author: 'Codex' }), false);
  assert.equal(shouldRequeue({ source: 'api', author: 'Telegram bot' }), false);
  assert.equal(shouldRequeue({ source: 'content_job', author: 'mixed-recording-parser' }), false);
});

test('System comments do not requeue their own agent work', () => {
  assert.match(server, /if \(!\['dashboard', 'telegram', 'api'\]\.includes\(normalizedSource\)\) return false;/);
  assert.match(server, /agent-fleet\|codex\|kimi\|watchdog\|system\|smoke\|railway\|automation\|bot/);
  assert.match(agentFleet, /source: 'system'/);
});

test('Agent fleet prompt includes recent task comments', () => {
  assert.match(agentFleet, /async function loadTaskComments/);
  assert.match(agentFleet, /appRequest\(config, 'GET', `\/api\/bna\/tasks\/\$\{taskId\}\/comments`\)/);
  assert.match(agentFleet, /function formatTaskCommentsForPrompt/);
  assert.match(agentFleet, /'Recent task comments:'/);
  assert.match(agentFleet, /buildTaskPrompt\(task, record\.attempts, taskComments\)/);
});

test('Operations defers full re-renders while dictation or text entry is active', () => {
  assert.match(operationsHtml, /function isTextEntryTarget/);
  assert.match(operationsHtml, /function renderShouldWaitForTextEntry/);
  assert.match(operationsHtml, /function deferRenderUntilTextEntrySettles/);
  assert.match(operationsHtml, /if \(!options\.force && renderShouldWaitForTextEntry\(\)\)/);
  assert.match(operationsHtml, /document\.addEventListener\('compositionstart'/);
  assert.match(operationsHtml, /document\.addEventListener\('compositionend'/);
  assert.match(operationsHtml, /setInterval\(\(\) => loadData\(\{ background: true \}\), 30000\)/);
});

test('Operations moves resolved decisions to Done or actionable Tasks', () => {
  assert.match(operationsHtml, /const TASK_LANE_IDS = \['decisions', 'pending', 'tasks', 'schedule', 'done', 'activity'\]/);
  assert.match(operationsHtml, /\{ id: 'done', label: 'Done' \}/);
  assert.match(operationsHtml, /\{ id: 'tasks', label: 'Tasks' \}/);
  assert.match(operationsHtml, /done: \[\]/);
  assert.match(operationsHtml, /tasks: \[\]/);
  assert.match(operationsHtml, /done: buckets\.done/);
  assert.match(operationsHtml, /tasks: buckets\.tasks/);
  assert.match(operationsHtml, /Decision handled/);
  assert.match(operationsHtml, /chooseTaskDecision/);
  assert.match(server, /actions\/choose-decision/);
  assert.match(operationsHtml, /function taskEndpointAction/);
  assert.match(operationsHtml, /api\.chooseTaskDecision\(taskId/);
  assert.match(operationsHtml, /Needs more info/);
  assert.match(server, /actions\/needs-more-info/);
  assert.match(server, /decision_needs_more_info/);
  assert.match(operationsHtml, /function decisionPatchRoutesToWork/);
  assert.match(operationsHtml, /function taskStatusBucket/);
  assert.match(operationsHtml, /if \(task\.completed_at \|\| task\.verified_at \|\| \['done', 'archive'\]\.includes\(stage\)\) return 'done';/);
  assert.match(operationsHtml, /return 'tasks';/);
  assert.match(operationsHtml, /if \(\['assigned', 'in_progress'\]\.includes\(stage\)\) return true;/);
});

test('Task toolbar uses workspace-aware filters without bucket wording', () => {
  assert.doesNotMatch(operationsHtml, /Workspace Bucket/);
  assert.match(operationsHtml, /Workspace Status/);
  assert.match(operationsHtml, /function renderTaskSignalFilters/);
  assert.match(operationsHtml, /<span class="filter-label">Workspace<\/span>/);
  assert.match(operationsHtml, /<span class="filter-label">Assignee<\/span>/);
  assert.match(operationsHtml, /<span class="filter-label">Type<\/span>/);
  assert.match(operationsHtml, /Upcoming/);
  assert.match(operationsHtml, /No date/);
  assert.match(operationsHtml, /taskSignalFilter !== 'all'/);
});

test('Task calendar exposes selected-date task actions', () => {
  assert.match(operationsHtml, /function renderTaskSelectedDayPanel/);
  assert.match(operationsHtml, /Add task to this date/);
  assert.match(operationsHtml, /Move selected task to this date/);
  assert.match(operationsHtml, /function openTaskModalForDate/);
  assert.match(operationsHtml, /taskDueDate/);
  assert.match(operationsHtml, /function moveSelectedTaskToDate/);
  assert.match(operationsHtml, /api\.updateTask\(taskId, \{ due_date: key \}\)/);
});
