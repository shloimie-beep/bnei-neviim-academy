const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');

test('OneTime provider password setup email is brand scoped and supports guarded admin override', () => {
  assert.match(server, /const oneTimeProvider = isOneTimeClassMediaProvider\(provider\)/);
  assert.match(server, /Set up your OneTimeOneTime Mishnah workspace password/);
  assert.match(server, /Your OneTimeOneTime Mishnah workspace is ready/);
  assert.match(server, /OneTimeOneTime Mishnah Class/);
  assert.match(server, /workspace: oneTimeProvider \? ONE_TIME_PROJECT_KEY : null/);
  assert.match(server, /projectId: provider\.project_id \|\| null/);
  assert.match(server, /contact_email: result\.contact_email/);
  assert.match(server, /recipientEmail = normalizeEmail\(req\.body\?\.recipient_email/);
  assert.match(server, /SEND_PROVIDER_SETUP_EMAIL_TO_OVERRIDE/);
  assert.match(server, /recipientEmail,\s+\}\);/s);
  assert.match(server, /recipient_override: Boolean\(recipientEmail\)/);
});
