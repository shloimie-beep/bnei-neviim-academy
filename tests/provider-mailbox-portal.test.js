const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const providerHtml = fs.readFileSync(path.join(root, 'public', 'provider.html'), 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));

function sourceBlock(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  assert.notEqual(start, -1, `missing start pattern ${startPattern}`);
  const tail = source.slice(start);
  const end = tail.search(endPattern);
  assert.notEqual(end, -1, `missing end pattern ${endPattern}`);
  return tail.slice(0, end);
}

test('provider portal renders One Time mailbox CRM controls', () => {
  assert.match(providerHtml, /data-provider-section="mailbox"/);
  assert.match(providerHtml, /info@onetimeonetime\.com/);
  assert.match(providerHtml, /providerMailboxEnabled\(\)/);
  assert.match(providerHtml, /ACTION-PROVIDER-MAILBOX-SEARCH/);
  assert.match(providerHtml, /ACTION-PROVIDER-MAILBOX-THREAD-OPEN/);
  assert.match(providerHtml, /ACTION-PROVIDER-MAILBOX-DRAFT/);
  assert.match(providerHtml, /ACTION-PROVIDER-MAILBOX-SEND/);
  assert.match(providerHtml, /\/api\/provider-portal\/mailbox/);
  assert.match(providerHtml, /SEND_RESEND_EMAIL/);
  assert.match(providerHtml, /Bulk email locked/);
});

test('provider mailbox API is One Time scoped and backed by bna_communications', () => {
  assert.match(server, /app\.get\('\/api\/provider-portal\/mailbox', requireProviderSession/);
  assert.match(server, /app\.get\('\/api\/provider-portal\/mailbox\/:threadKey', requireProviderSession/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/mailbox\/:threadKey\/draft', requireProviderSession/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/mailbox\/:threadKey\/send', requireProviderSession/);
  assert.match(server, /function oneTimeMailboxContext/);
  assert.match(server, /isOneTimeClassMediaProvider\(provider\)/);
  assert.match(server, /ONE_TIME_PROVIDER_WORKSPACE_KEY/);
  assert.match(server, /ONE_TIME_PROJECT_KEY/);
  assert.match(server, /FROM bna_communications c/);
  assert.match(server, /c\.metadata->>'project_key'/);
  assert.match(server, /c\.metadata->>'workspace_key'/);
});

test('mailbox draft is local-only and send is explicitly guarded', () => {
  const draftBlock = sourceBlock(
    server,
    /app\.post\('\/api\/provider-portal\/mailbox\/:threadKey\/draft'/,
    /app\.post\('\/api\/provider-portal\/mailbox\/:threadKey\/send'/
  );
  assert.match(draftBlock, /one_time_mailbox_reply_draft/);
  assert.match(draftBlock, /no_send:\s*true/);
  assert.match(draftBlock, /external_write_performed:\s*false/);
  assert.doesNotMatch(draftBlock, /sendResendEmail/);

  const sendBlock = sourceBlock(
    server,
    /app\.post\('\/api\/provider-portal\/mailbox\/:threadKey\/send'/,
    /app\.get\('\/api\/provider-portal\/calendar-events'/
  );
  assert.match(sendBlock, /resendIntegration\.sendResendEmail/);
  assert.match(sendBlock, /confirm/);
  assert.match(sendBlock, /externalActions\.recordExternalActionAudit/);
  assert.match(sendBlock, /one_time_mailbox_reply_sent/);
  assert.match(sendBlock, /external_write_performed:\s*true/);
  assert.doesNotMatch(sendBlock, /campaign|broadcast|bulkSend|bulk-send/i);

  assert.match(server, /ONE_TIME_MAILING_ADDRESS/);
  assert.match(server, /mailing_address_configured/);
  assert.match(server, /bulk_send_allowed:\s*false/);
});

test('manual Resend draft sends preserve One Time mailbox scope metadata', () => {
  const sendBlock = sourceBlock(
    server,
    /async function sendResendEmailDraft/,
    /app\.post\('\/api\/bna\/communications\/email\/send'/
  );
  assert.match(sendBlock, /const payloadMetadata = sanitizeIntegrationMetadata/);
  assert.match(sendBlock, /const logProjectKey = normalizeProjectKey\(payloadMetadata\.project_key/);
  assert.match(sendBlock, /const logWorkspaceKey = normalizeWorkspaceKey\(payloadMetadata\.workspace_key/);
  assert.match(sendBlock, /projectId: logProject\?\.id \|\| null/);
  assert.match(sendBlock, /workspaceId: logWorkspaceId \|\| null/);
  assert.match(sendBlock, /\.\.\.payloadMetadata/);
  assert.match(sendBlock, /workspace_key: logWorkspaceKey \|\| payloadMetadata\.workspace_key \|\| null/);
  assert.match(sendBlock, /project_key: logProjectKey \|\| payloadMetadata\.project_key \|\| null/);
});

test('route and action registries cover One Time provider mailbox', () => {
  const routes = routeRegistry.routes || [];
  const actions = actionRegistry.actions || [];
  for (const route of [
    '/api/provider-portal/mailbox',
    '/api/provider-portal/mailbox/:threadKey',
    '/api/provider-portal/mailbox/:threadKey/draft',
    '/api/provider-portal/mailbox/:threadKey/send',
  ]) {
    const row = routes.find(item => item.route === route);
    assert.ok(row, `missing route registry entry for ${route}`);
    assert.equal(row.access, 'private_provider');
    assert.equal(row.public_allowed, false);
    assert.match(row.security_expectation, /One Time|Rabbi/i);
  }

  for (const actionId of [
    'ACTION-PROVIDER-MAILBOX-SEARCH',
    'ACTION-PROVIDER-MAILBOX-THREAD-OPEN',
    'ACTION-PROVIDER-MAILBOX-DRAFT',
    'ACTION-PROVIDER-MAILBOX-SEND',
  ]) {
    const row = actions.find(item => item.action_id === actionId);
    assert.ok(row, `missing action registry entry for ${actionId}`);
    assert.equal(row.route, '/provider?section=mailbox');
  }

  const sendAction = actions.find(item => item.action_id === 'ACTION-PROVIDER-MAILBOX-SEND');
  assert.match(sendAction.expected_behavior, /SEND_RESEND_EMAIL/);
  assert.match(sendAction.expected_behavior, /Bulk email remains unavailable/i);
});
