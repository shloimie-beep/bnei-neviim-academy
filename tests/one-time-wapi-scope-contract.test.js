const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const packageJson = fs.readFileSync('package.json', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');

test('One Time WhatsApp sends prefer Rabbi-scoped credentials and keep CRM project scope', () => {
  assert.match(server, /const ONE_TIME_WAPI_API_TOKEN/);
  assert.match(server, /process\.env\.ONE_TIME_WAPI_API_TOKEN/);
  assert.match(server, /readLocalSecretFile\('one-time-wapi-api-token\.txt'\)/);
  assert.match(server, /readLocalSecretFile\('rabbi-sheller-wapi-api-token\.txt'\)/);
  assert.match(server, /function wapiCredentialsForScope/);
  assert.match(server, /credential_scope: scopedToken \? 'one_time_scoped' : 'default'/);
  assert.match(server, /normalizeProjectKey\(scope\.project_key \|\| scope\.project \|\| ''\) === ONE_TIME_PROJECT_KEY/);
  assert.match(server, /project_id, contact_type, lead_id, signup_id, student_id, channel, direction/);
  assert.match(server, /projectId \|\| recipient\.project_id \|\| null/);
  assert.match(server, /recipient\.project_id = recipientProjectId/);
  assert.match(server, /workspaceKeyForProject\(recipientProjectKey\)/);
  assert.match(server, /workspace_key: recipientWorkspaceKey \|\| null/);
  assert.match(server, /project_key: recipientProjectKey \|\| null/);
  assert.match(server, /workspace_key: recipientWorkspaceKey,\s+project_key: recipientProjectKey/s);
  assert.match(server, /app\.get\('\/api\/bna\/wapi\/diagnostics', requireAdmin/);
  assert.match(server, /credential_scope: credentials\.credential_scope/);
  assert.match(server, /requiredWapiEnv = credentials\.one_time_scope/);
  assert.match(server, /ONE_TIME_WAPI_API_TOKEN or RABBI_SHELLER_WAPI_API_TOKEN or WAPI_API_TOKEN/);
});

test('One Time WAPI provider lead-bot reply is approval-gated and does not commit or anonymously release the class link', () => {
  const webhookAuth = server.slice(
    server.indexOf('function authorizeWapiWebhookRequest'),
    server.indexOf('function oneTimeWapiAutoReplyReadiness')
  );
  assert.match(server, /ONE_TIME_WAPI_AUTO_REPLY_ENABLED/);
  assert.match(server, /ONE_TIME_WAPI_AUTO_REPLY_CONFIRM/);
  assert.match(server, /APPROVE_ONE_TIME_WAPI_AUTO_REPLY/);
  assert.match(server, /ONE_TIME_WHATSAPP_CLASS_LINK/);
  assert.match(server, /ONE_TIME_CURRENT_CLASS_LINK/);
  assert.match(server, /function oneTimeWapiAutoReplyReadiness/);
  assert.match(server, /ONE_TIME_PROVIDER_LEAD_BOT_MODE === 'live'/);
  assert.match(server, /ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_APPROVED/);
  assert.match(server, /WAPI_WEBHOOK_ALLOW_INSECURE_LOCAL_TEST/);
  assert.doesNotMatch(webhookAuth, /req\.query\.secret/);
  assert.match(server, /credential_scope === 'one_time_scoped'/);
  assert.match(server, /One Time auto-reply requires one_time_scoped WAPI credentials/);
  assert.match(server, /metadata->>'auto_reply_type' IN \('provider_lead_bot_reply', 'one_time_welcome_class_link'\)/);
  assert.match(server, /inbound_communication_id/);
  assert.match(server, /inbound_wapi_message_id/);
  assert.match(server, /claimOneTimeWapiAutoReplyAttempt/);
  assert.match(server, /not_applicable_non_onetime_scope/);
  assert.match(server, /!isOneTimeWapiScope\(webhookScope\)/);
  assert.match(server, /function oneTimeWapiAutoReplyMessage/);
  assert.match(server, /buildProviderLeadBotPlan/);
  assert.match(server, /class_link_release_requires_server_authorized_class_info_request/);
  assert.match(server, /maybeSendOneTimeWapiAutoReply/);
  assert.match(server, /crmInboundIngest\.ingestInboundCommunication/);
  assert.match(server, /canonicalCommunicationId/);
  assert.match(server, /idx_bna_communications_wapi_message_id/);
  assert.match(server, /create_task_on_inbound: false/);
  assert.match(server, /ordinary_inbound_creates_task: false/);
  assert.match(server, /auto_reply_configured/);
  assert.match(server, /auto_reply_readiness/);
  assert.match(server, /no_secret_link_in_source/);
  assert.doesNotMatch(server, /Here is the link for today.s shiur/);
  assert.doesNotMatch(server, /us06web\.zoom\.us\/j\/83339110316/);
});

test('One Time WAPI readiness script reports blockers without sends or secrets', async () => {
  const script = fs.readFileSync('scripts/check-onetime-wapi-readiness.mjs', 'utf8');
  assert.match(packageJson, /"one-time:wapi:readiness": "node scripts\/check-onetime-wapi-readiness\.mjs --json --write-report"/);
  assert.match(envExample, /ONE_TIME_WAPI_API_TOKEN=/);
  assert.match(envExample, /RABBI_SHELLER_WAPI_API_TOKEN=/);
  assert.match(envExample, /ONE_TIME_WAPI_AUTO_REPLY_CONFIRM=/);
  assert.match(script, /whatsapp_send_performed: false/);
  assert.match(script, /crm_mutation_performed: false/);
  assert.match(script, /secret_values_printed: false/);
  assert.match(script, /No secret values, chat IDs, raw class links, or phone numbers are printed/);
  assert.doesNotMatch(script, /SEND_WHATSAPP|messages\/text|fetch\(/);

  const { buildOneTimeWapiReadiness } = await import('../scripts/check-onetime-wapi-readiness.mjs');
  const blocked = buildOneTimeWapiReadiness({
    inspectKeyholder: false,
    env: {
      WAPI_API_TOKEN: 'global-token-only',
      ONE_TIME_WAPI_AUTO_REPLY_ENABLED: 'true',
      ONE_TIME_WAPI_AUTO_REPLY_CONFIRM: 'APPROVE_ONE_TIME_WAPI_AUTO_REPLY',
      ONE_TIME_WHATSAPP_CLASS_LINK: 'https://example.test/class-link',
    },
  });
  assert.equal(blocked.outbound.configured, true);
  assert.equal(blocked.outbound.credential_scope, 'default_fallback');
  assert.equal(blocked.auto_reply.ready, false);
  assert.ok(blocked.auto_reply.blockers.some((blocker) => /ONE_TIME_WAPI_API_TOKEN/.test(blocker)));
  assert.doesNotMatch(JSON.stringify(blocked), /example\.test\/class-link/);

  const ready = buildOneTimeWapiReadiness({
    inspectKeyholder: false,
    env: {
      ONE_TIME_WAPI_API_TOKEN: 'scoped-token',
      ONE_TIME_WHAPI_INSTANCE_ID: 'instance-1',
      ONE_TIME_WHAPI_PHONE: '+972501111111',
      ONE_TIME_WAPI_AUTO_REPLY_ENABLED: 'live',
      ONE_TIME_WAPI_AUTO_REPLY_CONFIRM: 'APPROVE_ONE_TIME_WAPI_AUTO_REPLY',
      ONE_TIME_PROVIDER_LEAD_BOT_MODE: 'live',
      ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM: 'APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM',
      ONE_TIME_WAPI_WEBHOOK_SECRET: 'test-webhook-secret',
      ONE_TIME_WHATSAPP_CLASS_LINK: 'https://example.test/class-link',
    },
  });
  assert.equal(ready.provider_setup.ready, true);
  assert.equal(ready.auto_reply.ready, true);
  assert.equal(ready.telegram_notifications.ready, true);
  assert.equal(ready.outbound.credential_scope, 'one_time_scoped');
  assert.equal(ready.whatsapp_send_performed, false);
  assert.equal(ready.crm_mutation_performed, false);
  assert.doesNotMatch(JSON.stringify(ready), /scoped-token|\+972501111111|example\.test\/class-link/);

  const railwayClassLink = buildOneTimeWapiReadiness({
    inspectKeyholder: false,
    env: {
      ONE_TIME_WAPI_API_TOKEN: 'scoped-token',
      ONE_TIME_WAPI_AUTO_REPLY_ENABLED: 'live',
      ONE_TIME_WAPI_AUTO_REPLY_CONFIRM: 'APPROVE_ONE_TIME_WAPI_AUTO_REPLY',
    },
    railwayVariables: {
      attempted: true,
      ok: true,
      source: 'railway_temp_link_account_auth',
      key_count: 52,
      one_time_class_link_present: true,
      one_time_whapi_instance_present: false,
      one_time_whapi_phone_present: false,
    },
  });
  assert.equal(railwayClassLink.auto_reply.class_link_configured, true);
  assert.doesNotMatch(railwayClassLink.required_next_actions.join('\n'), /class link alias missing/);
  assert.equal(railwayClassLink.provider_setup.ready, false);
  assert.ok(railwayClassLink.required_next_actions.some((item) => /instance id missing/.test(item)));
  assert.equal(railwayClassLink.outbound.railway_readback.class_link_present, true);
  assert.doesNotMatch(JSON.stringify(railwayClassLink), /scoped-token|zoom\.us|example\.test/);

  const railwayProviderSetup = buildOneTimeWapiReadiness({
    inspectKeyholder: false,
    env: {
      ONE_TIME_WAPI_API_TOKEN: 'scoped-token',
    },
    railwayVariables: {
      attempted: true,
      ok: true,
      source: 'railway_temp_link_account_auth',
      key_count: 53,
      one_time_class_link_present: true,
      one_time_whapi_instance_present: true,
      one_time_whapi_phone_present: true,
      one_time_wapi_webhook_secret_present: true,
      one_time_wapi_auto_reply_enabled_true: true,
      one_time_wapi_auto_reply_confirm_approved: true,
      one_time_provider_lead_bot_mode_live: true,
    },
  });
  assert.equal(railwayProviderSetup.provider_setup.ready, true);
  assert.equal(railwayProviderSetup.auto_reply.ready, true);
  assert.equal(railwayProviderSetup.auto_reply.webhook_secret_present, true);
  assert.equal(railwayProviderSetup.outbound.railway_readback.webhook_secret_present, true);
  assert.equal(railwayProviderSetup.outbound.railway_readback.auto_reply_enabled, true);
  assert.equal(railwayProviderSetup.outbound.railway_readback.auto_reply_confirm_approved, true);
  assert.equal(railwayProviderSetup.outbound.railway_readback.provider_bot_mode_live, true);
  assert.equal(railwayProviderSetup.whatsapp_send_performed, false);
  assert.equal(railwayProviderSetup.crm_mutation_performed, false);
  assert.doesNotMatch(JSON.stringify(railwayProviderSetup), /scoped-token|webhook-secret|\+972/);
});

test('One Time WAPI attention artifacts badge/notify but suppress generic tasks', () => {
  const attentionArtifacts = server.slice(
    server.indexOf('async function createCommunicationAttentionArtifacts'),
    server.indexOf('function mergeParentTagsSql')
  );
  const wapiIngest = server.slice(
    server.indexOf('async function createCommunicationFromWapiWebhook'),
    server.indexOf('async function ensureOneTimeProviderBotLead')
  );

  assert.match(wapiIngest, /create_task_on_inbound:\s*false/);
  assert.match(wapiIngest, /ordinary_inbound_creates_task:\s*false/);
  assert.match(attentionArtifacts, /taskCreationAllowed/);
  assert.match(attentionArtifacts, /metadata\.create_task_on_inbound !== false/);
  assert.match(attentionArtifacts, /metadata\.ordinary_inbound_creates_task !== false/);
  assert.match(attentionArtifacts, /automatic_task_suppressed/);
  assert.match(attentionArtifacts, /screening\.follow_up_required && taskCreationAllowed/);
});

test('One Time provider support tickets dedupe by contact thread action class, not message id alone', () => {
  const supportTicket = server.slice(
    server.indexOf('function oneTimeProviderBotSupportTicketDedupe'),
    server.indexOf('function normalizeWapiRecipient')
  );

  assert.match(supportTicket, /dedupe_scope:\s*'workspace_project_contact_thread_action'/);
  assert.match(supportTicket, /provider_bot_support_dedupe_key/);
  assert.match(supportTicket, /provider_bot_support_thread_key_hash/);
  assert.match(supportTicket, /provider_bot_support_raw_thread_key_stored/);
  assert.match(supportTicket, /source_context->>'provider_bot_support_dedupe_key' = \$3/);
  assert.match(supportTicket, /OR source_context->>'provider_bot_communication_id' = \$4/);
  assert.match(supportTicket, /raw_message_body_in_telegram:\s*false/);
});
