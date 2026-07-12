const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const operationsHtml = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');
const operationsShellJs = fs.readFileSync(path.join(root, 'public', 'js', 'operations-shell.js'), 'utf8');
const operationsDeferredRenderersJs = fs.readFileSync(path.join(root, 'public', 'js', 'operations-deferred-renderers.js'), 'utf8');
const providerHtml = fs.readFileSync(path.join(root, 'public', 'provider.html'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));

function sourceBlock(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  assert.notEqual(start, -1, `missing start pattern ${startPattern}`);
  const tail = source.slice(start);
  const end = tail.search(endPattern);
  assert.notEqual(end, -1, `missing end pattern ${endPattern}`);
  return tail.slice(0, end);
}

test('Operations email workspace exposes clear BNA vs Rabbi inbox scope', () => {
  assert.match(operationsHtml, /const EMAIL_INBOX_SCOPES = \[/);
  assert.match(operationsHtml, /ACTION-OPERATIONS-EMAIL-INBOX-BNA/);
  assert.match(operationsHtml, /ACTION-OPERATIONS-EMAIL-INBOX-RABBI/);
  assert.match(operationsHtml, /Now Viewing: \$\{escapeHtml\(activeScope\.label\)\} Inbox/);
  assert.match(operationsHtml, /workspace: 'rabbi_sheller_provider'/);
  assert.match(operationsHtml, /project_key: 'one_time_mishnah_class'/);
  assert.match(operationsHtml, /info@onetimeonetime\.com/);
  assert.match(operationsHtml, /function emailInboxFilters/);
  assert.match(operationsHtml, /filterEmailRecordsForInboxScope\(emailRecords, activeInboxScope\)/);
  assert.match(operationsHtml, /fetchCommunicationsIntegrationBundle\(communicationsIntegrationFilters\)/);
  assert.match(operationsHtml, /api\.getCommunications\(\{ \.\.\.communicationDataFilters, limit: 200 \}\)/);
  assert.match(operationsHtml, /const filters = emailInboxFilters\(\);[\s\S]*api\.createEmailDraft\(\{[\s\S]*\.\.\.filters/);
  assert.match(operationsHtml, /api\.sendEmailDraft\(\{ \.\.\.emailInboxFilters\(\), draft_id: id, confirm: phrase \}\)/);
});

test('Operations Rabbi inbox URL canonicalizes to scoped workspace instead of platform', () => {
  assert.match(operationsHtml, /currentView === 'communications' && communicationsSection === 'email' && currentWorkspaceId === 'platform'/);
  assert.match(operationsHtml, /if \(emailInboxScope === 'rabbi'\) currentWorkspaceId = 'rabbi_sheller_provider'/);
  assert.match(operationsHtml, /taskProjectFilter = scopedEmailProjectFilter === 'all' \? 'all' : scopedEmailProjectFilter/);
  assert.match(operationsShellJs, /currentView === 'communications' && communicationsSection === 'email' && currentWorkspaceId === 'platform'/);
  assert.match(operationsShellJs, /if \(emailInboxScope === 'rabbi'\) currentWorkspaceId = 'rabbi_sheller_provider'/);
  assert.match(operationsShellJs, /taskProjectFilter = scopedEmailProjectFilter === 'all' \? 'all' : scopedEmailProjectFilter/);
  assert.match(operationsHtml, /currentWorkspaceId = nextScope\.workspace/);
  assert.match(operationsHtml, /taskProjectFilter = nextScope\.project_key \|\| projectKeyForWorkspaceKey\(nextScope\.workspace\)/);
  assert.match(operationsHtml, /currentView === 'communications' && communicationsSection === 'email'\) url\.searchParams\.set\('project', emailInboxScopeRecord\(\)\.project_key\)/);
  assert.match(operationsShellJs, /currentView === 'communications' && communicationsSection === 'email'\) url\.searchParams\.set\('project', emailInboxScopeRecord\(\)\.project_key\)/);
  assert.match(operationsDeferredRenderersJs, /currentWorkspaceId = nextScope\.workspace/);
  assert.match(operationsDeferredRenderersJs, /syncOperationsUrl\(\);[\s\S]*rerenderOperationsApp\(\);[\s\S]*await loadData\(\{ background: true \}\)/);
});

test('Super Admin can launch a scoped Rabbi provider session without passwords', () => {
  const routeBlock = sourceBlock(
    server,
    /app\.post\('\/api\/bna\/one-time\/provider-session\/start', requireAdmin, async \(req, res\) => \{/,
    /app\.post\('\/api\/bna\/one-time\/view-as-rabbi\/start'/
  );
  assert.match(server, /async function findOneTimeProviderForAdminSession/);
  assert.match(server, /function oneTimeProviderAdminSessionView/);
  assert.match(routeBlock, /requireOneTimeViewAsSuperAdmin\(req, res\)/);
  assert.match(routeBlock, /findOneTimeProviderForAdminSession\(\)/);
  assert.match(routeBlock, /issueProviderSession\(provider\.id\)/);
  assert.match(routeBlock, /setProviderSessionCookie\(res, sessionId\)/);
  assert.match(routeBlock, /view_url: '\/operations\?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi'/);
  assert.match(routeBlock, /password_returned: false/);
  assert.match(routeBlock, /secrets_included: false/);
  assert.match(routeBlock, /external_write_performed: false/);
  assert.doesNotMatch(routeBlock, /sendResendEmail|sendEmailDraft|stripe|checkout|grantAccess|dns/i);

  const viewBlock = sourceBlock(
    server,
    /function oneTimeProviderAdminSessionView\(provider = \{\}\) \{/,
    /app\.get\('\/api\/one-time-review'/
  );
  assert.doesNotMatch(viewBlock, /password_hash|password_digest|password_salt|setup_token/i);
});

test('Operations visible Rabbi portal action uses read-only View-as Rabbi route', () => {
  assert.match(operationsHtml, /startOneTimeViewAsRabbiSession\(\) \{ return this\.request\('POST', '\/one-time\/view-as-rabbi\/start', \{\}\); \}/);
  assert.match(operationsHtml, /const result = await api\.startOneTimeViewAsRabbiSession\(\)/);
  assert.match(operationsHtml, /window\.location\.href = result\.view_url \|\| '\/provider\.html\?review=one-time'/);
  assert.match(operationsHtml, /View One Time as Rabbi/);
  assert.doesNotMatch(operationsHtml, /const result = await api\.startOneTimeProviderSession\(\)/);
});

test('Provider portal labels admin-on-Rabbi-account mode', () => {
  assert.match(providerHtml, /oneTimeAdminProviderMode/);
  assert.match(providerHtml, /function ensureAdminProviderBanner/);
  assert.match(providerHtml, /oneTimeAdminProviderBanner/);
  assert.match(providerHtml, /ADMIN ON RABBI ACCOUNT/);
  assert.match(providerHtml, /ACTION-ONETIME-PROVIDER-SESSION-EXIT/);
  assert.match(providerHtml, /\/operations\?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email&inbox=rabbi/);
  assert.match(providerHtml, /ensureAdminProviderBanner\(data\)/);
});

test('registries cover Super Admin email inbox switching and provider session launch', () => {
  const actions = actionRegistry.actions || [];
  const routes = routeRegistry.routes || [];
  for (const actionId of [
    'ACTION-OPERATIONS-EMAIL-INBOX-BNA',
    'ACTION-OPERATIONS-EMAIL-INBOX-RABBI',
    'ACTION-ONETIME-PROVIDER-SESSION-START',
    'ACTION-ONETIME-PROVIDER-SESSION-EXIT',
  ]) {
    const row = actions.find((item) => item.action_id === actionId);
    assert.ok(row, `missing action registry row ${actionId}`);
    assert.match(row.expected_behavior, /inbox|provider|Rabbi|One Time|email/i);
  }

  const route = routes.find((item) => item.route === '/api/bna/one-time/provider-session/start');
  assert.ok(route, 'missing provider session route registry row');
  assert.equal(route.access, 'private');
  assert.equal(route.required_role, 'platform_super_admin');
  assert.equal(route.public_allowed, false);
  assert.match(route.security_expectation, /no password|no secret|provider session cookie/i);

  const viewAsRoute = routes.find((item) => item.route === '/api/bna/one-time/view-as-rabbi/start');
  assert.ok(viewAsRoute, 'missing view-as Rabbi route registry row');
  assert.equal(viewAsRoute.access, 'private');
  assert.equal(viewAsRoute.required_role, 'platform_super_admin');
  assert.equal(viewAsRoute.public_allowed, false);
  assert.match(viewAsRoute.security_expectation, /read-only token|no external write/i);

  const visibleAction = actions.find((item) => item.action_id === 'ACTION-ONETIME-PROVIDER-SESSION-START');
  assert.equal(visibleAction.route, '/api/bna/one-time/view-as-rabbi/start');
  assert.match(visibleAction.expected_behavior, /read-only View-as Rabbi/i);
});
