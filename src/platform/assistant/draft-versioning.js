const crypto = require('crypto');

const {
  actionPolicy,
  assertActionPolicy,
  normalizeChannel,
} = require('./control-plane');

const DRAFT_VERSIONING_REQUIREMENT_ID = 'REQ-20260623-015';

const DRAFT_OBJECT_CATEGORIES = Object.freeze({
  email: 'email_campaign',
  sms: 'template_version',
  whatsapp: 'template_version',
  telegram_message: 'template_version',
  announcement: 'announcement',
  landing_page_copy: 'landing_page',
  website_section: 'provider_website',
  chart_layout: 'dashboard_layout',
  worksheet: 'worksheet',
  course_outline: 'course',
  onboarding_script: 'template_version',
  automation: 'automation',
  support_macro: 'support',
});

const APPROVAL_STATES = Object.freeze([
  'draft',
  'needs_review',
  'approved',
  'rejected',
  'archived',
]);

const ACTIVE_STATES = Object.freeze([
  'inactive',
  'active',
  'superseded',
  'rolled_back',
]);

const USE_STATES = Object.freeze([
  'not_scheduled',
  'selected',
  'scheduled',
  'in_use',
  'paused',
  'archived',
]);

function compact(value = '', maxLength = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function shortHash(value = '') {
  return crypto.createHash('sha1').update(String(value || '')).digest('hex').slice(0, 12);
}

function stableKey(prefix, parts = []) {
  const cleanParts = parts.map((part) => normalizeKey(part)).filter(Boolean);
  const joined = cleanParts.join('_') || 'assistant';
  return `${normalizeKey(prefix)}_${joined}_${shortHash(`${prefix}:${JSON.stringify(parts)}`)}`;
}

function draftObjectCategory(objectType = '') {
  const key = normalizeKey(objectType);
  return DRAFT_OBJECT_CATEGORIES[key] || '';
}

function normalizeAudienceScope(audienceScope = {}) {
  if (!audienceScope || typeof audienceScope !== 'object' || Array.isArray(audienceScope)) return {};
  const scope = { ...audienceScope };
  if (scope.child_id !== undefined) scope.child_id = String(scope.child_id);
  if (scope.student_id !== undefined) scope.student_id = String(scope.student_id);
  if (scope.parent_id !== undefined) scope.parent_id = String(scope.parent_id);
  if (scope.provider_id !== undefined) scope.provider_id = String(scope.provider_id);
  return scope;
}

function workspaceFrom(actor = {}, explicit = {}) {
  return {
    workspace_key: explicit.workspace_key || explicit.workspaceKey || actor.workspace_key || actor.workspaceKey || actor.workspace_id || actor.workspace || 'bna',
    project_key: explicit.project_key || explicit.projectKey || actor.project_key || actor.projectKey || actor.project_id || actor.project || 'bna',
  };
}

function targetFromDraftInput(input = {}) {
  const audienceScope = normalizeAudienceScope(input.audience_scope || input.audienceScope || {});
  return {
    workspace_key: input.workspace_key || input.workspaceKey || input.actor?.workspace_key || input.actor?.workspace_id,
    project_key: input.project_key || input.projectKey || input.actor?.project_key,
    provider_id: input.provider_id || input.providerId || audienceScope.provider_id,
    child_id: input.child_id || input.childId || input.student_id || input.studentId || audienceScope.child_id || audienceScope.student_id,
    parent_id: input.parent_id || input.parentId || audienceScope.parent_id,
  };
}

function assertDraftPermission({ actor = {}, channel = 'website_assistant', object_type = '', operation = 'draft', target = {}, dry_run = true } = {}) {
  const category = draftObjectCategory(object_type);
  const policy = assertActionPolicy({
    actor,
    channel,
    action_category: category,
    operation,
    target,
    dry_run,
  });
  return {
    ...policy,
    object_type: normalizeKey(object_type),
    object_category: category,
  };
}

function validateDraftContent(content = {}) {
  const issues = [];
  const blockedKey = /^(custom_css|raw_css|css|style|script|javascript|raw_html|html|iframe|onerror|onload|onclick)$/i;
  const blockedString = /<\s*script\b|<\s*iframe\b|<\s*style\b|javascript\s*:|onerror\s*=|onload\s*=|onclick\s*=|expression\s*\(/i;

  function walk(value, path = 'content') {
    if (value === null || value === undefined) return;
    if (typeof value === 'string') {
      if (blockedString.test(value)) issues.push({ path, reason: 'raw_code_or_css_injection' });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (typeof value === 'object') {
      for (const [key, nested] of Object.entries(value)) {
        if (blockedKey.test(key)) issues.push({ path: `${path}.${key}`, reason: 'raw_code_or_css_field' });
        walk(nested, `${path}.${key}`);
      }
    }
  }

  walk(content);
  return {
    valid: issues.length === 0,
    issues,
  };
}

function ensureValidDraftContent(content = {}) {
  const validation = validateDraftContent(content);
  if (validation.valid) return validation;
  const error = new Error('draft_content_rejected');
  error.validation = validation;
  throw error;
}

function normalizeDraftState(value = '', allowed = APPROVAL_STATES, fallback = 'draft') {
  const key = normalizeKey(value);
  return allowed.includes(key) ? key : fallback;
}

function createDraft({
  object_type = '',
  object_id = '',
  conversation_key = '',
  channel = 'website_assistant',
  actor = {},
  audience_scope = {},
  workspace_key = '',
  project_key = '',
  approval_state = 'draft',
  use_state = 'not_scheduled',
  metadata = {},
} = {}) {
  const canonicalObjectType = normalizeKey(object_type);
  const category = draftObjectCategory(canonicalObjectType);
  if (!category) throw new Error(`unsupported_draft_object_type: ${object_type}`);
  const scope = workspaceFrom(actor, { workspace_key, project_key });
  const audienceScope = normalizeAudienceScope(audience_scope);
  const policy = assertDraftPermission({
    actor,
    channel,
    object_type: canonicalObjectType,
    operation: 'draft',
    target: {
      ...scope,
      ...targetFromDraftInput({ audience_scope: audienceScope }),
    },
  });
  const draftKey = stableKey('draft', [
    scope.workspace_key,
    scope.project_key,
    canonicalObjectType,
    object_id || conversation_key || actor.user_id || actor.id || 'new',
  ]);
  return {
    requirement_id: DRAFT_VERSIONING_REQUIREMENT_ID,
    draft_key: draftKey,
    object_type: canonicalObjectType,
    object_category: category,
    object_id: object_id ? String(object_id) : '',
    conversation_key: conversation_key || '',
    channel_key: normalizeChannel(channel),
    audience_scope: audienceScope,
    workspace_key: scope.workspace_key,
    project_key: scope.project_key,
    active_version_key: '',
    approval_state: normalizeDraftState(approval_state, APPROVAL_STATES, 'draft'),
    use_state: normalizeDraftState(use_state, USE_STATES, 'not_scheduled'),
    metadata: {
      ...metadata,
      actor_role: policy.role,
      policy_scope: policy.scope,
      typed_action_required: true,
    },
  };
}

function createDraftVersion({
  draft,
  actor = {},
  channel = '',
  parent_version_key = '',
  content = {},
  prompt_instruction = '',
  change_summary = '',
  approval_state = 'draft',
  active_state = 'inactive',
  scheduled_use_state = 'not_scheduled',
  rollback_to_version_key = '',
  created_at = new Date().toISOString(),
  version_number = '',
} = {}) {
  if (!draft?.draft_key) throw new Error('draft is required');
  ensureValidDraftContent(content);
  assertDraftPermission({
    actor,
    channel: channel || draft.channel_key,
    object_type: draft.object_type,
    operation: 'version',
    target: {
      workspace_key: draft.workspace_key,
      project_key: draft.project_key,
      ...draft.audience_scope,
    },
  });
  const versionKey = stableKey('version', [
    draft.draft_key,
    parent_version_key || 'root',
    version_number || created_at,
    compact(change_summary || prompt_instruction || 'version', 120),
  ]);
  return {
    requirement_id: DRAFT_VERSIONING_REQUIREMENT_ID,
    version_key: versionKey,
    draft_key: draft.draft_key,
    object_type: draft.object_type,
    object_id: draft.object_id || '',
    parent_version_key: parent_version_key || '',
    editor_identity_key: String(actor.identity_key || actor.user_id || actor.id || ''),
    channel_key: normalizeChannel(channel || draft.channel_key),
    audience_scope: normalizeAudienceScope(draft.audience_scope),
    prompt_instruction: compact(prompt_instruction, 1000),
    content,
    change_summary: compact(change_summary, 500),
    approval_state: normalizeDraftState(approval_state, APPROVAL_STATES, 'draft'),
    active_state: normalizeDraftState(active_state, ACTIVE_STATES, 'inactive'),
    scheduled_use_state: normalizeDraftState(scheduled_use_state, USE_STATES, 'not_scheduled'),
    rollback_to_version_key: rollback_to_version_key || '',
    created_at,
  };
}

function createTemplate({
  template_type = '',
  name = '',
  actor = {},
  channel = 'website_assistant',
  audience_scope = {},
  workspace_key = '',
  project_key = '',
  content = {},
  version_key = '',
  status = 'draft',
  metadata = {},
} = {}) {
  const canonicalType = normalizeKey(template_type);
  if (!draftObjectCategory(canonicalType)) throw new Error(`unsupported_template_type: ${template_type}`);
  ensureValidDraftContent(content);
  const scope = workspaceFrom(actor, { workspace_key, project_key });
  const audienceScope = normalizeAudienceScope(audience_scope);
  assertDraftPermission({
    actor,
    channel,
    object_type: canonicalType,
    operation: 'template',
    target: {
      ...scope,
      ...targetFromDraftInput({ audience_scope: audienceScope }),
    },
  });
  return {
    requirement_id: DRAFT_VERSIONING_REQUIREMENT_ID,
    template_key: stableKey('template', [scope.workspace_key, scope.project_key, canonicalType, name]),
    template_type: canonicalType,
    name: compact(name || canonicalType.replace(/_/g, ' '), 160),
    channel_key: normalizeChannel(channel),
    audience_scope: audienceScope,
    workspace_key: scope.workspace_key,
    project_key: scope.project_key,
    content,
    version_key: version_key || '',
    status: normalizeDraftState(status, [...APPROVAL_STATES, 'active'], 'draft'),
    metadata,
  };
}

function createPreview({
  draft,
  version,
  preview_type = '',
  actor = {},
  channel = '',
  audience_scope = {},
  payload = {},
  blockers = [],
  real_data = false,
  sample_data = true,
  external_action = false,
  status = '',
  created_at = new Date().toISOString(),
} = {}) {
  if (!draft?.draft_key) throw new Error('draft is required');
  if (!version?.version_key) throw new Error('version is required');
  ensureValidDraftContent(payload);
  assertDraftPermission({
    actor,
    channel: channel || version.channel_key || draft.channel_key,
    object_type: draft.object_type,
    operation: external_action ? 'send' : 'preview',
    target: {
      workspace_key: draft.workspace_key,
      project_key: draft.project_key,
      ...draft.audience_scope,
      ...normalizeAudienceScope(audience_scope),
    },
    dry_run: true,
  });
  const normalizedBlockers = Array.isArray(blockers) ? blockers.filter(Boolean).map((item) => compact(item, 240)) : [];
  return {
    requirement_id: DRAFT_VERSIONING_REQUIREMENT_ID,
    preview_key: stableKey('preview', [draft.draft_key, version.version_key, preview_type || draft.object_type]),
    conversation_key: draft.conversation_key || '',
    plan_key: '',
    draft_version_key: version.version_key,
    preview_type: normalizeKey(preview_type || draft.object_type),
    audience_scope: {
      ...normalizeAudienceScope(draft.audience_scope),
      ...normalizeAudienceScope(audience_scope),
    },
    workspace_key: draft.workspace_key,
    project_key: draft.project_key,
    real_data: Boolean(real_data),
    sample_data: Boolean(sample_data),
    payload,
    blockers: normalizedBlockers,
    external_action: Boolean(external_action),
    status: normalizeDraftState(status || (normalizedBlockers.length ? 'draft' : 'ready'), ['draft', 'ready', 'approved', 'applied', 'expired', 'archived'], 'draft'),
    created_at,
  };
}

function activateDraftVersion({ draft, version, versions = [], use_state = 'selected' } = {}) {
  if (!draft?.draft_key) throw new Error('draft is required');
  if (!version?.version_key) throw new Error('version is required');
  if (version.draft_key !== draft.draft_key) throw new Error('version_draft_mismatch');
  const normalizedUseState = normalizeDraftState(use_state, USE_STATES, 'selected');
  return {
    draft: {
      ...draft,
      active_version_key: version.version_key,
      approval_state: version.approval_state,
      use_state: normalizedUseState,
    },
    versions: [version, ...versions.filter((item) => item.version_key !== version.version_key)].map((item) => ({
      ...item,
      active_state: item.version_key === version.version_key ? 'active' : item.active_state === 'active' ? 'superseded' : item.active_state,
      scheduled_use_state: item.version_key === version.version_key ? normalizedUseState : item.scheduled_use_state,
    })),
  };
}

function rollbackDraftToVersion({ draft, target_version, actor = {}, channel = '', reason = '', created_at = new Date().toISOString() } = {}) {
  if (!draft?.draft_key) throw new Error('draft is required');
  if (!target_version?.version_key) throw new Error('target_version is required');
  if (target_version.draft_key !== draft.draft_key) throw new Error('version_draft_mismatch');
  const rollbackVersion = createDraftVersion({
    draft,
    actor,
    channel: channel || target_version.channel_key || draft.channel_key,
    parent_version_key: draft.active_version_key || '',
    content: target_version.content,
    prompt_instruction: `Rollback to ${target_version.version_key}`,
    change_summary: reason || `Rolled back to ${target_version.version_key}`,
    approval_state: target_version.approval_state,
    active_state: 'active',
    scheduled_use_state: 'selected',
    rollback_to_version_key: target_version.version_key,
    created_at,
  });
  return activateDraftVersion({ draft, version: rollbackVersion, versions: [target_version], use_state: 'selected' });
}

function compareDraftVersions(left = {}, right = {}) {
  const leftContent = left.content || {};
  const rightContent = right.content || {};
  const keys = new Set([...Object.keys(leftContent), ...Object.keys(rightContent)]);
  const changed_fields = [];
  for (const key of keys) {
    if (JSON.stringify(leftContent[key]) !== JSON.stringify(rightContent[key])) changed_fields.push(key);
  }
  return {
    left_version_key: left.version_key || '',
    right_version_key: right.version_key || '',
    same_draft: Boolean(left.draft_key && left.draft_key === right.draft_key),
    changed_fields,
    unchanged: changed_fields.length === 0,
  };
}

function versioningClarification({ draft = {}, current_version = {}, requested_audience_scope = {}, operation = 'save' } = {}) {
  const questions = [];
  const requestedAudience = normalizeAudienceScope(requested_audience_scope);
  const currentAudience = normalizeAudienceScope(current_version.audience_scope || draft.audience_scope || {});
  const audienceChanged = JSON.stringify(requestedAudience) !== '{}' && JSON.stringify(requestedAudience) !== JSON.stringify(currentAudience);
  if (draft.active_version_key && ['save', 'apply'].includes(normalizeKey(operation))) {
    questions.push('Save this as a new version or replace the current draft?');
  }
  if (audienceChanged) {
    questions.push('Apply this only to the requested audience or make it the default?');
  }
  return {
    needs_question: questions.length > 0,
    questions,
  };
}

module.exports = {
  ACTIVE_STATES,
  APPROVAL_STATES,
  DRAFT_OBJECT_CATEGORIES,
  DRAFT_VERSIONING_REQUIREMENT_ID,
  USE_STATES,
  actionPolicy,
  activateDraftVersion,
  assertDraftPermission,
  compareDraftVersions,
  createDraft,
  createDraftVersion,
  createPreview,
  createTemplate,
  draftObjectCategory,
  rollbackDraftToVersion,
  validateDraftContent,
  versioningClarification,
};
