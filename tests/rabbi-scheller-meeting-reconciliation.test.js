const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

test('Rabbi Scheller meeting reconciliation is redacted, scoped, and idempotent', () => {
  const reconciliation = readJson(
    'ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.json'
  );
  assert.equal(reconciliation.workspace_key, 'rabbi_sheller_provider');
  assert.equal(reconciliation.project_key, 'one_time_mishnah_class');
  assert.equal(reconciliation.external_write_performed, false);
  assert.equal(reconciliation.production_mutation_performed, false);
  assert.equal(reconciliation.raw_private_text_committed, false);
  assert.equal(reconciliation.new_visible_records_created, 0);
  assert.equal(reconciliation.new_task_rows_inserted, 0);
  assert.equal(reconciliation.newest_candidate.drive_file_id, '1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI');
  assert.equal(reconciliation.newest_candidate.status, 'already_parsed');
  assert.equal(reconciliation.proposed_item_counts_from_prior_parse.total, 64);
  assert.equal(reconciliation.classification_counts.source_candidates.already_satisfied, 1);
  assert.equal(reconciliation.classification_counts.proposed_records.already_satisfied_by_existing_parse, 64);
  assert.equal(reconciliation.routing_acceptance.no_bna_school_tasks_into_one_time, true);

  const serialized = JSON.stringify(reconciliation);
  assert.doesNotMatch(serialized, /"raw_text"\s*:/i);
  assert.doesNotMatch(serialized, /"transcript"\s*:/i);
  assert.doesNotMatch(serialized, /"secret_value"|"password"|"client_secret"|"access_token"/i);
});

test('future One Time master backlog input exists without claiming implementation', () => {
  const backlogPath = path.join(repoRoot, 'ops/one-time-mishnah/next-master-backlog-input.md');
  const backlog = fs.readFileSync(backlogPath, 'utf8');
  assert.match(backlog, /not implementation evidence/i);
  assert.match(backlog, /Workspace: `rabbi_sheller_provider`/);
  assert.match(backlog, /Project: `one_time_mishnah_class`/);
  assert.match(backlog, /reconciliation before implementation/i);
  assert.match(backlog, /Do not send email, create Zoom meetings, upload Vimeo videos, mutate DNS, charge cards/i);
});
