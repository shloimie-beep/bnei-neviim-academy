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

test('server exposes one read-only Operations Assistant status shell', () => {
  const server = read('server.js');

  assert.match(server, /function operationsAssistantStatus\(identity = \{\}, projectKey = ''\)/);
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/status', requireAdmin/);
  assert.match(server, /identity: 'BNA Assistant'/);
  assert.match(server, /visible_label: 'BNA Assistant'/);
  assert.match(server, /preferred_provider: 'openai'/);
  assert.match(server, /duplicate_personas: \[\]/);
  assert.match(server, /disabled_until_verified: \[/);
  assert.match(server, /allowedViews: \['tasks', 'assistant', 'calendar'/);
});

test('Operations renders a single Assistant module without duplicate persona labels', () => {
  const operations = read('public/operations.html');
  const renderBlock = blockBetween(
    operations,
    '        function renderAssistant() {',
    '        function renderAutomations() {',
  );

  assert.match(operations, /getAssistantStatus\(filters = \{\}\)/);
  assert.match(operations, /let assistantStatus = null;/);
  assert.match(operations, /\{ id: 'assistant', label: 'Assistant', marker: 'AI' \}/);
  assert.match(operations, /case 'assistant': content = renderAssistant\(\); break;/);
  assert.match(operations, /viewAllowed\('assistant'\) \? api\.getAssistantStatus\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);

  assert.match(renderBlock, /BNA Assistant/);
  assert.match(renderBlock, /aria-label="BNA Assistant shell"/);
  assert.doesNotMatch(renderBlock, /\bCodex\b/);
  assert.doesNotMatch(renderBlock, /\bKimi\b/);
  assert.doesNotMatch(renderBlock, /OpenAI Telegram sidekick/);
});

test('workspace auth permits only safe Assistant status reads for scoped users', () => {
  const workspaceAuth = read('src/lib/bna/workspace-auth.js');
  const authTest = read('tests/workspace-auth.test.js');

  assert.ok(workspaceAuth.includes("{ method: 'GET', pattern: /^\\/api\\/bna\\/assistant\\/status$/ }"));
  assert.match(authTest, /path: '\/api\/bna\/assistant\/status', method: 'GET' \}\), true/);
  assert.match(authTest, /path: '\/api\/bna\/assistant\/status', method: 'POST' \}\), false/);
});
