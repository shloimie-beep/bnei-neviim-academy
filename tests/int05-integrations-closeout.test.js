const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const test = require('node:test');

const externalActions = require('../src/lib/integrations/external-actions');
const secretCompatibilityModule = require('../src/lib/integrations/secrets');
const bufferCompatibilityModule = require('../src/lib/integrations/buffer');
const resendCompatibilityModule = require('../src/lib/integrations/resend');
const vimeoCompatibilityModule = require('../src/lib/integrations/vimeo');
const stripeIntegration = require('../src/lib/integrations/stripe');
const zoomIntegration = require('../src/lib/integrations/zoom');
const videoHostingIntegration = require('../src/lib/integrations/video-hosting');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

test('INT-05 exposes protected consolidated readiness and provider preview endpoints', () => {
  [
    "app.get('/api/bna/integrations/status', requireAdmin",
    "app.get('/api/bna/integrations/telegram/status', requireAdmin",
    "app.get('/api/bna/integrations/stripe/status', requireAdmin",
    "app.post('/api/bna/integrations/stripe/checkout-preview', requireAdmin",
    "app.post('/api/bna/integrations/stripe/checkout-create', requireAdmin",
    "app.get('/api/bna/integrations/zoom/status', requireAdmin",
    "app.post('/api/bna/integrations/zoom/meeting-preview', requireAdmin",
    "app.post('/api/bna/integrations/zoom/meetings', requireAdmin",
    "app.get('/api/bna/integrations/video-hosting/status', requireAdmin",
    "app.post('/api/bna/video-library/drafts', requireAdmin",
    "app.post('/api/bna/video-library/:id/upload', requireAdmin",
    "app.get('/api/bna/integrations/buffer/status', requireAdmin",
    "app.post('/api/bna/integrations/buffer/drafts', requireAdmin",
    "app.post('/api/bna/integrations/buffer/schedules', requireAdmin",
    "app.get('/api/bna/integrations/resend/status', requireAdmin",
    "app.post('/api/bna/integrations/resend/email-preview', requireAdmin",
    "app.post('/api/bna/integrations/resend/send', requireAdmin",
  ].forEach((snippet) => assert.ok(server.includes(snippet), snippet));
});

test('payment reminder scheduler and cron live sends require explicit opt-in approval', () => {
  assert.match(server, /PAYMENT_REMINDER_SCHEDULER \|\| 'disabled'/);
  assert.match(server, /PAYMENT_REMINDER_SCHEDULER_CONFIRM/);
  assert.match(server, /ENABLE_SCHEDULED_PAYMENT_REMINDERS/);
  assert.match(server, /runPaymentReminderSweep\(\{ dryRun: false \}\)/);
  assert.match(server, /Cron live payment reminders require CRON_SECRET plus explicit scheduler live opt-in and confirmation/);
});

test('external action audit table and approval helper block missing confirmations', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_external_action_audit/);
  assert.match(server, /recordExternalActionAudit/);
  [
    ['buffer', 'schedule', 'SCHEDULE BUFFER POST'],
    ['buffer', 'publish', 'APPROVE_BUFFER_PUBLISH'],
    ['resend', 'send', 'SEND_RESEND_EMAIL'],
    ['gmail', 'payment_reminder_sweep', 'SEND_REMINDERS'],
    ['gmail', 'scheduled_payment_reminder_sweep', 'ENABLE_SCHEDULED_PAYMENT_REMINDERS'],
    ['stripe', 'checkout_create', 'CREATE_STRIPE_CHECKOUT'],
    ['stripe', 'live_billing', 'APPROVE_STRIPE_LIVE_BILLING'],
    ['zoom', 'meeting_create', 'CREATE_ZOOM_MEETING'],
    ['vimeo', 'upload', 'UPLOAD_VIDEO'],
    ['video_hosting', 'upload', 'UPLOAD_VIDEO'],
    ['google', 'write', 'APPROVE_GOOGLE_WRITE'],
    ['ghl', 'publish', 'APPROVE_GHL_PUBLISH'],
  ].forEach(([provider, action, phrase]) => {
    assert.throws(
      () => externalActions.requireExternalApproval({
        provider,
        action,
        confirm: '',
        previewOnly: false,
      }),
      /requires exact confirmation phrase/,
      `${provider}:${action} should block without confirmation`
    );
    const approved = externalActions.requireExternalApproval({
      provider,
      action,
      confirm: phrase,
      previewOnly: false,
    });
    assert.equal(approved.approved, true, `${provider}:${action} should approve with exact phrase`);
  });
});

test('compatibility integration module paths exist for named INT-05 wrappers', () => {
  assert.equal(typeof secretCompatibilityModule.getSecret, 'function');
  assert.equal(typeof bufferCompatibilityModule.testBufferConnection, 'function');
  assert.equal(typeof resendCompatibilityModule.getResendReadiness, 'function');
  assert.equal(typeof vimeoCompatibilityModule.getVideoHostingReadiness, 'function');
});

test('provider readiness modules do not expose secret values', () => {
  const stripe = stripeIntegration.getStripeReadiness({
    config: {
      configured: true,
      secretKey: 'sk_live_abcdefghijklmnopqrstuvwxyz',
      mode: 'live',
      accountOwner: 'unknown',
      providerAccount: 'Rabbi account',
    },
  });
  const zoom = zoomIntegration.getZoomReadiness({
    config: {
      accountId: 'acct',
      clientId: 'client',
      clientSecret: 'zoom-client-secret',
      accountOwner: 'unknown',
      hostUser: 'me',
      configuredScopes: [],
    },
  });
  const video = videoHostingIntegration.getVideoHostingReadiness({
    config: {
      vimeoToken: 'vimeo-secret-token',
      providerDecision: 'vimeo',
      accountOwner: 'unknown',
      vimeoPlan: '',
    },
  });
  const combined = JSON.stringify({ stripe, zoom, video });
  assert.doesNotMatch(combined, /sk_live_/);
  assert.doesNotMatch(combined, /zoom-client-secret/);
  assert.doesNotMatch(combined, /vimeo-secret-token/);
  assert.match(combined, /configured_live_mode/);
  assert.match(combined, /configured_but_insufficient_scope/);
});

test('Operations integrations readiness UI is present and secret-field free', () => {
  assert.match(operations, /getIntegrationStatus\(\)/);
  assert.match(operations, /data-integrations-readiness/);
  assert.match(operations, /Integration Readiness/);
  assert.match(operations, /Preview-first by policy/);
  assert.doesNotMatch(operations, /STRIPE_SECRET_KEY/);
  assert.doesNotMatch(operations, /ZOOM_CLIENT_SECRET/);
  assert.doesNotMatch(operations, /VIMEO_ACCESS_TOKEN/);
});

test('tracked secret audit blocks real .env and .secrets paths while allowing docs/tests', () => {
  const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
  assert.equal(tracked.some((file) => /^\.secrets(\/|$)/i.test(file)), false);
  assert.equal(tracked.some((file) => /^\.env($|\.|\/)/i.test(file) && file !== '.env.example'), false);
  assert.match(fs.readFileSync('scripts/audit-secrets.mjs', 'utf8'), /Tracked secret-risk paths found/);
});
