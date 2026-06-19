const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const runDir = path.join(root, 'ops', 'execution-runs', '2026-06-18-bna-platform-completion');
const requirementsPath = path.join(runDir, 'requirements.json');
const seedRunDir = path.join(root, 'ops', 'seed-runs', '2026-06-18-req022-local');
const seedCleanupDir = path.join(root, 'ops', 'seed-runs', '2026-06-18-req022-cleanup-local');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function byId(requirements) {
  return new Map(requirements.map((requirement) => [requirement.id, requirement]));
}

test('active run done requirements carry acceptance evidence and verification', () => {
  const run = readJson(requirementsPath);
  const requirements = byId(run.requirements);
  const locallyClosedIds = [
    'REQ-20260618-103',
    'REQ-20260618-104',
    'REQ-20260618-105',
    'REQ-20260618-106',
    'REQ-20260618-107',
    'REQ-20260618-108',
    'REQ-20260618-109',
    'REQ-20260618-110',
    'REQ-20260618-111',
    'REQ-20260618-119',
    'REQ-20260619-201',
    'REQ-20260619-202',
    'REQ-20260619-203',
    'REQ-20260619-204',
    'REQ-20260619-205',
    'REQ-20260619-208',
  ];

  for (const id of locallyClosedIds) {
    const requirement = requirements.get(id);
    assert.ok(requirement, `${id} is registered`);
    assert.equal(requirement.status, 'done', `${id} is locally done`);
    assert.ok(requirement.evidence?.length > 0, `${id} has evidence`);
    assert.ok(requirement.verification?.length > 0, `${id} has verification`);
    if (requirement.live_required) {
      assert.ok(requirement.deployment_evidence?.length > 0, `${id} records release/deploy handling`);
      assert.match(requirement.deployment_evidence.join(' '), /not deployed|release|operator rule|approval/i);
    }
  }
});

test('safe seed artifacts are dry-run only and cover remediated lanes', () => {
  const seedPlan = readJson(path.join(seedRunDir, 'plan.json'));
  const cleanupPlan = readJson(path.join(seedCleanupDir, 'plan.json'));
  const seedSql = fs.readFileSync(path.join(seedRunDir, 'seed.sql'), 'utf8');
  const cleanupSql = fs.readFileSync(path.join(seedCleanupDir, 'cleanup.sql'), 'utf8');

  for (const plan of [seedPlan, cleanupPlan]) {
    assert.equal(plan.dry_run, true);
    assert.equal(plan.seed_prefix, 'TEST_REQ022');
    assert.equal(plan.safety.default_dry_run, true);
    assert.equal(plan.safety.no_external_writes, true);
    assert.equal(plan.safety.secrets_printed, false);
  }

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
    assert.ok(seedPlan.required_coverage.includes(area), `seed plan covers ${area}`);
  }

  assert.match(seedSql, /BEGIN;[\s\S]*COMMIT;/);
  assert.match(seedSql, /req022_safe_repeatable_seed_v1/);
  assert.match(cleanupSql, /Deletes only TEST_REQ022 rows/);
  assert.doesNotMatch(`${seedSql}\n${cleanupSql}`, /TRUNCATE|DROP TABLE|SEND_WHATSAPP|APPROVE_BUFFER|client_secret|private_key/i);
});
