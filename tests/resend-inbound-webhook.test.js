const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');

test('server exposes raw-body verified Resend inbound route aliases', () => {
  assert.match(server, /url\.startsWith\('\/api\/resend\/inbound'\)/);
  assert.match(server, /url\.startsWith\('\/api\/bna\/resend\/inbound'\)/);
  assert.match(server, /req\.rawBody = buf\.toString\('utf8'\)/);
  assert.match(server, /async function handleResendInboundWebhook\(req, res\)/);
  assert.match(server, /app\.post\('\/api\/resend\/inbound', handleResendInboundWebhook\)/);
  assert.match(server, /app\.post\('\/api\/bna\/resend\/inbound', handleResendInboundWebhook\)/);
  assert.match(server, /verifyResendWebhookRequest/);
  assert.match(server, /resendInboundCrm\.processResendInboundEvent/);
});
