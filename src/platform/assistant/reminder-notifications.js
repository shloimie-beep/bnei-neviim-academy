const crypto = require('crypto');

const {
  assertActionPolicy,
  normalizeChannel,
} = require('./control-plane');

const REMINDER_NOTIFICATIONS_REQUIREMENT_ID = 'REQ-20260623-023';
const CONTRACT_VERSION = 'assistant-reminder-notifications-v1';

const DELIVERY_CHANNELS = Object.freeze(['telegram', 'in_app', 'email', 'sms', 'whatsapp']);
const REMINDER_STATUSES = Object.freeze(['scheduled', 'paused', 'sent', 'completed', 'cancelled', 'failed', 'archived']);

function compact(value = '', maxLength = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeKey(value = '', fallback = '') {
  const key = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return key || fallback;
}

function normalizeReminderChannel(value = '') {
  const key = normalizeKey(value);
  if (['bot', 'telegram_bot', 'telegram_bridge'].includes(key)) return 'telegram';
  if (['ui', 'ui_button', 'dashboard', 'operations'].includes(key)) return 'operations_helper';
  return normalizeChannel(value) || 'website_assistant';
}

function shortHash(value = '') {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 14);
}

function workspaceFrom(actor = {}, input = {}) {
  return {
    workspace_key: input.workspace_key || input.workspaceKey || actor.workspace_key || actor.workspaceKey || actor.workspace_id || actor.workspace || 'bna',
    project_key: input.project_key || input.projectKey || actor.project_key || actor.projectKey || actor.project_id || actor.project || 'bna',
  };
}

function assertReminderPolicy({
  actor = {},
  channel = 'website_assistant',
  operation = 'schedule',
  target = {},
  dry_run = true,
} = {}) {
  return assertActionPolicy({
    actor,
    channel: normalizeReminderChannel(channel),
    action_category: 'reminder',
    operation,
    target,
    dry_run,
  });
}

function normalizeDeliveryChannels({ requested = [], source_channel = 'website_assistant', consent = {} } = {}) {
  const explicit = Array.isArray(requested) ? requested : String(requested || '').split(/[,\s]+/);
  const channels = explicit.map((item) => normalizeKey(item)).filter((item) => DELIVERY_CHANNELS.includes(item));
  const source = normalizeReminderChannel(source_channel);
  if (!channels.length) channels.push(source === 'telegram' ? 'telegram' : 'in_app');
  return [...new Set(channels)].map((channel) => ({
    channel_key: channel,
    consent_required: ['email', 'sms', 'whatsapp', 'telegram'].includes(channel),
    consent_granted: channel === 'in_app' ? true : Boolean(consent[channel] || consent[`${channel}_opt_in`] || consent.opted_in),
    enabled: channel === 'in_app' || Boolean(consent[channel] || consent[`${channel}_opt_in`] || consent.opted_in),
  }));
}

function parseReminderIntent(message = '') {
  const text = compact(message, 4000);
  const lower = text.toLowerCase();
  let triggerType = 'time';
  if (/\bwhen\b|\bif\b|\bonce\b/.test(lower)) triggerType = 'event';
  if (/\battendance.{0,40}(below|drops?|under)\b/.test(lower)) triggerType = 'threshold';
  if (/\bbefore every class|before class|class reminder|every class\b/.test(lower)) triggerType = 'class_reminder';
  if (/\bpayment fails?|payment failure|payment failed\b/.test(lower)) triggerType = 'payment_failure';

  const recurrenceRule = /\bevery class\b|\bbefore every class\b/.test(lower)
    ? 'RRULE:FREQ=CLASS_SESSION'
    : /\bevery day|daily\b/.test(lower) ? 'RRULE:FREQ=DAILY'
      : /\bevery week|weekly\b/.test(lower) ? 'RRULE:FREQ=WEEKLY'
        : '';

  const thresholdMatch = lower.match(/\b(\d{1,3})\s*%/);
  const minutesMatch = lower.match(/\b(\d{1,4})\s*(minute|minutes|min)\b/);
  const hoursMatch = lower.match(/\b(\d{1,3})\s*(hour|hours)\b/);
  const daysMatch = lower.match(/\b(\d{1,3})\s*(day|days)\b/);
  const beforeClassMinutes = minutesMatch ? Number(minutesMatch[1]) : hoursMatch ? Number(hoursMatch[1]) * 60 : 30;

  return {
    trigger_type: triggerType,
    recurrence_rule: recurrenceRule,
    schedule_label: /\btomorrow\b/.test(lower)
      ? 'tomorrow'
      : /\bnext week\b/.test(lower) ? 'next_week'
        : recurrenceRule ? 'recurring'
          : 'manual_time',
    delay: minutesMatch ? `${minutesMatch[1]} minutes` : hoursMatch ? `${hoursMatch[1]} hours` : daysMatch ? `${daysMatch[1]} days` : /\btomorrow\b/.test(lower) ? '1 day' : '',
    before_class_minutes: beforeClassMinutes,
    threshold_percent: thresholdMatch ? Number(thresholdMatch[1]) : null,
    event_key: /rabbi.*approve|approval/.test(lower) ? 'approval_state_changed' : /payment/.test(lower) ? 'payment_state_changed' : '',
    title: compact(text.split(/[.!?]/).find(Boolean) || 'Assistant reminder', 180),
  };
}

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function nextRunFromIntent(intent = {}, currentTime = new Date()) {
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime || Date.now());
  if (intent.schedule_label === 'tomorrow') return addDays(now, 1).toISOString();
  if (intent.schedule_label === 'next_week') return addDays(now, 7).toISOString();
  if (intent.delay) {
    const [amountText, unit = ''] = intent.delay.split(/\s+/);
    const amount = Number(amountText || 0);
    const next = new Date(now.getTime());
    if (/minute/.test(unit)) next.setUTCMinutes(next.getUTCMinutes() + amount);
    else if (/hour/.test(unit)) next.setUTCHours(next.getUTCHours() + amount);
    else if (/day/.test(unit)) next.setUTCDate(next.getUTCDate() + amount);
    return next.toISOString();
  }
  return '';
}

function reminderKey({ actor = {}, workspace = {}, message = '', intent = {} } = {}) {
  return `reminder_${shortHash(JSON.stringify({
    actor: actor.user_id || actor.identity_key || actor.id || '',
    workspace,
    message: compact(message, 600).toLowerCase(),
    trigger: intent.trigger_type,
    recurrence: intent.recurrence_rule,
  }))}`;
}

function buildReminderPlan({
  message = '',
  actor = {},
  channel = 'website_assistant',
  timezone = 'Asia/Jerusalem',
  audience_scope = {},
  delivery_channels = [],
  quiet_hours = { start: '21:00', end: '08:00' },
  consent_state = {},
  current_time = new Date(),
  workspace_key = '',
  project_key = '',
} = {}) {
  const text = compact(message, 4000);
  if (!text) throw new Error('message is required');
  const workspace = workspaceFrom(actor, { workspace_key, project_key });
  const policy = assertReminderPolicy({
    actor,
    channel,
    target: {
      ...workspace,
      child_id: audience_scope.child_id || audience_scope.student_id,
      parent_id: audience_scope.parent_id,
      provider_id: audience_scope.provider_id,
    },
    dry_run: true,
  });
  const intent = parseReminderIntent(text);
  const channels = normalizeDeliveryChannels({
    requested: delivery_channels,
    source_channel: channel,
    consent: consent_state,
  });
  const key = reminderKey({ actor, workspace, message: text, intent });
  const externalBlocked = channels.filter((item) => item.consent_required && !item.consent_granted).map((item) => item.channel_key);
  const reminder = {
    requirement_id: REMINDER_NOTIFICATIONS_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    reminder_key: key,
    actor_identity_key: String(actor.identity_key || actor.user_id || actor.id || ''),
    audience_scope,
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    timezone,
    recurrence_rule: intent.recurrence_rule,
    trigger: {
      trigger_type: intent.trigger_type,
      schedule_label: intent.schedule_label,
      delay: intent.delay,
      before_class_minutes: intent.before_class_minutes,
      threshold_percent: intent.threshold_percent,
      event_key: intent.event_key,
      source_text: text,
    },
    delivery_channels: channels,
    quiet_hours,
    consent_state,
    status: 'scheduled',
    next_run_at: nextRunFromIntent(intent, current_time),
    last_run_at: null,
    metadata: {
      actor_role: policy.role,
      preview_required: policy.preview_required,
      approval_required: policy.approval_required,
      dedupe_key: key,
      no_duplicate_delivery: true,
    },
  };
  const notification = {
    requirement_id: REMINDER_NOTIFICATIONS_REQUIREMENT_ID,
    notification_key: `notification_${shortHash(`${key}:initial`)}`,
    reminder_key: key,
    conversation_key: '',
    recipient_identity_key: reminder.actor_identity_key,
    channel_key: channels[0]?.channel_key || 'in_app',
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    payload: {
      title: intent.title,
      body: text,
      real_vs_sample: 'draft',
      quiet_hours,
      external_channels_blocked_until_consent: externalBlocked,
    },
    status: 'queued',
    dedupe_key: key,
    sent_at: null,
  };
  const outbox = channels.map((item) => ({
    requirement_id: REMINDER_NOTIFICATIONS_REQUIREMENT_ID,
    delivery_key: `delivery_${shortHash(`${key}:${item.channel_key}`)}`,
    conversation_key: '',
    channel_key: item.channel_key,
    recipient_identity_key: reminder.actor_identity_key,
    payload: notification.payload,
    idempotency_key: `${key}:${item.channel_key}`,
    status: item.enabled ? 'queued' : 'cancelled',
    attempts: 0,
    next_attempt_at: reminder.next_run_at,
    last_error: item.enabled ? '' : 'consent_required',
    sent_at: null,
  }));
  return {
    requirement_id: REMINDER_NOTIFICATIONS_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    status: 'draft_schedule_preview',
    channel_key: normalizeReminderChannel(channel),
    reminder,
    notification,
    delivery_outbox: outbox,
    consent_blockers: externalBlocked,
    quiet_hours_enforced: true,
    retry_policy: { max_attempts: 3, backoff: 'exponential', dead_letter_after_max_attempts: true },
    pause_cancel_supported: true,
    external_send_performed: false,
    reminder_sent: false,
    duplicate_delivery_prevented_by: key,
    browser_click_substitution_allowed: false,
  };
}

function pauseCancelReminderPlan({ reminder_key = '', action = 'pause', actor = {}, channel = 'website_assistant' } = {}) {
  const normalizedAction = normalizeKey(action);
  if (!['pause', 'cancel', 'resume'].includes(normalizedAction)) throw new Error('unsupported_reminder_state_action');
  assertReminderPolicy({ actor, channel, operation: normalizedAction, dry_run: true });
  return {
    requirement_id: REMINDER_NOTIFICATIONS_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    reminder_key,
    action: normalizedAction,
    status_after: normalizedAction === 'cancel' ? 'cancelled' : normalizedAction === 'pause' ? 'paused' : 'scheduled',
    external_send_performed: false,
  };
}

module.exports = {
  CONTRACT_VERSION,
  DELIVERY_CHANNELS,
  REMINDER_NOTIFICATIONS_REQUIREMENT_ID,
  assertReminderPolicy,
  buildReminderPlan,
  normalizeDeliveryChannels,
  parseReminderIntent,
  pauseCancelReminderPlan,
};
