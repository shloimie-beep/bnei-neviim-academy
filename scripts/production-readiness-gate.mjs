#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OPERATOR_UNBLOCKER_MD = 'ops/production-readiness/latest-production-unblocker.md';
const OPERATOR_UNBLOCKER_JSON = 'ops/production-readiness/latest-production-unblocker.json';
const OPERATOR_UNBLOCKER_COMMAND = 'npm run production:unblocker';

function readNext(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    json: false,
    fromFile: '',
    allowDirty: false,
    repoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--allow-dirty') options.allowDirty = true;
    else if (arg === '--from-file') {
      options.fromFile = readNext(argv, index, '--from-file');
      index += 1;
    } else if (arg.startsWith('--from-file=')) options.fromFile = arg.slice('--from-file='.length);
    else if (arg === '--repo-root') {
      options.repoRoot = path.resolve(readNext(argv, index, '--repo-root'));
      index += 1;
    } else if (arg.startsWith('--repo-root=')) options.repoRoot = path.resolve(arg.slice('--repo-root='.length));
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export function usage() {
  return `Usage:
  node scripts/production-readiness-gate.mjs --json
  node scripts/production-readiness-gate.mjs --from-file ops/production-readiness/latest-production-readiness-snapshot.json

Read-only production-readiness gate. It samples the current snapshot by default
and exits nonzero while launch-critical blockers, active collision lanes,
queued ChatGPT packets, dirty worktree state, or missing proof remain. It does
not claim jobs, deploy, send messages, mutate providers, save Agent Review
results, change credentials, or touch production data.`;
}

function parseJsonObject(text = '') {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('No JSON object found in snapshot output.');
  return JSON.parse(text.slice(start, end + 1));
}

function runSnapshot(options = {}) {
  const result = spawnSync(process.execPath, ['scripts/production-readiness-snapshot.mjs', '--no-write', '--json'], {
    cwd: options.repoRoot || repoRoot,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 8,
  });
  if (result.status !== 0 || result.error) {
    throw new Error(String(result.stderr || result.error?.message || result.stdout || 'snapshot command failed').trim());
  }
  return parseJsonObject(String(result.stdout || ''));
}

function loadSnapshot(options = {}) {
  if (options.fromFile) {
    const filePath = path.isAbsolute(options.fromFile)
      ? options.fromFile
      : path.join(options.repoRoot || repoRoot, options.fromFile);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return runSnapshot(options);
}

function compactJob(job = {}) {
  return [
    job.job_id ? `job #${job.job_id}` : '',
    job.task_id ? `task #${job.task_id}` : '',
    job.status ? `[${job.status}]` : '',
    job.title || '',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildBlockerGroups({
  assessment = {},
  assessmentReasons = [],
  git = {},
  activeRun = {},
  runBlockers = [],
  proofBlockers = 0,
  queuedDropoffs = 0,
  collisionLanes = [],
  nextBatch = '',
  allowDirty = false,
} = {}) {
  const groups = [];
  const add = (group) => {
    groups.push({
      id: group.id,
      title: group.title,
      owner: group.owner || 'Codex / operator',
      severity: group.severity || 'blocking',
      count: Number(group.count || 1),
      evidence: group.evidence || [],
      next_action: group.next_action || '',
    });
  };

  if (assessment.production_ready !== true || assessment.status !== 'production_ready') {
    add({
      id: 'snapshot_not_production_ready',
      title: 'Production readiness snapshot is not green',
      owner: 'Codex',
      count: Math.max(1, assessmentReasons.length),
      evidence: [
        `snapshot_status=${assessment.status || 'unknown'}`,
        ...assessmentReasons.map((reason) => `reason=${reason}`),
      ],
      next_action: 'Clear or document every category below, then rerun `npm run production:readiness:gate -- --json`.',
    });
  }
  if (git.clean !== true && allowDirty !== true) {
    add({
      id: 'dirty_worktree',
      title: 'Production readiness was sampled from a dirty tree',
      owner: 'Codex',
      evidence: [git.status_short || 'git.clean=false'],
      next_action: 'Commit, stash, or intentionally exclude local changes, then rerun the readiness gate from a clean tree.',
    });
  }
  if (activeRun.validation_passed !== true) {
    add({
      id: 'execution_run_validation',
      title: 'Active execution run validation did not pass',
      owner: 'Codex',
      evidence: [activeRun.run_path || 'active run path missing'],
      next_action: 'Run the execution-run validator and repair the run record before production closeout.',
    });
  }
  if (activeRun.work_remains === true && /^none$/i.test(nextBatch)) {
    add({
      id: 'no_unblocked_executable_batch',
      title: 'Active execution run has work remaining but no unblocked executable batch',
      owner: 'Codex / operator',
      evidence: [activeRun.run_path || 'active run path missing'],
      next_action: 'Use the production unblocker to clear external/proof/collision blockers, then rerun `npm run bna:run:next`.',
    });
  }
  if (runBlockers.length > 0) {
    add({
      id: 'external_setup_blockers',
      title: 'External OneTime setup values or approvals are missing',
      owner: 'Shloimie / provider account owners',
      count: runBlockers.length,
      evidence: runBlockers.map((item) => item.requirement_id || item.title || 'run blocker'),
      next_action: 'Provide aliases/status only, not raw secrets: Stripe sandbox/price, WAPI/Whapi instance/phone/approval flags, and campaign list/copy/suppression/seed approval.',
    });
  }
  if (proofBlockers > 0) {
    add({
      id: 'agent_mode_terminal_proof_missing',
      title: 'Rabbi Agent Review terminal proof is missing',
      owner: 'Shloimie / Agent Mode runner',
      count: proofBlockers,
      evidence: [`remaining_blocker_count=${proofBlockers}`],
      next_action: 'Run the listed Agent Mode prompts and save terminal PASS, FAIL, or BLOCKED proof through the Operations drop-off.',
    });
  }
  if (queuedDropoffs > 0) {
    add({
      id: 'chatgpt_dropoff_queue_ready',
      title: 'ChatGPT dropoff packets are ready for Codex pickup',
      owner: 'Codex / agent fleet',
      count: queuedDropoffs,
      evidence: [`queued_count=${queuedDropoffs}`],
      next_action: 'Run the dropoff ingestor and audit/pick up eligible packets before production closeout.',
    });
  }
  if (collisionLanes.length > 0) {
    add({
      id: 'active_agent_collision_lanes',
      title: 'Active agent lanes must not be overlapped',
      owner: 'Codex / agent fleet',
      count: collisionLanes.length,
      evidence: collisionLanes.map((lane) => compactJob(lane)),
      next_action: 'Wait for the active lane result packets or inspect them before touching overlapping UI/API/Agent Review proof work.',
    });
  }

  return groups;
}

export function buildProductionReadinessGate(snapshot = {}, options = {}) {
  const blockers = [];
  const warnings = [];
  const assessment = snapshot.assessment || {};
  const git = snapshot.git || {};
  const activeRun = snapshot.active_run || {};
  const chatgpt = snapshot.chatgpt_dropoff || {};
  const proof = snapshot.rabbi_agent_review || {};
  const collisionLanes = Array.isArray(assessment.avoid_colliding_with) ? assessment.avoid_colliding_with : [];
  const runBlockers = Array.isArray(activeRun.blockers) ? activeRun.blockers : [];
  const assessmentReasons = Array.isArray(assessment.reason) ? assessment.reason : [];
  const queuedDropoffs = Number(chatgpt.queued_count || assessment.chatgpt_dropoff_queue_ready_count || 0);
  const proofBlockers = Number(proof.remaining_blocker_count || 0);
  const nextBatch = String(activeRun.next_unblocked_executable_batch || '');

  if (assessment.production_ready !== true || assessment.status !== 'production_ready') {
    blockers.push(`Production readiness snapshot status is ${assessment.status || 'unknown'}, not production_ready.`);
  }
  for (const reason of assessmentReasons) blockers.push(`Snapshot reason: ${reason}.`);
  if (git.clean !== true && options.allowDirty !== true) {
    blockers.push('Snapshot sample worktree is dirty; production readiness must be checked from a clean tree.');
  } else if (git.clean !== true) {
    warnings.push('Dirty snapshot sample allowed by --allow-dirty.');
  }
  if (activeRun.validation_passed !== true) {
    blockers.push('Active execution run validation did not pass in the snapshot.');
  }
  if (activeRun.work_remains === true && /^none$/i.test(nextBatch)) {
    blockers.push('Active execution run still has work remaining but no unblocked executable batch.');
  }
  for (const item of runBlockers) {
    blockers.push(`${item.requirement_id || 'REQ-unknown'} blocked: ${item.blocker || 'No blocker text.'} Next: ${item.next_action || 'No next action.'}`);
  }
  if (proofBlockers > 0) {
    blockers.push(`Rabbi Agent Review proof has ${proofBlockers} remaining terminal result blocker(s).`);
  }
  if (queuedDropoffs > 0) {
    blockers.push(`ChatGPT dropoff queue has ${queuedDropoffs} packet(s) ready for Codex pickup.`);
  }
  for (const lane of collisionLanes) {
    blockers.push(`Active agent collision lane remains: ${compactJob(lane)}.`);
  }
  const blockerGroups = buildBlockerGroups({
    assessment,
    assessmentReasons,
    git,
    activeRun,
    runBlockers,
    proofBlockers,
    queuedDropoffs,
    collisionLanes,
    nextBatch,
    allowDirty: options.allowDirty === true,
  });

  return {
    generated_at: new Date().toISOString(),
    report_version: 'bna-production-readiness-gate-v1',
    ok: blockers.length === 0,
    status: blockers.length === 0 ? 'production_ready' : 'blocked',
    blockers,
    blocker_groups: blockerGroups,
    warnings,
    snapshot_summary: {
      generated_at: snapshot.generated_at || '',
      status: assessment.status || 'unknown',
      production_ready: assessment.production_ready === true,
      sampled_git_head: snapshot.freshness?.sampled_git_head || git.head || '',
      sampled_origin_master: snapshot.freshness?.sampled_origin_master || git.origin_master || '',
      sampled_worktree_clean: git.clean === true,
      active_run_path: activeRun.run_path || '',
      active_run_status_counts: activeRun.status_counts || {},
      active_run_blocker_count: runBlockers.length,
      rabbi_agent_review_remaining_blockers: proofBlockers,
      chatgpt_queued_count: queuedDropoffs,
      collision_lane_count: collisionLanes.length,
      blocker_group_count: blockerGroups.length,
    },
    operator_unblocker: {
      markdown_path: OPERATOR_UNBLOCKER_MD,
      json_path: OPERATOR_UNBLOCKER_JSON,
      refresh_command: OPERATOR_UNBLOCKER_COMMAND,
      purpose: 'Operator-facing packet with the exact external setup fields, Agent Mode proof saves, active lanes to avoid, and after-update verification commands still blocking production readiness.',
    },
    next_actions: [
      ...(Array.isArray(snapshot.next_actions) ? snapshot.next_actions : []),
      ...(blockers.length
        ? [{
          owner: 'Codex / operator',
          action: `Refresh and read the production unblocker packet: ${OPERATOR_UNBLOCKER_COMMAND} (${OPERATOR_UNBLOCKER_MD}).`,
          source: 'production_readiness_gate',
        }]
        : []),
    ],
    guardrails: [
      'Read-only gate only.',
      'No deploy, merge, release, Railway mutation, external send, payment, access grant, CRM write, provider write, DNS change, credential change, Agent Review result save, or production-data mutation is performed.',
    ],
  };
}

function printText(report) {
  console.log(`Production readiness gate: ${report.ok ? 'PASS' : 'BLOCKED'}`);
  console.log(`Snapshot status: ${report.snapshot_summary.status}`);
  if (report.blocker_groups?.length) {
    console.log('Blocker groups:');
    report.blocker_groups.forEach((group) => {
      console.log(`- ${group.id}: ${group.title} (${group.count})`);
      if (group.next_action) console.log(`  next: ${group.next_action}`);
    });
  }
  if (report.blockers.length) {
    console.log('Blockers:');
    report.blockers.forEach((blocker) => console.log(`- ${blocker}`));
  }
  if (report.next_actions.length) {
    console.log('Next actions:');
    report.next_actions.slice(0, 8).forEach((item, index) => {
      console.log(`${index + 1}. ${item.owner || 'Owner unknown'}: ${item.action || ''}`);
    });
  }
}

async function main() {
  try {
    const options = parseArgs();
    if (options.help) {
      console.log(usage());
      return;
    }
    const snapshot = loadSnapshot(options);
    const report = buildProductionReadinessGate(snapshot, options);
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else printText(report);
    process.exitCode = report.ok ? 0 : 1;
  } catch (error) {
    const report = {
      generated_at: new Date().toISOString(),
      report_version: 'bna-production-readiness-gate-v1',
      ok: false,
      status: 'failed',
      blockers: [error instanceof Error ? error.message : String(error)],
      guardrails: ['Read-only gate only.'],
    };
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  }
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  main();
}
