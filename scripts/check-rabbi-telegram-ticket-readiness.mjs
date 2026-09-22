import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildRabbiTelegramReadiness,
  loadTelegramNotificationConfig,
  notifyRabbiCommunication,
  notifySuperAdminSupportTicket,
  redactTelegramConfig,
} = require('../src/lib/bna/telegram-notifications');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const reportDir = path.join(repoRoot, 'ops', 'watchdog-audits');
const reportPath = path.join(reportDir, '2026-07-08-rabbi-telegram-ticket-readiness.md');
const jsonPath = path.join(reportDir, '2026-07-08-rabbi-telegram-ticket-readiness.json');
const envLocalPath = path.join(repoRoot, '.env.local');
const runtimeEnvPath = process.env.BNA_RUNTIME_ENV_FILE || envLocalPath;
const runtimeSecretsDir = process.env.BNA_RUNTIME_SECRETS_DIR || path.join(repoRoot, '.secrets');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function renderMarkdown(payload) {
  const rabbi = payload.rabbi_telegram;
  const ticket = payload.ticket_alert_dry_run;
  const communication = payload.rabbi_communication_alert_dry_run;
  const lines = [
    '# Rabbi Telegram / Ticket Alert Readiness',
    '',
    `Checked at: ${payload.checked_at}`,
    '',
    '## Summary',
    '',
    `- Rabbi Telegram status: ${rabbi.status}`,
    `- Rabbi Telegram ready: ${rabbi.ready}`,
    `- Super-admin ticket alerts enabled: ${payload.notification_config.ticket_alerts_enabled}`,
    `- Super-admin Telegram target ready: ${payload.notification_config.super_admin.ready}`,
    `- Dry-run would send ticket alert: ${ticket.would_send}`,
    `- Rabbi communication alerts enabled: ${payload.notification_config.rabbi_communication_alerts_enabled}`,
    `- Dry-run would send Rabbi communication alert: ${communication.would_send}`,
    `- External write performed: ${payload.external_write_performed}`,
    '',
    '## Rabbi Telegram Blockers',
    '',
    ...(rabbi.blockers.length ? rabbi.blockers.map((blocker) => `- ${blocker}`) : ['- None']),
    '',
    '## Dry-Run Ticket Alert Preview',
    '',
    '```text',
    ticket.text,
    '```',
    '',
    '## Dry-Run Rabbi Communication Alert Preview',
    '',
    '```text',
    communication.text,
    '```',
    '',
    '## Guardrails',
    '',
    '- No Telegram message was sent by this readiness check.',
    '- No token or chat ID is printed in this report.',
    '- The ticket alert body is intentionally brief and does not include raw private ticket descriptions.',
    '- The Rabbi communication alert body is metadata-only and does not include raw private message bodies.',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const env = { ...parseEnvFile(runtimeEnvPath), ...process.env };
  const config = loadTelegramNotificationConfig({ env, secretsDir: runtimeSecretsDir });
  const rabbiReadiness = buildRabbiTelegramReadiness({ env, secretsDir: runtimeSecretsDir });
  const dryRun = await notifySuperAdminSupportTicket({
    env,
    secretsDir: runtimeSecretsDir,
    dryRun: true,
    ticket: {
      id: 0,
      title: 'Readiness dry-run support ticket',
      severity: 'normal',
      category: 'bot_api',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
      source: 'readiness_check',
    },
    context: {
      source: 'readiness_check',
      workspaceKey: 'rabbi_sheller_provider',
      projectKey: 'one_time_mishnah_class',
      reviewPath: '/operations?view=admin&section=tickets',
    },
  });
  const communicationDryRun = await notifyRabbiCommunication({
    env,
    secretsDir: runtimeSecretsDir,
    dryRun: true,
    communication: {
      id: 0,
      channel: 'whatsapp',
      direction: 'inbound',
      subject: 'Readiness dry-run One Time communication',
      summary: 'Readiness dry-run One Time communication',
      contact_label: 'One Time contact',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    context: {
      source: 'readiness_check',
      workspaceKey: 'rabbi_sheller_provider',
      projectKey: 'one_time_mishnah_class',
      reviewPath: '/provider.html?admin_provider=one-time&section=mailbox',
    },
  });
  const payload = {
    checked_at: new Date().toISOString(),
    external_write_performed: false,
    notification_config: redactTelegramConfig(config),
    rabbi_telegram: rabbiReadiness,
    ticket_alert_dry_run: {
      attempted: dryRun.attempted,
      sent: dryRun.sent,
      would_send: dryRun.would_send,
      blocker: dryRun.blocker || null,
      text: dryRun.text,
      config: dryRun.config,
    },
    rabbi_communication_alert_dry_run: {
      attempted: communicationDryRun.attempted,
      sent: communicationDryRun.sent,
      would_send: communicationDryRun.would_send,
      blocker: communicationDryRun.blocker || null,
      text: communicationDryRun.text,
      config: communicationDryRun.config,
    },
  };

  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(reportPath, renderMarkdown(payload));

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
