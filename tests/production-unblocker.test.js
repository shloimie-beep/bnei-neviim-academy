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
  assert.equal(report.summary.agent_mode_proof_count, 1);
  assert.equal(report.summary.active_collision_lane_count, 1);
  assert.deepEqual(report.setup_items.map((item) => item.id), ['SETUP-ONETIME-STRIPE-001', 'SETUP-ONETIME-WHAPI-001']);
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
  assert.match(script, /--no-write/);
  assert.match(script, /--json/);
  assert.match(script, /--from-snapshot-file/);
});
