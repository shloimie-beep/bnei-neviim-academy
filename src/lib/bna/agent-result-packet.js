const crypto = require('node:crypto');

const AGENT_RESULT_PACKET_VERSION = 'bna-agent-result-packet-v1';

function redactSecretText(value = '') {
  return String(value || '')
    .replace(/\b(sk|rk|gh[pousr]|xox[baprs]|whsec|re)_[A-Za-z0-9._-]{12,}\b/g, '[redacted-secret]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*[^\s"',}]+/gi, '$1=[redacted]');
}

function compactText(value = '', maxLength = 1200) {
  return redactSecretText(value).replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function asArray(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function safeObject(value, fallback = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  return value;
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function normalizeAgentResultStatus(value = '') {
  const normalized = String(value || 'completed').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['done', 'complete', 'completed', 'success', 'verified'].includes(normalized)) return 'completed';
  if (['blocked', 'needs_decision', 'needs_operator', 'blocked_needs_human_decision'].includes(normalized)) return 'blocked_needs_human_decision';
  if (['fail', 'failed', 'error'].includes(normalized)) return 'failed';
  if (['run', 'running', 'in_progress', 'claimed'].includes(normalized)) return 'running';
  return 'completed';
}

function normalizeEvidenceItem(item = {}) {
  const raw = typeof item === 'string' ? { path: item } : safeObject(item);
  const url = compactText(raw.url || raw.href || '', 1000);
  const repoPath = compactText(raw.repo_path || raw.repoPath || raw.path || raw.report_path || raw.reportPath || '', 1000)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
  const link = /^https?:\/\//i.test(url) ? url : '';
  if (!repoPath && !link) return null;
  const label = compactText(raw.label || raw.title || raw.kind || (repoPath ? repoPath.split('/').pop() : 'Evidence'), 140);
  const kind = compactText(raw.kind || raw.type || (repoPath ? 'repo_file' : 'url'), 80)
    .replace(/[^a-z0-9_ -]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
  return {
    label,
    kind: kind || 'evidence',
    repo_path: repoPath || null,
    url: repoPath ? null : link,
    status: compactText(raw.status || 'valid', 40).toLowerCase() || 'valid',
  };
}

function normalizeEvidence(value) {
  const seen = new Set();
  return asArray(value)
    .map(normalizeEvidenceItem)
    .filter((item) => {
      if (!item) return false;
      const key = item.repo_path || item.url;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeTestItem(item = {}) {
  if (typeof item === 'string') return { command: compactText(item, 400), status: /fail/i.test(item) ? 'failed' : 'passed' };
  const raw = safeObject(item);
  return {
    command: compactText(raw.command || raw.name || raw.test || '', 400),
    status: compactText(raw.status || raw.result || 'passed', 80).toLowerCase(),
    details: compactText(raw.details || raw.output || '', 600) || null,
  };
}

function normalizeGithubState(value = {}) {
  const raw = safeObject(value);
  const issue = safeObject(raw.issue || {});
  const pullRequest = raw.pull_request || raw.pr || raw.pullRequest || null;
  const prObject = safeObject(pullRequest, null);
  const prUrl = typeof pullRequest === 'string'
    ? pullRequest
    : (prObject?.url || prObject?.html_url || prObject?.link || '');
  return {
    repo: compactText(raw.repo || raw.repository || '', 160) || null,
    issue_number: raw.issue_number || raw.issueNumber || issue.number || null,
    issue_url: compactText(raw.issue_url || raw.issueUrl || issue.url || issue.html_url || '', 1000) || null,
    comment_id: raw.comment_id || raw.commentId || null,
    comment_url: compactText(raw.comment_url || raw.commentUrl || '', 1000) || null,
    pull_request: prObject ? {
      number: prObject.number || null,
      url: compactText(prUrl, 1000) || null,
      state: compactText(prObject.state || '', 80) || null,
    } : (prUrl ? { number: null, url: compactText(prUrl, 1000), state: null } : null),
    commit_url: compactText(raw.commit_url || raw.commitUrl || '', 1000) || null,
  };
}

function normalizeDeploymentState(value = {}) {
  const raw = typeof value === 'string' ? { status: value } : safeObject(value);
  return {
    required: Boolean(raw.required ?? raw.deployment_required ?? false),
    status: compactText(raw.status || raw.state || raw.deploy_state || '', 120) || null,
    live_smoke: compactText(raw.live_smoke || raw.liveSmoke || raw.live_state || '', 300) || null,
    blocker: compactText(raw.blocker || raw.blocked_reason || '', 800) || null,
    url: compactText(raw.url || raw.live_url || raw.liveUrl || '', 1000) || null,
  };
}

function buildAgentResultPacket(input = {}, context = {}) {
  const raw = safeObject(input);
  const taskId = raw.task_id || raw.taskId || context.task_id || context.taskId || null;
  const agentJobId = raw.agent_job_id || raw.agentJobId || context.agent_job_id || context.agentJobId || null;
  const packet = {
    contract_version: AGENT_RESULT_PACKET_VERSION,
    status: normalizeAgentResultStatus(raw.status || raw.result_status || raw.resultStatus),
    source_raw_id: compactText(raw.source_raw_id || raw.sourceRawId || raw.raw_id || raw.rawId || raw.source_id || raw.sourceId || '', 160) || null,
    task_id: taskId === null || taskId === undefined || taskId === '' ? null : Number(taskId),
    parent_task_id: raw.parent_task_id || raw.parentTaskId || null,
    requirement_id: compactText(raw.requirement_id || raw.requirementId || '', 160) || null,
    agent_run_id: compactText(raw.agent_run_id || raw.agentRunId || raw.run_id || raw.runId || '', 200) || null,
    agent_job_id: agentJobId === null || agentJobId === undefined || agentJobId === '' ? null : Number(agentJobId),
    branch: compactText(raw.branch || raw.git_branch || raw.gitBranch || '', 240) || null,
    worktree: compactText(raw.worktree || raw.worktree_path || raw.worktreePath || '', 500) || null,
    commit: compactText(raw.commit || raw.commit_sha || raw.commitSha || '', 160) || null,
    pull_request: raw.pull_request || raw.pullRequest || raw.pr || null,
    tests: asArray(raw.tests || raw.verification).map(normalizeTestItem).filter((item) => item.command || item.details),
    deployment: normalizeDeploymentState(raw.deployment || raw.deploy || raw.live || {}),
    evidence: normalizeEvidence(raw.evidence || raw.evidence_paths || raw.evidencePaths || raw.artifact_links || raw.artifactLinks),
    blockers: asArray(raw.blockers || raw.decisions || raw.blocker || raw.current_blocker)
      .map((item) => compactText(typeof item === 'string' ? item : (item?.summary || item?.title || item?.blocker || JSON.stringify(item)), 800))
      .filter(Boolean),
    summary: compactText(raw.summary || raw.result_summary || raw.resultSummary || '', 1400) || 'Agent result saved.',
    machine_payload: safeObject(raw.machine_payload || raw.machinePayload || raw.payload || raw.result_payload || raw.resultPayload, {}),
    github: normalizeGithubState(raw.github || raw.github_state || raw.githubState || {
      issue_url: raw.github_issue_url || raw.githubIssueUrl,
      comment_url: raw.github_comment_url || raw.githubCommentUrl,
      pull_request: raw.pr || raw.pull_request || raw.pullRequest,
      commit_url: raw.commit_url || raw.commitUrl,
    }),
    timestamp: raw.timestamp || raw.completed_at || raw.completedAt || raw.recorded_at || raw.recordedAt || new Date().toISOString(),
  };
  const stableParts = {
    contract_version: packet.contract_version,
    status: packet.status,
    source_raw_id: packet.source_raw_id,
    task_id: packet.task_id,
    parent_task_id: packet.parent_task_id,
    requirement_id: packet.requirement_id,
    agent_run_id: packet.agent_run_id,
    agent_job_id: packet.agent_job_id,
    branch: packet.branch,
    commit: packet.commit,
    pull_request: packet.pull_request,
    evidence: packet.evidence,
    blockers: packet.blockers,
    summary: packet.summary,
    machine_payload: packet.machine_payload,
    github: packet.github,
  };
  packet.idempotency_key = compactText(raw.idempotency_key || raw.idempotencyKey || '', 220) || `agent-result:${sha256(stableJson(stableParts)).slice(0, 32)}`;
  return packet;
}

function artifactLinksFromAgentResultPacket(packet = {}) {
  const links = normalizeEvidence(packet.evidence || []);
  const add = (repoPath, label, kind) => {
    const link = normalizeEvidenceItem({ repo_path: repoPath, label, kind, status: 'valid' });
    if (link) links.push(link);
  };
  add(packet.report_path || packet.reportPath, 'Agent report', 'report');
  add(packet.ledger_ref || packet.ledgerRef, 'Agent ledger', 'verification');
  add(packet.changelog_ref || packet.changelogRef, 'Agent changelog', 'verification');
  const seen = new Set();
  return links.filter((link) => {
    const key = link.repo_path || link.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function githubLinksFromAgentResultPacket(packet = {}) {
  const github = safeObject(packet.github);
  return [
    github.issue_url ? { label: 'GitHub issue', kind: 'github_issue', url: github.issue_url, status: 'unchecked' } : null,
    github.comment_url ? { label: 'GitHub comment', kind: 'github_comment', url: github.comment_url, status: 'unchecked' } : null,
    github.pull_request?.url ? { label: 'Pull request', kind: 'pull_request', url: github.pull_request.url, status: 'unchecked' } : null,
    github.commit_url ? { label: 'Commit', kind: 'commit', url: github.commit_url, status: 'unchecked' } : null,
  ].filter(Boolean);
}

function agentResultSummary(packet = {}) {
  const tests = Array.isArray(packet.tests) ? packet.tests : [];
  const failed = tests.filter((item) => !/pass|ok|success|verified/i.test(String(item.status || ''))).length;
  const bits = [
    packet.summary || 'Agent result saved.',
    packet.commit ? `Commit ${packet.commit}` : '',
    packet.pull_request ? `PR ${typeof packet.pull_request === 'string' ? packet.pull_request : (packet.pull_request.url || packet.pull_request.number || '')}` : '',
    tests.length ? `Tests ${tests.length - failed}/${tests.length} passed` : '',
    packet.deployment?.status ? `Deploy ${packet.deployment.status}` : '',
    packet.blockers?.length ? `Blockers: ${packet.blockers.join('; ')}` : '',
  ].filter(Boolean);
  return compactText(bits.join(' | '), 2000);
}

module.exports = {
  AGENT_RESULT_PACKET_VERSION,
  agentResultSummary,
  artifactLinksFromAgentResultPacket,
  buildAgentResultPacket,
  githubLinksFromAgentResultPacket,
  normalizeAgentResultStatus,
  normalizeEvidence,
};
