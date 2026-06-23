import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function argValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (match) return match.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function basicAuthHeader(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

loadEnvFile(path.join(root, '.env.local'));

const baseUrl = (argValue('base', process.env.APP_BASE_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:8080')).replace(/\/+$/, '');
const to = argValue('to', process.env.OFFICE_TEST_EMAIL || process.env.PARENT_HELP_EMAIL || process.env.GMAIL_FROM || '');
const subject = argValue('subject', `BNA email smoke ${new Date().toISOString().slice(0, 10)}`);
const body = argValue('body', 'Controlled BNA email smoke through the action registry. This path should not bypass approval or connector guards.');
const send = hasFlag('send');
const username = process.env.OPS_USERNAME || '';
const password = process.env.OPS_PASSWORD || '';

if (!username || !password) {
  throw new Error('OPS_USERNAME and OPS_PASSWORD are required for email smoke.');
}

if (!to) {
  throw new Error('Provide --to=email@example.com or set OFFICE_TEST_EMAIL/PARENT_HELP_EMAIL/GMAIL_FROM.');
}

const payload = {
  action_id: 'send_test_email',
  source: 'email_smoke_script',
  dry_run: !send,
  approved: send,
  confirm: send ? 'APPROVE_TYPED_ACTION' : undefined,
  inputs: {
    to,
    subject,
    body,
    identity: 'bna_office',
  },
};

const response = await fetch(`${baseUrl}/api/bna/actions/run`, {
  method: 'POST',
  headers: {
    Authorization: basicAuthHeader(username, password),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const text = await response.text();
let data = null;
try {
  data = JSON.parse(text);
} catch {
  data = { raw: text };
}

const summary = {
  ok: response.ok && data?.success !== false,
  status: response.status,
  mode: send ? 'approved_guarded_send_path' : 'dry_run',
  base_url: baseUrl,
  recipient: to.replace(/^(.).+(@.+)$/, '$1***$2'),
  action_id: 'send_test_email',
  executed: Boolean(data?.executed),
  message: data?.message || data?.result?.note || data?.result_summary || data?.error || '',
  connector: data?.result?.connector || data?.result?.result?.connector || '',
  connector_ready: data?.result?.connector_ready ?? data?.result?.result?.connector_ready ?? null,
};

console.log(JSON.stringify(summary, null, 2));

if (!summary.ok) {
  process.exitCode = 1;
}
