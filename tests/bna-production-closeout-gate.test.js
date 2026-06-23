const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');

async function loadGate() {
  return import(pathToFileURL(path.join(repoRoot, 'scripts', 'bna-production-closeout-gate.mjs')).href);
}

function fakeGitRunner({ status = '', branch = 'codex/issue-8-complete-system-reconciliation', head = 'abc123', remoteHead = 'abc123' } = {}) {
  return (command, args = []) => {
    assert.equal(command, 'git');
    const key = args.join(' ');
    if (key === 'branch --show-current') return { ok: true, status: 0, stdout: branch, stderr: '' };
    if (key === 'rev-parse HEAD') return { ok: true, status: 0, stdout: head, stderr: '' };
    if (key === 'status --porcelain=v1') return { ok: true, status: 0, stdout: status, stderr: '' };
    if (key === `rev-parse origin/${branch}` || key === 'rev-parse origin/codex/issue-8-complete-system-reconciliation') {
      return { ok: Boolean(remoteHead), status: remoteHead ? 0 : 1, stdout: remoteHead || '', stderr: '' };
    }
    if (key === 'rev-parse --abbrev-ref --symbolic-full-name @{u}') {
      return { ok: true, status: 0, stdout: `origin/${branch}`, stderr: '' };
    }
    return { ok: false, status: 1, stdout: '', stderr: `unexpected git args: ${key}` };
  };
}

function integrationReadiness(groups) {
  return {
    variable_state_only: true,
    secret_values_printed: false,
    external_read_performed: false,
    groups,
  };
}

const readyIntegrationReadiness = integrationReadiness([
  { integration: 'openai', label: 'OpenAI transcription/parser', ready: true, fields: [], blockers: [] },
  { integration: 'vimeo', label: 'Vimeo video/member library', ready: true, fields: [], blockers: [] },
  { integration: 'resend', label: 'Resend email sending/domain', ready: true, fields: [], blockers: [] },
  { integration: 'stripe', label: 'Stripe payment mode', ready: true, fields: [], blockers: [] },
  { integration: 'rabbi_telegram', label: 'Rabbi Telegram worker', ready: true, fields: [], blockers: [] },
]);

const readyExternalReadbackGate = {
  ok: true,
  mode: 'dry_run',
  scopes: [
    { scope: 'database', ready: true, secrets_configured: 1, secrets_required: 1, config_configured: 0, config_required: 0 },
    { scope: 'railway', ready: true, secrets_configured: 1, secrets_required: 1, config_configured: 3, config_required: 6 },
    { scope: 'drive', ready: true, secrets_configured: 1, secrets_required: 4, config_configured: 1, config_required: 4 },
  ],
  external_read_performed: false,
  production_mutation_performed: false,
  safe_apply_performed: false,
  deploy_performed: false,
  secrets_redacted: true,
  blockers: [],
  approval_gates: {
    readback: { requested: false, approved: false },
    backfill_apply: { requested: false, approved: false },
  },
  next_command_plan: [],
};

test('production closeout gate passes a clean pushed dry-run without external actions', async () => {
  const mod = await loadGate();
  const report = await mod.buildProductionCloseoutGateReport({
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner(),
    env: {},
  });

  assert.equal(report.ok, true);
  assert.equal(report.mode, 'dry_run');
  assert.equal(report.production_mutation_performed, false);
  assert.equal(report.deploy_performed, false);
  assert.equal(report.live_verification_performed, false);
  assert.equal(report.git.head_pushed, true);
  assert.equal(report.git.dirty.total, 0);
  assert.equal(report.external_readback_gate.external_read_performed, false);
  assert.equal(report.external_readback_gate.production_mutation_performed, false);
  assert.equal(report.external_readback_gate.secrets_redacted, true);
  assert.ok(report.external_readback_gate.scopes.some((scope) => scope.scope === 'database'));
  assert.ok(report.external_readback_gate.scopes.some((scope) => scope.scope === 'railway'));
  assert.ok(report.external_readback_gate.scopes.some((scope) => scope.scope === 'drive'));
  assert.equal(report.integration_readiness.variable_state_only, true);
  assert.equal(report.integration_readiness.secret_values_printed, false);
  assert.equal(report.integration_readiness.external_read_performed, false);
  assert.equal(report.package_scripts.missing.length, 0);
  assert.ok(report.run.open_requirements.some((requirement) => requirement.id === 'REQ-20260623-210'));
  assert.ok(report.next_command_plan.some((command) => /bna:release-gate/.test(command)));
  assert.ok(report.next_command_plan.some((command) => /bna:external-readback-gate/.test(command)));
  assert.doesNotMatch(JSON.stringify(report.external_readback_gate), /DATABASE_URL|RAILWAY_TOKEN|GOOGLE_PRIVATE_KEY|secret-value|postgres:\/\//);
  assert.doesNotMatch(JSON.stringify(report), /postgres:\/\/|DATABASE_URL=|RAILWAY_TOKEN=|secret-value/i);
});

test('production closeout gate blocks dirty or unpushed deploy state', async () => {
  const mod = await loadGate();
  const report = await mod.buildProductionCloseoutGateReport({
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner({
      status: ' M server.js\n?? ops/watchdog-audits/example.md',
      remoteHead: 'different456',
    }),
    env: {},
  });

  assert.equal(report.ok, false);
  assert.equal(report.git.head_pushed, false);
  assert.equal(report.git.dirty.total, 2);
  assert.equal(report.git.dirty.staged, 0);
  assert.equal(report.git.dirty.modified, 1);
  assert.equal(report.git.dirty.untracked, 1);
  assert.ok(report.blockers.some((blocker) => /not confirmed pushed/i.test(blocker)));
  assert.ok(report.blockers.some((blocker) => /dirty or untracked files/i.test(blocker)));
});

test('default command runner preserves leading Git porcelain whitespace', async () => {
  const mod = await loadGate();
  const result = mod.defaultRunCommand(process.execPath, [
    '-e',
    'process.stdout.write(" M first.js\\n?? second.js\\n")',
  ], { cwd: repoRoot });

  assert.equal(result.ok, true);
  assert.match(result.stdout, /^ M first\.js/);
  assert.match(result.stdout, /\?\? second\.js/);
});

test('production closeout gate supports clean detached release-candidate checkouts', async () => {
  const mod = await loadGate();
  const report = await mod.buildProductionCloseoutGateReport({
    allowDetached: true,
    remoteBranch: 'codex/issue-8-complete-system-reconciliation',
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner({ branch: '', head: 'release123', remoteHead: 'release123' }),
    env: {},
  });

  assert.equal(report.ok, true);
  assert.equal(report.git.branch, '(detached)');
  assert.equal(report.git.allow_detached, true);
  assert.equal(report.git.detached_allowed, true);
  assert.equal(report.git.remote_branch, 'origin/codex/issue-8-complete-system-reconciliation');
  assert.equal(report.git.head_pushed, true);
  assert.equal(report.production_mutation_performed, false);
  assert.equal(report.deploy_performed, false);
  assert.equal(report.live_verification_performed, false);
});

test('production closeout gate blocks detached checkout without explicit release-candidate mode', async () => {
  const mod = await loadGate();
  const report = await mod.buildProductionCloseoutGateReport({
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner({ branch: '', head: 'release123', remoteHead: 'release123' }),
    env: {},
  });

  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((blocker) => /detached/i.test(blocker)));
  assert.equal(report.git.head_pushed, true);
  assert.equal(report.production_mutation_performed, false);
});

test('production closeout gate requires explicit deploy and live verification approvals', async () => {
  const mod = await loadGate();
  const blocked = await mod.buildProductionCloseoutGateReport({
    deploy: true,
    liveVerify: true,
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner(),
    env: {},
  });

  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.some((blocker) => /DEPLOY_BNA_PRODUCTION_CLOSEOUT/.test(blocker)));
  assert.ok(blocked.blockers.some((blocker) => /BNA_PRODUCTION_DEPLOY_APPROVED=approved/.test(blocker)));
  assert.ok(blocked.blockers.some((blocker) => /VERIFY_BNA_LIVE_CLOSEOUT/.test(blocker)));
  assert.ok(blocked.blockers.some((blocker) => /BNA_LIVE_VERIFY_APPROVED=approved/.test(blocker)));

  const approved = await mod.buildProductionCloseoutGateReport({
    deploy: true,
    liveVerify: true,
    confirmDeploy: mod.DEPLOY_CONFIRM_PHRASE,
    confirmLive: mod.LIVE_VERIFY_CONFIRM_PHRASE,
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner(),
    integrationReadiness: readyIntegrationReadiness,
    externalReadbackGate: readyExternalReadbackGate,
    env: {
      [mod.DEPLOY_APPROVAL_ENV]: 'approved',
      [mod.LIVE_VERIFY_APPROVAL_ENV]: 'approved',
    },
  });

  assert.equal(approved.ok, true);
  assert.equal(approved.approval_gates.deploy.approved, true);
  assert.equal(approved.approval_gates.live_verify.approved, true);
  assert.equal(approved.production_mutation_performed, false);
});

test('production closeout gate blocks live verification on missing integration readiness', async () => {
  const mod = await loadGate();
  const report = await mod.buildProductionCloseoutGateReport({
    liveVerify: true,
    confirmLive: mod.LIVE_VERIFY_CONFIRM_PHRASE,
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner(),
    env: {
      [mod.LIVE_VERIFY_APPROVAL_ENV]: 'approved',
    },
    externalReadbackGate: readyExternalReadbackGate,
    integrationReadiness: integrationReadiness([
      {
        integration: 'vimeo',
        label: 'Vimeo video/member library',
        ready: false,
        fields: [
          { name: 'VIMEO_ACCESS_TOKEN', configured: false, source: 'not configured' },
        ],
        blockers: ['VIMEO_ACCESS_TOKEN is not configured.'],
      },
    ]),
  });

  assert.equal(report.ok, false);
  assert.equal(report.live_verification_performed, false);
  assert.ok(report.blockers.some((blocker) => /Vimeo video\/member library readiness is blocked/i.test(blocker)));
  assert.match(JSON.stringify(report.integration_readiness), /VIMEO_ACCESS_TOKEN/);
  assert.doesNotMatch(JSON.stringify(report.integration_readiness), /secret-value|sk_live_|sk_test_|postgres:\/\//);
});

test('production closeout gate blocks live verification on missing external readback readiness', async () => {
  const mod = await loadGate();
  const report = await mod.buildProductionCloseoutGateReport({
    liveVerify: true,
    confirmLive: mod.LIVE_VERIFY_CONFIRM_PHRASE,
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner(),
    env: {
      [mod.LIVE_VERIFY_APPROVAL_ENV]: 'approved',
    },
    integrationReadiness: readyIntegrationReadiness,
    externalReadbackGate: {
      ...readyExternalReadbackGate,
      ok: false,
      scopes: [
        { scope: 'database', ready: true, secrets_configured: 1, secrets_required: 1, config_configured: 0, config_required: 0 },
        { scope: 'railway', ready: false, secrets_configured: 0, secrets_required: 1, config_configured: 0, config_required: 6 },
        { scope: 'drive', ready: false, secrets_configured: 0, secrets_required: 4, config_configured: 0, config_required: 4 },
      ],
      blockers: [
        'railway readback gate is not ready; required configured state is missing.',
        'drive readback gate is not ready; required configured state is missing.',
      ],
    },
  });

  assert.equal(report.ok, false);
  assert.equal(report.live_verification_performed, false);
  assert.ok(report.blockers.some((blocker) => /railway external readback readiness is blocked/i.test(blocker)));
  assert.ok(report.blockers.some((blocker) => /drive external readback readiness is blocked/i.test(blocker)));
  assert.equal(report.external_readback_gate.external_read_performed, false);
  assert.equal(report.external_readback_gate.production_mutation_performed, false);
  assert.doesNotMatch(JSON.stringify(report.external_readback_gate), /DATABASE_URL|RAILWAY_TOKEN|GOOGLE_PRIVATE_KEY|secret-value|postgres:\/\//);
});

test('production closeout gate blocks deploy on missing external readback readiness', async () => {
  const mod = await loadGate();
  const report = await mod.buildProductionCloseoutGateReport({
    deploy: true,
    confirmDeploy: mod.DEPLOY_CONFIRM_PHRASE,
    expectedBranch: 'codex/issue-8-complete-system-reconciliation',
  }, {
    repoRoot,
    runCommand: fakeGitRunner(),
    env: {
      [mod.DEPLOY_APPROVAL_ENV]: 'approved',
    },
    integrationReadiness: readyIntegrationReadiness,
    externalReadbackGate: {
      ...readyExternalReadbackGate,
      ok: false,
      scopes: [
        { scope: 'database', ready: false, secrets_configured: 0, secrets_required: 1, config_configured: 0, config_required: 0 },
        { scope: 'railway', ready: false, secrets_configured: 0, secrets_required: 1, config_configured: 0, config_required: 6 },
        { scope: 'drive', ready: true, secrets_configured: 1, secrets_required: 4, config_configured: 1, config_required: 4 },
      ],
      blockers: [
        'database readback gate is not ready; required configured state is missing.',
        'railway readback gate is not ready; required configured state is missing.',
      ],
    },
  });

  assert.equal(report.ok, false);
  assert.equal(report.mode, 'deploy_gate');
  assert.equal(report.deploy_performed, false);
  assert.equal(report.production_mutation_performed, false);
  assert.ok(report.blockers.some((blocker) => /database external readback readiness is blocked/i.test(blocker)));
  assert.ok(report.blockers.some((blocker) => /railway external readback readiness is blocked/i.test(blocker)));
  assert.doesNotMatch(JSON.stringify(report.external_readback_gate), /DATABASE_URL|RAILWAY_TOKEN|GOOGLE_PRIVATE_KEY|secret-value|postgres:\/\//);
});
