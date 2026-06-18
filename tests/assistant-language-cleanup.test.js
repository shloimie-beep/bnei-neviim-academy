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

test('Operations Assistant visible copy avoids duplicate helper and provider personas', () => {
  const operations = read('public/operations.html');
  const renderBlock = blockBetween(
    operations,
    '        function renderAssistant() {',
    '        function renderAutomations() {',
  );

  assert.match(renderBlock, /BNA Assistant/);
  assert.match(renderBlock, /One assistant identity/);
  assert.match(renderBlock, /Needs AI setup/);
  assert.match(renderBlock, /Assistant actions[\s\S]*audited/);
  assert.doesNotMatch(renderBlock, /No duplicate helper personas/);
  assert.doesNotMatch(renderBlock, /single visible helper/);
  assert.doesNotMatch(renderBlock, /Awaiting OpenAI key/);
  assert.doesNotMatch(renderBlock, /\bCodex\b/);
  assert.doesNotMatch(renderBlock, /\bKimi\b/);
  assert.doesNotMatch(renderBlock, /OpenAI Telegram sidekick/);
});

test('Operations routing labels use product language while preserving machine owner values', () => {
  const server = read('server.js');
  const operations = read('public/operations.html');

  assert.match(server, /Option B: Send to System Work/);
  assert.match(server, /label: 'Send to System Work'/);
  assert.match(server, /assigned_to: 'Codex'/);
  assert.match(operations, /\{ value: 'Codex', label: 'System Work' \}/);
  assert.match(operations, /Keep system work on the shared task and changelog ledger/);
  assert.doesNotMatch(server, /label: 'Send to Codex'/);
  assert.doesNotMatch(operations, /\{ value: 'Codex', label: 'Codex' \}/);
});
