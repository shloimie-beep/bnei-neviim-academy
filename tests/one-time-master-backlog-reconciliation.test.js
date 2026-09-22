const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const jsonPath = path.join(repoRoot, 'ops/one-time-mishnah/master-backlog-reconciliation.json');
const mdPath = path.join(repoRoot, 'ops/one-time-mishnah/master-backlog-reconciliation.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

test('master backlog reconciliation targets the current One Time run without visible task fan-out', () => {
  const doc = readJson(jsonPath);

  assert.equal(doc.active_run_id, '2026-06-21-one-time-master-completion');
  assert.equal(doc.workspace_key, 'rabbi_sheller_provider');
  assert.equal(doc.project_key, 'one_time_mishnah_class');
  assert.equal(doc.canonical_public_provider_name, 'Rabbi Ellie Scheller');
  assert.equal(doc.visible_task_changes.visible_tasks_created, 0);
  assert.equal(doc.visible_task_changes.visible_decisions_created, 0);
  assert.equal(doc.meeting_reconciliation.external_write_performed, false);
  assert.equal(doc.meeting_reconciliation.production_mutation_performed, false);
  assert.equal(doc.meeting_reconciliation.new_visible_records_created, 0);
  assert.ok(doc.legacy_reconciliation.legacy_statement_rows_preserved >= 1000);

  const markdown = fs.readFileSync(mdPath, 'utf8');
  assert.match(markdown, /Current Batch 2 Reconciliation/);
  assert.match(markdown, /No Visible Tasks Created/);
  assert.match(markdown, /Rabbi Ellie Scheller/);
});

test('source statement classifications stay within the approved reconciliation vocabulary', () => {
  const doc = readJson(jsonPath);
  const allowed = new Set([
    'already_satisfied',
    'duplicate',
    'partially_implemented',
    'missing',
    'blocked',
    'needs_operator_decision',
    'supersedes_existing',
    'unrelated_bna_data'
  ]);

  assert.ok(doc.source_statement_matrix.length >= 80);
  assert.ok(doc.legacy_statement_matrix.length >= 1000);

  for (const row of doc.source_statement_matrix) {
    assert.equal(allowed.has(row.classification), true, `unexpected classification ${row.classification}`);
    assert.ok(row.statement_id);
    assert.ok(row.source_statement);
    assert.ok(row.requirement_id);
  }

  for (const row of doc.legacy_statement_matrix.slice(0, 100)) {
    assert.equal(allowed.has(row.current_classification), true, `unexpected legacy classification ${row.current_classification}`);
    assert.ok(row.current_requirement_id);
  }

  assert.equal(doc.source_statement_classification_counts.already_satisfied > 0, true);
  assert.equal(doc.source_statement_classification_counts.duplicate > 0, true);
  assert.equal(doc.source_statement_classification_counts.needs_operator_decision > 0, true);
  assert.equal(doc.source_statement_classification_counts.unrelated_bna_data > 0, true);
});

test('canonical executable requirements include ownership, source, verification, and deployment data', () => {
  const doc = readJson(jsonPath);
  const byId = new Map(doc.canonical_executable_requirements.map((requirement) => [requirement.id, requirement]));
  const requiredIds = [
    'REQ-20260621-501',
    'REQ-20260619-302',
    'REQ-20260619-303',
    'REQ-20260621-502',
    'REQ-20260621-503',
    'REQ-20260621-504',
    'REQ-20260619-314'
  ];

  for (const id of requiredIds) {
    assert.ok(byId.has(id), `missing ${id}`);
  }

  for (const requirement of doc.canonical_executable_requirements) {
    assert.ok(requirement.owner, `${requirement.id} owner`);
    assert.equal(requirement.workspace, 'rabbi_sheller_provider');
    assert.equal(requirement.project, 'one_time_mishnah_class');
    assert.ok(requirement.category, `${requirement.id} category`);
    assert.ok(requirement.priority, `${requirement.id} priority`);
    assert.ok(Array.isArray(requirement.dependency), `${requirement.id} dependency`);
    assert.ok(requirement.related_files_routes.length > 0, `${requirement.id} related_files_routes`);
    assert.ok(requirement.source_reference.source_id, `${requirement.id} source_id`);
    assert.ok(requirement.source_reference.source_path, `${requirement.id} source_path`);
    assert.ok(requirement.acceptance_criteria.length > 0, `${requirement.id} acceptance_criteria`);
    assert.ok(requirement.verification.length > 0, `${requirement.id} verification`);
    assert.equal(typeof requirement.deployment_required, 'boolean', `${requirement.id} deployment_required`);
    assert.ok(requirement.deployment_requirement, `${requirement.id} deployment_requirement`);
  }
});

test('operator decisions are consolidated instead of repeated as dozens of visible cards', () => {
  const doc = readJson(jsonPath);

  assert.ok(doc.remaining_operator_decisions.length > 0);
  assert.ok(doc.remaining_operator_decisions.length <= 8);
  assert.ok(doc.remaining_operator_decisions.some((decision) => decision.id === 'DEC-RESEND-SENDER-DOMAIN-IDENTITY'));
  assert.ok(doc.remaining_operator_decisions.some((decision) => decision.id === 'DEC-VIMEO-USER-TOKEN-UPLOAD-AUTHORITY'));
  assert.ok(doc.remaining_operator_decisions.some((decision) => decision.id === 'DEC-ZOOM-LIVE-MEETING-SMOKE'));

  const serialized = JSON.stringify(doc);
  assert.doesNotMatch(serialized, /secret_value/i);
  assert.doesNotMatch(serialized, /raw_private_text/i);
});
