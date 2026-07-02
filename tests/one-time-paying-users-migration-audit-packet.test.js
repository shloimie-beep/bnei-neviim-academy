const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const packetPath = 'ops/prompt-packets/2026-07-01-one-time-paying-users-migration/01-existing-paying-users-audit.md';
const auditJsonPath = 'ops/one-time-mishnah/funnel/2026-07-01-paying-users-migration-audit.json';
const packet = fs.readFileSync(packetPath, 'utf8');
const audit = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));

test('existing paying-users migration packet is read-only and no-send', () => {
  assert.match(packet, /read-only/i);
  assert.match(packet, /do not cancel/i);
  assert.match(packet, /draft only; do not send/i);
  assert.match(packet, /No billing\/provider\/access mutation runs from this packet/i);
  assert.equal(audit.stripe_api_called, false);
  assert.equal(audit.checkout_created, false);
  assert.equal(audit.payment_link_created, false);
  assert.equal(audit.charge_performed, false);
  assert.equal(audit.subscription_changed, false);
  assert.equal(audit.cancellation_or_refund_performed, false);
  assert.equal(audit.external_write_performed, false);
});

test('existing paying-users migration packet contains all required classification lanes', () => {
  for (const lane of [
    'existing_paid_member',
    'legacy_video_only',
    'legacy_live_class',
    'inactive_payer',
    'unknown_status',
    'needs_billing_review',
  ]) {
    assert.ok(packet.includes(`\`${lane}\``), `${lane} missing`);
  }
  assert.match(packet, /billing source of truth/i);
  assert.match(packet, /Replit\/old Stripe/i);
  assert.match(packet, /Migration treatment rules/i);
});

test('existing paying-users audit evidence stays aggregate and redacted', () => {
  assert.equal(audit.raw_people_or_payment_values_written, false);
  assert.match(packet, /No names, emails, phones, Stripe customer IDs, checkout session IDs, payment/);
  const combined = `${packet}\n${JSON.stringify(audit)}`;
  assert.equal(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(combined), false);
  assert.equal(/\bcus_[A-Za-z0-9]+\b/.test(combined), false);
  assert.equal(/\bcs_(test|live)_[A-Za-z0-9]+\b/.test(combined), false);
  assert.equal(/https:\/\/[^\s)]*(pay|checkout|invoice)[^\s)]*/i.test(combined), false);
  assert.equal(/\bsk_(live|test)_[A-Za-z0-9]+\b/.test(combined), false);
  assert.equal(/\bpk_(live|test)_[A-Za-z0-9]+\b/.test(combined), false);
});
