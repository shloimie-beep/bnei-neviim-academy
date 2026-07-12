const OPERATOR_TEST_URL = 'https://join.onetimeonetime.com/one-time/signup';
const REMINDER_TEST_CONFIRMATION = 'APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST';
const LOCAL_CLASS_ACTIVATION_CONFIRMATION = 'APPROVE_ONE_TIME_LOCAL_CLASS_EMAIL_REMINDERS';

const REQUIRED_HANDOFF_CHECKS = Object.freeze([
  ['implementation_complete', 'Implementation is complete.'],
  ['migrations_applied', 'Migrations are applied.'],
  ['no_send_tests_passed', 'No-send tests passed.'],
  ['ci_passed', 'CI passed for the exact PR SHA.'],
  ['deployment_complete', 'The exact PR SHA is deployed.'],
  ['resend_ready', 'Resend readiness is confirmed.'],
  ['wapi_ready', 'One Time WAPI readiness is confirmed.'],
  ['telegram_ready', 'Rabbi Telegram readiness is confirmed.'],
  ['scheduler_ready', 'Scheduler health and CRON_SECRET readiness are confirmed.'],
  ['direct_form_visual_proof_ready', 'Direct form-page visual proof is current.'],
]);

function truthy(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeChecks(checks = {}) {
  return Object.fromEntries(
    REQUIRED_HANDOFF_CHECKS.map(([key]) => [key, truthy(checks[key])])
  );
}

function buildReadyMessage() {
  return [
    'Automation is deployed and ready for your test.',
    '',
    'Open:',
    OPERATOR_TEST_URL,
    '',
    'Submit your own approved email and optional phone. Choose a city, Family or School, and your desired reminder channels. Tell me when the page confirms your signup.',
  ].join('\n');
}

function buildReminderTestCommand({ contactIdPlaceholder = '<operator_test_contact_id>' } = {}) {
  return [
    'npm run onetime:reminder:test-contact --',
    `--confirm ${REMINDER_TEST_CONFIRMATION}`,
    `--contact-id ${contactIdPlaceholder}`,
  ].join(' ');
}

function buildVerificationChecklist() {
  return [
    'one product lead',
    'one linked CRM contact',
    'city/country/timezone stored',
    'reminder preference and consent stored',
    'immediate email received',
    'WhatsApp received only if selected',
    'exactly one Rabbi Telegram alert',
    'no portal/member/access records',
    'no duplicate after replay',
  ];
}

function buildReminderVerificationChecklist() {
  return [
    'local time displayed correctly for the selected city',
    'Israel time displayed as 7:00 p.m.',
    'one email reminder if selected',
    'one WhatsApp reminder if selected',
    'no duplicate on replay',
    'delivery logs and CRM timeline agree',
  ];
}

function buildOneTimeOperatorTestHandoff(checks = {}, details = {}) {
  const normalized = normalizeChecks(checks);
  const missing = REQUIRED_HANDOFF_CHECKS
    .filter(([key]) => !normalized[key])
    .map(([key, label]) => ({ key, label }));
  const ready = missing.length === 0;
  return {
    ready,
    status: ready ? 'ready_for_operator_personal_test' : 'blocked_before_operator_personal_test',
    checks: normalized,
    missing_checks: missing,
    ready_message: ready ? buildReadyMessage() : '',
    ready_message_suppressed: !ready,
    operator_test_url: OPERATOR_TEST_URL,
    verification_checklist: buildVerificationChecklist(),
    reminder_test_command: buildReminderTestCommand(details),
    reminder_test_confirmation: REMINDER_TEST_CONFIRMATION,
    reminder_verification_checklist: buildReminderVerificationChecklist(),
    local_class_activation_confirmation: LOCAL_CLASS_ACTIVATION_CONFIRMATION,
    local_class_activation_after_operator_test_only: true,
    unrestricted_audience_allowed: false,
    external_send_performed: false,
    production_data_mutation_performed: false,
  };
}

function deriveChecksFromReadinessSnapshot(snapshot = {}) {
  const assessment = snapshot.assessment || {};
  const activeRun = snapshot.active_run || {};
  const publicLaunchSmoke = snapshot.public_launch_smoke || {};
  const oneTimeSetup = snapshot.one_time_setup || {};
  const rabbiTelegram = snapshot.rabbi_telegram_runtime || {};
  const reasons = Array.isArray(assessment.reason) ? assessment.reason.join('\n') : '';
  const runBlockers = Array.isArray(activeRun.blockers) ? activeRun.blockers : [];
  const blockersText = `${reasons}\n${runBlockers.map((item) => `${item.requirement_id || ''} ${item.blocker || ''}`).join('\n')}`;
  const setupMissing = Array.isArray(oneTimeSetup.operator_blocker_items) && oneTimeSetup.operator_blocker_items.length > 0;
  return {
    implementation_complete: activeRun.validation_passed === true,
    migrations_applied: !/migration/i.test(blockersText),
    no_send_tests_passed: publicLaunchSmoke.ready === true,
    ci_passed: !/workflow scope|CI/i.test(blockersText),
    deployment_complete: !/deploy|release authorization|live verification/i.test(blockersText),
    resend_ready: !/resend/i.test(blockersText),
    wapi_ready: !setupMissing && !/WAPI|Whapi|whapi/i.test(blockersText),
    telegram_ready: rabbiTelegram.production_verified === true || rabbiTelegram.status === 'live_smoke_verified',
    scheduler_ready: !/CRON_SECRET|scheduler|reminders.*enabled/i.test(blockersText),
    direct_form_visual_proof_ready: publicLaunchSmoke.ready === true,
  };
}

module.exports = {
  LOCAL_CLASS_ACTIVATION_CONFIRMATION,
  OPERATOR_TEST_URL,
  REMINDER_TEST_CONFIRMATION,
  REQUIRED_HANDOFF_CHECKS,
  buildOneTimeOperatorTestHandoff,
  buildReadyMessage,
  buildReminderTestCommand,
  buildReminderVerificationChecklist,
  buildVerificationChecklist,
  deriveChecksFromReadinessSnapshot,
};
