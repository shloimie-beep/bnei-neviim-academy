const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const smokeScript = fs.readFileSync('scripts/smoke-one-time-resend-vimeo-stripe-safe.mjs', 'utf8');

test('package exposes the One Time Resend/Vimeo/Stripe safe smoke', () => {
  assert.equal(
    packageJson.scripts['one-time:smoke:resend-vimeo-stripe'],
    'node scripts/smoke-one-time-resend-vimeo-stripe-safe.mjs'
  );
});

test('safe smoke does not call external mutation APIs', () => {
  assert.doesNotMatch(smokeScript, /sendResendEmail\s*\(/);
  assert.doesNotMatch(smokeScript, /resendRequest\s*\(\s*['"]\/emails/i);
  assert.doesNotMatch(smokeScript, /verifyResendDomain\s*\(/);
  assert.doesNotMatch(smokeScript, /\.checkout\.sessions\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /\.paymentIntents\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /\.customers\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /\.subscriptions\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /\.products\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /\.prices\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /\.paymentLinks\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /\.refunds\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /\.payouts\.create\s*\(/);
  assert.doesNotMatch(smokeScript, /vimeoApiRequest\s*\(/);
});

test('safe smoke blocks Stripe API checks unless the loaded key is test mode', () => {
  assert.match(smokeScript, /config\.mode === 'live'/);
  assert.match(smokeScript, /stripe_live_key_blocked_for_no_charge_sandbox_smoke/);
  assert.match(smokeScript, /config\.mode === 'test'/);
  assert.match(smokeScript, /stripe\.accounts\.retrieve\s*\(/);
});

test('safe smoke report includes explicit no-send no-upload no-charge guardrails', () => {
  assert.match(smokeScript, /resend_send_attempted/);
  assert.match(smokeScript, /vimeo_upload_attempted/);
  assert.match(smokeScript, /stripe_charge_attempted/);
  assert.match(smokeScript, /stripe_checkout_session_created/);
  assert.match(smokeScript, /external_write_performed/);
});
