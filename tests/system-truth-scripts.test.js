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
  assert.equal(pkg.scripts['bna:return-packet'], 'node scripts/system-truth.mjs return-packet');
});

test('system truth script reports readiness by variable state only', () => {
  const script = read('scripts/system-truth.mjs');
  assert.match(script, /variable_state_only: true/);
  assert.doesNotMatch(script, /fingerprint\(loaded\.value\)|value: loaded\.value/);
  assert.match(script, /VIMEO_ACCESS_TOKEN/);
  assert.match(script, /RESEND_DOMAIN/);
  assert.match(script, /CHATGPT-RETURN-PACKET\.md/);
  assert.match(script, /return-packet/);
});

test('return packet report keeps private and redacted packet paths explicit', async () => {
  const mod = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'system-truth.mjs')).href);
  const report = await mod.buildReport('return-packet');
  assert.equal(report.packet_contract, 'chatgpt-return-packet-v1');
  assert.equal(report.privacy_classification, 'internal_local_only');
  assert.equal(report.redacted_repo_classification, 'redacted_repo_safe');
  assert.equal(report.private_packet.markdown_path, '.runtime/system-reality-audit/CHATGPT-RETURN-PACKET.md');
  assert.equal(report.private_packet.json_path, '.runtime/system-reality-audit/CHATGPT-RETURN-PACKET.json');
  assert.match(report.redacted_repo_summary.markdown_path, /^ops\/return-packets\/\d{4}-\d{2}-\d{2}-complete-system-reality-redacted\.md$/);
  assert.equal(report.redacted_repo_summary.includes_private_raw_source, false);
  assert.equal(report.redacted_repo_summary.includes_secret_values, false);
  assert.ok(report.system_truth.branch);
  assert.equal(typeof report.system_truth.local_only_commits, 'number');
  assert.equal(typeof report.system_truth.unpulled_remote_commits, 'number');
  assert.deepEqual(report.resume_commands.slice(-3), [
    'npm run bna:run:resume',
    'npm run bna:run:blockers',
    'npm run bna:return-packet -- --json',
  ]);
  assert.deepEqual(report.private_files_not_pushed.map((file) => file.path), [
    '.runtime/system-reality-audit/CHATGPT-RETURN-PACKET.md',
    '.runtime/system-reality-audit/CHATGPT-RETURN-PACKET.json',
  ]);
  assert.ok(report.private_files_not_pushed.every((file) => file.gitignored === true));
  assert.ok(report.private_files_not_pushed.every((file) => file.pushed === false));
  assert.equal(report.external_gates.external_read_performed, false);
  assert.equal(report.external_gates.production_mutation_performed, false);
  assert.equal(report.external_gates.safe_apply_performed, false);
  assert.equal(report.external_gates.deploy_performed, false);
  assert.equal(report.external_gates.secrets_redacted, true);
  assert.ok(report.external_gates.scopes.some((scope) => scope.scope === 'database'));
  assert.ok(report.external_gates.scopes.some((scope) => scope.scope === 'railway'));
  assert.ok(report.external_gates.scopes.some((scope) => scope.scope === 'drive'));
  assert.doesNotMatch(JSON.stringify(report.external_gates), /DATABASE_URL|RAILWAY_TOKEN|GOOGLE_PRIVATE_KEY|secret-value|postgres:\/\//);
  const run = JSON.parse(read('ops/execution-runs/2026-06-23-complete-system-reconciliation/run.json'));
  if (run.git_refs?.last_validated_head) {
    assert.equal(report.system_truth.validated_agent_work_head, run.git_refs.last_validated_head);
    for (const item of report.agent_work) {
      assert.equal(item.commit, run.git_refs.last_validated_head);
    }
  }
  if (report.agent_work.some((item) => item.package === 'REQ-20260623-210')) {
    assert.equal(report.next_automatic_action.package, 'none');
    assert.match(report.next_automatic_action.command, /No unblocked automatic package/);
    assert.doesNotMatch(report.next_automatic_action.command, /continue the next unblocked canonical hardening slice/);
    assert.equal(report.verdict, 'PARTIAL - APPROVAL-GATED WORK REMAINS');
  }
});

test('system truth command runner preserves leading Git porcelain whitespace', async () => {
  const mod = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'system-truth.mjs')).href);
  const result = mod.run(process.execPath, [
    '-e',
    'process.stdout.write(" M first.js\\n?? second.js\\n")',
  ], { cwd: repoRoot });

  assert.equal(result.ok, true);
  assert.match(result.stdout, /^ M first\.js/);
  assert.match(result.stdout, /\?\? second\.js/);
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
