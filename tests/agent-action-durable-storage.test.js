const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const {
  allowsAgentActionMemoryStorage,
  agentActionDatabaseError,
  agentActionStorageMode,
  sanitizeAgentActionResultInput,
} = require('../src/lib/bna/agent-action-storage');

const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

test('deployed preview cannot opt into Agent Action memory storage', () => {
  const env = { RAILWAY_ENVIRONMENT_ID: 'preview', PLATFORM_PREVIEW_NO_DB: '1', AGENT_ACTION_STORAGE_MODE: 'memory' };
  assert.equal(allowsAgentActionMemoryStorage(env), false);
  assert.equal(agentActionStorageMode({ env, databaseUrl: '' }), 'unavailable');
  const error = agentActionDatabaseError(new Error('connection refused'));
  assert.equal(error.statusCode, 503);
  assert.equal(error.code, 'agent_action_database_unavailable');
  assert.doesNotMatch(error.message, /connection refused/);
});

test('Agent Action memory storage is explicitly local/test-only', () => {
  assert.equal(allowsAgentActionMemoryStorage({ NODE_ENV: 'test' }), true);
  assert.equal(agentActionStorageMode({ env: { NODE_ENV: 'test' }, databaseUrl: '' }), 'memory_local_test_only');
  assert.equal(agentActionStorageMode({ env: {}, databaseUrl: 'postgres://configured' }), 'postgres');
});

test('result sanitizer accepts result-only fields and drops customer/provider content', () => {
  const sanitized = sanitizeAgentActionResultInput({
    summary: 'Saved token=not-safe for a.person@example.org',
    evidence: ['read back', 'call +1 212 555 0199'],
    customer_transcript: [{ body: 'raw body' }],
    location_id: 'protected',
    message_body: 'never store',
  }, (value) => Array.isArray(value) ? value : []);
  const serialized = JSON.stringify(sanitized);
  assert.equal(sanitized.customer_content_included, false);
  assert.deepEqual(sanitized.ignored_sensitive_fields.sort(), ['customer_transcript', 'location_id', 'message_body']);
  assert.doesNotMatch(serialized, /not-safe|a\.person|212 555 0199|raw body|protected|never store/);
});

test('deployed APIs delegate to the single PostgreSQL repository for lifecycle and supersession', () => {
  assert.match(server, /createPostgresAgentActionRepository/);
  assert.match(server, /agentActionPostgresRepository\(db\)\.upsertJob/);
  assert.match(server, /agentActionPostgresRepository\(db\)\.saveResult/);
  assert.match(server, /agentActionPostgresRepository\(db\)\.readbackResult/);
  assert.match(server, /agentActionPostgresRepository\(pool\)\.supersedeMissing/);
  assert.match(server, /claimToken = sha256Hex\(`platform_control:/);
  assert.match(server, /result_only: true/);
});
