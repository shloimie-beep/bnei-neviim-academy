'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('server wires service-provider scope and first-party CRM routes', () => {
  const server = read('server.js');
  [
    "require('./src/lib/bna/account-scope-entitlements')",
    "require('./src/lib/bna/crm-contact-model')",
    "require('./src/lib/bna/assistant-scope-policy')",
    "app.get('/api/bna/account-scope/summary'",
    "app.get('/api/bna/crm/contacts'",
    "app.post('/api/bna/crm/contacts'",
    "app.get('/api/bna/crm/contacts/:id/timeline'",
    "app.get('/api/bna/crm/contacts/:id'",
    "app.patch('/api/bna/crm/contacts/:id'",
    "app.post('/api/bna/crm/contacts/:id/notes'",
    "app.post('/api/bna/crm/contacts/:id/tasks'",
    "app.patch('/api/bna/crm/tasks/:taskId'",
    "app.get('/api/bna/crm/contacts/:id/threads'",
    "app.post('/api/bna/crm/threads/:threadId/messages'",
    "app.post('/api/bna/assistant/scope-plan'",
    "app.get('/api/provider-portal/scope-session'",
    "app.get('/api/provider-portal/inquiries'",
    "app.post('/api/provider-portal/inquiries/:id/response-draft'",
    "app.get('/api/provider-portal/calendar-events'",
    "app.post('/api/provider-portal/assistant/scope-plan'",
  ].forEach((needle) => assert.match(server, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  assert.match(server, /no_external_calendar_write/);
  assert.match(server, /external_write_performed:\s*false/);
  assert.match(server, /async function createOperationsCrmFollowUpTask/);
  assert.match(server, /INSERT INTO bna_tasks \(/);
  assert.match(server, /'dashboard',\s*\$6::jsonb,\s*\$7::jsonb/);
  assert.match(server, /'follow_up_task' AS communication_type/);
  assert.match(server, /guarded_outbox_required:\s*true/);
  assert.match(server, /queued:\s*false/);
  assert.match(server, /one_time_crm_reply_draft/);
});
test('provider and operations UIs expose scoped package surfaces', () => {
  const provider = read('public/provider.html');
  const operations = `${read('public/operations.html')}\n${read('public/js/operations-shell.js')}`;

  [
    'data-provider-section="inquiries"',
    'data-provider-section="calendar"',
    'data-provider-section="parent_portal"',
    'data-provider-section="student_portal"',
    'ACTION-PROVIDER-INQUIRY-RESPONSE-DRAFT',
    'ACTION-PROVIDER-PORTAL-UPGRADE',
  ].forEach((needle) => assert.match(provider, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  [
    'getCrmContacts',
    'createCrmContact',
    'getCrmContact',
    'getCrmContactTimeline',
    'createCrmContactNote',
    'createCrmContactTask',
    'updateCrmTask',
    'getCrmContactThreads',
    'draftCrmThreadMessage',
    'renderFirstPartyCrmContactsPanel',
    'membership_access',
    'follow_up_task',
    'id="rabbiMemberName"',
    "display_name: document.getElementById('rabbiMemberName')?.value || ''",
    'id="rabbiMemberEmail"',
    "email: document.getElementById('rabbiMemberEmail')?.value || ''",
    'id="rabbiMemberPhone"',
    "phone: document.getElementById('rabbiMemberPhone')?.value || ''",
    'create_follow_up_task',
    'crmMailboxTargetEmail',
    'emailRecordMatchesCrmTarget',
    'clearCrmMailboxTarget',
    'ACTION-CRM-CONTACTS-FILTER',
    'ACTION-CRM-CONTACT-CARD-EXPAND',
    'ACTION-CRM-INTERNAL-NOTE-BLOCKED',
    'ACTION-CRM-TASK-BLOCKED',
    'ACTION-CRM-REPLY-DRAFT-BLOCKED',
  ].forEach((needle) => assert.match(operations, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
});

test('migration and registries cover service-provider scope package', () => {
  const migration = read('railway-migration-2026-06-26-service-provider-scopes-crm.sql');
  assert.doesNotMatch(migration, /UNIQUE\s*\([^)]*COALESCE/i);
  assert.doesNotMatch(migration, /ON CONFLICT\s*\([^)]*COALESCE/i);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS bna_account_scope_entitlements/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS bna_provider_contact_inquiries/);

  const actionRegistry = JSON.parse(read('ops/action-registry.json'));
  const routeRegistry = JSON.parse(read('ops/route-registry.json'));
  const actionIds = new Set(actionRegistry.actions.map((entry) => entry.action_id));
  const routes = new Set(routeRegistry.routes.map((entry) => entry.route));

  [
    'ACTION-PROVIDER-SETUP-HELP',
    'ACTION-PROVIDER-INQUIRY-RESPONSE-DRAFT',
    'ACTION-PROVIDER-CALENDAR-MANAGE',
    'ACTION-PROVIDER-PORTAL-UPGRADE',
    'ACTION-CRM-CONTACTS-FILTER',
    'ACTION-CRM-CONTACT-CARD-EXPAND',
    'ACTION-CRM-CONTACT-MAILBOX-OPEN',
    'ACTION-CRM-CONTACT-SAFE-UPDATE',
    'ACTION-CRM-CONTACT-CREATE',
    'ACTION-CRM-INTERNAL-NOTE-BLOCKED',
    'ACTION-CRM-CONTACT-NOTE-CREATE',
    'ACTION-CRM-TASK-BLOCKED',
    'ACTION-CRM-CONTACT-TASK-CREATE',
    'ACTION-CRM-TASK-UPDATE',
    'ACTION-CRM-REPLY-DRAFT-BLOCKED',
    'ACTION-CRM-CONTACT-THREADS-READ',
    'ACTION-CRM-THREAD-MESSAGE-DRAFT',
    'ACTION-ASSISTANT-CODEX-CLI-ROUTING-DISABLED',
  ].forEach((id) => assert.equal(actionIds.has(id), true, `${id} is registered`));

  [
    '/api/bna/account-scope/summary',
    '/api/bna/crm/contacts',
    '/api/bna/crm/contacts/:id/timeline',
    '/api/bna/crm/contacts/:id',
    '/api/bna/crm/contacts/:id/notes',
    '/api/bna/crm/contacts/:id/tasks',
    '/api/bna/crm/tasks/:taskId',
    '/api/bna/crm/contacts/:id/threads',
    '/api/bna/crm/threads/:threadId/messages',
    '/api/bna/assistant/scope-plan',
    '/api/provider-portal/scope-session',
    '/api/provider-portal/inquiries',
    '/api/provider-portal/inquiries/:id/response-draft',
    '/api/provider-portal/calendar-events',
    '/api/provider-portal/assistant/scope-plan',
  ].forEach((route) => assert.equal(routes.has(route), true, `${route} is registered`));
});
