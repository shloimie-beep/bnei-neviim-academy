const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Operations modules are declared in one predictable toolbar order', () => {
  const operations = read('public/operations.html');
  const navBlock = operations.match(/const MAIN_NAV_ITEMS = \[([\s\S]*?)\];/);

  assert.ok(navBlock, 'MAIN_NAV_ITEMS should be declared');
  const block = navBlock[1];
  const orderedIds = ['tasks', 'calendar', 'students', 'content', 'contacts', 'accounting', 'automations', 'integrations'];
  const positions = orderedIds.map((id) => block.indexOf(`id: '${id}'`));

  positions.forEach((position, index) => {
    assert.ok(position >= 0, `${orderedIds[index]} should be present`);
  });
  for (let i = 1; i < positions.length; i += 1) {
    assert.ok(positions[i - 1] < positions[i], `${orderedIds[i - 1]} should come before ${orderedIds[i]}`);
  }
});

test('Operations shell renders one compact horizontal module toolbar', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function renderModuleToolbar\(\)/);
  assert.match(operations, /\$\{renderMobileHeader\(\)\}\s+\$\{renderModuleToolbar\(\)\}/);
  assert.match(operations, /aria-label="Operations module toolbar"/);
  assert.match(operations, /class="ops-module-list"/);
  assert.match(operations, /MAIN_NAV_ITEMS\.filter\(item => viewAllowed\(item\.id\)\)/);
  assert.match(operations, /onclick="switchView\('\$\{item\.id\}'\)"/);
  assert.match(operations, /aria-current="page"/);
  assert.doesNotMatch(operations, /<nav class="ops-sidebar-nav"/);
  assert.match(operations, /aria-label="BNA Operations workspace context"/);
});

test('Module toolbar is responsive and horizontally scrolls instead of wrapping into clutter', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /\.ops-module-toolbar \{/);
  assert.match(operations, /position: sticky;/);
  assert.match(operations, /\.ops-module-list \{[\s\S]*?display: flex;[\s\S]*?overflow-x: auto;/);
  assert.match(operations, /\.ops-module-button \{[\s\S]*?flex: 0 0 auto;[\s\S]*?white-space: nowrap;/);
  assert.match(operations, /@media \(max-width: 768px\) \{[\s\S]*?\.ops-module-toolbar \{[\s\S]*?top: 59px;/);
  assert.match(operations, /@media \(max-width: 768px\) \{[\s\S]*?\.ops-module-button \{[\s\S]*?min-width: 96px;/);
});
