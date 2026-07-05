#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import hardening from '../src/lib/bna/agent-fleet-hardening.js';
import resultPacket from '../src/lib/bna/agent-result-packet.js';
import actionRunner from '../src/lib/actions/runner.js';
import { buildGitHubIntakePreview, buildGitHubStatusPreview } from './intake-github.mjs';

const {
  AGENT_FLEET_PERMISSION_TIERS,
  buildParentCoordinationAudit,
  buildStartupShortcutMatrix,
  classifyAgentFleetCommand,
  permissionTierLines,
  stableSyntheticId,
} = hardening;
const { buildAgentResultPacket, artifactLinksFromAgentResultPacket, githubLinksFromAgentResultPacket } = resultPacket;
const { runAction } = actionRunner;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const evidenceDir = path.join(repoRoot, 'ops', 'agent-fleet-hardening');
const defaultRunRelativePath = 'ops/execution-runs/2026-06-24-issue-20-parent-run';
const defaultAgentFleetRequirementId = 'REQ-20260624-045';

function nowIso() {
  return new Date().toISOString();
}

function slugStamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function readJson(relativePath, fallback = {}) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function gitValue(args = []) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

function gitOptionalValue(args = []) {
  try {
    return {
      value: execFileSync('git', args, {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim(),
      missing: false,
      error: '',
    };
  } catch (error) {
    const message = String(error?.stderr || error?.message || '');
    return {
      value: '',
      missing: /@\{u\}|upstream|unknown revision/i.test(message),
      error: message,
    };
  }
}

function normalizeRelativePath(value = '') {
  return String(value || '').replace(/\\/g, '/').replace(/^\.?\//, '').replace(/\/+$/, '');
}

function relativePathExists(relativePath = '') {
  return Boolean(relativePath) && fs.existsSync(path.join(repoRoot, relativePath));
}

function resolveActiveRunRelativePath(latest = {}) {
  const activeRunPath = normalizeRelativePath(latest.path);
  if (
    activeRunPath
    && relativePathExists(path.join(activeRunPath, 'run.json'))
    && relativePathExists(path.join(activeRunPath, 'requirements.json'))
  ) {
    return activeRunPath;
  }
  return defaultRunRelativePath;
}

function findAgentFleetRequirementIds(requirements = {}) {
  const reqs = Array.isArray(requirements.requirements) ? requirements.requirements : [];
  return reqs
    .filter((item) => {
      const haystack = [
        item.id,
        item.title,
        item.category,
        item.expected_result,
        item.implementation_status,
      ].map((part) => String(part || '')).join(' ');
      return /agent[_ -]?fleet|background agent|fleet status/i.test(haystack);
    })
    .map((item) => item.id)
    .filter(Boolean);
}

function laneStatusFromRequirements(requirements = {}, requirementIds = []) {
  const reqs = Array.isArray(requirements.requirements) ? requirements.requirements : [];
  const statuses = reqs
    .filter((item) => requirementIds.includes(item.id))
    .map((item) => String(item.status || '').toLowerCase())
    .filter(Boolean);
  if (!statuses.length) return 'queued';
  if (statuses.every((status) => status === 'done' || status === 'already_satisfied')) return 'done';
  if (statuses.some((status) => status === 'blocked' || status === 'needs_operator_decision')) return 'blocked';
  if (statuses.some((status) => status === 'in_progress' || status === 'running')) return 'running';
  if (statuses.some((status) => status === 'failed')) return 'failed';
  return 'queued';
}

function synthesizeLaneManifest({ runRelativePath, run = {}, requirements = {} }) {
  const agentFleetRequirementIds = findAgentFleetRequirementIds(requirements);
  return {
    run_id: run.run_id || path.basename(runRelativePath),
    updated_at: nowIso(),
    parent_run_path: runRelativePath,
    active_pointer_owner: 'parent',
    generated_from: 'active_run_requirements_without_lane_manifest',
    lanes: agentFleetRequirementIds.length
      ? [{
          lane_id: 'agent-fleet',
          requirement_ids: agentFleetRequirementIds,
          status: laneStatusFromRequirements(requirements, agentFleetRequirementIds),
        }]
      : [],
  };
}

function readRunBundle(runRelativePath) {
  const run = readJson(path.join(runRelativePath, 'run.json'));
  const requirements = readJson(path.join(runRelativePath, 'requirements.json'));
  const laneManifest = readJson(path.join(runRelativePath, 'LANE-MANIFEST.json'), null)
    || synthesizeLaneManifest({ runRelativePath, run, requirements });
  const agentFleetRequirementIds = findAgentFleetRequirementIds(requirements);
  return {
    run,
    requirements,
    laneManifest,
    agentFleetRequirementId: agentFleetRequirementIds[0] || defaultAgentFleetRequirementId,
    finalRequirementId: agentFleetRequirementIds[0]?.startsWith('REQ-20260702')
      ? null
      : 'REQ-20260624-048',
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = { write: true, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--no-write') args.write = false;
    else if (arg === '--write') args.write = true;
    else if (arg === '--json') args.json = true;
  }
  return args;
}

async function buildSyntheticProof(reportPath = '', context = {}) {
  const repo = 'shloimie-beep/bnei-neviim-academy';
  const commentId = '999045';
  const agentRunId = context.runId || '2026-06-24-issue-20-parent-run';
  const requirementId = context.requirementId || defaultAgentFleetRequirementId;
  const rawId = context.rawId || 'RAW-20260624-009';
  const issue = {
    number: 20,
    title: 'Synthetic Issue #20 Batch E agent-fleet proof',
    body: [
      'BNA_GOAL_MODE_EXECUTION_PACKET',
      'Synthetic local-only Batch E proof for agent fleet readiness.',
      'No production mutation or GitHub write is authorized.',
    ].join('\n'),
    html_url: `https://github.com/${repo}/issues/20`,
    user: { login: 'shloimie-beep' },
  };
  const comments = [
    {
      id: Number(commentId),
      body: 'Synthetic trusted comment: claim one background agent job, record result, and post status preview without external writes.',
      html_url: `https://github.com/${repo}/issues/20#issuecomment-${commentId}`,
      user: { login: 'shloimie-beep' },
      created_at: '2026-06-25T00:10:00Z',
    },
  ];
  const intakePreview = buildGitHubIntakePreview({ repo, issue, comments, commentId });
  const syntheticId = stableSyntheticId([repo, issue.number, commentId, requirementId]);
  const packet = buildAgentResultPacket({
    source_raw_id: rawId,
    task_id: 45045,
    agent_job_id: 77045,
    requirement_id: requirementId,
    agent_run_id: agentRunId,
    branch: gitValue(['branch', '--show-current']) || 'codex/issue-20-parent-run-20260624',
    worktree: repoRoot,
    commit: gitValue(['rev-parse', '--short=12', 'HEAD']),
    pull_request: 'pending',
    status: 'blocked_live_pending',
    summary: 'Synthetic no-write agent fleet proof completed locally.',
    tests: ['synthetic no-write proof'],
    deployment: { required: false, status: 'not_required_for_synthetic_proof' },
    evidence: [reportPath || 'ops/agent-fleet-hardening/synthetic-readiness.md'],
    blockers: ['Deploy/live proof remains under REQ-20260624-048.'],
    github: {
      issue_url: issue.html_url,
      comment_url: comments[0].html_url,
    },
    machine_payload: {
      synthetic: true,
      synthetic_id: syntheticId,
      external_write_performed: false,
    },
    idempotency_key: `agent-result:synthetic:${syntheticId}`,
  });
  const resultAction = await runAction({
    action_id: 'record_agent_result',
    dry_run: true,
    source: 'agent_fleet_synthetic_proof',
    role: 'technical_agent',
    workspace_id: 'bna',
    inputs: packet,
  });
  const githubStatus = buildGitHubStatusPreview({
    repo,
    issue,
    comments: [],
    commentId,
    status: {
      status: 'blocked_live_pending',
      summary: 'Synthetic local proof: background claim, result API preview, Operations activity preview, and same-thread GitHub status preview completed without external writes.',
      raw_id: rawId,
      requirement_id: requirementId,
      run_id: agentRunId,
      branch: packet.branch,
      commit: packet.commit,
      pull_request: 'pending',
      evidence: [reportPath || 'ops/agent-fleet-hardening/synthetic-readiness.md'],
    },
  });
  return {
    synthetic_id: syntheticId,
    external_write_performed: false,
    stages: {
      github_intake_preview: {
        trusted_source: intakePreview.trusted_source,
        idempotency_key: intakePreview.source_envelope.idempotency_key,
        target_url: intakePreview.source_envelope.source_url,
      },
      claim_preview: {
        agent_job_id: packet.agent_job_id,
        task_id: packet.task_id,
        claim_status: 'would_claim_without_production_mutation',
      },
      worktree_preview: {
        worktree: packet.worktree,
        branch: packet.branch,
        commit: packet.commit,
      },
      result_api_preview: {
        success: resultAction.success,
        executed: resultAction.executed,
        dry_run: resultAction.dry_run,
        idempotency_key: resultAction.preview?.idempotency_key,
        external_write_performed: resultAction.preview?.external_write_performed,
      },
      operations_activity_preview: {
        evidence_links: artifactLinksFromAgentResultPacket(packet),
        github_links: githubLinksFromAgentResultPacket(packet),
        would_render_activity_links: true,
      },
      github_status_preview: {
        idempotency_key: githubStatus.idempotency_key,
        target_url: githubStatus.target_url,
        would_create_comment: githubStatus.would_create_comment,
        would_update_comment: githubStatus.would_update_comment,
        external_write_performed: githubStatus.external_write_performed,
      },
      parent_closeout_preview: {
        requirement_id: requirementId,
        terminal_status_if_real: 'done_or_blocked_after_validation',
        parent_run_not_marked_complete: true,
      },
    },
  };
}

async function buildReport() {
  const latest = readJson('ops/execution-runs/latest.json');
  const activeRunPath = resolveActiveRunRelativePath(latest);
  const { run, laneManifest, requirements, agentFleetRequirementId, finalRequirementId } = readRunBundle(activeRunPath);
  const upstream = gitOptionalValue(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const git = {
    branch: gitValue(['branch', '--show-current']),
    head: gitValue(['rev-parse', '--short=12', 'HEAD']),
    upstream: upstream.value,
    upstream_missing: upstream.missing,
  };
  const parentAudit = buildParentCoordinationAudit({
    latest,
    run,
    laneManifest,
    requirements,
    git,
    expectedAgentFleetRequirementId: agentFleetRequirementId,
    finalRequirementId,
  });
  const shortcutMatrix = buildStartupShortcutMatrix({ repoRoot, script: 'scripts/start-agent-fleet.ps1', watchdogScript: 'scripts/start-watchdog.ps1' });
  const permissionChecks = [
    'npm test',
    'git commit -m "checkpoint"',
    'npm run railway:doctor',
    'APPLY_GUARDED_CLASS_BACKFILL=true npm run class:backfill',
    'node scripts/send-parent-update.mjs --send',
  ].map((command) => ({ command, ...classifyAgentFleetCommand(command) }));
  const syntheticProof = await buildSyntheticProof('ops/agent-fleet-hardening/latest-agent-fleet-readiness.md', {
    runId: run.run_id,
    requirementId: agentFleetRequirementId,
    rawId: run.raw_id,
  });
  return {
    generated_at: nowIso(),
    active_run_path: activeRunPath,
    requirement_id: agentFleetRequirementId,
    report_version: 'bna-agent-fleet-readiness-v1',
    ok: parentAudit.ok && syntheticProof.external_write_performed === false,
    permission_tiers: AGENT_FLEET_PERMISSION_TIERS,
    permission_lines: permissionTierLines(),
    permission_checks: permissionChecks,
    startup_shortcuts: shortcutMatrix,
    parent_coordination_audit: parentAudit,
    synthetic_proof: syntheticProof,
    guardrails: [
      'No second agent fleet created.',
      'No production mutation.',
      'No deploy/live smoke.',
      'No GitHub status comment posted.',
      'No send, charge, DNS, credential, Drive write, account-permission, public-publish, or class-backfill action.',
    ],
  };
}

function renderMarkdown(report) {
  return [
    '# Agent Fleet Readiness',
    '',
    `Generated: ${report.generated_at}`,
    `Requirement: ${report.requirement_id}`,
    `Overall OK: ${report.ok}`,
    '',
    '## Permission Tiers',
    '',
    ...report.permission_lines,
    '',
    '## Permission Command Checks',
    '',
    '| Command | Tier | Blocked by default | Reason |',
    '|---|---:|---|---|',
    ...report.permission_checks.map((item) => `| \`${item.command.replace(/\|/g, '\\|')}\` | ${item.tier} | ${item.blocked_by_default ? 'yes' : 'no'} | ${item.reason} |`),
    '',
    '## Startup Shortcuts',
    '',
    '| Action | Command | Expected behavior |',
    '|---|---|---|',
    ...report.startup_shortcuts.map((item) => `| ${item.action} | \`${item.command.replace(/\|/g, '\\|')}\` | ${item.expected} |`),
    '',
    '## Parent Coordination Audit',
    '',
    `- OK: ${report.parent_coordination_audit.ok}`,
    `- Findings: ${report.parent_coordination_audit.finding_count}`,
    `- Requirements: ${report.parent_coordination_audit.counts.requirements}`,
    `- Hidden agent tasks: ${report.parent_coordination_audit.counts.tasks}`,
    `- Lanes: ${report.parent_coordination_audit.counts.lanes}`,
    ...(report.parent_coordination_audit.findings.length
      ? report.parent_coordination_audit.findings.map((finding) => `- ${finding.severity}: ${finding.type} - ${finding.message}`)
      : ['- No critical coordination findings.']),
    '',
    '## Synthetic Background Proof',
    '',
    `- Synthetic ID: ${report.synthetic_proof.synthetic_id}`,
    `- External write performed: ${report.synthetic_proof.external_write_performed}`,
    `- GitHub intake idempotency: ${report.synthetic_proof.stages.github_intake_preview.idempotency_key}`,
    `- Result API dry-run success: ${report.synthetic_proof.stages.result_api_preview.success}`,
    `- Operations activity links would render: ${report.synthetic_proof.stages.operations_activity_preview.would_render_activity_links}`,
    `- GitHub status would create comment: ${report.synthetic_proof.stages.github_status_preview.would_create_comment}`,
    `- GitHub status external write performed: ${report.synthetic_proof.stages.github_status_preview.external_write_performed}`,
    `- Parent run not marked complete: ${report.synthetic_proof.stages.parent_closeout_preview.parent_run_not_marked_complete}`,
    '',
    '## Guardrails',
    '',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
  ].join('\n');
}

async function main() {
  const args = parseArgs();
  const report = await buildReport();
  let paths = null;
  if (args.write) {
    fs.mkdirSync(evidenceDir, { recursive: true });
    const base = `${slugStamp()}-agent-fleet-readiness`;
    const jsonPath = path.join(evidenceDir, `${base}.json`);
    const mdPath = path.join(evidenceDir, `${base}.md`);
    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(mdPath, renderMarkdown(report));
    const latestMd = path.join(evidenceDir, 'latest-agent-fleet-readiness.md');
    const latestJson = path.join(evidenceDir, 'latest-agent-fleet-readiness.json');
    fs.writeFileSync(latestMd, renderMarkdown(report));
    fs.writeFileSync(latestJson, `${JSON.stringify(report, null, 2)}\n`);
    paths = {
      md: relative(mdPath),
      json: relative(jsonPath),
      latest_md: relative(latestMd),
      latest_json: relative(latestJson),
    };
  }
  if (args.json) console.log(JSON.stringify({ ...report, report_paths: paths }, null, 2));
  else {
    console.log(renderMarkdown(report));
    if (paths) console.log(`Report written: ${paths.md}, ${paths.json}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
