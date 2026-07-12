const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  LOCAL_CLASS_ACTIVATION_CONFIRMATION,
  OPERATOR_TEST_URL,
  REMINDER_TEST_CONFIRMATION,
  REQUIRED_HANDOFF_CHECKS,
  buildOneTimeOperatorTestHandoff,
  buildReadyMessage,
  buildReminderTestCommand,
  deriveChecksFromReadinessSnapshot,
} = require('../src/lib/bna/one-time-operator-test-handoff');

const repoRoot = path.resolve(__dirname, '..');
const scriptPath = path.join(repoRoot, 'scripts', 'one-time-operator-test-handoff.mjs');

function allReadyChecks(overrides = {}) {
  return Object.fromEntries(REQUIRED_HANDOFF_CHECKS.map(([key]) => [key, true]).concat(Object.entries(overrides)));
}

test('operator test handoff suppresses ready message until every gate passes', () => {
  const blocked = buildOneTimeOperatorTestHandoff(allReadyChecks({ telegram_ready: false }));
  assert.equal(blocked.ready, false);
  assert.equal(blocked.ready_message, '');
  assert.equal(blocked.ready_message_suppressed, true);
  assert.deepEqual(blocked.missing_checks.map((item) => item.key), ['telegram_ready']);
  assert.equal(blocked.external_send_performed, false);
  assert.equal(blocked.production_data_mutation_performed, false);
});

test('operator test handoff emits exact operator message and guarded command only when ready', () => {
  const ready = buildOneTimeOperatorTestHandoff(allReadyChecks());
  assert.equal(ready.ready, true);
  assert.equal(ready.operator_test_url, OPERATOR_TEST_URL);
  assert.equal(ready.ready_message, buildReadyMessage());
  assert.match(ready.ready_message, /Automation is deployed and ready for your test\./);
  assert.match(ready.ready_message, /Submit your own approved email and optional phone/);
  assert.match(ready.ready_message, /Tell me when the page confirms your signup\./);
  assert.equal(ready.reminder_test_command, buildReminderTestCommand());
  assert.match(ready.reminder_test_command, new RegExp(REMINDER_TEST_CONFIRMATION));
  assert.match(ready.reminder_test_command, /--contact-id <operator_test_contact_id>/);
  assert.doesNotMatch(ready.reminder_test_command, /--all|--audience|--segment|--workspace|--project/);
  assert.equal(ready.local_class_activation_confirmation, LOCAL_CLASS_ACTIVATION_CONFIRMATION);
  assert.equal(ready.local_class_activation_after_operator_test_only, true);
  assert.deepEqual(ready.verification_checklist, [
    'one product lead',
    'one linked CRM contact',
    'city/country/timezone stored',
    'reminder preference and consent stored',
    'immediate email received',
    'WhatsApp received only if selected',
    'exactly one Rabbi Telegram alert',
    'no portal/member/access records',
    'no duplicate after replay',
  ]);
});

test('operator handoff derives current readiness blockers without raw provider secrets', () => {
  const checks = deriveChecksFromReadinessSnapshot({
    assessment: { reason: ['full One Time launch has external Stripe/WAPI/campaign blockers'] },
    active_run: {
      validation_passed: true,
      blockers: [
        { requirement_id: 'REQ-1', blocker: 'GitHub rejected workflow because OAuth app lacks workflow scope.' },
        { requirement_id: 'REQ-2', blocker: 'Release/live verification requires explicit authorization for deployment.' },
      ],
    },
    public_launch_smoke: { ready: true },
    one_time_setup: { operator_blocker_items: [{ id: 'SETUP-ONETIME-WHAPI-001' }] },
    rabbi_telegram_runtime: { status: 'blocked_missing_bot_token' },
  });
  const report = buildOneTimeOperatorTestHandoff(checks);
  assert.equal(report.ready, false);
  assert.equal(report.checks.implementation_complete, true);
  assert.equal(report.checks.no_send_tests_passed, true);
  assert.equal(report.checks.ci_passed, false);
  assert.equal(report.checks.deployment_complete, false);
  assert.equal(report.checks.wapi_ready, false);
  assert.equal(report.checks.telegram_ready, false);
  assert.doesNotMatch(JSON.stringify(report), /bot_token|secret-value|Bearer/i);
});

test('operator handoff CLI exits blocked by default and ready with explicit proof json', () => {
  const blocked = spawnSync(process.execPath, [scriptPath, '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.notEqual(blocked.status, 0);
  const blockedReport = JSON.parse(blocked.stdout);
  assert.equal(blockedReport.ready, false);
  assert.equal(blockedReport.ready_message, '');

  const proofPath = path.join(os.tmpdir(), `one-time-operator-proof-${Date.now()}.json`);
  fs.writeFileSync(proofPath, JSON.stringify(allReadyChecks(), null, 2));
  const ready = spawnSync(process.execPath, [scriptPath, '--json', '--proof-json', proofPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  fs.unlinkSync(proofPath);
  assert.equal(ready.status, 0);
  const readyReport = JSON.parse(ready.stdout);
  assert.equal(readyReport.ready, true);
  assert.match(readyReport.ready_message, /Automation is deployed and ready for your test/);
});
