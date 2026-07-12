#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(repoRoot, 'ops', 'production-readiness');
const outputJsonPath = path.join(outputDir, 'latest-production-unblocker.json');
const outputMdPath = path.join(outputDir, 'latest-production-unblocker.md');

const defaultSnapshotPath = 'ops/production-readiness/latest-production-readiness-snapshot.json';
const defaultSetupChecklistPath = 'ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.json';
const defaultProofPath = 'ops/agent-review-proof-readiness/latest-rabbi-agent-review-proof-readiness-live.json';
const liveSnapshotCommandArgs = ['scripts/production-readiness-snapshot.mjs', '--no-write', '--json'];
const liveSnapshotCommand = `node ${liveSnapshotCommandArgs.join(' ')}`;
const setupReadinessCommandArgs = ['scripts/check-onetime-external-setup-readiness.mjs', '--json'];
const setupReadinessCommand = `node ${setupReadinessCommandArgs.join(' ')}`;

function nowIso() {
  return new Date().toISOString();
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath, fallback = null) {
  const filePath = repoPath(relativePath);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function redact(text = '') {
  return String(text || '')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]{16,}/g, 'Bearer [REDACTED]')
    .replace(/\b(sk|pk|rk|whsec|xox[baprs]|gh[pousr])_[A-Za-z0-9._-]{12,}\b/g, '[REDACTED_SECRET]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]');
}

export function parseJsonFromCommandOutput(output = '') {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(output.slice(start, end + 1));
  } catch {
    return null;
  }
}

function snapshotFromFile(sourceKind = 'latest_file') {
  return {
    snapshot: readJson(defaultSnapshotPath, {}),
    snapshotSource: defaultSnapshotPath,
    snapshotSourceKind: sourceKind,
    snapshotCommandExitCode: null,
    snapshotLoadError: '',
  };
}

export function loadSnapshotForUnblocker({ useSnapshotFile = false } = {}) {
  if (useSnapshotFile) return snapshotFromFile('latest_file_requested');

  const result = spawnSync(process.execPath, liveSnapshotCommandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    timeout: 120000,
    windowsHide: true,
  });
  const parsed = result.status === 0 ? parseJsonFromCommandOutput(result.stdout || '') : null;

  if (parsed) {
    return {
      snapshot: parsed,
      snapshotSource: liveSnapshotCommand,
      snapshotSourceKind: 'live_no_write_command',
      snapshotCommandExitCode: result.status,
      snapshotLoadError: '',
    };
  }

  return {
    ...snapshotFromFile('fallback_latest_file'),
    snapshotCommandExitCode: typeof result.status === 'number' ? result.status : 1,
    snapshotLoadError: redact(result.stderr || result.error?.message || 'Could not parse live production-readiness snapshot JSON.'),
  };
}

export function loadSetupReadinessForUnblocker() {
  const result = spawnSync(process.execPath, setupReadinessCommandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    timeout: 120000,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 8,
  });
  const parsed = parseJsonFromCommandOutput(result.stdout || '');

  if (parsed) {
    return {
      setupReadiness: parsed,
      setupReadinessSource: setupReadinessCommand,
      setupReadinessSourceKind: result.status === 0 ? 'live_no_write_command_ready' : 'live_no_write_command_expected_blocked',
      setupReadinessCommandExitCode: typeof result.status === 'number' ? result.status : 1,
      setupReadinessLoadError: '',
    };
  }

  return {
    setupReadiness: {},
    setupReadinessSource: setupReadinessCommand,
    setupReadinessSourceKind: 'live_no_write_command_parse_failed',
    setupReadinessCommandExitCode: typeof result.status === 'number' ? result.status : 1,
    setupReadinessLoadError: redact(result.stderr || result.error?.message || 'Could not parse live One Time setup readiness JSON.'),
  };
}

function sortByPriority(items = []) {
  return [...items].sort((a, b) => Number(a.priority ?? 999) - Number(b.priority ?? 999));
}

function setupReadinessItemsById(setupReadiness = {}) {
  const byId = new Map();
  for (const item of [...(setupReadiness.items || []), ...(setupReadiness.blockers || [])]) {
    const id = item?.id || '';
    if (!id) continue;
    byId.set(id, {
      ...(byId.get(id) || {}),
      ...item,
    });
  }
  return byId;
}

function setupItemsFromChecklist(checklist = {}, setupReadiness = {}) {
  const readinessById = setupReadinessItemsById(setupReadiness);
  return sortByPriority((checklist.setup_items || [])
    .filter((item) => item?.operator_blocker === true)
    .map((item) => {
      const readiness = readinessById.get(item.id || '') || {};
      return {
        id: item.id || '',
        title: item.title || '',
        priority: item.priority ?? null,
        owner: 'Shloimie / provider account owners',
        status: item.current_status || 'unknown',
        current_evidence: item.current_evidence || '',
        setup_check_ready: typeof readiness.ready === 'boolean' ? readiness.ready : null,
        current_missing_fields: readiness.missing_fields || [],
        current_warnings: readiness.warnings || [],
        required_fields: item.required_fields || [],
        forbidden: item.forbidden || [],
        verification_after_setup: [
          ...(readiness.verification_after_setup || []),
          ...(item.verification_after_setup || []),
          ...(item.verification_commands_after_setup || []),
        ],
      };
    })
    .filter((item) => item.setup_check_ready !== true));
}

function proofItemsFromReadiness(proof = {}) {
  const statesByKey = new Map((proof.hub_prompt_state || []).map((item) => [item.prompt_key, item]));
  return (proof.remaining_blockers || []).map((item) => {
    const state = statesByKey.get(item.prompt_key) || {};
    return {
      id: item.prompt_key || '',
      owner: 'Shloimie / Agent Mode runner',
      status: state.workflow_state || state.status || 'unknown',
      blocker: item.blocker || 'No saved terminal Agent Review result is visible for this prompt yet.',
      prompt_url: state.public_url || '',
      dropoff_url: state.dropoff_url || '',
      next_action: item.next_action || '',
      terminal_saved_proof: state.terminal_saved_proof === true,
    };
  });
}

function externalRunBlockers(snapshot = {}) {
  return (snapshot.active_run?.blockers || []).map((item) => ({
    id: item.requirement_id || '',
    title: item.title || '',
    owner: item.owner || 'Owner unknown',
    blocker: item.blocker || '',
    next_action: item.next_action || '',
  }));
}

function collisionLanes(snapshot = {}) {
  return (snapshot.assessment?.avoid_colliding_with || []).map((item) => ({
    job_id: item.job_id || '',
    task_id: item.task_id || '',
    ticket_id: item.ticket_id || '',
    status: item.status || '',
    title: item.title || '',
    raw: item.raw || '',
    local_lock_health: item.local_lock_health || item.task_lock?.lock_health || '',
    local_lock_evidence: item.local_lock_evidence || item.task_lock?.local_lock_evidence || '',
    task_lock: item.task_lock || null,
  }));
}

function rabbiTelegramRuntimeProductionReady(rabbiTelegramRuntime = {}) {
  return rabbiTelegramRuntime.status === 'live_smoke_verified' || rabbiTelegramRuntime.production_verified === true;
}

function publicLaunchSmokeReady(publicLaunchSmoke = {}) {
  return publicLaunchSmoke.ready === true && publicLaunchSmoke.fresh_for_launch_gate === true;
}

function publicLaunchSmokeEvidence(publicLaunchSmoke = {}) {
  return [
    `path=${publicLaunchSmoke.path || 'unknown'}`,
    `status=${publicLaunchSmoke.status || 'unknown'}`,
    `ready=${publicLaunchSmoke.ready === true}`,
    `fresh_for_launch_gate=${publicLaunchSmoke.fresh_for_launch_gate === true}`,
    `commands=${publicLaunchSmoke.passed_command_count ?? 0}/${publicLaunchSmoke.command_count ?? 0}`,
    `external_write_performed=${publicLaunchSmoke.external_write_performed === true}`,
    `production_data_mutation_performed=${publicLaunchSmoke.production_data_mutation_performed === true}`,
    publicLaunchSmoke.blocker ? `blocker=${publicLaunchSmoke.blocker}` : '',
  ].filter(Boolean);
}

function collisionLaneEvidence(lane = {}) {
  const label = (lane.raw || `job #${lane.job_id} / task #${lane.task_id} [${lane.status}] ${lane.title}`).replace(/^- /, '');
  return lane.local_lock_evidence ? `${label} (${lane.local_lock_evidence})` : label;
}

function collisionLanesNeedReconciliation(activeCollisionLanes = []) {
  return activeCollisionLanes.some((lane) => {
    const health = lane.local_lock_health || lane.task_lock?.lock_health || '';
    return health && health !== 'fresh_running_lock';
  });
}

function buildBlockerGroups({
  setup_items = [],
  public_launch_smoke = {},
  rabbi_telegram_runtime = {},
  agent_mode_proofs = [],
  active_collision_lanes = [],
  chatgpt_queued_count = 0,
  next_unblocked_executable_batch = '',
  run_blockers = [],
} = {}) {
  const groups = [];
  const add = (group) => {
    groups.push({
      id: group.id,
      title: group.title,
      owner: group.owner,
      count: Number(group.count || 1),
      evidence: group.evidence || [],
      next_action: group.next_action || '',
    });
  };

  if (!next_unblocked_executable_batch || /^none$/i.test(String(next_unblocked_executable_batch))) {
    add({
      id: 'no_unblocked_executable_batch',
      title: 'No unblocked executable batch is available',
      owner: 'Codex / operator',
      evidence: run_blockers.map((item) => item.id || item.title).filter(Boolean),
      next_action: 'Clear the external setup, terminal Agent Mode proof, and active collision-lane blockers; then rerun `npm run bna:run:next`.',
    });
  }
  if (!publicLaunchSmokeReady(public_launch_smoke)) {
    add({
      id: 'public_launch_no_write_smoke',
      title: 'Public launch no-write smoke proof is missing, failed, stale, or unsafe',
      owner: 'Codex',
      evidence: publicLaunchSmokeEvidence(public_launch_smoke),
      next_action: public_launch_smoke.blocker || 'Run the no-write public/lead-capture live smoke sweep and record tracked production-readiness evidence.',
    });
  }
  if (setup_items.length) {
    const currentMissingFields = [...new Set(setup_items.flatMap((item) => item.current_missing_fields || []))];
    add({
      id: 'external_setup_blockers',
      title: 'External One Time setup values or approvals are missing',
      owner: 'Shloimie / provider account owners',
      count: setup_items.length,
      evidence: setup_items.map((item) => (
        item.current_missing_fields?.length
          ? `${item.id}: ${item.current_missing_fields.join(', ')}`
          : item.id
      )),
      next_action: currentMissingFields.length
        ? `Provide aliases/status only, not raw secrets, for current setup-check fields: ${currentMissingFields.join(', ')}.`
        : 'Provide aliases/status only, not raw secrets: Stripe sandbox/price, WAPI/Whapi instance/phone/approval flags, and campaign list/copy/suppression/seed approval.',
    });
  }
  if (rabbi_telegram_runtime.status && !rabbiTelegramRuntimeProductionReady(rabbi_telegram_runtime)) {
    const maskedCandidates = (rabbi_telegram_runtime.masked_candidates || [])
      .map((candidate) => candidate.chat_id_masked)
      .filter(Boolean);
    add({
      id: 'rabbi_telegram_runtime_configuration',
      title: 'Rabbi Telegram runtime is not production-verified',
      owner: 'Codex / operator',
      evidence: [
        `status=${rabbi_telegram_runtime.status}`,
        `chat_id_configured=${rabbi_telegram_runtime.chat_id_configured === true}`,
        `candidate_count=${rabbi_telegram_runtime.candidate_count ?? 0}`,
        `unique_chat_count=${rabbi_telegram_runtime.unique_chat_count ?? 0}`,
        ...[...new Set(maskedCandidates)].map((candidate) => `masked_candidate=${candidate}`),
      ],
      next_action: rabbi_telegram_runtime.next_action || 'Rerun `npm run telegram:rabbi:readiness` and `npm run telegram:rabbi:chat-id`, then update the production readiness snapshot.',
    });
  }
  if (agent_mode_proofs.length) {
    add({
      id: 'agent_mode_terminal_proof_missing',
      title: 'Rabbi Agent Review terminal proof is missing',
      owner: 'Shloimie / Agent Mode runner',
      count: agent_mode_proofs.length,
      evidence: agent_mode_proofs.map((item) => item.id),
      next_action: 'Run each listed Agent Mode prompt and save terminal PASS, FAIL, or BLOCKED proof through the listed Operations drop-off URL.',
    });
  }
  if (active_collision_lanes.length) {
    const needsReconciliation = collisionLanesNeedReconciliation(active_collision_lanes);
    add({
      id: 'active_agent_collision_lanes',
      title: 'Active agent lanes must not be overlapped',
      owner: 'Codex / agent fleet',
      count: active_collision_lanes.length,
      evidence: active_collision_lanes.map(collisionLaneEvidence),
      next_action: needsReconciliation
        ? 'Inspect or reconcile the stale/missing local task-lock state and result packets before touching overlapping UI/API/Agent Review proof work.'
        : 'Wait for these lane result packets or inspect them before touching overlapping UI/API/Agent Review proof work.',
    });
  }
  if (chatgpt_queued_count > 0) {
    add({
      id: 'chatgpt_dropoff_queue_ready',
      title: 'ChatGPT dropoff packets are ready for Codex pickup',
      owner: 'Codex / agent fleet',
      count: chatgpt_queued_count,
      evidence: [`queued_count=${chatgpt_queued_count}`],
      next_action: 'Run the dropoff ingestor and audit/pick up eligible packets before production closeout.',
    });
  }

  return groups;
}

export function buildProductionUnblocker({
  snapshot = {},
  setupChecklist = {},
  setupReadiness = {},
  setupReadinessSource = setupReadinessCommand,
  setupReadinessSourceKind = 'not_loaded',
  setupReadinessCommandExitCode = null,
  setupReadinessLoadError = '',
  proofReadiness = {},
  snapshotSource = defaultSnapshotPath,
  snapshotSourceKind = 'latest_file',
  snapshotCommandExitCode = null,
  snapshotLoadError = '',
} = {}) {
  const setup_items = setupItemsFromChecklist(setupChecklist, setupReadiness);
  const agent_mode_proofs = proofItemsFromReadiness(proofReadiness);
  const run_blockers = externalRunBlockers(snapshot);
  const active_collision_lanes = collisionLanes(snapshot);
  const rabbi_telegram_runtime = snapshot.rabbi_telegram_runtime || {};
  const public_launch_smoke = snapshot.public_launch_smoke || {};
  const chatgpt_queued_count = Number(snapshot.chatgpt_dropoff?.queued_count || 0);
  const next_unblocked_executable_batch = snapshot.active_run?.next_unblocked_executable_batch || '';
  const snapshot_git_head = snapshot.freshness?.sampled_git_head || snapshot.git?.head || '';
  const snapshot_origin_master = snapshot.freshness?.sampled_origin_master || snapshot.git?.origin_master || '';
  const snapshot_worktree_clean =
    typeof snapshot.freshness?.sampled_worktree_clean === 'boolean'
      ? snapshot.freshness.sampled_worktree_clean
      : typeof snapshot.git?.clean === 'boolean'
        ? snapshot.git.clean
        : null;
  const operator_actions = [
    ...setup_items.map((item) => ({
      id: item.id,
      owner: item.owner,
      action: `Provide aliases/status for: ${(item.current_missing_fields?.length ? item.current_missing_fields : item.required_fields).join(', ')}`,
      forbidden: item.forbidden,
      source: item.current_missing_fields?.length ? 'one_time_setup_check_current_missing_fields' : 'one_time_setup_checklist',
    })),
    ...(!publicLaunchSmokeReady(public_launch_smoke)
      ? [{
        id: 'public_launch_no_write_smoke',
        owner: 'Codex',
        action: 'Run the no-write public/lead-capture live smoke sweep and record tracked production-readiness evidence.',
        forbidden: [
          'Do not run generic `npm run app:smoke` when a no-write proof is required because it creates/deletes a live task.',
          'Do not submit live lead forms, send messages, charge cards, grant access, mutate CRM/provider state, or deploy from this packet.',
        ],
        source: 'public_launch_smoke',
      }]
      : []),
    ...(rabbi_telegram_runtime.status && !rabbiTelegramRuntimeProductionReady(rabbi_telegram_runtime)
      ? [{
        id: 'rabbi_telegram_runtime',
        owner: 'Codex / operator',
        action: rabbi_telegram_runtime.next_action || 'Finish Rabbi Telegram runtime configuration and rerun readiness.',
        forbidden: ['Do not paste raw chat IDs, tokens, phone numbers, or private messages into tracked files or chat.', 'Do not send a live Telegram smoke without exact approval.'],
        source: 'rabbi_telegram_runtime',
      }]
      : []),
    ...agent_mode_proofs.map((item) => ({
      id: item.id,
      owner: item.owner,
      action: `Run prompt ${item.prompt_url} and save PASS/FAIL/BLOCKED proof through ${item.dropoff_url || 'the Operations Agent Review drop-off'}.`,
      forbidden: ['Do not broaden the prompt scope.', 'Do not save secrets, private contact exports, payment data, or raw private messages.'],
      source: 'rabbi_agent_review_proof',
    })),
  ];
  const blocker_groups = buildBlockerGroups({
    setup_items,
    public_launch_smoke,
    rabbi_telegram_runtime,
    agent_mode_proofs,
    active_collision_lanes,
    chatgpt_queued_count,
    next_unblocked_executable_batch,
    run_blockers,
  });

  return {
    generated_at: nowIso(),
    report_version: 'bna-production-unblocker-v1',
    production_ready: snapshot.assessment?.production_ready === true,
    snapshot_status: snapshot.assessment?.status || 'unknown',
    source_snapshot_generated_at: snapshot.generated_at || '',
    snapshot_source: snapshotSource,
    snapshot_source_kind: snapshotSourceKind,
    snapshot_git_head,
    snapshot_origin_master,
    snapshot_worktree_clean,
    source_snapshot: {
      source: snapshotSource,
      kind: snapshotSourceKind,
      generated_at: snapshot.generated_at || '',
      git_head: snapshot_git_head,
      origin_master: snapshot_origin_master,
      worktree_clean: snapshot_worktree_clean,
      command_exit_code: snapshotCommandExitCode,
      load_error: snapshotLoadError,
    },
    workspace_project: {
      workspace_key: setupChecklist.workspace_key || 'rabbi_sheller_provider',
      project_key: setupChecklist.project_key || 'one_time_mishnah_class',
    },
    source_setup_readiness: {
      source: setupReadinessSource,
      kind: setupReadinessSourceKind,
      generated_at: setupReadiness.generated_at || '',
      command_exit_code: setupReadinessCommandExitCode,
      load_error: setupReadinessLoadError,
      ready_count: setupReadiness.ready_count ?? null,
      total_count: setupReadiness.total_count ?? null,
      blocker_count: Array.isArray(setupReadiness.blockers) ? setupReadiness.blockers.length : null,
      all_required_external_setup_ready: setupReadiness.all_required_external_setup_ready === true,
    },
    summary: {
      external_setup_item_count: setup_items.length,
      setup_readiness_ready_count: setupReadiness.ready_count ?? null,
      setup_readiness_total_count: setupReadiness.total_count ?? null,
      setup_readiness_blocker_count: Array.isArray(setupReadiness.blockers) ? setupReadiness.blockers.length : null,
      public_launch_smoke_status: public_launch_smoke.status || 'unknown',
      public_launch_smoke_ready: publicLaunchSmokeReady(public_launch_smoke),
      public_launch_smoke_fresh: public_launch_smoke.fresh_for_launch_gate === true,
      public_launch_smoke_age_hours: public_launch_smoke.age_hours ?? null,
      public_launch_smoke_path: public_launch_smoke.path || '',
      rabbi_telegram_runtime_status: rabbi_telegram_runtime.status || 'unknown',
      rabbi_telegram_runtime_local_ready: rabbi_telegram_runtime.local_ready === true,
      rabbi_telegram_chat_id_configured: rabbi_telegram_runtime.chat_id_configured === true,
      rabbi_telegram_candidate_count: rabbi_telegram_runtime.candidate_count ?? null,
      agent_mode_proof_count: agent_mode_proofs.length,
      active_collision_lane_count: active_collision_lanes.length,
      active_collision_stale_or_missing_lock_count: active_collision_lanes.filter((lane) => {
        const health = lane.local_lock_health || lane.task_lock?.lock_health || '';
        return health && health !== 'fresh_running_lock';
      }).length,
      chatgpt_queued_count,
      next_unblocked_executable_batch,
      blocker_group_count: blocker_groups.length,
    },
    run_blockers,
    blocker_groups,
    setup_items,
    public_launch_smoke,
    rabbi_telegram_runtime,
    agent_mode_proofs,
    active_collision_lanes,
    operator_actions,
    after_operator_update: [
      'Do not paste raw secrets into chat or tracked repo files; provide aliases, status labels, or keyholder/provider-dashboard confirmation.',
      'Rerun `npm run one-time:setup:check` after Stripe/campaign setup changes or WAPI/Whapi runtime changes.',
      'Rerun `npm run one-time:wapi:readiness` after WAPI/Whapi changes.',
      'Rerun `npm run telegram:rabbi:readiness` and `npm run telegram:rabbi:chat-id` after Rabbi Telegram runtime changes.',
      'Rerun `npm run app:smoke:rabbi-agent-review-proof-readiness` after Agent Mode proof is saved.',
      'Rerun `npm run production:readiness:snapshot` and `npm run production:readiness:gate` after any blocker changes.',
    ],
    guardrails: [
      'No deploy is approved by this packet.',
      'This packet is read-only and does not approve sends, charges, access grants, DNS/account changes, provider writes, credential changes, Agent Review result saves, deploys, or production-data mutation.',
      'Raw secrets, raw phone/contact exports, payment data, and private message bodies must not be committed.',
      'Immediate lead capture/free-class lane remains live; full payment/access/campaign automation remains blocked until these items are cleared and verified.',
    ],
    sources: [
      snapshotSource,
      public_launch_smoke.path,
      setupReadinessSource,
      rabbi_telegram_runtime.readiness_path,
      rabbi_telegram_runtime.runtime_report_available ? rabbi_telegram_runtime.chat_id_report_path : '',
      defaultSetupChecklistPath,
      defaultProofPath,
    ].filter(Boolean),
  };
}

function formatList(items = [], fallback = 'none') {
  return items.length ? items.map((item) => `  - ${item}`).join('\n') : `  - ${fallback}`;
}

export function renderMarkdown(report = {}) {
  const cleanLabel =
    typeof report.snapshot_worktree_clean === 'boolean'
      ? (report.snapshot_worktree_clean ? 'yes' : 'no')
      : 'unknown';
  const lines = [
    `# Production Unblocker - ${report.generated_at}`,
    '',
    `Snapshot status: ${report.snapshot_status}`,
    `Production ready: ${report.production_ready ? 'yes' : 'no'}`,
    `Source snapshot: ${report.snapshot_source || 'unknown'} (${report.snapshot_source_kind || 'unknown'})`,
    `Source snapshot generated at: ${report.source_snapshot_generated_at || 'unknown'}`,
    `Snapshot git head: ${report.snapshot_git_head || 'unknown'} (origin/master: ${report.snapshot_origin_master || 'unknown'}, worktree clean: ${cleanLabel})`,
    report.source_snapshot?.load_error ? `Source snapshot warning: ${report.source_snapshot.load_error}` : '',
    `Workspace/project: ${report.workspace_project.workspace_key} / ${report.workspace_project.project_key}`,
    `Next unblocked executable batch: ${report.summary.next_unblocked_executable_batch || 'none'}`,
    `One Time setup check: ${report.summary.setup_readiness_ready_count ?? 'unknown'}/${report.summary.setup_readiness_total_count ?? 'unknown'} ready (${report.source_setup_readiness?.kind || 'not_loaded'}, exit ${report.source_setup_readiness?.command_exit_code ?? 'unknown'})`,
    report.source_setup_readiness?.load_error ? `One Time setup check warning: ${report.source_setup_readiness.load_error}` : '',
    '',
    '## What Blocks Production',
    '',
    `- External setup items: ${report.summary.external_setup_item_count}`,
    `- Public launch no-write smoke: ${report.summary.public_launch_smoke_status || 'unknown'} (${report.summary.public_launch_smoke_ready ? 'ready' : 'not ready'})`,
    `- Rabbi Telegram runtime: ${report.summary.rabbi_telegram_runtime_status || 'unknown'}`,
    `- Agent Mode terminal proof items: ${report.summary.agent_mode_proof_count}`,
    `- Active collision lanes: ${report.summary.active_collision_lane_count} (stale/missing local locks: ${report.summary.active_collision_stale_or_missing_lock_count ?? 0})`,
    `- ChatGPT packets queued: ${report.summary.chatgpt_queued_count}`,
    `- Blocker groups: ${report.summary.blocker_group_count}`,
    '',
    '## Owner Action Summary',
    '',
    ...(report.blocker_groups?.length
      ? report.blocker_groups.flatMap((group) => [
        `### ${group.id} - ${group.title}`,
        '',
        `Owner: ${group.owner}`,
        `Count: ${group.count}`,
        'Evidence:',
        formatList(group.evidence),
        `Next action: ${group.next_action || 'No next action recorded.'}`,
        '',
      ])
      : ['- None reported.', '']),
    '## External Setup To Provide',
    '',
  ];

  for (const item of report.setup_items || []) {
    lines.push(
      `### ${item.id} - ${item.title}`,
      '',
      `Owner: ${item.owner}`,
      `Status: ${item.status}`,
      item.current_evidence ? `Current evidence: ${item.current_evidence}` : '',
      `Setup check ready: ${typeof item.setup_check_ready === 'boolean' ? (item.setup_check_ready ? 'yes' : 'no') : 'unknown'}`,
      'Current missing fields from setup check:',
      formatList(item.current_missing_fields),
      'Setup check warnings:',
      formatList(item.current_warnings),
      'Static checklist fields:',
      formatList(item.required_fields),
      'Forbidden in this packet:',
      formatList(item.forbidden),
      'Verification after setup:',
      formatList(item.verification_after_setup, 'Rerun the relevant readiness command.'),
      '',
    );
  }

  lines.push('## Public Launch No-Write Smoke', '');
  const publicSmoke = report.public_launch_smoke || {};
  lines.push(
    `Status: ${publicSmoke.status || 'unknown'}`,
    `Ready: ${publicLaunchSmokeReady(publicSmoke) ? 'yes' : 'no'}`,
    `Fresh for launch gate: ${publicSmoke.fresh_for_launch_gate ? 'yes' : 'no'}`,
    `Age hours: ${publicSmoke.age_hours ?? 'unknown'}`,
    `Commands passed: ${publicSmoke.passed_command_count ?? 0}/${publicSmoke.command_count ?? 0}`,
    `External write performed: ${publicSmoke.external_write_performed ? 'yes' : 'no'}`,
    `Production data mutation performed: ${publicSmoke.production_data_mutation_performed ? 'yes' : 'no'}`,
    `Evidence path: ${publicSmoke.path || 'unknown'}`,
    `Blocker: ${publicSmoke.blocker || 'none'}`,
    '',
  );

  lines.push('## Rabbi Telegram Runtime', '');
  const rabbiRuntime = report.rabbi_telegram_runtime || {};
  lines.push(
    `Status: ${rabbiRuntime.status || 'unknown'}`,
    `Local ready: ${rabbiRuntime.local_ready ? 'yes' : 'no'}`,
    `Readiness report: ${rabbiRuntime.readiness_path || 'unknown'}`,
    `Chat ID readback report: ${rabbiRuntime.chat_id_report_path || 'unknown'} (${rabbiRuntime.runtime_report_available ? 'available locally' : 'missing locally'})`,
    `Chat ID configured: ${rabbiRuntime.chat_id_configured ? 'yes' : 'no'}`,
    `Candidate count: ${rabbiRuntime.candidate_count ?? 'unknown'}`,
    `Unique masked chat count: ${rabbiRuntime.unique_chat_count ?? 'unknown'}`,
  );
  if (rabbiRuntime.masked_candidates?.length) {
    lines.push('Masked candidates:');
    for (const candidate of rabbiRuntime.masked_candidates) {
      lines.push(`  - ${candidate.chat_id_masked} (${candidate.chat_type || 'unknown'}, ${candidate.text_kind || 'unknown'}, ${candidate.message_date || 'no date'})`);
    }
  } else {
    lines.push('Masked candidates:', '  - none');
  }
  lines.push(
    `Live delivery smoke: ${rabbiRuntime.live_delivery_smoke || 'unknown'}`,
    `Next action: ${rabbiRuntime.next_action || 'No next action recorded.'}`,
    '',
  );

  lines.push('## Agent Mode Proof To Save', '');
  for (const item of report.agent_mode_proofs || []) {
    lines.push(
      `### ${item.id}`,
      '',
      `Owner: ${item.owner}`,
      `Status: ${item.status}`,
      `Prompt: ${item.prompt_url || 'missing'}`,
      `Drop-off: ${item.dropoff_url || 'Operations Agent Review drop-off'}`,
      `Blocker: ${item.blocker}`,
      'Required result: save terminal PASS, FAIL, or BLOCKED proof for only this prompt scope.',
      '',
    );
  }

  lines.push('## Active Lanes To Avoid', '');
  if (report.active_collision_lanes?.length) {
    for (const lane of report.active_collision_lanes) {
      lines.push(`- ${collisionLaneEvidence(lane)}`);
    }
  } else {
    lines.push('- None reported.');
  }

  lines.push('', '## After Operator Update', '', ...report.after_operator_update.map((item) => `- ${item}`));
  lines.push('', '## Guardrails', '', ...report.guardrails.map((item) => `- ${item}`));
  lines.push('', '## Sources', '', ...report.sources.map((item) => `- ${item}`), '');

  return `${lines.filter((line) => line !== '').join('\n')}\n`;
}

export function parseArgs(argv = process.argv.slice(2)) {
  return {
    json: argv.includes('--json'),
    noWrite: argv.includes('--no-write'),
    useSnapshotFile: argv.includes('--from-snapshot-file') || argv.includes('--use-latest-snapshot'),
  };
}

function main() {
  const args = parseArgs();
  const snapshotLoad = loadSnapshotForUnblocker({ useSnapshotFile: args.useSnapshotFile });
  const setupReadinessLoad = loadSetupReadinessForUnblocker();
  const report = buildProductionUnblocker({
    snapshot: snapshotLoad.snapshot,
    setupChecklist: readJson(defaultSetupChecklistPath, {}),
    setupReadiness: setupReadinessLoad.setupReadiness,
    setupReadinessSource: setupReadinessLoad.setupReadinessSource,
    setupReadinessSourceKind: setupReadinessLoad.setupReadinessSourceKind,
    setupReadinessCommandExitCode: setupReadinessLoad.setupReadinessCommandExitCode,
    setupReadinessLoadError: setupReadinessLoad.setupReadinessLoadError,
    proofReadiness: readJson(defaultProofPath, {}),
    snapshotSource: snapshotLoad.snapshotSource,
    snapshotSourceKind: snapshotLoad.snapshotSourceKind,
    snapshotCommandExitCode: snapshotLoad.snapshotCommandExitCode,
    snapshotLoadError: snapshotLoad.snapshotLoadError,
  });

  if (!args.noWrite) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputJsonPath, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(outputMdPath, renderMarkdown(report));
  }

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Production unblocker: ${report.snapshot_status}`);
    if (!args.noWrite) {
      console.log(`Wrote ${relative(outputMdPath)}`);
      console.log(`Wrote ${relative(outputJsonPath)}`);
    }
    console.log(`External setup items: ${report.summary.external_setup_item_count}`);
    console.log(`Agent Mode proof items: ${report.summary.agent_mode_proof_count}`);
  }
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  main();
}
