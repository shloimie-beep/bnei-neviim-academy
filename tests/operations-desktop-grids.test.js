const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function cssBlock(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped} \\{([\\s\\S]*?)\\n        \\}`));
  assert.ok(match, `${selector} block should exist`);
  return match[1];
}

test('Operations dashboard and pipeline desktop grids auto-fit instead of fixed six-column layouts', () => {
  const operations = read('public/operations.html');
  const commandGrid = cssBlock(operations, '.ops-command-grid');
  const pipelineBoard = cssBlock(operations, '.pipeline-board');

  assert.match(commandGrid, /grid-template-columns: repeat\(auto-fit, minmax\(180px, 1fr\)\);[\s\S]*?align-items: stretch;/);
  assert.match(pipelineBoard, /grid-template-columns: repeat\(auto-fit, minmax\(240px, 1fr\)\);[\s\S]*?overflow-x: visible;/);
  assert.match(operations, /@media \(max-width: 1200px\) \{[\s\S]*?\.pipeline-board \{[\s\S]*?grid-template-columns: repeat\(auto-fit, minmax\(220px, 1fr\)\);/);
  assert.doesNotMatch(commandGrid, /repeat\(6,/);
  assert.doesNotMatch(pipelineBoard, /repeat\(6,/);
});

test('Operations task desktop grid avoids uneven fractional dead space', () => {
  const operations = read('public/operations.html');
  const overviewStrip = cssBlock(operations, '.task-overview-strip');

  assert.match(overviewStrip, /grid-template-columns: repeat\(auto-fit, minmax\(170px, 1fr\)\);/);
  assert.doesNotMatch(overviewStrip, /1\.35fr[\s\S]*?0\.65fr/);
  assert.doesNotMatch(operations, /\.agent-status-panel/);
});

test('Operations repeated desktop card grids use stable readable minimum widths', () => {
  const operations = read('public/operations.html');

  assert.match(cssBlock(operations, '.section-kpis'), /grid-template-columns: repeat\(auto-fit, minmax\(180px, 1fr\)\);/);
  assert.match(cssBlock(operations, '.student-profile-kpis'), /grid-template-columns: repeat\(auto-fit, minmax\(150px, 1fr\)\);/);
  assert.match(cssBlock(operations, '.content-section-grid'), /grid-template-columns: repeat\(2, minmax\(260px, 1fr\)\);/);
  assert.match(cssBlock(operations, '.student-profile-grid'), /grid-template-columns: repeat\(2, minmax\(260px, 1fr\)\);/);
});
