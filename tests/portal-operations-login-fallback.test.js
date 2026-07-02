const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const providerHtml = fs.readFileSync(path.join(repoRoot, 'public', 'provider.html'), 'utf8');
const studentHtml = fs.readFileSync(path.join(repoRoot, 'public', 'student.html'), 'utf8');
const parentHtml = fs.readFileSync(path.join(repoRoot, 'public', 'parent.html'), 'utf8');
const parentLoginHtml = fs.readFileSync(path.join(repoRoot, 'public', 'parent-login.html'), 'utf8');

function section(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('Operations portal fallback creates only an Operations session redirect', () => {
  const helper = section(
    server,
    'async function maybeHandleOpsPortalFallback',
    'function safePortalReturnPath'
  );

  assert.match(helper, /identifyOpsUser\(username, password, \{/);
  assert.match(helper, /preferredRole: operationsReturnPathTargetsOneTime\(returnTo\) \? 'one_time_admin' : ''/);
  assert.match(helper, /issueSession\(opsSessionUsername\(identity\)\)/);
  assert.match(helper, /setSessionCookie\(res, sessionId\)/);
  assert.match(helper, /portal_redirect: true/);
  assert.match(helper, /redirect_to: redirectTo/);
  assert.match(helper, /oneTimeOperationsReturnPath\(returnTo\)/);
  assert.match(helper, /safeOperationsReturnPath\(returnTo\)/);
  assert.doesNotMatch(helper, /issueProviderSession|issueStudentSession|issueParentSession/);
});

test('portal login endpoints try Operations credentials before scoped portal credentials', () => {
  const providerLogin = section(server, "app.post('/api/provider-portal/login'", "app.post('/api/provider-portal/logout'");
  assert.match(providerLogin, /maybeHandleOpsPortalFallback\(req, res, \{/);
  assert.match(providerLogin, /source: 'provider_portal_login'/);
  assert.ok(providerLogin.indexOf('maybeHandleOpsPortalFallback') < providerLogin.indexOf('FROM bna_service_providers'));
  assert.ok(providerLogin.indexOf('maybeHandleOpsPortalFallback') < providerLogin.indexOf('issueProviderSession'));

  const studentLogin = section(server, "app.post('/api/student-portal/login'", "app.post('/api/student-portal/logout'");
  assert.match(studentLogin, /source: 'student_portal_login'/);
  assert.ok(studentLogin.indexOf('maybeHandleOpsPortalFallback') < studentLogin.indexOf('countPersistentStudentPasswordAuthFailures'));
  assert.ok(studentLogin.indexOf('maybeHandleOpsPortalFallback') < studentLogin.indexOf('issueStudentSession'));

  const parentPasswordLogin = section(server, "app.post('/api/parent-portal/login'", "app.post('/api/parent-portal/password/request'");
  assert.match(parentPasswordLogin, /source: 'parent_portal_password_login'/);
  assert.ok(parentPasswordLogin.indexOf('maybeHandleOpsPortalFallback') < parentPasswordLogin.indexOf('bna_parent_password_accounts'));
  assert.ok(parentPasswordLogin.indexOf('maybeHandleOpsPortalFallback') < parentPasswordLogin.indexOf('issueParentSession'));

  const parentAccessLogin = section(server, "app.post('/api/parent/auth/login'", "app.post('/api/parent/auth/logout'");
  assert.match(parentAccessLogin, /source: 'parent_public_access_login'/);
  assert.ok(parentAccessLogin.indexOf('maybeHandleOpsPortalFallback') < parentAccessLogin.indexOf('getParentAccountForLogin'));
  assert.ok(parentAccessLogin.indexOf('maybeHandleOpsPortalFallback') < parentAccessLogin.indexOf('issueParentSession'));
});

test('portal login pages follow the Operations redirect payload', () => {
  for (const html of [providerHtml, studentHtml, parentHtml, parentLoginHtml]) {
    assert.match(html, /portal_redirect && .*\.redirect_to/);
    assert.match(html, /window\.location\.href = .*\.redirect_to/);
  }
});
