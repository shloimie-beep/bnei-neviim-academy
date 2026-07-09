const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');

async function loadGate() {
  return import(pathToFileURL(path.join(repoRoot, 'scripts', 'production-readiness-gate.mjs')).href);
}

function readySnapshot(overrides = {}) {
  return {
    generated_at: '2026-07-09T00:00:00.000Z',
    assessment: {
      production_ready: true,
      status: 'production_ready',
      reason: [],
      avoid_colliding_with: [],
      chatgpt_dropoff_queue_ready_count: 0,
    },
    git: { clean: true, head: 'abc123', origin_master: 'abc123' },
    freshness: {
      kind: 'sampled_control_tower_report',
      sampled_git_head: 'abc123',
      sampled_origin_master: 'abc123',
    },
    active_run: {
      run_path: 'ops/execution-runs/example',
      status_counts: { done: 10 },
      validation_passed: true,
      work_remains: false,
      next_unblocked_executable_batch: 'none',
      blockers: [],
    },
    chatgpt_dropoff: { queued_count: 0 },
    rabbi_agent_review: { remaining_blocker_count: 0 },
    next_actions: [],
    ...overrides,
  };
}

test('production readiness gate passes a clean fully ready snapshot', async () => {
  const mod = await loadGate();
  const report = mod.buildProductionReadinessGate(readySnapshot());

  assert.equal(report.ok, true);
  assert.equal(report.status, 'production_ready');
  assert.deepEqual(report.blockers, []);
  assert.equal(report.snapshot_summary.production_ready, true);
  assert.equal(report.guardrails.some((item) => /Read-only/.test(item)), true);
});

test('production readiness gate blocks external blockers, proof gaps, queued packets, dirty state, and active lanes', async () => {
  const mod = await loadGate();
  const snapshot = readySnapshot({
    assessment: {
      production_ready: false,
      status: 'not_production_complete',
      reason: ['full OneTime launch has external Stripe/WAPI/campaign blockers'],
      avoid_colliding_with: [
        { job_id: '382', task_id: '1859', status: 'running', title: 'Apply app-wide BNA brand shell and million-dollar SaaS UI polish' },
      ],
      chatgpt_dropoff_queue_ready_count: 1,
    },
    git: { clean: false, head: 'abc123', origin_master: 'abc123' },
    active_run: {
      run_path: 'ops/execution-runs/example',
      status_counts: { done: 8, blocked: 2 },
      validation_passed: true,
      work_remains: true,
      next_unblocked_executable_batch: 'none',
      blockers: [
        {
          requirement_id: 'REQ-20260702-108',
          blocker: 'Stripe/WAPI/campaign values missing.',
          next_action: 'Provide Stripe and WAPI setup values.',
        },
      ],
    },
    chatgpt_dropoff: { queued_count: 1 },
    rabbi_agent_review: { remaining_blocker_count: 2 },
  });
  const report = mod.buildProductionReadinessGate(snapshot);
  const text = report.blockers.join('\n');

  assert.equal(report.ok, false);
  assert.equal(report.status, 'blocked');
  assert.match(text, /not_production_complete/);
  assert.match(text, /Stripe\/WAPI\/campaign/);
  assert.match(text, /dirty/);
  assert.match(text, /REQ-20260702-108/);
  assert.match(text, /Rabbi Agent Review proof has 2/);
  assert.match(text, /ChatGPT dropoff queue has 1/);
  assert.match(text, /job #382/);
  assert.equal(report.snapshot_summary.active_run_blocker_count, 1);
});

test('production readiness gate can warn instead of block on dirty state when explicitly allowed', async () => {
  const mod = await loadGate();
  const report = mod.buildProductionReadinessGate(readySnapshot({
    git: { clean: false, head: 'abc123', origin_master: 'abc123' },
  }), { allowDirty: true });

  assert.equal(report.ok, true);
  assert.equal(report.warnings.length, 1);
  assert.match(report.warnings[0], /allow-dirty/);
});
