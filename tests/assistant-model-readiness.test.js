const assert = require('node:assert/strict');
const test = require('node:test');

const {
  MODEL_CREDENTIAL_STATES,
  buildModelReadinessMatrix,
  classifyModelCredentialState,
  disabledReasonForModelState,
  hasUsableCredential,
} = require('../src/platform/assistant/model-readiness');

test('model readiness distinguishes every required credential/runtime state', () => {
  assert.deepEqual(MODEL_CREDENTIAL_STATES, [
    'missing',
    'configured',
    'invalid',
    'test_only',
    'live',
    'rate_limited',
    'quota_exhausted',
    'external_outage',
  ]);

  assert.equal(classifyModelCredentialState({ provider: 'openai' }).state, 'missing');
  assert.equal(classifyModelCredentialState({ provider: 'openai', key_fingerprint: 'sha256:abc' }).state, 'configured');
  assert.equal(classifyModelCredentialState({ provider: 'openai', key_fingerprint: 'sha256:abc', status_code: 401 }).state, 'invalid');
  assert.equal(classifyModelCredentialState({ provider: 'openai', key_fingerprint: 'sha256:abc', test_only: true }).state, 'test_only');
  assert.equal(classifyModelCredentialState({ provider: 'openai', key_fingerprint: 'sha256:abc', live_validated_at: '2026-06-24T09:00:00Z' }).state, 'live');
  assert.equal(classifyModelCredentialState({ provider: 'openai', key_fingerprint: 'sha256:abc', status_code: 429, error: 'rate_limit' }).state, 'rate_limited');
  assert.equal(classifyModelCredentialState({ provider: 'openai', key_fingerprint: 'sha256:abc', status_code: 429, error: 'insufficient_quota' }).state, 'quota_exhausted');
  assert.equal(classifyModelCredentialState({ provider: 'openai', key_fingerprint: 'sha256:abc', status_code: 503 }).state, 'external_outage');
});

test('model readiness disabled reasons are exact and never generic Blocked', () => {
  for (const state of MODEL_CREDENTIAL_STATES.filter((item) => item !== 'live')) {
    const reason = disabledReasonForModelState(state);
    assert.ok(reason);
    assert.doesNotMatch(reason, /^blocked$/i);
    assert.doesNotMatch(reason, /api[_-]?key|secret|password|sk-/i);
  }

  const invalid = classifyModelCredentialState({
    provider: 'kimi',
    key_fingerprint: 'sha256:def',
    error: 'authentication failed: sk-should-not-be-output',
  });
  assert.equal(invalid.state, 'invalid');
  assert.equal(invalid.secret_visible, false);
  assert.doesNotMatch(JSON.stringify(invalid), /sk-should-not-be-output/);
});

test('model readiness matrix is provider-neutral for users but diagnostic for audits', () => {
  const matrix = buildModelReadinessMatrix([
    { provider: 'openai', key_fingerprint: 'sha256:abc', live_validated_at: '2026-06-24T09:00:00Z', model: 'gpt-test' },
    { provider: 'kimi', configured: false, model: 'kimi-test' },
    { provider: 'fallback', configured: true, status_code: 429, error: 'insufficient_quota' },
  ], { primaryProvider: 'openai' });

  assert.equal(matrix.matrix_version, 'assistant-model-readiness-v1');
  assert.equal(matrix.primary_provider, 'openai');
  assert.equal(matrix.live_provider_count, 1);
  assert.equal(matrix.configured_provider_count, 2);
  assert.equal(matrix.model_call_allowed, true);
  assert.deepEqual(
    matrix.exact_disabled_reasons.map((row) => row.state),
    ['missing', 'quota_exhausted']
  );
  assert.match(matrix.user_safe_unavailable_message, /hosted assistant is temporarily unavailable/i);
  assert.doesNotMatch(matrix.user_safe_unavailable_message, /openai|kimi|api key|quota/i);
});

test('placeholder credentials are treated as missing', () => {
  for (const value of ['', 'TODO', 'changeme', '[redacted]', 'test_only']) {
    assert.equal(hasUsableCredential(value), false);
  }
  assert.equal(hasUsableCredential('sha256:abc123'), true);
});
