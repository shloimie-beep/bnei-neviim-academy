const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const bufferOps = fs.readFileSync('scripts/buffer-ops.mjs', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');

test('server exposes protected Buffer, Resend, draft, schedule, email, and DNS endpoints', () => {
  [
    "app.get('/api/bna/integrations/buffer/health', requireAdmin",
    "app.get('/api/bna/integrations/buffer/channels', requireAdmin",
    "app.get('/api/bna/integrations/resend/health', requireAdmin",
    "app.get('/api/bna/integrations/resend/domains', requireAdmin",
    "app.get('/api/bna/integrations/resend/events', requireAdmin",
    "app.get('/api/bna/integrations/resend/domains/:domain/status', requireAdmin",
    "app.post('/api/bna/integrations/resend/domains/:domain/verify', requireAdmin",
    "app.post('/api/bna/resend/webhook', async",
    "app.post('/api/bna/communications/social/drafts', requireAdmin",
    "app.post('/api/bna/communications/social/schedule/preview', requireAdmin",
    "app.post('/api/bna/communications/social/schedule/confirm', requireAdmin",
    "app.post('/api/bna/communications/email/drafts', requireAdmin",
    "app.post('/api/bna/communications/email/send', requireAdmin",
    "app.get('/api/bna/communications/dns-tasks', requireAdmin",
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('communications integration schema includes social, email draft, and DNS setup task models', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_social_posts/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_email_drafts/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_resend_webhook_events/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_dns_setup_tasks/);
  assert.match(server, /copied_from_dashboard_at TIMESTAMP/);
  assert.match(server, /verified_at TIMESTAMP/);
  assert.match(server, /processResendWebhook/);
  assert.match(server, /req\.rawBody/);
  assert.match(server, /looksLikeTruncatedDnsValue/);
  assert.match(server, /truncated screenshot values were intentionally not stored/);
});

test('DNS task readback fails soft for integration setup errors', () => {
  const dnsTasksRoute = server.slice(
    server.indexOf("app.get('/api/bna/communications/dns-tasks'"),
    server.indexOf("app.post('/api/bna/communications/dns-tasks'")
  );
  assert.match(dnsTasksRoute, /safeIntegrationError\(err, 'DNS setup task readback failed'\)/);
  assert.match(dnsTasksRoute, /res\.status\(200\)\.json/);
  assert.match(dnsTasksRoute, /read_blocked: true/);
  assert.match(dnsTasksRoute, /dns_tasks: \[\]/);
});

test('Buffer channel readback fails soft instead of forcing Operations logout', () => {
  const bufferChannelsRoute = server.slice(
    server.indexOf("app.get('/api/bna/integrations/buffer/channels'"),
    server.indexOf("app.get('/api/bna/integrations/resend/health'")
  );
  assert.match(bufferChannelsRoute, /safeIntegrationError\(err, 'Buffer channel lookup failed'\)/);
  assert.match(bufferChannelsRoute, /res\.status\(200\)\.json/);
  assert.match(bufferChannelsRoute, /read_blocked: true/);
  assert.match(bufferChannelsRoute, /channels: \[\]/);
  assert.match(bufferChannelsRoute, /upstream_status: safe\.status \|\| null/);
});

test('communications detail route does not intercept named communications subroutes', () => {
  const detailRoute = server.slice(
    server.indexOf("app.get('/api/bna/communications/:id'"),
    server.indexOf("app.get('/api/bna/contacts/:id/communications'")
  );
  assert.match(detailRoute, /async \(req, res, next\)/);
  assert.match(detailRoute, /\/\^\\d\+\$\/\.test/);
  assert.match(detailRoute, /return next\(\)/);
});

test('Operations UI renders Communications integrations without exposing secret fields', () => {
  assert.match(operations, /data-communications-integrations/);
  assert.match(operations, /renderCommunicationsIntegrationPanel/);
  assert.match(operations, /section === 'settings' \? renderCommunicationsIntegrationPanel\(\)/);
  assert.match(operations, /getBufferIntegrationHealth/);
  assert.match(operations, /getResendIntegrationHealth/);
  assert.match(operations, /getResendEvents/);
  assert.match(operations, /data-resend-webhook-events/);
  assert.match(operations, /Confirm schedule/);
  assert.match(operations, /Provider connection/);
  assert.match(operations, /Sender identity/);
  assert.match(operations, /Send locked/);
  assert.match(operations, /id="commIntegrationEmailHtml"/);
  assert.match(operations, /name="html"/);
  assert.equal((operations.match(/id="commEmailTo"/g) || []).length, 1);
  assert.equal((operations.match(/id="commEmailText"/g) || []).length, 1);
  assert.doesNotMatch(operations, /BUFFER_API_KEY/);
  assert.doesNotMatch(operations, /RESEND_API_KEY/);
});

test('Telegram Buffer path is draft-only and /accounts uses readiness-aware API', () => {
  assert.match(bridge, /\/api\/bna\/integrations\/buffer\/health/);
  assert.match(bridge, /Buffer setup blocker/);
  assert.match(bufferOps, /const mode = 'addToQueue'/);
  assert.match(bufferOps, /const saveToDraft = true/);
  assert.match(bufferOps, /publish_blocked_by_policy/);
});

test('.env.example contains blank communications placeholders only', () => {
  assert.match(envExample, /BUFFER_API_KEY=\r?\n/);
  assert.match(envExample, /BUFFER_ORGANIZATION_ID=\r?\n/);
  assert.match(envExample, /RESEND_API_KEY=\r?\n/);
  assert.match(envExample, /RESEND_ACCOUNT_OWNER=unknown/);
  assert.match(envExample, /RESEND_SEND_FALLBACK_APPROVED=false/);
  assert.doesNotMatch(envExample, /re_[A-Za-z0-9]/);
});
