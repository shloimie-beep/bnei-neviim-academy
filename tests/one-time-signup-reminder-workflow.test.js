const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  ONE_TIME_SCHEDULE_VERSION,
  buildClassTimeDisplay,
  buildLocalClassSegmentPreview,
  buildOneTimeClassReminderMessage,
  buildOneTimeSignupConfirmationEmail,
  buildOneTimeSignupLeadInput,
  buildOneTimeSignupOutboxEvents,
  buildRabbiSignupTelegramAlert,
  buildReminderIdempotencyKey,
  nextOneTimeClassSchedule,
  oneTimeClassReminderEnvReadiness,
  oneTimeWapiReminderEnvReadiness,
  resolveOneTimeCitySelection,
} = require('../src/lib/bna/one-time-signup-workflow');

test('direct signup page is the canonical public form', () => {
  const signup = fs.readFileSync('public/one-time/signup.html', 'utf8');
  const landing = fs.readFileSync('public/one-time/index.html', 'utf8');
  const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
  const visibleSignupText = signup
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  assert.match(signup, /Sign Up Now/);
  assert.match(signup, /href="\/one-time"[^>]*>Back to Home<\/a>/);
  assert.match(signup, /name="contact_name"/);
  assert.match(signup, /name="signup_as"/);
  assert.match(signup, /<option value="Family">Family<\/option>/);
  assert.match(signup, /<option value="School">School<\/option>/);
  assert.match(signup, /name="city_label"/);
  assert.match(signup, /name="city_id"/);
  assert.match(signup, /name="city_region"/);
  assert.match(signup, /name="city_country_code"/);
  assert.match(signup, /name="timezone"/);
  assert.match(signup, /name="browser_timezone"/);
  assert.match(signup, /name="email"/);
  assert.match(signup, /name="phone"/);
  assert.match(signup, /name="signup_acknowledgement"/);
  assert.match(signup, /name="reminder_preference" value="email"/);
  assert.match(signup, /name="reminder_preference" value="whatsapp"/);
  assert.match(signup, /name="reminder_preference" value="both"/);
  assert.match(signup, /name="reminder_preference" value="none"/);
  assert.match(signup, /Use my selected city for class times\. By choosing reminders, I agree to receive class updates and can stop them at any time\./);
  assert.match(signup, /class="required-dot"/);
  assert.match(signup, /data-phone-required-dot[^>]*hidden/);
  assert.match(signup, /data-phone-hint hidden>Required for WhatsApp reminders\./);
  assert.doesNotMatch(signup, /Add a phone number if you want WhatsApp reminders/i);
  assert.match(signup, /prefers-reduced-motion/);
  assert.match(signup, /\/api\/one-time\/interest/);
  assert.doesNotMatch(visibleSignupText, /Member Login|parent portal|student portal|checkout|billing|CRM|Codex|guardrail|approval|password setup|Optional unless/i);

  assert.match(landing, /href="\/one-time\/signup"[^>]*>Sign Up Now<\/a>/);
  assert.doesNotMatch(landing, /data-signup-modal|data-signup-form|data-continue-onboarding/);
  assert.doesNotMatch(landing, /The next step asks whether|Choose the right onboarding path|does not charge|external send|grant access/i);

  const routes = new Set(routeRegistry.routes.map((route) => route.route));
  assert.ok(routes.has('/one-time/signup'));
  const actions = new Set(actionRegistry.actions.map((action) => action.action_id));
  assert.ok(actions.has('ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT'));
});

test('signup payload validation covers consent, city disambiguation, and WhatsApp phone requirement', () => {
  const base = {
    contact_name: 'Example Family',
    signup_as: 'Family',
    city_id: 'lakewood-nj-us',
    email: 'Family@Example.com',
    reminder_preference: 'none',
    browser_timezone: 'America/New_York',
    signup_acknowledgement: true,
  };
  const noReminder = buildOneTimeSignupLeadInput(base, { now: new Date('2026-07-12T12:00:00Z') });
  assert.equal(noReminder.email, 'family@example.com');
  assert.equal(noReminder.consent, false);
  assert.equal(noReminder.metadata.reminder_consent_at, null);
  assert.deepEqual(noReminder.metadata.reminder_channels, []);
  assert.equal(noReminder.metadata.city.label, 'Lakewood, New Jersey, United States');

  const emailReminder = buildOneTimeSignupLeadInput({ ...base, reminder_preference: 'email', reminder_consent_ack: true }, { now: new Date('2026-07-12T12:00:00Z') });
  assert.equal(emailReminder.consent, true);
  assert.match(emailReminder.metadata.reminder_consent_at, /^2026-07-12T12:00:00\.000Z$/);
  assert.deepEqual(emailReminder.metadata.reminder_channels, ['email']);

  assert.throws(
    () => buildOneTimeSignupLeadInput({ ...base, reminder_preference: 'email', signup_acknowledgement: false, consent: false }),
    /Check the box/
  );

  assert.throws(
    () => buildOneTimeSignupLeadInput({ ...base, reminder_preference: 'whatsapp' }),
    /Phone \/ WhatsApp is required/
  );
  const whatsapp = buildOneTimeSignupLeadInput({ ...base, reminder_preference: 'whatsapp', phone: '+1 732 555 0101', reminder_consent_ack: true });
  assert.equal(whatsapp.whatsapp, '+1 732 555 0101');

  assert.throws(
    () => resolveOneTimeCitySelection({ city: 'Springfield' }),
    /ambiguous/i
  );
  const mismatch = resolveOneTimeCitySelection({ city_id: 'lakewood-nj-us', browser_timezone: 'Europe/London' });
  assert.equal(mismatch.timezone, 'America/New_York');
  assert.equal(mismatch.timezone_mismatch, true);
  assert.equal(mismatch.timezone_mismatch_review.browser_timezone, 'Europe/London');
});

test('class schedule uses one Jerusalem instant and recipient-local display with DST-safe IANA zones', () => {
  const summer = nextOneTimeClassSchedule({ now: new Date('2026-07-12T10:00:00Z') });
  assert.equal(summer.class_instant_iso, '2026-07-12T16:00:00.000Z');
  assert.equal(summer.reminder_instant_iso, '2026-07-12T15:30:00.000Z');

  const lakewood = buildClassTimeDisplay({
    classInstant: summer.class_instant,
    city: resolveOneTimeCitySelection({ city_id: 'lakewood-nj-us' }),
  });
  const london = buildClassTimeDisplay({
    classInstant: summer.class_instant,
    city: resolveOneTimeCitySelection({ city_id: 'london-england-gb' }),
  });
  const sydney = buildClassTimeDisplay({
    classInstant: summer.class_instant,
    city: resolveOneTimeCitySelection({ city_id: 'sydney-nsw-au' }),
  });
  assert.match(lakewood.recipient_local_time, /12:00 p\.m\./);
  assert.match(london.recipient_local_time, /5:00 p\.m\./);
  assert.match(sydney.recipient_local_time, /2:00 a\.m\./);
  assert.equal(lakewood.israel_time, '7:00 p.m.');

  const winter = nextOneTimeClassSchedule({ now: new Date('2026-01-15T10:00:00Z') });
  assert.equal(winter.class_instant_iso, '2026-01-15T17:00:00.000Z');
  const winterSydney = buildClassTimeDisplay({
    classInstant: winter.class_instant,
    city: resolveOneTimeCitySelection({ city_id: 'sydney-nsw-au' }),
  });
  assert.match(winterSydney.recipient_local_time, /4:00 a\.m\./);
});

test('confirmation copy and outbox events protect the server-side class link alias', () => {
  const city = resolveOneTimeCitySelection({ city_id: 'lakewood-nj-us' });
  const schedule = nextOneTimeClassSchedule({ now: new Date('2026-07-12T10:00:00Z') });
  const email = buildOneTimeSignupConfirmationEmail({
    contactName: 'Example Family',
    city,
    classInstant: schedule.class_instant,
    zoomJoinUrl: 'https://join.example.test/one-time-class',
    reminderPreference: 'none',
  });
  assert.equal(email.from, 'One Time Mishnayos <info@onetimeonetime.com>');
  assert.equal(email.reply_to, 'info@onetimeonetime.com');
  assert.equal(email.subject, "You're signed up for Rabbi Scheller's 7 PM Mishnah class");
  assert.match(email.text, /You're signed up for Rabbi Eli Scheller's live Mishnah class/);
  assert.match(email.text, /7:00 p\.m\. Israel time/);
  assert.match(email.text, /Join the class:\nhttps:\/\/join\.example\.test\/one-time-class/);

  const events = buildOneTimeSignupOutboxEvents({
    productLeadId: 10,
    crmLeadId: 20,
    contactName: 'Example Family',
    signupAs: 'School',
    email: 'school@example.com',
    phone: '+15555550101',
    city,
    reminderPreference: 'both',
  });
  assert.deepEqual(events.map((event) => event.channel_key), [
    'email:one_time_signup_confirmation',
    'telegram:one_time_rabbi_operator',
    'whatsapp:one_time_signup_confirmation',
  ]);
  assert.ok(events.every((event) => event.payload.raw_join_url_in_payload === false));
  assert.equal(events.find((event) => event.channel_key === 'telegram:one_time_rabbi_operator').payload.zoom_url_included, false);
});

test('confirmation/reminder link handling and local-class fallback stay server-side and safe', () => {
  const city = resolveOneTimeCitySelection({ city_id: 'lakewood-nj-us' });
  const schedule = nextOneTimeClassSchedule({ now: new Date('2026-07-12T10:00:00Z') });

  assert.throws(
    () => buildOneTimeSignupConfirmationEmail({
      contactName: 'Example Family',
      city,
      classInstant: schedule.class_instant,
      zoomJoinUrl: '',
      reminderPreference: 'email',
    }),
    /join link is not configured/
  );
  assert.throws(
    () => buildOneTimeClassReminderMessage({
      city,
      classInstant: schedule.class_instant,
      zoomJoinUrl: 'http://unsafe.example.test/class',
    }),
    /join link is not configured/
  );

  const fallback = buildOneTimeClassReminderMessage({
    classInstant: schedule.class_instant,
    zoomJoinUrl: 'https://join.example.test/one-time-class',
  });
  assert.match(fallback, /Rabbi Scheller's Mishnah class starts in 30 minutes/);
  assert.match(fallback, /The class starts in 30 minutes - 7:00 p\.m\. Israel time\./);
  assert.match(fallback, /Israel time: 7:00 p\.m\./);
  assert.match(fallback, /Join Zoom:\nhttps:\/\/join\.example\.test\/one-time-class/);
});

test('no-reminder signup still queues confirmation and Rabbi alert without WhatsApp', () => {
  const city = resolveOneTimeCitySelection({ city_id: 'lakewood-nj-us' });
  const events = buildOneTimeSignupOutboxEvents({
    productLeadId: 91,
    crmLeadId: 92,
    contactName: 'No Reminder Family',
    signupAs: 'Family',
    email: 'operator@example.invalid',
    phone: '',
    city,
    reminderPreference: 'none',
  });
  assert.deepEqual(events.map((event) => event.channel_key), [
    'email:one_time_signup_confirmation',
    'telegram:one_time_rabbi_operator',
  ]);
  assert.ok(events.every((event) => event.payload.raw_join_url_in_payload === false));
  assert.ok(events.every((event) => event.payload.no_portal_onboarding === true));
  assert.ok(events.every((event) => event.payload.no_checkout === true));
  assert.ok(events.every((event) => event.payload.no_payment === true));
  assert.ok(events.every((event) => event.payload.no_access_granted === true));
});

test('Rabbi Telegram signup alert includes CRM context and never includes Zoom link data', () => {
  const alert = buildRabbiSignupTelegramAlert({
    contactName: 'Example School',
    signupAs: 'School',
    city: resolveOneTimeCitySelection({ city_id: 'london-england-gb' }),
    reminderPreference: 'email',
    crmLeadId: 4242,
    crmDeepLink: '/provider.html?admin_provider=one-time&section=crm&lead=4242',
  });
  assert.match(alert, /New One Time signup/);
  assert.match(alert, /Example School/);
  assert.match(alert, /Signing up as: School/);
  assert.match(alert, /City: London, United Kingdom/);
  assert.match(alert, /Reminders: Email reminders/);
  assert.match(alert, /CRM lead: 4242/);
  assert.match(alert, /section=crm&lead=4242/);
  assert.doesNotMatch(alert, /zoom|join\.|https?:\/\//i);
});

test('reminder idempotency and readiness gates are explicit', () => {
  const key = buildReminderIdempotencyKey({
    classDate: '2026-07-12',
    contactId: 42,
    channel: 'email',
    scheduleVersion: ONE_TIME_SCHEDULE_VERSION,
  });
  assert.equal(key, `2026-07-12:42:email:30m:${ONE_TIME_SCHEDULE_VERSION}`);

  const ready = oneTimeClassReminderEnvReadiness({
    ONE_TIME_CLASS_REMINDERS_ENABLED: 'true',
    ONE_TIME_CLASS_REMINDERS_CONFIRM: 'APPROVE_ONE_TIME_CLASS_REMINDERS',
    CRON_SECRET: 'cron-secret-value',
  });
  assert.equal(ready.ready, true);
  assert.equal(JSON.stringify(ready).includes('cron-secret-value'), false);
  const blocked = oneTimeClassReminderEnvReadiness({});
  assert.equal(blocked.ready, false);
  assert.match(blocked.blockers.join('\n'), /ONE_TIME_CLASS_REMINDERS_ENABLED/);

  const wapi = oneTimeWapiReminderEnvReadiness({
    ONE_TIME_WAPI_API_TOKEN: 'token',
    ONE_TIME_WAPI_API_BASE_URL: 'https://wapi.example.test',
    ONE_TIME_WHAPI_INSTANCE_ID: 'instance',
    ONE_TIME_WHAPI_PHONE: '+972500000000',
    ONE_TIME_WAPI_WEBHOOK_SECRET: 'secret',
    ONE_TIME_PUBLIC_WHATSAPP_NUMBER: '+972500000000',
    ONE_TIME_WHATSAPP_CLASS_LINK: 'https://join.example.test',
    ONE_TIME_WAPI_AUTO_REPLY_ENABLED: 'true',
    ONE_TIME_WAPI_AUTO_REPLY_CONFIRM: 'APPROVE_ONE_TIME_WAPI_AUTO_REPLY',
    ONE_TIME_PROVIDER_LEAD_BOT_MODE: 'live',
  });
  assert.equal(wapi.ready, true);
  assert.equal(wapi.qr_action_if_auth_expired, 'Rabbi Scheller must scan the Whapi channel QR from his WhatsApp phone.');
  assert.equal(JSON.stringify(wapi).includes('token'), false);
  assert.equal(JSON.stringify(wapi).includes('secret'), false);
});

test('server declares protected cron and local-class preview without portal/payment paths in the signup route', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const workflow = fs.readFileSync('src/lib/bna/one-time-signup-workflow.js', 'utf8');
  const start = server.indexOf("app.post(['/api/bna/product-leads', '/api/one-time/interest']");
  const end = server.indexOf("app.get('/api/bna/one-time/calendar'", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const route = server.slice(start, end);

  assert.match(server, /app\.get\(\['\/one-time\/signup', '\/one-time\/signup\/'\], sendOneTimeSignupPage\)/);
  assert.match(server, /app\.post\('\/api\/cron\/one-time\/class-reminders'/);
  assert.match(server, /buildReminderIdempotencyKey/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/local-class-reminder-preview'/);
  assert.match(server, /local_class_attendee/);
  assert.match(server, /zoom_mishnayos_class/);
  assert.match(server, /local_student/);
  assert.match(server, /oneTimeClassReminderEnvReadiness\(process\.env\)/);
  assert.match(server, /ONE_TIME_CLASS_ACTIVE/);
  assert.match(server, /class_paused_or_canceled/);
  assert.match(server, /oneTimeReminderSuppressionReason/);
  assert.match(server, /email_unsubscribed/);
  assert.match(server, /whatsapp_stop/);
  assert.match(server, /wrong_number/);
  assert.match(workflow, /ONE_TIME_CLASS_REMINDERS_CONFIRM/);
  assert.match(workflow, /APPROVE_ONE_TIME_CLASS_REMINDERS/);

  assert.doesNotMatch(route, /generateLoginToken|hashLoginToken|sendParentMagicLinkWhatsApp|createCheckout|stripe|grantAccess|accessGrant|password setup/i);
});

test('local-class preview blocks activation unless the scoped tag set resolves to exactly three contacts', () => {
  const rows = [
    { id: 101, parent_email: 'one@example.com', status: 'follow_up' },
    { id: 102, parent_email: 'two@example.com', status: 'follow_up' },
    { id: 103, parent_email: 'two@example.com', status: 'follow_up' },
  ];
  const preview = buildLocalClassSegmentPreview(rows);
  assert.equal(preview.expected_count, 3);
  assert.equal(preview.actual_count, 3);
  assert.equal(preview.valid_email_count, 3);
  assert.equal(preview.duplicate_count, 1);
  assert.equal(preview.status, 'ready_for_operator_personal_test_gate');

  const mismatch = buildLocalClassSegmentPreview(rows.slice(0, 2));
  assert.equal(mismatch.status, 'blocked_count_mismatch');

  const suppressed = buildLocalClassSegmentPreview([
    { id: 201, parent_email: 'active@example.invalid', status: 'follow_up' },
    { id: 202, parent_email: 'stop@example.invalid', unsubscribed: true, status: 'follow_up' },
    { id: 203, parent_email: 'archived@example.invalid', archived: true, status: 'archived' },
  ]);
  assert.equal(suppressed.actual_count, 3);
  assert.equal(suppressed.contacts.filter((contact) => contact.suppressed).length, 2);
});
