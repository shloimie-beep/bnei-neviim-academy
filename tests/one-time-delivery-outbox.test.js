const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ONE_TIME_OUTBOX_CHANNEL_KEYS,
  buildOneTimeOutboxDeliveryRequest,
  failedOutboxStatus,
  isOneTimeOutboxChannel,
  nextRetryAt,
  publicOutboxDeliveryResult,
} = require('../src/lib/bna/one-time-delivery-outbox');
const {
  nextOneTimeClassSchedule,
  resolveOneTimeCitySelection,
} = require('../src/lib/bna/one-time-signup-workflow');

const classJoinUrl = 'https://join.example.invalid/one-time-class';
const schedule = nextOneTimeClassSchedule({ now: new Date('2026-07-12T10:00:00Z') });
const lakewood = resolveOneTimeCitySelection({ city_id: 'lakewood-nj-us' });

test('One Time delivery outbox scopes only the expected channel keys', () => {
  assert.deepEqual(ONE_TIME_OUTBOX_CHANNEL_KEYS, [
    'email:one_time_signup_confirmation',
    'whatsapp:one_time_signup_confirmation',
    'telegram:one_time_rabbi_operator',
    'email:one_time_class_reminder',
    'whatsapp:one_time_class_reminder',
  ]);
  assert.equal(isOneTimeOutboxChannel('email:one_time_signup_confirmation'), true);
  assert.equal(isOneTimeOutboxChannel('email:bna_payment_reminder'), false);
});

test('signup confirmation email request resolves CRM contact data and redacts public result', () => {
  const outboxRow = {
    id: 11,
    delivery_key: 'one-time:signup-confirmation-email:92:v1',
    channel_key: 'email:one_time_signup_confirmation',
    payload: {
      crm_lead_id: 92,
      contact_name: 'Example Family',
      city: lakewood,
      reminder_preference: 'none',
      class_instant_iso: schedule.class_instant_iso,
      raw_join_url_in_payload: false,
    },
  };
  const request = buildOneTimeOutboxDeliveryRequest({
    outboxRow,
    contact: {
      parent_name: 'Example Family',
      parent_email: 'Family@Example.invalid',
    },
    classJoinUrl,
  });
  assert.equal(request.transport, 'email');
  assert.equal(request.kind, 'signup_confirmation');
  assert.equal(request.provider, 'resend');
  assert.equal(request.to, 'family@example.invalid');
  assert.equal(request.subject, "You're signed up for Rabbi Scheller's 7 PM Mishnah class");
  assert.match(request.text, /You're signed up for Rabbi Eli Scheller's live Mishnah class/);
  assert.match(request.text, /7:00 p\.m\. Israel time/);
  assert.match(request.text, /https:\/\/join\.example\.invalid\/one-time-class/);

  const publicResult = publicOutboxDeliveryResult({
    outboxRow,
    request,
    status: 'sent',
    providerResult: { data: { id: 'em_123' } },
    attempts: 1,
  });
  assert.equal(publicResult.provider_message_id, 'em_123');
  assert.equal(publicResult.raw_join_url_returned, false);
  assert.equal(publicResult.message_body_returned, false);
  assert.equal(JSON.stringify(publicResult).includes(classJoinUrl), false);

  const publicError = publicOutboxDeliveryResult({
    outboxRow,
    request,
    status: 'failed',
    error: new Error(`Provider failed for Family@Example.invalid at ${classJoinUrl} and +1 732 555 0101`),
    attempts: 1,
  });
  assert.equal(publicError.raw_join_url_returned, false);
  assert.equal(publicError.message_body_returned, false);
  assert.equal(JSON.stringify(publicError).includes(classJoinUrl), false);
  assert.equal(JSON.stringify(publicError).includes('Family@Example.invalid'), false);
  assert.equal(JSON.stringify(publicError).includes('732 555'), false);

  assert.throws(
    () => buildOneTimeOutboxDeliveryRequest({ outboxRow, contact: { parent_email: 'a@example.invalid' }, classJoinUrl: '' }),
    /join link is not configured/
  );
});

test('class reminder WhatsApp request uses phone recipient and worldwide class instant', () => {
  const request = buildOneTimeOutboxDeliveryRequest({
    outboxRow: {
      id: 21,
      delivery_key: 'one-time:class-reminder:2026-07-12:92:whatsapp:30m:v1',
      channel_key: 'whatsapp:one_time_class_reminder',
      payload: {
        contact_id: 92,
        city: lakewood,
        class_instant_iso: schedule.class_instant_iso,
        reminder_preference: 'whatsapp',
      },
    },
    contact: {
      parent_phone: '+1 (732) 555-0101',
    },
    classJoinUrl,
  });
  assert.equal(request.transport, 'whatsapp');
  assert.equal(request.kind, 'class_reminder');
  assert.equal(request.provider, 'one_time_wapi');
  assert.equal(request.to, '17325550101');
  assert.match(request.text, /Hi, this is Rabbi Scheller's digital assistant\./);
  assert.match(request.text, /awesome class today/);
  assert.match(request.text, /Your local time: .*12:00 p\.m\./);
  assert.match(request.text, /Israel time: 7:00 p\.m\./);
  assert.match(request.text, /Join Zoom:\nhttps:\/\/join\.example\.invalid\/one-time-class/);
});

test('Rabbi Telegram request targets the role alias and blocks Zoom data', () => {
  const outboxRow = {
    id: 31,
    delivery_key: 'one-time:rabbi-signup-alert:92:v1',
    channel_key: 'telegram:one_time_rabbi_operator',
    payload: {
      role_alias: 'one_time_rabbi_operator',
      text: [
        'New One Time signup',
        '- Contact: Example Family',
        '- Signing up as: Family',
        '- City: Lakewood, United States',
        '- Reminders: Email reminders',
        '- CRM lead: 92',
        '- Review: /provider.html?admin_provider=one-time&section=crm&lead=92',
      ].join('\n'),
    },
  };
  const request = buildOneTimeOutboxDeliveryRequest({ outboxRow, classJoinUrl });
  assert.equal(request.transport, 'telegram');
  assert.equal(request.provider, 'one_time_rabbi_telegram');
  assert.equal(request.role_alias, 'one_time_rabbi_operator');
  assert.match(request.text, /New One Time signup/);
  assert.doesNotMatch(request.text, /zoom|https?:\/\//i);

  assert.throws(
    () => buildOneTimeOutboxDeliveryRequest({
      outboxRow: {
        ...outboxRow,
        payload: { text: `New One Time signup\nJoin Zoom:\n${classJoinUrl}` },
      },
      classJoinUrl,
    }),
    /must not include the class join link/
  );
});

test('delivery retry status and next-at scheduling are deterministic', () => {
  const now = new Date('2026-07-12T10:00:00Z');
  assert.equal(failedOutboxStatus({ attempts: 1, maxAttempts: 5 }), 'failed');
  assert.equal(failedOutboxStatus({ attempts: 5, maxAttempts: 5 }), 'dead_lettered');
  assert.equal(nextRetryAt({ now, attempts: 0 }), '2026-07-12T10:05:00.000Z');
  assert.equal(nextRetryAt({ now, attempts: 1 }), '2026-07-12T10:10:00.000Z');
});
