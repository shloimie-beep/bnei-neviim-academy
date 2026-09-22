const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.join(__dirname, '..');
const report = fs.readFileSync(path.join(repoRoot, 'ops', 'provider-intake', 'provider-login-phase12-audit.md'), 'utf8');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const provider = fs.readFileSync(path.join(repoRoot, 'public', 'provider.html'), 'utf8');
const operations = fs.readFileSync(path.join(repoRoot, 'public', 'operations.html'), 'utf8');
const providerTest = fs.readFileSync(path.join(repoRoot, 'tests', 'service-provider-directory.test.js'), 'utf8');
const secretValuePattern = /(password|token|secret)\s*[:=]\s*['"][^'"\s]{12,}['"]/i;

test('Phase 12 provider-login audit has the required evidence sections', () => {
  const sections = [
    '## Summary',
    '## Evidence',
    '## Active Routes And APIs',
    '## Phase 12 Requirement Check',
    '## Current Guardrails',
    '## Fresh Live Smoke Needed',
    '## Current Recommendation',
  ];

  for (const section of sections) {
    assert.match(report, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('provider login implementation is scoped and secret-safe', () => {
  assert.match(server, /PROVIDER_SESSION_COOKIE_NAME/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_sessions/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_provider_password_setup_tokens/);
  assert.match(server, /app\.get\('\/api\/provider-portal\/setup-token'/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/setup-password'/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/login'/);
  assert.match(server, /app\.get\('\/api\/provider-portal\/session', requireProviderSession/);
  assert.match(server, /app\.patch\('\/api\/provider-portal\/profile', requireProviderSession/);
  assert.match(server, /status NOT IN \('draft', 'rejected', 'archived'\)/);
  assert.match(server, /Invalid provider credentials/);
  assert.doesNotMatch(server, /provider.*password.*required.*hash/i);
});

test('provider login page supports setup, login, and scoped portal without Grabify references', () => {
  assert.match(provider, /BNA Provider Portal/);
  assert.match(provider, /Scoped Provider Workspace/);
  assert.match(provider, /\/api\/provider-portal\/setup-token/);
  assert.match(provider, /\/api\/provider-portal\/setup-password/);
  assert.match(provider, /\/api\/provider-portal\/login/);
  assert.match(provider, /showLogin\(error\.message\)/);
  assert.match(providerTest, /provider login is scoped and keeps edits in BNA review/);

  for (const source of [server, provider, operations, providerTest]) {
    assert.doesNotMatch(source, /grabify/i);
  }

  assert.match(report, /Grabify bug check/);
  assert.doesNotMatch(report, /sk-[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(report, secretValuePattern);
});

test('provider-login audit records the prior live smoke and the remaining fresh-smoke need', () => {
  assert.match(report, /ops\/live-smokes\/2026-06-10T12-05-01-939Z-provider-portal-smoke\.md/);
  assert.match(report, /provider logs in and receives scoped session/);
  assert.match(report, /Create or edit one service and verify it lands in `pending_review`/);
  assert.match(report, /Do not create raw passwords in chat/);
});
