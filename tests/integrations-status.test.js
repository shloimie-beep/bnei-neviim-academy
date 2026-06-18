const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Integrations status endpoint is read-only, scoped, and Buffer-first', () => {
  const server = read('server.js');
  const start = server.indexOf("app.get('/api/bna/integrations/status'");
  const end = server.indexOf("app.get('/api/bna/agent-fleet/status'");
  const routeBlock = server.slice(start, end);

  assert.ok(start > 0, 'integrations status route should exist');
  assert.match(server, /app\.get\('\/api\/bna\/integrations\/status', requireAdmin, async \(req, res\) => \{/);
  assert.doesNotMatch(server, /app\.post\('\/api\/bna\/integrations\/status'/);
  assert.match(routeBlock, /const scopedProjectKey = opsScopeProjectKey\(req\);/);
  assert.match(routeBlock, /const requestedProjectKey = req\.query\.project && req\.query\.project !== 'all'/);
  assert.match(routeBlock, /const scopes = await automationWorkspaceScopes\(projectKey\);/);
  assert.match(routeBlock, /SOCIAL_INTEGRATION_TARGETS\.map/);
  assert.doesNotMatch(routeBlock, /GHL|ghl|LeadConnector|leadconnector/);
});

test('Integrations status payload exposes account state fields without secrets', () => {
  const server = read('server.js');

  assert.match(server, /BUFFER_ACCESS_TOKEN/);
  assert.match(server, /BUFFER_PROFILE_FACEBOOK_ID/);
  assert.match(server, /BUFFER_PROFILE_LINKEDIN_ID/);
  assert.match(server, /BUFFER_PROFILE_YOUTUBE_ID/);
  assert.match(server, /status: 'connected'/);
  assert.match(server, /status: 'not_connected'/);
  assert.match(server, /status: 'error'/);
  assert.match(server, /account_identity/);
  assert.match(server, /last_check_at: generatedAt/);
  assert.match(server, /needed_action/);
  assert.match(server, /maskedIntegrationIdentity/);
});

test('Operations UI loads and renders integration status cards', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /getIntegrations\(filters = \{\}\)/);
  assert.match(operations, /return this\.request\('GET', '\/integrations\/status' \+ \(params\.toString\(\) \? '\?' \+ params\.toString\(\) : ''\)\);/);
  assert.match(operations, /let integrationStatuses = \[\];/);
  assert.match(operations, /id: 'integrations', label: 'Integrations'/);
  assert.match(operations, /viewAllowed\('integrations'\) \? api\.getIntegrations\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ integrations: \[\] \}\)/);
  assert.match(operations, /case 'integrations': content = renderIntegrations\(\); break;/);
  assert.match(operations, /function renderIntegrations\(\) \{/);
  assert.match(operations, /function renderIntegrationCard\(item\) \{/);
  assert.match(operations, /renderContactDetailItem\('Status', integrationStatusLabel\(item\.status\)\)/);
  assert.match(operations, /renderContactDetailItem\('Account', item\.account_identity \|\| 'Not connected'\)/);
  assert.match(operations, /renderContactDetailItem\('Last Check', lastCheck\)/);
  assert.match(operations, /renderContactDetailItem\('Needed Action', item\.needed_action \|\| 'No action listed'\)/);
});

test('Visible Operations social approval copy no longer names GHL as the active draft provider', () => {
  const operations = read('public/operations.html');

  assert.doesNotMatch(operations, /Approve \+ Create GHL Draft/);
  assert.doesNotMatch(operations, /create a GHL social draft/);
  assert.doesNotMatch(operations, /Facebook draft created in GHL\./);
  assert.match(operations, /Approve \+ Create Social Draft/);
  assert.match(operations, /Approval uses the configured social connector/);
});

