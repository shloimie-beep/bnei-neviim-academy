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
    public_launch_smoke: {
      path: 'ops/production-readiness/2026-07-09-no-write-live-smoke-readback.json',
      status: 'passed',
      ready: true,
      fresh_for_launch_gate: true,
      command_count: 4,
      passed_command_count: 4,
      external_write_performed: false,
      production_data_mutation_performed: false,
      age_hours: 0.5,
    },
    rabbi_telegram_runtime: {
      status: 'live_smoke_verified',
      local_ready: true,
      production_verified: true,
      chat_id_configured: true,
      candidate_count: 1,
      unique_chat_count: 1,
      masked_candidates: [{ chat_id_masked: '******4810', chat_type: 'private', text_kind: 'start_command' }],
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
  assert.equal(report.snapshot_summary.public_launch_smoke_ready, true);
  assert.equal(report.snapshot_summary.blocker_group_count, 0);
  assert.equal(report.operator_unblocker.markdown_path, 'ops/production-readiness/latest-production-unblocker.md');
  assert.equal(report.operator_unblocker.refresh_command, 'npm run production:unblocker');
  assert.equal(report.guardrails.some((item) => /Read-only/.test(item)), true);
});

test('production readiness snapshot redacts dirty worktree path details', async () => {
  const mod = await loadSnapshot();
  const summary = mod.summarizeGitStatus([
    '## master...origin/master',
    ' M server.js',
    '?? raw-input/private-note.md',
  ].join('\n'));

  assert.equal(summary.clean, false);
  assert.equal(summary.summary.tracked_entries, 1);
  assert.equal(summary.summary.untracked_entries, 1);
  assert.equal(summary.summary.paths_redacted, true);
  assert.match(summary.status_short, /paths redacted/);
  assert.doesNotMatch(summary.status_short, /server\.js/);
  assert.doesNotMatch(summary.status_short, /private-note/);
});

test('production readiness gate blocks external blockers, proof gaps, queued packets, dirty state, and active lanes', async () => {
  const mod = await loadGate();
  const snapshot = readySnapshot({
    assessment: {
      production_ready: false,
      status: 'not_production_complete',
      reason: ['full One Time launch has external Stripe/WAPI/campaign blockers'],
      avoid_colliding_with: [
        {
          job_id: '382',
          task_id: '1859',
          status: 'running',
          title: 'Apply app-wide BNA brand shell and million-dollar SaaS UI polish',
          local_lock_evidence: 'local_lock=stale_lock_dead_pid pid=25788 heartbeat=2026-07-05T18:20:51.072Z age_hours=97.14 path=.runtime/agent-fleet/task-1859.lock.json',
        },
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
        {
          id: 'SETUP-ONETIME-STRIPE-001',
          title: 'Rabbi Stripe sandbox',
          current_missing_fields: ['rabbi_stripe_test_secret_key_alias_or_test_key_status', '67_month_product_price_id_or_alias'],
        },
        {
          id: 'SETUP-ONETIME-WHAPI-001',
          title: 'Whapi/WAPI provider details',
          current_missing_fields: ['whapi_wapi_instance_id', 'whapi_wapi_phone_number'],
        },
        {
          id: 'SETUP-ONETIME-CAMPAIGN-001',
          title: 'Campaign seed / real campaign',
          current_missing_fields: ['final_campaign_copy', 'explicit_seed_packet_approval'],
        },
      ],
    },
    rabbi_telegram_runtime: {
      status: 'candidate_available_config_required',
      local_ready: false,
      chat_id_configured: false,
      candidate_count: 4,
      unique_chat_count: 1,
      masked_candidates: [{ chat_id_masked: '******4810', chat_type: 'private', text_kind: 'start_command' }],
      next_action: 'Verify the intended Rabbi account/group, then configure the chat ID.',
    },
    chatgpt_dropoff: { queued_count: 1 },
    rabbi_agent_review: {
      remaining_blocker_count: 2,
      next_agent_mode_prompts: [
        'https://join.onetimeonetime.com/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md',
        'https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md',
      ],
      prompt_states: [
        {
          prompt_key: 'rabbi-telegram-helper-ticket-smoke',
          workflow_state: 'not_started',
          terminal_saved_proof: false,
          public_url: 'https://join.onetimeonetime.com/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md',
          dropoff_url: 'https://bneineviimacademy.org/operations/agent-review/dropoff?prompt_key=rabbi-telegram-helper-ticket-smoke',
        },
        {
          prompt_key: 'rabbi-helper-tool-scope-map',
          workflow_state: 'not_started',
          terminal_saved_proof: false,
          public_url: 'https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md',
          dropoff_url: 'https://bneineviimacademy.org/operations/agent-review/dropoff?prompt_key=rabbi-helper-tool-scope-map',
        },
      ],
    },
  });
  const report = mod.buildProductionReadinessGate(snapshot);
  const text = report.blockers.join('\n');

  assert.equal(report.ok, false);
  assert.equal(report.status, 'blocked');
  assert.match(text, /not_production_complete/);
  assert.match(text, /Stripe\/WAPI\/campaign/);
  assert.match(text, /dirty/);
  assert.match(text, /REQ-20260702-108/);
  assert.match(text, /rabbi_stripe_test_secret_key_alias_or_test_key_status/);
  assert.match(text, /Rabbi Telegram runtime is candidate_available_config_required/);
  assert.match(text, /Rabbi Agent Review proof has 2/);
  assert.match(text, /rabbi-telegram-helper-ticket-smoke/);
  assert.match(text, /rabbi-helper-tool-scope-map/);
  assert.match(text, /operations\/agent-review\/dropoff\?prompt_key=rabbi-telegram-helper-ticket-smoke/);
  assert.match(text, /ChatGPT dropoff queue has 1/);
  assert.match(text, /job #382/);
  assert.match(text, /local_lock=stale_lock_dead_pid/);
  assert.equal(report.snapshot_summary.active_run_blocker_count, 1);
  assert.equal(report.snapshot_summary.external_setup_item_count, 3);
  assert.equal(report.snapshot_summary.public_launch_smoke_ready, true);
  assert.deepEqual(report.snapshot_summary.external_setup_missing_fields, [
    'rabbi_stripe_test_secret_key_alias_or_test_key_status',
    '67_month_product_price_id_or_alias',
    'whapi_wapi_instance_id',
    'whapi_wapi_phone_number',
    'final_campaign_copy',
    'explicit_seed_packet_approval',
  ]);
  assert.equal(report.snapshot_summary.blocker_group_count, 8);
  assert.equal(report.snapshot_summary.rabbi_telegram_runtime_status, 'candidate_available_config_required');
  assert.equal(report.snapshot_summary.rabbi_telegram_chat_id_configured, false);
  assert.equal(report.snapshot_summary.rabbi_telegram_candidate_count, 4);
  assert.deepEqual(report.blocker_groups.map((group) => group.id), [
    'snapshot_not_production_ready',
    'dirty_worktree',
    'no_unblocked_executable_batch',
    'external_setup_blockers',
    'rabbi_telegram_runtime_configuration',
    'agent_mode_terminal_proof_missing',
    'chatgpt_dropoff_queue_ready',
    'active_agent_collision_lanes',
  ]);
  assert.equal(report.blocker_groups.find((group) => group.id === 'external_setup_blockers').count, 3);
  assert.deepEqual(report.blocker_groups.find((group) => group.id === 'external_setup_blockers').evidence, [
    'SETUP-ONETIME-STRIPE-001: rabbi_stripe_test_secret_key_alias_or_test_key_status, 67_month_product_price_id_or_alias',
    'SETUP-ONETIME-WHAPI-001: whapi_wapi_instance_id, whapi_wapi_phone_number',
    'SETUP-ONETIME-CAMPAIGN-001: final_campaign_copy, explicit_seed_packet_approval',
  ]);
  assert.deepEqual(report.blocker_groups.find((group) => group.id === 'external_setup_blockers').missing_fields, [
    'rabbi_stripe_test_secret_key_alias_or_test_key_status',
    '67_month_product_price_id_or_alias',
    'whapi_wapi_instance_id',
    'whapi_wapi_phone_number',
    'final_campaign_copy',
    'explicit_seed_packet_approval',
  ]);
  assert.equal(report.blocker_groups.find((group) => group.id === 'agent_mode_terminal_proof_missing').count, 2);
  assert.match(report.blocker_groups.find((group) => group.id === 'agent_mode_terminal_proof_missing').evidence.join('\n'), /rabbi-telegram-helper-ticket-smoke/);
  assert.match(report.blocker_groups.find((group) => group.id === 'agent_mode_terminal_proof_missing').evidence.join('\n'), /rabbi-helper-tool-scope-map/);
  assert.match(report.blocker_groups.find((group) => group.id === 'agent_mode_terminal_proof_missing').evidence.join('\n'), /dropoff=https:\/\/bneineviimacademy\.org\/operations\/agent-review\/dropoff/);
  const rabbiRuntimeGroup = report.blocker_groups.find((group) => group.id === 'rabbi_telegram_runtime_configuration');
  assert.equal(rabbiRuntimeGroup.title, 'Rabbi Telegram runtime is not production-verified');
  assert.deepEqual(rabbiRuntimeGroup.evidence, [
    'status=candidate_available_config_required',
    'chat_id_configured=false',
    'candidate_count=4',
    'unique_chat_count=1',
    'masked_candidate=******4810',
  ]);
  assert.equal(report.blocker_groups.find((group) => group.id === 'active_agent_collision_lanes').count, 1);
  assert.match(report.blocker_groups.find((group) => group.id === 'active_agent_collision_lanes').evidence.join('\n'), /stale_lock_dead_pid/);
  assert.match(report.blocker_groups.find((group) => group.id === 'active_agent_collision_lanes').next_action, /reconcile/);
  assert.match(report.blocker_groups.find((group) => group.id === 'external_setup_blockers').next_action, /whapi_wapi_instance_id/);
  assert.ok(report.next_actions.some((item) => /production:unblocker/.test(item.action)));
  assert.equal(report.operator_unblocker.json_path, 'ops/production-readiness/latest-production-unblocker.json');
});

test('production readiness gate blocks when no-write public launch smoke proof is missing or unsafe', async () => {
  const mod = await loadGate();
  const report = mod.buildProductionReadinessGate(readySnapshot({
    assessment: {
      production_ready: false,
      status: 'not_production_complete',
      reason: ['public launch no-write smoke is failed'],
      avoid_colliding_with: [],
      chatgpt_dropoff_queue_ready_count: 0,
    },
    public_launch_smoke: {
      path: 'ops/production-readiness/2026-07-09-no-write-live-smoke-readback.json',
      status: 'failed',
      ready: false,
      fresh_for_launch_gate: true,
      command_count: 4,
      passed_command_count: 3,
      external_write_performed: false,
      production_data_mutation_performed: false,
      age_hours: 0.5,
      blocker: 'passed_commands=3/4',
    },
  }));

  assert.equal(report.ok, false);
  assert.equal(report.snapshot_summary.public_launch_smoke_status, 'failed');
  assert.equal(report.snapshot_summary.public_launch_smoke_ready, false);
  const group = report.blocker_groups.find((item) => item.id === 'public_launch_no_write_smoke');
  assert.ok(group);
  assert.equal(group.title, 'Public launch no-write smoke proof is missing, failed, stale, or unsafe');
  assert.deepEqual(group.evidence, [
    'path=ops/production-readiness/2026-07-09-no-write-live-smoke-readback.json',
    'status=failed',
    'ready=false',
    'fresh_for_launch_gate=true',
    'commands=3/4',
    'external_write_performed=false',
    'production_data_mutation_performed=false',
    'blocker=passed_commands=3/4',
  ]);
  assert.match(report.blockers.join('\n'), /Public launch no-write smoke proof is not launch-ready/);
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

test('production readiness snapshot includes One Time setup bucket summary', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /one_time_setup/);
  assert.match(script, /operator_blocker_items/);
  assert.match(script, /One Time Setup Buckets/);
  assert.match(script, /public_launch_smoke/);
  assert.match(script, /No-Write Smoke/);
  assert.match(script, /no-write-live-smoke-readback\.json/);
  assert.match(script, /one-time-mishnah\/launch-unblocker\/2026-07-02-operator-external-setup-checklist\.json/);
  assert.match(script, /check-onetime-external-setup-readiness\.mjs/);
  assert.match(script, /current_missing_fields/);
  assert.match(script, /Current setup check/);
  assert.match(script, /Operator blocker count/);
});

test('production readiness snapshot includes redacted Rabbi Telegram runtime summary', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /rabbi_telegram_runtime/);
  assert.match(script, /Rabbi Telegram Runtime/);
  assert.match(script, /rabbi-telegram-chat-id-candidates\.json/);
  assert.match(script, /chat_id_masked/);
  assert.match(script, /maskSensitiveId/);
  assert.doesNotMatch(script, /chat_id:\s*candidate\.chat_id/);
});

test('production readiness snapshot preserves Agent Review proof drop-off URLs', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /dropoff_url: item\.dropoff_url/);
  assert.match(script, /dropoff \$\{item\.dropoff_url\}/);
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

test('production readiness snapshot treats running Agent Review repair as a collision lane', async () => {
  const mod = await loadSnapshot();
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.equal(mod.isActiveCollisionPolicyJob({ status: 'running' }), true);
  assert.equal(mod.isActiveCollisionPolicyJob({ status: 'queued' }), true);
  assert.equal(mod.isActiveCollisionPolicyJob({ status: 'blocked_needs_human_decision' }), false);
  assert.equal(mod.isActiveCollisionPolicyJob({ status: 'failed' }), false);
  assert.match(script, /activeAgentReviewLane/);
  assert.match(script, /collisionPolicyJobs/);
  assert.match(script, /filter\(isActiveCollisionPolicyJob\)/);
  assert.match(script, /Agent Mode result\|Agent Review\|AGR-/);
  assert.match(script, /Agent Review repair lane/);
  assert.match(script, /reported active in another agent job/);
  assert.match(script, /Do not overlap Agent Review proof\/result repair work/);
  assert.match(script, /avoidCollidingWith/);
});

test('production readiness snapshot enriches collision lanes with local task-lock health', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /function inspectTaskLock/);
  assert.match(script, /enrichFleetStatusWithTaskLocks/);
  assert.match(script, /local_lock_health/);
  assert.match(script, /stale_lock_dead_pid/);
  assert.match(script, /missing_lock/);
  assert.match(script, /agentFleetCollisionLockFreshHours/);
});

test('production readiness snapshot separates launch collisions from other policy rows', () => {
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-readiness-snapshot.mjs'), 'utf8');

  assert.match(script, /Launch Collision Lanes/);
  assert.match(script, /Other Agent Policy Rows/);
  assert.match(script, /collisionJobs/);
  assert.match(script, /otherPolicyJobs/);
  assert.doesNotMatch(script, /## Active \/ Do Not Collide/);
});
