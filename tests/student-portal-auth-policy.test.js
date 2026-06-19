const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const policy = fs.readFileSync('ops/access/student-portal-auth-policy.md', 'utf8');
const tasks = fs.readFileSync('TASKS.md', 'utf8');
const parentHtml = fs.readFileSync('public/parent.html', 'utf8');
const studentHtml = fs.readFileSync('public/student.html', 'utf8');

test('student portal auth policy chooses parent-managed username/password with access-code fallback', () => {
  assert.match(policy, /Parent-managed student username\/password login is the primary student portal auth model/);
  assert.match(policy, /The existing access-code link remains as a fallback/);
  assert.match(policy, /Student\s+self-reset is out of scope/);
  assert.match(policy, /Raw passwords, raw access codes, and raw IP addresses are never stored/);
  assert.match(policy, /Student sessions are separate from parent and Operations sessions/);
  assert.match(policy, /Rollback: disable password-account creation and keep access-code links active/);
});

test('student password accounts and sessions use scrypt hashes and separate HttpOnly cookies', () => {
  assert.match(server, /const STUDENT_SESSION_COOKIE_NAME = 'bna_student_session'/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_student_password_accounts/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_student_sessions/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_student_password_auth_attempts/);
  assert.match(server, /password_hash TEXT NOT NULL/);
  assert.match(server, /session_hash TEXT/);
  assert.match(server, /idx_bna_student_sessions_hash/);
  assert.match(server, /const sessionHash = sha256Hex\(sessionId\)/);
  assert.match(server, /studentPasswordHash/);
  assert.match(server, /scrypt:v1:N=\$\{params\.N\}:r=\$\{params\.r\}:p=\$\{params\.p\}/);
  assert.match(server, /verifyStudentPassword/);
  assert.match(server, /crypto\.timingSafeEqual/);
  assert.match(server, /setStudentSessionCookie/);
  assert.match(server, /HttpOnly/);
  assert.match(server, /SameSite=Lax/);
});

test('parent can create/reset a student login only for students in that parent session', () => {
  const endpoint = server.slice(
    server.indexOf("app.post('/api/parent-portal/students/:studentId/login-account'"),
    server.indexOf("app.post('/api/parent-portal/students/:studentId/access-code'")
  );
  assert.match(endpoint, /getValidParentSession\(cookies\[PARENT_SESSION_COOKIE_NAME\]\)/);
  assert.match(endpoint, /getParentPortalStudentForSession\(session\.parentEmail, studentId\)/);
  assert.match(endpoint, /setStudentPasswordAccountForParent/);
  assert.match(endpoint, /password_returned: false/);
  assert.match(endpoint, /raw_password_stored: false/);
  assert.match(endpoint, /username_hash: sha256Hex/);
  assert.doesNotMatch(endpoint, /password_hash/);

  assert.match(parentHtml, /data-student-login-form/);
  assert.match(parentHtml, /data-student-name/);
  assert.match(parentHtml, /studentLoginFor/);
  assert.match(parentHtml, /studentLoginChildCopy/);
  assert.match(parentHtml, /saveStudentLoginFor/);
  assert.match(parentHtml, /studentLoginSavedFor/);
  assert.match(parentHtml, /\/api\/parent-portal\/students\/\$\{encodeURIComponent\(studentId\)\}\/login-account/);
  assert.match(parentHtml, /studentPasswordNeverShown/);
  assert.match(parentHtml, /studentAccessFallback/);
  assert.match(parentHtml, /data-student-open/);
  assert.match(parentHtml, /data-student-reset/);
});

test('student portal exposes username/password login and keeps access-code fallback', () => {
  assert.match(server, /app\.post\('\/api\/student-portal\/login'/);
  assert.match(server, /app\.get\('\/api\/student-portal\/session'/);
  assert.match(server, /app\.post\('\/api\/student-portal\/logout'/);
  assert.match(server, /await getStudentForPortalCredential\(req, res, code/);
  assert.match(server, /await getStudentForPortalSessionRequest\(req/);
  assert.match(studentHtml, /id="studentLoginForm"/);
  assert.match(studentHtml, /id="studentUsername"/);
  assert.match(studentHtml, /id="studentPassword" type="password"/);
  assert.match(studentHtml, /\/api\/student-portal\/login/);
  assert.match(studentHtml, /\/api\/student-portal\/session/);
  assert.match(studentHtml, /\/api\/student-portal\/logout/);
  assert.match(studentHtml, /id="codeForm"/);
  assert.match(studentHtml, /accessFallback/);
});

test('password auth attempts are audited without raw username, password, access code, or IP', () => {
  assert.match(server, /function recordPersistentStudentPasswordAuthAttempt/);
  assert.match(server, /request_ip_hash TEXT NOT NULL/);
  assert.match(server, /username_hash TEXT NOT NULL/);
  assert.match(server, /user_agent_hash TEXT/);
  assert.match(server, /route_path TEXT/);
  assert.match(server, /raw_password_stored: false/);
  assert.match(server, /raw_username_stored: false/);
  assert.match(server, /raw_username_password_combo_stored: false/);
  assert.match(server, /raw_access_code_stored: false/);
  assert.match(server, /raw_ip_stored: false/);
  assert.match(server, /studentPasswordAuthAuditIdentity/);
  assert.match(server, /route_path/);
  assert.doesNotMatch(server, /bna_student_password_auth_attempts[\s\S]{0,700}password TEXT/);
  assert.doesNotMatch(server, /bna_student_password_auth_attempts[\s\S]{0,700}username TEXT/);
  assert.doesNotMatch(server, /bna_student_password_auth_attempts[\s\S]{0,700}request_ip TEXT/);
});

test('student password payload views do not expose password hashes', () => {
  const view = server.slice(
    server.indexOf('function studentPasswordAccountView'),
    server.indexOf('async function getStudentPasswordAccountForParent')
  );
  assert.match(view, /has_account/);
  assert.match(view, /username/);
  assert.match(view, /password_set_at/);
  assert.doesNotMatch(view, /password_hash/);
});

test('student portal auth policy is reflected in the active task list', () => {
  assert.match(tasks, /\[x\] Decide the final student portal auth model/);
  assert.match(tasks, /ops\/access\/student-portal-auth-policy\.md/);
  assert.match(tasks, /Parent-managed student username\/password login is\s+now the approved model/);
  assert.match(tasks, /access-code fallback remains\s+available/);
});
