const crypto = require('crypto');

const {
  actorWorkspaceScope,
  assertActionPolicy,
  normalizeChannel,
  normalizeRole,
} = require('./control-plane');

const CHART_DASHBOARD_REQUIREMENT_ID = 'REQ-20260623-019';
const CONTRACT_VERSION = 'assistant-chart-dashboard-config-v1';

const CHART_TEMPLATES = Object.freeze({
  parent_weekly_summary: Object.freeze({
    label: 'Parent Weekly Summary',
    role_scopes: Object.freeze(['parent']),
    sections: Object.freeze(['attendance', 'progress', 'course_completion', 'milestones']),
    metrics: Object.freeze(['attendance', 'progress', 'course_completion', 'milestones']),
  }),
  attendance_first: Object.freeze({
    label: 'Attendance First',
    role_scopes: Object.freeze(['parent', 'service_provider', 'super_admin']),
    sections: Object.freeze(['attendance', 'progress', 'course_completion', 'milestones']),
    metrics: Object.freeze(['attendance', 'progress', 'course_completion', 'milestones']),
  }),
  progress_first: Object.freeze({
    label: 'Progress First',
    role_scopes: Object.freeze(['parent', 'student', 'service_provider', 'super_admin']),
    sections: Object.freeze(['progress', 'attendance', 'course_completion', 'milestones']),
    metrics: Object.freeze(['progress', 'attendance', 'course_completion', 'milestones']),
  }),
  course_completion: Object.freeze({
    label: 'Course Completion',
    role_scopes: Object.freeze(['parent', 'student', 'service_provider', 'super_admin']),
    sections: Object.freeze(['course_completion', 'progress', 'attendance', 'worksheets']),
    metrics: Object.freeze(['course_completion', 'progress', 'attendance', 'worksheet_completion']),
  }),
  milestones_achievements: Object.freeze({
    label: 'Milestones And Achievements',
    role_scopes: Object.freeze(['parent', 'student', 'service_provider', 'super_admin']),
    sections: Object.freeze(['milestones', 'achievements', 'progress', 'attendance']),
    metrics: Object.freeze(['milestones', 'achievements', 'progress', 'attendance']),
  }),
  grandparent_summary: Object.freeze({
    label: 'Grandparent Summary',
    role_scopes: Object.freeze(['parent']),
    sections: Object.freeze(['attendance', 'milestones', 'course_completion']),
    metrics: Object.freeze(['attendance', 'milestones', 'course_completion']),
  }),
  provider_class_overview: Object.freeze({
    label: 'Provider Class Overview',
    role_scopes: Object.freeze(['service_provider', 'super_admin']),
    sections: Object.freeze(['attendance', 'progress', 'questions', 'support', 'enrollment']),
    metrics: Object.freeze(['attendance', 'progress', 'questions', 'support', 'enrollment']),
  }),
  super_admin_operations_dashboard: Object.freeze({
    label: 'Super Admin Operations Dashboard',
    role_scopes: Object.freeze(['super_admin']),
    sections: Object.freeze(['tasks', 'agent_work', 'approvals', 'campaigns', 'automations', 'tickets', 'deployments']),
    metrics: Object.freeze(['tasks', 'agent_work', 'approvals', 'campaigns', 'automations', 'tickets', 'deployments']),
  }),
});

const ROLE_METRICS = Object.freeze({
  parent: Object.freeze([
    'attendance',
    'progress',
    'course_completion',
    'milestones',
    'achievements',
    'worksheet_completion',
    'home_practice',
    'parent_notes',
  ]),
  student: Object.freeze([
    'schedule',
    'progress',
    'course_completion',
    'worksheets',
    'milestones',
    'achievements',
  ]),
  service_provider: Object.freeze([
    'attendance',
    'progress',
    'course_completion',
    'milestones',
    'achievements',
    'questions',
    'support',
    'enrollment',
    'worksheets',
  ]),
  super_admin: Object.freeze([
    'attendance',
    'progress',
    'course_completion',
    'milestones',
    'achievements',
    'questions',
    'support',
    'enrollment',
    'worksheets',
    'tasks',
    'agent_work',
    'approvals',
    'campaigns',
    'automations',
    'tickets',
    'deployments',
    'reminders',
  ]),
});

const ROLE_SECTIONS = Object.freeze({
  parent: Object.freeze([...ROLE_METRICS.parent, 'reminders']),
  student: Object.freeze([...ROLE_METRICS.student, 'questions']),
  service_provider: Object.freeze([...ROLE_METRICS.service_provider, 'class_roster']),
  super_admin: Object.freeze([...ROLE_METRICS.super_admin, 'calendar']),
});

const BLOCKED_CONFIG_KEYS = Object.freeze([
  'custom_css',
  'raw_css',
  'css',
  'style',
  'script',
  'javascript',
  'raw_html',
  'html',
  'iframe',
  'onclick',
  'onload',
  'onerror',
  'renderer_code',
  'eval',
]);

const BLOCKED_METRICS = Object.freeze([
  'admin_notes',
  'provider_private_notes',
  'internal_notes',
  'guardian_contact',
  'billing_status',
  'payment_status',
  'official_score',
  'official_attendance',
  'school_score',
  'provider_score',
  'official_score_edit',
  'official_attendance_edit',
  'other_child_records',
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

function normalizedRoleScope(actor = {}, explicitRole = '') {
  return normalizeRole(explicitRole || actor.role || actor.actor_role || 'parent');
}

function normalizeTemplateKey(template = '', role = 'parent') {
  const requested = normalizeKey(template, '');
  if (requested && CHART_TEMPLATES[requested]?.role_scopes.includes(role)) return requested;
  if (role === 'service_provider') return 'provider_class_overview';
  if (role === 'super_admin') return 'super_admin_operations_dashboard';
  if (role === 'student') return 'progress_first';
  return 'parent_weekly_summary';
}

function uniqueAllowedKeys(values = [], allowed = []) {
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

function findBlockedMetricKeys(values = []) {
  const blocked = new Set(BLOCKED_METRICS);
  return (Array.isArray(values) ? values : Object.keys(values || {}))
    .map((value) => normalizeKey(value))
    .filter((key) => blocked.has(key));
}

function validateNoInjection(value = {}, path = 'configuration', issues = []) {
  const blockedKeys = new Set(BLOCKED_CONFIG_KEYS);
  const blockedString = /<\s*script\b|<\s*iframe\b|<\s*style\b|javascript\s*:|onerror\s*=|onload\s*=|onclick\s*=|expression\s*\(/i;
  if (value === null || value === undefined) return issues;
  if (typeof value === 'string') {
    if (blockedString.test(value)) issues.push({ path, reason: 'raw_code_or_css_injection' });
    return issues;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoInjection(item, `${path}[${index}]`, issues));
    return issues;
  }
  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      const normalized = normalizeKey(key);
      if (blockedKeys.has(normalized)) issues.push({ path: `${path}.${key}`, reason: 'raw_code_or_css_field' });
      validateNoInjection(nested, `${path}.${key}`, issues);
    }
  }
  return issues;
}

function ensureValidConfigurationInput(input = {}) {
  const issues = validateNoInjection(input);
  if (input.mutate_underlying_data || input.official_data_update || input.official_record_change) {
    issues.push({ path: 'configuration', reason: 'official_record_mutation_requested' });
  }
  const blockedMetrics = [
    ...findBlockedMetricKeys(input.sections || []),
    ...findBlockedMetricKeys(input.metric_visibility || input.metricVisibility || {}),
  ];
  for (const metric of blockedMetrics) {
    issues.push({ path: 'metric_visibility', reason: `metric_denied:${metric}` });
  }
  if (!issues.length) return;
  const error = new Error(`chart_dashboard_config_rejected:${issues.map((issue) => issue.reason).join(',')}`);
  error.issues = issues;
  throw error;
}

function normalizeWorkspace(actor = {}, explicit = {}) {
  const scope = actorWorkspaceScope(actor);
  return {
    workspace_key: explicit.workspace_key || explicit.workspaceKey || scope.workspace_key || 'bna',
    project_key: explicit.project_key || explicit.projectKey || scope.project_key || 'bna',
  };
}

function normalizeStudentScope(input = {}) {
  const childId = String(input.child_id || input.childId || input.student_id || input.studentId || '').trim();
  const parentId = String(input.parent_id || input.parentId || '').trim();
  return {
    child_id: childId,
    student_id: childId,
    parent_id: parentId,
  };
}

function targetFromConfigInput({ actor = {}, role_scope = '', workspace = {}, student_scope = {}, provider_id = '' } = {}) {
  return {
    workspace_key: workspace.workspace_key,
    project_key: workspace.project_key,
    provider_id: provider_id || actor.provider_id || actor.providerId || '',
    child_id: student_scope.child_id || student_scope.student_id || '',
    parent_id: student_scope.parent_id || actor.parent_id || actor.parentId || '',
  };
}

function assertChartDashboardPermission({
  actor = {},
  channel = 'website_assistant',
  role_scope = '',
  operation = 'preview',
  workspace_key = '',
  project_key = '',
  student_scope = {},
  provider_id = '',
} = {}) {
  const role = normalizedRoleScope(actor, role_scope);
  const workspace = normalizeWorkspace(actor, { workspace_key, project_key });
  const normalizedStudentScope = normalizeStudentScope(student_scope);
  if (role === 'parent' && !normalizedStudentScope.child_id) throw new Error('child_id_required');
  if (role === 'student' && !normalizedStudentScope.child_id) {
    normalizedStudentScope.child_id = String(actor.student_id || actor.studentId || '');
    normalizedStudentScope.student_id = normalizedStudentScope.child_id;
  }
  const policy = assertActionPolicy({
    actor: { ...actor, role },
    channel,
    action_category: 'dashboard_layout',
    operation,
    target: targetFromConfigInput({
      actor,
      role_scope: role,
      workspace,
      student_scope: normalizedStudentScope,
      provider_id,
    }),
    dry_run: true,
  });
  return {
    ...policy,
    role_scope: role,
    workspace,
    student_scope: normalizedStudentScope,
  };
}

function normalizeDashboardSections({ role = 'parent', template = '', sections = [] } = {}) {
  const templateKey = normalizeTemplateKey(template, role);
  const allowed = ROLE_SECTIONS[role] || ROLE_SECTIONS.parent;
  const explicit = uniqueAllowedKeys(sections, allowed);
  return explicit.length ? explicit : [...CHART_TEMPLATES[templateKey].sections];
}

function normalizeMetricVisibility({ role = 'parent', template = '', metric_visibility = {} } = {}) {
  const templateKey = normalizeTemplateKey(template, role);
  const allowed = new Set(ROLE_METRICS[role] || ROLE_METRICS.parent);
  const base = {};
  for (const metric of CHART_TEMPLATES[templateKey].metrics) {
    if (allowed.has(metric)) base[metric] = true;
  }
  for (const [rawKey, value] of Object.entries(metric_visibility || {})) {
    const key = normalizeKey(rawKey);
    if (allowed.has(key)) base[key] = Boolean(value);
  }
  return base;
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
  return {
    chart_type: normalizeKey(prefs.chart_type || prefs.chartType || 'bars', 'bars'),
    density: normalizeKey(prefs.density || 'comfortable', 'comfortable'),
    color_mode: normalizeKey(prefs.color_mode || prefs.colorMode || 'role_default', 'role_default'),
    accessible_summary: prefs.accessible_summary !== false,
    mobile_first: prefs.mobile_first !== false,
  };
}

function buildChartDashboardConfiguration({
  actor = {},
  channel = 'website_assistant',
  role_scope = '',
  layout_name = '',
  template = '',
  sections = [],
  metric_visibility = {},
  date_range = {},
  display_preferences = {},
  student_scope = {},
  provider_id = '',
  workspace_key = '',
  project_key = '',
  approval_state = 'draft',
  version_number = 1,
  parent_version_id = '',
} = {}) {
  ensureValidConfigurationInput({
    sections,
    metric_visibility,
    date_range,
    display_preferences,
  });
  const policy = assertChartDashboardPermission({
    actor,
    channel,
    role_scope,
    workspace_key,
    project_key,
    student_scope,
    provider_id,
    operation: 'preview',
  });
  const role = policy.role_scope;
  const templateKey = normalizeTemplateKey(template, role);
  const normalizedSections = normalizeDashboardSections({ role, template: templateKey, sections });
  const normalizedMetrics = normalizeMetricVisibility({ role, template: templateKey, metric_visibility });
  const name = compact(layout_name || CHART_TEMPLATES[templateKey].label, 160);
  return {
    requirement_id: CHART_DASHBOARD_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    chart_definition: {
      definition_id: `chart_definition_${stableHash(`${role}:${templateKey}:${name}`)}`,
      source: 'official_role_scoped_records',
      official_data_read_only: true,
      arbitrary_code_allowed: false,
      arbitrary_css_allowed: false,
      renderer: 'canonical_chart_renderer',
    },
    chart_template: templateKey,
    dashboard_layout: {
      layout_id: `dashboard_layout_${stableHash(`${policy.workspace.workspace_key}:${role}:${name}`)}`,
      name,
      sections: normalizedSections,
      responsive: true,
    },
    layout_version: {
      version_id: `layout_version_${stableHash(`${templateKey}:${name}:${version_number}:${JSON.stringify(normalizedSections)}`)}`,
      parent_version_id: parent_version_id || '',
      version_number,
      change_summary: 'Chart/dashboard configuration generated by natural language.',
    },
    metric_visibility: normalizedMetrics,
    role_scope: role,
    workspace_scope: policy.workspace,
    student_scope: policy.student_scope,
    date_range: normalizeDateRange(date_range),
    display_preferences: normalizeDisplayPreferences(display_preferences),
    approval_state: normalizeKey(approval_state || 'draft', 'draft'),
    external_action: false,
    official_data_mutated: false,
    underlying_record_change_allowed: false,
    policy,
  };
}

function compileNaturalLanguageChartPatch({
  message = '',
  current_config = {},
  role_scope = '',
  actor = {},
} = {}) {
  const text = compact(message, 4000);
  const lower = text.toLowerCase();
  const role = normalizedRoleScope(actor, role_scope || current_config.role_scope || 'parent');
  const patch = {
    sections: [],
    metric_visibility: {},
    date_range: {},
    display_preferences: {},
    template: '',
    saved_view_name: '',
    rollback_requested: false,
    official_record_change_requested: false,
  };

  const currentSections = current_config.dashboard_layout?.sections || [];
  const moveMatch = lower.match(/\bmove\s+([a-z _-]+?)\s+(?:above|before)\s+([a-z _-]+?)(?:[.!?]|$)/);
  if (moveMatch) {
    const first = normalizeKey(moveMatch[1]);
    const second = normalizeKey(moveMatch[2]);
    const remainder = currentSections.filter((item) => ![first, second].includes(normalizeKey(item)));
    patch.sections = [first, second, ...remainder];
  }
  if (/\b(attendance[-\s]?first|attendance first)\b/.test(lower)) patch.template = 'attendance_first';
  if (/\b(progress[-\s]?first|progress first)\b/.test(lower)) patch.template = 'progress_first';
  if (/\bcourse completion\b/.test(lower)) patch.template = 'course_completion';
  if (/\bmilestones?\b.*\bachievements?\b|\bachievements?\b.*\bmilestones?\b/.test(lower)) patch.template = 'milestones_achievements';
  if (/\bgrandparent|simpler chart|simple version\b/.test(lower) && role === 'parent') {
    patch.template = 'grandparent_summary';
    patch.display_preferences.density = 'simple';
  }
  if (/\bbar|bars\b/.test(lower) && /\bline|instead\b/.test(lower)) patch.display_preferences.chart_type = 'bars';
  if (/\bline\b/.test(lower) && !/\bbar|bars\b/.test(lower)) patch.display_preferences.chart_type = 'line';
  if (/\blast\s+30\s+days\b/.test(lower)) patch.date_range.preset = 'last_30_days';
  if (/\bweekly\b/.test(lower)) patch.date_range.preset = 'weekly';
  if (/\bmonthly\b/.test(lower)) patch.date_range.preset = 'monthly';
  const saveMatch = text.match(/\bsave\s+(?:this\s+)?(?:as\s+)?([A-Za-z0-9][A-Za-z0-9 _-]{1,80})/i);
  if (saveMatch) patch.saved_view_name = compact(saveMatch[1], 80).replace(/[.!?]+$/, '');
  if (/\bundo\b|\bgo back\b|\brollback\b|\brestore\b/.test(lower)) patch.rollback_requested = true;
  if (/\bchange official\b|\bfix official\b|\balter attendance\b|\bchange score\b|\brewrite score\b/.test(lower)) {
    patch.official_record_change_requested = true;
  }

  return {
    requirement_id: CHART_DASHBOARD_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    mode: 'natural_language_patch',
    role_scope: role,
    message: text,
    patch,
    requires_schema_validation: true,
    requires_preview: true,
    external_action: false,
  };
}

function applyChartDashboardPatch({
  current_config = {},
  patch = {},
  actor = {},
  channel = '',
  version_number = '',
} = {}) {
  if (patch.official_record_change_requested) {
    const error = new Error('chart_dashboard_patch_denied:official_record_mutation_requested');
    error.patch = patch;
    throw error;
  }
  ensureValidConfigurationInput(patch);
  const next = buildChartDashboardConfiguration({
    actor,
    channel: channel || current_config.policy?.channel || 'website_assistant',
    role_scope: current_config.role_scope,
    layout_name: patch.saved_view_name || current_config.dashboard_layout?.name || '',
    template: patch.template || current_config.chart_template || '',
    sections: patch.sections?.length ? patch.sections : current_config.dashboard_layout?.sections || [],
    metric_visibility: {
      ...(current_config.metric_visibility || {}),
      ...(patch.metric_visibility || {}),
    },
    date_range: {
      ...(current_config.date_range || {}),
      ...(patch.date_range || {}),
    },
    display_preferences: {
      ...(current_config.display_preferences || {}),
      ...(patch.display_preferences || {}),
    },
    student_scope: current_config.student_scope || {},
    workspace_key: current_config.workspace_scope?.workspace_key,
    project_key: current_config.workspace_scope?.project_key,
    approval_state: current_config.approval_state || 'draft',
    version_number: version_number || Number(current_config.layout_version?.version_number || 1) + 1,
    parent_version_id: current_config.layout_version?.version_id || '',
  });
  return {
    ...next,
    layout_version: {
      ...next.layout_version,
      parent_version_id: current_config.layout_version?.version_id || '',
      change_summary: 'Chart/dashboard configuration updated by natural language patch.',
    },
  };
}

function createChartDashboardPreview({
  configuration = {},
  actor = {},
  channel = 'website_assistant',
  real_data = false,
  sample_data = true,
  blockers = [],
} = {}) {
  if (!configuration.chart_definition) throw new Error('configuration_required');
  assertChartDashboardPermission({
    actor,
    channel,
    role_scope: configuration.role_scope,
    workspace_key: configuration.workspace_scope?.workspace_key,
    project_key: configuration.workspace_scope?.project_key,
    student_scope: configuration.student_scope,
    operation: 'preview',
  });
  return {
    requirement_id: CHART_DASHBOARD_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    preview_id: `chart_preview_${stableHash(`${configuration.layout_version?.version_id}:${channel}`)}`,
    channel_key: normalizeChannel(channel),
    preview_type: 'chart_dashboard',
    real_data: Boolean(real_data),
    sample_data: Boolean(sample_data),
    role_scope: configuration.role_scope,
    audience_scope: {
      role_scope: configuration.role_scope,
      student_scope: configuration.student_scope,
      workspace_scope: configuration.workspace_scope,
    },
    workspace_key: configuration.workspace_scope?.workspace_key || '',
    project_key: configuration.workspace_scope?.project_key || '',
    payload: {
      renderer: normalizeChannel(channel) === 'telegram' ? 'telegram_snapshot_and_secure_deep_link' : 'interactive_chart_dashboard_preview',
      chart_definition: configuration.chart_definition,
      chart_template: configuration.chart_template,
      dashboard_layout: configuration.dashboard_layout,
      metric_visibility: configuration.metric_visibility,
      date_range: configuration.date_range,
      display_preferences: configuration.display_preferences,
      responsive_frames: ['mobile', 'tablet', 'desktop'],
      accessible_alternatives: {
        summary_text_required: true,
        data_table_required: true,
        aria_label_required: true,
      },
      official_data_mutated: false,
      underlying_record_change_allowed: false,
    },
    blockers: Array.isArray(blockers) ? blockers.map((item) => compact(item, 240)).filter(Boolean) : [],
    external_action: false,
    status: blockers.length ? 'draft' : 'ready',
  };
}

function compareChartDashboardVersions(left = {}, right = {}) {
  const changed_fields = [];
  for (const key of [
    'chart_template',
    'dashboard_layout',
    'metric_visibility',
    'date_range',
    'display_preferences',
  ]) {
    if (JSON.stringify(left[key] || {}) !== JSON.stringify(right[key] || {})) changed_fields.push(key);
  }
  return {
    left_version_id: left.layout_version?.version_id || '',
    right_version_id: right.layout_version?.version_id || '',
    same_layout: Boolean(left.dashboard_layout?.layout_id && left.dashboard_layout.layout_id === right.dashboard_layout?.layout_id),
    changed_fields,
    unchanged: changed_fields.length === 0,
  };
}

function rollbackChartDashboardConfiguration({
  current_config = {},
  target_config = {},
  actor = {},
  channel = 'website_assistant',
  reason = '',
} = {}) {
  if (!target_config.layout_version?.version_id) throw new Error('target_config_required');
  assertChartDashboardPermission({
    actor,
    channel,
    role_scope: target_config.role_scope,
    workspace_key: target_config.workspace_scope?.workspace_key,
    project_key: target_config.workspace_scope?.project_key,
    student_scope: target_config.student_scope,
    operation: 'version',
  });
  return {
    ...target_config,
    layout_version: {
      ...target_config.layout_version,
      version_id: `layout_version_${stableHash(`rollback:${current_config.layout_version?.version_id}:${target_config.layout_version.version_id}:${reason}`)}`,
      parent_version_id: current_config.layout_version?.version_id || '',
      rollback_to_version_id: target_config.layout_version.version_id,
      change_summary: compact(reason || `Rolled back to ${target_config.layout_version.version_id}`, 300),
    },
    approval_state: 'draft',
    official_data_mutated: false,
    underlying_record_change_allowed: false,
  };
}

function createSavedDashboardView({
  configuration = {},
  actor = {},
  name = '',
  channel = 'website_assistant',
} = {}) {
  if (!configuration.layout_version?.version_id) throw new Error('configuration_required');
  assertChartDashboardPermission({
    actor,
    channel,
    role_scope: configuration.role_scope,
    workspace_key: configuration.workspace_scope?.workspace_key,
    project_key: configuration.workspace_scope?.project_key,
    student_scope: configuration.student_scope,
    operation: 'save',
  });
  return {
    requirement_id: CHART_DASHBOARD_REQUIREMENT_ID,
    contract_version: CONTRACT_VERSION,
    saved_view_id: `saved_view_${stableHash(`${configuration.layout_version.version_id}:${name || configuration.dashboard_layout?.name}`)}`,
    view_type: 'dashboard_layout',
    name: compact(name || configuration.dashboard_layout?.name || 'Saved dashboard view', 160),
    role_scope: configuration.role_scope,
    owner_scope: {
      actor_identity_key: actor.identity_key || actor.user_id || actor.id || '',
      parent_id: actor.parent_id || actor.parentId || '',
      provider_id: actor.provider_id || actor.providerId || '',
    },
    workspace_scope: configuration.workspace_scope,
    student_scope: configuration.student_scope,
    layout_version_id: configuration.layout_version.version_id,
    active_state: 'selected',
    external_action: false,
  };
}

module.exports = {
  BLOCKED_CONFIG_KEYS,
  BLOCKED_METRICS,
  CHART_DASHBOARD_REQUIREMENT_ID,
  CHART_TEMPLATES,
  CONTRACT_VERSION,
  ROLE_METRICS,
  ROLE_SECTIONS,
  applyChartDashboardPatch,
  assertChartDashboardPermission,
  buildChartDashboardConfiguration,
  compareChartDashboardVersions,
  compileNaturalLanguageChartPatch,
  createChartDashboardPreview,
  createSavedDashboardView,
  normalizeDashboardSections,
  normalizeMetricVisibility,
  rollbackChartDashboardConfiguration,
};
