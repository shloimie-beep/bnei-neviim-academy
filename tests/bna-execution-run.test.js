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
  'NEXT-SESSION.md': '# Next Session\nResume this work.\n'
};

function baseRequirement(overrides = {}) {
  return {
    id: 'REQ-20260618-901',
    title: 'Protocol validator fixture',
    status: 'not_started',
    expected_result: 'Validator fixture remains resumable.',
    acceptance_criteria: ['Fixture has clear acceptance criteria.'],
    source: 'test',
    depends_on_audit_output: false,
    live_required: false,
    evidence: [],
    deployment_evidence: [],
    verification: [],
    ...overrides
  };
}

function makeRoot({ requirements = [baseRequirement()], nextSession = true, latestPath } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-run-'));
  const runId = '2026-06-18-validator-fixture';
  const runPath = latestPath || `ops/execution-runs/${runId}`;
  const runDir = path.join(root, runPath);
  fs.mkdirSync(runDir, { recursive: true });

  for (const [fileName, content] of Object.entries(requiredMarkdown)) {
    if (fileName === 'NEXT-SESSION.md' && !nextSession) {
      continue;
    }
    fs.writeFileSync(path.join(runDir, fileName), content);
  }

  fs.writeFileSync(
    path.join(runDir, 'requirements.json'),
    JSON.stringify(
      {
        run_id: runId,
        title: 'Validator Fixture',
        updated_at: '2026-06-18T00:00:00+03:00',
        requirements
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
        active: true
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
        blocker: 'Waiting for user to upload agent-review-package.zip or audit output path'
      })
    ]
  });
  const result = validate(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validation passed/);
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

test('closed requirement without acceptance criteria fails', () => {
  const root = makeRoot({
    requirements: [
      baseRequirement({
        status: 'done',
        evidence: ['fixture proof'],
        acceptance_criteria: []
      })
    ]
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /closed requirement requires acceptance criteria/i);
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

test('missing NEXT-SESSION while work remains fails', () => {
  const root = makeRoot({
    requirements: [baseRequirement({ status: 'in_progress' })],
    nextSession: false
  });
  const result = validate(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NEXT-SESSION\.md is required/i);
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
