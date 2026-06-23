const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('Torah Research category is allowed by backend task category checks', () => {
  const server = read('server.js');

  assert.match(server, /'torah_research'/);
  assert.match(server, /category TEXT NOT NULL DEFAULT 'operations' CHECK \(category IN \([^)]*'torah_research'/s);
  assert.match(server, /ADD CONSTRAINT bna_tasks_category_check\s+CHECK \(category IN \([^)]*'torah_research'/s);
});

test('Operations task UI exposes Torah Research as a filter/category option', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /badge-category-torah_research/);
  assert.match(operations, /\{ id: 'torah_research', label: 'Torah Research'/);
});

test('mixed recording parser routes halacha lookup questions into Torah Research tasks', () => {
  const server = read('server.js');

  assert.match(server, /category "torah_research" and assigned_to "Codex"/);
  assert.match(server, /fasting on Shabbos/);
  assert.match(server, /Student philosophy, hashkafa, discussion, or curiosity questions/);
  assert.match(server, /direct Sefaria links/);
});

test('Torah Research task notes and agent prompt require Sefaria source links', () => {
  const server = read('server.js');
  const supervisor = read('scripts/agent-fleet-supervisor.mjs');

  assert.match(server, /Start with Sefaria search: \$\{sefariaSearchUrl/);
  assert.match(server, /Include direct Sefaria links to every source used/);
  assert.match(supervisor, /Torah Research instructions:/);
  assert.match(supervisor, /include direct Sefaria links for every cited source/);
  assert.match(supervisor, /Distinguish source research from final psak/);
});
