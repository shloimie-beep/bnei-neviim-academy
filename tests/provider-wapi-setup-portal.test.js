const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const providerHtml = fs.readFileSync(path.join(root, 'public', 'provider.html'), 'utf8');
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));

function sourceBlock(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  assert.notEqual(start, -1, `missing start pattern ${startPattern}`);
  const tail = source.slice(start);
  const end = tail.search(endPattern);
  assert.notEqual(end, -1, `missing end pattern ${endPattern}`);
  return tail.slice(0, end);
}

test('provider portal exposes Rabbi/One Time WAPI setup section and save action', () => {
  assert.match(providerHtml, /data-provider-section="whatsapp_setup"/);
  assert.match(providerHtml, /providerWapiSetupEnabled\(\)/);
  assert.match(providerHtml, /one_time_mishnah_class/);
  assert.match(providerHtml, /rabbi_sheller_provider/);
  assert.match(providerHtml, /data-provider-wapi-setup-form/);
  assert.match(providerHtml, /ACTION-PROVIDER-WAPI-SETUP-SAVE/);
  assert.match(providerHtml, /\/api\/provider-portal\/integrations\/whatsapp-wapi\/setup/);
  assert.match(providerHtml, /providerWapiSetupLink\(\)/);

  const section = sourceBlock(
    providerHtml,
    /data-provider-section="whatsapp_setup"/,
    /data-provider-section="access"/
  );
  assert.doesNotMatch(section, /SEND_WHATSAPP|sendWhatsApp|sendWapi/i);
});

test('provider WAPI setup API is provider-session gated and stores secret references only', () => {
  assert.match(server, /app\.get\('\/api\/provider-portal\/integrations\/whatsapp-wapi\/setup', requireProviderSession/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/integrations\/whatsapp-wapi\/setup', requireProviderSession/);
  assert.match(server, /isOneTimeClassMediaProvider\(provider\)/);
  assert.match(server, /bna_provider_integrations/);
  assert.match(server, /bna_provider_secret_refs/);
  assert.match(server, /providerIntegrationSecretFingerprint/);
  assert.match(server, /pending_keyholder/);
  assert.match(server, /raw_secret_returned: false/);
  assert.match(server, /raw_secret_stored: false/);

  const saveBlock = sourceBlock(
    server,
    /async function saveProviderWapiSetup/,
    /function parseCrmContactRef/
  );
  assert.doesNotMatch(saveBlock, /sendWhatsAppText|sendWapiTextMessage|SEND_WHATSAPP/);
  assert.match(saveBlock, /encrypted_secret,\s*[\r\n\s]*encryption_version,\s*status/);
});

test('route and action registries cover provider WAPI setup', () => {
  const routes = routeRegistry.routes || [];
  const actions = actionRegistry.actions || [];
  const route = routes.find(item => item.route === '/api/provider-portal/integrations/whatsapp-wapi/setup');
  assert.ok(route, 'route registry entry is required');
  assert.equal(route.access, 'private_provider');
  assert.equal(route.public_allowed, false);
  assert.match(route.security_expectation, /no raw token/i);
  assert.match(route.security_expectation, /no WhatsApp send/i);

  const action = actions.find(item => item.action_id === 'ACTION-PROVIDER-WAPI-SETUP-SAVE');
  assert.ok(action, 'action registry entry is required');
  assert.equal(action.route, '/provider?section=whatsapp_setup');
  assert.match(action.expected_behavior, /secret-reference/i);
  assert.match(action.expected_behavior, /no WhatsApp send/i);
});
