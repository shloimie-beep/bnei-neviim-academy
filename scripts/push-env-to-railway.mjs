#!/usr/bin/env node
// Push selected variables from .env.local to the Railway app service.
// Uses .secrets/railway-token.txt when RAILWAY_TOKEN is not already set.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, '.env.local');
const tokenPath = path.join(repoRoot, '.secrets', 'railway-token.txt');
const service = process.env.RAILWAY_SERVICE_NAME || 'skillful-motivation';
const environment = process.env.RAILWAY_ENVIRONMENT || 'production';

if (!process.env.RAILWAY_TOKEN && !process.env.RAILWAY_API_TOKEN && fs.existsSync(tokenPath)) {
  process.env.RAILWAY_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
}

if (process.env.RAILWAY_TOKEN && process.env.RAILWAY_API_TOKEN) {
  console.error('Both RAILWAY_TOKEN and RAILWAY_API_TOKEN are set. Railway only allows one auth mode at a time.');
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  console.error(`Missing ${envPath}`);
  process.exit(1);
}

const skipKeys = new Set([
  'DATABASE_URL',
  'RAILWAY_TOKEN',
  'RAILWAY_API_TOKEN',
  'RAILWAY_PROJECT_ID',
  'RAILWAY_PROJECT_NAME',
  'RAILWAY_ENVIRONMENT',
  'RAILWAY_ENVIRONMENT_ID',
  'RAILWAY_SERVICE_ID',
  'RAILWAY_SERVICE_NAME',
]);

const vars = [];
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!match) continue;

  const [, key, rawValue] = match;
  const value = rawValue.replace(/^["']|["']$/g, '');
  if (!value || skipKeys.has(key)) continue;
  vars.push({ key, value });
}

console.log(`Pushing ${vars.length} variables to Railway service ${service} / ${environment}.`);
console.log('Skipping DATABASE_URL and Railway-managed variables.');

let pushed = 0;
let failed = 0;
for (const { key, value } of vars) {
  const result = spawnSync(
    'railway',
    ['variable', 'set', `${key}=${value}`, '--service', service, '--environment', environment, '--skip-deploys'],
    { encoding: 'utf8', stdio: 'pipe', env: process.env }
  );

  if (result.status === 0) {
    console.log(`OK ${key}`);
    pushed += 1;
  } else {
    console.error(`ERROR ${key}: ${(result.stderr || result.stdout || '').split('\n')[0]}`);
    failed += 1;
  }
}

console.log(`Finished: ${pushed} pushed, ${failed} failed.`);
if (failed) process.exit(1);
