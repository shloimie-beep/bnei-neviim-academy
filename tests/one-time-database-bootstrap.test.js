const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const test = require('node:test');

function runBootstrap(args = [], env = {}) {
  return spawnSync(process.execPath, ['scripts/bootstrap-onetime-database.mjs', ...args], {
    encoding: 'utf8',
    windowsHide: true,
    env: { ...process.env, ...env },
  });
}

test('One Time database bootstrap defaults to dry-run with migration checksums', () => {
  const result = runBootstrap(['--json']);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'dry_run');
  assert.equal(report.mutation_performed, false);
  assert.equal(report.confirmation_required, 'BOOTSTRAP_ONE_TIME_DATABASE');
  assert.ok(report.migration_count >= 1);
  assert.ok(report.migrations.some((item) => /one-time-product-system/.test(item.path)));
  assert.ok(report.migrations.every((item) => /^[a-f0-9]{64}$/.test(item.sha256)));
  assert.match(report.seed.path, /separate-instance-seed\.sql/);
  assert.match(report.isolation_scan.path, /separate-instance-isolation-scan\.sql/);
  assert.doesNotMatch(result.stdout, /postgres:\/\/|DATABASE_URL=/i);
});

test('One Time database bootstrap refuses apply before confirmation and instance guards', () => {
  const result = runBootstrap(['--apply', '--json'], {
    APP_INSTANCE: '',
    DEFAULT_WORKSPACE_KEY: '',
    DEFAULT_PROJECT_KEY: '',
    DATABASE_URL: '',
  });
  assert.equal(result.status, 2);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'apply');
  assert.equal(report.mutation_performed, false);
  assert.ok(report.blockers.some((line) => /Missing confirmation phrase/.test(line)));
  assert.ok(report.blockers.some((line) => /APP_INSTANCE must be onetime/.test(line)));
  assert.ok(report.blockers.some((line) => /DATABASE_URL is not configured/.test(line)));
});

test('One Time database bootstrap is wired into package scripts and provisioning checklist', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const script = fs.readFileSync('scripts/bootstrap-onetime-database.mjs', 'utf8');
  const separateDeployment = fs.readFileSync('src/platform/instances/one-time-separate-deployment.js', 'utf8');
  assert.match(packageJson.scripts['one-time:db:bootstrap'], /bootstrap-onetime-database\.mjs/);
  assert.match(script, /APP_INSTANCE=onetime/);
  assert.match(script, /DEFAULT_WORKSPACE_KEY/);
  assert.match(script, /BOOTSTRAP_ONE_TIME_DATABASE/);
  assert.match(separateDeployment, /one-time:db:bootstrap/);
});
