const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  buildOneTimeAgentModeAcceptance,
} = require('../src/platform/agent-control/one-time-acceptance');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const generator = fs.readFileSync('scripts/one-time-agent-mode-acceptance.mjs', 'utf8');
const liveSmoke = fs.readFileSync('scripts/smoke-one-time-agent-mode-acceptance-live.mjs', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

test('Agent Mode acceptance covers required One Time launch stages with no writes', () => {
  const acceptance = buildOneTimeAgentModeAcceptance({ checked_at: '2026-06-21T18:56:00+03:00' });
  assert.equal(acceptance.requirement_id, 'REQ-20260621-910');
  assert.equal(acceptance.status, 'pass');
  assert.equal(acceptance.workspace_key, 'rabbi_sheller_provider');
  assert.equal(acceptance.project_key, 'one_time_mishnah_class');
  assert.equal(acceptance.external_write_performed, false);
  assert.equal(acceptance.production_mutation_performed, false);
  assert.equal(acceptance.live_charge_performed, false);
  assert.equal(acceptance.live_send_performed, false);
  assert.equal(acceptance.external_crm_write_performed, false);

  const keys = new Set(acceptance.stages.map((stage) => stage.key));
  [
    'source_envelope_parser',
    'crm_import_dedupe',
    'trial_referral',
    'payment_access_class_links',
    'tickets_questions',
    'beta_test_data',
  ].forEach((key) => assert.ok(keys.has(key), key));

  assert.ok(Object.values(acceptance.acceptance_checks).every(Boolean));
  assert.deepEqual(acceptance.missing_stages, []);
  assert.deepEqual(acceptance.failed_stages, []);
});

test('Agent Mode acceptance keeps remaining blockers explicit and isolated', () => {
  const acceptance = buildOneTimeAgentModeAcceptance({ checked_at: '2026-06-21T18:56:00+03:00' });
  const blockerKeys = new Set(acceptance.remaining_external_blockers.map((item) => item.key));
  [
    'hosted_transcription_credential',
    'resend_sender_domain_fields',
    'vimeo_user_token',
    'separate_one_time_infrastructure',
  ].forEach((key) => assert.ok(blockerKeys.has(key), key));

  for (const blocker of acceptance.remaining_external_blockers) {
    assert.ok(blocker.owner, `${blocker.key} owner`);
    assert.ok(blocker.next_action, `${blocker.key} next_action`);
    assert.equal(blocker.external_write_required, true);
  }
});

test('server and Operations expose read-only Agent Mode acceptance', () => {
  assert.match(server, /buildOneTimeAgentModeAcceptance/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/agent-mode-acceptance', requireAdmin/);
  assert.match(server, /routePath === '\/api\/bna\/one-time\/agent-mode-acceptance' && method === 'GET'/);
  assert.match(server, /production_mutation_performed:\s*false/);

  assert.match(operations, /getOneTimeAgentModeAcceptance/);
  assert.match(operations, /data-one-time-agent-mode-acceptance/);
  assert.match(operations, /REQ-20260621-910/);
  assert.match(operations, /View Acceptance Evidence/);
  assert.match(operations, /Run Live Agent Mode/);
  assert.match(operations, /Read-only acceptance/);
});

test('route and action registries cover Agent Mode acceptance controls', () => {
  const route = routeRegistry.routes.find((item) => item.route === '/api/bna/one-time/agent-mode-acceptance');
  assert.equal(route.required_role, 'workspace_admin');
  assert.equal(route.workspace_scope_required, true);
  assert.equal(route.public_allowed, false);
  assert.match(route.security_expectation, /no-write flags/);

  const actions = new Set(actionRegistry.actions.map((item) => item.action_id));
  assert.ok(actions.has('ACTION-ONETIME-AGENT-ACCEPTANCE-VIEW-STATUS'));
  assert.ok(actions.has('ACTION-ONETIME-AGENT-ACCEPTANCE-VIEW-EVIDENCE'));
  assert.ok(actions.has('ACTION-ONETIME-AGENT-ACCEPTANCE-RUN-LIVE'));
});

test('Agent Mode acceptance scripts are registered and no-write guarded', () => {
  assert.equal(packageJson.scripts['one-time:agent-mode-acceptance'], 'node scripts/one-time-agent-mode-acceptance.mjs');
  assert.equal(packageJson.scripts['app:smoke:one-time-agent-mode-acceptance'], 'node scripts/smoke-one-time-agent-mode-acceptance-live.mjs');
  assert.match(generator, /agent-mode-acceptance\.json/);
  assert.match(generator, /remaining_external_blockers/);
  assert.match(liveSmoke, /production_mutation_performed === false/);
  assert.match(liveSmoke, /external_crm_write_performed === false/);
  assert.match(liveSmoke, /data-one-time-agent-mode-acceptance/);
});
