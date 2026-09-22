const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

function tmpFixtureDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bna-onetime-ui-review-'));
}

test('One Time UI review seed dry-run writes TEST-scoped reversible artifacts', () => {
  const outDir = tmpFixtureDir();
  const reportPath = path.join(outDir, 'seed-report.json');
  const output = execFileSync('node', [
    'scripts/seed-one-time-ui-review-data.mjs',
    '--json',
    '--write-report',
    '--out-dir',
    outDir,
    '--report',
    reportPath,
    '--generated-at',
    '2026-07-02T00:00:00.000Z',
  ], { cwd: process.cwd(), encoding: 'utf8' });

  const report = JSON.parse(output);
  const reportFile = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const sql = fs.readFileSync(path.join(outDir, 'seed-ui-review-data.sql'), 'utf8');
  const cleanup = fs.readFileSync(path.join(outDir, 'cleanup-ui-review-data.sql'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(outDir, 'ui-review-fixtures.json'), 'utf8'));

  assert.equal(report.ok, true);
  assert.equal(report.mode, 'dry_run');
  assert.equal(report.mutation_performed, false);
  assert.equal(report.external_writes_performed, false);
  assert.equal(reportFile.files.sql_path.endsWith('seed-ui-review-data.sql'), true);
  assert.equal(manifest.workspace_key, 'rabbi_sheller_provider');
  assert.equal(manifest.project_key, 'one_time_mishnah_class');
  assert.equal(manifest.safety.test_prefixed, true);
  assert.equal(manifest.safety.external_writes, false);
  assert.ok(manifest.review_people.every((person) => person.key.startsWith('TEST-')));
  for (const stage of ['New Lead', 'Email Clicked', 'Free Class Signup', 'Free Access / Trial', 'Paid Member', 'Inactive']) {
    assert.match(JSON.stringify(manifest), new RegExp(stage.replace(/[ /]/g, '[ /]')));
    assert.match(sql, new RegExp(stage.replace(/[ /]/g, '[ /]')));
  }
  for (const state of ['sandbox_pending', 'paid', 'failed', 'sent', 'delivered', 'clicked', 'bounced', 'token_missing']) {
    assert.match(JSON.stringify(manifest), new RegExp(state));
  }
  assert.match(sql, /TEST One Time Adult Lead/);
  assert.match(sql, /TEST One Time Launch Review Class/);
  assert.match(sql, /info@onetimeonetime\.com/);
  assert.match(sql, /external_send_performed/);
  assert.match(cleanup, /cleanup marker one_time_ui_review_20260702|cleanup marker/);
  assert.match(cleanup, /DELETE FROM bna_people WHERE metadata->>'cleanup_marker'/);
  assert.doesNotMatch(sql, /gmail\.com|yahoo\.com|hotmail\.com|outlook\.com/i);
  assert.doesNotMatch(sql, /Dratler|raw private|Bnei Neviim/i);
});

test('One Time UI review cleanup dry-run writes marker-only cleanup SQL', () => {
  const outDir = tmpFixtureDir();
  const reportPath = path.join(outDir, 'cleanup-report.json');
  const output = execFileSync('node', [
    'scripts/cleanup-one-time-ui-review-data.mjs',
    '--json',
    '--write-report',
    '--out-dir',
    outDir,
    '--report',
    reportPath,
  ], { cwd: process.cwd(), encoding: 'utf8' });

  const report = JSON.parse(output);
  const cleanup = fs.readFileSync(path.join(outDir, 'cleanup-ui-review-data.sql'), 'utf8');
  assert.equal(report.ok, true);
  assert.equal(report.mode, 'dry_run');
  assert.equal(report.mutation_performed, false);
  assert.equal(report.cleanup_marker, 'one_time_ui_review_20260702');
  assert.match(cleanup, /DELETE FROM bna_communications WHERE metadata->>'cleanup_marker' = 'one_time_ui_review_20260702'/);
  assert.match(cleanup, /DELETE FROM bna_support_tickets/);
  assert.doesNotMatch(cleanup, /DROP TABLE|TRUNCATE|DELETE FROM bna_people;|DELETE FROM bna_tasks;/i);
});

test('One Time UI review apply modes are confirmation-gated', () => {
  const seedScript = fs.readFileSync('scripts/seed-one-time-ui-review-data.mjs', 'utf8');
  const cleanupScript = fs.readFileSync('scripts/cleanup-one-time-ui-review-data.mjs', 'utf8');
  assert.match(seedScript, /SEED_ONE_TIME_UI_REVIEW_DATA/);
  assert.match(cleanupScript, /CLEANUP_ONE_TIME_UI_REVIEW_DATA/);
  assert.match(seedScript, /APP_INSTANCE must be onetime/);
  assert.match(cleanupScript, /DEFAULT_WORKSPACE_KEY must be/);
  assert.match(seedScript, /external_writes_performed: false/);
});
