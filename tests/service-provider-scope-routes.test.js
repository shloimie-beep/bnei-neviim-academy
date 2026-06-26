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
    "app.get('/api/bna/crm/contacts/:id/timeline'",
    "app.post('/api/bna/assistant/scope-plan'",
    "app.get('/api/provider-portal/scope-session'",
    "app.get('/api/provider-portal/inquiries'",
    "app.post('/api/provider-portal/inquiries/:id/response-draft'",
    "app.get('/api/provider-portal/calendar-events'",
    "app.post('/api/provider-portal/assistant/scope-plan'",
  ].forEach((needle) => assert.match(server, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  assert.match(server, /no_external_calendar_write/);
  assert.match(server, /external_write_performed:\s*false/);
});
test('provider and operations UIs expose scoped package surfaces', () => {
  const provider = read('public/provider.html');
  const operations = read('public/operations.html');

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
    'getCrmContactTimeline',
    'renderFirstPartyCrmContactsPanel',
    'ACTION-CRM-CONTACTS-FILTER',
    'ACTION-CRM-CONTACT-CARD-EXPAND',
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
    'ACTION-ASSISTANT-CODEX-CLI-ROUTING-DISABLED',
  ].forEach((id) => assert.equal(actionIds.has(id), true, `${id} is registered`));

  [
    '/api/bna/account-scope/summary',
    '/api/bna/crm/contacts',
    '/api/bna/crm/contacts/:id/timeline',
    '/api/bna/assistant/scope-plan',
    '/api/provider-portal/scope-session',
    '/api/provider-portal/inquiries',
    '/api/provider-portal/inquiries/:id/response-draft',
    '/api/provider-portal/calendar-events',
    '/api/provider-portal/assistant/scope-plan',
  ].forEach((route) => assert.equal(routes.has(route), true, `${route} is registered`));
});
