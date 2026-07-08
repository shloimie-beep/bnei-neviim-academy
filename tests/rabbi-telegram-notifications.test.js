const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildRabbiTelegramReadiness,
  formatSupportTicketTelegramAlert,
  loadTelegramNotificationConfig,
  notifySuperAdminSupportTicket,
  supportTicketAlertsEnabled,
} = require('../src/lib/bna/telegram-notifications');

test('support ticket Telegram alerts are disabled by default outside hosted runtime', () => {
  assert.equal(supportTicketAlertsEnabled({}), false);
  assert.equal(supportTicketAlertsEnabled({ NODE_ENV: 'test' }), false);
  assert.equal(supportTicketAlertsEnabled({ NODE_ENV: 'production' }), true);
  assert.equal(supportTicketAlertsEnabled({ RAILWAY_ENVIRONMENT: 'production' }), true);
  assert.equal(supportTicketAlertsEnabled({ NODE_ENV: 'production', TELEGRAM_SUPPORT_TICKET_ALERTS_ENABLED: 'false' }), false);
});

test('support ticket alert text is brief and redacts secret-looking values', () => {
  const text = formatSupportTicketTelegramAlert({
    ticket: {
      id: 42,
      title: 'Button broke with token=super-secret-value and password=hunter2',
      severity: 'high',
      category: 'bot_api',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    context: { source: 'unit_test' },
  });
  assert.match(text, /Support ticket opened/);
  assert.match(text, /Ticket: #42/);
  assert.match(text, /rabbi_sheller_provider \/ one_time_mishnah_class/);
  assert.doesNotMatch(text, /super-secret-value/);
  assert.doesNotMatch(text, /hunter2/);
  assert.match(text, /\[redacted-secret\]/);
});

test('notification config reports ready target without exposing token or chat id', () => {
  const config = loadTelegramNotificationConfig({
    secretsDir: null,
    env: {
      TELEGRAM_SUPPORT_TICKET_ALERTS_ENABLED: 'true',
      TELEGRAM_BOT_TOKEN_BNA: '123:test-token',
      TELEGRAM_CHAT_ID_BNA: '999',
      TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: '456:rabbi-token',
    },
  });
  assert.equal(config.ticket_alerts_enabled, true);
  assert.equal(config.super_admin.ready, true);
  assert.equal(config.rabbi_elie_scheller.token_configured, true);
  assert.equal(config.rabbi_elie_scheller.chat_id_configured, false);
});

test('notifySuperAdminSupportTicket supports dry-run and mocked send', async () => {
  const env = {
    TELEGRAM_SUPPORT_TICKET_ALERTS_ENABLED: 'true',
    TELEGRAM_BOT_TOKEN_BNA: '123:test-token',
    TELEGRAM_CHAT_ID_BNA: '999',
  };
  const dryRun = await notifySuperAdminSupportTicket({
    dryRun: true,
    secretsDir: null,
    env,
    ticket: { id: 7, title: 'Dry run', severity: 'normal', category: 'other' },
  });
  assert.equal(dryRun.would_send, true);
  assert.equal(dryRun.sent, false);

  const calls = [];
  const sent = await notifySuperAdminSupportTicket({
    secretsDir: null,
    env,
    ticket: { id: 8, title: 'Send mock', severity: 'normal', category: 'other' },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 200, async text() { return 'ok'; } };
    },
  });
  assert.equal(sent.sent, true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /api\.telegram\.org\/bot123:test-token\/sendMessage/);
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.chat_id, '999');
  assert.match(body.text, /Support ticket opened/);
});

test('Rabbi readiness stays blocked when chat id and ops credentials are missing', () => {
  const readiness = buildRabbiTelegramReadiness({
    secretsDir: null,
    env: {
      TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: '456:rabbi-token',
    },
  });
  assert.equal(readiness.ready, false);
  assert.equal(readiness.status, 'blocked_missing_runtime_config');
  assert.ok(readiness.blockers.some((blocker) => blocker.includes('TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER')));
  assert.ok(readiness.blockers.some((blocker) => blocker.includes('ONE_TIME_OPS_USERNAME')));
  assert.equal(readiness.config.token_configured, true);
  assert.equal(readiness.config.chat_id_configured, false);
});
