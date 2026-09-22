const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');
const script = path.join(repoRoot, 'scripts', 'canonical-intake-postgres.mjs');

function runCli(args, env = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      DATABASE_URL: '',
      BNA_CANONICAL_INTAKE_POSTGRES_APPLY_APPROVED: '',
      BNA_CANONICAL_INTAKE_POSTGRES_READBACK_APPROVED: '',
      ...env,
    },
  });
}

async function loadCli() {
  return import(pathToFileURL(script).href);
}

test('canonical intake postgres CLI dry-runs without SQL text or database access', () => {
  const result = runCli([
    '--json',
    '--text=Task: Codex should prepare a canonical Postgres apply plan.',
    '--source-provider=github',
    '--source-kind=github_issue',
    '--source-id=shloimie-beep/bnei-neviim-academy#8',
  ]);

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, true);
  assert.equal(report.mode, 'dry_run');
  assert.equal(report.database_mutation_performed, false);
  assert.equal(report.plan.storage_kind, 'postgres');
  assert.equal(report.plan.applied, false);
  assert.equal(report.plan.external_write_performed, false);
  assert.ok(report.plan.statement_names.includes('upsert_raw_intake'));
  assert.ok(report.plan.parse_item_statement_count >= 1);
  assert.ok(report.plan.parsed_entity_statement_count >= 1);
  assert.match(report.plan.raw_intake_stable_id, /^intake_source_/);
  assert.doesNotMatch(result.stdout, /INSERT INTO|VALUES \(|DATABASE_URL=|postgres:\/\//i);
});

test('canonical intake postgres CLI blocks apply without approval gates', () => {
  const result = runCli([
    '--json',
    '--apply',
    '--text=Task: Codex should not apply this packet without approval.',
  ]);

  assert.equal(result.status, 2, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.ok, false);
  assert.equal(report.mode, 'apply');
  assert.equal(report.database_mutation_performed, false);
  assert.ok(report.blockers.some((blocker) => /APPLY_CANONICAL_INTAKE_POSTGRES/.test(blocker)));
  assert.ok(report.blockers.some((blocker) => /BNA_CANONICAL_INTAKE_POSTGRES_APPLY_APPROVED=approved/.test(blocker)));
  assert.ok(report.blockers.some((blocker) => /DATABASE_URL is not configured/.test(blocker)));
  assert.equal(report.plan.applied, false);
});

test('canonical intake postgres CLI requires readback gate for combined apply and readback', async () => {
  const mod = await loadCli();
  const blocked = mod.buildGuardReport({
    apply: true,
    readback: true,
    confirm: mod.APPLY_CONFIRM_PHRASE,
    text: 'Task: Codex should not combine apply and readback without readback approval.',
  }, {
    DATABASE_URL: 'postgres://redacted.invalid/bna',
    [mod.APPLY_APPROVAL_ENV]: 'approved',
  });

  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.some((blocker) => /--confirm-readback READ_CANONICAL_INTAKE_POSTGRES/.test(blocker)));
  assert.ok(blocked.blockers.some((blocker) => /BNA_CANONICAL_INTAKE_POSTGRES_READBACK_APPROVED=approved/.test(blocker)));
  assert.doesNotMatch(JSON.stringify(blocked), /postgres:\/\/redacted\.invalid/);

  const approved = mod.buildGuardReport({
    apply: true,
    readback: true,
    confirm: mod.APPLY_CONFIRM_PHRASE,
    confirmReadback: mod.READBACK_CONFIRM_PHRASE,
    text: 'Task: Codex should allow combined apply/readback only after both gates.',
  }, {
    DATABASE_URL: 'postgres://redacted.invalid/bna',
    [mod.APPLY_APPROVAL_ENV]: 'approved',
    [mod.READBACK_APPROVAL_ENV]: 'approved',
  });

  assert.equal(approved.ok, true);
  assert.doesNotMatch(JSON.stringify(approved), /postgres:\/\/redacted\.invalid/);
});

test('canonical intake postgres CLI rejects placeholder database URLs before connect', async () => {
  const mod = await loadCli();
  const report = await mod.buildReport({
    readback: true,
    confirm: mod.READBACK_CONFIRM_PHRASE,
    rawIntakeStableId: 'intake_source_placeholder_db_url_probe',
  }, {
    DATABASE_URL: 'TODO',
    [mod.READBACK_APPROVAL_ENV]: 'approved',
  });

  assert.equal(report.ok, false);
  assert.equal(report.mode, 'readback');
  assert.equal(report.database_mutation_performed, false);
  assert.ok(report.blockers.some((blocker) => /DATABASE_URL is not configured with a usable non-placeholder value/.test(blocker)));
  assert.doesNotMatch(JSON.stringify(report), /TODO|postgres:\/\//);
});
