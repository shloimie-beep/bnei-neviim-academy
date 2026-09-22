const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const parent = fs.readFileSync('public/parent.html', 'utf8');

function parentAccountabilityRouteBody() {
  const start = server.indexOf("app.post('/api/parent-accountability/onboarding'");
  const end = server.indexOf('function normalizeOneTimeOnboardingIntent', start);
  assert.notEqual(start, -1, 'parent accountability onboarding route should exist');
  assert.notEqual(end, -1, 'route body should end before One Time helpers');
  return server.slice(start, end);
}

test('parent accountability onboarding persists a first-party lead and review ticket', () => {
  const route = parentAccountabilityRouteBody();

  assert.match(server, /accountability_interest/);
  assert.match(server, /bna_parent_leads_lead_type_check/);
  assert.match(route, /INSERT INTO bna_parent_leads/);
  assert.match(route, /UPDATE bna_parent_leads/);
  assert.match(route, /lead_type = 'accountability_interest'/);
  assert.match(route, /'accountability_interest', 'new', 'warm', 'website_form'/);
  assert.match(route, /Parent accountability app onboarding/);
  assert.match(route, /INSERT INTO bna_support_tickets/);
  assert.match(route, /category,[\s\S]*'student_parent_data'/);
  assert.match(route, /source_context[\s\S]*parent_lead_id: lead\.id/);
  assert.match(route, /lead_id: lead\.id/);
});

test('parent accountability onboarding links communications and alerts to the lead without sends', () => {
  const route = parentAccountabilityRouteBody();

  assert.match(route, /INSERT INTO bna_contact_communications/);
  assert.match(route, /contact_type, lead_id, channel, direction/);
  assert.match(route, /'lead', \$1, \$2, 'inbound'/);
  assert.match(route, /eventType: 'parent_accountability_lead_submitted'/);
  assert.match(route, /relatedType: 'parent_lead'/);
  assert.match(route, /sourceTable: 'bna_parent_leads'/);
  assert.match(route, /support_ticket_id: ticket\.id/);
  assert.match(route, /no_send: true/);
  assert.match(route, /external_write_performed: false/);
  assert.doesNotMatch(route, /sendEmail\s*\(/);
  assert.doesNotMatch(route, /sendTelegramNotification\s*\(/);
  assert.doesNotMatch(route, /sendParentMagicLinkWhatsApp/);
});

test('parent accountability onboarding supports no-write dry-run previews', () => {
  const route = parentAccountabilityRouteBody();

  assert.match(route, /dry_run/);
  assert.match(route, /local_write_performed: false/);
  assert.match(route, /planned_records/);
  assert.match(route, /bna_parent_leads accountability_interest/);
  assert.match(route, /bna_support_tickets student_parent_data/);
  assert.match(route, /bna_contact_communications lead inbound note/);
  assert.match(route, /review_before_child_visibility: true/);
});

test('Operations lead filters surface accountability app interest records by default', () => {
  assert.match(operations, /let contactLeadTypeFilter = 'all'/);
  assert.match(operations, /accountability_interest: 'Accountability app interest'/);
  assert.match(operations, /Accountability app \(\$\{typeCounts\.accountability_interest \|\| 0\}\)/);
});

test('public parent onboarding remains conversational and review-gated', () => {
  assert.match(parent, /data-parent-accountability-onboarding/);
  assert.match(parent, /parentOnboardingSteps/);
  assert.match(parent, /child_struggles/);
  assert.match(parent, /goals/);
  assert.match(parent, /setup_context/);
  assert.match(parent, /reviewed before child-visible goals are created/);
  assert.match(parent, /\/api\/parent-accountability\/onboarding/);
});
