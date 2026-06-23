const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');

async function loadGate() {
  return import(pathToFileURL(path.join(repoRoot, 'scripts', 'bna-external-readback-gate.mjs')).href);
}

function fakeLoadSecret(configuredNames = new Set()) {
  return ({ envName }) => ({
    configured: configuredNames.has(envName),
    env_name: envName,
    source_type: configuredNames.has(envName) ? 'env' : null,
    value: configuredNames.has(envName) ? `secret-value-for-${envName}` : '',
  });
}

test('external readback gate reports readiness without leaking secret values', async () => {
  const mod = await loadGate();
  const report = mod.buildExternalReadbackGateReport({
    scopes: new Set(['database', 'railway', 'drive']),
  }, {
    repoRoot,
    env: {
      RAILWAY_PROJECT_ID: 'project-id-secretish',
      RAILWAY_ENVIRONMENT_ID: 'environment-id-secretish',
      RAILWAY_SERVICE_ID: 'service-id-secretish',
      BNA_DRIVE_ROOT_FOLDER_ID: 'drive-folder-secretish',
    },
    loadSecretFn: fakeLoadSecret(new Set([
      'DATABASE_URL',
      'RAILWAY_TOKEN',
      'GOOGLE_APPLICATION_CREDENTIALS',
    ])),
  });

  assert.equal(report.ok, true);
  assert.equal(report.mode, 'dry_run');
  assert.equal(report.external_read_performed, false);
  assert.equal(report.production_mutation_performed, false);
  assert.equal(report.safe_apply_performed, false);
  assert.equal(report.secrets_redacted, true);
  assert.equal(report.readiness.database.ready, true);
  assert.equal(report.readiness.railway.ready, true);
  assert.equal(report.readiness.drive.ready, true);
  assert.doesNotMatch(JSON.stringify(report), /secret-value-for|postgres:\/\/|project-id-secretish|drive-folder-secretish/);
});

test('external readback gate blocks missing readback approval and missing configured state', async () => {
  const mod = await loadGate();
  const report = mod.buildExternalReadbackGateReport({
    readback: true,
    scopes: new Set(['database', 'railway']),
  }, {
    repoRoot,
    env: {},
    loadSecretFn: fakeLoadSecret(new Set(['DATABASE_URL'])),
  });

  assert.equal(report.ok, false);
  assert.equal(report.mode, 'external_readback_gate');
  assert.equal(report.readiness.database.ready, true);
  assert.equal(report.readiness.railway.ready, false);
  assert.equal(report.readiness.railway.secrets[0].source, 'not configured');
  assert.ok(report.blockers.some((blocker) => /railway readback gate is not ready/i.test(blocker)));
  assert.ok(report.blockers.some((blocker) => /READ_EXTERNAL_PRODUCTION_STATE/.test(blocker)));
  assert.ok(report.blockers.some((blocker) => /BNA_EXTERNAL_READBACK_APPROVED=approved/.test(blocker)));
});

test('external readback gate requires job range and approvals before backfill apply gate', async () => {
  const mod = await loadGate();
  const blocked = mod.buildExternalReadbackGateReport({
    backfillApply: true,
    scopes: new Set(['database']),
  }, {
    repoRoot,
    env: {},
    loadSecretFn: fakeLoadSecret(new Set(['DATABASE_URL'])),
  });

  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.some((blocker) => /READ_EXTERNAL_PRODUCTION_STATE/.test(blocker)));
  assert.ok(blocked.blockers.some((blocker) => /APPLY_GUARDED_CLASS_BACKFILL/.test(blocker)));
  assert.ok(blocked.blockers.some((blocker) => /BNA_BACKFILL_APPLY_APPROVED=approved/.test(blocker)));
  assert.ok(blocked.blockers.some((blocker) => /BNA_EXTERNAL_READBACK_APPROVED=approved/.test(blocker)));
  assert.ok(blocked.blockers.some((blocker) => /--job-range/.test(blocker)));

  const approved = mod.buildExternalReadbackGateReport({
    backfillApply: true,
    confirmReadback: mod.READBACK_CONFIRM_PHRASE,
    confirmBackfill: mod.BACKFILL_CONFIRM_PHRASE,
    jobRange: '64-74',
    scopes: new Set(['database']),
  }, {
    repoRoot,
    env: {
      [mod.READBACK_APPROVAL_ENV]: 'approved',
      [mod.BACKFILL_APPROVAL_ENV]: 'approved',
    },
    loadSecretFn: fakeLoadSecret(new Set(['DATABASE_URL'])),
  });

  assert.equal(approved.ok, true);
  assert.equal(approved.mode, 'backfill_apply_gate');
  assert.equal(approved.job_range.normalized, '64-74');
  assert.equal(approved.approval_gates.readback.requested, true);
  assert.equal(approved.safe_apply_performed, false);
  assert.equal(approved.production_mutation_performed, false);
});

test('external backfill gate rejects non-numeric job ranges without leaking configured values', async () => {
  const mod = await loadGate();
  const report = mod.buildExternalReadbackGateReport({
    backfillApply: true,
    confirmReadback: mod.READBACK_CONFIRM_PHRASE,
    confirmBackfill: mod.BACKFILL_CONFIRM_PHRASE,
    jobRange: '64-all',
    scopes: new Set(['database']),
  }, {
    repoRoot,
    env: {
      [mod.READBACK_APPROVAL_ENV]: 'approved',
      [mod.BACKFILL_APPROVAL_ENV]: 'approved',
    },
    loadSecretFn: fakeLoadSecret(new Set(['DATABASE_URL'])),
  });

  assert.equal(report.ok, false);
  assert.equal(report.job_range.valid, false);
  assert.ok(report.blockers.some((blocker) => /positive numeric IDs or ranges/.test(blocker)));
  assert.doesNotMatch(JSON.stringify(report), /secret-value-for|postgres:\/\//);
});

test('external readback and backfill can be requested together only with both gates', async () => {
  const mod = await loadGate();
  const report = mod.buildExternalReadbackGateReport({
    readback: true,
    backfillApply: true,
    confirmReadback: mod.READBACK_CONFIRM_PHRASE,
    confirmBackfill: mod.BACKFILL_CONFIRM_PHRASE,
    jobRange: '64,73-74',
    scopes: new Set(['database']),
  }, {
    repoRoot,
    env: {
      [mod.READBACK_APPROVAL_ENV]: 'approved',
      [mod.BACKFILL_APPROVAL_ENV]: 'approved',
    },
    loadSecretFn: fakeLoadSecret(new Set(['DATABASE_URL'])),
  });

  assert.equal(report.ok, true);
  assert.equal(report.mode, 'external_readback_backfill_apply_gate');
  assert.equal(report.job_range.normalized, '64,73-74');
  assert.equal(report.approval_gates.readback.requested, true);
  assert.equal(report.approval_gates.backfill_apply.requested, true);
  assert.equal(report.external_read_performed, false);
  assert.equal(report.production_mutation_performed, false);
});
