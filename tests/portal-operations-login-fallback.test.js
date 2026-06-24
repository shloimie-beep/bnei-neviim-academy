const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const operationsLoginHtml = fs.readFileSync(path.join(repoRoot, 'public', 'operations-login.html'), 'utf8');
const providerHtml = fs.readFileSync(path.join(repoRoot, 'public', 'provider.html'), 'utf8');
const studentHtml = fs.readFileSync(path.join(repoRoot, 'public', 'student.html'), 'utf8');
const parentHtml = fs.readFileSync(path.join(repoRoot, 'public', 'parent.html'), 'utf8');

function section(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('Operations login uses the shared destination resolver without granting extra roles', () => {
  const route = section(
    server,
    "app.post('/api/operations/login'",
    "app.delete('/api/bna/tasks/:id'"
  );

  assert.match(route, /identifyOpsUser\(username, password\)/);
  assert.match(route, /issueSession\(identity\.username\)/);
  assert.match(route, /setSessionCookie\(res, sessionId\)/);
  assert.match(route, /collectPortalLoginDestinations\(\{ username, password \}\)/);
  assert.match(route, /\.filter\(\(destination\) => destination\.portal !== 'operations'\)/);
  assert.match(route, /chooser_required: true/);
  assert.match(route, /issuePortalDestinationSession\(destination, res, \{ returnTo \}\)/);
  assert.match(route, /portal_redirect: true/);
  assert.match(route, /recordOpsLoginFailure\(req, username\)/);
});

test('scoped portal login endpoints check other valid destinations before invalid-portal responses', () => {
  const providerLogin = section(server, "app.post('/api/provider-portal/login'", "app.post('/api/provider-portal/logout'");
  assert.match(providerLogin, /maybeHandleOtherPortalLogin\(req, res, \{/);
  assert.match(providerLogin, /source: 'provider_portal_login'/);
  assert.ok(providerLogin.indexOf('maybeHandleOtherPortalLogin') < providerLogin.indexOf('Invalid provider credentials'));

  const studentLogin = section(server, "app.post('/api/student-portal/login'", "app.post('/api/student-portal/logout'");
  assert.match(studentLogin, /source: 'student_portal_login'/);
  assert.match(studentLogin, /maybeHandleOtherPortalLogin\(req, res, \{/);
  assert.ok(studentLogin.indexOf('maybeHandleOtherPortalLogin') < studentLogin.indexOf("reason: 'invalid_username_or_password'"));

  const parentPasswordLogin = section(server, "app.post('/api/parent-portal/login'", "app.post('/api/parent-portal/password/request'");
  assert.match(parentPasswordLogin, /source: 'parent_portal_login'/);
  assert.match(parentPasswordLogin, /maybeHandleOtherPortalLogin\(req, res, \{/);
  assert.ok(parentPasswordLogin.indexOf('maybeHandleOtherPortalLogin') < parentPasswordLogin.indexOf('Invalid email or password'));
});

test('portal login pages follow server redirect payloads', () => {
  for (const html of [operationsLoginHtml, providerHtml, studentHtml, parentHtml]) {
    assert.match(html, /portal_redirect && .*\.redirect_to/);
    assert.match(html, /window\.location\.href = .*\.redirect_to/);
  }
});
