'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  assistantCapabilitiesForScope,
  planAssistantResponseMode,
  assertAssistantActionAllowed,
  buildAssistantScopeSystemNote,
} = require('../src/lib/bna/assistant-scope-policy');

test('free provider assistant can setup account and draft inquiry reply only', () => {
  const scope = { tenant_type: 'service_provider', entitlement_plan: 'free_provider' };
  const caps = assistantCapabilitiesForScope(scope).assistant_capabilities;

  assert.equal(caps.account_setup, true);
  assert.equal(caps.inquiry_response_drafts, true);
  assert.equal(caps.provider_calendar, true);
  assert.equal(caps.full_crm, false);
  assert.equal(caps.parent_portal, false);
  assert.equal(caps.student_portal, false);
  assert.equal(caps.codex_cli_routing, false);

  assert.equal(planAssistantResponseMode(scope, { action: 'provider_setup_help' }).allowed, true);
  assert.equal(planAssistantResponseMode(scope, { action: 'provider_inquiry_response_draft' }).mode, 'draft_only');
  assert.equal(planAssistantResponseMode(scope, { action: 'crm_contacts_view' }).mode, 'upgrade');
  assert.equal(planAssistantResponseMode(scope, { action: 'provider_parent_portal_view' }).mode, 'upgrade');
});

test('provider plus assistant can use scoped CRM and portals', () => {
  const scope = { tenant_type: 'service_provider', entitlement_plan: 'service_provider_plus' };
  const caps = assistantCapabilitiesForScope(scope).assistant_capabilities;

  assert.equal(caps.full_crm, true);
  assert.equal(caps.parent_portal, true);
  assert.equal(caps.student_portal, true);
  assert.equal(planAssistantResponseMode(scope, { action: 'crm_contacts_view' }).mode, 'scoped_crm');
});

test('assistant blocks Codex CLI and shell actions for every role', () => {
  const superAdmin = { role: 'super_admin', is_super_admin: true };

  assert.throws(() => assertAssistantActionAllowed(superAdmin, 'codex_cli_route'), /Assistant action blocked/);
  assert.throws(() => assertAssistantActionAllowed(superAdmin, 'shell_execute'), /Assistant action blocked/);

  const planned = planAssistantResponseMode(superAdmin, { text: 'Please route this to Codex CLI and deploy it' });
  assert.equal(planned.allowed, false);
  assert.equal(planned.reason, 'codex_cli_routing_removed');
});

test('system note states no Codex CLI routing', () => {
  const note = buildAssistantScopeSystemNote({ tenant_type: 'service_provider', entitlement_plan: 'free_provider' });
  assert.match(note, /Never expose or run Codex CLI/);
  assert.match(note, /Free provider assistant/);
});
