const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

async function pilotModule() {
  return import(pathToFileURL(path.join(root, 'scripts', 'one-time-synthetic-pilot.mjs')).href);
}

test('One Time synthetic pilot covers the full local beta lifecycle without writes', async () => {
  const { buildOneTimeSyntheticPilotScenario } = await pilotModule();
  const report = buildOneTimeSyntheticPilotScenario({ checkedAt: '2026-06-20T19:10:00.000Z' });

  assert.equal(report.requirement_id, 'REQ-20260619-422');
  assert.equal(report.success, true);
  assert.equal(report.preview_only, true);
  assert.equal(report.external_write_performed, false);
  assert.equal(report.production_mutation_performed, false);
  assert.deepEqual(report.missing_stages, []);
  assert.deepEqual(report.write_violations, []);

  for (const stage of [
    'signup_enrollment',
    'class_ingestion',
    'attendance',
    'media_publishing',
    'announcements',
    'progress',
    'rewards',
    'email_mocks',
    'payment_mocks',
    'admin_closeout',
  ]) {
    assert.equal(report.stage_coverage[stage].covered, true, `${stage} should be covered`);
  }

  assert.equal(report.enrollment.checkout.live_charge_performed, false);
  assert.equal(report.enrollment.trial_signup.access_status, 'trial');
  assert.equal(report.enrollment.trial_signup.stripe_checkout_created, false);
  assert.equal(report.enrollment.checkout.enrollment_after_paid, false);
  assert.equal(report.enrollment.payment_result.enrollment_status, 'converted_to_paid');
  assert.equal(report.enrollment.payment_result.access_status, 'active_paid');
  assert.equal(report.enrollment.duplicate_payment_result.duplicate, true);
  assert.equal(report.class_ingestion.flow_coverage.attendance_minutes, 'drafted');
  assert.equal(report.attendance.attendance_write_performed, false);
  assert.equal(report.media_publishing.library_draft.publish_enabled, false);
  assert.equal(report.announcements.private_reply.reply_body_returned, false);
  assert.equal(report.progress_rewards.reward_policy.automatic_award_performed, false);
  assert.equal(report.email_mocks.email_send_performed, false);
  assert.ok(report.admin_closeout.blocked_live_actions.includes('deploy'));
});
