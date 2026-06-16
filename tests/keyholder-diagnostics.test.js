const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const diagnosticsUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'keyholder-diagnostics.mjs')).href;

async function loadDiagnostics() {
  return import(diagnosticsUrl);
}

test('keyholder normalization trims BOM, quotes, and whitespace without exposing values', async () => {
  const { fingerprintSecret, inspectSecretText, normalizeSecretText } = await loadDiagnostics();
  const secret = 'sk-test-value-that-must-not-print';
  const raw = `\uFEFF  "${secret}"\r\n`;
  const normalized = normalizeSecretText(raw);

  assert.equal(normalized.normalized, secret);
  assert.equal(normalized.had_bom, true);
  assert.equal(normalized.had_newline, true);
  assert.equal(normalized.had_carriage_return, true);
  assert.equal(normalized.surrounding_quotes, true);
  assert.equal(fingerprintSecret(secret), crypto.createHash('sha256').update(secret).digest('hex').slice(0, 12));

  const inspected = inspectSecretText(raw);
  assert.equal(inspected.present, true);
  assert.equal(inspected.fingerprint, fingerprintSecret(secret));
  assert.doesNotMatch(JSON.stringify(inspected), new RegExp(secret));
});

test('keyholder diagnostics inspect expected files and never include secret contents', async () => {
  const { KEYHOLDER_FILES, fingerprintSecret, inspectKeyholder } = await loadDiagnostics();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-keyholder-test-'));
  const keyholderDir = path.join(tempRoot, 'BNA-Keyholder');
  const repoRoot = path.join(tempRoot, 'repo');
  fs.mkdirSync(keyholderDir, { recursive: true });
  fs.mkdirSync(path.join(repoRoot, '.secrets'), { recursive: true });

  const secret = 'sk-test-super-secret-never-print';
  fs.writeFileSync(path.join(keyholderDir, 'openai-api-key.txt'), `${secret}\n`);
  fs.writeFileSync(path.join(repoRoot, '.secrets', 'openai-api-key.txt'), secret);

  const report = inspectKeyholder({ keyholderDir, repoRoot });
  const names = KEYHOLDER_FILES.map((file) => file.name);
  assert.deepEqual(
    ['openai-api-key.txt', 'buffer-api-key.txt', 'resend-api-key.txt', 'stripe-secret-key.txt', 'railway-token.txt']
      .every((name) => names.includes(name)),
    true
  );

  const openai = report.files.find((file) => file.name === 'openai-api-key.txt');
  assert.equal(openai.keyholder.present, true);
  assert.equal(openai.keyholder.fingerprint, fingerprintSecret(secret));
  assert.equal(openai.matches_repo_secret, true);
  assert.doesNotMatch(JSON.stringify(report), new RegExp(secret));

  fs.rmSync(tempRoot, { recursive: true, force: true });
});
