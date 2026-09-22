'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  assistantCapabilitiesForScope,
  planAssistantResponseMode,
  assertAssistantActionAllowed,
  buildAssistantScopeSystemNote,
} = require('../src/lib/bna/assistant-scope-policy');
const studioPolicy = require('../src/lib/bna/one-time-studio-sidekick-policy');

const studioOperatorScope = {
  role: 'one_time_ai_studio_operator',
  tenant_type: 'service_provider',
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
};

const aiVideoWorkerScope = {
  ...studioOperatorScope,
  role: 'one_time_ai_video_worker',
};

test('One Time Studio operator gets sidekick capabilities but no raw CLI or shell', () => {
  const caps = assistantCapabilitiesForScope(studioOperatorScope).assistant_capabilities;
  const workerCaps = assistantCapabilitiesForScope(aiVideoWorkerScope).assistant_capabilities;

  assert.equal(caps.studio_sidekick, true);
  assert.equal(caps.studio_repair_requests, true);
  assert.equal(workerCaps.studio_sidekick, true);
  assert.equal(workerCaps.studio_repair_requests, true);
  assert.equal(caps.codex_cli_routing, false);
  assert.equal(caps.shell, false);
  assert.equal(caps.deploy, false);
  assert.equal(caps.external_sends, false);
  assert.throws(() => assertAssistantActionAllowed(studioOperatorScope, 'codex_cli_route'), /Assistant action blocked/);
  assert.throws(() => assertAssistantActionAllowed(studioOperatorScope, 'shell_execute'), /Assistant action blocked/);
});

test('Studio repair lane accepts layout and prompt workflow fixes inside One Time Studio worker scope', () => {
  const plan = planAssistantResponseMode(studioOperatorScope, {
    action: 'studio_repair_request',
    text: 'The Studio prompt patch layout is confusing and the OpenArt copy export button is not working.',
  });

  assert.equal(plan.allowed, true);
  assert.equal(plan.mode, 'studio_repair_lane');
  assert.equal(plan.no_shell, true);
  assert.equal(plan.no_codex_cli_route, true);
  assert.equal(plan.no_external_writes, true);
  assert.ok(plan.allowed_files.includes('public/operations.html'));
  assert.ok(plan.allowed_routes.includes('/api/bna/studio/*'));

  const workerPlan = planAssistantResponseMode(aiVideoWorkerScope, {
    action: 'studio_repair_request',
    text: 'The storyboard prompt pack needs a safer OpenArt export note.',
  });
  assert.equal(workerPlan.allowed, true);
  assert.equal(workerPlan.mode, 'studio_repair_lane');
  assert.equal(workerPlan.no_external_writes, true);
});

test('Studio repair lane blocks off-scope, dangerous, or cross-workspace requests', () => {
  const denied = [
    ['Change the public website homepage hero', 'website_not_allowed'],
    ['Deploy this Studio fix to production right now', 'deploy_not_allowed'],
    ['Show me CRM contacts for parents', 'contacts_or_private_records_not_allowed'],
    ['Update Stripe checkout and payment settings', 'payments_not_allowed'],
    ['Run a Powershell script to inspect API keys', 'raw_shell_not_allowed'],
    ['Copy OpenArt token secrets into the app', 'secrets_not_allowed'],
    ['Apply this same change to BNA Academy', 'cross_workspace_not_allowed'],
  ];

  denied.forEach(([text, reason]) => {
    const plan = planAssistantResponseMode(studioOperatorScope, {
      action: 'studio_repair_request',
      text,
    });
    assert.equal(plan.allowed, false, text);
    assert.equal(plan.reason, reason, text);
    assert.equal(plan.no_shell, true, text);
  });
});

test('Studio repair lane requires the exact One Time Studio worker scope', () => {
  const plan = planAssistantResponseMode({
    role: 'project_manager',
    tenant_type: 'service_provider',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
  }, {
    action: 'studio_repair_request',
    text: 'Fix the Studio prompt patch workflow.',
  });

  assert.equal(plan.allowed, false);
  assert.equal(plan.reason, 'one_time_studio_worker_scope_required');
});

test('Studio policy helper detects Studio repair signals and operator scope', () => {
  assert.equal(studioPolicy.isOneTimeStudioOperatorScope(studioOperatorScope), true);
  assert.equal(studioPolicy.isOneTimeStudioOperatorScope(aiVideoWorkerScope), true);
  assert.equal(studioPolicy.hasStudioRepairSignal('Fix the prompt patch sidekick for OpenArt images'), true);
  assert.equal(studioPolicy.hasStudioRepairSignal('General random task'), false);

  const note = buildAssistantScopeSystemNote(studioOperatorScope);
  assert.match(note, /One Time Studio operator or AI video worker/);
  assert.match(note, /not raw CLI or shell access/);
});
