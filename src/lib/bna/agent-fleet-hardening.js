const crypto = require('node:crypto');

const AGENT_FLEET_PERMISSION_TIERS = {
  tier_0: {
    id: 0,
    label: 'Tier 0',
    name: 'read_audit_test_report',
    summary: 'Read-only audit, local status, local tests, dry-run previews, reports, and evidence capture.',
    automatic: true,
  },
  tier_1: {
    id: 1,
    label: 'Tier 1',
    name: 'local_code_and_draft_pr',
    summary: 'Local code edits, local tests, isolated worktrees/branches, commits, pushes, and draft PR preparation after lane ownership is declared.',
    automatic: true,
  },
  tier_2: {
    id: 2,
    label: 'Tier 2',
    name: 'release_deploy_live_smoke',
    summary: 'Merge, deploy, Railway doctor, and live-smoke release work only after parent release gates authorize it.',
    automatic: false,
    requires_parent_gate: true,
  },
  tier_3: {
    id: 3,
    label: 'Tier 3',
    name: 'external_or_production_mutation',
    summary: 'Sends, charges, refunds, DNS, public publishing, account permission changes, credential changes, production data mutation, Drive writes, and class backfill.',
    automatic: false,
    requires_explicit_decision: true,
    blocked_by_default: true,
  },
};

const SECRET_PATTERNS = [
  /\b(sk|rk|gh[pousr]|xox[baprs]|whsec|re)_[A-Za-z0-9._-]{12,}\b/g,
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/g,
  /\brailway_[A-Za-z0-9_-]{20,}\b/gi,
  /Bearer\s+[A-Za-z0-9._-]+/gi,
  /(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s"',}]+/gi,
];

const TIER_3_COMMAND_PATTERNS = [
  /\bAPPLY_GUARDED_CLASS_BACKFILL\b/i,
  /\b(send|publish|charge|refund|grant[-_ ]?access|dns|rotate[-_ ]?key|copy[-_ ]?credential)\b/i,
  /\b(buffer|resend|stripe|vimeo|zoom|godaddy|drive)\b.*\b(send|publish|upload|move|write|charge|refund|grant|delete|create)\b/i,
  /\b(git|railway|psql|node|npm)\b.*\b(production[-_ ]?mutation|prod[-_ ]?write|live[-_ ]?write)\b/i,
];

const TIER_2_COMMAND_PATTERNS = [
  /\b(gh\s+pr\s+merge|git\s+merge|railway\s+(up|deploy)|railway:redeploy|app:smoke|live[-_ ]?smoke|railway:doctor)\b/i,
  /\bdeploy\b/i,
];

const TIER_1_COMMAND_PATTERNS = [
  /\b(git\s+(commit|push|add)|apply_patch|npm\s+run\s+bna:run:init)\b/i,
  /\b(local|worktree|branch|draft[-_ ]?pr)\b/i,
];

function redactAgentFleetText(value = '') {
  let text = String(value || '');
  for (const pattern of SECRET_PATTERNS) {
    text = text.replace(pattern, (match, key = '') => {
      if (/^Bearer/i.test(match)) return 'Bearer [redacted]';
      if (key && /api|token|secret|password|authorization/i.test(key)) return `${key}=[redacted]`;
      return '[redacted-secret]';
    });
  }
  return text;
}

function compact(value = '', max = 180) {
  return redactAgentFleetText(value).replace(/\s+/g, ' ').trim().slice(0, max);
}

function classifyAgentFleetCommand(command = '') {
  const text = String(command || '').trim();
  if (!text) {
    return {
      tier: 0,
      tier_key: 'tier_0',
      allowed_without_decision: true,
      blocked_by_default: false,
      reason: 'empty command is treated as no-op read/report context',
    };
  }
  if (TIER_3_COMMAND_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      tier: 3,
      tier_key: 'tier_3',
      allowed_without_decision: false,
      blocked_by_default: true,
      reason: 'matches external write, production mutation, credential/account, send, charge, publish, Drive write, or class backfill guard',
    };
  }
  if (TIER_2_COMMAND_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      tier: 2,
      tier_key: 'tier_2',
      allowed_without_decision: false,
      blocked_by_default: false,
      requires_parent_gate: true,
      reason: 'release/deploy/live-smoke command requires parent release gate',
    };
  }
  if (TIER_1_COMMAND_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      tier: 1,
      tier_key: 'tier_1',
      allowed_without_decision: true,
      blocked_by_default: false,
      reason: 'local implementation or draft-PR command',
    };
  }
  return {
    tier: 0,
    tier_key: 'tier_0',
    allowed_without_decision: true,
    blocked_by_default: false,
    reason: 'read/audit/test/report command',
  };
}

function permissionTierLines() {
  return Object.values(AGENT_FLEET_PERMISSION_TIERS)
    .sort((a, b) => a.id - b.id)
    .map((tier) => `- ${tier.label}: ${tier.summary}`);
}

function buildStartupShortcutMatrix({
  repoRoot = '',
  script = 'scripts/start-agent-fleet.ps1',
  watchdogScript = 'scripts/start-watchdog.ps1',
} = {}) {
  const prefix = repoRoot ? `cd ${repoRoot} ; ` : '';
  return [
    { action: 'start', command: `${prefix}npm run agent:fleet:start`, expected: 'starts hidden watcher under the current Windows login with bounded retries' },
    { action: 'stop', command: `${prefix}powershell -ExecutionPolicy Bypass -File ${script} -Stop`, expected: 'stops only the PID recorded in the agent-fleet lock' },
    { action: 'restart', command: `${prefix}npm run agent:fleet:restart`, expected: 'stops the recorded PID, clears stale lock, and starts with bounded retries' },
    { action: 'status', command: `${prefix}npm run agent:fleet:status`, expected: 'reads local lock plus API queue/status when credentials are available' },
    { action: 'open_log', command: `${prefix}powershell -ExecutionPolicy Bypass -File ${script} -OpenLog`, expected: 'opens local output/error logs without printing secrets into chat' },
    { action: 'watchdog_start', command: `${prefix}npm run watchdog:start`, expected: 'starts watchdog mode on the existing supervisor script' },
    { action: 'watchdog_stop', command: `${prefix}powershell -ExecutionPolicy Bypass -File ${watchdogScript} -Stop`, expected: 'stops only the watchdog PID recorded in its lock' },
    { action: 'watchdog_status', command: `${prefix}npm run watchdog:status`, expected: 'reads watchdog lock plus API runtime status when credentials are available' },
  ];
}

function duplicateValues(values = []) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function buildParentCoordinationAudit({
  latest = {},
  run = {},
  laneManifest = {},
  requirements = {},
  git = {},
  expectedAgentFleetRequirementId = 'REQ-20260624-045',
  finalRequirementId = 'REQ-20260624-048',
} = {}) {
  const findings = [];
  const reqs = Array.isArray(requirements.requirements) ? requirements.requirements : [];
  const tasks = Array.isArray(requirements.tasks) ? requirements.tasks : [];
  const lanes = Array.isArray(laneManifest.lanes) ? laneManifest.lanes : [];
  const activePath = String(latest.path || '').replace(/\\/g, '/');
  const parentPath = String(laneManifest.parent_run_path || '').replace(/\\/g, '/');

  if (activePath && parentPath && activePath !== parentPath) {
    findings.push({ severity: 'critical', type: 'active_pointer_drift', message: 'latest.json does not point at the parent run path.', activePath, parentPath });
  }
  if (laneManifest.active_pointer_owner && laneManifest.active_pointer_owner !== 'parent') {
    findings.push({ severity: 'critical', type: 'active_pointer_owner', message: 'Active pointer owner must remain parent.', owner: laneManifest.active_pointer_owner });
  }
  for (const id of duplicateValues(reqs.map((item) => item.id))) {
    findings.push({ severity: 'critical', type: 'duplicate_requirement_id', message: `Duplicate requirement ID ${id}.`, id });
  }
  for (const key of duplicateValues(tasks.map((item) => item.canonical_task_key))) {
    findings.push({ severity: 'critical', type: 'duplicate_canonical_task', message: `Duplicate canonical task key ${key}.`, key });
  }
  const agentFleetLane = lanes.find((lane) => lane.lane_id === 'agent-fleet');
  if (!agentFleetLane) {
    findings.push({ severity: 'critical', type: 'missing_agent_fleet_lane', message: 'LANE-MANIFEST is missing the agent-fleet lane.' });
  } else if (expectedAgentFleetRequirementId && !agentFleetLane.requirement_ids?.includes(expectedAgentFleetRequirementId)) {
    findings.push({ severity: 'warn', type: 'agent_fleet_lane_scope', message: `Agent-fleet lane does not claim ${expectedAgentFleetRequirementId}.`, expected_requirement_id: expectedAgentFleetRequirementId });
  }
  const allowedLaneStatuses = new Set(['queued', 'claimed', 'running', 'blocked', 'ready_for_integration', 'integrated', 'done', 'failed']);
  for (const lane of lanes) {
    if (!allowedLaneStatuses.has(String(lane.status || ''))) {
      findings.push({ severity: 'warn', type: 'unknown_lane_status', message: `Lane ${lane.lane_id} has unknown status ${lane.status}.`, lane_id: lane.lane_id });
    }
  }
  if (git.branch && laneManifest.parent_branch && git.branch !== laneManifest.parent_branch) {
    findings.push({ severity: 'warn', type: 'branch_drift', message: 'Current branch differs from parent branch.', branch: git.branch, parent_branch: laneManifest.parent_branch });
  }
  if (git.upstream_missing) {
    findings.push({ severity: 'warn', type: 'branch_has_no_upstream', message: 'Current branch has no configured upstream; push/set upstream before relying on publish status.', branch: git.branch || '' });
  }
  const finalReq = finalRequirementId ? reqs.find((item) => item.id === finalRequirementId) : null;
  const prerequisiteIds = finalReq?.depends_on || [];
  const nonTerminal = reqs.filter((item) => prerequisiteIds.includes(item.id) && !['done', 'blocked', 'already_satisfied', 'needs_operator_decision', 'failed', 'archived'].includes(item.status));
  if (finalReq?.status === 'done' && nonTerminal.length) {
    findings.push({ severity: 'critical', type: 'premature_parent_completion', message: 'Final requirement is Done while prerequisites are non-terminal.', requirement_ids: nonTerminal.map((item) => item.id) });
  }
  return {
    ok: !findings.some((finding) => finding.severity === 'critical'),
    generated_at: new Date().toISOString(),
    finding_count: findings.length,
    findings,
    counts: {
      requirements: reqs.length,
      tasks: tasks.length,
      lanes: lanes.length,
    },
  };
}

function stableSyntheticId(parts = []) {
  return crypto.createHash('sha256').update(parts.map((part) => String(part || '')).join('\n')).digest('hex').slice(0, 16);
}

module.exports = {
  AGENT_FLEET_PERMISSION_TIERS,
  buildParentCoordinationAudit,
  buildStartupShortcutMatrix,
  classifyAgentFleetCommand,
  permissionTierLines,
  redactAgentFleetText,
  stableSyntheticId,
};
