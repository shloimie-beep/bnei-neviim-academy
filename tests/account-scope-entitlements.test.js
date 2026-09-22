'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ENTITLEMENTS,
  resolvePlanKey,
  hasEntitlement,
  entitlementStatus,
  providerPortalSections,
  canPerformAction,
  assertActionAllowed,
  summarizeScope,
} = require('../src/lib/bna/account-scope-entitlements');

test('free provider gets setup, inquiry reply, and calendar but no CRM or portals', () => {
  const scope = {
    tenant_type: 'service_provider',
    entitlement_plan: 'free_provider',
    workspace_key: 'provider_free_1',
  };

  assert.equal(resolvePlanKey(scope), 'free_provider');
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.PUBLIC_PROFILE), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.PROVIDER_CONTACT_INBOX), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.PROVIDER_CALENDAR), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.PARENT_CONTACT_REPLY_BOT), true);

  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CRM_CONTACTS), false);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CRM_FILTERS), false);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.PARENT_PORTAL), false);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.STUDENT_PORTAL), false);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CODEX_CLI_ROUTING), false);

  assert.equal(entitlementStatus(scope, ENTITLEMENTS.PARENT_PORTAL).visibility, 'upgrade');
  assert.equal(canPerformAction(scope, 'provider_inquiry_response_draft'), true);
  assert.equal(canPerformAction(scope, 'crm_contacts_view'), false);
  assert.throws(() => assertActionAllowed(scope, 'crm_contacts_view'), /Entitlement denied/);
});

test('provider plus gets CRM and paid portals', () => {
  const scope = {
    tenant_type: 'service_provider',
    entitlement_plan: 'service_provider_plus',
    workspace_key: 'provider_plus_1',
  };

  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CRM_CONTACTS), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CRM_FILTERS), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.PARENT_PORTAL), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.STUDENT_PORTAL), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.SOCIAL_DRAFTS), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CODEX_CLI_ROUTING), false);
});

test('rabbi scheller workspace resolves as partner plus', () => {
  const scope = {
    tenant_type: 'service_provider',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  };

  assert.equal(resolvePlanKey(scope), 'rabbi_scheller_partner');
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CRM_CONTACTS), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CUSTOM_PARTNERSHIP_TERMS), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.PARENT_PORTAL), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.STUDENT_PORTAL), true);
});

test('school is just school and has school-only YouTube assignments', () => {
  const scope = {
    tenant_type: 'school',
    entitlement_plan: 'school_plus',
    workspace_key: 'bna_school',
  };

  assert.equal(resolvePlanKey(scope), 'school');
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.SCHOOL_YOUTUBE_ASSIGNMENTS), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.PARENT_PORTAL), true);
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.STUDENT_PORTAL), true);
});

test('provider portal sections differ by free versus plus', () => {
  const freeSections = providerPortalSections({ tenant_type: 'service_provider', entitlement_plan: 'free_provider' }).map((s) => s.id);
  const plusSections = providerPortalSections({ tenant_type: 'service_provider', entitlement_plan: 'service_provider_plus' }).map((s) => s.id);

  assert.deepEqual(freeSections, ['overview', 'profile', 'services', 'inquiries', 'calendar', 'comments', 'media', 'support', 'upgrade']);
  assert.ok(plusSections.includes('crm'));
  assert.ok(plusSections.includes('parent_portal'));
  assert.ok(plusSections.includes('student_portal'));
});

test('Codex CLI routing is disabled even for super admin', () => {
  const scope = { role: 'super_admin', is_super_admin: true };
  const summary = summarizeScope(scope);

  assert.equal(summary.plan_key, 'super_admin');
  assert.equal(hasEntitlement(scope, ENTITLEMENTS.CODEX_CLI_ROUTING), false);
  assert.equal(canPerformAction(scope, 'codex_cli_route'), false);
  assert.equal(summary.codex_cli_routing_enabled, false);
});
