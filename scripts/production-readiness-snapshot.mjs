#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(repoRoot, 'ops', 'production-readiness');
const latestJsonPath = path.join(outputDir, 'latest-production-readiness-snapshot.json');
const latestMdPath = path.join(outputDir, 'latest-production-readiness-snapshot.md');
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

function parseFleetStatus(output = '') {
  const summary = {};
  const active_policy_jobs = [];
  let inActivePolicySection = false;
  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    const keyValue = trimmed.match(/^- ([^:]+):\s*(.+)$/);
    if (keyValue) {
      const key = keyValue[1].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      summary[key] = keyValue[2].trim();
    }
    if (/^Observable jobs not claimable by active-task policy:/i.test(trimmed)) {
      inActivePolicySection = true;
      continue;
    }
    if (!inActivePolicySection || !trimmed.startsWith('- job #')) continue;
    active_policy_jobs.push({
      job_id: trimmed.match(/job #(\d+)/)?.[1] || '',
      task_id: trimmed.match(/task #(\d+)/)?.[1] || '',
      ticket_id: trimmed.match(/ticket #(\d+)/)?.[1] || '',
      status: trimmed.match(/\[([^\]]+)\]/)?.[1] || '',
      title: trimmed.replace(/^- job #[^\]]+\]\s*/, '').trim(),
      raw: trimmed,
    });
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
  };
}

function buildLaunchAssessment({ activeRun, blockers, fleet, chatgpt, proof }) {
  const activeUiLane = fleet.active_policy_jobs.find((job) =>
    /app-wide BNA brand shell|million-dollar SaaS UI polish|One Time provider UI|route-role mapping|View-as navigation/i.test(job.title)
  );
  const activeFallbackLane = fleet.active_policy_jobs.find((job) => /fall back|fallback|API/i.test(job.title));
  const queuedDropoffs = Number(chatgpt?.queued_count || 0);
  const missingProofCount = Number(proof.remaining_blocker_count || 0);
  const hasExternalBlockers = blockers.length > 0;
  const noNextBatch = activeRun.work_remains === true && /none/i.test(activeRun.next_unblocked_executable_batch || '');
  const reason = [
    hasExternalBlockers ? 'full OneTime launch has external Stripe/WAPI/campaign blockers' : '',
    missingProofCount > 0 ? 'Rabbi Agent Review still needs terminal Agent Mode proof' : '',
    activeUiLane ? 'broad UI lane is already active in another agent job' : '',
    activeFallbackLane ? 'fallback/API lane is already active in another agent job' : '',
    noNextBatch ? 'active execution run has no unblocked executable batch' : '',
  ].filter(Boolean);
  const productionReady = reason.length === 0;

  return {
    production_ready: productionReady,
    status: productionReady ? 'production_ready' : 'not_production_complete',
    reason,
    immediate_lead_capture_free_class_lane: 'live_verified_from_existing_register',
    safe_current_scope: 'read-only production-readiness reporting, blocker reconciliation, and non-overlapping proof automation',
    avoid_colliding_with: [activeUiLane, activeFallbackLane].filter(Boolean),
    chatgpt_dropoff_queue_ready_count: queuedDropoffs,
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

function buildNextActions({ blockers, proof, fleet }) {
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
  const uiLane = fleet.active_policy_jobs.find((job) => /app-wide BNA brand shell|million-dollar SaaS UI polish/i.test(job.title));
  if (uiLane) {
    const laneLabel = uiLane.raw.replace(/^- /, '');
    actions.push({
      owner: 'Codex / agent fleet',
      action: `Do not overlap broad UI file edits while ${laneLabel} remains active; inspect its result packet before starting the next UI batch.`,
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

function renderMarkdown(report) {
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
    '## Agent Fleet',
    `- Supervisor: ${report.agent_fleet.summary.supervisor || 'unknown'}`,
    `- Claimable observable jobs: ${report.agent_fleet.summary.claimable_observable_jobs || 'unknown'}`,
    `- Ready to claim: ${report.agent_fleet.summary.ready_to_claim || 'unknown'}`,
    `- Queue health: ${report.agent_fleet.summary.queue_health || 'unknown'}`,
    `- Kimi fallback: ${report.agent_fleet.summary.kimi_coding_fallback || report.agent_fleet_readiness.kimi_fallback_readiness?.configured_model || 'unknown'}`,
    '',
    '## Active / Do Not Collide',
    ...(report.agent_fleet.active_policy_jobs.length
      ? report.agent_fleet.active_policy_jobs.map((job) => `- ${job.raw.replace(/^- /, '')}`)
      : ['- No active-policy collision rows reported.']),
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
      `- ${item.prompt_key}: ${item.terminal_saved_proof ? 'terminal proof saved' : 'terminal proof missing'} (${item.public_url || 'no public URL'})`
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
  const activeRun = {
    ...parseActiveRun(runNextCommand.stdout),
    blockers: parseRunBlockers(runBlockersCommand.stdout),
  };
  const agentFleet = parseFleetStatus(fleetCommand.stdout);
  const chatgptDropoff = parseJsonFromOutput(chatgptCommand.stdout) || {
    packet_count: null,
    queued_count: null,
    results: [],
    parse_error: 'Could not parse ChatGPT dropoff scan JSON.',
  };
  const rabbiAgentReview = summarizeProofState();
  const agentFleetReadiness = summarizeAgentFleetReadiness();
  const assessment = buildLaunchAssessment({
    activeRun,
    blockers: activeRun.blockers,
    fleet: agentFleet,
    chatgpt: chatgptDropoff,
    proof: rabbiAgentReview,
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
    chatgpt_dropoff: chatgptDropoff,
    rabbi_agent_review: rabbiAgentReview,
    commands: {
      bna_run_next: runNextCommand,
      bna_run_blockers: runBlockersCommand,
      agent_fleet_status: fleetCommand,
      chatgpt_dropoff_scan: chatgptCommand,
    },
    evidence: [
      'tasks-pending/2026-07-09-production-readiness-goal.md',
      'ops/production-readiness/latest-production-readiness-snapshot.md',
      'ops/production-readiness/latest-production-readiness-snapshot.json',
      rabbiAgentReview.path,
      agentFleetReadiness.path,
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
    console.log(`ChatGPT queued packets: ${chatgptDropoff.queued_count ?? 'unknown'}`);
  }
}

main();
