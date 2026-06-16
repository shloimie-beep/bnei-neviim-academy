#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const packageJsonPath = path.join(repoRoot, 'package.json');

const requiredEnv = ['DATABASE_URL', 'OPS_USERNAME', 'OPS_PASSWORD'];
const requiredFiles = [
  'AGENTS.md',
  'package.json',
  'server.js',
  'public/operations.html',
  'public/operations-login.html',
  'public/student.html',
  'public/signup.html',
  'public/signup-he.html',
  'scripts/telegram-kimi-bridge.mjs',
  'scripts/agent-fleet-supervisor.mjs',
  'scripts/railway-doctor.ps1',
  'scripts/railway-redeploy.ps1',
  'ops/agent-task-ledger.jsonl',
  'ops/agent-changelog.md',
];
const requiredScripts = [
  'start',
  'dev',
  'test',
  'setup:local',
  'doctor',
  'smoke:local',
  'railway:doctor',
  'railway:redeploy',
];

const optionalGroups = {
  'One Time scoped auth': ['ONE_TIME_OPS_USERNAME', 'ONE_TIME_OPS_PASSWORD'],
  Telegram: [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID_BNA',
    'TELEGRAM_CHAT_ID_SHLOIMIE',
    'TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER',
    'TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER',
  ],
  'Hosted AI': ['OPENAI_API_KEY', 'KIMI_API_KEY', 'BNA_AI_PRIMARY_PROVIDER'],
  Google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
  Railway: ['RAILWAY_TOKEN', 'RAILWAY_API_TOKEN', 'RAILWAY_SERVICE_NAME', 'RAILWAY_ENVIRONMENT'],
  'Agent fleet': ['CODEX_CLI_COMMAND', 'AGENT_FLEET_POLL_MS', 'AGENT_FLEET_VERIFY_COMMANDS'],
  Payments: ['PAYMENT_LINK', 'GREEN_INVOICE_SECRET', 'CHECKOUT_ATTEMPT_SECRET'],
  Cron: ['CRON_SECRET'],
};

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice('export '.length).trim();
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

function loadEnvWithSources() {
  const fileEnv = parseEnvFile(envLocalPath);
  const env = {};
  const sources = {};
  for (const [key, value] of Object.entries(fileEnv)) {
    env[key] = value;
    sources[key] = '.env.local';
  }
  for (const [key, value] of Object.entries(process.env)) {
    env[key] = value;
    sources[key] = 'process.env';
  }
  return { env, sources };
}

function usefulValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return false;
  if (/^(?:changeme|todo|example|placeholder)$/i.test(normalized)) return false;
  if (/\bYOUR_|YOUR-|REPLACE_ME|\[/.test(normalized)) return false;
  return true;
}

function readPackageJson() {
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    return { parseError: error.message };
  }
}

function main() {
  console.log('BNA local doctor');
  console.log('No live Telegram, OpenAI, Kimi, Google, or Railway calls are made by this check.');
  console.log('');

  const { env, sources } = loadEnvWithSources();
  const missingEnv = requiredEnv.filter((key) => !usefulValue(env[key]));
  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(repoRoot, file)));
  const packageJson = readPackageJson();
  const scripts = packageJson.scripts || {};
  const missingScripts = packageJson.parseError
    ? requiredScripts
    : requiredScripts.filter((scriptName) => !scripts[scriptName]);

  console.log('Required environment');
  for (const key of requiredEnv) {
    if (missingEnv.includes(key)) {
      console.log(`- ${key}: missing`);
    } else {
      console.log(`- ${key}: present via ${sources[key] || 'unknown source'} (redacted)`);
    }
  }

  console.log('');
  console.log('Required files');
  for (const file of requiredFiles) {
    console.log(`- ${file}: ${missingFiles.includes(file) ? 'missing' : 'ok'}`);
  }

  console.log('');
  console.log('Package scripts');
  if (packageJson.parseError) {
    console.log(`- package.json: invalid JSON (${packageJson.parseError})`);
  }
  for (const scriptName of requiredScripts) {
    console.log(`- ${scriptName}: ${missingScripts.includes(scriptName) ? 'missing' : 'ok'}`);
  }

  console.log('');
  console.log('Optional configuration groups');
  for (const [group, keys] of Object.entries(optionalGroups)) {
    const present = keys.filter((key) => usefulValue(env[key])).length;
    console.log(`- ${group}: ${present}/${keys.length} configured`);
  }

  const failures = [];
  if (!fs.existsSync(envLocalPath)) failures.push('Missing .env.local. Run npm run setup:local.');
  for (const key of missingEnv) {
    failures.push(`Missing ${key}. Add it to .env.local or the shell environment.`);
  }
  for (const file of missingFiles) failures.push(`Missing required file ${file}.`);
  for (const scriptName of missingScripts) failures.push(`Missing package script ${scriptName}.`);

  if (failures.length) {
    console.log('');
    console.log('Doctor failed');
    for (const failure of failures) console.log(`- ${failure}`);
    console.log('');
    console.log('Remediation: run npm run setup:local, fill .env.local, then rerun npm run doctor.');
    process.exit(1);
  }

  console.log('');
  console.log('Doctor passed. Required local app-start configuration is present.');
}

main();
