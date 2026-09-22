const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  classifyProviderHttpError,
  fingerprintSecret,
  loadOpenAiCredentialCandidates,
  redactProviderError,
} = require('../src/lib/integrations/ai-credential-resolver');

test('OpenAI credential candidates keep env first and keyholder v2 second without exposing values', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-ai-credential-'));
  const keyholder = path.join(root, 'BNA-Keyholder');
  fs.mkdirSync(keyholder, { recursive: true });

  fs.writeFileSync(path.join(keyholder, 'openaiv2.txt'), 'fixture-openai-v2-secret-never-print');
  fs.writeFileSync(path.join(keyholder, 'openai-api-key.txt'), 'fixture-openai-old-secret-never-print');

  const candidates = loadOpenAiCredentialCandidates({
    repoRoot: root,
    env: { OPENAI_API_KEY: 'fixture-openai-env-secret-never-print' },
    keyholderRoots: [keyholder],
    secretsRoot: path.join(root, '.secrets'),
  });

  assert.equal(candidates.length, 3);
  assert.deepEqual(candidates.map((candidate) => candidate.source), [
    'runtime-env:OPENAI_API_KEY',
    'keyholder:openaiv2.txt',
    'keyholder:openai-api-key.txt',
  ]);
  assert.equal(candidates[1].fingerprint, fingerprintSecret('fixture-openai-v2-secret-never-print'));
  assert.doesNotMatch(
    JSON.stringify(candidates.map(({ source, fingerprint }) => ({ source, fingerprint }))),
    /fixture-openai-[a-z-]*secret/,
  );

  fs.rmSync(root, { recursive: true, force: true });
});

test('OpenAI credential candidates dedupe identical env and v2 values', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-ai-credential-dedupe-'));
  const keyholder = path.join(root, 'BNA-Keyholder');
  fs.mkdirSync(keyholder, { recursive: true });

  fs.writeFileSync(path.join(keyholder, 'openaiv2.txt'), 'fixture-openai-same-secret');
  const candidates = loadOpenAiCredentialCandidates({
    repoRoot: root,
    env: { OPENAI_API_KEY: 'fixture-openai-same-secret' },
    keyholderRoots: [keyholder],
    secretsRoot: path.join(root, '.secrets'),
  });

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].source, 'runtime-env:OPENAI_API_KEY');

  fs.rmSync(root, { recursive: true, force: true });
});

test('provider error classification treats 401 invalid key as auth_invalid_key', () => {
  const body = JSON.stringify({
    error: {
      type: 'invalid_request_error',
      code: 'invalid_api_key',
      message: 'Incorrect API key provided: sk-secret',
    },
  });
  assert.equal(classifyProviderHttpError(401, body), 'auth_invalid_key');
  assert.equal(classifyProviderHttpError(429, '{"error":{"message":"rate limit"}}'), 'rate_limited');
  assert.equal(classifyProviderHttpError(503, 'temporarily unavailable'), 'provider_unavailable');
});

test('provider error redaction removes loaded secret values and bearer tokens', () => {
  const redacted = redactProviderError('Authorization: Bearer abc.def.ghi and sk-proj-secret-value', ['sk-proj-secret-value']);
  assert.doesNotMatch(redacted, /sk-proj-secret-value/);
  assert.doesNotMatch(redacted, /abc\.def\.ghi/);
  assert.match(redacted, /\[redacted\]/);
});
