const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Operations mobile controls use touch-safe target sizing', () => {
  const operations = read('public/operations.html');
  const mobileBlock = operations.match(/\/\* Mobile control safety primitives \*\/([\s\S]*?)@media \(max-width: 460px\)/);

  assert.ok(mobileBlock, 'mobile touch target block should exist');
  for (const selector of [
    '.btn',
    '.task-action',
    '.filter-chip',
    '.section-tab',
    '.ops-module-button',
    '.ops-command-action',
    '.task-filter',
    '.task-reset-button',
    '.modal-close'
  ]) {
    assert.match(mobileBlock[0], new RegExp(selector.replace('.', '\\.')), `${selector} should be touch-sized on mobile`);
  }
  assert.match(mobileBlock[0], /min-height: 44px;/);
  assert.match(mobileBlock[0], /touch-action: manipulation;/);
});

test('Operations dense mobile controls scroll horizontally instead of squeezing', () => {
  const operations = read('public/operations.html');
  const mobileBlock = operations.match(/\/\* Mobile control safety primitives \*\/([\s\S]*?)@media \(max-width: 460px\)/);

  assert.ok(mobileBlock, 'mobile scroll block should exist');
  assert.match(mobileBlock[1], /\.section-tab-list \{[\s\S]*?display: flex;[\s\S]*?overflow-x: auto;[\s\S]*?scroll-snap-type: x proximity;/);
  assert.match(mobileBlock[1], /\.task-actions \{[\s\S]*?flex-wrap: nowrap;[\s\S]*?overflow-x: auto;/);
  assert.match(mobileBlock[1], /\.task-row-actions \{[\s\S]*?flex-direction: row;[\s\S]*?overflow-x: auto;/);
  assert.match(mobileBlock[1], /\.content-card-tools,[\s\S]*?\.contact-action-row \{[\s\S]*?flex-wrap: nowrap;[\s\S]*?overflow-x: auto;/);
  assert.match(mobileBlock[1], /overscroll-behavior-x: contain;/);
  assert.match(mobileBlock[1], /-webkit-overflow-scrolling: touch;/);
});

test('Operations mobile modal actions stay reachable on small screens', () => {
  const operations = read('public/operations.html');
  const mobileBlock = operations.match(/\/\* Mobile control safety primitives \*\/([\s\S]*?)@media \(max-width: 460px\)/);
  const smallBlock = operations.match(/\/\* Mobile control safety primitives \*\/[\s\S]*?@media \(max-width: 460px\) \{([\s\S]*?)\n        \}/);

  assert.ok(mobileBlock, 'mobile modal block should exist');
  assert.ok(smallBlock, 'small mobile modal block should exist');
  assert.match(mobileBlock[1], /\.modal-footer \{[\s\S]*?background: var\(--ops-surface\);[\s\S]*?bottom: 0;[\s\S]*?position: sticky;/);
  assert.match(smallBlock[1], /\.modal-footer \{[\s\S]*?flex-direction: column;/);
  assert.match(smallBlock[1], /\.modal-footer \.btn \{[\s\S]*?width: 100%;/);
});
