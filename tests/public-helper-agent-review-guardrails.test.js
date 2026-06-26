const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');

test('public helper routes private-data asks to scoped login/support paths', () => {
  assert.match(server, /function publicAssistantPrivateDataRequest/);
  assert.match(server, /public_private_boundary/);
  assert.match(server, /support_ticket_created: false/);
  assert.match(server, /\/parent\/login/);
  assert.match(server, /\/student/);
  assert.match(server, /\/provider/);
  assert.match(server, /\/signup\.html#contact/);
});

test('public helper does not claim ticket creation without typed action audit proof', () => {
  assert.match(server, /open_ticket_without_audit_proof_blocked/);
  assert.match(server, /did not receive typed action audit proof/);
  assert.match(server, /!actionResult\.success \|\| !actionResult\.executed \|\| !ticketId \|\| !auditId/);
  assert.match(server, /Created support ticket #\$\{ticketId\}\. Audit #\$\{auditId\} confirms the typed action result/);
  assert.doesNotMatch(server, /I sent this to the office as ticket #\$\{ticket\.id\}/);
  assert.doesNotMatch(server, /share a name, phone, or email so he can reach you/);
});
