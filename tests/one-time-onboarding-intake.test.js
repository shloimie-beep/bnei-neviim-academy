const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('server.js', 'utf8');
const preview = fs.readFileSync('public/one-time-preview.html', 'utf8');

function oneTimeOnboardingRouteBody() {
  const start = server.indexOf("app.post('/api/one-time/mishnah/onboarding'");
  const end = server.indexOf("app.post('/api/parent-portal/provider-messages'", start);
  assert.notEqual(start, -1, 'One Time onboarding route should exist');
  assert.notEqual(end, -1, 'route body should end before provider messages route');
  return server.slice(start, end);
}

test('One Time Mishnah onboarding route creates scoped local review records only', () => {
  const route = oneTimeOnboardingRouteBody();

  assert.match(route, /ONE_TIME_PROJECT_KEY/);
  assert.match(server, /const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class'/);
  assert.match(route, /upsertOneTimePreviewLead/);
  assert.match(route, /upsertOneTimePreviewContact/);
  assert.match(server, /bna_parent_leads/);
  assert.match(server, /bna_contacts/);
  assert.match(route, /bna_contact_communications/);
  assert.match(route, /bna_support_tickets/);
  assert.match(route, /createTaskFromText/);
  assert.match(route, /no_send: true/);
  assert.match(route, /external_write_performed: false/);
  assert.match(route, /no_checkout: true/);
  assert.match(route, /no_access_granted: true/);
  assert.doesNotMatch(route, /sendEmail\s*\(/);
  assert.doesNotMatch(route, /sendTelegramNotification\s*\(/);
  assert.doesNotMatch(route, /sendParentMagicLinkWhatsApp/);
  assert.doesNotMatch(route, /SEND_WHATSAPP/);
});

test('One Time Mishnah onboarding supports a no-write dry run preview', () => {
  const route = oneTimeOnboardingRouteBody();

  assert.match(route, /dry_run/);
  assert.match(route, /local_write_performed: false/);
  assert.match(server, /planned_records/);
  assert.match(server, /no_payment_link_sent/);
  assert.match(server, /no_member_access_granted/);
});

test('One Time preview page posts guided intake to the scoped onboarding route', () => {
  assert.match(preview, /id="one-time-onboarding"/);
  assert.match(preview, /data-one-time-onboarding/);
  assert.match(preview, /\/api\/one-time\/mishnah\/onboarding/);
  assert.match(preview, /name="parent_name"/);
  assert.match(preview, /name="parent_email"/);
  assert.match(preview, /name="parent_phone"/);
  assert.match(preview, /name="learner_name"/);
  assert.match(preview, /name="intent" value="live"/);
  assert.match(preview, /name="intent" value="library"/);
  assert.match(preview, /name="preview_ack" required/);
  assert.match(preview, /No payment, access, email, WhatsApp, or public posting was created/);
});
