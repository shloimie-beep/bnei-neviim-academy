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
  const readinessHelper = read('scripts/lib/integration-readiness.mjs');
  assert.match(script, /variable_state_only: true/);
  assert.doesNotMatch(script, /fingerprint\(loaded\.value\)|value: loaded\.value/);
  assert.match(readinessHelper, /VIMEO_ACCESS_TOKEN/);
  assert.match(readinessHelper, /RESEND_DOMAIN/);
  assert.match(script, /CHATGPT-RETURN-PACKET\.md/);
  assert.match(script, /return-packet/);
});

test('integration readiness rejects placeholder loaded values without leaking them', async () => {
  const mod = await import(pathToFileURL(path.join(repoRoot, 'scripts', 'lib', 'integration-readiness.mjs')).href);
  const report = mod.buildIntegrationReadinessSummary({
    generatedAt: '2026-06-23T00:00:00.000Z',
    loadSecretFn: ({ envName }) => ({
      configured: true,
      value: envName === 'OPENAI_API_KEY' ? 'TODO' : `secret-value-for-${envName}`,
      env_name: envName,
      source_type: 'env',
    }),
  });

  const groups = Object.fromEntries(report.groups.map((group) => [group.integration, group]));
  const openaiKey = groups.openai.fields.find((field) => field.name === 'OPENAI_API_KEY');
  assert.equal(groups.openai.ready, false);
  assert.equal(openaiKey.configured, false);
  assert.equal(openaiKey.source, 'placeholder');
  assert.ok(groups.openai.blockers.some((blocker) => /OPENAI_API_KEY is not configured/.test(blocker)));
  assert.doesNotMatch(JSON.stringify(report), /TODO|secret-value-for|sk_live_|sk_test_|postgres:\/\//);
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
  assert.equal(report.source_coverage.issue_sources_present.issue_7, true);
  assert.equal(report.source_coverage.issue_sources_present.issue_8, true);
  for (const issueKey of ['issue_7', 'issue_8']) {
    const dryRun = report.source_coverage.github_issue_dry_runs[issueKey];
    assert.equal(dryRun.present, true);
    assert.equal(dryRun.mode, 'dry_run');
    assert.equal(dryRun.external_write_performed, false);
    assert.equal(dryRun.secret_values_printed, false);
    assert.equal(dryRun.trusted_source, true);
    assert.equal(dryRun.privacy_classification, 'redacted_repo_safe');
    assert.equal(dryRun.parser_schema_valid, true);
    assert.match(dryRun.json_path, /ops\/source-truth\/.+github-issue-\d-dry-run\.json$/);
    assert.match(dryRun.markdown_path, /ops\/source-truth\/.+github-issue-\d-dry-run\.md$/);
  }
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
  const driveGate = report.external_gates.scopes.find((scope) => scope.scope === 'drive');
  assert.ok(driveGate.auth_paths.some((authPath) => authPath.path === 'application_credentials'));
  assert.ok(driveGate.auth_paths.some((authPath) => authPath.path === 'service_account_pair'));
  assert.ok(driveGate.auth_paths.some((authPath) => authPath.path === 'oauth_refresh_token'));
  assert.doesNotMatch(JSON.stringify(report.external_gates), /DATABASE_URL|RAILWAY_TOKEN|GOOGLE_(?:APPLICATION_CREDENTIALS|CLIENT_EMAIL|PRIVATE_KEY|CLIENT_ID|CLIENT_SECRET|REFRESH_TOKEN)|BNA_DRIVE_ROOT_FOLDER_ID|secret-value|postgres:\/\//);
  assert.equal(report.integration_readiness.variable_state_only, true);
  assert.equal(report.integration_readiness.secret_values_printed, false);
  assert.equal(report.integration_readiness.external_read_performed, false);
  const integrationGroups = Object.fromEntries(report.integration_readiness.groups.map((group) => [group.integration, group]));
  assert.ok(integrationGroups.openai);
  assert.ok(integrationGroups.vimeo);
  assert.ok(integrationGroups.resend);
  assert.ok(integrationGroups.stripe);
  assert.ok(integrationGroups.rabbi_telegram);
  assert.ok(integrationGroups.vimeo.fields.some((field) => field.name === 'VIMEO_ACCESS_TOKEN'));
  assert.ok(integrationGroups.resend.fields.some((field) => field.name === 'RESEND_DOMAIN'));
  assert.ok(integrationGroups.stripe.fields.some((field) => field.name === 'RABBI_STRIPE_MODE'));
  assert.ok(integrationGroups.rabbi_telegram.blockers.some((blocker) => /deployment state is not verified/i.test(blocker)));
  assert.doesNotMatch(JSON.stringify(report.integration_readiness), /secret-value|postgres:\/\/|sk_live_|sk_test_/);
  const run = JSON.parse(read('ops/execution-runs/2026-06-23-complete-system-reconciliation/run.json'));
  if (run.git_refs?.last_validated_head) {
    assert.equal(report.system_truth.validated_agent_work_head, run.git_refs.last_validated_head);
    for (const item of report.agent_work) {
      assert.equal(item.commit, run.git_refs.last_validated_head);
      assert.equal(item.validated_commit, run.git_refs.last_validated_head);
      assert.ok(['current_branch_head', 'execution_run_last_validated_head'].includes(item.commit_basis));
      if (item.validated_commit !== item.current_branch_head) {
        assert.equal(item.commit_basis, 'execution_run_last_validated_head');
      }
    }
  }
  for (const item of report.agent_work) {
    assert.equal(item.current_branch_head, report.system_truth.head);
  }
  const renderedPacket = mod.renderReturnPacketReport(report, { redacted: true });
  assert.match(renderedPacket, /- branch head: [0-9a-f]{40}/);
  assert.match(renderedPacket, /- validated Agent Work head: [0-9a-f]{40}/);
  assert.match(renderedPacket, /- issue source evidence: issue #7 present, issue #8 present/);
  assert.match(renderedPacket, /INTEGRATION READINESS/);
  assert.match(renderedPacket, /VIMEO_ACCESS_TOKEN=(configured|missing)/);
  assert.match(renderedPacket, /RESEND_DOMAIN=(configured|missing)/);
  assert.match(renderedPacket, /RABBI_STRIPE_MODE=(configured|missing)/);
  assert.match(renderedPacket, /AGENT WORK[\s\S]*branch [0-9a-f]{12} \/ validated [0-9a-f]{12}/);
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
