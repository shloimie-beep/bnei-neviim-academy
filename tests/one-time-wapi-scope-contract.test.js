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
