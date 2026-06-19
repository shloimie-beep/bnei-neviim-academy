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
  'NEXT-SESSION.md': '# Next Session\nResume REQ-20260618-901.\n'
};

function baseRequirement(overrides = {}) {
  return {
    id: 'REQ-20260618-901',
    title: 'Protocol validator fixture',
    status: 'not_started',
    expected_result: 'Validator fixture remains resumable.',
    source: 'test',
    depends_on_audit_output: false,
    live_required: false,
    evidence: [],
    deployment_evidence: [],
    verification: [],
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
        blocker: 'Waiting on a fixture decision.'
      })
    ]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /blocker_owner/i);
  assert.match(result.stderr, /blocker_next_action/i);
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
