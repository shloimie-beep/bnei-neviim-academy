const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

async function localBeta() {
  return import(pathToFileURL(path.join(root, 'scripts', 'one-time-local-beta.mjs')).href);
}

test('package scripts expose One Time local plan, seed, reset, and smoke commands', () => {
  for (const script of [
    'onetime:local',
    'onetime:local:plan',
    'onetime:local:seed',
    'onetime:local:reset',
    'onetime:local:smoke',
  ]) {
    assert.ok(packageJson.scripts[script], `${script} should exist`);
    assert.match(packageJson.scripts[script], /one-time-local-beta\.mjs/);
  }
});

test('local beta plan is credential-light and blocks production mutations', async () => {
  const { buildOneTimeLocalBetaPlan } = await localBeta();
  const plan = buildOneTimeLocalBetaPlan({
    command: 'plan',
    env: {
      NODE_ENV: 'production',
      RAILWAY_ENVIRONMENT: 'production',
      DATABASE_URL: 'redacted-production-url',
    },
  });

  assert.equal(plan.requirement_id, 'REQ-20260619-418');
  assert.equal(plan.production_mutation_performed, false);
  assert.equal(plan.external_write_performed, false);
  assert.equal(plan.database_write_performed, false);
  assert.equal(plan.hidden_credential_dependency, false);
  assert.equal(plan.env_safety.production_like_environment_detected, true);
  assert.equal(plan.env_safety.production_database_write_allowed, false);
  assert.equal(plan.env_safety.external_service_write_allowed, false);
  assert.equal(plan.env_safety.recommended_env.BNA_SKIP_ENV_LOCAL, '1');
  assert.equal(plan.dependency_status.node.ok, true);
  assert.equal(plan.dependency_status.npm.ok, true);
  assert.equal(plan.package_scripts.ok, true);
});

test('seed and smoke previews load One Time data without writes', async () => {
  const { buildOneTimeLocalBetaPlan } = await localBeta();
  const seed = buildOneTimeLocalBetaPlan({ command: 'seed' });
  const smoke = buildOneTimeLocalBetaPlan({ command: 'smoke' });

  assert.equal(seed.command, 'seed');
  assert.equal(seed.preview_only, true);
  assert.equal(seed.write_requested, false);
  assert.equal(seed.write_performed, undefined);
  assert.equal(seed.production_mutation_performed, false);
  assert.equal(seed.external_write_performed, false);
  assert.equal(seed.seed_id, 'one-time-local-beta-seed-v1');
  assert.equal(seed.instance_slug, 'one-time-mishnah-class');
  assert.equal(seed.progress_rewards.group_summary.student_count, 2);
  assert.equal(seed.progress_views.student.students.length, 1);
  assert.equal(seed.progress_views.parent.students.length, 1);
  assert.equal(seed.progress_views.public.students.length, 0);

  assert.equal(smoke.command, 'smoke');
  assert.equal(smoke.success, true);
  assert.equal(smoke.checks.every((check) => check.ok), true);
  assert.equal(smoke.seed_preview.student_count, 2);
});

test('reset preview is scoped to local runtime files only', async () => {
  const { buildOneTimeLocalBetaPlan } = await localBeta();
  const reset = buildOneTimeLocalBetaPlan({ command: 'reset' });

  assert.equal(reset.command, 'reset');
  assert.equal(reset.reset_scope, 'local_runtime_files_only');
  assert.equal(reset.database_reset_performed, false);
  assert.equal(reset.production_data_deleted, false);
  assert.equal(reset.safe_to_repeat, true);
  assert.ok(reset.targets.every((target) => target.startsWith('.runtime/one-time-local-beta/')));
  assert.doesNotMatch(JSON.stringify(reset), /DROP TABLE|TRUNCATE|DELETE FROM|DATABASE_URL|RAILWAY_TOKEN/);
});

test('local beta run command writes only when explicitly requested', async () => {
  const { runOneTimeLocalBetaCommand } = await localBeta();
  const dryRun = runOneTimeLocalBetaCommand({ command: 'seed', write: false });

  assert.equal(dryRun.write_performed, false);
  assert.equal(dryRun.production_mutation_performed, false);
  assert.equal(dryRun.external_write_performed, false);
});

test('startup seed reset doc records repeatable local-only workflow', () => {
  const doc = fs.readFileSync('docs/product/one-time-local-beta-startup-seed-reset.md', 'utf8');

  assert.match(doc, /npm run onetime:local:plan/);
  assert.match(doc, /npm run onetime:local:seed/);
  assert.match(doc, /npm run onetime:local:smoke/);
  assert.match(doc, /npm run onetime:local:reset/);
  assert.match(doc, /\.runtime\/one-time-local-beta/);
  assert.match(doc, /BNA_SKIP_ENV_LOCAL='1'/);
  assert.match(doc, /does not authorize deployment/i);
});
