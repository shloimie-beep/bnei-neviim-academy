const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts', 'simulate-one-time-class-reminder.mjs');

function runScript(args = [], env = {}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      CRON_SECRET: '',
      ONE_TIME_APP_BASE_URL: '',
      PUBLIC_BASE_URL: '',
      ...env,
    },
  });
}

test('One Time reminder simulation command requires exact phrase and one contact', () => {
  const missingConfirm = runScript(['--contact-id', '123']);
  assert.notEqual(missingConfirm.status, 0);
  assert.match(missingConfirm.stderr, /APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST/);

  const missingContact = runScript(['--confirm', 'APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST']);
  assert.notEqual(missingContact.status, 0);
  assert.match(missingContact.stderr, /one numeric --contact-id/);

  const zeroContact = runScript([
    '--confirm',
    'APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST',
    '--contact-id',
    '0',
  ]);
  assert.notEqual(zeroContact.status, 0);
  assert.match(zeroContact.stderr, /one numeric --contact-id/);
});

test('One Time reminder simulation command refuses unrestricted audience flags', () => {
  const result = runScript([
    '--confirm',
    'APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST',
    '--contact-id',
    '123',
    '--all',
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--all is not allowed/);
  assert.match(result.stderr, /only accepts one --contact-id/);
});

test('One Time reminder simulation command does not call cron without CRON_SECRET', () => {
  const result = runScript([
    '--confirm',
    'APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST',
    '--contact-id',
    '123',
    '--dry-run',
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CRON_SECRET must be configured/);
});

test('One Time reminder simulation command posts only contact-scoped payload', () => {
  const script = fs.readFileSync(scriptPath, 'utf8');
  const bodyBlock = script.slice(script.indexOf('const body = {'), script.indexOf('const response = await fetch'));
  assert.match(script, /APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST/);
  assert.match(script, /forbiddenAudienceFlags/);
  assert.match(script, /contact_id: Number\(contactId\)/);
  assert.match(script, /unrestricted_audience: false/);
  assert.match(script, /results\.filter\(\(row\) => Number\(row\.contact_id\) === Number\(contactId\)\)/);
  assert.doesNotMatch(bodyBlock, /audience|segment|workspace|project|all|broadcast/i);
});
