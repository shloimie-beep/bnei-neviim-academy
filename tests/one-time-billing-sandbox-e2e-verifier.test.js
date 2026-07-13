const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('One Time billing sandbox E2E verifier covers the no-trial billing lifecycle without external writes', async () => {
  const verifier = await import('../scripts/verify-onetime-billing-sandbox-e2e.mjs');
  const report = verifier.buildReport(new Date('2026-07-13T12:00:00.000Z'));

  assert.equal(report.status, 'passed');
  assert.equal(report.requirement_id, 'REQ-20260713-961');
  assert.equal(report.external_write_performed, false);
  assert.equal(report.production_data_mutation_performed, false);
  assert.equal(report.live_charge_performed, false);
  assert.equal(report.notice_send_performed, false);
  assert.equal(report.refund_performed, false);
  assert.equal(report.access_mutation_performed, false);
  assert.equal(report.checks.length, 15);
  assert.equal(report.checks.every((check) => check.passed), true);

  assert.equal(report.product_price.amount_cents, 6700);
  assert.equal(report.product_price.currency, 'USD');
  assert.equal(report.product_price.interval, 'month');
  assert.equal(report.product_price.stripe_trial_enabled, false);
  assert.equal(report.checkout_preview.mode, 'subscription');
  assert.equal(report.checkout_preview.trial_period_days_present, false);
  assert.equal(report.checkout_preview.metadata.stripe_trial_enabled, 'false');
  assert.equal(report.notice_preview.no_send, true);
  assert.equal(report.notice_preview.live_send_enabled, false);
  assert.equal(report.refund_review.manual_review_required, true);
  assert.equal(report.refund_review.refund_execution_enabled, false);
  assert.equal(report.lifecycle.ignored_trial_event, true);
  assert.equal(report.lifecycle.duplicate_replay_verified, true);
  assert.equal(report.lifecycle.snapshots.failed_payment.access_enabled, false);
  assert.equal(report.lifecycle.snapshots.failed_payment.grace_until, null);
  assert.equal(report.lifecycle.snapshots.payment_recovered.access_enabled, true);
  assert.equal(report.lifecycle.snapshots.refund_manual_review.entitlement_state, 'manual_review');
  assert.equal(report.lifecycle.audit.latest_entitlement.entitlement_state, 'scheduled_cancellation');

  const serialized = JSON.stringify(report);
  assert.doesNotMatch(serialized, /\b(?:sk|rk|pk)_(?:test|live)_[A-Za-z0-9._-]{8,}\b/);
  assert.doesNotMatch(serialized, /\bwhsec_[A-Za-z0-9._-]{8,}\b/);

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const script = fs.readFileSync('scripts/verify-onetime-billing-sandbox-e2e.mjs', 'utf8');
  assert.equal(packageJson.scripts['stripe:sandbox-e2e'], 'node scripts/verify-onetime-billing-sandbox-e2e.mjs');
  assert.doesNotMatch(script, /sk_live_[A-Za-z0-9]/);
  assert.doesNotMatch(script, /sk_test_[A-Za-z0-9]{8,}/);
  assert.doesNotMatch(script, /whsec_[A-Za-z0-9]{8,}/);
});
