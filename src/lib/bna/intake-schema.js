const INTAKE_SCHEMA_VERSION = 'bna-intake-schema-v1';

const INTAKE_SOURCE_CHANNELS = [
  'telegram',
  'website_bot',
  'codex_chat',
  'operations_ui',
  'drive',
  'class_recording',
  'website_helper',
  'operations_helper',
  'email',
  'whatsapp',
  'wapi',
  'manual',
  'other',
];

const RAW_PARSE_STATUSES = [
  'raw',
  'parsed',
  'needs_review',
  'registered',
  'implemented',
  'archived',
  'failed',
];

const TERMINAL_GOAL_STATUSES = [
  'Done',
  'Already satisfied',
  'Blocked',
  'Needs operator decision',
  'Failed',
  'Superseded',
  'Archived',
];

const WATCHDOG_EVENT_TYPES = [
  'watchdog_check_started',
  'watchdog_check_passed',
  'watchdog_check_failed',
  'watchdog_repair_task_created',
  'watchdog_repair_blocked',
];

const CANONICAL_INTAKE_ARRAY_KEYS = [
  'requirements',
  'tasks',
  'decisions',
  'calendar_events',
  'open_questions',
  'memory_candidates',
  'goal_candidates',
  'student_notes',
  'student_questions',
  'student_observations',
  'content_items',
  'research_items',
  'accounting_items',
  'contact_items',
  'contacts',
  'communications',
  'integration_items',
  'service_provider_items',
  'tickets',
  'goals',
  'diet_nutrition_notes',
  'attendance',
  'assignments',
  'behavior_notes',
  'provider_leads',
  'class_session_notes',
  'workspace_routing',
  'alerts',
  'errors',
  'custom_sections',
  'review_items',
  'filing_plan',
];

const STABLE_ID_PREFIX_BY_ITEM_TYPE = {
  raw: 'RAW',
  requirement: 'REQ',
  task: 'TASK',
  decision: 'DEC',
  calendar_event: 'CAL',
  open_question: 'Q',
  memory_candidate: 'MEM',
  goal_candidate: 'GOAL',
  goal: 'GOAL',
  student_note: 'NOTE',
  student_question: 'STUQ',
  student_observation: 'STUNOTE',
  content_item: 'CONTENT',
  research_item: 'RESEARCH',
  accounting_item: 'ACCT',
  contact_item: 'CONTACT',
  contact: 'CONTACT',
  communication: 'COMM',
  integration_item: 'INT',
  service_provider_item: 'PROVIDER',
  ticket: 'TASK',
  diet_nutrition_note: 'NOTE',
  attendance: 'NOTE',
  assignment: 'NOTE',
  behavior_note: 'NOTE',
  provider_lead: 'CONTACT',
  class_session_note: 'CLASS',
  workspace_routing: 'ROUTE',
  alert: 'ALERT',
  error: 'ERR',
  custom_section: 'REQ',
  watchdog_finding: 'WATCH',
};

const COMMON_ITEM_FIELDS = [
  'stable_id',
  'item_key',
  'item_type',
  'title',
  'short_title',
  'source_quote',
  'source_excerpt',
  'scope_type',
  'scope_id',
  'workspace_key',
  'project_key',
  'related_raw_id',
  'related_goal_ids',
  'confidence',
  'needs_review',
  'expected_result',
  'done_definition',
  'verification_method',
  'target_lane',
  'evidence_paths',
  'status',
  'metadata',
];

function ensureIntakeArrays(output = {}) {
  for (const key of CANONICAL_INTAKE_ARRAY_KEYS) {
    if (!Array.isArray(output[key])) output[key] = [];
  }
  return output;
}

function itemTypeForArrayKey(key = '') {
  return String(key || '')
    .replace(/ies$/, 'y')
    .replace(/s$/, '');
}

function defaultItemFields(item = {}, type = 'item', context = {}) {
  return {
    item_type: item.item_type || type,
    scope_type: item.scope_type || context.scope_type || context.scopeType || 'workspace',
    scope_id: item.scope_id || context.scope_id || context.scopeId || null,
    workspace_key: item.workspace_key || context.workspace_key || context.workspaceKey || 'bna',
    project_key: item.project_key || context.project_key || context.projectKey || null,
    related_raw_id: item.related_raw_id || context.raw_id || context.rawId || null,
    related_goal_ids: Array.isArray(item.related_goal_ids) ? item.related_goal_ids : [],
    evidence_paths: Array.isArray(item.evidence_paths) ? item.evidence_paths : [],
    status: item.status || 'parsed',
    metadata: item.metadata && typeof item.metadata === 'object' ? item.metadata : {},
    ...item,
  };
}

module.exports = {
  INTAKE_SCHEMA_VERSION,
  INTAKE_SOURCE_CHANNELS,
  RAW_PARSE_STATUSES,
  TERMINAL_GOAL_STATUSES,
  WATCHDOG_EVENT_TYPES,
  CANONICAL_INTAKE_ARRAY_KEYS,
  STABLE_ID_PREFIX_BY_ITEM_TYPE,
  COMMON_ITEM_FIELDS,
  ensureIntakeArrays,
  itemTypeForArrayKey,
  defaultItemFields,
};
