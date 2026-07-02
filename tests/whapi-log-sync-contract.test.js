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

test('Whapi log sync is exposed in Operations and Telegram without sending messages', () => {
  assert.match(operations, /WhatsApp Setup/);
  assert.match(operations, /"Wappy" maps to the repo's Whapi\/WAPI connector/);
  assert.match(operations, /Provider account status/);
  assert.match(operations, /Phone number/);
  assert.match(operations, /API key\/token/);
  assert.match(operations, /Instance ID/);
  assert.match(operations, /Webhook URL/);
  assert.match(operations, /Send-enabled status/);
  assert.match(operations, /Last test status/);
  assert.match(operations, /create\/pay for Whapi\/WAPI provider account/);
  assert.match(operations, /No real WhatsApp sends in this packet/);
  assert.match(operations, /Safe Test Send/);
  assert.match(operations, /Enable Reminders/);
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
  assert.match(envExample, /WHAPI_PHONE_NUMBER=/);
  assert.match(envExample, /WHAPI_INSTANCE_ID=/);
  assert.match(envExample, /WHAPI_WEBHOOK_URL=/);
  assert.match(envExample, /WAPI_PHONE_NUMBER=/);
  assert.match(envExample, /WAPI_INSTANCE_ID=/);
  assert.match(envExample, /WAPI_WEBHOOK_URL=/);
  assert.match(envExample, /WAPI_SYNC_TIMEOUT_MS=20000/);
});

test('Whapi diagnostics returns setup status and fingerprints only', () => {
  assert.match(server, /provider: 'whapi_wapi'/);
  assert.match(server, /spoken_aliases: \['Wappy'\]/);
  assert.match(server, /provider_account_status: WAPI_API_TOKEN \? 'token_configured' : 'missing_provider_token'/);
  assert.match(server, /phone_number_fingerprint: WAPI_PHONE_NUMBER \? sha256Hex\(WAPI_PHONE_NUMBER\)\.slice\(0, 12\) : null/);
  assert.match(server, /api_token_fingerprint: WAPI_API_TOKEN \? sha256Hex\(WAPI_API_TOKEN\)\.slice\(0, 12\) : null/);
  assert.match(server, /instance_id_fingerprint: WAPI_INSTANCE_ID \? sha256Hex\(WAPI_INSTANCE_ID\)\.slice\(0, 12\) : null/);
  assert.match(server, /webhook_url_fingerprint: WAPI_WEBHOOK_URL \? sha256Hex\(WAPI_WEBHOOK_URL\)\.slice\(0, 12\) : null/);
  assert.match(server, /setup_webhook_route: '\/api\/webhooks\/wapi'/);
  assert.match(server, /send_enabled_status: WAPI_API_TOKEN \? 'configured_requires_SEND_WHATSAPP_confirmation' : 'disabled_missing_provider_token'/);
  assert.match(server, /no_real_send_performed: true/);
  assert.match(server, /external_write_performed: false/);
  assert.doesNotMatch(server, /res\.json\(\{[\s\S]{0,900}WAPI_API_TOKEN,/);
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
