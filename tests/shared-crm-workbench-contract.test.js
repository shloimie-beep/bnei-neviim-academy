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
  assert.equal(global.BnaCrmActions.whatsappHref('+1 (555) 100-2000'), 'https://wa.me/15551002000');
  assert.equal(global.BnaCrmInbox.scopeForWorkspace('rabbi_sheller_provider'), 'rabbi');
});

test('CRM routes delegate DTOs through the canonical contact service', () => {
  assert.match(server, /const \{ createContactService \} = require\('\.\/src\/lib\/bna\/crm\/contact-service'\);/);
  assert.match(server, /const operationsCrmContactService = createContactService\({[\s\S]*listContactRows: \(scope, filters\) => operationsCrmContactRows\(scope, pool, filters\),[\s\S]*timelineRows: operationsCrmTimelineRows,[\s\S]*parseContactRef: parseCrmContactRef,[\s\S]*}\);/);
  assert.match(server, /const payload = await operationsCrmContactService\.listContacts\(scope, filters\);/);
  assert.match(server, /const payload = await operationsCrmContactService\.getContactTimeline\(req\.params\.id, scope\);/);
  assert.match(contactService, /aggregate_service: 'bna_crm_contact_service_v1'/);
});
