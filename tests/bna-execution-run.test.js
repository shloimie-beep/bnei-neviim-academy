const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts', 'bna-execution-run.mjs');

const requiredMarkdown = {
  'SOURCE.md': '# Source\n',
  'REQUIREMENTS.md': '# Requirements\n',
  'BASELINE.md': '# Baseline\n',
  'PLAN.md': '# Plan\n',
  'STATUS.md': '# Status\n',
  'EVIDENCE.md': '# Evidence\n',
  'TEST-RESULTS.md': '# Test Results\n',
  'DEPLOYMENT.md': '# Deployment\n',
  'BATCH-STATUS.md': '# Batch Status\n',
  'NEXT-SESSION.md': '# Next Session\nResume REQ-20260618-901.\n'
};

function baseRequirement(overrides = {}) {
  return {
    id: 'REQ-20260618-901',
    title: 'Protocol validator fixture',
    status: 'not_started',
    expected_result: 'Validator fixture remains resumable.',
    source_id: 'RAW-20260618-901',
    source_statement_ids: ['STMT-20260618-901-001'],
    source_path: 'raw-input/RAW-20260618-901-fixture.md',
    workspace_key: 'test_workspace',
    project_key: 'test_project',
    owner: 'Codex',
    category: 'protocol',
    priority: 'P0',
    batch_id: 'batch-fixture',
    depends_on: [],
    implementation_status: 'not_started',
    can_continue_without_operator: true,
    next_action: 'Continue the validator fixture.',
    acceptance_criteria: ['Fixture validation passes.'],
    source: 'test',
    depends_on_audit_output: false,
    live_required: false,
    deployment_required: false,
    evidence: [],
    deployment_evidence: [],
    verification: [],
    implementation_files: [],
    implementation_commit: '',
    pushed_commit: '',
    pull_request: '',
    deployment_id: '',
    deployed_commit: '',
    live_smoke: '',
    superseded_by: '',
    updated_at: '2026-06-18T00:00:00+03:00',
    ...overrides
  };
}

function sourceMetadata(overrides = {}) {
  return {
    source_id: 'RAW-20260618-901',
    source_path: 'raw-input/RAW-20260618-901-fixture.md',
    captured_at: '2026-06-18T00:00:00+03:00',
    content_fingerprint: 'sha256:fixture',
    privacy_classification: 'internal_test',
    workspace: 'test_workspace',
    project: 'test_project',
    source_type: 'codex_fixture',
    ...overrides
  };
}

function makeRoot({
  requirements = [baseRequirement()],
  nextSession = true,
  nextSessionContent = requiredMarkdown['NEXT-SESSION.md'],
  latestPath,
  docOverrides = {},
  runOverrides = {},
  extraActiveRuns = []
} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-run-'));
  const runId = '2026-06-18-validator-fixture';
  const runPath = latestPath || `ops/execution-runs/${runId}`;
  const runDir = path.join(root, runPath);
  fs.mkdirSync(runDir, { recursive: true });

  for (const [fileName, content] of Object.entries(requiredMarkdown)) {
    if (fileName === 'NEXT-SESSION.md' && !nextSession) {
      continue;
    }
    fs.writeFileSync(
      path.join(runDir, fileName),
      fileName === 'NEXT-SESSION.md' ? nextSessionContent : content
    );
  }

  fs.mkdirSync(path.join(root, 'raw-input'), { recursive: true });
  fs.writeFileSync(path.join(root, 'raw-input', 'RAW-20260618-901-fixture.md'), '# Raw fixture\n');

  fs.writeFileSync(
    path.join(runDir, 'requirements.json'),
    JSON.stringify(
      {
        run_id: runId,
        title: 'Validator Fixture',
        updated_at: '2026-06-18T00:00:00+03:00',
        requirements,
        ...docOverrides
      },
      null,
      2
    )
  );
  fs.writeFileSync(
    path.join(runDir, 'run.json'),
    JSON.stringify(
      {
        run_id: runId,
        title: 'Validator Fixture',
        created_at: '2026-06-18T00:00:00+03:00',
        updated_at: '2026-06-18T00:00:00+03:00',
        active: true,
        ...runOverrides
      },
      null,
      2
    )
  );

  fs.mkdirSync(path.join(root, 'ops', 'execution-runs'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'ops', 'execution-runs', 'latest.json'),
    JSON.stringify(
      {
        run_id: runId,
        path: runPath,
        updated_at: '2026-06-18T00:00:00+03:00'
      },
      null,
      2
    )
  );

  for (const extraRun of extraActiveRuns) {
    const extraRunDir = path.join(root, 'ops', 'execution-runs', extraRun.run_id);
    fs.mkdirSync(extraRunDir, { recursive: true });
    fs.writeFileSync(
      path.join(extraRunDir, 'run.json'),
      JSON.stringify(
        {
          run_id: extraRun.run_id,
          title: extraRun.title || extraRun.run_id,
          active: extraRun.active ?? true
        },
        null,
        2
      )
    );
  }

  return root;
}

function validate(root) {
  return spawnSync(process.execPath, [scriptPath, 'validate', '--root', root], {
    encoding: 'utf8'
  });
}

function git(root, args) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return String(result.stdout || '').trim();
}

test('valid execution run passes', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'blocked',
        depends_on_audit_output: true,
        blocker: 'Waiting for user to upload agent-review-package.zip or audit output path',
        blocker_owner: 'operator',
        blocker_next_action: 'Upload agent-review-package.zip or provide the audit output path.'
      })
    ]
  });
  const result = validate(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validation passed/);
});

test('mapped source statements with source metadata pass', () => {
  const root = makeRoot({
    requirements: [baseRequirement({ status: 'not_started' })],
    docOverrides: {
      sources: [sourceMetadata()],
      source_statements: [
        {
          statement_id: 'STMT-20260618-901-001',
          source_id: 'RAW-20260618-901',
          source_statement: 'The validator should accept mapped source rows.',
          requirement_id: 'REQ-20260618-901',
          classification: 'missing'
        }
      ]
    }
  });

  const result = validate(root);
  assert.equal(result.status, 0, result.stderr);
});

test('duplicate requirement IDs fail', () => {
  const root = makeRoot({
    requirements: [baseRequirement(), baseRequirement({ title: 'Duplicate fixture' })]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duplicate requirement id/i);
});

test('invalid statuses fail', () => {
  const root = makeRoot({
    requirements: [baseRequirement({ status: 'almost_done' })]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /invalid status/i);
});

test('closed requirement without evidence fails', () => {
  const root = makeRoot({
    requirements: [baseRequirement({ status: 'done', evidence: [] })]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /closed requirement requires evidence/i);
});

test('live-required closed item without deployment evidence fails', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'verified',
        live_required: true,
        evidence: ['tests passed'],
        deployment_evidence: []
      })
    ]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /deployment\/live evidence/i);
});

test('live-required closed item with only withheld deployment text fails', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'verified',
        live_required: true,
        evidence: ['raw-input/RAW-20260618-901-fixture.md'],
        deployment_evidence: ['Not deployed by operator rule; deployment withheld.']
      })
    ]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not only withheld\/not-deployed text/i);
});

test('closed requirement with missing evidence path fails', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'done',
        evidence: ['tests/missing-validator-fixture.test.js']
      })
    ]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /evidence path does not exist/i);
});

test('blocked requirement without owner and next action fails', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'blocked',
        blocker: 'Waiting on a fixture decision.',
        next_action: ''
      })
    ]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /blocker_owner/i);
  assert.match(result.stderr, /blocker_next_action or next_action/i);
});

test('unmapped source statements fail', () => {
  const root = makeRoot({
    docOverrides: {
      sources: [sourceMetadata()],
      source_statements: [
        {
          statement_id: 'STMT-20260618-901-002',
          source_id: 'RAW-20260618-901',
          source_statement: 'This statement has no mapped requirement.'
        }
      ]
    }
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /captured source statement is unmapped/i);
});

test('source statements without source metadata fail', () => {
  const root = makeRoot({
    docOverrides: {
      source_statements: [
        {
          statement_id: 'STMT-20260618-901-003',
          source_id: 'RAW-20260618-901',
          source_statement: 'This statement has no source registry.',
          requirement_id: 'REQ-20260618-901'
        }
      ]
    }
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /sources must define metadata/i);
});

test('source statement matrix paths are validated', () => {
  const root = makeRoot({
    docOverrides: {
      sources: [sourceMetadata()],
      source_statement_matrices: [{ path: 'ops/source-matrix.json', source_id: 'RAW-20260618-901' }]
    }
  });
  fs.mkdirSync(path.join(root, 'ops'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'ops', 'source-matrix.json'),
    JSON.stringify(
      {
        matrix: [
          {
            statement_id: 'STMT-20260618-901-004',
            source_statement: 'Matrix row maps to the fixture requirement.',
            requirement_id: 'REQ-20260618-901',
            classification: 'missing'
          }
        ]
      },
      null,
      2
    )
  );

  const result = validate(root);
  assert.equal(result.status, 0, result.stderr);
});

test('missing NEXT-SESSION while work remains fails', () => {
  const root = makeRoot({
    requirements: [baseRequirement({ status: 'in_progress' })],
    nextSession: false
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NEXT-SESSION\.md is required/i);
});

test('NEXT-SESSION without any open requirement ID fails as stale', () => {
  const root = makeRoot({
    requirements: [baseRequirement({ status: 'in_progress' })],
    nextSessionContent: '# Next Session\nKeep going later.\n'
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NEXT-SESSION\.md is stale/i);
});

test('latest.json pointing to missing run fails', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-run-missing-'));
  fs.mkdirSync(path.join(root, 'ops', 'execution-runs'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'ops', 'execution-runs', 'latest.json'),
    JSON.stringify(
      {
        run_id: '2026-06-18-missing-run',
        path: 'ops/execution-runs/2026-06-18-missing-run',
        updated_at: '2026-06-18T00:00:00+03:00'
      },
      null,
      2
    )
  );

  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /points to missing run/i);
});

test('multiple active runs fail', () => {
  const root = makeRoot({
    extraActiveRuns: [{ run_id: '2026-06-18-second-active-fixture' }]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Multiple active execution runs/i);
});

test('stale git refs fail when declared refs disagree', () => {
  const root = makeRoot({
    docOverrides: {
      git_refs: {
        expected_branch: 'codex/current-fixture',
        current_branch: 'codex/stale-fixture',
        expected_head: '1111111111111111111111111111111111111111',
        current_head: '2222222222222222222222222222222222222222',
        pr_number: 5,
        pr_url: 'https://github.com/example/repo/pull/7'
      }
    }
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /stale branch reference/i);
  assert.match(result.stderr, /stale head reference/i);
  assert.match(result.stderr, /PR URL does not match/i);
});

test('git refs accept recorded corrective ancestor head', () => {
  const root = makeRoot();
  git(root, ['init']);
  git(root, ['config', 'user.email', 'codex@example.invalid']);
  git(root, ['config', 'user.name', 'Codex Test']);
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'initial run']);
  const recordedHead = git(root, ['rev-parse', 'HEAD']);
  const branch = git(root, ['rev-parse', '--abbrev-ref', 'HEAD']);

  const requirementsPath = path.join(root, 'ops', 'execution-runs', '2026-06-18-validator-fixture', 'requirements.json');
  const requirements = JSON.parse(fs.readFileSync(requirementsPath, 'utf8'));
  requirements.git_refs = {
    expected_branch: branch,
    current_head: recordedHead,
    existing_corrective_commits: [recordedHead],
  };
  fs.writeFileSync(requirementsPath, JSON.stringify(requirements, null, 2));
  fs.writeFileSync(path.join(root, 'AFTER.md'), '# Later bookkeeping commit\n');
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'later bookkeeping']);

  const result = validate(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validation passed/);
  assert.match(result.stdout, /earlier corrective commit/i);
});

test('resume output identifies next unblocked executable batch', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({ status: 'done', evidence: ['raw-input/RAW-20260618-901-fixture.md'] }),
      baseRequirement({
        id: 'REQ-20260618-902',
        title: 'Second executable fixture',
        source_statement_ids: ['STMT-20260618-901-002'],
        batch_id: 'batch-next',
        depends_on: ['REQ-20260618-901']
      })
    ],
    nextSessionContent: '# Next Session\nResume REQ-20260618-902.\n'
  });
  const result = spawnSync(process.execPath, [scriptPath, 'resume', '--root', root], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Next unblocked executable batch:/);
  assert.match(result.stdout, /batch-next \/ REQ-20260618-902/);
});

test('next output does not advertise approval-gated requirements as executable', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'in_progress',
        can_continue_without_operator: false,
        blocker: 'Production readback requires explicit approval.',
        blocker_owner: 'Operator',
        blocker_next_action: 'Approve the production readback gate.',
        next_action: 'After approval, run the guarded production readback.'
      })
    ],
    nextSessionContent: '# Next Session\nResume REQ-20260618-901 after approval.\n'
  });
  const result = spawnSync(process.execPath, [scriptPath, 'next', '--root', root], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Next unblocked executable batch: none/);
  assert.match(result.stdout, /Approval-gated open requirements:/);
  assert.match(result.stdout, /REQ-20260618-901 in_progress/);
  assert.doesNotMatch(result.stdout, /batch-fixture \/ REQ-20260618-901/);
});

test('blockers output includes approval-gated open requirements', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'in_progress',
        can_continue_without_operator: false,
        blocker: 'Deploy requires an explicit release approval.',
        blocker_owner: 'Operator',
        blocker_next_action: 'Approve the release gate.'
      })
    ],
    nextSessionContent: '# Next Session\nResume REQ-20260618-901 after approval.\n'
  });
  const result = spawnSync(process.execPath, [scriptPath, 'blockers', '--root', root], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Remaining external blockers:/);
  assert.match(result.stdout, /Approval-gated open requirements:/);
  assert.match(result.stdout, /REQ-20260618-901 in_progress/);
  assert.match(result.stdout, /Deploy requires an explicit release approval/);
});

test('resume output shows approval-gated requirements when no executable batch remains', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'in_progress',
        can_continue_without_operator: false,
        blocker: 'Live verification requires approved credentials.',
        blocker_owner: 'Operator',
        blocker_next_action: 'Approve live verification credentials.'
      })
    ],
    nextSessionContent: '# Next Session\nResume REQ-20260618-901 after approval.\n'
  });
  const result = spawnSync(process.execPath, [scriptPath, 'resume', '--root', root], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Next unblocked executable batch: none/);
  assert.match(result.stdout, /Approval-gated open requirements:/);
  assert.match(result.stdout, /Live verification requires approved credentials/);
});

test('duplicate canonical tasks fail', () => {
  const root = makeRoot({
    docOverrides: {
      canonical_tasks: [
        {
          canonical_task_key: 'test_workspace|test_project|same-action',
          title: 'First task'
        },
        {
          canonical_task_key: 'test_workspace|test_project|same-action',
          title: 'Duplicate task'
        }
      ]
    }
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duplicate canonical task/i);
});

test('internal handoff files cannot appear as visible user tasks', () => {
  const root = makeRoot({
    docOverrides: {
      tasks: [
        {
          title: 'Visible internal handoff',
          visible: true,
          source_path: 'tasks-pending/2026-06-18-internal-handoff.md'
        }
      ]
    }
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /internal handoff file appears as a visible user Task/i);
});

test('implementation requirements cannot close with documentation-only files', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'verified',
        category: 'ui',
        live_required: true,
        evidence: ['raw-input/RAW-20260618-901-fixture.md'],
        deployment_evidence: ['Railway deployment fixture reached SUCCESS; live smoke passed.'],
        implementation_files: ['docs/product/ui-brief.md']
      })
    ]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /documentation\/evidence files only/i);
});

test('closed requirements cannot depend on incomplete requirements', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'done',
        evidence: ['raw-input/RAW-20260618-901-fixture.md'],
        depends_on: ['REQ-20260618-902']
      }),
      baseRequirement({
        id: 'REQ-20260618-902',
        title: 'Open dependency',
        source_statement_ids: ['STMT-20260618-901-002'],
        status: 'not_started'
      })
    ],
    nextSessionContent: '# Next Session\nResume REQ-20260618-902.\n'
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cannot be done while dependency REQ-20260618-902 is not_started/i);
});

test('app-visible closed requirements require pushed commit evidence when implementation commit is recorded', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'verified',
        category: 'api',
        live_required: true,
        evidence: ['raw-input/RAW-20260618-901-fixture.md'],
        deployment_evidence: ['Railway deployment fixture reached SUCCESS; live smoke passed.'],
        implementation_files: ['server.js'],
        implementation_commit: '1111111111111111111111111111111111111111',
        pushed_commit: ''
      })
    ]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /no pushed_commit/i);
});
