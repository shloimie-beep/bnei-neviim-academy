#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const secretsDir = path.join(repoRoot, '.secrets');

const SECRET_PATTERNS = [
  /bot\d{6,}:[A-Za-z0-9_-]{12,}/i,
  /\b(?:authorization|cookie|password|secret|token|api[_-]?key)\s*[:=]/i,
  /\b(?:ghp|github_pat|sk|rk|whsec|re)_[A-Za-z0-9_-]{12,}/i,
  /\bbna_(?:ops|provider|student|parent)_session=/i,
  /\bchat_id\s*[:=]\s*-?\d{5,}/i,
];

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

function readSecret(name) {
  const filePath = path.join(secretsDir, name);
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8').trim();
}

export function loadTelegramProgressConfig(env = { ...parseEnvFile(envLocalPath), ...process.env }) {
  return {
    token: readSecret('telegram-bot-token.txt') || env.TELEGRAM_BOT_TOKEN_BNA || env.TELEGRAM_BOT_TOKEN || '',
    chatId: env.TELEGRAM_CHAT_ID_BNA || env.TELEGRAM_CHAT_ID || '',
  };
}

function optionValue(argv, index) {
  const current = argv[index] || '';
  if (current.includes('=')) return current.split('=').slice(1).join('=');
  return argv[index + 1] || '';
}

export function parseProgressArgs(argv = []) {
  const args = {
    fixed: '',
    verified: '',
    blocked: '',
    next: '',
    packet: '',
    task: '',
    dryRun: true,
    send: false,
    json: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--send') {
      args.send = true;
      args.dryRun = false;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
      args.send = false;
    } else if (arg === '--json') {
      args.json = true;
    } else if (arg === '--fixed' || arg.startsWith('--fixed=')) {
      args.fixed = optionValue(argv, index);
      if (!arg.includes('=')) index += 1;
    } else if (arg === '--verified' || arg.startsWith('--verified=')) {
      args.verified = optionValue(argv, index);
      if (!arg.includes('=')) index += 1;
    } else if (arg === '--blocked' || arg.startsWith('--blocked=')) {
      args.blocked = optionValue(argv, index);
      if (!arg.includes('=')) index += 1;
    } else if (arg === '--next' || arg.startsWith('--next=')) {
      args.next = optionValue(argv, index);
      if (!arg.includes('=')) index += 1;
    } else if (arg === '--packet' || arg.startsWith('--packet=')) {
      args.packet = optionValue(argv, index);
      if (!arg.includes('=')) index += 1;
    } else if (arg === '--task' || arg.startsWith('--task=')) {
      args.task = optionValue(argv, index);
      if (!arg.includes('=')) index += 1;
    }
  }
  return args;
}

function compactLine(value, maxLength = 900) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function formatCodexProgressMessage(input = {}) {
  const fixed = compactLine(input.fixed);
  const verified = compactLine(input.verified);
  const blocked = compactLine(input.blocked);
  const next = compactLine(input.next);
  if (!fixed || !verified || !next) {
    throw new Error('Progress update requires --fixed, --verified, and --next.');
  }
  const lines = [
    'Codex update',
    `- Done: ${fixed}`,
    `- Verified: ${verified}`,
  ];
  if (blocked) lines.push(`- Blocked: ${blocked}`);
  lines.push(`- Next: ${next}`);
  const packet = compactLine(input.packet, 220);
  const task = compactLine(input.task, 220);
  if (packet) lines.push(`- Packet: ${packet}`);
  if (task) lines.push(`- Task: ${task}`);
  return lines.join('\n');
}

export function assertSafeTelegramProgressText(text) {
  const value = String(text || '');
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(value)) {
      throw new Error('Refusing to send Telegram progress update because it contains secret-looking or private routing text.');
    }
  }
  if (value.length > 3500) {
    throw new Error('Refusing to send Telegram progress update longer than 3500 characters.');
  }
  return true;
}

export async function sendTelegramProgress(config, text, { fetchImpl = fetch } = {}) {
  if (!config?.token || !config?.chatId) {
    throw new Error('Telegram token/chat target is not configured.');
  }
  assertSafeTelegramProgressText(text);
  const response = await fetchImpl(`https://api.telegram.org/bot${config.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.chatId,
      text,
      disable_web_page_preview: true,
    }),
  });
  const body = await response.json();
  if (!response.ok || body?.ok !== true) {
    throw new Error(`Telegram send failed with status ${response.status}: ${String(body?.description || 'unknown error').slice(0, 240)}`);
  }
  return { ok: true, message_id: body.result?.message_id || null };
}

async function main() {
  const args = parseProgressArgs(process.argv.slice(2));
  const message = formatCodexProgressMessage(args);
  assertSafeTelegramProgressText(message);

  if (args.dryRun) {
    const result = {
      ok: true,
      dry_run: true,
      would_send: false,
      message_chars: message.length,
      message,
    };
    console.log(args.json ? JSON.stringify(result, null, 2) : message);
    return;
  }

  const result = await sendTelegramProgress(loadTelegramProgressConfig(), message);
  const output = {
    ok: true,
    dry_run: false,
    sent: true,
    message_chars: message.length,
    message_id_present: Boolean(result.message_id),
  };
  console.log(args.json ? JSON.stringify(output, null, 2) : 'Telegram progress update sent.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
