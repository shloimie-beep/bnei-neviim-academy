const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

test('server exposes guarded next-year login readiness and preparation API', () => {
  assert.match(server, /NEXT_YEAR_LOGIN_PREPARE_CONFIRM = 'PREPARE_NEXT_YEAR_LOGINS'/);
  assert.match(server, /async function buildNextYearLoginReadiness/);
  assert.match(server, /studentIsExternalAccountabilityPerson/);
  assert.match(server, /getAssignmentsForStudentPortal/);
  assert.match(server, /bna_parent_password_accounts/);
  assert.match(server, /app\.get\('\/api\/bna\/portal-access\/next-year-readiness'/);
  assert.match(server, /app\.post\('\/api\/bna\/portal-access\/next-year-readiness'/);
  assert.match(server, /PARENT_PASSWORD_SETUP_CONFIRM = 'SEND_PARENT_PASSWORD_SETUP'/);
  assert.match(server, /app\.post\('\/api\/bna\/parent-access\/password-reset'/);
  assert.match(server, /password_setup_preview/);
  assert.match(server, /local_write_performed: false/);
  assert.match(server, /Parent password setup emails require confirm: \$\{PARENT_PASSWORD_SETUP_CONFIRM\}/);
  assert.match(server, /create_student_links !== false/);
  assert.match(server, /ensureStudentAccessCode/);
  assert.match(server, /Parent email\/WhatsApp sends stay on the explicit per-family buttons/);
  assert.doesNotMatch(server, /portal-access\/next-year-readiness[\s\S]{0,1800}sendParentPasswordResetEmail/);
});

test('Operations exposes next-year login readiness workflow without bulk parent sends', () => {
  assert.match(operations, /getNextYearLoginReadiness\(\)/);
  assert.match(operations, /prepareNextYearLogins\(payload = \{\}\)/);
  assert.match(operations, /sendParentPasswordSetup\(payload\)/);
  assert.match(operations, /\{ id: 'next_year_login', label: 'Next Year Login' \}/);
  assert.match(operations, /function renderStudentNextYearLoginView/);
  assert.match(operations, /Next Year's Group Login Readiness/);
  assert.match(operations, /Prepare Missing Student Links/);
  assert.match(operations, /No parent email or WhatsApp login links will be sent/);
  assert.match(operations, /No parent onboarding campaign is sent from this page/);
  assert.match(operations, /Preview Password Setup/);
  assert.match(operations, /Email Password Setup/);
  assert.match(operations, /function sendParentPasswordSetup/);
  assert.match(operations, /dry_run: Boolean\(dryRun\)/);
  assert.match(operations, /confirm: 'SEND_PARENT_PASSWORD_SETUP'/);
  assert.match(operations, /confirm: 'PREPARE_NEXT_YEAR_LOGINS'/);
  assert.match(operations, /renderParentPortalActionButtons\('student', item\.id/);
  assert.match(operations, /function refreshNextYearLoginReadiness/);
  assert.match(operations, /function openNextYearStudentPortal/);
});
