const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  STATUS_DEFINITIONS,
  buildOwnerSetupCatalog,
  listOwnerSetupIntegrationIds,
} = require('../src/lib/integrations/setup-catalog');

const repoRoot = path.resolve(__dirname, '..');

function assertNoSecretLikeValues(value) {
  const serialized = JSON.stringify(value);
  assert.doesNotMatch(serialized, /sk_(?:live|test)_[A-Za-z0-9]/);
  assert.doesNotMatch(serialized, /rk_(?:live|test)_[A-Za-z0-9]/);
  assert.doesNotMatch(serialized, /re_[A-Za-z0-9]{12,}/);
  assert.doesNotMatch(serialized, /whsec_[A-Za-z0-9]/);
  assert.doesNotMatch(serialized, /Bearer\s+[A-Za-z0-9._-]{12,}/i);
  assert.doesNotMatch(serialized, /postgres:\/\/[^"\\]+/i);
  assert.doesNotMatch(serialized, /api[_-]?key\s*[:=]\s*[^"',}\s]+/i);
  assert.doesNotMatch(serialized, /client[_-]?secret\s*[:=]\s*[^"',}\s]+/i);
}

test('owner setup catalog exposes required status vocabulary and all integration ids', () => {
  const catalog = buildOwnerSetupCatalog({ generatedAt: '2026-06-24T00:00:00.000Z', env: {} });
  assert.equal(catalog.secretValuesIncluded, false);
  assert.equal(catalog.safeLoggedOutState, true);
  assert.equal(catalog.authenticatedReadinessEndpoint, '/api/bna/integration-setup/readiness');
  for (const status of [
    'already_configured',
    'available_with_current_keys',
    'mock_tested_only',
    'sandbox_test_only',
    'preview_only',
    'missing_credential',
    'invalid_credential',
    'missing_account_permission',
    'missing_target',
    'owner_approval_required',
    'ready_for_live',
    'live',
  ]) {
    assert.ok(STATUS_DEFINITIONS[status], status);
  }
  assert.deepEqual(listOwnerSetupIntegrationIds(), catalog.cards.map((card) => card.id));
  assert.deepEqual(catalog.cards.map((card) => card.id), [
    'openai-hosted-ai',
    'kimi-fallback',
    'google-drive',
    'google-workspace-addons',
    'railway-database',
    'stripe',
    'vimeo',
    'zoom',
    'resend-email',
    'transcription',
    'telegram-academy-bot',
    'telegram-rabbi-worker',
    'github-actions',
    'buffer-social',
    'whatsapp-wapi',
    'green-invoice',
  ]);
});

test('every setup card has reason, next action, owner, links, identifiers, secrets, validation, and evidence', () => {
  const catalog = buildOwnerSetupCatalog({ generatedAt: '2026-06-24T00:00:00.000Z', env: {} });
  for (const card of catalog.cards) {
    assert.ok(STATUS_DEFINITIONS[card.currentSafeStatus], `${card.id} has known status`);
    assert.ok(card.statusReason && !/^blocked\.?$/i.test(card.statusReason), `${card.id} reason`);
    assert.ok(card.exactNextAction && !/^blocked\.?$/i.test(card.exactNextAction), `${card.id} next action`);
    assert.ok(card.whoMustAct, `${card.id} actor`);
    assert.ok(card.internalPageLink?.href, `${card.id} internal setup link`);
    assert.ok(card.internalPageLink?.operationsHref, `${card.id} Operations link`);
    assert.ok(card.externalAccountLink?.href?.startsWith('https://'), `${card.id} external link`);
    assert.ok(Array.isArray(card.requiredNonSecretIdentifiers), `${card.id} identifiers array`);
    assert.ok(Array.isArray(card.secretVariables) && card.secretVariables.length > 0, `${card.id} secret variable names`);
    assert.ok(Array.isArray(card.approvedSecretStore) && card.approvedSecretStore.length >= 2, `${card.id} secret store`);
    assert.ok(card.validation?.label === 'Run validation', `${card.id} validation label`);
    assert.ok(card.validation?.command, `${card.id} validation command`);
    assert.ok(card.expectedResult, `${card.id} expected result`);
    assert.ok(card.externalEffectsOfTest, `${card.id} external effects`);
    assert.ok(Array.isArray(card.liveAcceptanceCriteria) && card.liveAcceptanceCriteria.length >= 3, `${card.id} live criteria`);
    assert.ok(card.lastValidationTimestamp, `${card.id} last validation`);
    assert.ok(card.evidenceLink === card.walkthroughPath, `${card.id} evidence path`);
    assert.ok(fs.existsSync(path.join(repoRoot, card.evidenceLink)), `${card.id} evidence file exists`);
  }
});

test('catalog never includes secret-like values and statuses change precisely from env state', () => {
  const missing = buildOwnerSetupCatalog({ generatedAt: '2026-06-24T00:00:00.000Z', env: {} });
  assertNoSecretLikeValues(missing);
  const byId = Object.fromEntries(missing.cards.map((card) => [card.id, card]));
  assert.equal(byId['github-actions'].currentSafeStatus, 'missing_account_permission');
  assert.equal(byId.vimeo.currentSafeStatus, 'preview_only');
  assert.equal(byId.stripe.currentSafeStatus, 'missing_credential');

  const configured = buildOwnerSetupCatalog({
    generatedAt: '2026-06-24T00:00:00.000Z',
    env: {
      OPENAI_API_KEY: 'configured-openai-value',
      KIMI_API_KEY: 'configured-kimi-value',
      RABBI_STRIPE_SECRET_KEY: 'configured-stripe-value',
      RABBI_STRIPE_MODE: 'test',
      VIMEO_ACCESS_TOKEN: 'configured-vimeo-value',
      VIMEO_FOLDER: 'bna-test-folder',
      ZOOM_ACCOUNT_ID: 'acct',
      ZOOM_CLIENT_ID: 'client',
      ZOOM_CLIENT_SECRET: 'secret',
      ZOOM_SCOPES: 'meeting:write:admin meeting:read:admin user:read:admin',
      RESEND_API_KEY: 'configured-resend-value',
      RESEND_DOMAIN: 'updates.example.test',
      BUFFER_API_KEY: 'configured-buffer-value',
      BUFFER_ORGANIZATION_ID: 'org',
      WAPI_API_TOKEN: 'configured-wapi-value',
      DATABASE_URL: 'configured-db-value',
      RAILWAY_TOKEN: 'configured-railway-value',
    },
  });
  assertNoSecretLikeValues(configured);
  const configuredById = Object.fromEntries(configured.cards.map((card) => [card.id, card]));
  assert.equal(configuredById['openai-hosted-ai'].currentSafeStatus, 'available_with_current_keys');
  assert.equal(configuredById['kimi-fallback'].currentSafeStatus, 'available_with_current_keys');
  assert.equal(configuredById.stripe.currentSafeStatus, 'sandbox_test_only');
  assert.equal(configuredById.vimeo.currentSafeStatus, 'available_with_current_keys');
  assert.equal(configuredById.zoom.currentSafeStatus, 'available_with_current_keys');
  assert.equal(configuredById['resend-email'].currentSafeStatus, 'available_with_current_keys');
  assert.equal(configuredById['buffer-social'].currentSafeStatus, 'available_with_current_keys');
  assert.equal(configuredById['whatsapp-wapi'].currentSafeStatus, 'available_with_current_keys');
  assert.equal(configuredById['railway-database'].currentSafeStatus, 'available_with_current_keys');
});
