'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');
const contactService = fs.readFileSync('src/lib/bna/crm/contact-service.js', 'utf8');

function runBrowserModule(relativePath, context = {}) {
  const file = path.join(process.cwd(), relativePath);
  const sandbox = {
    window: {},
    URLSearchParams,
    ...context,
  };
  sandbox.window = sandbox.window || sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: relativePath });
  return sandbox.window;
}

test('Operations loads the shared CRM browser modules before the shell', () => {
  for (const src of [
    '/js/crm/crm-api.js',
    '/js/crm/crm-store.js',
    '/js/crm/contacts-index.js',
    '/js/crm/contact-workspace.js',
    '/js/crm/crm-actions.js',
    '/js/crm/crm-inbox.js',
  ]) {
    assert.match(operations, new RegExp(`<script src="${src.replace(/\//g, '\\/')}"><\\/script>`));
  }
  assert.match(operations, /<link rel="stylesheet" href="\/css\/crm-core\.css">/);
  assert.match(operations, /data-shared-crm-workbench="true"/);
  assert.match(operations, /data-shared-crm-component="contacts-index"/);
  assert.match(operations, /data-shared-crm-component="contact-workspace"/);
  assert.match(operations, /data-shared-crm-component="contact-inspector"/);
  assert.match(operations, /function firstPartyCrmWorkbenchContract\(\)/);
  assert.match(operations, /function firstPartyCrmWorkbenchContractAttrs\(\)/);
  assert.match(operations, /data-crm-contract-version/);
  assert.match(operations, /data-crm-component-order/);
  assert.match(operations, /data-crm-mobile-breakpoint/);
  assert.match(operations, /data-crm-back-control-height/);
  assert.match(operations, /\.crm-mobile-selected-actions \.task-action[\s\S]*min-height: 40px;/);
});

test('Operations CRM contact workspace keeps URL state for reload and browser Back', () => {
  assert.match(operations, /let selectedFirstPartyCrmContactId = currentView === 'contacts' && contactSection === 'crm_contacts'[\s\S]*initialParams\.get\('crm_contact'\)/);
  assert.match(operations, /function syncFirstPartyCrmUrlParams\(url\)/);
  assert.match(operations, /url\.searchParams\.set\('crm_contact', selectedFirstPartyCrmContactId\)/);
  assert.match(operations, /crm_search: \['search', ''\]/);
  assert.match(operations, /crm_sort: \['sort_key', 'last_contact_desc'\]/);
  assert.match(operations, /syncFirstPartyCrmUrlParams\(url\);/);
  assert.match(operations, /await openFirstPartyCrmContact\(selectedFirstPartyCrmContactId, \{ captureScroll: false, syncUrl: false \}\);/);
  assert.match(operations, /if \(options\.syncUrl !== false\) syncOperationsUrl\(\);/);
  assert.match(operations, /function clearFirstPartyCrmSelection\(event\)[\s\S]*syncOperationsUrl\(\);[\s\S]*updateFirstPartyCrmPanel\(\);/);
});

test('Operations CRM local update form is first-party only and does not auto-create tasks', () => {
  assert.match(operations, /function renderFirstPartyCrmLocalUpdateForm\(card = \{\}, readOnly = false\)/);
  assert.match(operations, /data-crm-local-update-form/);
  assert.match(operations, /data-action-id="ACTION-CRM-CONTACT-SAFE-UPDATE"/);
  assert.match(operations, /Saves only first-party CRM fields and notes\. External sends, access changes, imports, and task creation stay off\./);
  assert.match(operations, /create_follow_up_task: false/);
  assert.match(server, /const shouldCreateFollowUpTask = body\.create_follow_up_task === true \|\| String\(body\.create_follow_up_task \|\| ''\)\.toLowerCase\(\) === 'true';/);
});

test('Operations CRM follow-up actions are explicit and can clear persisted dates', () => {
  assert.match(operations, /data-action-id="ACTION-CRM-SET-FOLLOW-UP"/);
  assert.match(operations, /data-action-id="ACTION-CRM-CHANGE-FOLLOW-UP"/);
  assert.match(operations, /data-action-id="ACTION-CRM-CLEAR-FOLLOW-UP"/);
  assert.match(operations, /const submitterActionId = event\.submitter\?\.dataset\?\.actionId \|\| 'ACTION-CRM-CONTACT-SAFE-UPDATE';/);
  assert.match(operations, /submitterActionId === 'ACTION-CRM-CLEAR-FOLLOW-UP'[\s\S]*\? ''/);
  assert.match(operations, /'ACTION-CRM-SET-FOLLOW-UP', 'ACTION-CRM-CHANGE-FOLLOW-UP'/);
  assert.match(operations, /crm_action_id: submitterActionId/);
  assert.match(server, /const hasNextFollowUpField = Object\.prototype\.hasOwnProperty\.call\(body, 'next_follow_up_at'\)[\s\S]*Object\.prototype\.hasOwnProperty\.call\(body, 'next_follow_up_date'\);/);
  assert.match(server, /if \(hasNextFollowUpField\) addField\('next_follow_up_date', nextFollowUpAt \|\| null\);/);
  assert.match(server, /if \(hasNextFollowUpField\) metadata\.next_follow_up_at = nextFollowUpAt \|\| null;/);
  assert.match(server, /crm_action_id: crmActionId \|\| null/);
});

test('Operations CRM Add Contact action is first-party and workspace-scoped', () => {
  assert.match(operations, /let firstPartyCrmAddContactOpen = false;/);
  assert.match(operations, /data-action-id="ACTION-CRM-ADD-CONTACT"/);
  assert.match(operations, /data-crm-add-contact-form/);
  assert.match(operations, /function saveFirstPartyCrmNewContact\(event\)/);
  assert.match(operations, /api\.createCrmContact/);
  assert.match(operations, /create_follow_up_task: false/);
  assert.match(operations, /No email, WhatsApp, Telegram, payment, access, import, or external CRM write runs\./);
  assert.match(server, /app\.post\('\/api\/bna\/crm\/contacts', requireAdmin, async \(req, res\) =>/);
  assert.match(server, /assertWorkspaceAccess\(req, scope\.workspace_key \|\| defaultWorkspaceKeyForRequest\(req\), 'add CRM contact'\)/);
  assert.match(server, /accountScope\.assertEntitlement\(scope, accountScope\.ENTITLEMENTS\.CRM_CONTACTS\)/);
  assert.match(server, /i\.workspace_id = c\.workspace_id/);
  assert.match(server, /upsertContactIdentity\(\{ workspaceId, contactId: contact\.id, identityType: 'email'/);
  assert.match(server, /upsertContactIdentity\(\{ workspaceId, contactId: contact\.id, identityType: 'whatsapp'/);
  assert.match(server, /event_type, pipeline_status, summary, source, metadata/);
  assert.match(server, /external_write_performed: false/);
});

test('Operations CRM Create task action is explicit and first-party only', () => {
  assert.doesNotMatch(operations, /ACTION-CRM-CREATE-TASK-PENDING/);
  assert.match(operations, /data-action-id="ACTION-CRM-CREATE-TASK"/);
  assert.match(operations, /function createFirstPartyCrmTask\(event, contactId\)/);
  assert.match(operations, /create_follow_up_task: true/);
  assert.match(operations, /Created by an explicit Create task click in the CRM contact workspace/);
  assert.match(operations, /No message, payment, access grant, import, or external CRM write was performed/);
  assert.match(operations, /no_send: true/);
  assert.match(operations, /external_write_performed: false/);
  assert.match(operations, /Create task is unavailable in read-only preview\./);
  assert.match(server, /if \(shouldCreateFollowUpTask\) \{[\s\S]*followUpTask = await createOperationsCrmFollowUpTask/);
  assert.match(server, /No email, WhatsApp, payment, access, import, or external CRM write was performed by creating this task\./);
});

test('Operations CRM linked task state actions are explicit first-party updates', () => {
  assert.match(operations, /function renderFirstPartyCrmLinkedTaskPanel\(card = \{\}, readOnly = false\)/);
  assert.match(operations, /data-action-id="ACTION-CRM-COMPLETE-TASK"/);
  assert.match(operations, /data-action-id="ACTION-CRM-REOPEN-TASK"/);
  assert.match(operations, /function updateFirstPartyCrmLinkedTask\(event, contactId, mode = 'complete'\)/);
  assert.match(operations, /await api\.updateTask\(taskId, payload\)/);
  assert.match(operations, /stage: 'done'/);
  assert.match(operations, /completed_at: new Date\(\)\.toISOString\(\)/);
  assert.match(operations, /Completed by an explicit Complete task click in the CRM contact workspace/);
  assert.match(operations, /stage: 'assigned'/);
  assert.match(operations, /completed_at: null/);
  assert.match(operations, /verified_at: null/);
  assert.match(operations, /Reopened by an explicit Reopen task click in the CRM contact workspace/);
  assert.match(operations, /agent_status: 'none'/);
  assert.match(operations, /Task state changes are first-party CRM updates only\. No message, payment, access grant, import, or external CRM write runs\./);
  assert.match(server, /app\.patch\('\/api\/bna\/tasks\/:id', requireAdmin, async \(req, res\) =>/);
  assert.match(server, /await assertTaskAccess\(req, id\)/);
  assert.match(server, /'completed_at'/);
  assert.match(server, /'verified_at'/);
  assert.match(server, /'verification_notes'/);
  assert.match(server, /'agent_status'/);
});

test('Operations CRM Link member action creates a disabled first-party member shell only', () => {
  assert.match(operations, /function renderFirstPartyCrmMemberLinkPanel\(card = \{\}, readOnly = false\)/);
  assert.match(operations, /data-action-id="ACTION-CRM-LINK-MEMBER"/);
  assert.match(operations, /function linkFirstPartyCrmMember\(event, contactId\)/);
  assert.match(operations, /await api\.createMember\(\{/);
  assert.match(operations, /access_status: 'paused'/);
  assert.match(operations, /access_enabled: false/);
  assert.match(operations, /portal_link_created: false/);
  assert.match(operations, /access_not_granted: true/);
  assert.match(operations, /No portal link, library access, class link, payment, send, import, or external CRM write/);
  assert.match(operations, /Add an email before linking a member shell\./);
  assert.match(server, /app\.post\('\/api\/bna\/members', requireAdmin, async \(req, res\) =>/);
  assert.match(server, /access_enabled, notes, metadata/);
  assert.match(server, /body\.access_enabled === undefined \? true : liveClassBoolean\(body\.access_enabled, true\)/);
  assert.match(server, /const accessStatus = requireLiveAccessStatus\(body\.access_status \|\| body\.accessStatus, 'active'\)/);
  assert.match(server, /LEFT JOIN bna_projects cp[\s\S]*WHEN ws\.workspace_key = 'rabbi_sheller_provider' THEN 'one_time_mishnah_class'/);
  assert.match(server, /FROM bna_members m[\s\S]*AND m\.project_id = cp\.id[\s\S]*AND lower\(m\.email\) = lower\(c\.primary_email\)/);
  assert.match(server, /FROM bna_communications cm[\s\S]*AND cm\.project_id = cp\.id[\s\S]*AND lower\(COALESCE\(cm\.from_address, cm\.to_address, ''\)\) = lower\(c\.primary_email\)/);
  assert.match(server, /FROM bna_tasks t[\s\S]*AND t\.project_id = cp\.id[\s\S]*AND lower\(t\.related_contact_email\) = lower\(c\.primary_email\)/);
  assert.doesNotMatch(operations.match(/function linkFirstPartyCrmMember[\s\S]*?async function archiveFirstPartyCrmContact/)?.[0] || '', /createMemberAccessCode|access-code|checkout|payment_link/i);
});

test('Operations CRM Link family and Link student actions are first-party no-access writes only', () => {
  assert.match(operations, /function renderFirstPartyCrmFamilyLinkPanel\(card = \{\}, readOnly = false\)/);
  assert.match(operations, /function renderFirstPartyCrmStudentLinkPanel\(card = \{\}, readOnly = false\)/);
  assert.match(operations, /data-action-id="ACTION-CRM-LINK-FAMILY"/);
  assert.match(operations, /data-action-id="ACTION-CRM-LINK-STUDENT"/);
  assert.match(operations, /function linkFirstPartyCrmFamily\(event, contactId\)/);
  assert.match(operations, /function linkFirstPartyCrmStudent\(event, contactId\)/);
  assert.match(operations, /family_school_classification: 'family'/);
  assert.match(operations, /relationship_context: 'family'/);
  assert.match(operations, /create_follow_up_task: false/);
  assert.match(operations, /await api\.createStudent\(\{/);
  assert.match(operations, /status: 'paused'/);
  assert.match(operations, /student_access_not_granted/);
  assert.match(operations, /No student login, access code, class access, payment, send, import, or external CRM write/);
  assert.match(operations, /No portal login, access grant, message, payment, import, or external CRM write/);
  assert.match(operations, /Enter a student name before linking a student shell\./);
  assert.match(operations, /Add a parent email before linking a student shell\./);
  assert.match(operations, /createStudent\(payload = \{\}\) \{ return this\.request\('POST', '\/students', payload\); \}/);
  assert.match(server, /const familySchoolClassification = limitText\(String\(body\.family_school_classification/);
  assert.match(server, /metadata\.family_school_classification = familySchoolClassification/);
  assert.match(server, /relationship_link_source = 'operations_crm_workbench'/);
  assert.match(server, /SELECT s\.id[\s\S]*FROM bna_students s[\s\S]*s\.project_id = cp\.id[\s\S]*lower\(COALESCE\(s\.parent_email, ''\)\) = lower\(c\.primary_email\)/);
  const studentFn = operations.match(/async function linkFirstPartyCrmStudent[\s\S]*?async function archiveFirstPartyCrmContact/)?.[0] || '';
  assert.doesNotMatch(studentFn, /createStudentAccessCode|student_access_code|password|portal link|checkout|payment_link/i);
});

test('Operations CRM Archive Contact action is explicit and first-party only', () => {
  assert.match(operations, /data-action-id="ACTION-CRM-ARCHIVE-CONTACT"/);
  assert.match(operations, /function archiveFirstPartyCrmContact\(event, contactId\)/);
  assert.match(operations, /status: 'archived'/);
  assert.match(operations, /lifecycle_stage: 'archived'/);
  assert.match(operations, /Archived by an explicit Archive contact click in the CRM contact workspace/);
  assert.match(operations, /create_follow_up_task: false/);
  assert.match(operations, /external_write_performed: false/);
  assert.match(operations, /Archive contact is unavailable in read-only preview\./);
});

test('Operations CRM workspace tabs are enabled surfaces, not disabled placeholders', () => {
  assert.match(operations, /let firstPartyCrmActiveTab = 'activity';/);
  assert.match(operations, /function setFirstPartyCrmWorkspaceTab\(tabId\)/);
  assert.match(operations, /function renderFirstPartyCrmTabContent\(card = \{\}, readOnly = false\)/);
  assert.match(operations, /onclick="setFirstPartyCrmWorkspaceTab\(\$\{attrJson\(tab\.id\)\}\)"/);
  assert.match(operations, /data-crm-tab-panel="conversations"/);
  assert.match(operations, /data-crm-tab-panel="tasks"/);
  assert.match(operations, /data-crm-tab-panel="access"/);
  assert.match(operations, /data-crm-tab-panel="identity"/);
  assert.match(operations, /data-crm-tab-panel="family"/);
  assert.match(operations, /Communication Preference/);
  assert.match(operations, /Consent \/ Suppression/);
  assert.match(operations, /Family \/ School/);
  assert.doesNotMatch(operations, /tab\.enabled \? '' : `disabled aria-disabled="true"/);
});

test('Shared CRM modules expose paths, empty states, actions, and inbox scope', () => {
  const global = runBrowserModule('public/js/crm/crm-api.js');
  runBrowserModule('public/js/crm/crm-store.js', { window: global });
  runBrowserModule('public/js/crm/contact-workspace.js', { window: global });
  runBrowserModule('public/js/crm/contacts-index.js', { window: global });
  runBrowserModule('public/js/crm/crm-actions.js', { window: global });
  runBrowserModule('public/js/crm/crm-inbox.js', { window: global });

  assert.equal(global.BnaCrmApi.contactListPath({ workspace: 'rabbi_sheller_provider', empty: '' }), '/crm/contacts?workspace=rabbi_sheller_provider');
  assert.equal(global.BnaCrmApi.contactTimelinePath('bna_contacts:7', { limit: 20 }), '/crm/contacts/bna_contacts%3A7/timeline?limit=20');
  assert.equal(global.BnaCrmStore.stableQueryKey({ b: 2, a: 1 }), '{"a":1,"b":2}');
  assert.equal(global.BnaCrmContactsIndex.statusText({ cards: [{}, {}], payload: { filtered_total: 4, total: 9 } }), '2 visible / 4 matching / 9 total.');
  assert.equal(global.BnaCrmContactWorkspace.emptyState('conversations'), 'No conversations yet.');
  assert.equal(global.BnaCrmContactWorkspace.profileValue('email', ''), 'Email is not available for this contact.');
  assert.equal(JSON.stringify(global.BnaCrmContactWorkspace.workspaceTabs().map((tab) => [tab.id, tab.enabled])), JSON.stringify([
    ['overview', true],
    ['activity', true],
    ['conversations', true],
    ['tasks', true],
    ['access', true],
    ['identity', true],
    ['family', true],
  ]));
  assert.equal(JSON.stringify(global.BnaCrmContactWorkspace.workbenchContract()), JSON.stringify({
    version: 'shared-crm-v1',
    pane_count: 3,
    component_order: ['contacts-index', 'contact-workspace', 'contact-inspector'],
    desktop_grid: 'minmax(260px,0.78fr) minmax(0,1.12fr) minmax(240px,0.8fr)',
    tablet_breakpoint_px: 900,
    mobile_breakpoint_px: 700,
    mobile_back_control_height_px: 40,
  }));
  assert.equal(global.BnaCrmActions.whatsappHref('+1 (555) 100-2000'), 'https://wa.me/15551002000');
  assert.equal(global.BnaCrmActions.followUpTaskSummary({ display_name: 'Sara Parent' }), 'Manual CRM follow-up task for Sara Parent');
  assert.equal(global.BnaCrmInbox.scopeForWorkspace('rabbi_sheller_provider'), 'rabbi');
});

test('CRM routes delegate DTOs through the canonical contact service', () => {
  assert.match(server, /const \{ createContactService \} = require\('\.\/src\/lib\/bna\/crm\/contact-service'\);/);
  assert.match(server, /const operationsCrmContactService = createContactService\({[\s\S]*listContactRows: \(scope, filters\) => operationsCrmContactRows\(scope, pool, filters\),[\s\S]*timelineRows: operationsCrmTimelineRows,[\s\S]*parseContactRef: parseCrmContactRef,[\s\S]*}\);/);
  assert.match(server, /const payload = await operationsCrmContactService\.listContacts\(scope, filters\);/);
  assert.match(server, /const payload = await operationsCrmContactService\.getContactTimeline\(req\.params\.id, scope\);/);
  assert.match(contactService, /aggregate_service: 'bna_crm_contact_service_v1'/);
});
