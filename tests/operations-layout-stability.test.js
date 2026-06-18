const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Operations shell wraps every module in a stable view frame', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /class="ops-view-frame" data-current-view="\$\{escapeHtml\(currentView\)\}"/);
  assert.match(operations, /\.ops-main \{[\s\S]*?min-height: 100vh;[\s\S]*?width: 100%;/);
  assert.match(operations, /\.ops-view-frame \{[\s\S]*?min-height: calc\(100vh - 59px\);[\s\S]*?width: 100%;/);
  assert.match(operations, /@media \(max-width: 768px\) \{[\s\S]*?\.ops-main \{[\s\S]*?min-height: 100dvh;/);
  assert.match(operations, /@media \(max-width: 768px\) \{[\s\S]*?\.ops-view-frame \{[\s\S]*?min-height: calc\(100dvh - 117px\);/);
});

test('Core panels, lists, empty states, and containers have non-collapsing dimensions', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /\.container \{[\s\S]*?min-width: 0;[\s\S]*?width: 100%;/);
  assert.match(operations, /\.section-nav \{[\s\S]*?min-height: 52px;/);
  assert.match(operations, /\.focus-panel \{[\s\S]*?min-height: 180px;/);
  assert.match(operations, /\.task-list \{[\s\S]*?min-height: 72px;/);
  assert.match(operations, /div\.empty-state \{[\s\S]*?min-height: 180px;[\s\S]*?place-items: center;/);
});

test('Route and module changes fall back to the first allowed module before rendering', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function firstAllowedView\(\)/);
  assert.match(operations, /return MAIN_NAV_ITEMS\.find\(item => viewAllowed\(item\.id\)\)\?\.id \|\| 'tasks';/);
  assert.match(operations, /function ensureCurrentViewAllowed\(\)/);
  assert.match(operations, /if \(!viewAllowed\(currentView\)\) currentView = firstAllowedView\(\);/);
  assert.match(operations, /function render\(errors = \[\]\) \{[\s\S]*?ensureCurrentViewAllowed\(\);/);
  assert.match(operations, /function switchView\(view\) \{[\s\S]*?ensureCurrentViewAllowed\(\);/);
  assert.match(operations, /function openCommandTarget\(view, focus = ''\) \{[\s\S]*?ensureCurrentViewAllowed\(\);/);
  assert.match(operations, /function loadData\(\) \{[\s\S]*?ensureCurrentViewAllowed\(\);/);
});
