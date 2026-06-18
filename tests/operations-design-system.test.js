const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Operations stylesheet declares shared semantic design tokens', () => {
  const operations = read('public/operations.html');

  for (const token of [
    '--ops-bg',
    '--ops-surface',
    '--ops-surface-raised',
    '--ops-surface-parchment',
    '--ops-border',
    '--ops-text',
    '--ops-text-muted',
    '--ops-text-subtle',
    '--ops-gold',
    '--ops-focus',
    '--ops-radius-card',
    '--ops-radius-control',
    '--ops-space-4',
    '--ops-shadow-panel'
  ]) {
    assert.match(operations, new RegExp(`${token}:`), `${token} should be present`);
  }
});

test('Operations cards and panels share the high-contrast surface primitive', () => {
  const operations = read('public/operations.html');
  const primitiveBlock = operations.match(/\/\* Shared Operations design primitives \*\/([\s\S]*?)button:focus-visible/);

  assert.ok(primitiveBlock, 'shared primitive block should exist');
  for (const selector of [
    '.focus-panel',
    '.task-row',
    '.contact-card',
    '.content-library-card',
    '.prompt-card',
    '.event-card',
    '.student-card',
    '.kpi-card'
  ]) {
    assert.match(primitiveBlock[1], new RegExp(selector.replace('.', '\\.')), `${selector} should use shared surface`);
  }
  assert.match(primitiveBlock[1], /background: var\(--ops-surface\);/);
  assert.match(primitiveBlock[1], /border-color: var\(--ops-border\);/);
  assert.match(primitiveBlock[1], /border-radius: var\(--ops-radius-card\);/);
  assert.match(primitiveBlock[1], /color: var\(--ops-text-muted\);/);
});

test('Operations controls share button radius, focus, and gold primary treatment', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /\.btn,[\s\S]*?\.task-action,[\s\S]*?\.filter-chip,[\s\S]*?\.section-tab,[\s\S]*?\.ops-module-button,[\s\S]*?\.metric-button \{[\s\S]*?border-radius: var\(--ops-radius-control\);[\s\S]*?min-height: 36px;/);
  assert.match(operations, /\.btn-primary,[\s\S]*?\.task-action\.primary,[\s\S]*?\.ops-command-action,[\s\S]*?background: var\(--ops-gold\);/);
  assert.match(operations, /button:focus-visible,[\s\S]*?outline: 3px solid var\(--ops-focus\);[\s\S]*?outline-offset: 2px;/);
});

test('Operations app type system prevents negative letter-spacing drift', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /\.ops-app-shell,[\s\S]*?\.ops-app-shell \* \{[\s\S]*?letter-spacing: 0;/);
});
