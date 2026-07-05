const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('Contacts signup review lane excludes completed and signed-up records', () => {
  assert.match(operations, /const SIGNUP_REVIEW_STATUSES = new Set\(/);
  assert.match(operations, /const SIGNUP_SIGNED_UP_STATUSES = new Set\(/);
  assert.match(operations, /function signupHasCompletedRegistration\(signup\)/);
  assert.match(operations, /function signupIsSignedUpContact\(signup\)/);
  assert.match(operations, /normalizePaymentStatusKey\(signup\.payment_status\) === 'paid'/);
  assert.match(operations, /Boolean\(linkedStudentForSignup\(signup\)\)/);
  assert.match(operations, /signupHasCompletedRegistration\(signup\)/);
  assert.match(operations, /if \(signupIsSignedUpContact\(signup\)\) return false;/);
  assert.match(operations, /if \(section === 'intake'\) return signupNeedsIntakeReview\(signup\);/);
  assert.doesNotMatch(operations, /if \(section === 'intake'\) return \['new', 'contacted', 'interview_scheduled'\]\.includes\(status\) \|\| missingContact;/);
});

test('Contacts copy separates signed-up families from interested prospects', () => {
  assert.match(operations, /\{ id: 'intake', label: 'Signup Review' \}/);
  assert.match(operations, /title: 'Signup Review'/);
  assert.match(operations, /Signed-up families live in Contacts\/Students; prospects live in Leads \/ Interested Parents\./);
  assert.match(operations, /No signup records need review\. Signed-up families are in Contacts\/Students; prospects stay in Leads \/ Interested Parents\./);
});

test('Task proof links accept live smoke reports and registers', () => {
  assert.match(server, /'ops\/live-smokes\/'/);
  assert.match(server, /'tasks-pending\/'/);
  assert.match(server, /ops\\\/live-smokes\|tasks-pending/);
});

test('One Time CRM Contacts UX shows scoped lead source, no-send, and dedupe state', () => {
  assert.match(operations, /data-one-time-crm-contacts-ux/);
  assert.match(operations, /REQ-20260621-905/);
  assert.match(operations, /\{ id: 'crm_contacts', label: 'CRM Contacts' \}/);
  assert.match(operations, /function oneTimeCrmLeadRows\(\)/);
  assert.match(operations, /function oneTimeCrmContactRows\(options = \{\}\)/);
  assert.match(operations, /function oneTimeProductLeadRows\(\)/);
  assert.match(operations, /function oneTimeCrmMemberRows\(\)/);
  assert.match(operations, /function oneTimeLeadNoSendState\(lead\)/);
  assert.match(operations, /function oneTimeLeadDedupeState\(lead\)/);
  assert.match(operations, /function oneTimeLeadSourceState\(lead\)/);
  assert.match(operations, /function oneTimeCrmContactRow\(lead\)/);
  assert.match(operations, /function oneTimeCrmProductLeadRow\(lead\)/);
  assert.match(operations, /function oneTimeCrmMemberRow\(member\)/);
  assert.match(operations, /One Time CRM Contacts/);
  assert.match(operations, /Lead status, source, no-send, dedupe\/review state, and local communications are visible/);
  assert.match(operations, /No email, WhatsApp, payment, or external CRM write/);
  assert.match(operations, /Private BNA goals, check-ins, admin notes, and school-only student data are not shown in One Time Contacts/);
  assert.match(operations, /one-time-no-send-until-approved/);
  assert.match(operations, /one-time-campaign-staging/);
  assert.match(operations, /data-one-time-crm-contact-row/);
  assert.match(operations, /data-one-time-crm-empty-state/);
  assert.match(operations, /data-one-time-crm-contact-card/);
  assert.match(operations, /one-time-crm-contact-card-list/);
  assert.match(operations, /No One Time CRM contacts loaded yet/);
  assert.match(operations, /Duplicate contact review/);
  assert.match(operations, /Product interest/);
  assert.match(operations, /Member access/);
  assert.match(operations, /addLeadCommunication\(\$\{leadId\}\)/);
  assert.match(operations, /External sends and CRM writes require operator approval/);
  assert.match(operations, /Direct Action/);
});

test('One Time Contacts fetch parent leads with the selected workspace project scope', () => {
  assert.match(operations, /getParentLeads\(filters = \{\}\)/);
  assert.match(operations, /if \(filters\.project_key\) params\.set\('project_key', filters\.project_key\)/);
  assert.match(operations, /if \(filters\.workspace\) params\.set\('workspace', filters\.workspace\)/);
  assert.match(operations, /needsContactData \? api\.getParentLeads\(workspaceDataFilters\)/);

  const route = sliceBetween(server, "app.get('/api/bna/parent-leads'", "async function updateExistingParentLeadFromBody");
  assert.match(route, /appendRequestedProjectScopeCondition\(req, conditions, params, 'l\.project_id'\)/);
  assert.match(route, /SELECT l\.\*, p\.project_key, p\.name AS project_name/);
  assert.match(route, /LEFT JOIN bna_projects p ON p\.id = l\.project_id/);
  assert.doesNotMatch(route, /appendScopeCondition\(req, conditions, params, 'project_id'\)/);
});

test('Job 101 canonical contact work unifies Contacts, leads, CRM tags, and communication filters', () => {
  const contactTabs = sliceBetween(operations, 'const CONTACT_SUBTABS = [', '];');
  assert.match(contactTabs, /\{ id: 'crm_contacts', label: 'CRM Contacts' \}/);
  assert.match(contactTabs, /\{ id: 'notes', label: 'Notes \/ Activity' \}/);

  assert.match(operations, /data-job101-contact-unified-filters="TASK-20260702-012-B"/);
  assert.match(operations, /function contactGraphRows\(\)/);
  assert.match(operations, /\.\.\.parentLeads\.flatMap\(leadTags\)/);
  assert.match(operations, /firstPartyCrmOptionList\(sharedTagOptions, firstPartyCrmFilters\.tag\)/);
  assert.match(operations, /contactSection === 'notes' \|\| contactSection === 'communications'/);

  assert.match(operations, /function contactTagsForCommunication\(item = \{\}\)/);
  assert.match(operations, /\.filter\(signup => communicationMatchesSignup\(item, signup\)\)/);
  assert.match(operations, /\.filter\(lead => communicationMatchesLead\(item, lead\)\)/);
  assert.match(operations, /function communicationMatchesContactFilters\(item = \{\}\)/);
  assert.match(operations, /const filtered = sectionItems\.filter\(communicationMatchesContactFilters\)/);
  assert.match(operations, /renderCommunicationFilterPanel\(sectionItems, filtered\)/);
  assert.match(operations, /communicationMatchesLead\(item, lead\)/);
});
