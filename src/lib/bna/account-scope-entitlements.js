'use strict';

/**
 * Account/workspace scope entitlement model.
 *
 * This module is intentionally pure and DB-free so it can be used by:
 * - server route guards;
 * - provider portal session shaping;
 * - Operations nav shaping;
 * - assistant/action policy checks;
 * - tests.
 *
 * Do not add GHL or external CRM concepts here. CRM means first-party BNA
 * Operations CRM only.
 */

const TENANT_TYPES = Object.freeze({
  SCHOOL: 'school',
  SERVICE_PROVIDER: 'service_provider',
  FAMILY: 'family',
});

const PLAN_KEYS = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  SCHOOL: 'school',
  FREE_PROVIDER: 'free_provider',
  FREE_LISTING: 'free_listing',
  SERVICE_PROVIDER_PLUS: 'service_provider_plus',
  MANAGED_PROVIDER: 'managed_provider',
  REVENUE_SHARE_PARTNER: 'revenue_share_partner',
  RABBI_SCHELLER_PARTNER: 'rabbi_scheller_partner',
  FAMILY: 'family',
});

const ENTITLEMENTS = Object.freeze({
  PUBLIC_PROFILE: 'public_profile',
  PROVIDER_INDEX: 'provider_index',
  LISTING_COMMENTS: 'listing_comments',
  PROVIDER_CONTACT_INBOX: 'provider_contact_inbox',
  PROVIDER_CALENDAR: 'provider_calendar',
  ACCOUNT_SETUP_BOT: 'account_setup_bot',
  PARENT_CONTACT_REPLY_BOT: 'parent_contact_reply_bot',
  LIMITED_ANALYTICS: 'limited_analytics',
  SUPPORT_TICKETS: 'support_tickets',

  CRM_CONTACTS: 'crm_contacts',
  CRM_FILTERS: 'crm_filters',
  CRM_PIPELINE: 'crm_pipeline',
  CONTACT_TIMELINE: 'contact_timeline',

  PARENT_PORTAL: 'parent_portal',
  STUDENT_PORTAL: 'student_portal',

  CONTENT_WORKFLOW: 'content_workflow',
  SOCIAL_DRAFTS: 'social_drafts',
  SOCIAL_PUBLISH: 'social_publish',
  WHATSAPP_READBACK: 'whatsapp_readback',
  WHATSAPP_AUTOMATION: 'whatsapp_automation',
  EMAIL_WORKFLOWS: 'email_workflows',
  LANDING_PAGE_FUNNEL: 'landing_page_funnel',
  AUTOMATIONS: 'automations',
  INTEGRATIONS_READINESS: 'integrations_readiness',
  PAYMENT_ACCESS_READINESS: 'payment_access_readiness',
  REPORTING: 'reporting',
  CUSTOM_PARTNERSHIP_TERMS: 'custom_partnership_terms',

  SCHOOL_PARENT_RECORDS: 'school_parent_records',
  SCHOOL_STUDENT_RECORDS: 'school_student_records',
  SCHOOL_YOUTUBE_ASSIGNMENTS: 'school_youtube_assignments',

  VIEW_AS_SCOPED_ACCOUNT: 'view_as_scoped_account',
  CODEX_CLI_ROUTING: 'codex_cli_routing',
});

const BASE_FREE_PROVIDER = [
  ENTITLEMENTS.PUBLIC_PROFILE,
  ENTITLEMENTS.PROVIDER_INDEX,
  ENTITLEMENTS.LISTING_COMMENTS,
  ENTITLEMENTS.PROVIDER_CONTACT_INBOX,
  ENTITLEMENTS.PROVIDER_CALENDAR,
  ENTITLEMENTS.ACCOUNT_SETUP_BOT,
  ENTITLEMENTS.PARENT_CONTACT_REPLY_BOT,
  ENTITLEMENTS.LIMITED_ANALYTICS,
  ENTITLEMENTS.SUPPORT_TICKETS,
];

const BASE_PROVIDER_PLUS = [
  ...BASE_FREE_PROVIDER,
  ENTITLEMENTS.CRM_CONTACTS,
  ENTITLEMENTS.CRM_FILTERS,
  ENTITLEMENTS.CRM_PIPELINE,
  ENTITLEMENTS.CONTACT_TIMELINE,
  ENTITLEMENTS.PARENT_PORTAL,
  ENTITLEMENTS.STUDENT_PORTAL,
  ENTITLEMENTS.CONTENT_WORKFLOW,
  ENTITLEMENTS.SOCIAL_DRAFTS,
  ENTITLEMENTS.WHATSAPP_READBACK,
  ENTITLEMENTS.EMAIL_WORKFLOWS,
  ENTITLEMENTS.LANDING_PAGE_FUNNEL,
  ENTITLEMENTS.AUTOMATIONS,
  ENTITLEMENTS.INTEGRATIONS_READINESS,
  ENTITLEMENTS.PAYMENT_ACCESS_READINESS,
  ENTITLEMENTS.REPORTING,
];

const PLAN_ENTITLEMENTS = Object.freeze({
  [PLAN_KEYS.SUPER_ADMIN]: [
    ...Object.values(ENTITLEMENTS).filter((key) => key !== ENTITLEMENTS.CODEX_CLI_ROUTING),
  ],
  [PLAN_KEYS.SCHOOL]: [
    ENTITLEMENTS.CRM_CONTACTS,
    ENTITLEMENTS.CRM_FILTERS,
    ENTITLEMENTS.CRM_PIPELINE,
    ENTITLEMENTS.CONTACT_TIMELINE,
    ENTITLEMENTS.PARENT_PORTAL,
    ENTITLEMENTS.STUDENT_PORTAL,
    ENTITLEMENTS.PROVIDER_CALENDAR,
    ENTITLEMENTS.SUPPORT_TICKETS,
    ENTITLEMENTS.CONTENT_WORKFLOW,
    ENTITLEMENTS.SOCIAL_DRAFTS,
    ENTITLEMENTS.WHATSAPP_READBACK,
    ENTITLEMENTS.EMAIL_WORKFLOWS,
    ENTITLEMENTS.AUTOMATIONS,
    ENTITLEMENTS.INTEGRATIONS_READINESS,
    ENTITLEMENTS.REPORTING,
    ENTITLEMENTS.SCHOOL_PARENT_RECORDS,
    ENTITLEMENTS.SCHOOL_STUDENT_RECORDS,
    ENTITLEMENTS.SCHOOL_YOUTUBE_ASSIGNMENTS,
  ],
  [PLAN_KEYS.FREE_PROVIDER]: BASE_FREE_PROVIDER,
  [PLAN_KEYS.FREE_LISTING]: BASE_FREE_PROVIDER,
  [PLAN_KEYS.MANAGED_PROVIDER]: BASE_PROVIDER_PLUS,
  [PLAN_KEYS.SERVICE_PROVIDER_PLUS]: BASE_PROVIDER_PLUS,
  [PLAN_KEYS.REVENUE_SHARE_PARTNER]: [
    ...BASE_PROVIDER_PLUS,
    ENTITLEMENTS.CUSTOM_PARTNERSHIP_TERMS,
  ],
  [PLAN_KEYS.RABBI_SCHELLER_PARTNER]: [
    ...BASE_PROVIDER_PLUS,
    ENTITLEMENTS.CUSTOM_PARTNERSHIP_TERMS,
  ],
  [PLAN_KEYS.FAMILY]: [
    ENTITLEMENTS.PARENT_PORTAL,
    ENTITLEMENTS.STUDENT_PORTAL,
    ENTITLEMENTS.SUPPORT_TICKETS,
  ],
});

const ACTION_ENTITLEMENTS = Object.freeze({
  provider_setup_help: ENTITLEMENTS.ACCOUNT_SETUP_BOT,
  provider_listing_edit: ENTITLEMENTS.PUBLIC_PROFILE,
  provider_service_edit: ENTITLEMENTS.PUBLIC_PROFILE,
  provider_comment_reply: ENTITLEMENTS.LISTING_COMMENTS,
  provider_inquiry_view: ENTITLEMENTS.PROVIDER_CONTACT_INBOX,
  provider_inquiry_response_draft: ENTITLEMENTS.PARENT_CONTACT_REPLY_BOT,
  provider_calendar_view: ENTITLEMENTS.PROVIDER_CALENDAR,
  provider_calendar_manage: ENTITLEMENTS.PROVIDER_CALENDAR,

  crm_contacts_view: ENTITLEMENTS.CRM_CONTACTS,
  crm_contacts_filter: ENTITLEMENTS.CRM_FILTERS,
  crm_contact_timeline: ENTITLEMENTS.CONTACT_TIMELINE,
  crm_pipeline_update: ENTITLEMENTS.CRM_PIPELINE,

  provider_parent_portal_view: ENTITLEMENTS.PARENT_PORTAL,
  provider_parent_portal_manage: ENTITLEMENTS.PARENT_PORTAL,
  provider_student_portal_view: ENTITLEMENTS.STUDENT_PORTAL,
  provider_student_portal_manage: ENTITLEMENTS.STUDENT_PORTAL,

  content_workflow_view: ENTITLEMENTS.CONTENT_WORKFLOW,
  social_draft_prepare: ENTITLEMENTS.SOCIAL_DRAFTS,
  whatsapp_history_view: ENTITLEMENTS.WHATSAPP_READBACK,
  automation_preview: ENTITLEMENTS.AUTOMATIONS,
  integrations_readiness_view: ENTITLEMENTS.INTEGRATIONS_READINESS,
  payment_access_readiness_view: ENTITLEMENTS.PAYMENT_ACCESS_READINESS,

  school_youtube_assignment_schedule: ENTITLEMENTS.SCHOOL_YOUTUBE_ASSIGNMENTS,

  view_as_scoped_account: ENTITLEMENTS.VIEW_AS_SCOPED_ACCOUNT,

  // Explicitly blocked from every portal assistant.
  codex_cli_route: ENTITLEMENTS.CODEX_CLI_ROUTING,
  shell_execute: ENTITLEMENTS.CODEX_CLI_ROUTING,
  deploy_execute: ENTITLEMENTS.CODEX_CLI_ROUTING,
  migration_execute: ENTITLEMENTS.CODEX_CLI_ROUTING,
  secret_copy: ENTITLEMENTS.CODEX_CLI_ROUTING,
});

function normalizeTenantType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'provider') return TENANT_TYPES.SERVICE_PROVIDER;
  if (normalized === 'school_workspace' || normalized === 'micro_school') return TENANT_TYPES.SCHOOL;
  if (normalized === 'household' || normalized === 'family_app') return TENANT_TYPES.FAMILY;
  if (Object.values(TENANT_TYPES).includes(normalized)) return normalized;
  return normalized || TENANT_TYPES.SERVICE_PROVIDER;
}

function normalizePlanKey(value, tenantType = '') {
  const normalized = String(value || '').trim().toLowerCase();
  const tenant = normalizeTenantType(tenantType);

  if (tenant === TENANT_TYPES.SCHOOL) return PLAN_KEYS.SCHOOL;
  if (tenant === TENANT_TYPES.FAMILY) return PLAN_KEYS.FAMILY;

  if (!normalized) {
    return tenant === TENANT_TYPES.SERVICE_PROVIDER ? PLAN_KEYS.FREE_PROVIDER : PLAN_KEYS.FAMILY;
  }

  const aliases = {
    free: PLAN_KEYS.FREE_PROVIDER,
    free_listing: PLAN_KEYS.FREE_PROVIDER,
    listed_free: PLAN_KEYS.FREE_PROVIDER,
    provider_free: PLAN_KEYS.FREE_PROVIDER,

    plus: PLAN_KEYS.SERVICE_PROVIDER_PLUS,
    provider_plus: PLAN_KEYS.SERVICE_PROVIDER_PLUS,
    service_provider_plus: PLAN_KEYS.SERVICE_PROVIDER_PLUS,
    managed_setup: PLAN_KEYS.SERVICE_PROVIDER_PLUS,
    managed_provider: PLAN_KEYS.SERVICE_PROVIDER_PLUS,
    paid_setup: PLAN_KEYS.SERVICE_PROVIDER_PLUS,
    monthly_management: PLAN_KEYS.SERVICE_PROVIDER_PLUS,

    revenue_share: PLAN_KEYS.REVENUE_SHARE_PARTNER,
    revenue_share_partner: PLAN_KEYS.REVENUE_SHARE_PARTNER,
    custom_partner: PLAN_KEYS.REVENUE_SHARE_PARTNER,
    rabbi_scheller: PLAN_KEYS.RABBI_SCHELLER_PARTNER,
    rabbi_scheller_partner: PLAN_KEYS.RABBI_SCHELLER_PARTNER,
    rabbi_sheller_provider: PLAN_KEYS.RABBI_SCHELLER_PARTNER,

    school: PLAN_KEYS.SCHOOL,
    school_workspace: PLAN_KEYS.SCHOOL,
    school_subscription: PLAN_KEYS.SCHOOL,

    family: PLAN_KEYS.FAMILY,
  };

  return aliases[normalized] || normalized;
}

function resolvePlanKey(scope = {}) {
  if (scope.is_super_admin || scope.role === 'super_admin' || scope.plan_key === PLAN_KEYS.SUPER_ADMIN) {
    return PLAN_KEYS.SUPER_ADMIN;
  }

  const tenantType = normalizeTenantType(scope.tenant_type || scope.workspace_type);
  const workspaceKey = String(scope.workspace_key || scope.workspaceKey || '').toLowerCase();
  const projectKey = String(scope.project_key || scope.projectKey || '').toLowerCase();

  if (workspaceKey === 'rabbi_sheller_provider' || projectKey === 'one_time_mishnah_class') {
    return PLAN_KEYS.RABBI_SCHELLER_PARTNER;
  }

  if (tenantType === TENANT_TYPES.SCHOOL) return PLAN_KEYS.SCHOOL;
  if (tenantType === TENANT_TYPES.FAMILY) return PLAN_KEYS.FAMILY;

  return normalizePlanKey(
    scope.plan_key ||
    scope.entitlement_plan ||
    scope.commercial_model ||
    scope.provider_plan ||
    scope.provider_status,
    tenantType
  );
}

function entitlementSetFor(scope = {}) {
  const planKey = resolvePlanKey(scope);
  const values = new Set(PLAN_ENTITLEMENTS[planKey] || []);

  // Codex CLI routing is disabled even if a stale row/config says otherwise.
  values.delete(ENTITLEMENTS.CODEX_CLI_ROUTING);

  // Provider portals are paid. Allow explicit workspace override to enable/disable
  // only when the base plan is Provider Plus/partner/school.
  const overrides = scope.feature_overrides || scope.entitlement_overrides || {};
  for (const [key, enabled] of Object.entries(overrides)) {
    if (key === ENTITLEMENTS.CODEX_CLI_ROUTING) continue;
    if (enabled) values.add(key);
    else values.delete(key);
  }

  return values;
}

function hasEntitlement(scope, entitlementKey) {
  if (entitlementKey === ENTITLEMENTS.CODEX_CLI_ROUTING) return false;
  return entitlementSetFor(scope).has(entitlementKey);
}

function entitlementStatus(scope, entitlementKey) {
  const allowed = hasEntitlement(scope, entitlementKey);
  if (allowed) return { allowed: true, visibility: 'visible', reason: 'included' };

  const planKey = resolvePlanKey(scope);
  const tenantType = normalizeTenantType(scope.tenant_type || scope.workspace_type);

  if (
    tenantType === TENANT_TYPES.SERVICE_PROVIDER &&
    [ENTITLEMENTS.CRM_CONTACTS, ENTITLEMENTS.CRM_FILTERS, ENTITLEMENTS.CRM_PIPELINE, ENTITLEMENTS.PARENT_PORTAL, ENTITLEMENTS.STUDENT_PORTAL].includes(entitlementKey)
  ) {
    return { allowed: false, visibility: 'upgrade', reason: 'requires_provider_plus' };
  }

  if (entitlementKey === ENTITLEMENTS.CODEX_CLI_ROUTING) {
    return { allowed: false, visibility: 'hidden', reason: 'codex_cli_routing_removed' };
  }

  return { allowed: false, visibility: 'hidden', reason: `not_in_plan:${planKey}` };
}

function assertEntitlement(scope, entitlementKey) {
  const status = entitlementStatus(scope, entitlementKey);
  if (status.allowed) return true;
  const error = new Error(`Entitlement denied: ${entitlementKey} (${status.reason})`);
  error.status = status.visibility === 'upgrade' ? 402 : 403;
  error.code = 'ENTITLEMENT_DENIED';
  error.entitlement = entitlementKey;
  error.reason = status.reason;
  throw error;
}

function requiredEntitlementForAction(actionKey) {
  return ACTION_ENTITLEMENTS[actionKey] || null;
}

function canPerformAction(scope, actionKey) {
  const entitlement = requiredEntitlementForAction(actionKey);
  if (!entitlement) return false;
  return hasEntitlement(scope, entitlement);
}

function assertActionAllowed(scope, actionKey) {
  const entitlement = requiredEntitlementForAction(actionKey);
  if (!entitlement) {
    const error = new Error(`Unknown or unsupported action: ${actionKey}`);
    error.status = 400;
    error.code = 'UNKNOWN_ACTION';
    throw error;
  }
  assertEntitlement(scope, entitlement);
  return true;
}

function providerPortalSections(scope = {}) {
  const plus = hasEntitlement(scope, ENTITLEMENTS.CRM_CONTACTS);
  const sections = plus ? [
    'overview',
    'crm',
    'calendar',
    'parent_portal',
    'student_portal',
    'content',
    'communications',
    'automations',
    'integrations',
    'reporting',
    'settings',
    'support',
  ] : [
    'overview',
    'profile',
    'services',
    'inquiries',
    'calendar',
    'comments',
    'media',
    'support',
    'upgrade',
  ];

  return sections.map((id) => {
    const portalEntitlement = id === 'parent_portal'
      ? ENTITLEMENTS.PARENT_PORTAL
      : id === 'student_portal'
        ? ENTITLEMENTS.STUDENT_PORTAL
        : null;

    if (portalEntitlement && !hasEntitlement(scope, portalEntitlement)) {
      return { id, enabled: false, visibility: 'upgrade', reason: 'paid_provider_portal' };
    }
    return { id, enabled: true, visibility: 'visible' };
  });
}

function summarizeScope(scope = {}) {
  const tenantType = normalizeTenantType(scope.tenant_type || scope.workspace_type);
  const planKey = resolvePlanKey(scope);
  const entitlements = Array.from(entitlementSetFor(scope)).sort();

  return {
    tenant_type: tenantType,
    plan_key: planKey,
    workspace_key: scope.workspace_key || scope.workspaceKey || null,
    project_key: scope.project_key || scope.projectKey || null,
    is_super_admin: Boolean(scope.is_super_admin || scope.role === 'super_admin'),
    entitlements,
    provider_sections: tenantType === TENANT_TYPES.SERVICE_PROVIDER ? providerPortalSections(scope) : [],
    codex_cli_routing_enabled: false,
  };
}

module.exports = {
  TENANT_TYPES,
  PLAN_KEYS,
  ENTITLEMENTS,
  PLAN_ENTITLEMENTS,
  ACTION_ENTITLEMENTS,
  normalizeTenantType,
  normalizePlanKey,
  resolvePlanKey,
  entitlementSetFor,
  hasEntitlement,
  entitlementStatus,
  assertEntitlement,
  requiredEntitlementForAction,
  canPerformAction,
  assertActionAllowed,
  providerPortalSections,
  summarizeScope,
};
