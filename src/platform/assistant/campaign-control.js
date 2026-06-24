const {
  assertActionPolicy,
  normalizeChannel,
} = require('./control-plane');
const {
  createDraft,
  createDraftVersion,
  createPreview,
} = require('./draft-versioning');

const CAMPAIGN_CONTROL_REQUIREMENT_ID = 'REQ-20260623-020';
const CONTRACT_VERSION = 'assistant-campaign-control-v1';

const SUPPRESSION_REASONS = Object.freeze([
  'unsubscribed',
  'bounced',
  'do_not_contact',
  'already_enrolled',
  'duplicate',
  'manual_review',
  'cross_workspace',
]);

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

function workspaceFrom(actor = {}, input = {}) {
  return {
    workspace_key: input.workspace_key || input.workspaceKey || actor.workspace_key || actor.workspaceKey || actor.workspace_id || actor.workspace || 'bna',
    project_key: input.project_key || input.projectKey || actor.project_key || actor.projectKey || actor.project_id || actor.project || 'bna',
  };
}

function assertCampaignPolicy({
  actor = {},
  channel = 'operations_helper',
  action_category = 'email_campaign',
  operation = 'preview',
  workspace_key = '',
  project_key = '',
  dry_run = true,
} = {}) {
  const workspace = workspaceFrom(actor, { workspace_key, project_key });
  const policy = assertActionPolicy({
    actor,
    channel,
    action_category,
    operation,
    target: workspace,
    dry_run,
  });
  return {
    ...policy,
    workspace,
  };
}

function normalizeSuppressionCounts(input = {}) {
  const counts = {};
  for (const reason of SUPPRESSION_REASONS) {
    counts[reason] = Math.max(0, Number(input[reason] || input[`${reason}_count`] || 0));
  }
  return counts;
}

function previewCampaignSegment({
  actor = {},
  channel = 'operations_helper',
  segment_name = '',
  audience_label = '',
  estimated_count = 0,
  consent_count = 0,
  suppression_counts = {},
  exclusions = [],
  workspace_key = '',
  project_key = '',
} = {}) {
  const policy = assertCampaignPolicy({
    actor,
    channel,
    action_category: 'segment',
    operation: 'preview',
    workspace_key,
    project_key,
    dry_run: true,
  });
  const suppressions = normalizeSuppressionCounts(suppression_counts);
  const totalSuppressed = Object.values(suppressions).reduce((sum, value) => sum + value, 0);
  const total = Math.max(0, Number(estimated_count || consent_count || 0));
  const consent = Math.max(0, Number(consent_count || Math.max(0, total - totalSuppressed)));
  const sendable = Math.max(0, Math.min(total, consent) - totalSuppressed);
  return {
    requirement_id: CAMPAIGN_CONTROL_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    action_category: 'segment',
    status: 'preview',
    channel_key: normalizeChannel(channel),
    workspace_key: policy.workspace.workspace_key,
    project_key: policy.workspace.project_key,
    segment_key: normalizeKey(segment_name || audience_label || 'campaign_segment', 'campaign_segment'),
    segment_name: compact(segment_name || audience_label || 'Campaign segment', 160),
    estimated_count: total,
    consent_count: consent,
    suppressed_count: totalSuppressed,
    sendable_count: sendable,
    suppression_counts: suppressions,
    exclusions: Array.isArray(exclusions) ? exclusions.map((item) => normalizeKey(item)).filter(Boolean) : [],
    consent_checked: true,
    suppression_checked: true,
    cross_workspace_audience: false,
    external_send_performed: false,
    preview_required_before_send: true,
    approval_required_before_send: true,
    idempotency_required: true,
  };
}

function normalizeMessages(messages = [], message_count = 1) {
  const explicit = Array.isArray(messages) ? messages : [];
  const count = Math.max(1, Number(message_count || explicit.length || 1));
  return Array.from({ length: count }, (_, index) => {
    const source = explicit[index] || {};
    return {
      message_number: index + 1,
      subject: compact(source.subject || `Message ${index + 1}`, 160),
      body: compact(source.body || source.copy || `Draft message ${index + 1} before approval.`, 4000),
      delay: compact(source.delay || (index === 0 ? 'send_at_start' : `${index} days after previous`), 120),
    };
  });
}

function buildSendSafetyGate({
  audience_preview = {},
  sender = {},
  explicit_approval = false,
  approved = false,
  schedule = {},
} = {}) {
  const blockers = [];
  if (!audience_preview.sendable_count) blockers.push('audience_preview_required');
  if (audience_preview.suppressed_count) blockers.push('suppressed_contacts_excluded');
  if (!sender.from_email && !sender.sender_key) blockers.push('sender_readiness_required');
  if (!explicit_approval && !approved) blockers.push('explicit_send_approval_required');
  return {
    no_send_before_audience_preview: true,
    no_suppressed_recipients: true,
    sender_domain_readiness_required: true,
    rate_limit_required: true,
    batch_size_policy_required: true,
    explicit_approval_required: true,
    test_send_available: true,
    dry_run_available: true,
    pause_cancel_supported: true,
    idempotency_required: true,
    schedule_preview: schedule || {},
    blockers,
    ready_for_live_send: blockers.length === 0 && Boolean(explicit_approval || approved),
  };
}

function createEmailDraftPackage({
  actor = {},
  channel = 'operations_helper',
  conversation_key = '',
  campaign_key = '',
  audience_preview = {},
  goal = '',
  message = {},
  version_number = 1,
  workspace_key = '',
  project_key = '',
} = {}) {
  const workspace = workspaceFrom(actor, { workspace_key, project_key });
  const draft = createDraft({
    object_type: 'email',
    object_id: campaign_key || normalizeKey(goal || 'email_campaign'),
    conversation_key,
    channel,
    actor,
    audience_scope: {
      audience: audience_preview.segment_name || audience_preview.audience_label || 'campaign_audience',
      segment_key: audience_preview.segment_key || '',
      sendable_count: audience_preview.sendable_count || 0,
    },
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    metadata: {
      campaign_control: true,
      requirement_id: CAMPAIGN_CONTROL_REQUIREMENT_ID,
    },
  });
  const version = createDraftVersion({
    draft,
    actor,
    channel,
    content: {
      subject: compact(message.subject || 'Campaign message', 160),
      body: compact(message.body || message.copy || 'Draft message body before approval.', 4000),
      audience_preview_key: audience_preview.segment_key || '',
      external_send_performed: false,
    },
    prompt_instruction: compact(goal || 'Draft campaign email.', 1000),
    change_summary: `Campaign email version ${version_number}.`,
    approval_state: 'draft',
    active_state: 'inactive',
    scheduled_use_state: 'not_scheduled',
    version_number,
  });
  const preview = createPreview({
    draft,
    version,
    actor,
    channel,
    preview_type: 'mobile_email',
    payload: {
      renderer: channel === 'telegram' ? 'telegram_email_snapshot_and_secure_deep_link' : 'desktop_mobile_email_preview',
      subject: version.content.subject,
      body: version.content.body,
      audience: draft.audience_scope,
      external_send_performed: false,
    },
    real_data: false,
    sample_data: true,
    external_action: true,
    blockers: ['External send approval is required before delivery.'],
    status: 'draft',
  });
  return { draft, version, preview };
}

function createCampaignDraft({
  actor = {},
  channel = 'operations_helper',
  conversation_key = '',
  goal = '',
  audience = {},
  message = {},
  sender = {},
  schedule = {},
  workspace_key = '',
  project_key = '',
} = {}) {
  const audiencePreview = audience.sendable_count !== undefined
    ? audience
    : previewCampaignSegment({
      actor,
      channel,
      ...audience,
      workspace_key,
      project_key,
    });
  assertCampaignPolicy({
    actor,
    channel,
    action_category: 'email_campaign',
    operation: 'draft',
    workspace_key: audiencePreview.workspace_key || workspace_key,
    project_key: audiencePreview.project_key || project_key,
    dry_run: true,
  });
  const email = createEmailDraftPackage({
    actor,
    channel,
    conversation_key,
    campaign_key: normalizeKey(goal || 'email_campaign'),
    audience_preview: audiencePreview,
    goal,
    message,
    workspace_key: audiencePreview.workspace_key || workspace_key,
    project_key: audiencePreview.project_key || project_key,
  });
  return {
    requirement_id: CAMPAIGN_CONTROL_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    action_category: 'email_campaign',
    status: 'draft_preview',
    goal: compact(goal || 'Campaign draft', 500),
    audience_preview: audiencePreview,
    sender,
    schedule,
    email,
    safety_gate: buildSendSafetyGate({ audience_preview: audiencePreview, sender, schedule }),
    external_send_performed: false,
    campaign_execution_performed: false,
  };
}

function createDripSequenceDraft({
  actor = {},
  channel = 'operations_helper',
  conversation_key = '',
  goal = '',
  audience = {},
  messages = [],
  message_count = 1,
  sender = {},
  schedule = {},
  intervals = [],
  rate_limit = {},
  workspace_key = '',
  project_key = '',
} = {}) {
  const audiencePreview = audience.sendable_count !== undefined
    ? audience
    : previewCampaignSegment({
      actor,
      channel,
      ...audience,
      workspace_key,
      project_key,
    });
  assertCampaignPolicy({
    actor,
    channel,
    action_category: 'drip_sequence',
    operation: 'draft',
    workspace_key: audiencePreview.workspace_key || workspace_key,
    project_key: audiencePreview.project_key || project_key,
    dry_run: true,
  });
  const normalizedMessages = normalizeMessages(messages, message_count);
  const emailPackages = normalizedMessages.map((message, index) => createEmailDraftPackage({
    actor,
    channel,
    conversation_key,
    campaign_key: `${normalizeKey(goal || 'drip_sequence')}_${index + 1}`,
    audience_preview: audiencePreview,
    goal,
    message,
    version_number: index + 1,
    workspace_key: audiencePreview.workspace_key || workspace_key,
    project_key: audiencePreview.project_key || project_key,
  }));
  return {
    requirement_id: CAMPAIGN_CONTROL_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    action_category: 'drip_sequence',
    status: 'draft_preview',
    goal: compact(goal || 'Drip sequence draft', 500),
    sequence: {
      message_count: normalizedMessages.length,
      intervals: intervals.length ? intervals : normalizedMessages.map((message) => message.delay),
      messages: emailPackages.map((pkg, index) => ({
        message_number: index + 1,
        draft_key: pkg.draft.draft_key,
        version_key: pkg.version.version_key,
        subject: pkg.version.content.subject,
        delay: normalizedMessages[index].delay,
        approval_state: pkg.version.approval_state,
      })),
    },
    audience_preview: audiencePreview,
    sender,
    schedule,
    rate_limit: {
      max_per_hour: Number(rate_limit.max_per_hour || rate_limit.maxPerHour || 100),
      batch_size: Number(rate_limit.batch_size || rate_limit.batchSize || 100),
    },
    previews: emailPackages.map((pkg) => pkg.preview),
    safety_gate: buildSendSafetyGate({ audience_preview: audiencePreview, sender, schedule }),
    external_send_performed: false,
    sequence_enabled: false,
    campaign_execution_performed: false,
  };
}

function compileNaturalLanguageCampaignPlan({
  message = '',
  actor = {},
  channel = 'operations_helper',
  workspace_key = '',
  project_key = '',
} = {}) {
  const text = compact(message, 4000);
  const lower = text.toLowerCase();
  const messageCountMatch = lower.match(/\b(\d+)[-\s]?(?:message|email)s?\b|\b(\d+)[-\s]?part\b/);
  const explicitCount = Number(messageCountMatch?.[1] || messageCountMatch?.[2] || 0);
  const audienceCountMatch = lower.match(/\b(\d{1,3}(?:,\d{3})+|\d+)\s*(?:opted[-\s]?in\s*)?(?:lead|parent|contact|recipient|person|people|email)s?\b/);
  const estimatedCount = audienceCountMatch ? Number(audienceCountMatch[1].replace(/,/g, '')) : 0;
  const actionCategory = /\b(sequence|drip|nurture|series)\b/.test(lower) ? 'drip_sequence' : 'email_campaign';
  const exclusions = [];
  if (/\bunsubscribed|unsubscribe\b/.test(lower)) exclusions.push('unsubscribed');
  if (/\bbounced?\b/.test(lower)) exclusions.push('bounced');
  if (/\balready enrolled|enrolled\b/.test(lower)) exclusions.push('already_enrolled');
  const audience = previewCampaignSegment({
    actor,
    channel,
    segment_name: estimatedCount ? `${estimatedCount} requested recipients` : 'Natural language campaign segment',
    estimated_count: estimatedCount,
    consent_count: /\bopted[-\s]?in|consent\b/.test(lower) ? estimatedCount : 0,
    suppression_counts: {},
    exclusions,
    workspace_key,
    project_key,
  });
  return {
    requirement_id: CAMPAIGN_CONTROL_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    mode: 'natural_language_campaign_plan',
    action_category: actionCategory,
    channel_key: normalizeChannel(channel),
    goal: text,
    audience,
    message_count: actionCategory === 'drip_sequence' ? Math.max(1, explicitCount || 6) : 1,
    requested_exclusions: exclusions,
    preview_required: true,
    approval_required: true,
    external_send_performed: false,
  };
}

module.exports = {
  CAMPAIGN_CONTROL_REQUIREMENT_ID,
  CONTRACT_VERSION,
  SUPPRESSION_REASONS,
  assertCampaignPolicy,
  buildSendSafetyGate,
  compileNaturalLanguageCampaignPlan,
  createCampaignDraft,
  createDripSequenceDraft,
  previewCampaignSegment,
};
