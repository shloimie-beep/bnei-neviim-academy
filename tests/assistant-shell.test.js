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

test('server scopes assistant memory by user role workspace module and subject', () => {
  const server = read('server.js');

  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_assistant_memory/);
  assert.match(server, /workspace_id INTEGER REFERENCES bna_workspaces\(id\) ON DELETE SET NULL/);
  assert.match(server, /project_id INTEGER REFERENCES bna_projects\(id\) ON DELETE SET NULL/);
  assert.match(server, /user_key TEXT NOT NULL/);
  assert.match(server, /user_role TEXT NOT NULL DEFAULT 'workspace_member'/);
  assert.match(server, /module_key TEXT NOT NULL DEFAULT 'assistant'/);
  assert.match(server, /subject_type TEXT NOT NULL DEFAULT 'workspace'/);
  assert.match(server, /UNIQUE \(workspace_id, project_id, user_key, user_role, surface, module_key, subject_type, subject_id, memory_key\)/);
  assert.match(server, /async function resolveAssistantMemoryScope\(req, input = \{\}, db = pool\)/);
  assert.match(server, /assertProjectAccess\(req, project\)/);
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/memory', requireAdmin/);
  assert.match(server, /AND user_key = \$3[\s\S]*AND user_role = \$4[\s\S]*AND surface = \$5[\s\S]*AND module_key = \$6[\s\S]*AND subject_type = \$7[\s\S]*AND subject_id = \$8/);
});

test('Operations renders a single Assistant module without duplicate persona labels', () => {
  const operations = read('public/operations.html');
  const renderBlock = blockBetween(
    operations,
    '        function renderAssistant() {',
    '        function renderAutomations() {',
  );

  assert.match(operations, /getAssistantStatus\(filters = \{\}\)/);
  assert.match(operations, /getAssistantMemory\(filters = \{\}\)/);
  assert.match(operations, /let assistantStatus = null;/);
  assert.match(operations, /let assistantMemory = null;/);
  assert.match(operations, /\{ id: 'assistant', label: 'Assistant', marker: 'AI' \}/);
  assert.match(operations, /case 'assistant': content = renderAssistant\(\); break;/);
  assert.match(operations, /viewAllowed\('assistant'\) \? api\.getAssistantStatus\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\)/);
  assert.match(operations, /viewAllowed\('assistant'\) \? api\.getAssistantMemory\(\{ project: selectedProjectFilter\(\) \|\| undefined, module: 'assistant', subject_type: 'workspace' \}\)/);

  assert.match(renderBlock, /BNA Assistant/);
  assert.match(renderBlock, /aria-label="BNA Assistant shell"/);
  assert.match(renderBlock, /Memory Scope/);
  assert.match(renderBlock, /memoryScope\.user_key/);
  assert.doesNotMatch(renderBlock, /\bCodex\b/);
  assert.doesNotMatch(renderBlock, /\bKimi\b/);
  assert.doesNotMatch(renderBlock, /OpenAI Telegram sidekick/);
});

test('workspace auth permits only safe Assistant status reads for scoped users', () => {
  const workspaceAuth = read('src/lib/bna/workspace-auth.js');
  const authTest = read('tests/workspace-auth.test.js');

  assert.ok(workspaceAuth.includes("{ method: 'GET', pattern: /^\\/api\\/bna\\/assistant\\/status$/ }"));
  assert.ok(workspaceAuth.includes("{ method: 'GET', pattern: /^\\/api\\/bna\\/assistant\\/memory$/ }"));
  assert.match(authTest, /path: '\/api\/bna\/assistant\/status', method: 'GET' \}\), true/);
  assert.match(authTest, /path: '\/api\/bna\/assistant\/memory', method: 'GET' \}\), true/);
  assert.match(authTest, /path: '\/api\/bna\/assistant\/status', method: 'POST' \}\), false/);
  assert.match(authTest, /path: '\/api\/bna\/assistant\/memory', method: 'POST' \}\), false/);
});
