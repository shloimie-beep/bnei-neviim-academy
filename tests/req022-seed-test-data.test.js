const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'seed-req022-test-data.mjs');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

async function loadSeedModule() {
  return import(pathToFileURL(scriptPath).href);
}

test('REQ-20260618-111 seed harness is dry-run first and covers required fixture lanes', async () => {
  const seed = await loadSeedModule();
  const scenario = seed.buildSeedScenario({ runId: 'unit' });
  const plan = seed.buildPlanJson(scenario, { apply: false });

  assert.equal(plan.dry_run, true);
  assert.equal(plan.seed_prefix, 'TEST_REQ022');
  assert.equal(plan.safety.default_dry_run, true);
  assert.equal(plan.safety.no_external_writes, true);
  assert.equal(plan.safety.secrets_printed, false);
  assert.equal(plan.safety.apply_requires_confirmation, 'APPLY_REQ022_TEST_SEED');
  assert.equal(plan.safety.cleanup_requires_confirmation, 'CLEANUP_REQ022_TEST_SEED');

  for (const area of [
    'school_workspace',
    'service_provider_workspace',
    'family_workspace',
    'workspace_roles',
    'students',
    'assignments',
    'tasks',
    'decisions',
    'calendar',
    'content_research',
    'community',
    'automations',
    'hebrew_portal_fixture',
    'helper_action_audit',
    'cleanup_path',
  ]) {
    assert.ok(plan.required_coverage.includes(area), `missing coverage ${area}`);
  }
});

test('REQ-20260618-111 seed SQL is scoped, idempotent, and no-external-write', async () => {
  const seed = await loadSeedModule();
  const scenario = seed.buildSeedScenario({ runId: 'unit' });
  const sql = seed.buildSeedSql(scenario);

  assert.match(sql, /BEGIN;/);
  assert.match(sql, /COMMIT;/);
  assert.match(sql, /TEST_REQ022/);
  assert.match(sql, /req022_safe_repeatable_seed_v1/);
  assert.match(sql, /ON CONFLICT \(project_key\) DO UPDATE/);
  assert.match(sql, /ON CONFLICT \("key"\) DO UPDATE/);
  assert.match(sql, /ON CONFLICT \(project_id, person_name\) DO UPDATE/);
  assert.match(sql, /ON CONFLICT \(student_access_code\) DO UPDATE/);
  assert.match(sql, /bna_projects/);
  assert.match(sql, /bna_workspaces/);
  assert.match(sql, /bna_project_members/);
  assert.match(sql, /bna_students/);
  assert.match(sql, /bna_devices/);
  assert.match(sql, /bna_assignments/);
  assert.match(sql, /bna_assignment_students/);
  assert.match(sql, /bna_tasks/);
  assert.match(sql, /needs_decision/);
  assert.match(sql, /bna_calendar_events/);
  assert.match(sql, /bna_content_jobs/);
  assert.match(sql, /bna_learning_communities/);
  assert.match(sql, /bna_automations/);
  assert.match(sql, /bna_helper_tool_audit_log/);
  assert.match(sql, /no_external_write/);
  assert.match(sql, /no_google_write/);
  assert.doesNotMatch(sql, /TRUNCATE|DROP TABLE|SEND_WHATSAPP|APPROVE_BUFFER|stripe|secret/i);
});

test('REQ-20260618-111 cleanup SQL deletes only prefixed or metadata-tagged rows', async () => {
  const seed = await loadSeedModule();
  const scenario = seed.buildSeedScenario({ runId: 'unit' });
  const cleanup = seed.buildCleanupSql(scenario);

  assert.match(cleanup, /Deletes only TEST_REQ022 rows/);
  assert.match(cleanup, /DELETE FROM bna_helper_tool_audit_log WHERE/);
  assert.match(cleanup, /DELETE FROM bna_assignment_students/);
  assert.match(cleanup, /DELETE FROM bna_projects WHERE metadata->>'req022_seed_key'/);
  assert.match(cleanup, /OR project_key LIKE 'test_req022%'/);
  assert.match(cleanup, /COMMIT;/);
  assert.doesNotMatch(cleanup, /TRUNCATE|DROP TABLE|DELETE FROM bna_projects;/i);
});

test('REQ-20260618-111 seed command is exposed through package scripts', () => {
  assert.equal(packageJson.scripts['seed:req022'], 'node scripts/seed-req022-test-data.mjs');
});
