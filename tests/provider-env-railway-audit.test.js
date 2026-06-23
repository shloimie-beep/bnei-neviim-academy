const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const auditUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'provider-env-railway-audit.mjs')).href;
const PROVIDER_ENV_KEYS = [
  'ZOOM_ACCOUNT_ID',
  'ZOOM_CLIENT_ID',
  'ZOOM_CLIENT_SECRET',
  'VIMEO_CLIENT_ID',
  'VIMEO_CLIENT_SECRET',
  'VIMEO_ACCESS_TOKEN',
  'RESEND_API_KEY',
  'RESEND_FROM',
  'RESEND_DOMAIN',
];

async function loadAudit() {
  return import(auditUrl);
}

function tempRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-provider-env-audit-'));
  fs.mkdirSync(path.join(repoRoot, '.secrets'), { recursive: true });
  return repoRoot;
}

function writeSecret(repoRoot, name, value) {
  fs.writeFileSync(path.join(repoRoot, '.secrets', name), value);
}

function fingerprint(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
}

async function withProviderEnvCleared(callback) {
  const previous = new Map(PROVIDER_ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of PROVIDER_ENV_KEYS) delete process.env[key];
  try {
    return await callback();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('provider env Railway audit compares local and remote fingerprints without values', async () => {
  const { buildProviderEnvRailwayAudit } = await loadAudit();
  const repoRoot = tempRepo();
  const local = {
    ZOOM_ACCOUNT_ID: 'zoom-account',
    ZOOM_CLIENT_ID: 'zoom-client',
    ZOOM_CLIENT_SECRET: 'zoom-secret',
    VIMEO_CLIENT_ID: 'vimeo-client',
    VIMEO_CLIENT_SECRET: 'vimeo-secret',
  };
  writeSecret(repoRoot, 'zoom-account-id.txt', local.ZOOM_ACCOUNT_ID);
  writeSecret(repoRoot, 'zoom-client-id.txt', local.ZOOM_CLIENT_ID);
  writeSecret(repoRoot, 'zoom-client-secret.txt', local.ZOOM_CLIENT_SECRET);
  writeSecret(repoRoot, 'vimeo-client-id.txt', local.VIMEO_CLIENT_ID);
  writeSecret(repoRoot, 'vimeo-client-secret.txt', local.VIMEO_CLIENT_SECRET);

  const report = await withProviderEnvCleared(() => buildProviderEnvRailwayAudit({
    repoRoot,
    keyholderRoots: [path.join(repoRoot, 'missing-keyholder')],
    railwayJson: {
      variables: Object.entries(local).map(([name, value]) => ({ name, value })),
    },
    service: 'test-service',
    environment: 'production',
  }));

  assert.equal(report.external_write_performed, false);
  assert.equal(report.secret_values_printed, false);
  assert.equal(report.summary.required_count, 8);
  assert.equal(report.summary.required_matched, 5);
  assert.equal(report.summary.required_missing_in_railway, 0);
  assert.equal(report.summary.required_missing_locally, 3);
  assert.equal(report.fields.find((field) => field.key === 'ZOOM_CLIENT_SECRET').status, 'matched');
  assert.equal(report.fields.find((field) => field.key === 'RESEND_API_KEY').status, 'missing_required');
  assert.equal(report.fields.find((field) => field.key === 'ZOOM_CLIENT_SECRET').local.fingerprint, fingerprint(local.ZOOM_CLIENT_SECRET));

  const serialized = JSON.stringify(report);
  for (const value of Object.values(local)) assert.doesNotMatch(serialized, new RegExp(value));

  fs.rmSync(repoRoot, { recursive: true, force: true });
});

test('provider env Railway audit detects mismatches and Railway missing fields', async () => {
  const { buildProviderEnvRailwayAudit } = await loadAudit();
  const repoRoot = tempRepo();
  writeSecret(repoRoot, 'zoom-account-id.txt', 'zoom-account');
  writeSecret(repoRoot, 'zoom-client-id.txt', 'zoom-client-local');
  writeSecret(repoRoot, 'zoom-client-secret.txt', 'zoom-secret');

  const report = await withProviderEnvCleared(() => buildProviderEnvRailwayAudit({
    repoRoot,
    keyholderRoots: [path.join(repoRoot, 'missing-keyholder')],
    railwayJson: {
      variables: [
        { name: 'ZOOM_ACCOUNT_ID', value: 'zoom-account' },
        { name: 'ZOOM_CLIENT_ID', value: 'zoom-client-remote' },
      ],
    },
  }));

  assert.equal(report.fields.find((field) => field.key === 'ZOOM_ACCOUNT_ID').status, 'matched');
  assert.equal(report.fields.find((field) => field.key === 'ZOOM_CLIENT_ID').status, 'mismatch');
  assert.equal(report.fields.find((field) => field.key === 'ZOOM_CLIENT_SECRET').status, 'railway_missing');

  const serialized = JSON.stringify(report);
  assert.doesNotMatch(serialized, /zoom-client-local/);
  assert.doesNotMatch(serialized, /zoom-client-remote/);
  assert.doesNotMatch(serialized, /zoom-secret/);

  fs.rmSync(repoRoot, { recursive: true, force: true });
});
