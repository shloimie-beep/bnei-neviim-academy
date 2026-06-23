#!/usr/bin/env node
// Final launch step. Run AFTER:
//   1. Schema applied (node scripts/apply-schema.mjs)
//   2. Railway deploy succeeded (railway up)
//   3. NEXT_PUBLIC_APP_URL in .env.local updated to the Railway URL
//
// This script:
//   • Sets the Telegram webhook for each parent's bot at the deployed URL
//   • Sends a launch ping to Shloimie's Telegram chat with the live URL
//
// Usage: node scripts/launch.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!APP_URL || APP_URL.includes('localhost')) {
  console.error('✗ NEXT_PUBLIC_APP_URL is missing or still localhost.');
  console.error('  Update .env.local with the Railway-assigned URL first, e.g.:');
  console.error('  NEXT_PUBLIC_APP_URL=https://family-accountability-production-XXXX.up.railway.app');
  process.exit(1);
}

const SHLOIMIE_TOKEN = process.env.TELEGRAM_BOT_TOKEN_SHLOIMIE;
const SHLOIMIE_CHAT_ID = process.env.TELEGRAM_CHAT_ID_SHLOIMIE;
const SHLOIMIE_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET_SHLOIMIE;
const AHUVA_TOKEN = process.env.TELEGRAM_BOT_TOKEN_AHUVA;
const AHUVA_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET_AHUVA;

async function setWebhook(token, secret, parentSlug) {
  const url = `${APP_URL}/api/telegram/webhook/${parentSlug}`;
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, secret_token: secret, drop_pending_updates: true }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Webhook set failed for ${parentSlug}: ${data.description}`);
  console.log(`✓ Webhook set: ${parentSlug} → ${url}`);
}

async function sendTelegram(token, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: false }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram send failed: ${data.description}`);
}

console.log(`→ Launch URL: ${APP_URL}\n`);

console.log('→ Setting Telegram webhooks...');
await setWebhook(SHLOIMIE_TOKEN, SHLOIMIE_SECRET, 'shloimie');
if (AHUVA_TOKEN && AHUVA_SECRET) {
  await setWebhook(AHUVA_TOKEN, AHUVA_SECRET, 'ahuva');
} else {
  console.log('⚠  Ahuva bot env vars missing — skipped (she can be added later)');
}

console.log('\n→ Pinging Shloimie\'s Telegram bot with launch link...');
const launchMessage = `<b>🚀 Family Accountability is live</b>

<b>Live URL:</b> ${APP_URL}

<b>First step — parent onboarding wizard:</b>
${APP_URL}/parent/onboarding

That wizard walks you through:
• Setting kid PINs (Menachem + Esther)
• Installing the app on Ahuva's tablet
• First family meeting

Send <code>/today</code> in this chat any time to see status.`;

await sendTelegram(SHLOIMIE_TOKEN, SHLOIMIE_CHAT_ID, launchMessage);
console.log('✓ Launch ping sent to Shloimie\'s Telegram');

console.log('\n✓ All done. App is live.');
