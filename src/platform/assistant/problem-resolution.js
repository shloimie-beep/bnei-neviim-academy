const crypto = require('crypto');

const {
  assertActionPolicy,
  normalizeChannel,
} = require('./control-plane');

const PROBLEM_RESOLUTION_REQUIREMENT_ID = 'REQ-20260623-022';
const CONTRACT_VERSION = 'assistant-problem-resolution-v1';

const OPEN_STATUSES = new Set([
  'open',
  'created_ticket',
  'classified',
  'queued_for_codex',
  'in_progress',
  'triage',
  'blocked',
  'needs_decision',
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

function normalizeProblemChannel(value = '') {
  const key = normalizeKey(value);
  if (['bot', 'telegram_bot', 'telegram_bridge'].includes(key)) return 'telegram';
  if (['ui', 'ui_button', 'dashboard', 'operations'].includes(key)) return 'operations_helper';
  return normalizeChannel(value) || 'website_assistant';
}

function sha1(value = '') {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex');
}

function workspaceFrom(actor = {}, context = {}) {
  return {
    workspace_key: context.workspace_key || context.workspaceKey || actor.workspace_key || actor.workspaceKey || actor.workspace_id || actor.workspace || 'bna',
    project_key: context.project_key || context.projectKey || actor.project_key || actor.projectKey || actor.project_id || actor.project || 'bna',
  };
}

function assertProblemPolicy({
  actor = {},
  channel = 'website_assistant',
  operation = 'create',
  target = {},
  dry_run = true,
} = {}) {
  return assertActionPolicy({
    actor,
    channel: normalizeProblemChannel(channel),
    action_category: 'ticket',
    operation,
    target,
    dry_run,
  });
}

function sourceEnvelope({
  actor = {},
  channel = 'website_assistant',
  context = {},
  files = [],
} = {}) {
  const metadata = context.source_metadata || context.sourceMetadata || {};
  return {
    channel_key: normalizeProblemChannel(channel),
    actor_id: String(actor.user_id || actor.id || actor.identity_key || ''),
    actor_role: String(actor.role || ''),
    workspace_key: context.workspace_key || context.workspaceKey || actor.workspace_key || actor.workspace_id || actor.workspace || '',
    project_key: context.project_key || context.projectKey || actor.project_key || actor.project_id || actor.project || '',
    route: context.route || context.page_url || context.url || '',
    object_type: context.object_type || context.objectType || '',
    object_id: context.object_id || context.objectId || '',
    device: context.device || context.device_context || context.deviceContext || {},
    browser: context.browser || context.user_agent || context.userAgent || '',
    viewport: context.viewport || {},
    source_chat_id: String(metadata.chat_id || metadata.chatId || context.source_chat_id || context.sourceChatId || ''),
    source_message_id: String(metadata.message_id || metadata.messageId || context.source_message_id || context.sourceMessageId || ''),
    forwarded_from: metadata.forwarded_from || metadata.forwardedFrom || '',
    file_refs: files.map((file) => ({
      file_id: String(file.file_id || file.fileId || file.id || ''),
      filename: compact(file.filename || file.name || '', 180),
      fingerprint: file.fingerprint || file.sha256 || file.content_sha256 || '',
      privacy_classification: file.privacy_classification || file.privacy || '',
    })),
  };
}

function classifyProblem({ message = '', context = {}, actor = {} } = {}) {
  const text = compact(message, 4000);
  const lower = text.toLowerCase();
  const route = String(context.route || context.page_url || context.url || '').toLowerCase();
  let category = 'support';
  if (/\b(charged twice|charged|refund|invoice|billing|payment|card|stripe|checkout)\b/.test(lower)) category = 'billing';
  else if (/\b(password|privacy|security|hacked|unauthorized|leak|private|secret)\b/.test(lower)) category = 'security';
  else if (/\b(wrong date|wrong child|wrong student|incorrect|correction|chart.*wrong|attendance.*wrong)\b/.test(lower)) category = 'data_correction';
  else if (/\b(zoom|vimeo|drive|calendar|email|telegram|api|integration|webhook)\b/.test(lower)) category = 'integration';
  else if (/\b(broken|bug|error|crash|does not work|doesn't work|button|cannot open|can't open|link is broken|page issue)\b/.test(lower)) category = 'bug';

  const technical = ['bug', 'integration'].includes(category) || /\b(server|api|deploy|railway|database|codex|code)\b/.test(lower);
  const severity = /\b(security|hacked|charged twice|blocking|urgent|down|crash|cannot login|can't login|cannot open|can't open)\b/.test(lower)
    ? 'blocking'
    : /\b(broken|bug|payment|wrong|failed|fails|error)\b/.test(lower) ? 'high' : 'normal';
  const groupChat = Boolean(context.group_chat || context.groupChat || /group/.test(String(context.chat_type || context.chatType || '')));
  const sensitive = ['billing', 'security'].includes(category) || /\b(private|password|charged|card|health|sensitive)\b/.test(lower);
  const owner = technical
    ? 'agent_work'
    : category === 'billing' ? 'admin_billing'
      : /provider|class|zoom|vimeo/.test(`${lower} ${route}`) ? 'provider_or_admin'
        : 'support';

  return {
    category,
    severity,
    technical_issue: technical,
    sensitive,
    private_reply_required: Boolean(sensitive && groupChat),
    route_to: owner,
    actor_role: actor.role || '',
    safe_help_available: true,
  };
}

function dedupeKey({ message = '', actor = {}, workspace = {}, envelope = {}, classification = {} } = {}) {
  const normalized = [
    workspace.workspace_key,
    workspace.project_key,
    actor.user_id || actor.id || actor.identity_key || '',
    classification.category || '',
    envelope.route || '',
    envelope.object_type || '',
    envelope.object_id || '',
    compact(message, 800).toLowerCase(),
    ...(envelope.file_refs || []).map((file) => file.fingerprint || file.file_id || file.filename || ''),
  ].join('|');
  return `problem_${sha1(normalized).slice(0, 16)}`;
}

function findDuplicateTicket({ dedupe_key = '', existing_tickets = [] } = {}) {
  if (!dedupe_key || !Array.isArray(existing_tickets)) return null;
  return existing_tickets.find((ticket) => {
    const metadata = ticket.metadata || ticket.source_context || {};
    const ticketKey = ticket.dedupe_key || metadata.dedupe_key || metadata.problem_dedupe_key || '';
    const status = normalizeKey(ticket.status || 'open');
    return ticketKey === dedupe_key && OPEN_STATUSES.has(status);
  }) || null;
}

function safeHelpForClassification(classification = {}) {
  if (classification.category === 'billing') {
    return [
      'Do not post payment details in a group chat.',
      'A staff member should review the account/payment record before any billing change.',
    ];
  }
  if (classification.category === 'security') {
    return [
      'Move this to a private support thread.',
      'Do not share passwords, access codes, or screenshots with private data.',
    ];
  }
  if (classification.category === 'integration') {
    return [
      'Try the latest official link or refresh the page once.',
      'The ticket should include route, device, file, and message context for reproduction.',
    ];
  }
  return [
    'The issue can be saved with route/device context for review.',
    'Existing tickets should be checked before creating duplicate work.',
  ];
}

function buildAgentWorkPackage({ message = '', classification = {}, envelope = {}, ticket = {} } = {}) {
  if (!classification.technical_issue) return null;
  return {
    action_id: 'route_bug_to_codex',
    status: 'planned_not_created',
    owner: 'Codex',
    title: compact(ticket.title || message || 'Technical issue for Agent Work', 220),
    source_ticket_id: ticket.ticket_id || ticket.id || null,
    route: envelope.route || '',
    severity: classification.severity,
    acceptance_criteria: [
      'Reproduce or inspect the affected route/object/context.',
      'Implement the smallest safe fix using the existing app architecture.',
      'Run focused tests and any relevant route/action/security checks.',
      'Deploy and live-smoke before marking the ticket resolved.',
      'Report progress and completion back through the originating channel.',
    ],
    source_context: envelope,
    external_write_performed: false,
    created: false,
  };
}

function planProblemResolution({
  message = '',
  actor = {},
  channel = 'website_assistant',
  context = {},
  files = [],
  existing_tickets = [],
} = {}) {
  const text = compact(message, 4000);
  if (!text) throw new Error('message is required');
  const workspace = workspaceFrom(actor, context);
  const policy = assertProblemPolicy({
    actor,
    channel: normalizeProblemChannel(channel),
    target: {
      ...workspace,
      child_id: context.child_id || context.student_id || context.studentId,
      parent_id: context.parent_id || context.parentId,
      provider_id: context.provider_id || context.providerId,
    },
    dry_run: true,
  });
  const envelope = sourceEnvelope({ actor, channel, context: { ...context, ...workspace }, files });
  const classification = classifyProblem({ message: text, context, actor });
  const key = dedupeKey({ message: text, actor, workspace, envelope, classification });
  const duplicate = findDuplicateTicket({ dedupe_key: key, existing_tickets });
  const title = compact(context.title || text.split(/[.!?]/).find(Boolean) || 'Support ticket', 180);
  const ticketInputs = {
    title,
    message: text,
    category: classification.category === 'bug' ? 'task_manager' : classification.category,
    severity: classification.severity,
    route: envelope.route || context.route || '',
    source_context: {
      requirement_id: PROBLEM_RESOLUTION_REQUIREMENT_ID,
      dedupe_key: key,
      source_envelope: envelope,
      classification,
      problem_resolution: {
        requirement_id: PROBLEM_RESOLUTION_REQUIREMENT_ID,
        dedupe_key: key,
        classification,
        agent_work_required: classification.technical_issue,
        private_reply_required: classification.private_reply_required,
      },
      private_reply_required: classification.private_reply_required,
      no_browser_click_substitution: true,
    },
  };
  const ticket = {
    action_id: 'create_ticket',
    status: duplicate ? 'duplicate_existing_ticket' : 'ready_to_create_or_update',
    dedupe_key: key,
    duplicate_ticket_id: duplicate?.id || null,
    inputs: ticketInputs,
  };
  const agentWork = buildAgentWorkPackage({ message: text, classification, envelope, ticket: { title, ticket_id: duplicate?.id || null } });
  return {
    requirement_id: PROBLEM_RESOLUTION_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    status: duplicate ? 'duplicate_found' : 'planned',
    channel_key: normalizeProblemChannel(channel),
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    actor_role: policy.role,
    source_envelope: envelope,
    classification,
    dedupe_key: key,
    duplicate_ticket: duplicate ? {
      ticket_id: duplicate.id || null,
      status: duplicate.status || '',
      title: duplicate.title || '',
    } : null,
    ticket,
    agent_work_package: agentWork,
    safe_help: safeHelpForClassification(classification),
    progress: {
      visible_status: duplicate ? 'Existing ticket matched.' : 'Ticket ready for review.',
      meaningful_updates_required: true,
      closure_requires_evidence_or_user_confirmation: true,
    },
    personal_pending_task_created: false,
    codex_task_created: false,
    external_write_performed: false,
    browser_click_substitution_allowed: false,
  };
}

function closeProblemTicketPlan({
  ticket_id = '',
  evidence = [],
  user_confirmed = false,
  resolution_note = '',
} = {}) {
  const hasEvidence = Array.isArray(evidence) && evidence.filter(Boolean).length > 0;
  const canClose = Boolean(ticket_id && (hasEvidence || user_confirmed));
  return {
    requirement_id: PROBLEM_RESOLUTION_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    ticket_id: ticket_id || null,
    can_close: canClose,
    status: canClose ? 'ready_to_close' : 'needs_evidence_or_user_confirmation',
    evidence,
    user_confirmed: Boolean(user_confirmed),
    resolution_note: compact(resolution_note, 1000),
  };
}

module.exports = {
  CONTRACT_VERSION,
  PROBLEM_RESOLUTION_REQUIREMENT_ID,
  assertProblemPolicy,
  classifyProblem,
  closeProblemTicketPlan,
  dedupeKey,
  findDuplicateTicket,
  planProblemResolution,
  sourceEnvelope,
};
