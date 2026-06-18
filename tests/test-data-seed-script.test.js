const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'bna-test-data.mjs');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function run(args, env = {}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      BNA_TEST_DATA_ALLOW: '',
      DATABASE_URL: '',
      ...env,
    },
  });
}

function parseStdout(result) {
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('test-data plan is deterministic and covers every acceptance lane', () => {
  const plan = parseStdout(run(['plan']));

  assert.equal(plan.marker, 'TEST-BNA-SEED');
  assert.equal(plan.command, 'plan');
  assert.equal(plan.dry_run, false);
  assert.deepEqual(plan.safety.mutation_requires, [
    'BNA_TEST_DATA_ALLOW=1',
    'DATABASE_URL set',
    'database name contains "test"',
  ]);

  for (const lane of [
    'workspaces',
    'users',
    'students',
    'tasks',
    'decisions',
    'events',
    'content',
    'communities',
    'accounting',
    'automations',
    'integrations',
    'live_classes',
    'hebrew_goals',
    'helper_memory',
    'helper_actions',
  ]) {
    assert.ok(plan.fixture.lanes.includes(lane), lane);
  }

  assert.equal(plan.cleanup_order.at(0), 'bna_assistant_action_audit');
  assert.ok(plan.cleanup_order.indexOf('bna_task_comments') < plan.cleanup_order.indexOf('bna_tasks'));
  assert.ok(plan.cleanup_order.indexOf('bna_students') < plan.cleanup_order.indexOf('signups'));
  assert.ok(plan.cleanup_order.indexOf('bna_projects') < plan.cleanup_order.indexOf('bna_workspaces'));
});

test('seed and cleanup dry-runs do not require database credentials', () => {
  for (const command of ['seed', 'cleanup']) {
    const plan = parseStdout(run([command, '--dry-run']));
    assert.equal(plan.marker, 'TEST-BNA-SEED');
    assert.equal(plan.command, command);
    assert.equal(plan.dry_run, true);
  }
});

test('mutating commands require explicit local test database opt-in', () => {
  const missingOptIn = run(['seed']);
  assert.notEqual(missingOptIn.status, 0);
  assert.match(missingOptIn.stderr, /Refusing mutation: set BNA_TEST_DATA_ALLOW=1/);

  const missingDatabase = run(['cleanup'], { BNA_TEST_DATA_ALLOW: '1' });
  assert.notEqual(missingDatabase.status, 0);
  assert.match(missingDatabase.stderr, /DATABASE_URL is required/);

  const nonTestDatabase = run(['seed'], {
    BNA_TEST_DATA_ALLOW: '1',
    DATABASE_URL: 'postgres://user:pass@localhost/bna_prod',
  });
  assert.notEqual(nonTestDatabase.status, 0);
  assert.match(nonTestDatabase.stderr, /database name must contain "test"/);

  const hostedLookingDatabase = run(['cleanup'], {
    BNA_TEST_DATA_ALLOW: '1',
    DATABASE_URL: 'postgres://user:pass@railway.internal/bna_test',
  });
  assert.notEqual(hostedLookingDatabase.status, 0);
  assert.match(hostedLookingDatabase.stderr, /production-like/);
});

test('seed script uses scoped marker cleanup, helper audit rows, and Hebrew fixture data', () => {
  const source = read('scripts/bna-test-data.mjs');

  assert.match(source, /const MARKER = 'TEST-BNA-SEED'/);
  assert.match(source, /DELETE FROM bna_assistant_action_audit WHERE metadata->>'seed_marker' = \$1/);
  assert.match(source, /DELETE FROM bna_students WHERE notes LIKE \$1 OR name LIKE \$1 OR parent_email = \$2/);
  assert.match(source, /automations\.read_status/);
  assert.match(source, /integrations\.read_status/);
  assert.match(source, /TEST_HEBREW_GOAL/);
  assert.match(source, /await client\.query\('BEGIN'\)/);
  assert.match(source, /await client\.query\('ROLLBACK'\)/);
});

test('package scripts expose repeatable test-data lifecycle commands', () => {
  const pkg = JSON.parse(read('package.json'));

  assert.equal(pkg.scripts['test:data:plan'], 'node scripts/bna-test-data.mjs plan');
  assert.equal(pkg.scripts['test:data:seed'], 'node scripts/bna-test-data.mjs seed');
  assert.equal(pkg.scripts['test:data:cleanup'], 'node scripts/bna-test-data.mjs cleanup');
});
