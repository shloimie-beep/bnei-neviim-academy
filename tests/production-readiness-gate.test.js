const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');

async function loadGate() {
  return import(pathToFileURL(path.join(repoRoot, 'scripts', 'production-readiness-gate.mjs')).href);
}

async function loadSnapshot() {
  return import(pathToFileURL(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs')).href);
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
    one_time_setup: {
      path: 'ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.json',
      available: true,
      operator_blocker_count: 0,
      operator_blocker_items: [],
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
  assert.deepEqual(report.blocker_groups, []);
  assert.equal(report.snapshot_summary.production_ready, true);
  assert.equal(report.snapshot_summary.blocker_group_count, 0);
  assert.equal(report.operator_unblocker.markdown_path, 'ops/production-readiness/latest-production-unblocker.md');
  assert.equal(report.operator_unblocker.refresh_command, 'npm run production:unblocker');
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
    one_time_setup: {
      path: 'ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.json',
      available: true,
      operator_blocker_count: 3,
      operator_blocker_items: [
        { id: 'SETUP-ONETIME-STRIPE-001', title: 'Rabbi Stripe sandbox' },
        { id: 'SETUP-ONETIME-WHAPI-001', title: 'Whapi/WAPI provider details' },
        { id: 'SETUP-ONETIME-CAMPAIGN-001', title: 'Campaign seed / real campaign' },
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
  assert.equal(report.snapshot_summary.external_setup_item_count, 3);
  assert.equal(report.snapshot_summary.blocker_group_count, 7);
  assert.deepEqual(report.blocker_groups.map((group) => group.id), [
    'snapshot_not_production_ready',
    'dirty_worktree',
    'no_unblocked_executable_batch',
    'external_setup_blockers',
    'agent_mode_terminal_proof_missing',
    'chatgpt_dropoff_queue_ready',
    'active_agent_collision_lanes',
  ]);
  assert.equal(report.blocker_groups.find((group) => group.id === 'external_setup_blockers').count, 3);
  assert.deepEqual(report.blocker_groups.find((group) => group.id === 'external_setup_blockers').evidence, [
    'SETUP-ONETIME-STRIPE-001',
    'SETUP-ONETIME-WHAPI-001',
    'SETUP-ONETIME-CAMPAIGN-001',
  ]);
  assert.equal(report.blocker_groups.find((group) => group.id === 'agent_mode_terminal_proof_missing').count, 2);
  assert.equal(report.blocker_groups.find((group) => group.id === 'active_agent_collision_lanes').count, 1);
  assert.match(report.blocker_groups.find((group) => group.id === 'external_setup_blockers').next_action, /Stripe/);
  assert.ok(report.next_actions.some((item) => /production:unblocker/.test(item.action)));
  assert.equal(report.operator_unblocker.json_path, 'ops/production-readiness/latest-production-unblocker.json');
});

test('production readiness gate can warn instead of block on dirty state when explicitly allowed', async () => {
  const mod = await loadGate();
  const report = mod.buildProductionReadinessGate(readySnapshot({
    git: { clean: false, head: 'abc123', origin_master: 'abc123' },
  }), { allowDirty: true });

  assert.equal(report.ok, true);
  assert.equal(report.warnings.length, 1);
  assert.match(report.warnings[0], /allow-dirty/);
  assert.deepEqual(report.blocker_groups, []);
});

test('production readiness snapshot surfaces agent-fleet auto-deploy preflight proof', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /production_deploy_preflight/);
  assert.match(script, /enforced_before_auto_deploy/);
  assert.match(script, /skipped_reason_when_blocked/);
  assert.match(script, /Auto-deploy readiness preflight/);
  assert.match(script, /Auto-deploy performed by readiness proof/);
});

test('production readiness snapshot includes OneTime setup bucket summary', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /one_time_setup/);
  assert.match(script, /operator_blocker_items/);
  assert.match(script, /OneTime Setup Buckets/);
  assert.match(script, /one-time-mishnah\/launch-unblocker\/2026-07-02-operator-external-setup-checklist\.json/);
  assert.match(script, /Operator blocker count/);
});

test('production readiness snapshot parser keeps colon job titles out of summary keys', async () => {
  const mod = await loadSnapshot();
  const parsed = mod.parseFleetStatus(`Agent fleet status:
- Supervisor: running PID 36560
- Observable Codex jobs: 34
- Claimable observable jobs: 0

Observable jobs not claimable by active-task policy:
- job #408 / task #2025 [failed] Fix One Time provider UI consistency: header, duplicate nav, filters, buttons, mobile
- job #427 / ticket #1593 / task #2185 [running] About the fall back I'm saying you should use the API that I'm using
`);

  assert.equal(parsed.summary.supervisor, 'running PID 36560');
  assert.equal(parsed.summary.observable_codex_jobs, '34');
  assert.equal(parsed.summary.claimable_observable_jobs, '0');
  assert.equal(parsed.summary.job_408_task_2025_failed_fix_one_time_provider_ui_consistency, undefined);
  assert.equal(parsed.active_policy_jobs.length, 2);
  assert.equal(parsed.active_policy_jobs[0].job_id, '408');
  assert.equal(parsed.active_policy_jobs[0].task_id, '2025');
  assert.equal(parsed.active_policy_jobs[0].status, 'failed');
  assert.equal(parsed.active_policy_jobs[0].title, 'Fix One Time provider UI consistency: header, duplicate nav, filters, buttons, mobile');
  assert.equal(parsed.active_policy_jobs[1].ticket_id, '1593');
});

test('production readiness snapshot treats active Agent Review repair as a collision lane', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /activeAgentReviewLane/);
  assert.match(script, /Agent Mode result\|Agent Review\|AGR-/);
  assert.match(script, /Agent Review repair lane is already active/);
  assert.match(script, /Do not overlap Agent Review proof\/result repair work/);
  assert.match(script, /avoidCollidingWith/);
});

test('production readiness snapshot separates launch collisions from other policy rows', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /Launch Collision Lanes/);
  assert.match(script, /Other Agent Policy Rows/);
  assert.match(script, /collisionJobs/);
  assert.match(script, /otherPolicyJobs/);
  assert.doesNotMatch(script, /## Active \/ Do Not Collide/);
});
