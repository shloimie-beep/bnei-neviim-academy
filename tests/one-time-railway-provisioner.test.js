const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

function runProvisioner(args = []) {
  return spawnSync(process.execPath, ['scripts/provision-onetime-railway-instance.mjs', ...args], {
    encoding: 'utf8',
    windowsHide: true,
  });
}

test('One Time Railway provisioner defaults to dry-run without Railway mutation', () => {
  const result = runProvisioner(['--json']);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'dry_run');
  assert.equal(report.ok, true);
  assert.equal(report.mutation_performed, false);
  assert.equal(report.confirmation_required, 'PROVISION_ONE_TIME_INSTANCE');
  assert.equal(report.target.target_project, 'one-time-production');
  assert.equal(report.target.web_service, 'one-time-web');
  assert.equal(report.target.postgres_service, 'one-time-postgres');
  assert.ok(report.safety_guards.some((line) => /Do not add services to skillful-motivation/.test(line)));
  assert.ok(report.planned_steps.some((step) => step.key === 'create_or_reuse_project'));
  assert.ok(report.planned_steps.some((step) => step.key === 'set_non_secret_variables'));
  assert.doesNotMatch(result.stdout, /SESSION_SECRET=|ONE_TIME_OWNER_PASSWORD=|ONE_TIME_MANAGER_PASSWORD=/);
});

test('One Time Railway provisioner refuses apply without exact confirmation before CLI mutation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-onetime-provisioner-'));
  const result = runProvisioner(['--apply', '--json', '--report', path.join(dir, 'blocked-apply-report.json')]);
  assert.equal(result.status, 2);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'apply');
  assert.equal(report.mutation_performed, false);
  assert.ok(report.blockers.some((line) => /Missing confirmation phrase/.test(line)));
  assert.equal(Array.isArray(report.steps) ? report.steps.length : 0, 0);
});

test('One Time Railway provisioner exposes auth check mode separately from apply mode', () => {
  const script = fs.readFileSync('scripts/provision-onetime-railway-instance.mjs', 'utf8');
  const preflight = fs.readFileSync('scripts/preflight-onetime-railway-provisioning.mjs', 'utf8');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.match(script, /--check-auth/);
  assert.match(script, /--project-id/);
  assert.match(script, /ONE_TIME_RAILWAY_PROJECT_ID/);
  assert.match(script, /raw_stdout \|\| listCheck\?\.stdout/);
  assert.match(script, /railway list --json/);
  assert.match(script, /current_link_mentions_forbidden_project/);
  assert.match(script, /variable', 'set'.*'--stdin'/s);
  assert.match(script, /join\.onetimeonetime\.com/);
  assert.match(preflight, /raw_stdout: result\.stdout/);
  assert.match(preflight, /listCheck\.raw_stdout \|\| listCheck\.stdout/);
  assert.match(packageJson.scripts['one-time:railway-provision:apply'], /provision-onetime-railway-instance\.mjs/);
});
