const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  buildRabbiTelegramReadiness,
  formatRabbiCommunicationTelegramAlert,
  formatRabbiSupportTicketStatusAlert,
  formatSupportTicketTelegramAlert,
  notifyRabbiCommunication,
  notifyRabbiSupportTicketStatus,
  notifyTelegramRoleAlias,
  loadTelegramNotificationConfig,
  notifySuperAdminSupportTicket,
  rabbiCommunicationAlertsEnabled,
  supportTicketApprovalKeyboard,
  supportTicketAlertsEnabled,
} = require('../src/lib/bna/telegram-notifications');

test('support ticket Telegram alerts are disabled by default outside hosted runtime', () => {
  assert.equal(supportTicketAlertsEnabled({}), false);
  assert.equal(supportTicketAlertsEnabled({ NODE_ENV: 'test' }), false);
  assert.equal(supportTicketAlertsEnabled({ NODE_ENV: 'production' }), true);
  assert.equal(supportTicketAlertsEnabled({ RAILWAY_ENVIRONMENT: 'production' }), true);
  assert.equal(supportTicketAlertsEnabled({ NODE_ENV: 'production', TELEGRAM_SUPPORT_TICKET_ALERTS_ENABLED: 'false' }), false);
  assert.equal(rabbiCommunicationAlertsEnabled({}), false);
  assert.equal(rabbiCommunicationAlertsEnabled({ NODE_ENV: 'production' }), true);
  assert.equal(rabbiCommunicationAlertsEnabled({ NODE_ENV: 'production', TELEGRAM_RABBI_COMMUNICATION_ALERTS_ENABLED: 'false' }), false);
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
  assert.match(text, /Open in Operations/);
  assert.doesNotMatch(text, /super-secret-value/);
  assert.doesNotMatch(text, /hunter2/);
  assert.match(text, /\[redacted-secret\]/);
});

test('support ticket approval keyboard exposes Super Admin actions only as callbacks', () => {
  const keyboard = supportTicketApprovalKeyboard({
    ticket: { id: 42 },
    context: { reviewPath: 'https://bneineviimacademy.org/operations?view=admin&section=tickets' },
  });
  assert.deepEqual(keyboard.inline_keyboard[0].map((button) => button.callback_data), [
    'ticket:approve:42',
    'ticket:ask:42',
  ]);
  assert.deepEqual(keyboard.inline_keyboard[1].map((button) => button.callback_data), [
    'ticket:keep:42',
    'ticket:reject:42',
  ]);
  assert.equal(keyboard.inline_keyboard[2][0].text, 'Open in Operations');
  assert.match(keyboard.inline_keyboard[2][0].url, /operations/);
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
  assert.equal(config.rabbi_communication_alerts_enabled, false);
  assert.equal(config.super_admin.ready, true);
  assert.equal(config.rabbi_elie_scheller.token_configured, true);
  assert.equal(config.rabbi_elie_scheller.chat_id_configured, false);
});

test('Rabbi communication alert text is scoped and metadata-only', () => {
  const text = formatRabbiCommunicationTelegramAlert({
    communication: {
      id: 55,
      channel: 'whatsapp',
      direction: 'inbound',
      subject: 'Question about tonight and token=very-secret-value',
      body: 'This raw private body should never be included in the alert.',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      contact_label: 'Parent portal contact',
    },
    context: { source: 'unit_test' },
  });
  assert.match(text, /One Time communication received/);
  assert.match(text, /Communication: #55/);
  assert.match(text, /rabbi_sheller_provider \/ one_time_mishnah_class/);
  assert.match(text, /Channel: whatsapp/);
  assert.match(text, /Parent portal contact/);
  assert.match(text, /\[redacted-secret\]/);
  assert.doesNotMatch(text, /raw private body/i);
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
  assert.equal(body.reply_markup.inline_keyboard[0][0].text, 'Approve for Codex');
  assert.equal(body.reply_markup.inline_keyboard[0][0].callback_data, 'ticket:approve:8');
});

test('notifyRabbiCommunication blocks wrong scope and missing Rabbi chat id', async () => {
  const wrongScope = await notifyRabbiCommunication({
    dryRun: true,
    secretsDir: null,
    env: {
      TELEGRAM_RABBI_COMMUNICATION_ALERTS_ENABLED: 'true',
      TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: '456:rabbi-token',
      TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER: '777',
    },
    communication: {
      id: 1,
      workspace_key: 'bna',
      project_key: 'bna',
      subject: 'Wrong scope',
    },
  });
  assert.equal(wrongScope.would_send, false);
  assert.equal(wrongScope.blocker, 'not_rabbi_onetime_communication_scope');

  const missingChat = await notifyRabbiCommunication({
    dryRun: true,
    secretsDir: null,
    env: {
      TELEGRAM_RABBI_COMMUNICATION_ALERTS_ENABLED: 'true',
      TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: '456:rabbi-token',
    },
    communication: {
      id: 2,
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      subject: 'One Time message',
    },
  });
  assert.equal(missingChat.would_send, false);
  assert.equal(missingChat.blocker, 'rabbi_telegram_target_not_configured');
});

test('notifyRabbiCommunication sends to Rabbi chat when scoped target is configured', async () => {
  const calls = [];
  const sent = await notifyRabbiCommunication({
    secretsDir: null,
    env: {
      TELEGRAM_RABBI_COMMUNICATION_ALERTS_ENABLED: 'true',
      TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: '456:rabbi-token',
      TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER: '777',
    },
    communication: {
      id: 9,
      channel: 'portal',
      direction: 'inbound',
      subject: 'Parent question',
      contact_label: 'Parent portal contact',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 200, async text() { return 'ok'; } };
    },
  });
  assert.equal(sent.sent, true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /api\.telegram\.org\/bot456:rabbi-token\/sendMessage/);
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.chat_id, '777');
  assert.match(body.text, /One Time communication received/);
  assert.match(body.text, /Parent question/);
});

test('notifyTelegramRoleAlias resolves only the approved Rabbi and platform-support roles', async () => {
  const rabbi = await notifyTelegramRoleAlias({
    roleAlias: 'one_time_rabbi_operator',
    dryRun: true,
    secretsDir: null,
    env: {
      TELEGRAM_RABBI_COMMUNICATION_ALERTS_ENABLED: 'true',
      TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: '456:rabbi-token',
      TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER: '777',
    },
    communication: {
      id: 10,
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      subject: 'Lead question',
    },
  });
  assert.equal(rabbi.would_send, true);
  assert.equal(rabbi.sent, false);

  const support = await notifyTelegramRoleAlias({
    roleAlias: 'platform_support_shloimie',
    dryRun: true,
    secretsDir: null,
    env: {
      TELEGRAM_SUPPORT_TICKET_ALERTS_ENABLED: 'true',
      TELEGRAM_BOT_TOKEN_BNA: '123:test-token',
      TELEGRAM_CHAT_ID_BNA: '999',
    },
    ticket: { id: 11, title: 'Login problem', severity: 'normal', category: 'bot_api' },
  });
  assert.equal(support.would_send, true);
  assert.equal(support.sent, false);

  const unknown = await notifyTelegramRoleAlias({
    roleAlias: 'unapproved_recipient',
    dryRun: true,
    secretsDir: null,
  });
  assert.equal(unknown.would_send, false);
  assert.equal(unknown.blocker, 'unknown_telegram_role_alias');
});

test('server wires Rabbi communication alerts separately from super-admin ticket alerts', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  assert.match(server, /notifySuperAdminSupportTicket/);
  assert.match(server, /notifyRabbiCommunication/);
  assert.match(server, /notifyTelegramRoleAlias/);
  assert.match(server, /roleAlias: 'one_time_rabbi_operator'/);
  assert.match(server, /'platform_support_shloimie'/);
  assert.match(server, /source: 'parent_portal_provider_message'/);
  assert.match(server, /source: 'resend_inbound_email'/);
  assert.match(server, /source: 'one_time_wapi_inbound'/);
  assert.match(server, /reviewPath: '\/provider\.html\?admin_provider=one-time&section=mailbox'/);
  assert.match(server, /reviewPath: '\/operations\?view=communications&workspace=rabbi_sheller_provider&project=one_time_mishnah_class'/);
});

test('notifyRabbiSupportTicketStatus sends concise private ticket updates to Rabbi', async () => {
  const calls = [];
  const sent = await notifyRabbiSupportTicketStatus({
    secretsDir: null,
    env: {
      TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: '456:rabbi-token',
      TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER: '777',
    },
    ticket: {
      id: 15,
      ticket_number: 'OT-SUP-000015',
      title: 'Button not working',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    context: {
      status: 'needs_requester_information',
      question: 'Which button did you press?',
    },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 200, async text() { return 'ok'; } };
    },
  });
  assert.equal(sent.sent, true);
  assert.equal(calls.length, 1);
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.chat_id, '777');
  assert.match(body.text, /OT-SUP-000015/);
  assert.match(body.text, /Which button did you press/);
});

test('Rabbi ticket status formatter redacts secrets', () => {
  const text = formatRabbiSupportTicketStatusAlert({
    ticket: { id: 16, title: 'Access token=hidden-value broke' },
    context: { status: 'rejected', reason: 'password=hunter2 is not a valid report' },
  });
  assert.match(text, /\[redacted-secret\]/);
  assert.doesNotMatch(text, /hunter2/);
  assert.doesNotMatch(text, /hidden-value/);
});

test('Rabbi Telegram live smoke is approval-gated and redacted', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const smoke = fs.readFileSync('scripts/smoke-rabbi-telegram-live.mjs', 'utf8');
  const snapshot = fs.readFileSync('scripts/production-readiness-snapshot.mjs', 'utf8');

  assert.match(pkg.scripts['telegram:rabbi:live-smoke'], /smoke-rabbi-telegram-live\.mjs/);
  assert.match(smoke, /--approved-live-send/);
  assert.match(smoke, /APPROVE_RABBI_TELEGRAM_LIVE_SMOKE/);
  assert.match(smoke, /notifyRabbiCommunication/);
  assert.match(smoke, /role_alias: 'one_time_rabbi_operator'/);
  assert.match(smoke, /secret_values_printed: false/);
  assert.match(smoke, /No token, chat ID, phone, email, class link, or private message body is printed/);
  assert.match(snapshot, /rabbi-telegram-live-smoke\\.json/);
  assert.match(snapshot, /status = 'live_smoke_verified'/);
  assert.match(snapshot, /liveSmoke\?\.secret_values_printed === false/);
});

test('Rabbi Agent Review direct proof is explicit, terminal, and redacted', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const smoke = fs.readFileSync('scripts/smoke-rabbi-agent-review-direct-proof.mjs', 'utf8');

  assert.match(pkg.scripts['app:smoke:rabbi-agent-review-direct-proof'], /smoke-rabbi-agent-review-direct-proof\.mjs/);
  assert.match(smoke, /codex_direct_verification_substituting_for_operator_agent_mode/);
  assert.match(smoke, /No Agent Review database result row is fabricated/);
  assert.match(smoke, /direct_codex_verification: true/);
  assert.match(smoke, /terminal_saved_proof: true/);
  assert.match(smoke, /agent_mode_saved_result: false/);
  assert.match(smoke, /secret_values_printed: false/);
  assert.match(smoke, /rabbi-telegram-live-smoke/);
  assert.match(smoke, /rabbi-one-time-tool-scope-map\.json/);
  assert.match(smoke, /tests\/bna-helper-tools\.test\.js/);
  assert.match(smoke, /tests\/agent-review-hub\.test\.js/);
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
