const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const providerHtml = fs.readFileSync(path.join(repoRoot, 'public', 'provider.html'), 'utf8');
const studentHtml = fs.readFileSync(path.join(repoRoot, 'public', 'student.html'), 'utf8');
const parentHtml = fs.readFileSync(path.join(repoRoot, 'public', 'parent.html'), 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync(path.join(repoRoot, 'ops', 'action-registry.json'), 'utf8'));

function section(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('shared portal-login resolver covers every current credential system server-side', () => {
  const resolver = section(
    server,
    'async function collectPortalLoginDestinations',
    'async function issuePortalDestinationSession'
  );

  assert.match(resolver, /identifyOpsUser\(rawUsername, rawPassword\)/);
  assert.match(resolver, /FROM bna_service_providers/);
  assert.match(resolver, /FROM bna_parent_password_accounts/);
  assert.match(resolver, /FROM bna_student_password_accounts/);
  assert.match(resolver, /verifyParentPassword\(rawPassword, provider\.password_hash\)/);
  assert.match(resolver, /verifyParentPassword\(rawPassword, parentAccount\.password_hash\)/);
  assert.match(resolver, /verifyStudentPassword\(rawPassword, studentAccount\.password_hash\)/);
  assert.match(resolver, /parentAccessEligible\(records\)/);
  assert.doesNotMatch(resolver, /localStorage|universal password|master password/i);
});

test('portal destination redirects only allow same-origin route-appropriate returnTo values', () => {
  assert.match(server, /function safePortalReturnPath\(value, portal\)/);
  assert.match(server, /const url = new URL\(raw, 'https:\/\/bna\.local'\)/);
  assert.match(server, /if \(url\.origin !== 'https:\/\/bna\.local'\) return fallback/);
  assert.match(server, /if \(!allowedPath \|\| url\.pathname !== allowedPath\) return fallback/);

  const redirect = section(
    server,
    'function portalDestinationRedirect',
    'function publicPortalDestination'
  );
  assert.match(redirect, /oneTimeOperationsReturnPath\(returnTo\)/);
  assert.match(redirect, /safeOperationsReturnPath\(returnTo\)/);
  assert.match(redirect, /safePortalReturnPath\(returnTo, destination\?\.portal\)/);
});

test('generic BNA auth login resolves destinations, returns chooser, and issues only the chosen session', () => {
  const route = section(
    server,
    "app.post('/api/bna/auth/login'",
    "app.post('/api/bna/auth/logout'"
  );

  assert.match(route, /body\.username \|\| body\.login_username \|\| body\.identity \|\| body\.parent_email \|\| body\.email/);
  assert.match(route, /collectPortalLoginDestinations\(\{ username, password, db: client \}\)/);
  assert.match(route, /chooser_required: true/);
  assert.match(route, /publicPortalDestination\(destination, returnTo\)/);
  assert.match(route, /issuePortalDestinationSession\(destination, res, \{ db: client, returnTo \}\)/);
  assert.doesNotMatch(route, /FROM bna_parent_password_accounts[\s\S]*issueParentSession\(parentEmail/);
});

test('wrong-portal password logins redirect or show chooser instead of granting the wrong portal', () => {
  const providerRoute = section(server, "app.post('/api/provider-portal/login'", "app.post('/api/provider-portal/logout'");
  assert.ok(
    providerRoute.indexOf('maybeHandleOtherPortalLogin') < providerRoute.indexOf('Invalid provider credentials'),
    'provider login should check other valid destinations before invalid-provider response'
  );
  assert.match(providerRoute, /currentPortal: 'provider'/);

  const studentRoute = section(server, "app.post('/api/student-portal/login'", "app.post('/api/student-portal/logout'");
  assert.ok(
    studentRoute.indexOf('maybeHandleOtherPortalLogin') < studentRoute.indexOf("reason: 'invalid_username_or_password'"),
    'student login should not record a student failure before recognizing another valid portal identity'
  );
  assert.match(studentRoute, /currentPortal: 'student'/);

  const parentRoute = section(server, "app.post('/api/parent-portal/login'", "app.post('/api/parent-portal/password/request'");
  assert.match(parentRoute, /const parentIdentity = String/);
  assert.match(parentRoute, /maybeHandleOtherPortalLogin\(req, res, \{/);
  assert.match(parentRoute, /currentPortal: 'parent'/);
  assert.match(parentRoute, /username: parentIdentity/);
});

test('password login pages render server-resolved destination chooser responses', () => {
  for (const [name, html] of [
    ['provider', providerHtml],
    ['student', studentHtml],
    ['parent', parentHtml],
  ]) {
    assert.match(html, /function showPortalChooser\(data\)/, `${name} login should render chooser responses`);
    assert.match(html, /chooser_required/, `${name} login should check chooser_required`);
    assert.match(html, /destination\.redirect_to/, `${name} login should use server-resolved redirect_to values`);
    assert.match(html, /data-action-id="ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION"/, `${name} chooser links should be registered visible actions`);
    assert.doesNotMatch(html, /destination\.workspace_key[\s\S]*window\.location/, `${name} login must not route by client-trusted workspace key`);
  }
  assert.match(parentHtml, /<input id="parentEmail" type="text" autocomplete="username"/);
  assert.doesNotMatch(parentHtml, /<input id="parentEmail" type="email"/);
});

test('portal login chooser destination links are registered actions', () => {
  const action = actionRegistry.actions.find((item) => item.action_id === 'ACTION-PORTAL-LOGIN-CHOOSER-DESTINATION');
  assert.equal(action?.surface, 'portal_login');
  assert.equal(action?.route, '/provider, /student, /parent');
  assert.equal(action?.status, 'server_resolved_navigation');
  assert.match(action?.selector_hint || '', /#loginChooser/);
  assert.match(action?.selector_hint || '', /#loginStatus/);
  assert.match(action?.expected_behavior || '', /server-provided same-origin redirect_to/);
  assert.match(action?.expected_behavior || '', /must not route by client-trusted workspace keys/);
  assert.match(action?.expected_behavior || '', /unsafe external returnTo/);
});

test('generic BNA auth logout clears every server-backed portal session cookie', () => {
  const logout = section(
    server,
    "app.post('/api/bna/auth/logout'",
    "app.post('/api/parent/auth/login'"
  );

  assert.match(logout, /clearSession\(cookies\[SESSION_COOKIE_NAME\]\)/);
  assert.match(logout, /clearParentSession\(cookies\[PARENT_SESSION_COOKIE_NAME\]\)/);
  assert.match(logout, /clearProviderSession\(cookies\[PROVIDER_SESSION_COOKIE_NAME\]\)/);
  assert.match(logout, /clearStudentSession\(cookies\[STUDENT_SESSION_COOKIE_NAME\]\)/);
  assert.match(logout, /\$\{SESSION_COOKIE_NAME\}=; Path=\/; HttpOnly/);
  assert.match(logout, /\$\{PARENT_SESSION_COOKIE_NAME\}=; Path=\/; HttpOnly/);
  assert.match(logout, /\$\{PROVIDER_SESSION_COOKIE_NAME\}=; Path=\/; HttpOnly/);
  assert.match(logout, /\$\{STUDENT_SESSION_COOKIE_NAME\}=; Path=\/; HttpOnly/);
});
