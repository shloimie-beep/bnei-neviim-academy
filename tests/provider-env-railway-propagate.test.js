const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const propagateUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'provider-env-railway-propagate.mjs')).href;
const ENV_KEYS = [
  'ZOOM_ACCOUNT_ID',
  'ZOOM_CLIENT_ID',
  'ZOOM_CLIENT_SECRET',
  'VIMEO_CLIENT_ID',
  'VIMEO_CLIENT_SECRET',
  'VIMEO_ACCESS_TOKEN',
  'RESEND_API_KEY',
  'RESEND_FROM',
  'RESEND_DOMAIN',
  'RAILWAY_TOKEN',
  'RAILWAY_API_TOKEN',
];

async function loadPropagate() {
  return import(propagateUrl);
}

function tempRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-provider-env-propagate-'));
  fs.mkdirSync(path.join(repoRoot, '.secrets'), { recursive: true });
  return repoRoot;
}

function writeSecret(repoRoot, name, value) {
  fs.writeFileSync(path.join(repoRoot, '.secrets', name), value);
}

async function withEnvCleared(callback) {
  const previous = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of ENV_KEYS) delete process.env[key];
  try {
    return await callback();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('provider env Railway propagation sets only configured approved provider values without logging values', async () => {
  const { buildProviderEnvRailwayPropagation } = await loadPropagate();
  const repoRoot = tempRepo();
  const values = {
    ZOOM_ACCOUNT_ID: 'zoom-account',
    ZOOM_CLIENT_ID: 'zoom-client',
    ZOOM_CLIENT_SECRET: 'zoom-secret',
    VIMEO_CLIENT_ID: 'vimeo-client',
    VIMEO_CLIENT_SECRET: 'vimeo-secret',
  };
  writeSecret(repoRoot, 'railway-token.txt', 'railway-test-token');
  writeSecret(repoRoot, 'zoom-account-id.txt', values.ZOOM_ACCOUNT_ID);
  writeSecret(repoRoot, 'zoom-client-id.txt', values.ZOOM_CLIENT_ID);
  writeSecret(repoRoot, 'zoom-client-secret.txt', values.ZOOM_CLIENT_SECRET);
  writeSecret(repoRoot, 'vimeo-client-id.txt', values.VIMEO_CLIENT_ID);
  writeSecret(repoRoot, 'vimeo-client-secret.txt', values.VIMEO_CLIENT_SECRET);

  const calls = [];
  const runner = (command, args, options) => {
    calls.push({ command, args, input: options.input });
    return { status: 0, stdout: '{}', stderr: '' };
  };

  const report = await withEnvCleared(() => buildProviderEnvRailwayPropagation({
    repoRoot,
    keyholderRoots: [path.join(repoRoot, 'missing-keyholder')],
    service: 'test-service',
    environment: 'production',
    apply: true,
    runner,
  }));

  assert.equal(report.external_write_performed, true);
  assert.equal(report.secret_values_printed, false);
  assert.equal(report.railway_auto_deploy_skipped, true);
  assert.equal(report.summary.attempted, 5);
  assert.equal(report.summary.pushed, 5);
  assert.equal(report.summary.resend_api_key_independent, true);
  assert.equal(report.summary.resend_sender_group_complete, false);
  assert.equal(report.fields.find((field) => field.key === 'RESEND_API_KEY').status, 'missing_local');
  assert.equal(report.fields.find((field) => field.key === 'VIMEO_ACCESS_TOKEN').status, 'not_configured');
  assert.equal(calls.length, 5);
  assert(calls.every((call) => call.args.includes('--stdin')));
  assert(calls.every((call) => call.args.includes('--skip-deploys')));
  assert.deepEqual(calls.map((call) => call.input), Object.values(values));

  const serialized = JSON.stringify(report);
  for (const value of [...Object.values(values), 'railway-test-token']) {
    assert.doesNotMatch(serialized, new RegExp(value));
  }

  fs.rmSync(repoRoot, { recursive: true, force: true });
});

test('Resend API key propagation is independent from sender/domain readiness', async () => {
  const { buildProviderEnvRailwayPropagation } = await loadPropagate();
  const repoRoot = tempRepo();
  writeSecret(repoRoot, 'railway-token.txt', 'railway-test-token');
  writeSecret(repoRoot, 'resend-api-key.txt', 'resend-test-key');

  const calls = [];
  const runner = (command, args, options) => {
    calls.push({ command, args, input: options.input });
    return { status: 0, stdout: '{}', stderr: '' };
  };

  const report = await withEnvCleared(() => buildProviderEnvRailwayPropagation({
    repoRoot,
    keyholderRoots: [path.join(repoRoot, 'missing-keyholder')],
    service: 'test-service',
    environment: 'production',
    apply: true,
    runner,
  }));

  assert.equal(report.summary.resend_api_key_independent, true);
  assert.equal(report.summary.resend_sender_group_complete, false);
  assert.equal(report.summary.attempted, 1);
  assert.equal(report.summary.pushed, 1);
  assert.equal(report.fields.find((field) => field.key === 'RESEND_API_KEY').status, 'set');
  assert.equal(report.fields.find((field) => field.key === 'RESEND_FROM').status, 'missing_local');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].input, 'resend-test-key');
  assert.doesNotMatch(JSON.stringify(report), /resend-test-key|railway-test-token/);

  fs.rmSync(repoRoot, { recursive: true, force: true });
});

test('provider env Railway propagation can push only RESEND_API_KEY without sender/domain fields', async () => {
  const { buildProviderEnvRailwayPropagation } = await loadPropagate();
  const repoRoot = tempRepo();
  writeSecret(repoRoot, 'railway-token.txt', 'railway-test-token');
  writeSecret(repoRoot, 'resend-api-key.txt', 'resend-test-key');

  const calls = [];
  const runner = (command, args, options) => {
    calls.push({ command, args, input: options.input });
    return { status: 0, stdout: '{}', stderr: '' };
  };

  const report = await withEnvCleared(() => buildProviderEnvRailwayPropagation({
    repoRoot,
    keyholderRoots: [path.join(repoRoot, 'missing-keyholder')],
    service: 'test-service',
    environment: 'production',
    apply: true,
    onlyKeys: ['RESEND_API_KEY'],
    runner,
  }));

  assert.deepEqual(report.only_keys, ['RESEND_API_KEY']);
  assert.equal(report.summary.ready_count, 1);
  assert.equal(report.summary.attempted, 1);
  assert.equal(report.summary.pushed, 1);
  assert.equal(report.summary.resend_api_key_independent, true);
  assert.equal(report.summary.resend_sender_group_complete, false);
  assert.deepEqual(report.fields.map((field) => field.key), ['RESEND_API_KEY']);
  assert.equal(report.fields[0].status, 'set');
  assert.equal(calls.length, 1);
  assert(calls[0].args.includes('RESEND_API_KEY'));
  assert.equal(calls[0].input, 'resend-test-key');
  assert.doesNotMatch(JSON.stringify(report), /resend-test-key|railway-test-token/);

  fs.rmSync(repoRoot, { recursive: true, force: true });
});
