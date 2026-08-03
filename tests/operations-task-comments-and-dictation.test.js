const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const agentFleet = fs.readFileSync('scripts/agent-fleet-supervisor.mjs', 'utf8');

test('task creation SQL casts nullable decision placeholders for live Postgres', () => {
  assert.match(server, /\$43::text, \$44::text, CASE WHEN \$43::text IS NOT NULL THEN NOW\(\) ELSE NULL END/);
});

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
  assert.match(operationsHtml, /function taskCommentDefaultVisibility/);
  assert.match(operationsHtml, /return taskProjectKey\(task\) === 'one_time_mishnah_class' \? 'project' : 'workspace';/);
  assert.match(operationsHtml, /visibility: taskCommentDefaultVisibility\(tasks\.find\(task => Number\(task\.id\) === id\) \|\| \{\}\)/);
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
  assert.match(server, /res\.json\(\{ success: true, comment, requeued: Boolean\(task\), task, decision_event \}\)/);
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
  assert.match(operationsHtml, /function backgroundRefreshCanRun/);
  assert.match(operationsHtml, /setInterval\(\(\) => \{[\s\S]*if \(!backgroundRefreshCanRun\(\)\) return;[\s\S]*loadData\(\{ background: true \}\);[\s\S]*\}, 30000\)/);
});

test('Operations moves resolved decisions to Done or actionable Tasks', () => {
  assert.match(operationsHtml, /const TASK_LANE_IDS = TASK_SUBTABS\.map\(tab => tab\.id\)/);
  assert.match(operationsHtml, /\{ id: 'mine', label: 'My Tasks' \}/);
  assert.match(operationsHtml, /\{ id: 'one_time', label: 'One Time Tasks' \}/);
  assert.match(operationsHtml, /\{ id: 'done_activity', label: 'Done' \}/);
  assert.match(operationsHtml, /\{ id: 'codex_queue', label: 'Bots \/ Agents' \}/);
  assert.match(operationsHtml, /\{ id: 'tasks', label: 'Tasks' \}/);
  assert.match(operationsHtml, /done: \[\]/);
  assert.match(operationsHtml, /tasks: \[\]/);
  assert.match(operationsHtml, /done_activity: doneActivityTasks/);
  assert.match(operationsHtml, /codex_queue: codexQueueTasks/);
  assert.match(operationsHtml, /tasks: regularTasks/);
  assert.match(server, /Decision outcome saved/);
  assert.match(operationsHtml, /chooseTaskDecision/);
  assert.match(server, /actions\/choose-decision/);
  assert.match(operationsHtml, /function taskEndpointAction/);
  assert.match(operationsHtml, /api\.decisionAction\(id, request\)/);
  assert.match(operationsHtml, /Wait External|Block/);
  assert.match(server, /actions\/needs-more-info/);
  assert.match(server, /decision_needs_more_info/);
  assert.match(operationsHtml, /function decisionPatchRoutesToWork/);
  assert.match(operationsHtml, /function taskStatusBucket/);
  assert.match(operationsHtml, /if \(task\.completed_at \|\| task\.verified_at \|\| \['done', 'archive'\]\.includes\(stage\)\) return 'done';/);
  assert.match(operationsHtml, /return 'tasks';/);
  assert.match(operationsHtml, /if \(\['assigned', 'in_progress'\]\.includes\(stage\)\) return true;/);
});

test('explicit Telegram Task prefixes bypass conversational capture suppression', () => {
  assert.match(server, /const explicitTaskPrefix = \/\^\(\?:task\|todo\)/);
  assert.match(server, /!explicitTaskPrefix && hasDirectReplyInsteadOfCodexIntentForTasks\(text\)/);
  assert.match(server, /const keepWholeRoutingTask =[\s\S]*explicitTaskPrefix[\s\S]*hasCommentRequeueWorkflowIntent/);
  assert.match(server, /check\|verify\|assign\|archive\|audit/);
  assert.match(server, /function explicitTaskRoutingFields\(line\)/);
  assert.match(server, /explicitRouting\?\.assignedTo[\s\S]*inferTaskOwner\(taskText\)/);
  assert.match(server, /urgency: explicitRouting\?\.urgency \|\|/);
});

test('Decision cards expose Phase 8 choice context and comments', () => {
  assert.match(operationsHtml, /function decisionQuestionText/);
  assert.match(operationsHtml, /What should the \$\{cleaned\} be\?/);
  assert.match(operationsHtml, /function decisionDetailModel/);
  assert.match(operationsHtml, /workspace: taskProjectLabel\(task\)/);
  assert.match(operationsHtml, /task-decision-option-key/);
  assert.match(operationsHtml, /keyLabel: `Option \$\{String\.fromCharCode\(65 \+ index\)\}`/);
  assert.match(operationsHtml, /Consequences/);
  assert.match(operationsHtml, /No consequence captured yet/);
  assert.match(operationsHtml, /workspace: taskProjectLabel\(task\)/);
  assert.match(operationsHtml, /<div class="task-inline-label">\$\{escapeHtml\(label\)\}<\/div>/);
  assert.match(operationsHtml, /function renderTaskDecisionContextCommentForm/);
  assert.match(operationsHtml, /taskDecisionComment-\$\{id\}/);
  assert.match(operationsHtml, /Add Decision Comment/);
  assert.match(operationsHtml, /function addDecisionContextComment/);
  assert.match(operationsHtml, /visibility: taskCommentDefaultVisibility\(tasks\.find\(task => Number\(task\.id\) === id\) \|\| \{\}\)/);
  assert.match(operationsHtml, /source: 'dashboard'/);
  assert.match(operationsHtml, /requeue: false/);
});

test('Task toolbar uses workspace-aware filters without bucket wording', () => {
  assert.doesNotMatch(operationsHtml, /Workspace Bucket/);
  assert.match(operationsHtml, /Workspace Status/);
  assert.match(operationsHtml, /function renderTaskSignalFilters/);
  assert.match(operationsHtml, /<span class="filter-label">Workspace<\/span>/);
  assert.match(operationsHtml, /<span class="filter-label">Owner<\/span>/);
  assert.match(operationsHtml, /<span class="filter-label">Type<\/span>/);
  assert.match(operationsHtml, /Upcoming/);
  assert.match(operationsHtml, /No date/);
  assert.match(operationsHtml, /\{ id: 'assigned_shloimie', label: 'Me' \}/);
  assert.match(operationsHtml, /Rabbi Elie Scheller/);
  assert.match(operationsHtml, /taskSignalFilter !== 'all'/);
  assert.match(operationsHtml, /<span class="filter-label">Source<\/span>/);
  assert.match(operationsHtml, /taskSourceFilter !== 'all'/);
  assert.match(operationsHtml, /Source: \$\{escapeHtml\(taskSourceLabel\(task\)\)\}/);
});

test('Task calendar exposes selected-date task actions', () => {
  assert.match(operationsHtml, /function renderTaskSelectedDayPanel/);
  assert.match(operationsHtml, /Selected: \$\{escapeHtml\(selectedLabel\)\}/);
  assert.match(operationsHtml, /function selectedTaskCalendarLabel/);
  assert.match(operationsHtml, /Add task to this date/);
  assert.match(operationsHtml, /Move selected task to this date/);
  assert.match(operationsHtml, /function openTaskModalForDate/);
  assert.match(operationsHtml, /taskDueDate/);
  assert.match(operationsHtml, /function moveSelectedTaskToDate/);
  assert.match(operationsHtml, /api\.updateTask\(taskId, \{ due_date: key \}\)/);
  assert.match(operationsHtml, /Internal calendar/);
  assert.match(operationsHtml, /openCommandTarget\('calendar', 'list'\)/);
  assert.match(operationsHtml, /function previewSelectedDateGoogleCalendarDryRun/);
  assert.match(operationsHtml, /action_id: 'sync_google_calendar'/);
  assert.match(operationsHtml, /source: 'operations_task_calendar_selected_day'/);
  assert.match(operationsHtml, /no_google_calendar_write: true/);
  assert.match(operationsHtml, /dry_run: true/);
});
