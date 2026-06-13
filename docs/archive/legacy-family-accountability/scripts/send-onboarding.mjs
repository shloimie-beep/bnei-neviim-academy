#!/usr/bin/env node
// Send the family-accountability onboarding payload to Shlomo via his
// personal Telegram bot (@shlomofam_bot).
//
//   USAGE:
//     1. In Telegram, send any message to @shlomofam_bot (e.g. "hi")
//     2. Run:  node scripts/send-onboarding.mjs
//   The script polls getUpdates, finds your chat_id, then DMs you the
//   onboarding payload as a Telegram message and exits.
//
// Reads TELEGRAM_BOT_TOKEN_SHLOIMIE from .env.local. Never logs the token.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, '..', '.env.local');

function loadEnv() {
  const text = readFileSync(ENV_PATH, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function api(token, method, body) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function findChatId(token) {
  const updates = await api(token, 'getUpdates', { offset: -10 });
  if (!updates.ok || !updates.result || updates.result.length === 0) {
    throw new Error(
      'No messages found for @shlomofam_bot. Send the bot a message in Telegram first, then re-run.',
    );
  }
  // Pick the most recent message's chat.
  const last = updates.result[updates.result.length - 1];
  const chat = last?.message?.chat ?? last?.edited_message?.chat;
  if (!chat?.id) throw new Error('Update payload did not contain a chat id.');
  return chat.id;
}

const PAYLOAD = [
  '<b>Family Accountability — your setup payload</b>',
  '',
  'Everything you need, in order. Tap as you go.',
  '',
  '<b>1. Cloud accounts</b> (the deploy agent will handle these if you ran the deploy prompt; otherwise do them yourself).',
  '   • <a href="https://supabase.com/dashboard">Supabase</a> → new project <code>family-accountability</code>, run <code>supabase-schema.sql</code> + <code>supabase-migration-002.sql</code>',
  '   • <a href="https://github.com/new?name=family-accountability&visibility=private">GitHub new repo</a>',
  '   • <a href="https://railway.app/new">Railway new project</a> → connect the repo',
  '   • <a href="https://resend.com/api-keys">Resend API keys</a>',
  '',
  '<b>2. Bot setup (you already did this — tokens are in .env.local)</b>',
  '   • Your bot:    <code>@shlomofam_bot</code>',
  '   • Ahuva\'s bot: <code>@ahuvafam_bot</code>',
  '',
  '<b>3. After Railway gives you a URL</b>',
  '   • Open <code>&lt;URL&gt;/parent/login</code> on your phone → magic link → onboarding wizard runs',
  '   • Onboarding generates kid PIN bcrypt hashes for you to paste into Railway',
  '   • Forward the link to Ahuva — she goes through the same wizard on her phone',
  '',
  '<b>4. Wire the webhooks (one curl per bot)</b>',
  '   (the script <code>scripts/set-webhooks.mjs</code> does this for you)',
  '',
  '<b>5. Schedule the crons in Railway</b>',
  '   • <code>daily-summary</code>: <code>0 19 * * *</code>',
  '   • <code>reminders-morning</code>: <code>0 5 * * *</code>',
  '   • <code>reminders-afternoon</code>: <code>0 14 * * *</code>',
  '',
  '<b>6. Kid QR codes (after deploy)</b>',
  '   • <code>&lt;URL&gt;/api/qr/menachem</code> and <code>&lt;URL&gt;/api/qr/esther</code> — save the PNGs, print them, tape to each tablet',
  '',
  'Once everything is wired, you and Ahuva can both chat with these bots in plain English and it answers from family data only. Try: <i>"how did Esther do this week?"</i>',
].join('\n');

async function main() {
  const env = loadEnv();
  const token = env.TELEGRAM_BOT_TOKEN_SHLOIMIE;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN_SHLOIMIE not set in .env.local');
    process.exit(1);
  }
  console.log('Looking for your chat with @shlomofam_bot…');
  const chatId = await findChatId(token);
  console.log('Found chat_id:', chatId);
  console.log('Sending onboarding payload…');
  const res = await api(token, 'sendMessage', {
    chat_id: chatId,
    text: PAYLOAD,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
  if (!res.ok) {
    console.error('Telegram error:', res.description);
    process.exit(1);
  }
  console.log('Sent. Check your @shlomofam_bot chat.');
  console.log('Your chat_id (paste into TELEGRAM_CHAT_ID_SHLOIMIE):', chatId);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
