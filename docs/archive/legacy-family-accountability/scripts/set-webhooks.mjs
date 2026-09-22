#!/usr/bin/env node
// One-shot webhook setter for both family-bot tokens.
//
// USAGE:
//   node scripts/set-webhooks.mjs https://your-deployed-url.up.railway.app
//
// Sets:
//   @shlomofam_bot  → <URL>/api/telegram/webhook/shloimie  with TELEGRAM_WEBHOOK_SECRET_SHLOIMIE
//   @ahuvafam_bot   → <URL>/api/telegram/webhook/ahuva     with TELEGRAM_WEBHOOK_SECRET_AHUVA
//
// Reads .env.local for the four secrets/tokens.

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

async function setWebhook(token, url, secret) {
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, secret_token: secret }),
  });
  return res.json();
}

async function main() {
  const base = (process.argv[2] || '').replace(/\/+$/, '');
  if (!base || !/^https?:\/\//.test(base)) {
    console.error('Usage: node scripts/set-webhooks.mjs https://<your-deployed-url>');
    process.exit(1);
  }
  const env = loadEnv();

  const targets = [
    {
      label: '@shlomofam_bot',
      token: env.TELEGRAM_BOT_TOKEN_SHLOIMIE,
      url: `${base}/api/telegram/webhook/shloimie`,
      secret: env.TELEGRAM_WEBHOOK_SECRET_SHLOIMIE,
    },
    {
      label: '@ahuvafam_bot',
      token: env.TELEGRAM_BOT_TOKEN_AHUVA,
      url: `${base}/api/telegram/webhook/ahuva`,
      secret: env.TELEGRAM_WEBHOOK_SECRET_AHUVA,
    },
  ];

  for (const t of targets) {
    if (!t.token) {
      console.error(`${t.label}: missing token`);
      continue;
    }
    if (!t.secret) {
      console.error(`${t.label}: missing webhook secret in .env.local`);
      continue;
    }
    const res = await setWebhook(t.token, t.url, t.secret);
    console.log(`${t.label} → ${t.url}: ${res.ok ? 'OK' : 'FAIL — ' + res.description}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
