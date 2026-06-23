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
  assert.equal(pkg.scripts['bna:intake:postgres'], 'node scripts/canonical-intake-postgres.mjs');
  assert.equal(pkg.scripts['bna:release-gate'], 'node scripts/bna-production-closeout-gate.mjs');
  assert.equal(pkg.scripts['bna:external-readback-gate'], 'node scripts/bna-external-readback-gate.mjs');
});

test('system truth script reports readiness by variable state only', () => {
  const script = read('scripts/system-truth.mjs');
  assert.match(script, /variable_state_only: true/);
  assert.doesNotMatch(script, /fingerprint\(loaded\.value\)|value: loaded\.value/);
  assert.match(script, /VIMEO_ACCESS_TOKEN/);
  assert.match(script, /RESEND_DOMAIN/);
});

test('GitHub intake preview is idempotent and redacts secret-like text', async () => {
  assert.match(read('scripts/intake-github.mjs'), /intake-service/);
  assert.match(read('scripts/ramble-intake-contract.mjs'), /buildCanonicalIntakePacket/);
  assert.match(read('scripts/ramble-intake-contract.mjs'), /applyCanonicalIntakePacketToMemory/);
  assert.match(read('scripts/ramble-intake-contract.mjs'), /buildCanonicalIntakePostgresPlan/);
  assert.match(read('scripts/ramble-intake-contract.mjs'), /--memory-readback/);
  assert.match(read('scripts/ramble-intake-contract.mjs'), /--postgres-plan/);
  assert.match(read('scripts/canonical-intake-postgres.mjs'), /APPLY_CANONICAL_INTAKE_POSTGRES/);
  assert.match(read('scripts/canonical-intake-postgres.mjs'), /READ_CANONICAL_INTAKE_POSTGRES/);
  assert.match(read('scripts/canonical-intake-postgres.mjs'), /BNA_CANONICAL_INTAKE_POSTGRES_APPLY_APPROVED/);
  assert.match(read('scripts/canonical-intake-postgres.mjs'), /database_mutation_performed/);
  assert.match(read('scripts/bna-production-closeout-gate.mjs'), /DEPLOY_BNA_PRODUCTION_CLOSEOUT/);
  assert.match(read('scripts/bna-production-closeout-gate.mjs'), /VERIFY_BNA_LIVE_CLOSEOUT/);
  assert.match(read('scripts/bna-production-closeout-gate.mjs'), /BNA_PRODUCTION_DEPLOY_APPROVED/);
  assert.match(read('scripts/bna-production-closeout-gate.mjs'), /production_mutation_performed:\s*false/);
  assert.match(read('scripts/bna-external-readback-gate.mjs'), /READ_EXTERNAL_PRODUCTION_STATE/);
  assert.match(read('scripts/bna-external-readback-gate.mjs'), /APPLY_GUARDED_CLASS_BACKFILL/);
  assert.match(read('scripts/bna-external-readback-gate.mjs'), /BNA_EXTERNAL_READBACK_APPROVED/);
  assert.match(read('scripts/bna-external-readback-gate.mjs'), /external_read_performed:\s*false/);
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
  assert.equal(first.source_envelope.source_provider, 'github');
  assert.equal(first.source_envelope.source_channel, 'github');
  assert.equal(first.source_envelope.source_kind, 'github_issue');
  assert.match(first.parent_prompt_id, /^PROMPT-/);
  assert.equal(first.persistence_plan.contract_version, 'w3-canonical-intake-service-v1');
  assert.equal(first.persistence_plan.external_write_performed, false);
  assert.ok(first.persistence_plan.parse_item_count >= 1);
  assert.equal(first.persistence_plan.raw_intake_stable_id.startsWith('intake_source_'), true);
  assert.equal(first.trusted_source, true);
  assert.doesNotMatch(JSON.stringify(first), /not_a_real_secret_fixture/);
  assert.match(first.source_envelope.excerpt, /\[redacted/);
});
