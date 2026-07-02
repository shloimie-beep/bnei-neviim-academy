const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const bridge = fs.readFileSync('scripts/telegram-kimi-bridge.mjs', 'utf8');
const bufferOps = fs.readFileSync('scripts/buffer-ops.mjs', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

test('server exposes protected Buffer, Resend, draft, schedule, email, and DNS endpoints', () => {
  [
    "app.get('/api/bna/integrations/buffer/health', requireAdmin",
    "app.get('/api/bna/integrations/buffer/channels', requireAdmin",
    "app.get('/api/bna/integrations/resend/health', requireAdmin",
    "app.get('/api/bna/integrations/resend/domains', requireAdmin",
    "app.post('/api/bna/integrations/resend/domains/:domain/verify', requireAdmin",
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
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_dns_setup_tasks/);
  assert.match(server, /copied_from_dashboard_at TIMESTAMP/);
  assert.match(server, /verified_at TIMESTAMP/);
  assert.match(server, /looksLikeTruncatedDnsValue/);
  assert.match(server, /truncated screenshot values were intentionally not stored/);
});

test('Operations UI renders Communications integrations without exposing secret fields', () => {
  assert.match(operations, /data-communications-integrations/);
  assert.match(operations, /renderCommunicationsIntegrationPanel/);
  assert.match(operations, /getBufferIntegrationHealth/);
  assert.match(operations, /getResendIntegrationHealth/);
  assert.match(operations, /Confirm schedule/);
  assert.match(operations, /data-action-id="ACTION-BUFFER-SCHEDULE-CONFIRM"/);
  assert.match(operations, /One Time Buffer scheduling requires a future approved social packet/);
  assert.match(operations, /data-one-time-buffer-setup/);
  assert.match(operations, /Provider Buffer draft creation is locked for One Time in this run/);
  assert.match(operations, /create_provider_draft: !currentWorkspaceIsOneTime\(\)/);
  assert.doesNotMatch(operations, /BUFFER_API_KEY/);
  assert.doesNotMatch(operations, /RESEND_API_KEY/);
});

test('One Time Buffer draft and schedule writes stay blocked until future approval packet', () => {
  assert.match(server, /function isOneTimeSocialPostRow\(row = \{\}\)/);
  assert.match(server, /APPROVE_ONE_TIME_BUFFER_DRAFT/);
  assert.match(server, /One Time Buffer draft creation is blocked until a future approved social packet/);
  assert.match(server, /buffer_provider_draft_blocked: true/);
  assert.match(server, /one_time_buffer_draft_blocked/);
  assert.match(server, /APPROVE_ONE_TIME_BUFFER_SCHEDULE/);
  assert.match(server, /One Time Buffer scheduling is not approved in this packet/);

  const action = actionRegistry.actions.find((row) => row.action_id === 'ACTION-BUFFER-SCHEDULE-CONFIRM');
  assert.ok(action, 'ACTION-BUFFER-SCHEDULE-CONFIRM is registered');
  assert.equal(action.status, 'approval_gated');
  assert.equal(action.external_write, true);
  assert.match(action.expected_behavior, /disabled/);
  assert.match(action.expected_behavior, /APPROVE_ONE_TIME_BUFFER_SCHEDULE/);
});

test('Telegram Buffer path is draft-only and /accounts uses readiness-aware API', () => {
  assert.match(bridge, /\/api\/bna\/integrations\/buffer\/health/);
  assert.match(bridge, /Buffer setup blocker/);
  assert.match(bufferOps, /const mode = 'addToQueue'/);
  assert.match(bufferOps, /const saveToDraft = true/);
  assert.match(bufferOps, /publish_blocked_by_policy/);
});

test('.env.example contains blank communications placeholders only', () => {
  assert.match(envExample, /BUFFER_API_KEY=\n/);
  assert.match(envExample, /BUFFER_ORGANIZATION_ID=\n/);
  assert.match(envExample, /RESEND_API_KEY=\n/);
  assert.match(envExample, /RESEND_ACCOUNT_OWNER=unknown/);
  assert.match(envExample, /RESEND_SEND_FALLBACK_APPROVED=false/);
  assert.doesNotMatch(envExample, /re_[A-Za-z0-9]/);
});
