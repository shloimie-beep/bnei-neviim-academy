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

test('Assistant action execution is guarded until confirmation and audit logs exist', () => {
  const server = read('server.js');

  assert.match(server, /app\.post\('\/api\/bna\/assistant\/actions\/:actionKey', requireAdmin/);
  assert.match(server, /Assistant action execution requires REQ-20260618-160 confirmation tiers and action audit logs before mutations run/);
  assert.match(server, /assistantActionPermitted\(action, req\.opsIdentity \|\| \{\}\)/);
  assert.match(server, /audit_required: action\.audit_required/);
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
