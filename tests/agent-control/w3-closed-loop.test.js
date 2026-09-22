const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createWorkPackage,
  createVerificationPlan,
  claimWorkPackage,
  recordEvidence,
  recordProgress,
  sealWorkPackage,
  requeueFindingOrDecision,
  assertNoSecrets,
} = require('../../src/platform/agent-control/closed-loop');

test('W3 closed loop builds safe task-specific browser prompts and requires browser evidence', () => {
  const workPackage = createWorkPackage({
    parentPrompt: { prompt_id: 'PROMPT-20260619-001-ABC', title: 'Ramble queue' },
    parsedItem: {
      item_id: 'TASK-1',
      title: 'Verify ramble status page',
      expected_result: 'Route loads and shows blocker/evidence state.',
      target_url: 'http://localhost:3000/operations?view=agents',
    },
    verificationMode: 'mixed',
  });
  const plan = createVerificationPlan(workPackage);

  assert.match(plan.browser_prompt, /Work package:/);
  assert.match(plan.browser_prompt, /Forbidden:/);
  assert.doesNotMatch(plan.browser_prompt, /OPS_PASSWORD|OPENAI_API_KEY|DATABASE_URL/);
  assert.throws(() => sealWorkPackage(workPackage, {
    outcome: 'pass',
    summary: 'Looks good',
    criterionResults: [{ id: 'AC-1', status: 'pass' }],
  }), /requires at least one evidence/);
});

test('W3 closed loop claims, records evidence, seals, and requeues with retry limits', () => {
  let workPackage = createWorkPackage({
    parentPrompt: { prompt_id: 'PROMPT-20260619-001-ABC' },
    parsedItem: { item_id: 'TASK-2', title: 'Run parser tests' },
    verificationMode: 'automated',
    retryLimit: 1,
  });
  workPackage = claimWorkPackage(workPackage, { agent: 'Codex', at: '2026-06-19T13:01:00.000Z' });
  workPackage = recordProgress(workPackage, { phase: 'verifying', summary: 'Running focused tests' });
  workPackage = recordEvidence(workPackage, { label: 'Focused tests', path: 'tests/ingestion/w3-parser-queue.test.js' });
  workPackage = sealWorkPackage(workPackage, {
    outcome: 'pass',
    summary: 'Focused parser tests passed.',
    criterionResults: [{ id: 'AC-1', status: 'pass', note: 'node --test passed' }],
  });

  assert.equal(workPackage.status, 'passed');
  assert.equal(workPackage.verification_status, 'passed');
  assert.equal(workPackage.evidence.length, 1);

  const retry = requeueFindingOrDecision({ ...workPackage, status: 'failed', retry_count: 0, retry_limit: 1 }, { summary: 'Exact finding requeued.' });
  assert.equal(retry.status, 'requeued');
  assert.equal(retry.retry_count, 1);
  const exhausted = requeueFindingOrDecision({ ...retry, retry_count: 1, retry_limit: 1 }, { summary: 'Needs human choice.' });
  assert.equal(exhausted.status, 'needs_operator_decision');
});

test('W3 closed loop rejects credential-like prompt or evidence text', () => {
  assert.throws(() => assertNoSecrets('OPENAI_API_KEY=abc123', 'test'), /credential-like/);
});
