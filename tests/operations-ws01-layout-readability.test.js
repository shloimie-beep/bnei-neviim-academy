const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const shellCss = fs.readFileSync('public/css/bna-app-shell.css', 'utf8');

test('WS01 Operations shell CSS loads after inline legacy styles', () => {
  const inlineEnd = operations.indexOf('</style>');
  const shellLink = operations.indexOf('<link rel="stylesheet" href="/css/bna-app-shell.css">');
  assert.ok(inlineEnd > 0, 'Operations inline style block should exist');
  assert.ok(shellLink > inlineEnd, 'shared shell CSS should override inline legacy Operations CSS');
});

test('WS01 modal and form overrides replace legacy dark panels with light readable surfaces', () => {
  assert.match(shellCss, /WS01 Operations readability closeout/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.modal\s*{[\s\S]*background:\s*#ffffff/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.modal-header,[\s\S]*body\.bna-ops-shell-page \.modal-body,[\s\S]*body\.bna-ops-shell-page \.modal-footer\s*{[\s\S]*background:\s*#ffffff/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.form-group input,[\s\S]*body\.bna-ops-shell-page \.form-group select,[\s\S]*body\.bna-ops-shell-page \.form-group textarea,[\s\S]*body\.bna-ops-shell-page \.option-btn\s*{[\s\S]*background:\s*#ffffff/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.modal-body\s*{[\s\S]*overflow-y:\s*auto/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.modal-body\s*{[\s\S]*overscroll-behavior:\s*contain/);
});

test('WS01 action controls and mobile rows are stable and tappable', () => {
  assert.match(shellCss, /body\.bna-ops-shell-page \.task-action,[\s\S]*body\.bna-ops-shell-page \.btn,[\s\S]*body\.bna-ops-shell-page \.modal-footer \.btn,[\s\S]*body\.bna-ops-shell-page \.option-btn\s*{[\s\S]*min-height:\s*40px/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.task-action,[\s\S]*white-space:\s*normal/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.task-action,[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(shellCss, /@media \(max-width:\s*768px\)\s*{[\s\S]*body\.bna-ops-shell-page \.task-row\s*{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.ops-app-shell\.drawer-open \.ops-main,[\s\S]*display:\s*none !important/);
});

test('WS01 prevents page-level horizontal overflow while allowing audit tables to scroll intentionally', () => {
  assert.match(shellCss, /html,[\s\S]*body\.bna-ops-shell-page\s*{[\s\S]*overflow-x:\s*hidden/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.queue-audit-table\s*{[\s\S]*overflow-x:\s*auto/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.task-inline-item,[\s\S]*body\.bna-ops-shell-page \.automation-toolbar,[\s\S]*body\.bna-ops-shell-page \.automation-detail-panel,[\s\S]*body\.bna-ops-shell-page \.queue-audit-table,[\s\S]*body\.bna-ops-shell-page \.queue-audit-row\s*{[\s\S]*background:\s*#ffffff/);
});
