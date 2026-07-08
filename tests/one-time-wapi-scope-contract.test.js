const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');

test('OneTime WhatsApp sends prefer Rabbi-scoped credentials and keep CRM project scope', () => {
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

test('OneTime WAPI bot auto-reply is approval-gated and does not commit the class link', () => {
  assert.match(server, /ONE_TIME_WAPI_AUTO_REPLY_ENABLED/);
  assert.match(server, /ONE_TIME_WAPI_AUTO_REPLY_CONFIRM/);
  assert.match(server, /APPROVE_ONE_TIME_WAPI_AUTO_REPLY/);
  assert.match(server, /ONE_TIME_WHATSAPP_CLASS_LINK/);
  assert.match(server, /ONE_TIME_CURRENT_CLASS_LINK/);
  assert.match(server, /function oneTimeWapiAutoReplyReadiness/);
  assert.match(server, /credential_scope === 'one_time_scoped'/);
  assert.match(server, /OneTime auto-reply requires one_time_scoped WAPI credentials/);
  assert.match(server, /metadata->>'auto_reply_type' = 'one_time_welcome_class_link'/);
  assert.match(server, /INTERVAL '12 hours'/);
  assert.match(server, /not_applicable_non_onetime_scope/);
  assert.match(server, /!isOneTimeWapiScope\(webhookScope\)/);
  assert.match(server, /function oneTimeWapiAutoReplyMessage/);
  assert.match(server, /maybeSendOneTimeWapiAutoReply/);
  assert.match(server, /auto_reply_configured/);
  assert.match(server, /auto_reply_readiness/);
  assert.match(server, /no_secret_link_in_source/);
  assert.doesNotMatch(server, /us06web\.zoom\.us\/j\/83339110316/);
});
