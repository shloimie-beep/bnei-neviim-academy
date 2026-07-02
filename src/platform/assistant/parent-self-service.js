const crypto = require('crypto');

const {
  actorWorkspaceScope,
  assertActionPolicy,
  normalizeChannel,
} = require('./control-plane');
const {
  createDraft,
  createDraftVersion,
  createPreview,
} = require('./draft-versioning');
const {
  CHART_TEMPLATES,
  applyChartDashboardPatch,
  buildChartDashboardConfiguration,
} = require('./chart-dashboard-config');

const PARENT_SELF_SERVICE_REQUIREMENT_ID = 'REQ-20260623-018';
const CONTRACT_VERSION = 'assistant-parent-self-service-v1';

const PARENT_CAPABILITIES = Object.freeze([
  'view_official_data',
  'configure_display',
  'submit_allowed_update',
  'request_correction',
  'ask_question',
  'create_ticket',
  'set_reminder',
  'manage_communication_preferences',
  'view_payment_access',
]);

const PARENT_CHART_TEMPLATES = Object.freeze(Object.entries(CHART_TEMPLATES)
  .filter(([, template]) => template.role_scopes.includes('parent'))
  .map(([key]) => key));

const DEFAULT_TEMPLATE_SECTIONS = Object.freeze({
  parent_weekly_summary: Object.freeze(['attendance', 'progress', 'course_completion', 'milestones']),
  attendance_first: Object.freeze(['attendance', 'progress', 'course_completion', 'milestones']),
  progress_first: Object.freeze(['progress', 'attendance', 'course_completion', 'milestones']),
  course_completion: Object.freeze(['course_completion', 'progress', 'attendance', 'worksheets']),
  milestones_achievements: Object.freeze(['milestones', 'achievements', 'progress', 'attendance']),
  grandparent_summary: Object.freeze(['attendance', 'milestones', 'course_completion']),
});

const PARENT_VISIBLE_SECTIONS = Object.freeze([
  'attendance',
  'progress',
  'course_completion',
  'milestones',
  'achievements',
  'worksheets',
  'questions',
  'reminders',
  'home_practice',
  'parent_notes',
]);

const PARENT_VISIBLE_METRICS = Object.freeze([
  'attendance',
  'progress',
  'course_completion',
  'milestones',
  'achievements',
  'worksheet_completion',
  'home_practice',
  'parent_notes',
]);

const BLOCKED_PARENT_FIELDS = Object.freeze([
  'admin_notes',
  'provider_private_notes',
  'rabbi_notes',
  'internal_notes',
  'official_attendance',
  'official_score',
  'school_score',
  'provider_score',
  'grade',
  'payment_status',
  'billing_status',
  'other_child_records',
]);

const ALLOWED_PARENT_UPDATE_TYPES = Object.freeze([
  'home_practice',
  'parent_note',
  'question',
  'support_request',
  'communication_preference',
]);

const OFFICIAL_RECORD_UPDATE_TYPES = Object.freeze([
  'attendance',
  'official_attendance',
  'official_score',
  'school_score',
  'provider_score',
  'grade',
  'progress_score',
  'payment_status',
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

function stableHash(value = '') {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 16);
}

function uniqueKeys(values = [], allowed = []) {
  const allowedSet = new Set(allowed);
  const seen = new Set();
  const result = [];
  for (const raw of Array.isArray(values) ? values : []) {
    const key = normalizeKey(raw);
    if (!key || seen.has(key)) continue;
    if (allowedSet.size && !allowedSet.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result;
}

function blockedKeys(values = []) {
  const blocked = new Set(BLOCKED_PARENT_FIELDS);
  return (Array.isArray(values) ? values : Object.keys(values || {}))
    .map((value) => normalizeKey(value))
    .filter((key) => blocked.has(key));
}

function ensureNoBlockedParentFields(values = [], context = 'parent_view') {
  const blocked = blockedKeys(values);
  if (!blocked.length) return;
  const error = new Error(`parent_field_denied:${context}:${blocked.join(',')}`);
  error.blocked_fields = blocked;
  throw error;
}

function normalizeTemplate(template = '') {
  const key = normalizeKey(template, 'parent_weekly_summary');
  return PARENT_CHART_TEMPLATES.includes(key) ? key : 'parent_weekly_summary';
}

function normalizeSections({ template = 'parent_weekly_summary', sections = [] } = {}) {
  ensureNoBlockedParentFields(sections, 'sections');
  const explicit = uniqueKeys(sections, PARENT_VISIBLE_SECTIONS);
  return explicit.length ? explicit : [...DEFAULT_TEMPLATE_SECTIONS[normalizeTemplate(template)]];
}

function normalizeMetricVisibility(metricVisibility = {}) {
  ensureNoBlockedParentFields(metricVisibility, 'metric_visibility');
  const result = {};
  for (const metric of PARENT_VISIBLE_METRICS) {
    if (Object.prototype.hasOwnProperty.call(metricVisibility || {}, metric)) {
      result[metric] = Boolean(metricVisibility[metric]);
    }
  }
  return result;
}

function normalizeDateRange(dateRange = {}) {
  const range = typeof dateRange === 'string' ? { preset: dateRange } : { ...(dateRange || {}) };
  return {
    preset: normalizeKey(range.preset || range.view || 'last_30_days', 'last_30_days'),
    start: compact(range.start || range.from || '', 40),
    end: compact(range.end || range.to || '', 40),
    timezone: compact(range.timezone || range.time_zone || 'Asia/Jerusalem', 80),
  };
}

function normalizeDisplayPreferences(displayPreferences = {}) {
  const prefs = { ...(displayPreferences || {}) };
  ensureNoBlockedParentFields(Object.keys(prefs), 'display_preferences');
  return {
    chart_type: normalizeKey(prefs.chart_type || prefs.chartType || 'bars', 'bars'),
    density: normalizeKey(prefs.density || 'comfortable', 'comfortable'),
    accessible_summary: prefs.accessible_summary !== false,
    mobile_first: prefs.mobile_first !== false,
  };
}

function parentScopeTarget({ actor = {}, child_id = '', parent_id = '', workspace_key = '', project_key = '' } = {}) {
  const scope = actorWorkspaceScope(actor);
  const childId = String(child_id || '').trim();
  const parentId = String(parent_id || actor.parent_id || actor.parentId || '').trim();
  if (scope.role !== 'parent') throw new Error('parent_actor_required');
  if (!childId) throw new Error('child_id_required');
  if (!scope.linked_child_ids || scope.linked_child_ids.size === 0) throw new Error('linked_child_relationship_required');
  return {
    workspace_key: workspace_key || scope.workspace_key || 'bna',
    project_key: project_key || scope.project_key || 'bna',
    child_id: childId,
    parent_id: parentId,
  };
}

function assertParentChildScope({
  actor = {},
  channel = 'parent_portal_assistant',
  action_category = 'dashboard_layout',
  operation = 'preview',
  child_id = '',
  parent_id = '',
  workspace_key = '',
  project_key = '',
} = {}) {
  const target = parentScopeTarget({ actor, child_id, parent_id, workspace_key, project_key });
  const policy = assertActionPolicy({
    actor,
    channel,
    action_category,
    operation,
    target,
    dry_run: true,
  });
  return {
    ...policy,
    target,
  };
}

function buildLayoutContent({
  actor = {},
  channel = 'parent_portal_assistant',
  layout_name = '',
  template = 'parent_weekly_summary',
  child_id = '',
  parent_id = '',
  sections = [],
  date_range = {},
  metric_visibility = {},
  display_preferences = {},
  workspace_key = 'bna',
  project_key = 'bna',
} = {}) {
  return buildChartDashboardConfiguration({
    actor,
    channel,
    role_scope: 'parent',
    layout_name,
    template,
    sections,
    metric_visibility,
    date_range,
    display_preferences,
    student_scope: { child_id, parent_id },
    workspace_key,
    project_key,
    approval_state: 'draft',
    version_number: 1,
  });
}

function createParentChartLayout({
  actor = {},
  channel = 'parent_portal_assistant',
  conversation_key = '',
  child_id = '',
  parent_id = '',
  layout_name = 'My Weekly View',
  template = 'parent_weekly_summary',
  sections = [],
  date_range = {},
  metric_visibility = {},
  display_preferences = {},
  workspace_key = '',
  project_key = '',
  real_data = false,
  sample_data = true,
  created_at = new Date().toISOString(),
} = {}) {
  const policy = assertParentChildScope({
    actor,
    channel,
    action_category: 'dashboard_layout',
    operation: 'preview',
    child_id,
    parent_id,
    workspace_key,
    project_key,
  });
  const target = policy.target;
  const draft = createDraft({
    object_type: 'chart_layout',
    object_id: `parent-layout-${target.child_id}-${normalizeKey(layout_name || template)}`,
    conversation_key,
    channel,
    actor,
    audience_scope: { child_id: target.child_id, parent_id: target.parent_id },
    workspace_key: target.workspace_key,
    project_key: target.project_key,
    metadata: {
      parent_self_service: true,
      requirement_id: PARENT_SELF_SERVICE_REQUIREMENT_ID,
    },
  });
  const content = buildLayoutContent({
    actor,
    channel,
    layout_name,
    template,
    child_id: target.child_id,
    parent_id: target.parent_id,
    sections,
    date_range,
    metric_visibility,
    display_preferences,
    workspace_key: target.workspace_key,
    project_key: target.project_key,
  });
  const version = createDraftVersion({
    draft,
    actor,
    channel,
    content,
    prompt_instruction: 'Configure a parent-visible chart layout by natural language.',
    change_summary: 'Parent chart layout configured.',
    approval_state: 'draft',
    active_state: 'inactive',
    scheduled_use_state: 'not_scheduled',
    created_at,
    version_number: 1,
  });
  const preview = createPreview({
    draft,
    version,
    actor,
    channel,
    preview_type: 'parent_chart_layout',
    payload: {
      renderer: channel === 'telegram' ? 'telegram_snapshot_and_secure_deep_link' : 'interactive_parent_chart_preview',
      layout_name: content.dashboard_layout.name,
      template: content.chart_template,
      sections: content.dashboard_layout.sections,
      date_range: content.date_range,
      metric_visibility: content.metric_visibility,
      display_preferences: content.display_preferences,
      official_data_mutated: false,
      underlying_record_change_allowed: false,
    },
    real_data,
    sample_data,
    external_action: false,
    status: 'ready',
  });
  return {
    requirement_id: PARENT_SELF_SERVICE_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    capability: 'configure_display',
    channel_key: normalizeChannel(channel),
    policy,
    draft,
    version,
    preview,
    official_data_mutated: false,
    underlying_record_change_allowed: false,
    audit_event: 'parent_chart_layout_previewed',
  };
}

function patchParentChartLayout({
  current = {},
  actor = {},
  channel = '',
  child_id = '',
  parent_id = '',
  changes = {},
  created_at = new Date().toISOString(),
  version_number = '',
} = {}) {
  const draft = current.draft || {};
  const previousVersion = current.version || current.current_version || {};
  if (!draft.draft_key || !previousVersion.version_key) throw new Error('current_layout_required');
  const targetChildId = child_id || draft.audience_scope?.child_id;
  const targetParentId = parent_id || draft.audience_scope?.parent_id;
  const policy = assertParentChildScope({
    actor,
    channel: channel || draft.channel_key,
    action_category: 'dashboard_layout',
    operation: 'version',
    child_id: targetChildId,
    parent_id: targetParentId,
    workspace_key: draft.workspace_key,
    project_key: draft.project_key,
  });
  const previousContent = previousVersion.content || {};
  const content = applyChartDashboardPatch({
    current_config: previousContent,
    actor,
    channel: channel || draft.channel_key,
    changes,
    patch: {
      saved_view_name: changes.layout_name || '',
      sections: changes.sections || [],
      template: changes.template || '',
      metric_visibility: changes.metric_visibility || {},
      date_range: changes.date_range || {},
      display_preferences: changes.display_preferences || {},
    },
    version_number,
  });
  const version = createDraftVersion({
    draft,
    actor,
    channel: channel || draft.channel_key,
    parent_version_key: previousVersion.version_key,
    content,
    prompt_instruction: compact(changes.prompt_instruction || 'Update parent chart layout by natural language.', 1000),
    change_summary: compact(changes.change_summary || 'Parent chart layout updated.', 500),
    approval_state: 'draft',
    created_at,
    version_number,
  });
  const preview = createPreview({
    draft,
    version,
    actor,
    channel: channel || draft.channel_key,
    preview_type: 'parent_chart_layout',
    payload: {
      renderer: normalizeChannel(channel || draft.channel_key) === 'telegram' ? 'telegram_snapshot_and_secure_deep_link' : 'interactive_parent_chart_preview',
      layout_name: content.dashboard_layout?.name || '',
      template: content.chart_template,
      sections: content.dashboard_layout?.sections || [],
      date_range: content.date_range || {},
      metric_visibility: content.metric_visibility || {},
      display_preferences: content.display_preferences || {},
      official_data_mutated: false,
      underlying_record_change_allowed: false,
    },
    real_data: Boolean(changes.real_data),
    sample_data: changes.sample_data !== false,
    external_action: false,
    status: 'ready',
  });
  return {
    requirement_id: PARENT_SELF_SERVICE_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    capability: 'configure_display',
    policy,
    draft,
    version,
    preview,
    official_data_mutated: false,
    underlying_record_change_allowed: false,
  };
}

function planParentAllowedUpdate({
  actor = {},
  channel = 'parent_portal_assistant',
  child_id = '',
  parent_id = '',
  update_type = 'parent_note',
  note = '',
  date = '',
  evidence = [],
  workspace_key = '',
  project_key = '',
  created_at = new Date().toISOString(),
} = {}) {
  const updateType = normalizeKey(update_type, 'parent_note');
  const policy = assertParentChildScope({
    actor,
    channel,
    action_category: 'support',
    operation: 'submit',
    child_id,
    parent_id,
    workspace_key,
    project_key,
  });
  const officialRecordChangeRequested = OFFICIAL_RECORD_UPDATE_TYPES.includes(updateType);
  const allowed = ALLOWED_PARENT_UPDATE_TYPES.includes(updateType);
  return {
    requirement_id: PARENT_SELF_SERVICE_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    capability: officialRecordChangeRequested ? 'request_correction' : 'submit_allowed_update',
    action_id: officialRecordChangeRequested ? 'request_parent_record_correction_review' : 'submit_parent_visible_update_review',
    action_category: officialRecordChangeRequested ? 'ticket' : 'support',
    status: officialRecordChangeRequested || !allowed ? 'needs_review' : 'queued_for_review',
    actor_role: policy.role,
    channel_key: normalizeChannel(channel),
    workspace_key: policy.target.workspace_key,
    project_key: policy.target.project_key,
    child_id: policy.target.child_id,
    parent_id: policy.target.parent_id,
    update_type: updateType,
    note: compact(note, 1200),
    date: compact(date, 80),
    evidence: Array.isArray(evidence) ? evidence.map((item) => compact(item, 240)).filter(Boolean) : [],
    parent_visible: true,
    official_data_mutated: false,
    underlying_record_change_allowed: false,
    review_required: true,
    blocked_reason: officialRecordChangeRequested ? 'official_record_changes_require_review' : allowed ? '' : 'unsupported_parent_update_type',
    audit_event: officialRecordChangeRequested ? 'parent_record_correction_requested' : 'parent_update_submitted_for_review',
    created_at,
  };
}

function submitHomePracticeUpdate(input = {}) {
  return planParentAllowedUpdate({
    ...input,
    update_type: 'home_practice',
  });
}

function requestOfficialCorrection(input = {}) {
  return planParentAllowedUpdate({
    ...input,
    update_type: input.field || input.update_type || 'official_score',
  });
}

function createParentSupportTicketPlan({
  actor = {},
  channel = 'parent_portal_assistant',
  child_id = '',
  parent_id = '',
  message = '',
  route = '',
  category = '',
  page_context = {},
  source_metadata = {},
  workspace_key = '',
  project_key = '',
  created_at = new Date().toISOString(),
} = {}) {
  const policy = assertParentChildScope({
    actor,
    channel,
    action_category: 'ticket',
    operation: 'create',
    child_id,
    parent_id,
    workspace_key,
    project_key,
  });
  const body = compact(message, 1600);
  const inferredCategory = normalizeKey(category || (/\b(payment|billing|charged|invoice)\b/i.test(body) ? 'billing' : /\b(broken|bug|error|does not work|doesn.t work|zoom|link)\b/i.test(body) ? 'bug' : 'support'), 'support');
  const sensitive = inferredCategory === 'billing' || /\b(security|password|charged|credit card|card|private)\b/i.test(body);
  const groupChat = Boolean(source_metadata.chat_type === 'group' || source_metadata.is_group_chat);
  return {
    requirement_id: PARENT_SELF_SERVICE_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    capability: 'create_ticket',
    action_id: 'create_ticket',
    status: 'planned',
    channel_key: normalizeChannel(channel),
    workspace_key: policy.target.workspace_key,
    project_key: policy.target.project_key,
    child_id: policy.target.child_id,
    parent_id: policy.target.parent_id,
    title: compact(body.split(/[.!?\r\n]/).find(Boolean) || 'Parent support ticket', 180),
    message: body,
    category: inferredCategory,
    route: compact(route || 'parent_support', 120),
    page_context: { ...(page_context || {}) },
    duplicate_search_required: true,
    codex_task_created: false,
    official_data_mutated: false,
    delivery_restrictions: {
      private_reply_required: sensitive || groupChat,
      public_group_summary_allowed: !(sensitive || groupChat),
      reason: sensitive ? 'sensitive_parent_ticket' : groupChat ? 'group_chat_context' : '',
    },
    audit_event: 'parent_ticket_planned',
    idempotency_key: `parent_ticket_${stableHash(`${policy.target.child_id}:${body}:${route}`)}`,
    created_at,
  };
}

function setParentReminderPlan({
  actor = {},
  channel = 'parent_portal_assistant',
  child_id = '',
  parent_id = '',
  reminder_text = '',
  trigger = '',
  timezone = 'Asia/Jerusalem',
  recurrence = '',
  delivery_channels = [],
  workspace_key = '',
  project_key = '',
  created_at = new Date().toISOString(),
} = {}) {
  const policy = assertParentChildScope({
    actor,
    channel,
    action_category: 'reminder',
    operation: 'schedule',
    child_id,
    parent_id,
    workspace_key,
    project_key,
  });
  const canonicalChannel = normalizeChannel(channel);
  const defaultDeliveryChannel = canonicalChannel === 'telegram' ? 'telegram' : 'in_app';
  return {
    requirement_id: PARENT_SELF_SERVICE_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    capability: 'set_reminder',
    action_id: 'create_parent_reminder',
    status: 'planned',
    channel_key: canonicalChannel,
    workspace_key: policy.target.workspace_key,
    project_key: policy.target.project_key,
    child_id: policy.target.child_id,
    parent_id: policy.target.parent_id,
    reminder_text: compact(reminder_text || 'Class reminder', 500),
    trigger: compact(trigger, 160),
    timezone: compact(timezone || 'Asia/Jerusalem', 80),
    recurrence: normalizeKey(recurrence || 'none', 'none'),
    delivery_channels: uniqueKeys(delivery_channels.length ? delivery_channels : [defaultDeliveryChannel], [
      'telegram',
      'website_assistant',
      'in_app',
      'email',
      'sms',
      'whatsapp',
    ]),
    consent_checked: true,
    quiet_hours_policy_required: true,
    dedupe_required: true,
    external_action: false,
    official_data_mutated: false,
    audit_event: 'parent_reminder_planned',
    idempotency_key: `parent_reminder_${stableHash(`${policy.target.child_id}:${reminder_text}:${trigger}:${recurrence}`)}`,
    created_at,
  };
}

function buildParentAssistantContext({
  actor = {},
  channel = 'parent_portal_assistant',
  selected_child_id = '',
  active_layout_key = '',
  pending_preview_key = '',
  pending_approval_key = '',
} = {}) {
  const scope = actorWorkspaceScope(actor);
  if (scope.role !== 'parent') throw new Error('parent_actor_required');
  const linkedChildIds = [...(scope.linked_child_ids || new Set())];
  const selectedChildId = String(selected_child_id || linkedChildIds[0] || '');
  if (selectedChildId && !linkedChildIds.includes(selectedChildId)) {
    const error = new Error('relationship_scope_mismatch');
    error.child_id = selectedChildId;
    throw error;
  }
  return {
    requirement_id: PARENT_SELF_SERVICE_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    channel_key: normalizeChannel(channel),
    role_scope: 'parent',
    workspace_key: scope.workspace_key,
    project_key: scope.project_key,
    parent_id: scope.parent_id,
    linked_child_ids: linkedChildIds,
    selected_child_id: selectedChildId,
    capabilities: [...PARENT_CAPABILITIES],
    active_layout_key: active_layout_key || '',
    pending_preview_key: pending_preview_key || '',
    pending_approval_key: pending_approval_key || '',
    admin_private_notes_visible: false,
    other_child_records_visible: false,
  };
}

module.exports = {
  ALLOWED_PARENT_UPDATE_TYPES,
  BLOCKED_PARENT_FIELDS,
  CONTRACT_VERSION,
  PARENT_CAPABILITIES,
  PARENT_CHART_TEMPLATES,
  PARENT_SELF_SERVICE_REQUIREMENT_ID,
  PARENT_VISIBLE_METRICS,
  PARENT_VISIBLE_SECTIONS,
  assertParentChildScope,
  buildParentAssistantContext,
  createParentChartLayout,
  createParentSupportTicketPlan,
  patchParentChartLayout,
  planParentAllowedUpdate,
  requestOfficialCorrection,
  setParentReminderPlan,
  submitHomePracticeUpdate,
};
