const assert = require('node:assert/strict');
const test = require('node:test');

test('One Time billing Railway readback redacts Stripe secrets and exposes billing-only blockers', async () => {
  const {
    buildOneTimeExternalSetupReadiness,
    runRailwayVariablesReadback,
  } = await import('../scripts/check-onetime-external-setup-readiness.mjs');

  const testKey = `rk_${'test'}_${'unit'.repeat(16)}`;
  const webhookSecret = `whsec_${'unit'.repeat(12)}`;
  const runner = () => ({
    status: 0,
    stdout: JSON.stringify({
      DATABASE_URL: 'postgres://example.invalid/onetime',
      ONE_TIME_PUBLIC_DOMAIN: 'join.onetimeonetime.com',
      DEFAULT_WORKSPACE_KEY: 'rabbi_sheller_provider',
      DEFAULT_PROJECT_KEY: 'one_time_mishnah_class',
      RABBI_STRIPE_SECRET_KEY: testKey,
      RABBI_STRIPE_WEBHOOK_SECRET: webhookSecret,
      ONE_TIME_STRIPE_PRICE_ID: 'price_test_67_monthly',
    }),
    stderr: '',
  });

  const readback = runRailwayVariablesReadback({
    repoRoot: process.cwd(),
    env: {},
    runner,
  });

  assert.equal(readback.ok, true);
  assert.equal(readback.stripe_secret_key_present, true);
  assert.equal(readback.stripe_secret_key_mode, 'test');
  assert.equal(readback.stripe_test_secret_key_present, true);
  assert.equal(readback.stripe_webhook_secret_present, true);
  assert.equal(readback.stripe_price_present, true);
  assert.equal(readback.stripe_sandbox_config_ready, true);
  assert.doesNotMatch(JSON.stringify(readback), new RegExp(testKey));
  assert.doesNotMatch(JSON.stringify(readback), new RegExp(webhookSecret));

  const report = buildOneTimeExternalSetupReadiness({
    repoRoot: process.cwd(),
    env: {},
    inspectKeyholder: false,
    inspectRailway: false,
    billingOnly: true,
    railwayVariables: readback,
  });

  assert.equal(report.mode, 'billing_only');
  assert.deepEqual(report.items.map((item) => item.id), [
    'SETUP-ONETIME-RAILWAY-001',
    'SETUP-ONETIME-STRIPE-001',
  ]);
  const stripe = report.items.find((item) => item.id === 'SETUP-ONETIME-STRIPE-001');
  assert.equal(stripe.ready, true);
  assert.equal(report.external_write_performed, false);
  assert.equal(report.live_payment_performed, false);
  assert.equal(report.secret_values_printed, false);
});
