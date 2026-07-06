const ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY = 'rabbi_sheller_provider';
const ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY = 'one_time_mishnah_class';

const MAIN_MODULES = [
  {
    id: 'overview_package_status',
    label: 'Overview / Package Status',
    short_label: 'Overview',
    default_section: 'package_status',
    operations_view: 'service_providers',
  },
  {
    id: 'members_crm',
    label: 'Members / CRM',
    short_label: 'Members',
    default_section: 'members',
    operations_view: 'contacts',
  },
  {
    id: 'classes_content',
    label: 'Classes & Content',
    short_label: 'Content',
    default_section: 'library',
    operations_view: 'content',
  },
  {
    id: 'live_class_schedule',
    label: 'Live Class',
    short_label: 'Live',
    default_section: 'overview',
    operations_view: 'live_classes',
  },
  {
    id: 'program_schedule',
    label: 'Schedule',
    short_label: 'Schedule',
    default_section: 'provider',
    operations_view: 'calendar',
  },
  {
    id: 'community_questions',
    label: 'Community',
    short_label: 'Community',
    default_section: 'overview',
    operations_view: 'community',
  },
  {
    id: 'communications',
    label: 'Communications',
    short_label: 'Comms',
    default_section: 'announcements',
    operations_view: 'communications',
  },
  {
    id: 'automations',
    label: 'Automations',
    short_label: 'Auto',
    default_section: 'enrollment',
    operations_view: 'automations',
  },
  {
    id: 'payments_access',
    label: 'Payments & Access',
    short_label: 'Payments',
    default_section: 'trial_offer',
    operations_view: 'service_providers',
  },
  {
    id: 'tasks_decisions',
    label: 'Tasks & Decisions',
    short_label: 'Tasks',
    default_section: 'decisions',
    operations_view: 'tasks',
  },
  {
    id: 'reporting_readiness',
    label: 'Reporting',
    short_label: 'Reports',
    default_section: 'provider',
    operations_view: 'api_usage',
  },
  {
    id: 'connector_setup',
    label: 'Connectors',
    short_label: 'Connectors',
    default_section: 'readiness',
    operations_view: 'integrations',
  },
  {
    id: 'settings_setup',
    label: 'Settings / Setup',
    short_label: 'Setup',
    default_section: 'workspace',
    operations_view: 'settings',
  },
];

const SECTION_SUBSECTION_MAP = {
  overview_package_status: {
    label: 'Overview / Package Status',
    subsections: [
      { id: 'package_status', label: 'Package Status', source_view: 'service_providers', source_section: 'overview' },
      { id: 'launch_readiness', label: 'Launch Readiness', source_view: 'service_providers', source_section: 'launch' },
      { id: 'review_links', label: 'Review Links', source_view: 'service_providers', source_section: 'access_checklist' },
      { id: 'blocked_actions', label: 'Blocked Actions', source_view: 'service_providers', source_section: 'integration_audit' },
    ],
  },
  members_crm: {
    label: 'Members / CRM',
    subsections: [
      { id: 'members', label: 'Members', source_view: 'contacts', source_section: 'members' },
      { id: 'leads', label: 'Leads', source_view: 'contacts', source_section: 'leads' },
      { id: 'parents_students', label: 'Parents & Students', source_view: 'contacts', source_section: 'people' },
      { id: 'support_questions', label: 'Support & Questions', source_view: 'community', source_section: 'questions' },
    ],
  },
  classes_content: {
    label: 'Classes & Content',
    subsections: [
      { id: 'library', label: 'Library', source_view: 'content', source_section: 'one_time_library' },
      { id: 'meeting_drops', label: 'Meeting Drops', source_view: 'content', source_section: 'meetings' },
      { id: 'source_prep', label: 'Source Prep', source_view: 'content', source_section: 'research' },
      { id: 'bundles', label: 'Bundles', source_view: 'content', source_section: 'bundles' },
    ],
  },
  live_class_schedule: {
    label: 'Live Class',
    subsections: [
      { id: 'overview', label: 'Overview', source_view: 'live_classes', source_section: 'overview' },
      { id: 'schedule', label: 'Class Schedule', source_view: 'service_providers', source_section: 'schedule' },
      { id: 'worksheets', label: 'Worksheets', source_view: 'service_providers', source_section: 'worksheets' },
      { id: 'questions', label: 'Questions', source_view: 'service_providers', source_section: 'questions' },
    ],
  },
  program_schedule: {
    label: 'Schedule',
    subsections: [
      { id: 'provider', label: 'Program Schedule', source_view: 'calendar', source_section: 'provider' },
      { id: 'today', label: 'Today', source_view: 'calendar', source_section: 'today' },
      { id: 'week', label: 'Week', source_view: 'calendar', source_section: 'week' },
      { id: 'classes', label: 'Class Sessions', source_view: 'calendar', source_section: 'classes' },
    ],
  },
  community_questions: {
    label: 'Community',
    subsections: [
      { id: 'overview', label: 'Overview', source_view: 'community', source_section: 'overview' },
      { id: 'courses', label: 'Courses', source_view: 'community', source_section: 'courses' },
      { id: 'questions', label: 'Questions', source_view: 'community', source_section: 'questions' },
      { id: 'approvals', label: 'Approvals', source_view: 'community', source_section: 'approvals' },
    ],
  },
  communications: {
    label: 'Communications',
    subsections: [
      { id: 'announcements', label: 'Announcements', source_view: 'communications', source_section: 'announcements' },
      { id: 'email_previews', label: 'Email Previews', source_view: 'communications', source_section: 'email' },
      { id: 'support_replies', label: 'Support Replies', source_view: 'communications', source_section: 'support' },
      { id: 'no_send_log', label: 'No-send Log', source_view: 'communications', source_section: 'drafts' },
    ],
  },
  automations: {
    label: 'Automations',
    subsections: [
      { id: 'enrollment', label: 'Enrollment', source_view: 'automations', source_section: 'enrollment' },
      { id: 'class_reminders', label: 'Class Reminders', source_view: 'automations', source_section: 'classes' },
      { id: 'content_publishing', label: 'Content Publishing', source_view: 'automations', source_section: 'content' },
      { id: 'retention_support', label: 'Retention & Support', source_view: 'automations', source_section: 'support' },
    ],
  },
  payments_access: {
    label: 'Payments & Access',
    subsections: [
      { id: 'trial_offer', label: 'Trial & Offer', source_view: 'service_providers', source_section: 'tiers' },
      { id: 'billing_readiness', label: 'Billing Readiness', source_view: 'service_providers', source_section: 'commercial' },
      { id: 'member_access', label: 'Member Access', source_view: 'service_providers', source_section: 'access' },
      { id: 'access_blockers', label: 'Access Blockers', source_view: 'service_providers', source_section: 'access_checklist' },
    ],
  },
  tasks_decisions: {
    label: 'Tasks & Decisions',
    subsections: [
      { id: 'decisions', label: 'Decisions', source_view: 'tasks', source_section: 'decisions' },
      { id: 'tasks', label: 'Tasks', source_view: 'tasks', source_section: 'tasks' },
      { id: 'pending_external', label: 'Pending External', source_view: 'tasks', source_section: 'pending' },
      { id: 'activity', label: 'Activity', source_view: 'tasks', source_section: 'activity' },
    ],
  },
  reporting_readiness: {
    label: 'Reporting',
    subsections: [
      { id: 'provider', label: 'Provider Reporting', source_view: 'api_usage', source_section: 'provider' },
      { id: 'overview', label: 'Overview', source_view: 'api_usage', source_section: 'overview' },
      { id: 'errors', label: 'Errors', source_view: 'api_usage', source_section: 'errors' },
      { id: 'budgets', label: 'Budgets / Limits', source_view: 'api_usage', source_section: 'budgets' },
    ],
  },
  connector_setup: {
    label: 'Connectors',
    subsections: [
      { id: 'readiness', label: 'Readiness', source_view: 'integrations', source_section: 'readiness' },
      { id: 'owner_setup', label: 'Owner Setup', source_view: 'integrations', source_section: 'owner_setup' },
      { id: 'google', label: 'Google', source_view: 'integrations', source_section: 'google' },
      { id: 'communications', label: 'Communications', source_view: 'integrations', source_section: 'communications' },
    ],
  },
  settings_setup: {
    label: 'Settings / Setup',
    subsections: [
      { id: 'workspace', label: 'Workspace', source_view: 'settings', source_section: 'workspace' },
      { id: 'users_access', label: 'Users & Access', source_view: 'settings', source_section: 'users_access' },
      { id: 'brand_site', label: 'Brand & Site', source_view: 'settings', source_section: 'branding' },
      { id: 'integrations', label: 'Integration Setup', source_view: 'settings', source_section: 'external_apps' },
      { id: 'guardrails', label: 'Guardrails', source_view: 'settings', source_section: 'automations' },
    ],
  },
};

const REVIEW_LINKS = {
  one_time_landing: {
    label: 'One Time Landing',
    route: '/one-time',
    access: 'public_review',
    audience_scope: 'public_customer_review',
  },
  operations_workspace: {
    label: 'Rabbi Operations Workspace',
    route: '/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview',
    access: 'operations_auth_required',
    audience_scope: 'internal_private_operations',
  },
  provider_review: {
    label: 'Provider Review',
    route: '/provider.html?review=one-time',
    access: 'synthetic_review',
    audience_scope: 'provider_review',
  },
  parent_review: {
    label: 'Parent Review',
    route: '/parent.html?review=one-time',
    access: 'synthetic_review',
    audience_scope: 'parent_review',
  },
  student_review: {
    label: 'Student Review',
    route: '/student.html?review=one-time',
    access: 'synthetic_review',
    audience_scope: 'student_review',
  },
  classroom_review: {
    label: 'Classroom Review',
    route: '/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS',
    access: 'synthetic_review',
    audience_scope: 'classroom_review',
  },
  email_preview: {
    label: 'Email Previews',
    route: '/one-time-email-review.html',
    access: 'preview_only',
    audience_scope: 'email_preview',
  },
};

const INTERNAL_MODULES = {
  platform_support_label: 'Platform Support',
  demoted: [
    { id: 'agents', label: 'Agents', visibility: 'platform_support_demoted', surface: 'platform_support' },
    { id: 'watchdog', label: 'Watchdog', visibility: 'platform_support_demoted', surface: 'platform_support' },
    { id: 'pipelines', label: 'Pipelines', visibility: 'platform_support_demoted', surface: 'platform_support' },
    { id: 'internal_dialogue', label: 'Internal Dialogue', visibility: 'platform_support_demoted', surface: 'platform_support' },
  ],
  hidden: [
    { id: 'raw_implementation_handoffs', label: 'Implementation handoff files', visibility: 'hidden_from_rabbi_dashboard' },
    { id: 'tasks_pending_requirement_registers', label: 'Internal requirement registers', visibility: 'hidden_from_rabbi_dashboard' },
  ],
};

const TOP_RAIL_MODEL = Object.fromEntries(
  MAIN_MODULES.map((module) => [
    module.id,
    {
      module_id: module.id,
      label: module.label,
      default_item: module.default_section,
      items: SECTION_SUBSECTION_MAP[module.id].subsections.map((section) => ({
        id: section.id,
        label: section.label,
        source_view: section.source_view,
        source_section: section.source_section,
      })),
    },
  ]),
);

const MOBILE_LABEL_RULES = {
  breakpoint_px: 430,
  max_tab_label_chars: 14,
  prefer_short_labels: true,
  module_short_labels: Object.fromEntries(MAIN_MODULES.map((module) => [module.id, module.short_label])),
  status_chip_short_labels: {
    review_mode: 'Review',
    no_send: 'No-send',
    no_charge: 'No-charge',
    no_external_write: 'No-write',
  },
};

const STATUS_CHIP_MODEL = [
  {
    id: 'review_mode',
    label: 'Review mode',
    short_label: 'Review',
    tone: 'info',
    meaning: 'Synthetic review fixtures and review-only links are active.',
  },
  {
    id: 'no_send',
    label: 'No-send',
    short_label: 'No-send',
    tone: 'locked',
    meaning: 'Email, WhatsApp, SMS, and announcement sends require approval before live use.',
  },
  {
    id: 'no_charge',
    label: 'No-charge',
    short_label: 'No-charge',
    tone: 'locked',
    meaning: 'Checkout, billing, trial conversion, and access changes stay preview-only.',
  },
  {
    id: 'no_external_write',
    label: 'No external write',
    short_label: 'No-write',
    tone: 'locked',
    meaning: 'No CRM, Zoom, Vimeo, DNS, Railway, or production data mutation is part of review mode.',
  },
];

const ACCEPTANCE_ROUTES = Object.entries(REVIEW_LINKS).map(([key, link]) => ({
  key,
  label: link.label,
  route: link.route,
  workspace_key: ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY,
  project_key: ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY,
  access: link.access,
  audience_scope: link.audience_scope,
  external_write_performed: false,
  exposes_private_operations: link.access === 'operations_auth_required',
  public_customer_surface: link.access === 'public_review',
}));

const ONE_TIME_RABBI_DASHBOARD_IA = {
  workspace_key: ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY,
  project_key: ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY,
  main_modules: MAIN_MODULES,
  section_subsection_map: SECTION_SUBSECTION_MAP,
  review_links: REVIEW_LINKS,
  internal_modules: INTERNAL_MODULES,
  top_rail_model: TOP_RAIL_MODEL,
  mobile_label_rules: MOBILE_LABEL_RULES,
  status_chip_model: STATUS_CHIP_MODEL,
  acceptance_routes: ACCEPTANCE_ROUTES,
};

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

deepFreeze(ONE_TIME_RABBI_DASHBOARD_IA);

module.exports = {
  ONE_TIME_RABBI_DASHBOARD_WORKSPACE_KEY,
  ONE_TIME_RABBI_DASHBOARD_PROJECT_KEY,
  ONE_TIME_RABBI_DASHBOARD_MAIN_MODULES: ONE_TIME_RABBI_DASHBOARD_IA.main_modules,
  ONE_TIME_RABBI_DASHBOARD_SECTION_SUBSECTION_MAP: ONE_TIME_RABBI_DASHBOARD_IA.section_subsection_map,
  ONE_TIME_RABBI_DASHBOARD_REVIEW_LINKS: ONE_TIME_RABBI_DASHBOARD_IA.review_links,
  ONE_TIME_RABBI_DASHBOARD_INTERNAL_MODULES: ONE_TIME_RABBI_DASHBOARD_IA.internal_modules,
  ONE_TIME_RABBI_DASHBOARD_TOP_RAIL_MODEL: ONE_TIME_RABBI_DASHBOARD_IA.top_rail_model,
  ONE_TIME_RABBI_DASHBOARD_MOBILE_LABEL_RULES: ONE_TIME_RABBI_DASHBOARD_IA.mobile_label_rules,
  ONE_TIME_RABBI_DASHBOARD_STATUS_CHIP_MODEL: ONE_TIME_RABBI_DASHBOARD_IA.status_chip_model,
  ONE_TIME_RABBI_DASHBOARD_ACCEPTANCE_ROUTES: ONE_TIME_RABBI_DASHBOARD_IA.acceptance_routes,
  ONE_TIME_RABBI_DASHBOARD_IA,
};
