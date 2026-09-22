import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildRabbiTelegramReadiness,
  notifyRabbiCommunication,
} = require('../src/lib/bna/telegram-notifications');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const outputDir = path.join(repoRoot, 'ops', 'live-smokes');

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

function argValue(name, fallback = '') {
  const args = process.argv.slice(2);
  const match = args.find((arg) => arg === name || arg.startsWith(`${name}=`));
  if (!match) return fallback;
  if (match.includes('=')) return match.slice(match.indexOf('=') + 1);
  const index = args.indexOf(match);
  return args[index + 1] || fallback;
}

function hasArg(name) {
  return process.argv.slice(2).some((arg) => arg === name || arg.startsWith(`${name}=`));
}

function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function renderMarkdown(report) {
  return [
    '# Rabbi Telegram Live Smoke',
    '',
    `Checked at: ${report.checked_at}`,
    `Approved by operator: ${report.approved_by_operator}`,
    `Workspace/project: \`${report.workspace_key}\` / \`${report.project_key}\``,
    `Attempted: ${report.attempted}`,
    `Sent: ${report.sent}`,
    `HTTP status: ${report.status || 'n/a'}`,
    `External write performed: ${report.external_write_performed}`,
    `Telegram send performed: ${report.telegram_send_performed}`,
    `Secret values printed: ${report.secret_values_printed}`,
    '',
    '## Readiness',
    '',
    `- Ready before send: ${report.readiness.ready}`,
    `- Status before send: ${report.readiness.status}`,
    `- Token configured: ${report.readiness.config.token_configured}`,
    `- Chat ID configured: ${report.readiness.config.chat_id_configured}`,
    `- Ops credentials configured: ${report.readiness.config.ops_username_configured && report.readiness.config.ops_password_configured}`,
    '',
    '## Result',
    '',
    `- Provider: ${report.provider}`,
    `- Role alias: ${report.role_alias}`,
    `- Message label: ${report.message_label}`,
    `- Blocker: ${report.blocker || 'none'}`,
    `- Error: ${report.error || 'none'}`,
    '',
    '## Guardrails',
    '',
    ...report.guardrails.map((item) => `- ${item}`),
    '',
  ].join('\n');
}

async function main() {
  const approved = hasArg('--approved-live-send') ||
    String(process.env.APPROVE_RABBI_TELEGRAM_LIVE_SMOKE || '').trim() === 'APPROVE_RABBI_TELEGRAM_LIVE_SMOKE';
  if (!approved) {
    throw new Error('Live Telegram smoke requires --approved-live-send or APPROVE_RABBI_TELEGRAM_LIVE_SMOKE=APPROVE_RABBI_TELEGRAM_LIVE_SMOKE.');
  }

  const now = new Date();
  const messageLabel = argValue('--label', `Codex live Telegram smoke ${now.toISOString()}`);
  const env = {
    ...parseEnvFile(envLocalPath),
    ...process.env,
    TELEGRAM_RABBI_COMMUNICATION_ALERTS_ENABLED: 'true',
  };
  const readiness = buildRabbiTelegramReadiness({ env });
  const result = await notifyRabbiCommunication({
    env,
    dryRun: false,
    communication: {
      id: 0,
      channel: 'telegram_live_smoke',
      direction: 'system_to_rabbi',
      subject: messageLabel,
      summary: messageLabel,
      contact_label: 'Codex live smoke',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    },
    context: {
      source: 'codex_live_smoke',
      workspaceKey: 'rabbi_sheller_provider',
      projectKey: 'one_time_mishnah_class',
      reviewPath: '/provider.html?admin_provider=one-time&section=mailbox',
    },
  });

  const report = {
    checked_at: now.toISOString(),
    approved_by_operator: true,
    approval_source: 'codex_chat_2026-07-12_operator_said_telegram_configured_and_can_test',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    provider: 'telegram',
    role_alias: 'one_time_rabbi_operator',
    message_label: messageLabel,
    attempted: result.attempted === true,
    sent: result.sent === true,
    status: result.status || null,
    blocker: result.blocker || result.reason || null,
    error: result.error || null,
    external_write_performed: result.sent === true,
    telegram_send_performed: result.sent === true,
    email_send_performed: false,
    whatsapp_send_performed: false,
    crm_mutation_performed: false,
    payment_access_mutation_performed: false,
    dns_account_mutation_performed: false,
    credential_mutation_performed: false,
    secret_values_printed: false,
    readiness,
    guardrails: [
      'One scoped Telegram message only.',
      'No token, chat ID, phone, email, class link, or private message body is printed.',
      'No email, WhatsApp/WAPI, payment, access, DNS, credential, provider-account, or CRM mutation is performed.',
      'The smoke uses the existing Rabbi / One Time role alias and notification formatter.',
    ],
  };

  fs.mkdirSync(outputDir, { recursive: true });
  const base = path.join(outputDir, `${timestampForFile(now)}-rabbi-telegram-live-smoke`);
  fs.writeFileSync(`${base}.json`, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(`${base}.md`, `${renderMarkdown(report)}\n`);
  console.log(JSON.stringify({
    ok: report.sent,
    attempted: report.attempted,
    sent: report.sent,
    status: report.status,
    blocker: report.blocker,
    report_json: path.relative(repoRoot, `${base}.json`).replaceAll('\\', '/'),
    report_md: path.relative(repoRoot, `${base}.md`).replaceAll('\\', '/'),
    secret_values_printed: false,
  }, null, 2));
  if (!report.sent) process.exit(1);
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
