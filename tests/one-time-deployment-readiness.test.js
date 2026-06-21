const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const readiness = JSON.parse(fs.readFileSync('ops/one-time-mishnah/option-b-deployment-readiness.json', 'utf8'));
const readinessDoc = fs.readFileSync('ops/one-time-mishnah/one-time-option-b-deployment-readiness.md', 'utf8');
const currentStateAudit = fs.readFileSync('docs/audits/one-time-one-time/2026-06-18-current-state-and-deployment-audit.md', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const railwayJson = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
const railwayStart = fs.readFileSync('scripts/railway-start.mjs', 'utf8');

test('Option B readiness packet is local-only and operator-gated', () => {
  assert.equal(readiness.requirement_id, 'REQ-20260619-313');
  assert.equal(readiness.status, 'needs_operator_decision');
  assert.equal(readiness.mode, 'local_readiness_only');
  assert.equal(readiness.external_write_performed, false);
  assert.equal(readiness.production_mutation_performed, false);
  assert.equal(readiness.deploy_performed, false);
  assert.equal(readiness.live_smoke_performed, false);
  assert.match(readiness.blocker, /Operator must approve Option B ownership/);
  assert.ok(readiness.required_operator_decisions.some((item) => item.id === 'DEC-20260619-300'));
  assert.ok(readiness.required_operator_decisions.some((item) => item.id === 'Q-20260619-300'));
});

test('target architecture covers separate One Time deployment, database, domain, environments, and credentials', () => {
  assert.deepEqual(readiness.target_architecture, [
    'shared_bna_my_academy_codebase',
    'separate_one_time_client_deployment',
    'separate_one_time_production_variables',
    'separate_one_time_domain',
    'separate_one_time_production_database_when_approved',
    'separate_staging_and_production_environments',
    'no_reliance_on_bna_production_credentials',
  ]);
  [
    /Shared BNA\/My Academy codebase/,
    /Separate One Time client deployment/,
    /Separate One Time production variables/,
    /Separate One Time domain/,
    /Separate One Time production database when approved/,
    /No reliance on BNA production credentials/,
  ].forEach((pattern) => assert.match(readinessDoc, pattern));
});

test('all Batch 13 readiness artifacts are present in the packet and runbook', () => {
  const artifactKeys = new Set(readiness.readiness_artifacts.map((item) => item.key));
  [
    'option_b_architecture_decision_record',
    'one_time_deployment_profile',
    'one_time_identity_map',
    'database_installation_identity_guard',
    'schema_vs_client_seed_separation',
    'one_time_database_bootstrap_procedure',
    'railway_runbook',
    'railway_cost_worksheet',
    'asset_ownership_register',
    'domain_dns_launch_checklist',
    'rollback_plan',
    'backup_plan',
    'staging_smoke_plan',
    'production_launch_plan',
  ].forEach((key) => assert.ok(artifactKeys.has(key), key));
  [
    /## Deployment Profile/,
    /## Identity Map/,
    /## Database Identity Guard/,
    /## Schema vs Client Seed Separation/,
    /## Railway Runbook/,
    /## Cost Worksheet/,
    /## Asset Ownership Register/,
    /## Domain \/ DNS Checklist/,
    /## Backup Plan/,
    /## Rollback Plan/,
    /## Staging Smoke Plan/,
    /## Production Launch Plan/,
  ].forEach((pattern) => assert.match(readinessDoc, pattern));
});

test('blocked live actions include Railway, database, DNS, deploy, live smoke, and production mutations', () => {
  [
    'create_new_paid_railway_project',
    'create_or_attach_production_database',
    'write_railway_variables',
    'change_dns_records',
    'change_domain_ownership',
    'deploy_final_safe_app_bundle',
    'run_railway_doctor_against_new_one_time_service',
    'run_live_smoke_against_new_one_time_domain',
    'mutate_production_data',
    'send_external_notifications',
  ].forEach((action) => assert.ok(readiness.blocked_live_actions.includes(action), action));
  assert.match(readinessDoc, /Blocked until explicit approval/);
  assert.match(readinessDoc, /Create a new paid Railway project\/service/);
  assert.match(readinessDoc, /Write Railway variables/);
  assert.match(readinessDoc, /Run `railway up` or redeploy/);
});

test('local Railway and smoke inventory is declared without performing live deployment', () => {
  assert.equal(railwayJson.build.builder, 'NIXPACKS');
  assert.equal(packageJson.scripts.start, 'node scripts/railway-start.mjs');
  assert.match(packageJson.scripts['railway:doctor'], /railway-doctor\.ps1/);
  assert.match(packageJson.scripts['railway:redeploy'], /railway-redeploy\.ps1/);
  assert.match(packageJson.scripts['app:smoke'], /smoke-live-app\.mjs/);
  assert.match(packageJson.scripts['app:smoke:public-privacy'], /smoke-public-route-privacy\.mjs/);
  assert.match(railwayStart, /\['web', \{ command: 'node', args: \['server\.js'\] \}\]/);
  assert.match(railwayStart, /academy-telegram-worker/);
  assert.match(railwayStart, /rabbi-telegram-worker/);
  assert.equal(readiness.deploy_performed, false);
  assert.equal(readiness.live_smoke_performed, false);
});

test('current-state audit recommends Option B and documents unresolved deployment blockers', () => {
  assert.match(currentStateAudit, /Recommendation: Option B - shared codebase, separate client deployment/);
  assert.match(currentStateAudit, /Largest unresolved blockers/);
  assert.match(currentStateAudit, /Which party owns the One Time production assets/);
  assert.match(currentStateAudit, /current Railway service\/database/);
  assert.match(currentStateAudit, /domain\/subdomain/);
});
