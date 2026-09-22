const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  HELPER_SURFACES,
  buildConversationLibrary,
  buildIssue24HelperAudit,
  evaluateConversationLibrary,
  portalRoleKeys,
} = require('../src/lib/bna/issue24-helper-audit');

const root = path.resolve(__dirname, '..');

test('Issue #24 helper audit inventories every requested helper surface', () => {
  const keys = new Set(HELPER_SURFACES.map((surface) => surface.key));
  for (const key of [
    'public_visitor',
    'operations_super_admin',
    'rabbi_provider_admin',
    'provider_participant_staff',
    'parent_qa_identity',
    'student_qa_identity',
    'one_time_member',
    'one_time_classroom',
    'telegram_adapters',
  ]) {
    assert.ok(keys.has(key), `${key} should be inventoried`);
  }
  for (const surface of HELPER_SURFACES) {
    assert.ok(surface.endpoint, `${surface.key} endpoint`);
    assert.ok(surface.model_provider, `${surface.key} provider`);
    assert.ok(surface.identity_resolution, `${surface.key} identity`);
    assert.ok(surface.workspace_resolution, `${surface.key} workspace`);
    assert.ok(surface.permission_check, `${surface.key} permission`);
    assert.ok(surface.audit_event, `${surface.key} audit`);
    assert.ok(surface.result_drop_off, `${surface.key} result drop-off`);
  }
});

test('Issue #24 conversation library meets requested per-role counts', () => {
  const library = buildConversationLibrary();
  assert.deepEqual(library.roles, portalRoleKeys());
  for (const role of library.roles) {
    assert.equal(library.single_turn_per_role[role], 25, `${role} should have 25 single-turn cases`);
    assert.equal(library.multi_turn_per_role[role], 10, `${role} should have 10 multi-turn cases`);
  }
  assert.equal(library.cases.length, library.roles.length * 25);
  assert.equal(library.multi_turn.length, library.roles.length * 10);
});

test('Issue #24 helper audit routes conversation links through canonical resolver metadata', () => {
  const audit = buildIssue24HelperAudit();
  const evaluation = evaluateConversationLibrary(audit.conversation_library);
  assert.equal(evaluation.needs_repair.length, 0);
  assert.equal(evaluation.passed_static_resolver, evaluation.total);
  const operationsCase = evaluation.evaluated.find((item) => item.role_key === 'operations_super_admin');
  assert.equal(operationsCase.resolver.route_key, 'operations');
  assert.equal(operationsCase.resolver.canonical_path, '/operations');
  assert.equal(operationsCase.resolver.authorization_result, 'allowed');
  assert.ok(operationsCase.resolver.expected_page_landmark);
});

test('Issue #24 helper audit generator writes durable JSON and Markdown evidence', () => {
  const outDir = path.join('ops', 'helper-audits', 'test-issue-24-helper-audit');
  childProcess.execFileSync(
    process.execPath,
    ['scripts/audit-issue-24-helper-surfaces.cjs', '--out-dir', outDir],
    { cwd: root, stdio: 'pipe' }
  );
  const jsonPath = path.join(root, outDir, 'HELPER-SURFACE-AUDIT.json');
  const mdPath = path.join(root, outDir, 'HELPER-SURFACE-AUDIT.md');
  const audit = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const report = fs.readFileSync(mdPath, 'utf8');
  assert.equal(audit.audit_id, 'REQ-20260625-027');
  assert.match(report, /Surface Inventory/);
  assert.match(report, /Live Agent Mode\/browser evidence required: yes/);
});
