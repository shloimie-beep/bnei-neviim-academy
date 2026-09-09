const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  LIFE_SKILLS_WAPI_REPLY_CONFIRM,
  LIFE_SKILLS_WAPI_REPLY_EN,
  LIFE_SKILLS_WAPI_REPLY_HE,
  buildLifeSkillsWapiReplyReadiness,
  lifeSkillsWapiReplyBody,
  lifeSkillsWapiReplyInboundBlockers,
  lifeSkillsWapiReplyLanguage,
} = require('../src/lib/bna/life-skills-wapi-auto-reply');

test('uses the exact approved bilingual launch greetings', () => {
  assert.equal(LIFE_SKILLS_WAPI_REPLY_HE, 'שלום! איך אפשר לעזור?');
  assert.equal(LIFE_SKILLS_WAPI_REPLY_EN, 'Hi! How can I help?');
  assert.equal(lifeSkillsWapiReplyLanguage('שלום, אשמח לקבל פרטים'), 'he');
  assert.equal(lifeSkillsWapiReplyLanguage('Hi, I would like details'), 'en');
  assert.equal(lifeSkillsWapiReplyBody('שלום'), LIFE_SKILLS_WAPI_REPLY_HE);
  assert.equal(lifeSkillsWapiReplyBody('Hello'), LIFE_SKILLS_WAPI_REPLY_EN);
});

test('fails closed until the exact live flags and provider binding are present', () => {
  const blocked = buildLifeSkillsWapiReplyReadiness({ env: {} });
  assert.equal(blocked.ready, false);
  assert.ok(blocked.blockers.includes('LIFE_SKILLS_WAPI_AUTO_REPLY_ENABLED not enabled'));
  assert.ok(blocked.blockers.includes('WHAPI_CHANNEL_ID missing'));

  const ready = buildLifeSkillsWapiReplyReadiness({
    env: {
      LIFE_SKILLS_WAPI_AUTO_REPLY_ENABLED: 'true',
      LIFE_SKILLS_WAPI_AUTO_REPLY_CONFIRM: LIFE_SKILLS_WAPI_REPLY_CONFIRM,
      WHAPI_PHONE: '+972 53-493-2631',
      WHAPI_CHANNEL_ID: 'WOLVRN-YRJVR',
    },
    tokenPresent: true,
    webhookSecretPresent: true,
  });
  assert.equal(ready.ready, true);
  assert.equal(ready.sender_bound, true);
});

test('never overlaps One Time and suppresses non-customer webhook events', () => {
  const readiness = {
    ready: true,
    blockers: [],
    channel_id: 'WOLVRN-YRJVR',
  };
  assert.deepEqual(lifeSkillsWapiReplyInboundBlockers({
    channelId: 'WOLVRN-YRJVR',
    messageText: 'Hello',
    chatId: '972501234567@s.whatsapp.net',
  }, readiness), []);
  assert.ok(lifeSkillsWapiReplyInboundBlockers({
    channelId: 'wrong-channel',
    messageStatus: 'delivered',
    fromMe: true,
    chatId: '123@g.us',
  }, readiness).includes('provider_channel_mismatch'));
  assert.ok(buildLifeSkillsWapiReplyReadiness({ env: {}, oneTimeScope: true }).blockers.includes('one_time_scope_uses_separate_responder'));
});

test('server persists an idempotent 14-day claim before sending through the actual WAPI channel', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.match(server, /metadata->>'auto_reply_type' = 'life_skills_first_contact_ack'/);
  assert.match(server, /occurred_at >= NOW\(\) - \(\$4::text \|\| ' days'\)::interval/);
  assert.match(server, /pg_advisory_xact_lock\(hashtext\(\$1\)\).*life-skills-first-contact-ack/s);
  assert.match(server, /claimLifeSkillsWapiAutoReplyAttempt[\s\S]+sendWapiTextMessage/);
  assert.match(server, /!isOneTimeWapiScope\(webhookScope\)[\s\S]+maybeSendLifeSkillsWapiAutoReply/);
});
