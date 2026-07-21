const WORKSPACE_TAXONOMY_VERSION = 'bna-platform-taxonomy-2026-07-21';

const CANONICAL_WORKSPACES = Object.freeze({
  platform_control: Object.freeze({
    key: 'platform_control',
    label: 'Super Admin',
    project_key: 'platform_operations',
    role: 'platform_super_admin',
    type: 'platform_control',
    subtitle: 'Platform Control',
  }),
  bna_school: Object.freeze({
    key: 'bna_school',
    label: 'BNA',
    subtitle: 'School workspace',
    project_key: 'bna_school',
    role: 'bna_admin',
    type: 'school_workspace',
  }),
  one_time: Object.freeze({
    key: 'one_time',
    label: 'One Time',
    type: 'external product connector',
    project_key: 'one_time_mishnayos',
    role: 'external_product_connector',
    repository: 'shloimie-beep/onetimev2',
    application: 'https://join.onetimeonetime.com',
  }),
});

const CANONICAL_PROJECTS = Object.freeze({
  platform_operations: Object.freeze({
    key: 'platform_operations',
    label: 'Platform Operations',
    workspace_key: 'platform_control',
  }),
  bna_school: Object.freeze({
    key: 'bna_school',
    label: 'BNA School',
    workspace_key: 'bna_school',
  }),
  one_time_mishnayos: Object.freeze({
    key: 'one_time_mishnayos',
    label: 'One Time Mishnayos',
    workspace_key: 'one_time',
  }),
});

const WORKSPACE_ALIASES = Object.freeze({
  bna_platform: 'platform_control',
  platform: 'platform_control',
  super_admin: 'platform_control',
  superadmin: 'platform_control',
  operations: 'platform_control',
  ops: 'platform_control',
  bna_school_platform: 'bna_school',
  bna: 'bna_school',
  school: 'bna_school',
  bna_school_workspace: 'bna_school',
  bnei_neviim: 'bna_school',
  bnei_neviim_academy: 'bna_school',
  academy: 'bna_school',
  rabbi_sheller_provider: 'one_time',
  rabbi_sheller: 'one_time',
  rabbi_scheller: 'one_time',
  rabbi_elie_scheller: 'one_time',
  one_time_provider: 'one_time',
  one_time_mishnah_class: 'one_time',
  one_time_mishnayos: 'one_time',
});

const PROJECT_ALIASES = Object.freeze({
  bna_platform: 'platform_operations',
  platform: 'platform_operations',
  platform_control: 'platform_operations',
  operations: 'platform_operations',
  bna_school_platform: 'bna_school',
  bna: 'bna_school',
  school: 'bna_school',
  rabbi_sheller_provider: 'one_time_mishnayos',
  one_time: 'one_time_mishnayos',
  one_time_mishnah_class: 'one_time_mishnayos',
  one_time_mishna_class: 'one_time_mishnayos',
  one_time_mishnah: 'one_time_mishnayos',
  one_time_mishna: 'one_time_mishnayos',
  mishnayos: 'one_time_mishnayos',
  mishnah: 'one_time_mishnayos',
});

const ROLE_ALIASES = Object.freeze({
  super_admin: 'platform_super_admin',
  platform_admin: 'platform_super_admin',
  owner: 'platform_super_admin',
  bna_owner: 'platform_super_admin',
});

const LEGACY_RUNTIME_WORKSPACE_KEYS = Object.freeze({
  platform_control: 'platform',
  bna_school: 'bna',
  one_time: 'rabbi_sheller_provider',
});

const LEGACY_RUNTIME_PROJECT_KEYS = Object.freeze({
  platform_operations: 'bna_school_platform',
  bna_school: 'bna',
  one_time_mishnayos: 'one_time_mishnah_class',
});

const LIVE_CLASS_QUESTION_STATUSES = Object.freeze([
  'submitted',
  'selected',
  'student_ready',
  'live',
  'answered',
  'approved_for_board',
  'kept_private',
  'rejected',
]);

const BUSINESS_CONVERSATION_EXAMPLES = Object.freeze([
  'enrollment',
  'billing question',
  'class reminder',
  'account question',
  'ordinary parent communication',
]);

const TECHNICAL_TICKET_SOURCE_WORKSPACES = Object.freeze(['bna_school', 'one_time']);

const TICKET_ROUTING_RECORDS = Object.freeze({
  live_class_question: Object.freeze({
    record_type: 'live_class_question',
    owner: 'one_time',
    support_ticket: false,
    statuses: LIVE_CLASS_QUESTION_STATUSES,
  }),
  business_conversation: Object.freeze({
    record_type: 'business_conversation',
    owner: 'highlevel',
    duplicate_to_bna_by_default: false,
    examples: BUSINESS_CONVERSATION_EXAMPLES,
  }),
  technical_ticket: Object.freeze({
    record_type: 'technical_ticket',
    owner: 'platform_control',
    source_workspace_required: true,
    source_workspaces: TECHNICAL_TICKET_SOURCE_WORKSPACES,
    examples: [
      'login defect',
      'portal defect',
      'Vimeo/Zoom failure',
      'software bug',
      'provider configuration failure requiring engineering',
    ],
    bna_school_owns_one_time_tickets: false,
    one_time_operates_without_platform_ticket_system: true,
  }),
});

function taxonomyToken(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolveWorkspaceKey(value, fallback = 'bna_school') {
  const token = taxonomyToken(value);
  if (!token) return fallback;
  if (CANONICAL_WORKSPACES[token]) return token;
  return WORKSPACE_ALIASES[token] || fallback;
}

function resolveProjectKey(value, fallback = 'bna_school') {
  const token = taxonomyToken(value);
  if (!token) return fallback;
  if (CANONICAL_PROJECTS[token]) return token;
  return PROJECT_ALIASES[token] || fallback;
}

function resolveRole(value, fallback = 'operator') {
  const token = taxonomyToken(value);
  if (!token) return fallback;
  return ROLE_ALIASES[token] || token;
}

function workspaceForProjectKey(value, fallback = 'bna_school') {
  const projectKey = resolveProjectKey(value, '');
  return CANONICAL_PROJECTS[projectKey]?.workspace_key || resolveWorkspaceKey(value, fallback);
}

function legacyRuntimeWorkspaceKey(value) {
  const key = resolveWorkspaceKey(value, '');
  return LEGACY_RUNTIME_WORKSPACE_KEYS[key] || key;
}

function legacyRuntimeProjectKey(value) {
  const key = resolveProjectKey(value, '');
  return LEGACY_RUNTIME_PROJECT_KEYS[key] || key;
}

function canonicalWorkspaceList() {
  return Object.values(CANONICAL_WORKSPACES).map((workspace) => ({ ...workspace }));
}

function workspaceTaxonomyPayload() {
  return {
    version: WORKSPACE_TAXONOMY_VERSION,
    workspaces: canonicalWorkspaceList(),
    projects: Object.values(CANONICAL_PROJECTS).map((project) => ({ ...project })),
    aliases: {
      workspaces: { ...WORKSPACE_ALIASES },
      projects: { ...PROJECT_ALIASES },
      roles: { ...ROLE_ALIASES },
    },
    legacy_runtime_keys: {
      workspaces: { ...LEGACY_RUNTIME_WORKSPACE_KEYS },
      projects: { ...LEGACY_RUNTIME_PROJECT_KEYS },
    },
  };
}

function compatibilityMigrationPlan() {
  return {
    plan_id: 'MIGRATION-20260721-WORKSPACE-TAXONOMY',
    destructive_database_rename: false,
    strategy: [
      'Resolve all incoming workspace, project, and role aliases through the compatibility resolver.',
      'Write new platform-facing records with canonical keys after scoped migrations are explicitly approved.',
      'Continue reading legacy runtime records through legacyRuntimeWorkspaceKey and legacyRuntimeProjectKey until a tested database migration is scheduled.',
      'Backfill reporting views and registries before any future destructive rename is considered.',
    ],
    blocked_without_operator_approval: [
      'Renaming existing database rows.',
      'Dropping legacy aliases.',
      'Moving One Time private product data into BNA School.',
    ],
  };
}

function ticketRoutingPayload() {
  return {
    version: WORKSPACE_TAXONOMY_VERSION,
    records: TICKET_ROUTING_RECORDS,
  };
}

module.exports = {
  WORKSPACE_TAXONOMY_VERSION,
  CANONICAL_WORKSPACES,
  CANONICAL_PROJECTS,
  WORKSPACE_ALIASES,
  PROJECT_ALIASES,
  ROLE_ALIASES,
  TICKET_ROUTING_RECORDS,
  LIVE_CLASS_QUESTION_STATUSES,
  BUSINESS_CONVERSATION_EXAMPLES,
  TECHNICAL_TICKET_SOURCE_WORKSPACES,
  taxonomyToken,
  resolveWorkspaceKey,
  resolveProjectKey,
  resolveRole,
  workspaceForProjectKey,
  legacyRuntimeWorkspaceKey,
  legacyRuntimeProjectKey,
  canonicalWorkspaceList,
  workspaceTaxonomyPayload,
  compatibilityMigrationPlan,
  ticketRoutingPayload,
};
