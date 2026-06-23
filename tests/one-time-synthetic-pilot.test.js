const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  buildOneTimeTestIdentityPreview,
  assertOneTimeTestFixtureSafety,
} = require('../src/platform/instances/one-time-test-fixtures');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const platformSynthetic = fs.readFileSync('scripts/platform-synthetic-e2e.mjs', 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

test('One Time TEST-prefixed fixture preview is cleanup-ready and no-write', () => {
  const preview = buildOneTimeTestIdentityPreview({ checked_at: '2026-06-21T18:42:00+03:00' });
  const safety = assertOneTimeTestFixtureSafety(preview);

  assert.equal(preview.requirement_id, 'REQ-20260621-909');
  assert.equal(preview.workspace_key, 'rabbi_sheller_provider');
  assert.equal(preview.project_key, 'one_time_mishnah_class');
  assert.equal(preview.fixture_prefix, 'TEST-');
  assert.equal(preview.external_write_performed, false);
  assert.equal(preview.records_created, false);
  assert.equal(preview.private_export_sources_included, false);
  assert.equal(preview.raw_private_rows_included, false);
  assert.equal(preview.cleanup_manifest.cleanup_ready, true);
  assert.equal(safety.ok, true, safety.failures.join('; '));

  for (const identity of preview.fixtures.identities) {
    assert.match(identity.key, /^TEST-/);
    assert.match(identity.display_name, /^TEST /);
    assert.match(identity.email, /@example\.test$/);
    assert.match(identity.cleanup_key, /^REQ-20260621-909:/);
    assert.equal(identity.private_export_source, false);
    assert.equal(identity.external_write_performed, false);
  }

  for (const row of [...preview.fixtures.relationships, ...preview.fixtures.mock_records]) {
    assert.match(row.key, /^TEST-/);
    assert.match(row.cleanup_key, /^REQ-20260621-909:/);
  }
});

test('One Time mock scenarios cover CRM, payment/access, class links, questions, and support', () => {
  const preview = buildOneTimeTestIdentityPreview({ checked_at: '2026-06-21T18:42:00+03:00' });
  const categories = new Set(preview.scenarios.map((scenario) => scenario.category));

  for (const category of ['crm', 'payment_access', 'class_links', 'questions', 'support']) {
    assert.ok(categories.has(category), `missing scenario category ${category}`);
  }

  assert.ok(preview.fixtures.mock_records.some((record) => record.category === 'payment_access' && record.live_charge_created === false));
  assert.ok(preview.fixtures.mock_records.some((record) => record.category === 'class_links' && record.raw_zoom_url_returned === false));
  assert.ok(preview.fixtures.mock_records.some((record) => record.category === 'questions' && record.public_forum_created === false));
  assert.ok(preview.fixtures.mock_records.some((record) => record.category === 'support' && record.staff_internal_notes_returned === false));
});

test('negative authorization matrix covers cross-workspace and own-record denials', () => {
  const preview = buildOneTimeTestIdentityPreview({ checked_at: '2026-06-21T18:42:00+03:00' });
  const keys = new Set(preview.negative_authorization_matrix.map((item) => item.key));

  [
    'TEST-AUTH-RABBI-BLOCKED-BNA-STUDENT',
    'TEST-AUTH-RABBI-BLOCKED-BNA-ACCOUNTING',
    'TEST-AUTH-ONETIME-STAFF-BLOCKED-BNA-PARENT-NOTES',
    'TEST-AUTH-BNA-STAFF-BLOCKED-ONETIME-PRIVATE',
    'TEST-AUTH-PARENT-BLOCKED-OTHER-CHILD',
    'TEST-AUTH-STUDENT-BLOCKED-OTHER-STUDENT',
    'TEST-AUTH-MANAGER-BLOCKED-PLATFORM-ROLE',
    'TEST-AUTH-QUERY-PARAM-CROSS-SCOPE-BLOCKED',
    'TEST-AUTH-CROSS-TASK-BLOCKED',
    'TEST-AUTH-CROSS-DECISION-BLOCKED',
    'TEST-AUTH-CROSS-MESSAGE-BLOCKED',
    'TEST-AUTH-CROSS-RECORDING-BLOCKED',
  ].forEach((key) => assert.ok(keys.has(key), key));

  assert.ok(preview.negative_authorization_matrix.every((item) => item.expected_status === 403));
  assert.ok(preview.negative_authorization_matrix.every((item) => item.external_write_performed === false));
});

test('server, Operations, route registry, and actions expose the guarded preview', () => {
  assert.match(server, /buildOneTimeTestIdentityPreview/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/test-identities-preview', requireAdmin/);
  assert.match(server, /routePath === '\/api\/bna\/one-time\/test-identities-preview' && method === 'GET'/);
  assert.match(server, /production_records_created:\s*false/);

  assert.match(operations, /getOneTimeTestIdentitiesPreview/);
  assert.match(operations, /data-one-time-test-identities-preview/);
  assert.match(operations, /REQ-20260621-909/);
  assert.match(operations, /Apply Mock Data/);
  assert.match(operations, /Cleanup TEST Records/);
  assert.match(operations, /no private exports/);

  const route = routeRegistry.routes.find((item) => item.route === '/api/bna/one-time/test-identities-preview');
  assert.equal(route.required_role, 'workspace_admin');
  assert.equal(route.workspace_scope_required, true);
  assert.equal(route.public_allowed, false);
  assert.match(route.security_expectation, /synthetic example\.test identities/);

  const actionIds = new Set(actionRegistry.actions.map((action) => action.action_id));
  assert.ok(actionIds.has('ACTION-ONETIME-TEST-IDENTITIES-REVIEW-AUTH-MATRIX'));
  assert.ok(actionIds.has('ACTION-ONETIME-TEST-IDENTITIES-APPLY-MOCK-DATA'));
  assert.ok(actionIds.has('ACTION-ONETIME-TEST-IDENTITIES-CLEANUP'));
});

test('platform synthetic E2E artifact records the TEST identity safety summary', () => {
  assert.equal(packageJson.scripts['platform:synthetic-e2e'], 'node scripts/platform-synthetic-e2e.mjs');
  assert.match(platformSynthetic, /buildCanonicalIntakePacket/);
  assert.match(platformSynthetic, /applyCanonicalIntakePacketToMemory/);
  assert.match(platformSynthetic, /canonical_intake/);
  assert.match(platformSynthetic, /buildOneTimeTestIdentityPreview/);
  assert.match(platformSynthetic, /assertOneTimeTestFixtureSafety/);
  assert.match(platformSynthetic, /test_identities_and_mock_data/);
  assert.match(platformSynthetic, /negative_authorization_keys/);
  assert.match(platformSynthetic, /private_export_sources_included/);
});
