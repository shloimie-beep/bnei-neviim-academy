const fs = require('fs');
const path = require('path');
const { previewMessage, redactText, redactValue } = require('./helper/redaction');

const repoRoot = path.resolve(__dirname, '../../..');
const defaultSecretsDir = path.join(repoRoot, '.secrets');

function truthy(value) {
  return ['1', 'true', 'yes', 'on', 'enabled'].includes(String(value || '').trim().toLowerCase());
}

function explicitlyFalse(value) {
  return ['0', 'false', 'no', 'off', 'disabled'].includes(String(value || '').trim().toLowerCase());
}

function readSecretFile(fileName, { secretsDir = defaultSecretsDir } = {}) {
  if (!secretsDir || !fileName) return '';
  const absolutePath = path.join(secretsDir, fileName);
  try {
    const value = fs.readFileSync(absolutePath, 'utf8').trim();
    return value || '';
  } catch {
    return '';
  }
}

function firstConfigured(values = []) {
  for (const value of values) {
    const text = String(value || '').trim();
    if (text) return text;
  }
  return '';
}

function supportTicketAlertsEnabled(env = process.env) {
  const configured = env.TELEGRAM_SUPPORT_TICKET_ALERTS_ENABLED || env.SUPPORT_TICKET_TELEGRAM_ALERTS_ENABLED;
  if (explicitlyFalse(configured)) return false;
  if (truthy(configured)) return true;
  return String(env.NODE_ENV || '').toLowerCase() === 'production' || Boolean(env.RAILWAY_ENVIRONMENT || env.RAILWAY_SERVICE_ID);
}

function loadTelegramNotificationConfig({ env = process.env, secretsDir = defaultSecretsDir } = {}) {
  const superAdminToken = firstConfigured([
    env.TELEGRAM_BOT_TOKEN_BNA,
    env.TELEGRAM_BOT_TOKEN_SHLOIMIE,
    env.TELEGRAM_BOT_TOKEN,
    readSecretFile('telegram-bot-token.txt', { secretsDir }),
  ]);
  const superAdminChatId = firstConfigured([
    env.TELEGRAM_CHAT_ID_SUPER_ADMIN,
    env.TELEGRAM_CHAT_ID_SHLOIMIE,
    env.TELEGRAM_CHAT_ID_BNA,
    env.TELEGRAM_CHAT_ID,
  ]);
  const rabbiToken = firstConfigured([
    env.TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER,
    env.TELEGRAM_RABBI_ELIE_SCHELLER_BOT_TOKEN,
    env.RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN,
    env.ONE_TIME_TELEGRAM_BOT_TOKEN,
    readSecretFile('telegram-rabbi-elie-scheller-bot-token.txt', { secretsDir }),
  ]);
  const rabbiChatId = firstConfigured([
    env.TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER,
    env.RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID,
    env.ONE_TIME_TELEGRAM_CHAT_ID,
  ]);
  const oneTimeOpsUsername = firstConfigured([
    env.ONE_TIME_OPS_USERNAME,
    env.RABBI_ELIE_SCHELLER_OPS_USERNAME,
  ]);
  const oneTimeOpsPassword = firstConfigured([
    env.ONE_TIME_OPS_PASSWORD,
    env.RABBI_ELIE_SCHELLER_OPS_PASSWORD,
  ]);

  return {
    ticket_alerts_enabled: supportTicketAlertsEnabled(env),
    super_admin: {
      token_configured: Boolean(superAdminToken),
      chat_id_configured: Boolean(superAdminChatId),
      ready: Boolean(superAdminToken && superAdminChatId),
      token: superAdminToken,
      chat_id: superAdminChatId,
    },
    rabbi_elie_scheller: {
      profile: 'rabbi-elie-scheller',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      token_configured: Boolean(rabbiToken),
      chat_id_configured: Boolean(rabbiChatId),
      ops_username_configured: Boolean(oneTimeOpsUsername),
      ops_password_configured: Boolean(oneTimeOpsPassword),
      ready: Boolean(rabbiToken && rabbiChatId && oneTimeOpsUsername && oneTimeOpsPassword),
      token: rabbiToken,
      chat_id: rabbiChatId,
    },
  };
}

function redactTelegramConfig(config = {}) {
  return {
    ticket_alerts_enabled: Boolean(config.ticket_alerts_enabled),
    super_admin: {
      token_configured: Boolean(config.super_admin?.token_configured),
      chat_id_configured: Boolean(config.super_admin?.chat_id_configured),
      ready: Boolean(config.super_admin?.ready),
    },
    rabbi_elie_scheller: {
      profile: config.rabbi_elie_scheller?.profile || 'rabbi-elie-scheller',
      workspace_key: config.rabbi_elie_scheller?.workspace_key || 'rabbi_sheller_provider',
      project_key: config.rabbi_elie_scheller?.project_key || 'one_time_mishnah_class',
      token_configured: Boolean(config.rabbi_elie_scheller?.token_configured),
      chat_id_configured: Boolean(config.rabbi_elie_scheller?.chat_id_configured),
      ops_username_configured: Boolean(config.rabbi_elie_scheller?.ops_username_configured),
      ops_password_configured: Boolean(config.rabbi_elie_scheller?.ops_password_configured),
      ready: Boolean(config.rabbi_elie_scheller?.ready),
    },
  };
}

function workspaceKeyForTicket(ticket = {}, context = {}) {
  const workspace = ticket.workspace_key || ticket.workspaceKey || context.workspace_key || context.workspaceKey;
  if (workspace) return String(workspace).trim();
  const project = ticket.project_key || ticket.projectKey || context.project_key || context.projectKey;
  if (['one_time_mishnah_class', 'rabbi_sheller_provider'].includes(String(project || '').trim())) return 'rabbi_sheller_provider';
  return 'bna';
}

function projectKeyForTicket(ticket = {}, context = {}) {
  return String(
    ticket.project_key ||
    ticket.projectKey ||
    context.project_key ||
    context.projectKey ||
    ''
  ).trim() || 'unknown_project';
}

function compactLine(value, fallback, maxLength = 220) {
  const text = previewMessage(redactText(String(value || '').replace(/\s+/g, ' ').trim()), maxLength);
  return text || fallback;
}

function formatSupportTicketTelegramAlert({ ticket = {}, context = {} } = {}) {
  const ticketLabel = ticket.ticket_number || ticket.ticketNumber || (ticket.id ? `#${ticket.id}` : 'new ticket');
  const severity = compactLine(ticket.severity || context.severity, 'normal', 80);
  const category = compactLine(ticket.category || context.category, 'other', 100);
  const title = compactLine(ticket.title || context.title, 'Support ticket opened', 180);
  const workspaceKey = workspaceKeyForTicket(ticket, context);
  const projectKey = projectKeyForTicket(ticket, context);
  const source = compactLine(context.source || ticket.source || ticket.created_by || 'support_ticket', 'support_ticket', 120);
  const reviewPath = context.review_path || context.reviewPath || '/operations?view=admin&section=tickets';

  return [
    'Support ticket opened',
    `- Ticket: ${ticketLabel}`,
    `- Scope: ${workspaceKey} / ${projectKey}`,
    `- Severity: ${severity}`,
    `- Category: ${category}`,
    `- Title: ${title}`,
    `- Source: ${source}`,
    `- Review: ${reviewPath}`,
  ].join('\n');
}

async function sendTelegramMessage({ token, chatId, text, fetchImpl = global.fetch } = {}) {
  if (!token || !chatId || !String(text || '').trim()) {
    return { sent: false, skipped: true, reason: 'telegram_target_or_text_missing' };
  }
  if (typeof fetchImpl !== 'function') {
    return { sent: false, skipped: true, reason: 'fetch_unavailable' };
  }
  const response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: String(text).slice(0, 3900),
      disable_web_page_preview: true,
    }),
  });
  if (!response.ok) {
    return {
      sent: false,
      skipped: false,
      status: response.status,
      error: previewMessage(await response.text().catch(() => ''), 240),
    };
  }
  return { sent: true, skipped: false, status: response.status };
}

async function notifySuperAdminSupportTicket({
  ticket = {},
  context = {},
  env = process.env,
  secretsDir = defaultSecretsDir,
  fetchImpl = global.fetch,
  dryRun = false,
} = {}) {
  const config = loadTelegramNotificationConfig({ env, secretsDir });
  const text = formatSupportTicketTelegramAlert({ ticket, context });
  const target = config.super_admin || {};
  if (!config.ticket_alerts_enabled) {
    return {
      attempted: false,
      sent: false,
      would_send: false,
      blocker: 'support_ticket_telegram_alerts_disabled',
      text,
      config: redactTelegramConfig(config),
    };
  }
  if (!target.ready) {
    return {
      attempted: false,
      sent: false,
      would_send: false,
      blocker: 'super_admin_telegram_target_not_configured',
      text,
      config: redactTelegramConfig(config),
    };
  }
  if (dryRun) {
    return {
      attempted: false,
      sent: false,
      would_send: true,
      text,
      config: redactTelegramConfig(config),
    };
  }
  const sendResult = await sendTelegramMessage({
    token: target.token,
    chatId: target.chat_id,
    text,
    fetchImpl,
  });
  return {
    attempted: true,
    text,
    config: redactTelegramConfig(config),
    ...sendResult,
  };
}

function buildRabbiTelegramReadiness({ env = process.env, secretsDir = defaultSecretsDir } = {}) {
  const config = loadTelegramNotificationConfig({ env, secretsDir });
  const blockers = [];
  if (!config.rabbi_elie_scheller.token_configured) blockers.push('TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER is not configured.');
  if (!config.rabbi_elie_scheller.chat_id_configured) blockers.push('TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER is not configured.');
  if (!config.rabbi_elie_scheller.ops_username_configured) blockers.push('ONE_TIME_OPS_USERNAME or RABBI_ELIE_SCHELLER_OPS_USERNAME is not configured.');
  if (!config.rabbi_elie_scheller.ops_password_configured) blockers.push('ONE_TIME_OPS_PASSWORD or RABBI_ELIE_SCHELLER_OPS_PASSWORD is not configured.');
  return {
    ready: config.rabbi_elie_scheller.ready,
    status: config.rabbi_elie_scheller.ready ? 'ready' : 'blocked_missing_runtime_config',
    blockers,
    expected_profile: 'rabbi-elie-scheller',
    expected_command: 'npm run telegram:rabbi',
    expected_workspace_key: 'rabbi_sheller_provider',
    expected_project_key: 'one_time_mishnah_class',
    config: redactTelegramConfig(config).rabbi_elie_scheller,
  };
}

module.exports = {
  buildRabbiTelegramReadiness,
  compactLine,
  formatSupportTicketTelegramAlert,
  loadTelegramNotificationConfig,
  notifySuperAdminSupportTicket,
  redactTelegramConfig,
  sendTelegramMessage,
  supportTicketAlertsEnabled,
};
