const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function blockBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `Missing start marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test('server exposes a permissioned Assistant action registry', () => {
  const server = read('server.js');

  assert.match(server, /const ASSISTANT_ACTION_REGISTRY = Object\.freeze\(\[/);
  assert.match(server, /action_key: 'calendar\.read_context'/);
  assert.match(server, /action_key: 'tasks\.create_task'/);
  assert.match(server, /action_key: 'content\.publish_buffer_post'/);
  assert.match(server, /action_key: 'accounting\.log_payment'/);
  assert.match(server, /confirmation_token: 'LOG_PAYMENT'/);
  assert.match(server, /confirmation_token: 'REPROCESS_GREEN_INVOICE'/);
  assert.match(server, /function assistantActionPermitted\(action, identity = \{\}\)/);
  assert.match(server, /allowedViews\.has\(action\.required_view\)/);
  assert.match(server, /function assistantActionsForIdentity\(identity = \{\}, projectKey = ''\)/);
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/actions', requireAdmin/);
});

test('Assistant action execution uses confirmation tiers and audit logs', () => {
  const server = read('server.js');

  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_action_audit/);
  assert.match(server, /requester_key TEXT NOT NULL/);
  assert.match(server, /workspace_id INTEGER REFERENCES bna_workspaces\(id\) ON DELETE SET NULL/);
  assert.match(server, /action_key TEXT NOT NULL/);
  assert.match(server, /before_summary TEXT/);
  assert.match(server, /after_summary TEXT/);
  assert.match(server, /result TEXT NOT NULL DEFAULT 'requested'/);
  assert.match(server, /const ASSISTANT_CONFIRMATION_TIERS = Object\.freeze/);
  assert.match(server, /financial: \{ tier: 'financial', token: null \}/);
  assert.match(server, /function assertAssistantActionConfirmation\(action = \{\}, confirmValue = ''\)/);
  assert.match(server, /Assistant action requires confirm: \$\{token\}/);
  assert.match(server, /async function writeAssistantActionAudit\(entry = \{\}, db = pool\)/);
  assert.match(server, /app\.post\('\/api\/bna\/assistant\/actions\/:actionKey', requireAdmin/);
  assert.match(server, /assistantActionPermitted\(action, req\.opsIdentity \|\| \{\}\)/);
  assert.match(server, /result: 'confirmation_required'/);
  assert.match(server, /result: 'executed'/);
  assert.match(server, /result: 'failed'/);
  assert.match(server, /audit_required: action\.audit_required/);
});

test('Assistant audited execution is limited to explicit registered handlers', () => {
  const server = read('server.js');

  assert.match(server, /async function executeAssistantRegisteredAction\(\{ action, req, scope, body = \{\} \}\)/);
  assert.match(server, /if \(String\(action\.method \|\| 'GET'\)\.toUpperCase\(\) === 'GET'\)/);
  assert.match(server, /if \(action\.action_key === 'tasks\.create_task'\)/);
  assert.match(server, /await createTaskFromText\(\{/);
  assert.match(server, /parser: 'assistant-action-v1'/);
  assert.match(server, /if \(action\.action_key === 'tasks\.add_comment'\)/);
  assert.match(server, /INSERT INTO bna_task_comments \(workspace_id, task_id, author, body, visibility, source, source_context\)/);
  assert.match(server, /Assistant action execution is not implemented for this registered action yet/);
});

test('Operations Assistant loads and renders the action registry without execution buttons', () => {
  const operations = read('public/operations.html');
  const renderBlock = blockBetween(
    operations,
    '        function renderAssistant() {',
    '        function renderAutomations() {',
  );

  assert.match(operations, /getAssistantActions\(filters = \{\}\)/);
  assert.match(operations, /let assistantActions = null;/);
  assert.match(operations, /viewAllowed\('assistant'\) \? api\.getAssistantActions\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(renderBlock, /Action Registry/);
  assert.match(renderBlock, /actionPreview = actions\.slice\(0, 8\)/);
  assert.match(renderBlock, /item\.enabled \? 'ready' : 'gated'/);
  assert.doesNotMatch(renderBlock, /api\.executeAssistantAction/);
  assert.doesNotMatch(renderBlock, /assistant-actions-run/);
});

test('workspace auth permits only safe Assistant action registry reads for scoped users', () => {
  const workspaceAuth = read('src/lib/bna/workspace-auth.js');
  const authTest = read('tests/workspace-auth.test.js');

  assert.ok(workspaceAuth.includes("{ method: 'GET', pattern: /^\\/api\\/bna\\/assistant\\/actions$/ }"));
  assert.match(authTest, /path: '\/api\/bna\/assistant\/actions', method: 'GET' \}\), true/);
  assert.match(authTest, /path: '\/api\/bna\/assistant\/actions', method: 'POST' \}\), false/);
});
