const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

test('system truth commands are exposed through package scripts', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['system:truth'], 'node scripts/system-truth.mjs system');
  assert.equal(pkg.scripts['worktree:truth'], 'node scripts/system-truth.mjs worktree');
  assert.equal(pkg.scripts['source:truth'], 'node scripts/system-truth.mjs source');
  assert.equal(pkg.scripts['asset:truth'], 'node scripts/system-truth.mjs asset');
  assert.equal(pkg.scripts['drive:intake:truth'], 'node scripts/system-truth.mjs drive-intake');
  assert.equal(pkg.scripts['ui:source-coverage'], 'node scripts/system-truth.mjs ui');
  assert.equal(pkg.scripts['intake:github'], 'node scripts/intake-github.mjs');
});

test('system truth script reports readiness by variable state only', () => {
  const script = read('scripts/system-truth.mjs');
  assert.match(script, /variable_state_only: true/);
  assert.doesNotMatch(script, /fingerprint\(loaded\.value\)|value: loaded\.value/);
  assert.match(script, /VIMEO_ACCESS_TOKEN/);
  assert.match(script, /RESEND_DOMAIN/);
});

test('GitHub intake preview is idempotent and redacts secret-like text', async () => {
  const mod = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'intake-github.mjs')).href);
  const issue = {
    number: 7,
    title: 'Make every operator ramble flow through one canonical agent-execution system',
    body: 'Build the bridge. api_key=not_a_real_secret_fixture',
    state: 'open',
    created_at: '2026-06-22T11:56:17Z',
    user: { login: 'sdratler' }
  };
  const first = mod.buildGitHubIntakePreview({ issue, comments: [], repo: 'shloimie-beep/bnei-neviim-academy' });
  const second = mod.buildGitHubIntakePreview({ issue, comments: [], repo: 'shloimie-beep/bnei-neviim-academy' });
  assert.equal(first.source_envelope.idempotency_key, second.source_envelope.idempotency_key);
  assert.equal(first.trusted_source, true);
  assert.doesNotMatch(JSON.stringify(first), /not_a_real_secret_fixture/);
  assert.match(first.source_envelope.excerpt, /\[redacted/);
});
