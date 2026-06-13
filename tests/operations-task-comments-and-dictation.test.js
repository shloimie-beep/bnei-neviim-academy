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
  assert.match(operationsHtml, /requeue: true/);
  assert.match(operationsHtml, /\.\.\.\(saved\?\.task \|\| \{\}\)/);
  assert.match(operationsHtml, /expandedTaskComments = \{[\s\S]*\.\.\.expandedTaskComments[\s\S]*\[id\]: comments/);
});

test('Human task comments requeue work and refresh the visible card', () => {
  assert.match(server, /function shouldRequeueTaskAfterHumanComment/);
  assert.match(server, /function isTaskCommentRequeueOptOut/);
  assert.match(server, /\['dashboard', 'telegram', 'api'\]\.includes\(normalizedSource\)/);
  assert.match(server, /source = 'dashboard'/);
  assert.match(server, /stage = 'assigned'[\s\S]*assigned_to = 'Codex'[\s\S]*decision_required = FALSE/);
  assert.match(server, /started_at = NULL[\s\S]*completed_at = NULL[\s\S]*verified_at = NULL/);
  assert.match(server, /res\.json\(\{ success: true, comment: result\.rows\[0\], requeued: Boolean\(task\), task \}\)/);
  assert.match(operationsHtml, /Add Comment &amp; Requeue/);
  assert.match(operationsHtml, /source: 'dashboard',[\s\S]*requeue: true/);
  assert.match(operationsHtml, /\.\.\.\(saved\?\.task \|\| \{\}\)/);
});

test('Comment requeue gate distinguishes human comments, explicit opt-outs, and agent comments', () => {
  const shouldRequeue = loadCommentRequeueHelper();

  assert.equal(shouldRequeue({ source: 'dashboard', author: 'dashboard' }), true);
  assert.equal(shouldRequeue({ source: 'telegram', author: 'Shloimie' }), true);
  assert.equal(shouldRequeue({ source: 'api', author: 'operator' }), true);

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

test('Operations moves resolved decision cards out of Decisions into Done or Changelog', () => {
  assert.match(operationsHtml, /\{ id: 'done', label: 'Done' \}/);
  assert.match(operationsHtml, /done: \[\]/);
  assert.match(operationsHtml, /done: buckets\.done/);
  assert.match(operationsHtml, /Decision handled/);
  assert.match(operationsHtml, /function decisionPatchRoutesToWork/);
  assert.match(operationsHtml, /stage: 'done'[\s\S]*completed_at: now[\s\S]*verified_at: now/);
  assert.match(operationsHtml, /if \(\(task\.completed_at \|\| task\.verified_at \|\| stage === 'done'\) && !isMachine\) return 'done';/);
  assert.match(operationsHtml, /if \(\['assigned', 'in_progress'\]\.includes\(stage\)\) return true;/);
});
