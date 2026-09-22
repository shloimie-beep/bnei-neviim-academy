const {
  assertActionPolicy,
  normalizeChannel,
} = require('./control-plane');
const {
  createDraft,
  createDraftVersion,
  createPreview,
} = require('./draft-versioning');

const AUTOMATION_BUILDER_REQUIREMENT_ID = 'REQ-20260623-021';
const CONTRACT_VERSION = 'assistant-automation-builder-v1';

const ALLOWED_TRIGGERS = Object.freeze([
  'parent_signup',
  'payment_incomplete',
  'payment_succeeded',
  'email_bounced',
  'class_reminder_time',
  'attendance_threshold',
  'provider_listing_approved',
  'file_uploaded',
  'ticket_created',
  'manual_review',
]);

const ALLOWED_CONDITIONS = Object.freeze([
  'contact_consent_confirmed',
  'payment_status_pending',
  'payment_status_succeeded',
  'email_delivery_bounced',
  'attendance_below_threshold',
  'provider_scope_matches',
  'workspace_scope_matches',
  'human_approval_received',
]);

const ALLOWED_ACTIONS = Object.freeze([
  'send_template_message',
  'send_reminder',
  'send_class_link',
  'enroll_student',
  'create_follow_up_task',
  'create_ticket',
  'notify_actor',
  'pause_sequence',
  'create_agent_work',
  'add_contact_note',
]);

const ALLOWED_STEP_TYPES = new Set(['trigger', 'condition', 'delay', 'action', 'branch']);

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

function assertAutomationPolicy({
  actor = {},
  channel = 'operations_helper',
  operation = 'preview',
  workspace_key = '',
  project_key = '',
  dry_run = true,
} = {}) {
  const workspace = workspaceFrom(actor, { workspace_key, project_key });
  const policy = assertActionPolicy({
    actor,
    channel,
    action_category: 'automation',
    operation,
    target: workspace,
    dry_run,
  });
  return {
    ...policy,
    workspace,
  };
}

function containsBlockedCode(value) {
  const blockedKey = /^(custom_css|raw_css|css|style|script|javascript|raw_html|html|iframe|onerror|onload|onclick|eval|function_body|code)$/i;
  const blockedString = /<\s*script\b|<\s*iframe\b|<\s*style\b|javascript\s*:|onerror\s*=|onload\s*=|onclick\s*=|expression\s*\(|\beval\s*\(|\bfunction\s*\(|=>\s*\{/i;
  const issues = [];

  function walk(item, path = 'definition') {
    if (item === null || item === undefined) return;
    if (typeof item === 'string') {
      if (blockedString.test(item)) issues.push({ path, reason: 'raw_code_or_css_injection' });
      return;
    }
    if (Array.isArray(item)) {
      item.forEach((child, index) => walk(child, `${path}[${index}]`));
      return;
    }
    if (typeof item === 'object') {
      for (const [key, child] of Object.entries(item)) {
        if (blockedKey.test(key)) issues.push({ path: `${path}.${key}`, reason: 'raw_code_or_css_field' });
        walk(child, `${path}.${key}`);
      }
    }
  }

  walk(value);
  return issues;
}

function detectDelay(text = '') {
  const lower = String(text || '').toLowerCase();
  const explicit = lower.match(/\b(\d+)\s*(minute|minutes|hour|hours|day|days)\b/);
  if (explicit) return `${explicit[1]} ${explicit[2].replace(/s$/, '')}${Number(explicit[1]) === 1 ? '' : 's'}`;
  if (/\btomorrow\b/.test(lower)) return '1 day';
  if (/\bnext week\b/.test(lower)) return '7 days';
  return '24 hours';
}

function step(step_id, type, values = {}) {
  return {
    step_id,
    type,
    ...values,
  };
}

function actionStep(step_id, action_type, label, values = {}) {
  return step(step_id, 'action', {
    action_type,
    label,
    approval_required: ['send_template_message', 'send_reminder', 'send_class_link', 'enroll_student'].includes(action_type),
    ...values,
  });
}

function conditionStep(step_id, condition_type, label, values = {}) {
  return step(step_id, 'condition', {
    condition_type,
    label,
    ...values,
  });
}

function compileNaturalLanguageAutomation({
  message = '',
  actor = {},
  channel = 'operations_helper',
  workspace_key = '',
  project_key = '',
} = {}) {
  const text = compact(message, 4000);
  const lower = text.toLowerCase();
  const policy = assertAutomationPolicy({
    actor,
    channel,
    operation: 'preview',
    workspace_key,
    project_key,
    dry_run: true,
  });

  let triggerType = 'manual_review';
  if (/\b(parent|lead|contact).{0,24}(signs?\s*up|signup|registers?|joins?)\b/.test(lower)) triggerType = 'parent_signup';
  else if (/\bpayment.{0,24}(succeeds?|success|paid|complete)\b/.test(lower)) triggerType = 'payment_succeeded';
  else if (/\bpayment.{0,24}(fail|incomplete|not finish|pending|24)\b/.test(lower)) triggerType = 'payment_incomplete';
  else if (/\bbounce|bounced|email fails?\b/.test(lower)) triggerType = 'email_bounced';
  else if (/\battendance.{0,40}(below|drops?|under)\b/.test(lower)) triggerType = 'attendance_threshold';
  else if (/\bclass reminder|before class|remind.*class\b/.test(lower)) triggerType = 'class_reminder_time';

  const steps = [
    step('trigger_1', 'trigger', {
      trigger_type: triggerType,
      label: triggerType.replace(/_/g, ' '),
    }),
  ];

  if (/\bwelcome\b/.test(lower)) {
    steps.push(actionStep('action_welcome_1', 'send_template_message', 'Send welcome template', {
      template_role: 'welcome',
    }));
  }

  if (/\b(not finish|does not finish|doesn't finish|incomplete|pending)\b/.test(lower) && /\bpayment\b/.test(lower)) {
    steps.push(step('delay_payment_1', 'delay', {
      duration: detectDelay(text),
      label: 'Wait before payment reminder',
    }));
    steps.push(conditionStep('condition_payment_pending_1', 'payment_status_pending', 'Payment is still pending'));
    steps.push(actionStep('action_payment_reminder_1', 'send_reminder', 'Send payment reminder', {
      template_role: 'payment_reminder',
    }));
  }

  if (/\bpayment.{0,30}(succeeds?|success|paid|complete)\b/.test(lower)) {
    steps.push(conditionStep('condition_payment_success_1', 'payment_status_succeeded', 'Payment succeeded'));
    if (/\benroll\b/.test(lower)) steps.push(actionStep('action_enroll_1', 'enroll_student', 'Enroll the child'));
    if (/\bclass link|zoom link|link\b/.test(lower)) {
      steps.push(actionStep('action_class_link_1', 'send_class_link', 'Send the class link', {
        template_role: 'class_link',
      }));
    }
  }

  if (/\bbounce|bounced|email fails?\b/.test(lower)) {
    steps.push(conditionStep('condition_email_bounce_1', 'email_delivery_bounced', 'Email bounced'));
    steps.push(actionStep('action_bounce_follow_up_1', 'create_follow_up_task', 'Create a follow-up task', {
      task_type: 'email_delivery_follow_up',
    }));
  }

  if (/\battendance.{0,40}(below|drops?|under)\b/.test(lower)) {
    const thresholdMatch = lower.match(/\b(\d{1,3})\s*%/);
    steps.push(conditionStep('condition_attendance_threshold_1', 'attendance_below_threshold', 'Attendance is below threshold', {
      threshold_percent: thresholdMatch ? Number(thresholdMatch[1]) : 70,
    }));
    steps.push(actionStep('action_attendance_notify_1', 'notify_actor', 'Notify the responsible owner'));
  }

  if (steps.length === 1) {
    steps.push(actionStep('action_review_1', 'create_follow_up_task', 'Create review task for unsupported details', {
      task_type: 'automation_review',
    }));
  }

  const definition = {
    requirement_id: AUTOMATION_BUILDER_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    automation_key: `automation_${normalizeKey(text || triggerType, 'request').slice(0, 60)}`,
    name: compact(text.split(/[.!?]/).find(Boolean) || 'Automation draft', 160),
    workspace_scope: {
      workspace_key: policy.workspace.workspace_key,
      project_key: policy.workspace.project_key,
    },
    role_scope: policy.role,
    channel_key: normalizeChannel(channel),
    enabled_state: 'draft',
    approval_state: 'draft',
    trigger: {
      trigger_type: triggerType,
      label: triggerType.replace(/_/g, ' '),
    },
    steps,
    typed_only: true,
    arbitrary_code_allowed: false,
    external_actions_enabled: false,
    source_prompt: text,
  };

  const validation = validateAutomationDefinition(definition);
  if (!validation.valid) {
    const error = new Error('automation_definition_rejected');
    error.validation = validation;
    throw error;
  }

  return definition;
}

function validateAutomationDefinition(definition = {}) {
  const issues = containsBlockedCode(definition);
  const triggerType = normalizeKey(definition.trigger?.trigger_type || definition.trigger_type || '');
  if (!ALLOWED_TRIGGERS.includes(triggerType)) {
    issues.push({ path: 'definition.trigger.trigger_type', reason: 'unknown_trigger_type', value: triggerType });
  }

  const steps = Array.isArray(definition.steps) ? definition.steps : [];
  if (!steps.length) issues.push({ path: 'definition.steps', reason: 'steps_required' });

  steps.forEach((item, index) => {
    const path = `definition.steps[${index}]`;
    const type = normalizeKey(item.type || '');
    if (!ALLOWED_STEP_TYPES.has(type)) issues.push({ path: `${path}.type`, reason: 'unknown_step_type', value: type });
    if (type === 'trigger') {
      const value = normalizeKey(item.trigger_type || '');
      if (!ALLOWED_TRIGGERS.includes(value)) issues.push({ path: `${path}.trigger_type`, reason: 'unknown_trigger_type', value });
    }
    if (type === 'condition') {
      const value = normalizeKey(item.condition_type || '');
      if (!ALLOWED_CONDITIONS.includes(value)) issues.push({ path: `${path}.condition_type`, reason: 'unknown_condition_type', value });
    }
    if (type === 'action') {
      const value = normalizeKey(item.action_type || '');
      if (!ALLOWED_ACTIONS.includes(value)) issues.push({ path: `${path}.action_type`, reason: 'unknown_action_type', value });
    }
    if (type === 'delay' && !compact(item.duration, 80)) {
      issues.push({ path: `${path}.duration`, reason: 'delay_duration_required' });
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    allowed_triggers: ALLOWED_TRIGGERS,
    allowed_conditions: ALLOWED_CONDITIONS,
    allowed_actions: ALLOWED_ACTIONS,
  };
}

function ensureValidAutomationDefinition(definition = {}) {
  const validation = validateAutomationDefinition(definition);
  if (validation.valid) return validation;
  const error = new Error('automation_definition_rejected');
  error.validation = validation;
  throw error;
}

function readableStep(item = {}, index = 0) {
  const label = compact(item.label || '', 160);
  if (item.type === 'trigger') return `${index + 1}. Trigger: ${label || item.trigger_type}`;
  if (item.type === 'delay') return `${index + 1}. Wait: ${item.duration || label}`;
  if (item.type === 'condition') return `${index + 1}. Check: ${label || item.condition_type}`;
  if (item.type === 'action') return `${index + 1}. Action: ${label || item.action_type}`;
  return `${index + 1}. ${item.type || 'step'}: ${label}`;
}

function automationDiagram(definition = {}) {
  const lines = ['flowchart TD'];
  (definition.steps || []).forEach((item, index) => {
    const nodeId = `S${index + 1}`;
    const label = compact(item.label || item.trigger_type || item.condition_type || item.action_type || item.type || 'Step', 60).replace(/"/g, "'");
    lines.push(`  ${nodeId}["${label}"]`);
    if (index > 0) lines.push(`  S${index} --> ${nodeId}`);
  });
  return lines.join('\n');
}

function simulateAutomation({
  definition = {},
  sample_event = {},
} = {}) {
  ensureValidAutomationDefinition(definition);
  const event = sample_event || {};
  const evaluatedSteps = (definition.steps || []).map((item) => {
    let matched = true;
    if (item.type === 'condition') {
      if (item.condition_type === 'payment_status_pending') matched = event.payment_status === 'pending';
      else if (item.condition_type === 'payment_status_succeeded') matched = event.payment_status === 'succeeded';
      else if (item.condition_type === 'email_delivery_bounced') matched = event.email_delivery_status === 'bounced';
      else if (item.condition_type === 'attendance_below_threshold') {
        const threshold = Number(item.threshold_percent || 70);
        matched = Number(event.attendance_percent || 100) < threshold;
      } else if (item.condition_type === 'contact_consent_confirmed') {
        matched = event.consent === true;
      }
    }
    return {
      step_id: item.step_id,
      type: item.type,
      matched,
      planned_action: item.type === 'action' && matched ? item.action_type : '',
      external_write_performed: false,
    };
  });
  return {
    requirement_id: AUTOMATION_BUILDER_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    automation_key: definition.automation_key || '',
    sample_event_used: event,
    evaluated_steps: evaluatedSteps,
    planned_actions: evaluatedSteps.filter((item) => item.planned_action).map((item) => item.planned_action),
    dry_run: true,
    external_write_performed: false,
    automation_enabled: false,
  };
}

function buildAutomationPreview({
  definition = {},
  actor = {},
  channel = 'operations_helper',
  sample_event = {},
} = {}) {
  ensureValidAutomationDefinition(definition);
  const simulation = simulateAutomation({ definition, sample_event });
  return {
    requirement_id: AUTOMATION_BUILDER_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    preview_type: 'automation_steps_and_dry_run',
    channel_key: normalizeChannel(channel),
    automation_key: definition.automation_key,
    workspace_scope: definition.workspace_scope,
    role_scope: definition.role_scope,
    readable_steps: (definition.steps || []).map(readableStep),
    diagram_mermaid: automationDiagram(definition),
    simulation,
    blockers: [
      'External connector readiness must pass before enable.',
      'Explicit approval is required before enable.',
    ],
    preview_required: true,
    approval_required_before_enable: true,
    typed_actions_only: true,
    arbitrary_code_allowed: false,
    external_action: true,
    enabled_state: 'draft',
    actor_role: actor.role || '',
  };
}

function createAutomationDraft({
  actor = {},
  channel = 'operations_helper',
  conversation_key = '',
  message = '',
  definition = null,
  sample_event = {},
  workspace_key = '',
  project_key = '',
} = {}) {
  const compiled = definition || compileNaturalLanguageAutomation({
    message,
    actor,
    channel,
    workspace_key,
    project_key,
  });
  ensureValidAutomationDefinition(compiled);
  const workspace = workspaceFrom(actor, compiled.workspace_scope || { workspace_key, project_key });
  assertAutomationPolicy({
    actor,
    channel,
    operation: 'draft',
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    dry_run: true,
  });
  const draft = createDraft({
    object_type: 'automation',
    object_id: compiled.automation_key,
    conversation_key,
    channel,
    actor,
    audience_scope: {
      trigger_type: compiled.trigger.trigger_type,
      automation_key: compiled.automation_key,
    },
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    metadata: {
      automation_builder: true,
      requirement_id: AUTOMATION_BUILDER_REQUIREMENT_ID,
    },
  });
  const previewPayload = buildAutomationPreview({
    definition: compiled,
    actor,
    channel,
    sample_event,
  });
  const version = createDraftVersion({
    draft,
    actor,
    channel,
    content: {
      automation_definition: compiled,
      readable_steps: previewPayload.readable_steps,
      diagram_mermaid: previewPayload.diagram_mermaid,
      simulation: previewPayload.simulation,
      enabled_state: 'draft',
      external_actions_enabled: false,
    },
    prompt_instruction: compact(message || compiled.source_prompt || 'Create automation draft.', 1000),
    change_summary: 'Automation draft compiled from natural language.',
    approval_state: 'draft',
    active_state: 'inactive',
    scheduled_use_state: 'not_scheduled',
  });
  const preview = createPreview({
    draft,
    version,
    actor,
    channel,
    preview_type: 'automation',
    payload: previewPayload,
    real_data: false,
    sample_data: true,
    external_action: true,
    blockers: previewPayload.blockers,
    status: 'draft',
  });
  return {
    requirement_id: AUTOMATION_BUILDER_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    action_category: 'automation',
    status: 'draft_preview',
    automation: compiled,
    draft,
    version,
    preview,
    simulation: previewPayload.simulation,
    approval_required_before_enable: true,
    external_actions_enabled: false,
    automation_enabled: false,
    arbitrary_code_allowed: false,
  };
}

function enableAutomationPlan({
  actor = {},
  channel = 'operations_helper',
  definition = {},
  workspace_key = '',
  project_key = '',
  approved = false,
} = {}) {
  const workspace = workspaceFrom(actor, definition.workspace_scope || { workspace_key, project_key });
  assertAutomationPolicy({
    actor: approved ? { ...actor, explicit_approval: true } : actor,
    channel,
    operation: 'enable',
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    dry_run: false,
  });
  ensureValidAutomationDefinition(definition);
  return {
    requirement_id: AUTOMATION_BUILDER_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    automation_key: definition.automation_key || '',
    enabled_state: 'enabled',
    approval_used: true,
    external_actions_enabled: true,
  };
}

module.exports = {
  ALLOWED_ACTIONS,
  ALLOWED_CONDITIONS,
  ALLOWED_TRIGGERS,
  AUTOMATION_BUILDER_REQUIREMENT_ID,
  CONTRACT_VERSION,
  assertAutomationPolicy,
  buildAutomationPreview,
  compileNaturalLanguageAutomation,
  createAutomationDraft,
  enableAutomationPlan,
  simulateAutomation,
  validateAutomationDefinition,
};
