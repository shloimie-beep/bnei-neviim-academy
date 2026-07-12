#!/usr/bin/env node

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return '';
  return String(process.argv[index + 1] || '').trim();
}

function hasFlag(name) {
  return process.argv.includes(name);
}

const confirm = argValue('--confirm');
const contactId = argValue('--contact-id') || argValue('--contactId');
const baseUrl = (argValue('--base-url') || process.env.ONE_TIME_APP_BASE_URL || process.env.PUBLIC_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
const now = argValue('--now');
const dryRun = hasFlag('--dry-run') || hasFlag('--dryRun');

if (confirm !== 'APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST') {
  console.error('Refusing to run. Pass --confirm APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST.');
  process.exit(1);
}

if (!/^\d+$/.test(contactId)) {
  console.error('Refusing to run. Pass one numeric --contact-id for the operator-submitted test contact.');
  process.exit(1);
}

if (!process.env.CRON_SECRET) {
  console.error('Refusing to run. CRON_SECRET must be configured for the protected reminder endpoint.');
  process.exit(1);
}

const body = {
  contact_id: Number(contactId),
  dry_run: dryRun,
};
if (now) body.now = now;

const response = await fetch(`${baseUrl}/api/cron/one-time/class-reminders`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-cron-secret': process.env.CRON_SECRET,
  },
  body: JSON.stringify(body),
});

const result = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(JSON.stringify({
    ok: false,
    status: response.status,
    error: result.error || 'Reminder simulation request failed',
    readiness: result.readiness || null,
  }, null, 2));
  process.exit(1);
}

const matching = Array.isArray(result.results)
  ? result.results.filter((row) => Number(row.contact_id) === Number(contactId))
  : [];

console.log(JSON.stringify({
  ok: true,
  dry_run: result.dry_run === true,
  contact_id: Number(contactId),
  schedule: result.schedule,
  queued_count: matching.filter((row) => row.status === 'queued').length,
  already_queued_count: matching.filter((row) => row.status === 'already_queued').length,
  skipped_count: matching.filter((row) => row.status === 'skipped').length,
  results: matching,
  unrestricted_audience: false,
  external_send_performed: result.external_send_performed === true,
}, null, 2));
