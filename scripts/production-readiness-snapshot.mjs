#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(repoRoot, 'ops', 'production-readiness');
const latestJsonPath = path.join(outputDir, 'latest-production-readiness-snapshot.json');
const latestMdPath = path.join(outputDir, 'latest-production-readiness-snapshot.md');
const oneTimeSetupChecklistPath = 'ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.json';
const oneTimeSetupCheckCommandArgs = ['scripts/check-onetime-external-setup-readiness.mjs', '--json'];
const publicLaunchSmokeMaxAgeHours = 24;
const agentFleetCollisionLockFreshHours = 2;
const rabbiTelegramReadinessPath = 'ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.json';
const rabbiChatIdRuntimeReportPath = '.runtime/rabbi-telegram-chat-id-candidates.json';
const args = new Set(process.argv.slice(2));
const shouldWrite = !args.has('--no-write');
const shouldPrintJson = args.has('--json');
const nodeBin = process.execPath;

function nowIso() {
  return new Date().toISOString();
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function redact(text = '') {
  return String(text || '')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]{16,}/g, 'Bearer [REDACTED]')
    .replace(/\b(sk|pk|rk|whsec|xox[baprs]|gh[pousr])_[A-Za-z0-9._-]{12,}\b/g, '[REDACTED_SECRET]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]');
}

function runCommand(displayCommand, command, commandArgs = [], timeoutMs = 120000) {
  const started = Date.now();
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
    timeout: timeoutMs,
    windowsHide: true,
  });
  return {
    command: displayCommand,
    exit_code: typeof result.status === 'number' ? result.status : 1,
    ok: result.status === 0,
    duration_ms: Date.now() - started,
    stdout: redact(result.stdout || '').trim(),
    stderr: redact(result.stderr || result.error?.message || '').trim(),
  };
}

function runNpm(scriptName) {
  const commands = {
    'bna:run:next': ['scripts/bna-execution-run.mjs', 'next'],
    'bna:run:blockers': ['scripts/bna-execution-run.mjs', 'blockers'],
    'agent:fleet:status': ['scripts/agent-fleet-supervisor.mjs', '--status'],
    'chatgpt:dropoff:scan': ['scripts/chatgpt-dropoff-ingestor.mjs', '--json'],
  };
  const commandArgs = commands[scriptName];
  if (!commandArgs) {
    return {
      command: `npm run ${scriptName}`,
      exit_code: 1,
      ok: false,
      duration_ms: 0,
      stdout: '',
      stderr: `No direct command mapping exists for ${scriptName}.`,
    };
  }
  return runCommand(`npm run ${scriptName}`, nodeBin, commandArgs);
}

function runGit(gitArgs) {
  const result = runCommand(`git ${gitArgs.join(' ')}`, 'git', gitArgs, 30000);
  return result.ok ? result.stdout.trim() : '';
}

function parseStatusCounts(output = '') {
  const counts = {};
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^- ([^:]+):\s*(\d+)/);
    if (match) counts[match[1].trim()] = Number(match[2]);
  }
  return counts;
}

function parseActiveRun(output = '') {
  return {
    run_path: output.match(/Execution run:\s*(.+)/)?.[1]?.trim() || '',
    status_counts: parseStatusCounts(output),
    work_remains: /Work remains:\s*yes/i.test(output),
    validation_passed: /Validation passed\./i.test(output),
    next_unblocked_executable_batch:
      output.match(/Next unblocked executable batch:\s*(.+)/)?.[1]?.trim() || '',
  };
}

function parseRunBlockers(output = '') {
  const blockers = [];
  let current = null;
  for (const line of output.split(/\r?\n/)) {
    const reqMatch = line.match(/^- (REQ-\d{8}-\d+):\s*(.+)$/);
    if (reqMatch) {
      current = {
        requirement_id: reqMatch[1],
        title: reqMatch[2].trim(),
        owner: '',
        blocker: '',
        next_action: '',
      };
      blockers.push(current);
      continue;
    }
    if (!current) continue;
    const ownerMatch = line.match(/^\s+owner:\s*(.+)$/);
    const blockerMatch = line.match(/^\s+blocker:\s*(.+)$/);
    const nextActionMatch = line.match(/^\s+next_action:\s*(.+)$/);
    if (ownerMatch) current.owner = ownerMatch[1].trim();
    if (blockerMatch) current.blocker = blockerMatch[1].trim();
    if (nextActionMatch) current.next_action = nextActionMatch[1].trim();
  }
  return blockers;
}

export function parseFleetStatus(output = '') {
  const summary = {};
  const active_policy_jobs = [];
  let inActivePolicySection = false;
  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^Observable jobs not claimable by active-task policy:/i.test(trimmed)) {
      inActivePolicySection = true;
      continue;
    }
    if (inActivePolicySection) {
      if (!trimmed.startsWith('- job #')) continue;
      active_policy_jobs.push({
        job_id: trimmed.match(/job #(\d+)/)?.[1] || '',
        task_id: trimmed.match(/task #(\d+)/)?.[1] || '',
        ticket_id: trimmed.match(/ticket #(\d+)/)?.[1] || '',
        status: trimmed.match(/\[([^\]]+)\]/)?.[1] || '',
        title: trimmed.replace(/^- job #[^\]]+\]\s*/, '').trim(),
        raw: trimmed,
      });
      continue;
    }
    const keyValue = trimmed.match(/^- ([^:]+):\s*(.+)$/);
    if (keyValue) {
      const key = keyValue[1].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      summary[key] = keyValue[2].trim();
    }
  }
  return { summary, active_policy_jobs };
}

function parseJsonFromOutput(output = '') {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(output.slice(start, end + 1));
  } catch {
    return null;
  }
}

function readJsonIfExists(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function processIsAlive(pid) {
  const numericPid = Number(pid);
  if (!Number.isFinite(numericPid) || numericPid <= 0) return false;
  try {
    process.kill(numericPid, 0);
    return true;
  } catch {
    return false;
  }
}

function taskLockRelativePath(taskId = '') {
  return taskId ? `.runtime/agent-fleet/task-${taskId}.lock.json` : '';
}

function inspectTaskLock(taskId = '', sampledAt = new Date()) {
  const lockPath = taskLockRelativePath(taskId);
  if (!taskId) {
    return {
      lock_path: '',
      lock_exists: false,
      lock_health: 'not_inspected_no_task_id',
      local_lock_evidence: 'local_lock=not_inspected_no_task_id',
    };
  }

  const lock = readJsonIfExists(lockPath);
  if (!lock) {
    return {
      lock_path: lockPath,
      lock_exists: false,
      lock_health: 'missing_lock',
      local_lock_evidence: `local_lock=missing path=${lockPath}`,
    };
  }

  const pid = Number(lock.pid || 0);
  const signalAt = lock.heartbeat_at || lock.started_at || lock.startedAt || '';
  const signalMs = Date.parse(signalAt);
  const ageHours = Number.isFinite(signalMs)
    ? Number(((sampledAt.getTime() - signalMs) / 3600000).toFixed(2))
    : null;
  const pidRunning = processIsAlive(pid);
  let lockHealth = 'stale_lock_dead_pid';
  if (pidRunning && typeof ageHours === 'number' && ageHours >= 0 && ageHours <= agentFleetCollisionLockFreshHours) {
    lockHealth = 'fresh_running_lock';
  } else if (pidRunning) {
    lockHealth = 'running_old_heartbeat';
  }

  const evidence = [
    `local_lock=${lockHealth}`,
    pid ? `pid=${pid}` : '',
    signalAt ? `heartbeat=${signalAt}` : '',
    typeof ageHours === 'number' ? `age_hours=${ageHours}` : '',
    `path=${lockPath}`,
  ].filter(Boolean).join(' ');

  return {
    lock_path: lockPath,
    lock_exists: true,
    lock_pid: pid || null,
    lock_pid_running: pidRunning,
    lock_started_at: lock.started_at || lock.startedAt || '',
    lock_heartbeat_at: lock.heartbeat_at || '',
    lock_age_hours: ageHours,
    lock_fresh_max_hours: agentFleetCollisionLockFreshHours,
    lock_health: lockHealth,
    local_lock_evidence: evidence,
  };
}

function enrichFleetStatusWithTaskLocks(fleet = {}, sampledAt = new Date()) {
  return {
    ...fleet,
    active_policy_jobs: (fleet.active_policy_jobs || []).map((job) => {
      const task_lock = inspectTaskLock(job.task_id, sampledAt);
      return {
        ...job,
        task_lock,
        local_lock_health: task_lock.lock_health,
        local_lock_evidence: task_lock.local_lock_evidence,
      };
    }),
  };
}

function latestMatchingFile(relativeDir, pattern) {
  const dirPath = path.join(repoRoot, relativeDir);
  if (!fs.existsSync(dirPath)) return '';
  return fs.readdirSync(dirPath)
    .filter((name) => pattern.test(name))
    .sort()
    .at(-1) || '';
}

function buildGitSnapshot() {
  const statusShort = runGit(['status', '-sb']);
  const statusLines = statusShort.split(/\r?\n/).filter(Boolean);
  return {
    branch: runGit(['branch', '--show-current']),
    head: runGit(['rev-parse', '--short', 'HEAD']),
    origin_master: runGit(['rev-parse', '--short', 'origin/master']),
    status_short: statusShort,
    clean: statusLines.length === 1 && !statusLines.some((line, index) => index > 0 && line.trim()),
  };
}

function summarizeProofState() {
  const proofPath = 'ops/agent-review-proof-readiness/latest-rabbi-agent-review-proof-readiness-live.json';
  const proof = readJsonIfExists(proofPath);
  if (!proof) {
    return {
      path: proofPath,
      available: false,
      status: 'missing',
      remaining_blocker_count: null,
      next_agent_mode_prompts: [],
      prompt_states: [],
    };
  }
  return {
    path: proofPath,
    available: true,
    status: proof.status || 'unknown',
    remaining_blocker_count: Array.isArray(proof.remaining_blockers) ? proof.remaining_blockers.length : 0,
    next_agent_mode_prompts: Array.isArray(proof.next_agent_mode_prompts) ? proof.next_agent_mode_prompts : [],
    prompt_states: Array.isArray(proof.hub_prompt_state)
      ? proof.hub_prompt_state.map((item) => ({
          prompt_key: item.prompt_key || '',
          workflow_state: item.workflow_state || item.status || '',
          latest_result_status: item.latest_result_status || null,
          terminal_saved_proof: Boolean(item.terminal_saved_proof),
          public_url: item.public_url || '',
          dropoff_url: item.dropoff_url || '',
        }))
      : [],
  };
}

function summarizeAgentFleetReadiness() {
  const readinessPath = 'ops/agent-fleet-hardening/latest-agent-fleet-readiness.json';
  const readiness = readJsonIfExists(readinessPath);
  if (!readiness) {
    return { path: readinessPath, available: false };
  }
  const kimi = readiness.kimi_fallback_readiness || {};
  const deployPreflight = readiness.production_deploy_preflight || {};
  return {
    path: readinessPath,
    available: true,
    ok: readiness.ok === true,
    kimi_fallback_readiness: {
      ok: kimi.ok === true,
      fallback_enabled: kimi.fallback_enabled === true,
      fallback_mode: kimi.fallback_mode || '',
      configured_model: kimi.configured_model || '',
      command_found: kimi.command_probe?.found === true,
      version: kimi.version_probe?.version || '',
    },
    production_deploy_preflight: {
      ok: deployPreflight.ok === true,
      command: deployPreflight.command || '',
      enforced_before_auto_deploy: deployPreflight.enforced_before_auto_deploy === true,
      skipped_reason_when_blocked: deployPreflight.skipped_reason_when_blocked || '',
      deploy_performed: deployPreflight.deploy_performed === true,
      live_gate_run_performed: deployPreflight.live_gate_run_performed === true,
      behavior: deployPreflight.behavior || '',
    },
  };
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

function summarizeOneTimeSetupChecklist(setupCheckCommand = {}) {
  const checklist = readJsonIfExists(oneTimeSetupChecklistPath);
  const setupReadiness = parseJsonFromOutput(setupCheckCommand.stdout || '');
  const setupReadinessById = setupReadinessItemsById(setupReadiness || {});
  const readinessSummary = {
    source: 'npm run one-time:setup:check',
    command: `node ${oneTimeSetupCheckCommandArgs.join(' ')}`,
    available: Boolean(setupReadiness),
    generated_at: setupReadiness?.generated_at || '',
    command_exit_code: typeof setupCheckCommand.exit_code === 'number' ? setupCheckCommand.exit_code : null,
    ready_count: setupReadiness?.ready_count ?? null,
    total_count: setupReadiness?.total_count ?? null,
    blocker_count: Array.isArray(setupReadiness?.blockers) ? setupReadiness.blockers.length : null,
    all_required_external_setup_ready: setupReadiness?.all_required_external_setup_ready === true,
    load_error: setupReadiness ? '' : redact(setupCheckCommand.stderr || 'Could not parse OneTime setup check JSON.'),
  };
  if (!checklist) {
    return {
      path: oneTimeSetupChecklistPath,
      available: false,
      setup_readiness: readinessSummary,
      workspace_key: '',
      project_key: '',
      setup_ready_count: '',
      ready_items: [],
      operator_blocker_count: null,
      operator_blocker_items: [],
    };
  }
  const readyItemsFromCheck = (setupReadiness?.items || [])
    .filter((item) => item?.ready === true)
    .map((item) => item.id)
    .filter(Boolean);
  const operatorBlockerItems = (checklist.setup_items || [])
    .filter((item) => item?.operator_blocker === true)
    .sort((a, b) => Number(a.priority ?? 999) - Number(b.priority ?? 999))
    .map((item) => {
      const readiness = setupReadinessById.get(item.id || '') || {};
      return {
        id: item.id || '',
        title: item.title || '',
        status: item.current_status || 'unknown',
        priority: item.priority ?? null,
        owner: 'Shloimie / provider account owners',
        setup_check_ready: typeof readiness.ready === 'boolean' ? readiness.ready : null,
        current_missing_fields: readiness.missing_fields || [],
        current_warnings: readiness.warnings || [],
        required_fields: item.required_fields || [],
        forbidden: item.forbidden || [],
      };
    });
  return {
    path: oneTimeSetupChecklistPath,
    available: true,
    setup_readiness: readinessSummary,
    workspace_key: checklist.workspace_key || '',
    project_key: checklist.project_key || '',
    setup_ready_count:
      typeof setupReadiness?.ready_count === 'number' && typeof setupReadiness?.total_count === 'number'
        ? `${setupReadiness.ready_count}/${setupReadiness.total_count}`
        : checklist.current_state?.setup_ready_count || '',
    ready_items: readyItemsFromCheck.length ? readyItemsFromCheck : checklist.current_state?.ready_items || [],
    operator_blocker_count: operatorBlockerItems.length,
    operator_blocker_items: operatorBlockerItems,
  };
}

function maskSensitiveId(value = '') {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  const lastFour = normalized.slice(-4);
  return `${'*'.repeat(Math.max(0, normalized.length - 4))}${lastFour}`;
}

function summarizeRabbiTelegramRuntime() {
  const readiness = readJsonIfExists(rabbiTelegramReadinessPath);
  const runtimeReport = readJsonIfExists(rabbiChatIdRuntimeReportPath);
  const config = readiness?.rabbi_telegram?.config || readiness?.notification_config?.rabbi_elie_scheller || {};
  const tokenConfigured = config.token_configured === true;
  const chatIdConfigured = config.chat_id_configured === true;
  const opsUsernameConfigured = config.ops_username_configured === true;
  const opsPasswordConfigured = config.ops_password_configured === true;
  const localReady = readiness?.rabbi_telegram?.ready === true || (
    tokenConfigured &&
    chatIdConfigured &&
    opsUsernameConfigured &&
    opsPasswordConfigured
  );
  const candidates = Array.isArray(runtimeReport?.candidates)
    ? runtimeReport.candidates.map((candidate) => ({
      chat_id_masked: candidate.chat_id_masked || maskSensitiveId(candidate.chat_id),
      chat_type: candidate.chat?.type || candidate.chat_type || '',
      source: candidate.source || '',
      text_kind: candidate.text_kind || '',
      message_date: candidate.message_date || '',
    })).filter((candidate) => candidate.chat_id_masked)
    : [];
  const uniqueMasked = [...new Set(candidates.map((candidate) => candidate.chat_id_masked).filter(Boolean))];
  const candidateCount = Number(runtimeReport?.candidate_count ?? candidates.length ?? 0);
  const uniqueChatCount = Number(runtimeReport?.unique_chat_count ?? uniqueMasked.length ?? 0);
  const startCommandCount = Number(runtimeReport?.start_command_count ?? candidates.filter((candidate) => candidate.text_kind === 'start_command').length ?? 0);
  let status = 'unknown';
  let nextAction = 'Run `npm run telegram:rabbi:readiness` and `npm run telegram:rabbi:chat-id` before making a launch claim.';

  if (localReady) {
    status = 'local_runtime_ready_live_smoke_pending';
    nextAction = 'Schedule the normal hosted restart/deploy window, then run a scoped Rabbi Telegram live smoke only with exact send approval and record proof.';
  } else if (candidateCount > 0 || uniqueChatCount > 0) {
    status = 'candidate_available_config_required';
    nextAction = 'Verify the intended Rabbi account/group in the ignored runtime report, set `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` in local/hosted runtime config, rerun readiness, then live-smoke only with explicit send approval.';
  } else if (!tokenConfigured) {
    status = 'blocked_missing_bot_token';
    nextAction = 'Configure the Rabbi bot token through secret-safe runtime config, then rerun readiness.';
  } else if (!chatIdConfigured) {
    status = 'blocked_missing_chat_id';
    nextAction = 'Ask the intended Rabbi account/group to message `t.me/onetimeaios_bot`, rerun `npm run telegram:rabbi:chat-id`, then configure the verified chat ID through secret-safe runtime config.';
  }

  return {
    readiness_path: rabbiTelegramReadinessPath,
    chat_id_report_path: rabbiChatIdRuntimeReportPath,
    readiness_available: Boolean(readiness),
    runtime_report_available: Boolean(runtimeReport),
    checked_at: readiness?.checked_at || '',
    chat_id_checked_at: runtimeReport?.checked_at || '',
    status,
    local_ready: localReady,
    configuration_ready: localReady,
    production_verified: status === 'live_smoke_verified',
    readiness_status: readiness?.rabbi_telegram?.status || 'unknown',
    readiness_blockers: Array.isArray(readiness?.rabbi_telegram?.blockers) ? readiness.rabbi_telegram.blockers : [],
    token_configured: tokenConfigured,
    chat_id_configured: chatIdConfigured,
    ops_username_configured: opsUsernameConfigured,
    ops_password_configured: opsPasswordConfigured,
    bot_username: runtimeReport?.bot?.username || '',
    candidate_count: candidateCount,
    unique_chat_count: uniqueChatCount,
    start_command_count: startCommandCount,
    masked_candidates: candidates,
    live_delivery_smoke: 'not_exercised_by_readiness_report',
    next_action: nextAction,
  };
}

function summarizePublicLaunchSmokeReadback() {
  const fileName = latestMatchingFile('ops/production-readiness', /no-write-live-smoke-readback\.json$/);
  const relativePath = fileName ? `ops/production-readiness/${fileName}` : '';
  const readback = relativePath ? readJsonIfExists(relativePath) : null;
  if (!readback) {
    return {
      path: relativePath || 'ops/production-readiness/*no-write-live-smoke-readback.json',
      available: false,
      status: 'missing',
      command_count: 0,
      passed_command_count: 0,
      external_write_performed: null,
      production_data_mutation_performed: null,
      age_hours: null,
      fresh_for_launch_gate: false,
      ready: false,
      blocker: 'No tracked no-write public/lead-capture live smoke readback is available.',
    };
  }

  const recordedAtMs = Date.parse(readback.recorded_at || '');
  const ageHours = Number.isFinite(recordedAtMs)
    ? Math.max(0, (Date.now() - recordedAtMs) / (60 * 60 * 1000))
    : null;
  const commandCount = Array.isArray(readback.commands) ? readback.commands.length : 0;
  const passedCommandCount = Array.isArray(readback.commands)
    ? readback.commands.filter((command) => command.status === 'passed').length
    : 0;
  const fresh = ageHours !== null && ageHours <= publicLaunchSmokeMaxAgeHours;
  const ready =
    readback.status === 'passed' &&
    commandCount > 0 &&
    passedCommandCount === commandCount &&
    readback.external_write_performed === false &&
    readback.production_data_mutation_performed === false &&
    fresh;
  const blockers = [
    readback.status === 'passed' ? '' : `status=${readback.status || 'unknown'}`,
    commandCount > 0 ? '' : 'no_commands_recorded',
    passedCommandCount === commandCount ? '' : `passed_commands=${passedCommandCount}/${commandCount}`,
    readback.external_write_performed === false ? '' : 'external_write_performed_not_false',
    readback.production_data_mutation_performed === false ? '' : 'production_data_mutation_performed_not_false',
    fresh ? '' : `stale_or_unparseable_age_hours=${ageHours === null ? 'unknown' : ageHours.toFixed(2)}`,
  ].filter(Boolean);

  return {
    path: relativePath,
    available: true,
    status: readback.status || 'unknown',
    recorded_at: readback.recorded_at || '',
    report_version: readback.report_version || '',
    command_count: commandCount,
    passed_command_count: passedCommandCount,
    commands: (readback.commands || []).map((command) => ({
      command: command.command || '',
      status: command.status || 'unknown',
      base_url: command.base_url || '',
      report_path: command.report_path || '',
      writes_report_file: command.writes_report_file === true,
    })),
    external_write_performed: readback.external_write_performed === true,
    production_data_mutation_performed: readback.production_data_mutation_performed === true,
    age_hours: ageHours === null ? null : Number(ageHours.toFixed(2)),
    max_age_hours: publicLaunchSmokeMaxAgeHours,
    fresh_for_launch_gate: fresh,
    ready,
    blocker: blockers.length ? blockers.join('; ') : '',
  };
}

function rabbiTelegramRuntimeProductionReady(rabbiTelegramRuntime = {}) {
  return rabbiTelegramRuntime.status === 'live_smoke_verified' || rabbiTelegramRuntime.production_verified === true;
}

function laneHasStaleOrMissingLocalLock(lane = {}) {
  return lane.local_lock_health && lane.local_lock_health !== 'fresh_running_lock';
}

function collisionLaneReason(lane = {}, label = 'collision lane') {
  if (laneHasStaleOrMissingLocalLock(lane)) {
    return `${label} is reported active in another agent job, but local lock health is ${lane.local_lock_health}; reconcile before touching overlapping work`;
  }
  return `${label} is already active in another agent job`;
}

function buildLaunchAssessment({ activeRun, blockers, fleet, chatgpt, proof, oneTimeSetup, rabbiTelegramRuntime, publicLaunchSmoke }) {
  const activeUiLane = fleet.active_policy_jobs.find((job) =>
    /app-wide BNA brand shell|million-dollar SaaS UI polish|One Time provider UI|route-role mapping|View-as navigation/i.test(job.title)
  );
  const activeFallbackLane = fleet.active_policy_jobs.find((job) => /fall back|fallback|API/i.test(job.title));
  const activeAgentReviewLane = fleet.active_policy_jobs.find((job) => /Agent Mode result|Agent Review|AGR-/i.test(job.title));
  const queuedDropoffs = Number(chatgpt?.queued_count || 0);
  const missingProofCount = Number(proof.remaining_blocker_count || 0);
  const hasExternalBlockers = blockers.length > 0 || Number(oneTimeSetup?.operator_blocker_count || 0) > 0;
  const publicLaunchSmokeBlocked = publicLaunchSmoke?.ready !== true;
  const rabbiTelegramRuntimeBlocked = rabbiTelegramRuntime?.status && !rabbiTelegramRuntimeProductionReady(rabbiTelegramRuntime);
  const noNextBatch = activeRun.work_remains === true && /none/i.test(activeRun.next_unblocked_executable_batch || '');
  const avoidCollidingWith = [];
  const seenCollisionKeys = new Set();
  for (const lane of [activeUiLane, activeFallbackLane, activeAgentReviewLane].filter(Boolean)) {
    const key = `${lane.job_id || ''}:${lane.task_id || ''}:${lane.title || ''}`;
    if (seenCollisionKeys.has(key)) continue;
    seenCollisionKeys.add(key);
    avoidCollidingWith.push(lane);
  }
  const reason = [
    hasExternalBlockers ? 'full OneTime launch has external Stripe/WAPI/campaign blockers' : '',
    publicLaunchSmokeBlocked ? `public launch no-write smoke is ${publicLaunchSmoke?.status || 'missing'}` : '',
    rabbiTelegramRuntimeBlocked ? `Rabbi Telegram runtime is ${rabbiTelegramRuntime.status}` : '',
    missingProofCount > 0 ? 'Rabbi Agent Review still needs terminal Agent Mode proof' : '',
    activeUiLane ? collisionLaneReason(activeUiLane, 'broad UI lane') : '',
    activeFallbackLane ? collisionLaneReason(activeFallbackLane, 'fallback/API lane') : '',
    activeAgentReviewLane ? collisionLaneReason(activeAgentReviewLane, 'Agent Review repair lane') : '',
    noNextBatch ? 'active execution run has no unblocked executable batch' : '',
  ].filter(Boolean);
  const productionReady = reason.length === 0;

  return {
    production_ready: productionReady,
    status: productionReady ? 'production_ready' : 'not_production_complete',
    reason,
    immediate_lead_capture_free_class_lane: 'live_verified_from_existing_register',
    safe_current_scope: 'read-only production-readiness reporting, blocker reconciliation, and non-overlapping proof automation',
    avoid_colliding_with: avoidCollidingWith,
    chatgpt_dropoff_queue_ready_count: queuedDropoffs,
    public_launch_smoke_ready: publicLaunchSmoke?.ready === true,
  };
}

function buildFreshness(git) {
  return {
    kind: 'sampled_control_tower_report',
    sampled_git_head: git.head || '',
    sampled_origin_master: git.origin_master || '',
    sampled_worktree_clean: git.clean === true,
    note:
      'This committed file is a sampled production-readiness report, not live telemetry. The commit that stores the report can have a newer hash than the sampled_git_head. Local agents should regenerate the snapshot before acting on launch-critical state.',
    refresh_command: 'npm run production:readiness:snapshot',
    json_refresh_command: 'npm run production:readiness:snapshot -- --json',
    no_write_json_command: 'node scripts/production-readiness-snapshot.mjs --no-write --json',
  };
}

function buildNextActions({ blockers, proof, fleet, rabbiTelegramRuntime }) {
  const actions = [];
  for (const blocker of blockers) {
    actions.push({
      owner: blocker.owner || 'Shloimie / provider account owners',
      action: blocker.next_action,
      source: blocker.requirement_id,
    });
  }
  for (const promptUrl of proof.next_agent_mode_prompts || []) {
    actions.push({
      owner: 'Shloimie / Agent Mode runner',
      action: `Run only this Agent Mode prompt scope and save terminal PASS/FAIL/BLOCKED proof through the Operations drop-off: ${promptUrl}`,
      source: 'rabbi_agent_review_proof',
    });
  }
  if (rabbiTelegramRuntime?.status && !rabbiTelegramRuntimeProductionReady(rabbiTelegramRuntime)) {
    actions.push({
      owner: 'Codex / operator',
      action: rabbiTelegramRuntime.next_action,
      source: 'rabbi_telegram_runtime',
    });
  } else if (rabbiTelegramRuntimeProductionReady(rabbiTelegramRuntime)) {
    actions.push({
      owner: 'Codex / operator',
      action: 'Rabbi Telegram runtime has hosted/live-smoke proof; keep future sends scoped and approval-gated.',
      source: 'rabbi_telegram_runtime',
    });
  }
  const uiLane = fleet.active_policy_jobs.find((job) => /app-wide BNA brand shell|million-dollar SaaS UI polish/i.test(job.title));
  if (uiLane) {
    const laneLabel = uiLane.raw.replace(/^- /, '');
    const lockNote = uiLane.local_lock_evidence ? ` Local lock evidence: ${uiLane.local_lock_evidence}.` : '';
    actions.push({
      owner: 'Codex / agent fleet',
      action: `Do not overlap broad UI file edits while ${laneLabel} remains active; inspect its result packet before starting the next UI batch.${lockNote}`,
      source: 'agent_fleet_active_policy',
    });
  }
  const agentReviewLane = fleet.active_policy_jobs.find((job) => /Agent Mode result|Agent Review|AGR-/i.test(job.title));
  if (agentReviewLane) {
    const laneLabel = agentReviewLane.raw.replace(/^- /, '');
    const lockNote = agentReviewLane.local_lock_evidence ? ` Local lock evidence: ${agentReviewLane.local_lock_evidence}.` : '';
    actions.push({
      owner: 'Codex / agent fleet',
      action: `Do not overlap Agent Review proof/result repair work while ${laneLabel} remains active; inspect its result packet before saving or reconciling Agent Review terminal proof.${lockNote}`,
      source: 'agent_fleet_active_policy',
    });
  }
  actions.push({
    owner: 'Codex',
    action: 'Regenerate this snapshot after any external setup value, Agent Mode proof, UI result packet, deploy, or live-smoke change.',
    source: 'production_readiness_snapshot',
  });
  return actions;
}

function jobKey(job = {}) {
  return `${job.job_id || ''}:${job.task_id || ''}:${job.ticket_id || ''}:${job.title || job.raw || ''}`;
}

function jobLabel(job = {}) {
  const label = (job.raw || `job #${job.job_id || 'unknown'} / task #${job.task_id || 'unknown'} [${job.status || 'unknown'}] ${job.title || ''}`)
    .replace(/^- /, '')
    .trim();
  return job.local_lock_evidence ? `${label} (${job.local_lock_evidence})` : label;
}

function renderMarkdown(report) {
  const collisionJobs = Array.isArray(report.assessment?.avoid_colliding_with)
    ? report.assessment.avoid_colliding_with
    : [];
  const collisionKeys = new Set(collisionJobs.map(jobKey));
  const otherPolicyJobs = (report.agent_fleet.active_policy_jobs || []).filter((job) => !collisionKeys.has(jobKey(job)));
  const lines = [
    `# Production Readiness Snapshot - ${report.generated_at}`,
    '',
    `Result: ${report.assessment.status}`,
    `Production ready: ${report.assessment.production_ready ? 'yes' : 'no'}`,
    `Safe current scope: ${report.assessment.safe_current_scope}`,
    '',
    '## Why Not Done Yet',
    ...(report.assessment.reason.length ? report.assessment.reason.map((item) => `- ${item}`) : ['- No open reason captured.']),
    '',
    '## Git',
    `- Branch: ${report.git.branch || 'unknown'}`,
    `- HEAD: ${report.git.head || 'unknown'}`,
    `- origin/master: ${report.git.origin_master || 'unknown'}`,
    `- Worktree clean when sampled: ${report.git.clean ? 'yes' : 'no'}`,
    '',
    '## Snapshot Freshness',
    `- Kind: ${report.freshness.kind}`,
    `- Sampled git head: ${report.freshness.sampled_git_head || 'unknown'}`,
    `- Sampled origin/master: ${report.freshness.sampled_origin_master || 'unknown'}`,
    `- Sampled worktree clean: ${report.freshness.sampled_worktree_clean ? 'yes' : 'no'}`,
    `- Refresh command: \`${report.freshness.refresh_command}\``,
    `- Note: ${report.freshness.note}`,
    '',
    '## Active Execution Run',
    `- Run: ${report.active_run.run_path || 'unknown'}`,
    `- Status counts: ${Object.entries(report.active_run.status_counts).map(([key, value]) => `${key} ${value}`).join(', ') || 'unknown'}`,
    `- Work remains: ${report.active_run.work_remains ? 'yes' : 'no'}`,
    `- Validation passed: ${report.active_run.validation_passed ? 'yes' : 'no'}`,
    `- Next unblocked executable batch: ${report.active_run.next_unblocked_executable_batch || 'unknown'}`,
    '',
    '## Remaining External Blockers',
    ...(report.active_run.blockers.length
      ? report.active_run.blockers.map((item) => `- ${item.requirement_id}: ${item.blocker} Owner: ${item.owner}. Next: ${item.next_action}`)
      : ['- None reported by `npm run bna:run:blockers`.']),
    '',
    '## OneTime Setup Buckets',
    `- Checklist: ${report.one_time_setup.path || 'unknown'}`,
    `- Available: ${report.one_time_setup.available ? 'yes' : 'no'}`,
    `- Current setup check: ${report.one_time_setup.setup_readiness?.ready_count ?? 'unknown'}/${report.one_time_setup.setup_readiness?.total_count ?? 'unknown'} ready (exit ${report.one_time_setup.setup_readiness?.command_exit_code ?? 'unknown'})`,
    report.one_time_setup.setup_readiness?.load_error ? `- Setup check warning: ${report.one_time_setup.setup_readiness.load_error}` : '',
    `- Setup ready count: ${report.one_time_setup.setup_ready_count || 'unknown'}`,
    `- Operator blocker count: ${report.one_time_setup.operator_blocker_count ?? 'unknown'}`,
    ...(report.one_time_setup.operator_blocker_items?.length
      ? report.one_time_setup.operator_blocker_items.map((item) =>
        `- ${item.id}: ${item.title} (${item.status}). Missing now: ${(item.current_missing_fields || []).join(', ') || 'none'}. Required: ${(item.required_fields || []).join(', ')}`
      )
      : ['- No setup checklist operator blockers reported.']),
    '',
    '## Public Launch No-Write Smoke',
    `- Path: ${report.public_launch_smoke.path || 'unknown'}`,
    `- Status: ${report.public_launch_smoke.status || 'unknown'}`,
    `- Ready: ${report.public_launch_smoke.ready ? 'yes' : 'no'}`,
    `- Fresh for launch gate: ${report.public_launch_smoke.fresh_for_launch_gate ? 'yes' : 'no'} (${report.public_launch_smoke.age_hours ?? 'unknown'}h old, max ${report.public_launch_smoke.max_age_hours ?? 'unknown'}h)`,
    `- Commands passed: ${report.public_launch_smoke.passed_command_count ?? 'unknown'}/${report.public_launch_smoke.command_count ?? 'unknown'}`,
    `- External write performed: ${report.public_launch_smoke.external_write_performed ? 'yes' : 'no'}`,
    `- Production data mutation performed: ${report.public_launch_smoke.production_data_mutation_performed ? 'yes' : 'no'}`,
    report.public_launch_smoke.blocker ? `- Blocker: ${report.public_launch_smoke.blocker}` : '- Blocker: none',
    '',
    '## Rabbi Telegram Runtime',
    `- Readiness report: ${report.rabbi_telegram_runtime.readiness_path || 'unknown'}`,
    `- Chat ID readback report: ${report.rabbi_telegram_runtime.chat_id_report_path || 'unknown'} (${report.rabbi_telegram_runtime.runtime_report_available ? 'available locally' : 'missing locally'})`,
    `- Status: ${report.rabbi_telegram_runtime.status || 'unknown'}`,
    `- Local ready: ${report.rabbi_telegram_runtime.local_ready ? 'yes' : 'no'}`,
    `- Token configured: ${report.rabbi_telegram_runtime.token_configured ? 'yes' : 'no'}`,
    `- Chat ID configured: ${report.rabbi_telegram_runtime.chat_id_configured ? 'yes' : 'no'}`,
    `- Ops credentials configured: ${report.rabbi_telegram_runtime.ops_username_configured && report.rabbi_telegram_runtime.ops_password_configured ? 'yes' : 'no'}`,
    `- Candidate count: ${report.rabbi_telegram_runtime.candidate_count ?? 'unknown'}`,
    `- Unique masked chat count: ${report.rabbi_telegram_runtime.unique_chat_count ?? 'unknown'}`,
    ...(report.rabbi_telegram_runtime.masked_candidates?.length
      ? report.rabbi_telegram_runtime.masked_candidates.map((candidate) =>
        `- Candidate: ${candidate.chat_id_masked} (${candidate.chat_type || 'unknown'}, ${candidate.text_kind || 'unknown'}, ${candidate.message_date || 'no date'})`
      )
      : ['- No masked chat candidates reported.']),
    `- Live delivery smoke: ${report.rabbi_telegram_runtime.live_delivery_smoke || 'unknown'}`,
    `- Next: ${report.rabbi_telegram_runtime.next_action || 'unknown'}`,
    '',
    '## Agent Fleet',
    `- Supervisor: ${report.agent_fleet.summary.supervisor || 'unknown'}`,
    `- Claimable observable jobs: ${report.agent_fleet.summary.claimable_observable_jobs || 'unknown'}`,
    `- Ready to claim: ${report.agent_fleet.summary.ready_to_claim || 'unknown'}`,
    `- Queue health: ${report.agent_fleet.summary.queue_health || 'unknown'}`,
    `- Kimi fallback: ${report.agent_fleet.summary.kimi_coding_fallback || report.agent_fleet_readiness.kimi_fallback_readiness?.configured_model || 'unknown'}`,
    `- Auto-deploy readiness preflight: ${report.agent_fleet_readiness.production_deploy_preflight?.enforced_before_auto_deploy ? 'enforced' : 'not proven'}`,
    `- Auto-deploy preflight command: ${report.agent_fleet_readiness.production_deploy_preflight?.command || 'unknown'}`,
    `- Auto-deploy blocked reason: ${report.agent_fleet_readiness.production_deploy_preflight?.skipped_reason_when_blocked || 'unknown'}`,
    `- Auto-deploy performed by readiness proof: ${report.agent_fleet_readiness.production_deploy_preflight?.deploy_performed ? 'yes' : 'no'}`,
    '',
    '## Launch Collision Lanes',
    ...(collisionJobs.length
      ? collisionJobs.map((job) => `- ${jobLabel(job)}`)
      : ['- No running launch collision lanes reported.']),
    '',
    '## Other Agent Policy Rows',
    ...(otherPolicyJobs.length
      ? otherPolicyJobs.map((job) => `- ${jobLabel(job)}`)
      : ['- No queued, failed, or non-collision policy rows reported.']),
    '',
    '## ChatGPT Dropoff',
    `- Packet count: ${report.chatgpt_dropoff.packet_count ?? 'unknown'}`,
    `- Queued for Codex pickup: ${report.chatgpt_dropoff.queued_count ?? 'unknown'}`,
    ...(Array.isArray(report.chatgpt_dropoff.results)
      ? report.chatgpt_dropoff.results.map((item) => `- ${item.packet_id}: ${item.status}${item.queued ? ' queued' : ''}`)
      : []),
    '',
    '## Rabbi Agent Review Proof',
    `- Latest proof file: ${report.rabbi_agent_review.path}`,
    `- Status: ${report.rabbi_agent_review.status}`,
    `- Remaining blocker count: ${report.rabbi_agent_review.remaining_blocker_count ?? 'unknown'}`,
    ...(report.rabbi_agent_review.prompt_states || []).map((item) =>
      `- ${item.prompt_key}: ${item.terminal_saved_proof ? 'terminal proof saved' : 'terminal proof missing'} (${item.public_url || 'no public URL'}${item.dropoff_url ? `; dropoff ${item.dropoff_url}` : ''})`
    ),
    '',
    '## Next Actions',
    ...report.next_actions.map((item, index) => `${index + 1}. ${item.owner}: ${item.action}`),
    '',
    '## Evidence',
    ...report.evidence.map((item) => `- ${item}`),
    '',
    '## Guardrails',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
  ];
  return `${lines.join('\n')}`;
}

function main() {
  const generatedAt = nowIso();
  const git = buildGitSnapshot();
  const runNextCommand = runNpm('bna:run:next');
  const runBlockersCommand = runNpm('bna:run:blockers');
  const fleetCommand = runNpm('agent:fleet:status');
  const chatgptCommand = runNpm('chatgpt:dropoff:scan');
  const oneTimeSetupCheckCommand = runCommand('npm run one-time:setup:check', nodeBin, oneTimeSetupCheckCommandArgs);
  const activeRun = {
    ...parseActiveRun(runNextCommand.stdout),
    blockers: parseRunBlockers(runBlockersCommand.stdout),
  };
  const agentFleet = enrichFleetStatusWithTaskLocks(parseFleetStatus(fleetCommand.stdout), new Date(generatedAt));
  const chatgptDropoff = parseJsonFromOutput(chatgptCommand.stdout) || {
    packet_count: null,
    queued_count: null,
    results: [],
    parse_error: 'Could not parse ChatGPT dropoff scan JSON.',
  };
  const rabbiAgentReview = summarizeProofState();
  const agentFleetReadiness = summarizeAgentFleetReadiness();
  const oneTimeSetup = summarizeOneTimeSetupChecklist(oneTimeSetupCheckCommand);
  const publicLaunchSmoke = summarizePublicLaunchSmokeReadback();
  const rabbiTelegramRuntime = summarizeRabbiTelegramRuntime();
  const assessment = buildLaunchAssessment({
    activeRun,
    blockers: activeRun.blockers,
    fleet: agentFleet,
    chatgpt: chatgptDropoff,
    proof: rabbiAgentReview,
    oneTimeSetup,
    rabbiTelegramRuntime,
    publicLaunchSmoke,
  });

  const report = {
    generated_at: generatedAt,
    report_version: 'bna-production-readiness-snapshot-v1',
    assessment,
    git,
    freshness: buildFreshness(git),
    active_run: activeRun,
    agent_fleet: agentFleet,
    agent_fleet_readiness: agentFleetReadiness,
    one_time_setup: oneTimeSetup,
    public_launch_smoke: publicLaunchSmoke,
    rabbi_telegram_runtime: rabbiTelegramRuntime,
    chatgpt_dropoff: chatgptDropoff,
    rabbi_agent_review: rabbiAgentReview,
    commands: {
      bna_run_next: runNextCommand,
      bna_run_blockers: runBlockersCommand,
      agent_fleet_status: fleetCommand,
      chatgpt_dropoff_scan: chatgptCommand,
      one_time_setup_check: oneTimeSetupCheckCommand,
    },
    evidence: [
      'tasks-pending/2026-07-09-production-readiness-goal.md',
      'ops/production-readiness/latest-production-readiness-snapshot.md',
      'ops/production-readiness/latest-production-readiness-snapshot.json',
      rabbiAgentReview.path,
      rabbiTelegramRuntime.readiness_path,
      rabbiTelegramRuntime.runtime_report_available ? rabbiTelegramRuntime.chat_id_report_path : '',
      agentFleetReadiness.path,
      oneTimeSetup.path,
      publicLaunchSmoke.path,
      'ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md',
    ].filter(Boolean),
    guardrails: [
      'Read-only snapshot only.',
      'No deploy, merge, release, Railway mutation, external send, payment, access grant, CRM write, provider write, DNS change, credential change, Agent Review result save, or production-data mutation is performed.',
      'Generated command output is redacted for obvious token/email patterns before being written.',
    ],
  };
  report.next_actions = buildNextActions({
    blockers: activeRun.blockers,
    proof: rabbiAgentReview,
    fleet: agentFleet,
    rabbiTelegramRuntime,
  });

  if (shouldWrite) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(latestMdPath, renderMarkdown(report));
  }

  if (shouldPrintJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Production readiness snapshot: ${report.assessment.status}`);
    if (shouldWrite) {
      console.log(`Wrote ${relative(latestMdPath)}`);
      console.log(`Wrote ${relative(latestJsonPath)}`);
    }
    console.log(`Next unblocked executable batch: ${activeRun.next_unblocked_executable_batch || 'unknown'}`);
    console.log(`External blockers: ${activeRun.blockers.length}`);
    console.log(`External setup buckets: ${oneTimeSetup.operator_blocker_count ?? 'unknown'}`);
    console.log(`ChatGPT queued packets: ${chatgptDropoff.queued_count ?? 'unknown'}`);
  }
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  main();
}
