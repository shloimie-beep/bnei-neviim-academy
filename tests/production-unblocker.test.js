const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');

async function loadUnblocker() {
  return import(pathToFileURL(path.join(repoRoot, 'scripts', 'production-unblocker.mjs')).href);
}

test('production unblocker builds operator actions from setup and proof blockers', async () => {
  const mod = await loadUnblocker();
  const report = mod.buildProductionUnblocker({
    snapshot: {
      assessment: {
        production_ready: false,
        status: 'not_production_complete',
        avoid_colliding_with: [
          { job_id: '382', task_id: '1859', status: 'running', title: 'Apply app-wide BNA brand shell', raw: '- job #382 / task #1859 [running] Apply app-wide BNA brand shell' },
        ],
      },
      active_run: {
        next_unblocked_executable_batch: 'none',
        blockers: [
          {
            requirement_id: 'REQ-20260702-108',
            title: 'Verify provider setup panels/tasks',
            owner: 'Shloimie / provider account owners',
            blocker: 'Stripe/WAPI/campaign values missing.',
            next_action: 'Provide Stripe and WAPI setup values.',
          },
        ],
      },
      chatgpt_dropoff: { queued_count: 0 },
      rabbi_telegram_runtime: {
        status: 'candidate_available_config_required',
        local_ready: false,
        chat_id_configured: false,
        candidate_count: 4,
        unique_chat_count: 1,
        masked_candidates: [{ chat_id_masked: '******4810', chat_type: 'private', text_kind: 'start_command', message_date: '2026-07-09T16:57:05.000Z' }],
        readiness_path: 'ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.json',
        chat_id_report_path: '.runtime/rabbi-telegram-chat-id-candidates.json',
        runtime_report_available: true,
        live_delivery_smoke: 'not_exercised_by_readiness_report',
        next_action: 'Verify the intended Rabbi account/group, then configure the chat ID.',
      },
      generated_at: '2026-07-09T16:13:28.475Z',
      git: { head: '60f1e599', origin_master: '60f1e599', clean: true },
      freshness: {
        sampled_git_head: '60f1e599',
        sampled_origin_master: '60f1e599',
        sampled_worktree_clean: true,
      },
    },
    setupChecklist: {
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      setup_items: [
        { id: 'SETUP-ONETIME-RAILWAY-001', title: 'Railway', current_status: 'ready', operator_blocker: false },
        {
          id: 'SETUP-ONETIME-STRIPE-001',
          priority: 1,
          title: 'Rabbi Stripe sandbox',
          current_status: 'blocked_external_input',
          operator_blocker: true,
          required_fields: ['rabbi_stripe_test_secret_key_alias', '67_month_product_price_ids_or_sandbox_create_permission'],
          forbidden: ['live_payment'],
          verification_after_setup: ['sandbox_checkout_subscription_access_smoke'],
        },
        {
          id: 'SETUP-ONETIME-WHAPI-001',
          priority: 2,
          title: 'Whapi/WAPI provider details',
          current_status: 'blocked_external_input',
          operator_blocker: true,
          required_fields: ['instance_id_or_alias', 'phone_number'],
          forbidden: ['real_whatsapp_send_without_later_exact_packet'],
        },
      ],
    },
    setupReadiness: {
      generated_at: '2026-07-09T17:00:00.000Z',
      ready_count: 5,
      total_count: 8,
      all_required_external_setup_ready: false,
      items: [
        {
          id: 'SETUP-ONETIME-STRIPE-001',
          title: 'Rabbi Stripe sandbox',
          ready: false,
          missing_fields: ['rabbi_stripe_test_secret_key_alias_or_test_key_status', '67_month_product_price_id_or_alias'],
          warnings: ['Live Stripe key appears configured; sandbox-only smoke must not use it.'],
          verification_after_setup: ['sandbox Stripe smoke only; no live payment'],
        },
        {
          id: 'SETUP-ONETIME-WHAPI-001',
          title: 'Whapi/WAPI provider details',
          ready: false,
          missing_fields: ['whapi_wapi_instance_id', 'whapi_wapi_phone_number'],
          verification_after_setup: ['safe test send only in later exact packet'],
        },
      ],
      blockers: [
        {
          id: 'SETUP-ONETIME-STRIPE-001',
          title: 'Rabbi Stripe sandbox',
          missing_fields: ['rabbi_stripe_test_secret_key_alias_or_test_key_status', '67_month_product_price_id_or_alias'],
          warnings: ['Live Stripe key appears configured; sandbox-only smoke must not use it.'],
        },
      ],
    },
    setupReadinessSource: 'node scripts/check-onetime-external-setup-readiness.mjs --json',
    setupReadinessSourceKind: 'live_no_write_command_expected_blocked',
    setupReadinessCommandExitCode: 1,
    proofReadiness: {
      remaining_blockers: [
        {
          prompt_key: 'rabbi-helper-tool-scope-map',
          blocker: 'No saved terminal Agent Review result is visible for this prompt yet.',
        },
      ],
      hub_prompt_state: [
        {
          prompt_key: 'rabbi-helper-tool-scope-map',
          workflow_state: 'not_started',
          public_url: 'https://join.onetimeonetime.com/agent-review-prompts/rabbi-helper-tool-scope-map.md',
          dropoff_url: 'https://bneineviimacademy.org/operations/agent-review/dropoff?prompt_key=rabbi-helper-tool-scope-map',
          terminal_saved_proof: false,
        },
      ],
    },
    snapshotSource: 'node scripts/production-readiness-snapshot.mjs --no-write --json',
    snapshotSourceKind: 'live_no_write_command',
    snapshotCommandExitCode: 0,
  });
  const markdown = mod.renderMarkdown(report);

  assert.equal(report.production_ready, false);
  assert.equal(report.source_snapshot.generated_at, '2026-07-09T16:13:28.475Z');
  assert.equal(report.source_snapshot.kind, 'live_no_write_command');
  assert.equal(report.source_snapshot.git_head, '60f1e599');
  assert.equal(report.source_snapshot.worktree_clean, true);
  assert.equal(report.summary.external_setup_item_count, 2);
  assert.equal(report.summary.setup_readiness_ready_count, 5);
  assert.equal(report.source_setup_readiness.command_exit_code, 1);
  assert.equal(report.summary.rabbi_telegram_runtime_status, 'candidate_available_config_required');
  assert.equal(report.summary.rabbi_telegram_candidate_count, 4);
  assert.equal(report.summary.agent_mode_proof_count, 1);
  assert.equal(report.summary.active_collision_lane_count, 1);
  assert.equal(report.summary.blocker_group_count, 5);
  assert.deepEqual(report.blocker_groups.map((group) => group.id), [
    'no_unblocked_executable_batch',
    'external_setup_blockers',
    'rabbi_telegram_runtime_configuration',
    'agent_mode_terminal_proof_missing',
    'active_agent_collision_lanes',
  ]);
  assert.equal(report.blocker_groups.find((group) => group.id === 'external_setup_blockers').count, 2);
  assert.equal(report.blocker_groups.find((group) => group.id === 'rabbi_telegram_runtime_configuration').evidence.includes('masked_candidate=******4810'), true);
  assert.equal(report.blocker_groups.find((group) => group.id === 'agent_mode_terminal_proof_missing').count, 1);
  assert.equal(report.blocker_groups.find((group) => group.id === 'active_agent_collision_lanes').count, 1);
  assert.deepEqual(report.setup_items.map((item) => item.id), ['SETUP-ONETIME-STRIPE-001', 'SETUP-ONETIME-WHAPI-001']);
  assert.deepEqual(report.setup_items[0].current_missing_fields, [
    'rabbi_stripe_test_secret_key_alias_or_test_key_status',
    '67_month_product_price_id_or_alias',
  ]);
  assert.equal(report.operator_actions[0].source, 'one_time_setup_check_current_missing_fields');
  assert.match(report.operator_actions[0].action, /rabbi_stripe_test_secret_key_alias_or_test_key_status/);
  assert.match(markdown, /Owner Action Summary/);
  assert.match(markdown, /OneTime setup check: 5\/8 ready/);
  assert.match(markdown, /Current missing fields from setup check/);
  assert.match(markdown, /67_month_product_price_id_or_alias/);
  assert.match(markdown, /Live Stripe key appears configured/);
  assert.match(markdown, /external_setup_blockers - External OneTime setup values or approvals are missing/);
  assert.match(markdown, /rabbi_telegram_runtime_configuration - Rabbi Telegram runtime is not production-verified/);
  assert.match(markdown, /Rabbi Telegram Runtime/);
  assert.match(markdown, /\*\*\*\*\*\*4810/);
  assert.match(markdown, /agent_mode_terminal_proof_missing - Rabbi Agent Review terminal proof is missing/);
  assert.match(markdown, /Rabbi Stripe sandbox/);
  assert.match(markdown, /Whapi\/WAPI provider details/);
  assert.match(markdown, /rabbi-helper-tool-scope-map\.md/);
  assert.match(markdown, /operations\/agent-review\/dropoff/);
  assert.match(markdown, /Source snapshot: node scripts\/production-readiness-snapshot\.mjs --no-write --json/);
  assert.match(markdown, /Snapshot git head: 60f1e599/);
  assert.match(markdown, /No deploy/);
});

test('production unblocker parses args and command JSON for fresh snapshot loading', async () => {
  const mod = await loadUnblocker();

  assert.deepEqual(mod.parseArgs(['--json', '--no-write']), {
    json: true,
    noWrite: true,
    useSnapshotFile: false,
  });
  assert.deepEqual(mod.parseArgs(['--from-snapshot-file']), {
    json: false,
    noWrite: false,
    useSnapshotFile: true,
  });
  assert.deepEqual(
    mod.parseJsonFromCommandOutput('npm log before\n{"assessment":{"status":"not_production_complete"}}\nmore text'),
    { assessment: { status: 'not_production_complete' } },
  );
  assert.equal(mod.parseJsonFromCommandOutput('no json here'), null);
});

test('production unblocker package script and output paths are wired', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  const script = fs.readFileSync(path.join(repoRoot, 'scripts', 'production-unblocker.mjs'), 'utf8');

  assert.equal(pkg.scripts['production:unblocker'], 'node scripts/production-unblocker.mjs');
  assert.match(script, /latest-production-unblocker\.md/);
  assert.match(script, /latest-production-unblocker\.json/);
  assert.match(script, /defaultSetupChecklistPath/);
  assert.match(script, /defaultProofPath/);
  assert.match(script, /production-readiness-snapshot\.mjs/);
  assert.match(script, /check-onetime-external-setup-readiness\.mjs/);
  assert.match(script, /--no-write/);
  assert.match(script, /--json/);
  assert.match(script, /--from-snapshot-file/);
});
