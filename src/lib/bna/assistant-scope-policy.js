'use strict';

const {
  ENTITLEMENTS,
  hasEntitlement,
  canPerformAction,
  assertActionAllowed,
  summarizeScope,
} = require('./account-scope-entitlements');
const studioSidekickPolicy = require('./one-time-studio-sidekick-policy');

const BLOCKED_DANGEROUS_ASSISTANT_ACTIONS = new Set([
  'codex_cli_route',
  'shell_execute',
  'deploy_execute',
  'migration_execute',
  'secret_copy',
  'railway_mutation',
  'external_send',
  'whatsapp_broadcast',
  'email_campaign_send',
  'social_publish',
  'payment_charge',
  'access_grant',
  'dns_change',
]);

function assistantCapabilitiesForScope(scope = {}) {
  const summary = summarizeScope(scope);
  const capabilities = {
    account_setup: hasEntitlement(scope, ENTITLEMENTS.ACCOUNT_SETUP_BOT),
    provider_listing: hasEntitlement(scope, ENTITLEMENTS.PUBLIC_PROFILE),
    inquiry_response_drafts: hasEntitlement(scope, ENTITLEMENTS.PARENT_CONTACT_REPLY_BOT),
    provider_calendar: hasEntitlement(scope, ENTITLEMENTS.PROVIDER_CALENDAR),
    full_crm: hasEntitlement(scope, ENTITLEMENTS.CRM_CONTACTS),
    crm_filters: hasEntitlement(scope, ENTITLEMENTS.CRM_FILTERS),
    parent_portal: hasEntitlement(scope, ENTITLEMENTS.PARENT_PORTAL),
    student_portal: hasEntitlement(scope, ENTITLEMENTS.STUDENT_PORTAL),
    content_workflow: hasEntitlement(scope, ENTITLEMENTS.CONTENT_WORKFLOW),
    social_drafts: hasEntitlement(scope, ENTITLEMENTS.SOCIAL_DRAFTS),
    school_youtube_assignments: hasEntitlement(scope, ENTITLEMENTS.SCHOOL_YOUTUBE_ASSIGNMENTS),
    support_tickets: hasEntitlement(scope, ENTITLEMENTS.SUPPORT_TICKETS),
    studio_sidekick: studioSidekickPolicy.isOneTimeStudioOperatorScope(scope),
    studio_repair_requests: studioSidekickPolicy.isOneTimeStudioOperatorScope(scope),

    // Globally removed from user-facing assistants.
    codex_cli_routing: false,
    shell: false,
    deploy: false,
    migrations: false,
    secrets: false,
    external_sends: false,
  };

  return {
    ...summary,
    assistant_capabilities: capabilities,
  };
}

function assertAssistantActionAllowed(scope = {}, actionKey = '') {
  if (BLOCKED_DANGEROUS_ASSISTANT_ACTIONS.has(actionKey)) {
    const error = new Error(`Assistant action blocked: ${actionKey}`);
    error.status = 403;
    error.code = 'ASSISTANT_ACTION_BLOCKED';
    error.reason = 'dangerous_or_removed_assistant_capability';
    throw error;
  }

  return assertActionAllowed(scope, actionKey);
}

function planAssistantResponseMode(scope = {}, request = {}) {
  const action = String(request.action || '').trim();
  const text = String(request.text || '').toLowerCase();
  const capabilities = assistantCapabilitiesForScope(scope).assistant_capabilities;

  if (action === studioSidekickPolicy.STUDIO_REPAIR_ACTION) {
    return studioSidekickPolicy.planOneTimeStudioRepairRequest(scope, request);
  }

  if (
    action === 'codex_cli_route' ||
    text.includes('codex cli') ||
    text.includes('run codex') ||
    text.includes('deploy') ||
    text.includes('migration') ||
    text.includes('shell')
  ) {
    return {
      allowed: false,
      mode: 'deny',
      reason: 'codex_cli_routing_removed',
      message: 'This assistant cannot run Codex CLI, shell, deploy, migrations, or unrestricted diagnostics. Create a scoped task or support ticket instead.',
    };
  }

  if (action === 'provider_setup_help') {
    return capabilities.account_setup
      ? { allowed: true, mode: 'coach', action }
      : { allowed: false, mode: 'deny', reason: 'setup_not_in_scope' };
  }

  if (action === 'provider_inquiry_response_draft') {
    return capabilities.inquiry_response_drafts
      ? { allowed: true, mode: 'draft_only', action, no_send: true }
      : { allowed: false, mode: 'deny', reason: 'inquiry_reply_not_in_scope' };
  }

  if (action.startsWith('crm_')) {
    return capabilities.full_crm
      ? { allowed: true, mode: 'scoped_crm', action }
      : { allowed: false, mode: 'upgrade', reason: 'crm_requires_provider_plus' };
  }

  if (action.includes('parent_portal') || action.includes('student_portal')) {
    const allowed = action.includes('parent_portal') ? capabilities.parent_portal : capabilities.student_portal;
    return allowed
      ? { allowed: true, mode: 'scoped_portal', action }
      : { allowed: false, mode: 'upgrade', reason: 'provider_portals_are_paid' };
  }

  if (canPerformAction(scope, action)) {
    return { allowed: true, mode: 'scoped_action', action };
  }

  return {
    allowed: false,
    mode: 'support_or_explain',
    reason: 'unsupported_or_out_of_scope',
  };
}

function buildAssistantScopeSystemNote(scope = {}) {
  const summary = assistantCapabilitiesForScope(scope);
  const caps = summary.assistant_capabilities;
  const lines = [
    `Workspace scope: ${summary.workspace_key || 'none'} / ${summary.project_key || 'none'}.`,
    `Tenant type: ${summary.tenant_type}. Plan: ${summary.plan_key}.`,
    'Never expose or run Codex CLI, shell, deployments, migrations, secret copying, or external writes.',
  ];

  if (summary.plan_key === 'free_provider' || summary.plan_key === 'free_listing') {
    lines.push('Free provider assistant may help setup the listing, manage provider calendar, and draft replies to parent inquiries. It may not open CRM, parent portal, student portal, content/social workflows, integrations, payments, or automations.');
  }

  if (caps.full_crm) {
    lines.push('CRM help is allowed only inside the selected workspace/project and must not send messages.');
  }

  if (caps.studio_sidekick) {
    lines.push('One Time Studio operator may draft prompt/image patches, OpenArt prompt exports, and Studio-only repair requests. This is not raw CLI or shell access.');
  }

  return lines.join('\\n');
}

module.exports = {
  BLOCKED_DANGEROUS_ASSISTANT_ACTIONS,
  assistantCapabilitiesForScope,
  assertAssistantActionAllowed,
  planAssistantResponseMode,
  buildAssistantScopeSystemNote,
};
