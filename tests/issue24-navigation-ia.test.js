const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  PORTAL_NAVIGATION_INVENTORY,
  buildNavigationIaAudit,
  operationsNavigationInventory,
} = require('../src/lib/bna/issue24-navigation-ia');

const root = path.resolve(__dirname, '..');

test('Issue #24 navigation inventory covers required portal surfaces', () => {
  const surfaces = new Set(PORTAL_NAVIGATION_INVENTORY.map((item) => item.surface));
  for (const surface of ['public', 'operations', 'provider', 'parent', 'student', 'one_time_member', 'one_time_classroom']) {
    assert.ok(surfaces.has(surface), `${surface} should be inventoried`);
  }
});

test('Operations task tabs use child-lane wording rather than repeating major modules', () => {
  const operations = operationsNavigationInventory(root);
  const taskLabels = operations.horizontal_tabs.tasks.map((item) => item.label);
  const sideLabels = operations.main_nav.map((item) => item.label);
  assert.ok(sideLabels.includes('Calendar'));
  assert.ok(sideLabels.includes('Agents'));
  assert.ok(taskLabels.includes('Schedule'));
  assert.ok(taskLabels.includes('Codex Queue'));
  assert.equal(taskLabels.includes('Calendar'), false);
  assert.equal(taskLabels.includes('Codex / Agent Work'), false);
});

test('Issue #24 navigation IA watchdog finds no prohibited duplicate controls', () => {
  const audit = buildNavigationIaAudit({ root });
  assert.equal(audit.ok, true, JSON.stringify(audit.findings, null, 2));
  assert.deepEqual(audit.findings, []);
  assert.match(audit.permanent_rule, /Side navigation owns major modules/);
  assert.ok(audit.fixes_implemented.some((item) => /Calendar to Schedule/.test(item)));
});

test('Issue #24 navigation watchdog writes durable evidence', () => {
  const outDir = path.join('ops', 'navigation-ia', 'test-issue-24-navigation-ia');
  childProcess.execFileSync(
    process.execPath,
    ['scripts/watchdog-navigation-ia-duplicates.cjs', '--out-dir', outDir],
    { cwd: root, stdio: 'pipe' }
  );
  const jsonPath = path.join(root, outDir, 'NAVIGATION-IA-AUDIT.json');
  const mdPath = path.join(root, outDir, 'NAVIGATION-IA-AUDIT.md');
  const audit = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const report = fs.readFileSync(mdPath, 'utf8');
  assert.equal(audit.audit_id, 'REQ-20260625-029');
  assert.equal(audit.ok, true);
  assert.match(report, /Fixes Implemented/);
});
