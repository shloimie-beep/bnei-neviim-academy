#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(repoRoot, 'ops', 'live-smokes');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[line.slice(0, separator).trim()] = value;
  }
  return out;
}

function loadConfig() {
  const env = { ...parseEnvFile(path.join(repoRoot, '.env.local')), ...process.env };
  return {
    appUrl: (env.BNA_APP_URL || env.NEXT_PUBLIC_APP_URL || 'https://bneineviimacademy.org').replace(/\/+$/, ''),
    opsUsername: env.OPS_USERNAME || '',
    opsPassword: env.OPS_PASSWORD || '',
    signupId: env.SIGNUP_CREDIT_EMAIL_SMOKE_SIGNUP_ID || '',
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function authHeader(config) {
  assert(config.opsUsername && config.opsPassword, 'OPS_USERNAME and OPS_PASSWORD are required for the live preview smoke');
  return `Basic ${Buffer.from(`${config.opsUsername}:${config.opsPassword}`).toString('base64')}`;
}

async function request(config, endpoint, { method = 'GET', body = null } = {}) {
  const response = await fetch(`${config.appUrl}${endpoint}`, {
    method,
    headers: {
      Authorization: authHeader(config),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { text };
  }
  if (!response.ok) {
    throw new Error(`${method} ${endpoint} returned ${response.status}: ${text.slice(0, 500)}`);
  }
  return data;
}

function redactEmail(email = '') {
  const [local, domain] = String(email || '').split('@');
  if (!domain) return '[redacted]';
  return `${local.slice(0, 1)}***@${domain}`;
}

async function chooseSignup(config) {
  if (config.signupId) return Number(config.signupId);
  const data = await request(config, '/api/bna/signups');
  const signups = Array.isArray(data.signups) ? data.signups : [];
  const candidate = signups.find((signup) => {
    const method = String(signup.payment_method || '').toLowerCase();
    const status = String(signup.payment_status || '').toLowerCase();
    return method !== 'cash'
      && method !== 'bank_transfer'
      && status !== 'paid'
      && status !== 'completed'
      && signup.parent_email
      && signup.parent2_email;
  });
  assert(candidate, 'No unpaid credit signup with both parent emails was found. Set SIGNUP_CREDIT_EMAIL_SMOKE_SIGNUP_ID to preview a known test signup.');
  return Number(candidate.id);
}

function writeReport(report) {
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = report.started_at.replace(/[:.]/g, '-');
  const jsonPath = path.join(reportDir, `${stamp}-signup-credit-email-preview-live-smoke.json`);
  const mdPath = path.join(reportDir, `${stamp}-signup-credit-email-preview-live-smoke.md`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, [
    '# Signup Credit Email Preview Live Smoke',
    '',
    `- started_at: ${report.started_at}`,
    `- app_url: ${report.app_url}`,
    `- signup_id: ${report.signup_id}`,
    `- dry_run: ${report.dry_run}`,
    `- no_send: ${report.no_send}`,
    `- recipient_count: ${report.recipient_count}`,
    `- payment_link_status: ${report.payment_link_status}`,
    `- body_contains_payment_link: ${report.body_contains_payment_link}`,
    `- recipients_redacted: ${report.recipients_redacted.join(', ')}`,
    '',
    'Guardrail: this smoke calls the admin resend endpoint with `dry_run:true`; it does not send email, create checkout/payment activity, write local rows, or touch external CRM/WhatsApp/Google/Buffer.',
    '',
  ].join('\n'));
  return { jsonPath, mdPath };
}

async function main() {
  const config = loadConfig();
  const startedAt = new Date().toISOString();
  const signupId = await chooseSignup(config);
  const result = await request(config, `/api/bna/signups/${encodeURIComponent(signupId)}/send-confirmation`, {
    method: 'POST',
    body: { dry_run: true },
  });
  const preview = result.email_preview || {};

  assert(result.dry_run === true, 'Preview endpoint did not stay in dry-run mode');
  assert(result.no_send === true, 'Preview endpoint did not report no_send');
  assert(result.external_write_performed === false, 'Preview endpoint reported an external write');
  assert(result.local_write_performed === false, 'Preview endpoint reported a local write');
  assert(Number(preview.recipient_count || 0) >= 2, 'Preview did not include both parent email recipients');
  assert(preview.payment_link_status === 'included', 'Preview did not include the configured credit payment link');
  assert(preview.body_contains_payment_link === true, 'Preview body did not contain the configured payment link');

  const report = {
    started_at: startedAt,
    app_url: config.appUrl,
    signup_id: signupId,
    dry_run: result.dry_run,
    no_send: result.no_send,
    external_write_performed: result.external_write_performed,
    local_write_performed: result.local_write_performed,
    recipient_count: preview.recipient_count,
    payment_link_status: preview.payment_link_status,
    body_contains_payment_link: preview.body_contains_payment_link,
    recipients_redacted: (preview.recipients || []).map(redactEmail),
  };
  const paths = writeReport(report);
  console.log(`Signup credit email preview smoke passed: ${path.relative(repoRoot, paths.mdPath).replace(/\\/g, '/')}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
