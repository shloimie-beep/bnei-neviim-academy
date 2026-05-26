import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeDir = path.join(repoRoot, '.runtime');
const logFile = path.join(runtimeDir, 'telegram-kimi-bridge.log');
const envLocalPath = path.join(repoRoot, '.env.local');
const academyTokenFile = path.join(repoRoot, '.secrets', 'telegram-bot-token.txt');
const lockFile = path.join(runtimeDir, 'telegram-kimi-bridge.lock');

fs.mkdirSync(runtimeDir, { recursive: true });

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  fs.appendFileSync(logFile, `${stamped}\n`);
}

function acquireLock() {
  try {
    const existingPid = fs.existsSync(lockFile)
      ? Number(JSON.parse(fs.readFileSync(lockFile, 'utf8')).pid || 0)
      : 0;

    if (existingPid) {
      try {
        process.kill(existingPid, 0);
        throw new Error(`Bridge already running with PID ${existingPid}`);
      } catch (error) {
        if (error && error.code !== 'ESRCH') {
          throw error;
        }
      }
    }

    fs.writeFileSync(lockFile, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }, null, 2));
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

function releaseLock() {
  try {
    if (!fs.existsSync(lockFile)) return;
    const parsed = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
    if (Number(parsed.pid) === process.pid) {
      fs.unlinkSync(lockFile);
    }
  } catch {}
}

function parseEnvFile(content) {
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function loadConfig() {
  const fromFile = fs.existsSync(envLocalPath)
    ? parseEnvFile(fs.readFileSync(envLocalPath, 'utf8'))
    : {};

  const academyToken = fs.existsSync(academyTokenFile)
    ? fs.readFileSync(academyTokenFile, 'utf8').trim()
    : '';

  const env = { ...fromFile, ...process.env };
  const botToken =
    env.TELEGRAM_BOT_TOKEN ||
    academyToken ||
    env.TELEGRAM_BOT_TOKEN_SHLOIMIE ||
    env.TELEGRAM_BOT_TOKEN_AHUVA ||
    '';
  const allowedChatIds = [
    env.TELEGRAM_CHAT_ID,
    env.TELEGRAM_CHAT_ID_SHLOIMIE,
    env.TELEGRAM_CHAT_ID_AHUVA,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim());

  return {
    botToken,
    allowedChatIds,
    kimiModel: env.KIMI_CLI_MODEL || 'bna-kimi',
    kimiTimeoutMs: Number(env.KIMI_BRIDGE_TIMEOUT_MS || 240000),
  };
}

function loadOffset() {
  const offsetFile = currentOffsetFilePath();
  try {
    const parsed = JSON.parse(fs.readFileSync(offsetFile, 'utf8'));
    return Number(parsed.offset || 0);
  } catch {
    return 0;
  }
}

function saveOffset(offset) {
  const offsetFile = currentOffsetFilePath();
  fs.writeFileSync(offsetFile, JSON.stringify({ offset }, null, 2));
}

let activeTokenFingerprint = 'default';

function currentOffsetFilePath() {
  return path.join(runtimeDir, `telegram-kimi-offset-${activeTokenFingerprint}.json`);
}

function todayMemoryPath() {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(repoRoot, 'memory', `${date}.md`);
}

function appendMemoryEntry(role, text, metadata = {}) {
  const memoryPath = todayMemoryPath();
  const timestamp = new Date().toISOString();
  const lines = [
    '',
    `### ${role} ${timestamp}`,
    '',
    ...Object.entries(metadata).map(([key, value]) => `- ${key}: ${value}`),
    metadata && Object.keys(metadata).length > 0 ? '' : null,
    text.trim(),
    '',
  ].filter(Boolean);

  fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
  fs.appendFileSync(memoryPath, `${lines.join('\n')}\n`);
}

function buildKimiPrompt(messageText, chatId, messageId) {
  const date = new Date().toISOString();
  return [
    'You are the active BNA repo assistant receiving a Telegram message from the operator.',
    'Work inside this repository and continue the existing local Kimi session if possible.',
    'Before replying, read the latest shared brain files as needed:',
    '- AGENTS.md',
    '- MEMORY.md',
    '- TASKS.md',
    '- the newest file in tasks-pending/',
    `- ${path.relative(repoRoot, todayMemoryPath()).replace(/\\/g, '/')}`,
    '',
    'Operator message metadata:',
    `- chat_id: ${chatId}`,
    `- message_id: ${messageId}`,
    `- received_at: ${date}`,
    '',
    'Instructions:',
    '- Treat the message as coming from the repo owner in Telegram.',
    '- If it contains durable info, refine TASKS.md or the newest pending brief when appropriate.',
    '- Keep edits tight and practical; do not create junk memory.',
    '- Return a concise Telegram-ready reply in plain text.',
    '- Use ASCII characters only in the final reply. Do not use emoji, arrows, curly quotes, or em dashes.',
    '- If you changed files, briefly say what you updated.',
    '',
    'Operator message:',
    messageText.trim(),
  ].join('\n');
}

function runKimi(prompt, model, timeoutMs) {
  const args = [
    '--print',
    '--final-message-only',
    '--work-dir',
    repoRoot,
    '--model',
    model,
    '--max-steps-per-turn',
    '12',
    '--prompt',
    prompt,
  ];

  const primaryArgs = ['--continue', ...args];

  const invoke = (kimiArgs) =>
    new Promise((resolve, reject) => {
      const child = spawn('kimi', kimiArgs, {
        cwd: repoRoot,
        shell: false,
        env: {
          ...process.env,
          PYTHONUTF8: '1',
          PYTHONIOENCODING: 'utf-8',
          LANG: 'C.UTF-8',
        },
      });

      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`Kimi timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout.trim());
          return;
        }
        reject(new Error((stderr || stdout || `exit ${code}`).trim()));
      });
    });

  return invoke(primaryArgs).catch(() => invoke(args));
}

async function telegramRequest(botToken, method, payload = null, signal) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: payload ? 'POST' : 'GET',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
    signal,
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(data)}`);
  }
  return data.result;
}

function splitTelegramText(text, maxLength = 3500) {
  if (text.length <= maxLength) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > maxLength) {
    let sliceAt = remaining.lastIndexOf('\n', maxLength);
    if (sliceAt < Math.floor(maxLength * 0.6)) {
      sliceAt = remaining.lastIndexOf(' ', maxLength);
    }
    if (sliceAt < 1) sliceAt = maxLength;
    chunks.push(remaining.slice(0, sliceAt).trim());
    remaining = remaining.slice(sliceAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function sendReply(botToken, chatId, text, replyToMessageId) {
  const chunks = splitTelegramText(text);
  for (let i = 0; i < chunks.length; i += 1) {
    await telegramRequest(botToken, 'sendMessage', {
      chat_id: chatId,
      text: chunks[i],
      reply_to_message_id: i === 0 ? replyToMessageId : undefined,
    });
  }
}

async function handleTextMessage(config, msg) {
  const chatId = String(msg.chat.id);
  const text = msg.text?.trim() || '';
  const messageId = msg.message_id;

  if (!text) return;

  if (config.allowedChatIds.length > 0 && !config.allowedChatIds.includes(chatId)) {
    await sendReply(config.botToken, chatId, 'This bot is private.', messageId);
    return;
  }

  if (text === '/start') {
    await sendReply(
      config.botToken,
      chatId,
      'BNA Telegram -> Kimi bridge is live.\nSend me a task, ramble, or question and I will run it through the local Kimi 2.6 repo brain.',
      messageId,
    );
    return;
  }

  if (text === '/status') {
    await sendReply(
      config.botToken,
      chatId,
      'Bridge status: online\nModel: kimi-k2.6 via local Kimi CLI\nWorkspace: BNA v2.0',
      messageId,
    );
    return;
  }

  await telegramRequest(config.botToken, 'sendChatAction', {
    chat_id: chatId,
    action: 'typing',
  });

  appendMemoryEntry('Telegram Operator', text, {
    chat_id: chatId,
    message_id: messageId,
  });

  const prompt = buildKimiPrompt(text, chatId, messageId);
  const reply = await runKimi(prompt, config.kimiModel, config.kimiTimeoutMs);

  appendMemoryEntry('Kimi Reply', reply, {
    chat_id: chatId,
    reply_to_message_id: messageId,
  });

  await sendReply(config.botToken, chatId, reply, messageId);
}

async function ensurePollingMode(botToken) {
  try {
    const info = await telegramRequest(botToken, 'getWebhookInfo');
    if (info?.url) {
      log(`Deleting existing webhook so local polling can take over: ${info.url}`);
      await telegramRequest(botToken, 'deleteWebhook', {
        drop_pending_updates: false,
      });
    }
  } catch (error) {
    log(`Webhook check failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  acquireLock();
  process.on('exit', releaseLock);
  process.on('SIGINT', () => {
    releaseLock();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    releaseLock();
    process.exit(0);
  });

  const config = loadConfig();
  if (!config.botToken) {
    throw new Error('No Telegram bot token found. Set TELEGRAM_BOT_TOKEN or add .secrets/telegram-bot-token.txt.');
  }
  activeTokenFingerprint = config.botToken.slice(0, 10).replace(/[^a-zA-Z0-9_-]/g, '_');

  await ensurePollingMode(config.botToken);

  let offset = loadOffset();
  let busy = false;
  log(`Bridge starting. Model=${config.kimiModel} AllowedChats=${config.allowedChatIds.join(',') || 'all'}`);

  while (true) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);
      const updates = await telegramRequest(
        config.botToken,
        'getUpdates',
        {
          offset,
          timeout: 30,
          allowed_updates: ['message'],
        },
        controller.signal,
      );
      clearTimeout(timeout);

      for (const update of updates) {
        offset = update.update_id + 1;
        saveOffset(offset);

        const msg = update.message;
        if (!msg) continue;

        if (busy) {
          await sendReply(
            config.botToken,
            String(msg.chat.id),
            'Still working on your last message. Send the next one in a moment.',
            msg.message_id,
          );
          continue;
        }

        busy = true;
        try {
          if (msg.text) {
            await handleTextMessage(config, msg);
          } else {
            await sendReply(
              config.botToken,
              String(msg.chat.id),
              'Text messages are live. Voice/photo intake is not wired yet in this bridge.',
              msg.message_id,
            );
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          log(`Message handling failed: ${message}`);
          try {
            await sendReply(
              config.botToken,
              String(msg.chat.id),
              `Bridge error: ${message.slice(0, 700)}`,
              msg.message_id,
            );
          } catch (sendError) {
            log(`Failed to send error reply: ${sendError instanceof Error ? sendError.message : String(sendError)}`);
          }
        } finally {
          busy = false;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`Polling loop error: ${message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

main().catch((error) => {
  log(`Fatal bridge error: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  process.exit(1);
});
