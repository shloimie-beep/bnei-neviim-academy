import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  loadTelegramNotificationConfig,
} = require('../src/lib/bna/telegram-notifications');
const {
  extractTelegramChatCandidates,
  redactChatIdCandidates,
  summarizeChatIdReadback,
} = require('../src/lib/bna/telegram-chat-id-readback');

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const runtimeDir = path.join(repoRoot, '.runtime');
const runtimeReportPath = path.join(runtimeDir, 'rabbi-telegram-chat-id-candidates.json');

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

function hasFlag(name) {
  return process.argv.slice(2).includes(name);
}

async function telegramRequest(token, method, body = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Telegram ${method} returned non-JSON status ${response.status}.`);
  }
  if (!response.ok || !payload.ok) {
    const description = String(payload.description || text || '').slice(0, 220);
    throw new Error(`Telegram ${method} failed with status ${response.status}: ${description}`);
  }
  return payload.result;
}

async function main() {
  const includeTextPreview = hasFlag('--include-text-preview');
  const env = { ...parseEnvFile(envLocalPath), ...process.env };
  const config = loadTelegramNotificationConfig({ env });
  const token = config.rabbi_elie_scheller?.token || '';
  if (!token) {
    throw new Error('Rabbi bot token is not configured. Set TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER or the ignored Rabbi token file.');
  }

  const bot = await telegramRequest(token, 'getMe');
  const updates = await telegramRequest(token, 'getUpdates', {
    limit: 20,
    timeout: 0,
    allowed_updates: ['message', 'edited_message', 'channel_post', 'callback_query'],
  });
  const candidates = extractTelegramChatCandidates(updates, { includeTextPreview });
  const summary = summarizeChatIdReadback(candidates);
  const checkedAt = new Date().toISOString();

  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.writeFileSync(runtimeReportPath, `${JSON.stringify({
    checked_at: checkedAt,
    external_write_performed: false,
    bot: {
      id: bot?.id || null,
      username: bot?.username || '',
      first_name: bot?.first_name || '',
    },
    ...summary,
    candidates,
    next_action: candidates.length
      ? 'Verify the intended Rabbi account/group, then set TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER from the selected candidate in ignored/hosted runtime config.'
      : 'Ask the intended Rabbi account/group to send /start or any message to t.me/onetimeaios_bot, then rerun this command.',
  }, null, 2)}\n`);

  console.log(JSON.stringify({
    checked_at: checkedAt,
    external_write_performed: false,
    bot: {
      id: bot?.id || null,
      username: bot?.username || '',
      first_name: bot?.first_name || '',
    },
    ...summary,
    candidates: redactChatIdCandidates(candidates),
    full_chat_id_report: path.relative(repoRoot, runtimeReportPath).replace(/\\/g, '/'),
    guardrails: [
      'No Telegram message was sent.',
      'No token was printed.',
      'Console output masks chat IDs; full candidate IDs are written only to the ignored runtime report.',
    ],
    next_action: candidates.length
      ? 'Verify the intended Rabbi account/group in the ignored runtime report before setting TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER.'
      : 'Ask the intended Rabbi account/group to send /start or any message to t.me/onetimeaios_bot, then rerun this command.',
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
