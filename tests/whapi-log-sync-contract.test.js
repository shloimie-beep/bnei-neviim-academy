const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const packageJson = fs.readFileSync('package.json', 'utf8');
const historySync = fs.readFileSync('scripts/sync-whapi-history.mjs', 'utf8');

test('Whapi log sync persists runs and imports history into communications', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_wapi_sync_runs/);
  assert.match(server, /app\.post\('\/api\/bna\/wapi\/sync'/);
  assert.match(server, /app\.get\('\/api\/bna\/wapi\/sync-runs'/);
  assert.match(server, /runWapiMessageSync/);
  assert.match(server, /\/messages\/list/);
  assert.match(server, /createCommunicationFromWapiWebhook\(\{/);
  assert.match(server, /wapi_sync_run_id/);
  assert.match(server, /fromMe/);
  assert.match(server, /occurredAt/);
});

test('Whapi history contact identity matching is workspace scoped', () => {
  const block = server.slice(
    server.indexOf('async function findOrCreateWhatsappContact'),
    server.indexOf('async function importWhatsappMessages')
  );
  assert.match(block, /i\.workspace_id = \$2/);
  assert.match(block, /c\.workspace_id = \$2/);
  assert.match(block, /upsertContactIdentity\(\{ workspaceId, contactId: contact\.id, identityType: 'phone'/);
  assert.match(block, /upsertContactIdentity\(\{ workspaceId, contactId: contact\.id, identityType: 'whatsapp'/);
}
);

test('Whapi log sync is exposed in Operations and Telegram without sending messages', () => {
  assert.match(operations, /Whapi Log Sync/);
  assert.match(operations, /syncWapiLog/);
  assert.match(operations, /No WhatsApp messages will be sent/);
  assert.match(bridge, /parseWhatsappSyncCommand/);
  assert.match(bridge, /formatWapiSyncReply/);
  assert.match(bridge, /\/wapi_sync/);
  assert.match(bridge, /\/api\/bna\/wapi\/sync/);
});

test('Whapi configuration is documented with token and sync timeout', () => {
  assert.match(envExample, /WHAPI_API_TOKEN=/);
  assert.match(envExample, /WHAPI_API_BASE_URL=https:\/\/gate\.whapi\.cloud/);
  assert.match(envExample, /WAPI_SYNC_TIMEOUT_MS=20000/);
});

test('Whapi full sync script imports contacts, groups, chats, and paged history', () => {
  assert.match(packageJson, /"whapi:sync": "node scripts\/sync-whapi-history\.mjs"/);
  assert.match(historySync, /CREATE TABLE IF NOT EXISTS bna_wapi_contacts/);
  assert.match(historySync, /CREATE TABLE IF NOT EXISTS bna_wapi_chats/);
  assert.match(historySync, /CREATE TABLE IF NOT EXISTS bna_wapi_directory_sync_runs/);
  assert.match(historySync, /endpoint: '\/contacts'/);
  assert.match(historySync, /endpoint: '\/chats'/);
  assert.match(historySync, /endpoint: '\/messages\/list'/);
  assert.match(historySync, /provider_chat_id TEXT NOT NULL UNIQUE/);
  assert.match(historySync, /is_group BOOLEAN DEFAULT FALSE/);
  assert.match(historySync, /source_context->>'message_id'/);
  assert.match(historySync, /whapi_full_sync/);
});
