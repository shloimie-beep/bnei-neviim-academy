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
  assert.ok(report.readiness.drive.auth_paths.some((authPath) => authPath.path === 'application_credentials' && authPath.ready));
  assert.doesNotMatch(JSON.stringify(report), /secret-value-for|postgres:\/\/|project-id-secretish|drive-folder-secretish/);
});

test('external readback gate requires a complete Drive authentication path', async () => {
  const mod = await loadGate();
  const partial = mod.buildExternalReadbackGateReport({
    scopes: new Set(['drive']),
  }, {
    repoRoot,
    env: {
      BNA_DRIVE_ROOT_FOLDER_ID: 'drive-folder-secretish',
    },
    loadSecretFn: fakeLoadSecret(new Set(['GOOGLE_CLIENT_EMAIL'])),
  });

  assert.equal(partial.ok, false);
  assert.equal(partial.readiness.drive.ready, false);
  assert.ok(partial.blockers.some((blocker) => /drive readback gate is not ready/i.test(blocker)));
  assert.ok(partial.readiness.drive.auth_paths.some((authPath) => authPath.path === 'service_account_pair' && !authPath.ready));
  assert.doesNotMatch(JSON.stringify(partial), /secret-value-for|drive-folder-secretish/);

  const serviceAccount = mod.buildExternalReadbackGateReport({
    scopes: new Set(['drive']),
  }, {
    repoRoot,
    env: {
      BNA_DRIVE_ROOT_FOLDER_ID: 'drive-folder-secretish',
    },
    loadSecretFn: fakeLoadSecret(new Set(['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY'])),
  });

  assert.equal(serviceAccount.ok, true);
  assert.equal(serviceAccount.readiness.drive.ready, true);
  assert.ok(serviceAccount.readiness.drive.auth_paths.some((authPath) => authPath.path === 'service_account_pair' && authPath.ready));

  const oauth = mod.buildExternalReadbackGateReport({
    scopes: new Set(['drive']),
  }, {
    repoRoot,
    env: {
      BNA_DRIVE_ROOT_FOLDER_ID: 'drive-folder-secretish',
    },
    loadSecretFn: fakeLoadSecret(new Set(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'])),
  });

  assert.equal(oauth.ok, true);
  assert.equal(oauth.readiness.drive.ready, true);
  assert.ok(oauth.readiness.drive.auth_paths.some((authPath) => authPath.path === 'oauth_refresh_token' && authPath.ready));
});

test('external readback gate rejects placeholder Railway and Drive config values', async () => {
  const mod = await loadGate();
  const railway = mod.buildExternalReadbackGateReport({
    scopes: new Set(['railway']),
  }, {
    repoRoot,
    env: {
      RAILWAY_PROJECT_ID: 'project-id-secretish',
      RAILWAY_ENVIRONMENT_ID: 'environment-id-secretish',
      RAILWAY_SERVICE_NAME: 'None',
    },
    loadSecretFn: fakeLoadSecret(new Set(['RAILWAY_TOKEN'])),
  });

  const railwayService = railway.readiness.railway.config.find((state) => state.name === 'RAILWAY_SERVICE_NAME');
  assert.equal(railway.ok, false);
  assert.equal(railway.readiness.railway.ready, false);
  assert.equal(railwayService.configured, false);
  assert.equal(railwayService.source, 'placeholder');
  assert.ok(railway.blockers.some((blocker) => /railway readback gate is not ready/i.test(blocker)));
  assert.doesNotMatch(JSON.stringify(railway), /secret-value-for|project-id-secretish|environment-id-secretish|\bNone\b/);

  const drive = mod.buildExternalReadbackGateReport({
    scopes: new Set(['drive']),
  }, {
    repoRoot,
    env: {
      BNA_DRIVE_ROOT_FOLDER_ID: 'TODO',
    },
    loadSecretFn: fakeLoadSecret(new Set(['GOOGLE_APPLICATION_CREDENTIALS'])),
  });

  const driveRoot = drive.readiness.drive.config.find((state) => state.name === 'BNA_DRIVE_ROOT_FOLDER_ID');
  assert.equal(drive.ok, false);
  assert.equal(drive.readiness.drive.ready, false);
  assert.equal(driveRoot.configured, false);
  assert.equal(driveRoot.source, 'placeholder');
  assert.ok(drive.blockers.some((blocker) => /drive readback gate is not ready/i.test(blocker)));
  assert.doesNotMatch(JSON.stringify(drive), /secret-value-for|TODO/);
});

test('external readback gate uses shared placeholder rejection for config values', async () => {
  const mod = await loadGate();
  const report = mod.buildExternalReadbackGateReport({
    scopes: new Set(['railway', 'drive']),
  }, {
    repoRoot,
    env: {
      RAILWAY_PROJECT_ID: 'project-id-secretish',
      RAILWAY_ENVIRONMENT_ID: 'environment-id-secretish',
      RAILWAY_SERVICE_NAME: 'replace me',
      BNA_DRIVE_ROOT_FOLDER_ID: 'placeholder',
    },
    loadSecretFn: fakeLoadSecret(new Set([
      'RAILWAY_TOKEN',
      'GOOGLE_APPLICATION_CREDENTIALS',
    ])),
  });

  const railwayService = report.readiness.railway.config.find((state) => state.name === 'RAILWAY_SERVICE_NAME');
  const driveRoot = report.readiness.drive.config.find((state) => state.name === 'BNA_DRIVE_ROOT_FOLDER_ID');
  assert.equal(report.ok, false);
  assert.equal(report.readiness.railway.ready, false);
  assert.equal(report.readiness.drive.ready, false);
  assert.equal(railwayService.configured, false);
  assert.equal(railwayService.source, 'placeholder');
  assert.equal(driveRoot.configured, false);
  assert.equal(driveRoot.source, 'placeholder');
  assert.doesNotMatch(JSON.stringify(report), /replace me|secret-value-for|project-id-secretish|environment-id-secretish/i);
});

test('external readback gate rejects placeholder loaded secret values', async () => {
  const mod = await loadGate();
  const report = mod.buildExternalReadbackGateReport({
    scopes: new Set(['database']),
  }, {
    repoRoot,
    env: {},
    loadSecretFn: ({ envName }) => ({
      configured: true,
      env_name: envName,
      source_type: 'env',
      value: 'TODO',
    }),
  });

  assert.equal(report.ok, false);
  assert.equal(report.readiness.database.ready, false);
  assert.equal(report.readiness.database.secrets[0].configured, false);
  assert.equal(report.readiness.database.secrets[0].source, 'placeholder');
  assert.ok(report.blockers.some((blocker) => /database readback gate is not ready/i.test(blocker)));
  assert.doesNotMatch(JSON.stringify(report), /TODO|postgres:\/\//);
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

test('external readback summary preserves only sanitized backfill job range state', async () => {
  const mod = await loadGate();
  const validReport = mod.buildExternalReadbackGateReport({
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

  const validSummary = mod.summarizeExternalReadbackGateReport(validReport);
  assert.deepEqual(validSummary.job_range, {
    present: true,
    valid: true,
    normalized: '64,73-74',
  });
  assert.equal(validSummary.safe_apply_performed, false);
  assert.doesNotMatch(JSON.stringify(validSummary), /secret-value-for|postgres:\/\//);

  const invalidReport = mod.buildExternalReadbackGateReport({
    backfillApply: true,
    confirmReadback: mod.READBACK_CONFIRM_PHRASE,
    confirmBackfill: mod.BACKFILL_CONFIRM_PHRASE,
    jobRange: '64-secret-value-for-DATABASE_URL',
    scopes: new Set(['database']),
  }, {
    repoRoot,
    env: {
      [mod.READBACK_APPROVAL_ENV]: 'approved',
      [mod.BACKFILL_APPROVAL_ENV]: 'approved',
    },
    loadSecretFn: fakeLoadSecret(new Set(['DATABASE_URL'])),
  });

  const invalidSummary = mod.summarizeExternalReadbackGateReport(invalidReport);
  assert.deepEqual(invalidSummary.job_range, {
    present: true,
    valid: false,
    normalized: '',
  });
  assert.doesNotMatch(JSON.stringify(invalidSummary), /secret-value-for|DATABASE_URL|postgres:\/\//);
});
