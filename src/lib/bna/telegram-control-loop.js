const crypto = require('node:crypto');

const CONTROL_QUERY_PATTERNS = [
  ['status', /^\/status$/i],
  ['mine', /^(?:\/my_tasks|show\s+(?:me\s+)?my\s+tasks|what(?:'s| is)\s+on\s+my\s+(?:task\s+)?list)\??$/i],
  ['decisions', /^(?:\/decisions|show\s+(?:me\s+)?(?:open\s+)?decisions|what\s+(?:decisions|choices)\s+(?:need|require)\s+me)\??$/i],
  ['blocked', /^(?:\/blocked|show\s+(?:me\s+)?blocked(?:\s+(?:work|tasks))?|what(?:'s| is)\s+blocked)\??$/i],
  ['codex_results', /^(?:\/codex_results|what\s+did\s+codex\s+do|show\s+(?:me\s+)?(?:recent\s+)?codex\s+results)\??$/i],
];

function classifyTelegramControlQuery(value) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  return CONTROL_QUERY_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] || '';
}

function telegramActorRef(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return 'chat:unknown';
  return `chat:${crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 10)}`;
}

function telegramTokenFingerprint(value) {
  const normalized = String(value || '');
  if (!normalized) return 'token-unset';
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 12);
}

function taskControlSource(task = {}) {
  const source = String(task.source || task.source_type || task.source_channel || '').toLowerCase();
  const type = String(task.item_type || task.task_kind || '').toLowerCase();
  if (task.bot_created || /telegram|bot/.test(source)) return 'Bot';
  if (task.support_ticket_id || /ticket|support/.test(source) || /ticket/.test(type)) return 'Ticket';
  if (task.agent_job_id || /agent|codex|kimi|system/.test(source) || /agent/.test(type)) return 'Agent';
  if (/integration|webhook|whatsapp|wapi|drive|calendar|email|zoom|stripe/.test(source)) return 'Integration';
  return 'Manual';
}

function isQuietHour({ now = new Date(), timeZone = 'Asia/Jerusalem', startHour = 22, endHour = 7 } = {}) {
  const start = Number(startHour);
  const end = Number(endHour);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start === end) return false;
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(now));
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

function usefulTaskTransition(previous = null, current = {}) {
  if (!current?.id) return null;
  const currentFailed = current.stage === 'failed'
    || current.agent_status === 'failed'
    || current.proof_status === 'failed'
    || current.deploy_status === 'failed'
    || current.canary_status === 'failed';
  if (!previous) {
    if (currentFailed) return { kind: 'failed', label: 'Work failed' };
    if (String(current.stage || '') === 'needs_decision') return { kind: 'decision_required', label: 'Decision required' };
    if (current.blocked_reason || current.waiting_on || current.stage === 'blocked') return { kind: 'blocked', label: 'Blocked' };
    if (/shloimie|operator/i.test(String(current.assigned_to || ''))) return { kind: 'assigned', label: 'Assigned to Shloimie' };
    return null;
  }
  const previousFailed = previous.stage === 'failed'
    || previous.agent_status === 'failed'
    || previous.proof_status === 'failed'
    || previous.deploy_status === 'failed'
    || previous.canary_status === 'failed';
  if (!previousFailed && currentFailed) return { kind: 'failed', label: 'Work failed' };
  const wasDone = Boolean(previous.completed_at || previous.verified_at || previous.stage === 'done');
  const isDone = Boolean(current.completed_at || current.verified_at || current.stage === 'done');
  if (!wasDone && isDone) {
    return current.verified_at
      ? { kind: 'completed', label: 'Completed and verified' }
      : { kind: 'completed', label: 'Task completed' };
  }
  if (previous.stage !== 'needs_decision' && current.stage === 'needs_decision') {
    return { kind: 'decision_required', label: 'Decision required' };
  }
  const previousBlocked = Boolean(previous.blocked_reason || previous.waiting_on || previous.stage === 'blocked');
  const currentBlocked = Boolean(current.blocked_reason || current.waiting_on || current.stage === 'blocked');
  if (!previousBlocked && currentBlocked) return { kind: 'blocked', label: 'Blocked' };
  const wasMine = /shloimie|operator/i.test(String(previous.assigned_to || ''));
  const isMine = /shloimie|operator/i.test(String(current.assigned_to || ''));
  if (!wasMine && isMine) return { kind: 'assigned', label: 'Assigned to Shloimie' };
  return null;
}

module.exports = {
  classifyTelegramControlQuery,
  isQuietHour,
  taskControlSource,
  telegramActorRef,
  telegramTokenFingerprint,
  usefulTaskTransition,
};
