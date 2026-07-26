const assert = require('assert');
const test = require('node:test');

const {
  createOneTimeRabbiProviderAdapter,
  handleTelegramWebhook,
  providerReadiness,
} = require('../src/lib/bna/one-time-rabbi-provider-adapter');

const env = {
  TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER: 'dedicated-token',
  TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER: 'private-chat',
  ONE_TIME_RABBI_TELEGRAM_WEBHOOK_SECRET: 'signed-secret',
  ONE_TIME_GHL_PRIVATE_INTEGRATION_TOKEN: 'pit-token',
  ONE_TIME_GHL_LOCATION_ID: 'location',
  ONE_TIME_RABBI_SYNTHETIC_CONTACT_ID: 'synthetic-contact',
  ONE_TIME_RABBI_CONSUMER_ENABLED: '1',
  ONE_TIME_RABBI_SYNTHETIC_ONLY: '1',
};

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

test('provider readiness requires the dedicated bot and synthetic/private gates', () => {
  assert.equal(providerReadiness(env).ready, true);
  const genericOnly = providerReadiness({
    TELEGRAM_BOT_TOKEN: 'must-not-be-used',
    ONE_TIME_HIGHLEVEL_ACCESS_TOKEN: 'must-not-be-used',
    HIGHLEVEL_LOCATION_ID: 'must-not-be-used',
  });
  assert.equal(genericOnly.ready, false);
  assert.ok(genericOnly.blockers.includes('dedicated_rabbi_telegram_token_absent'));
  assert.ok(genericOnly.blockers.includes('one_time_ghl_pit_absent'));
});

test('real GHL adapter saves and reads back one synthetic draft idempotently without sending', async () => {
  const calls = [];
  const row = {
    question_ref: 'TQ-safe', opportunity_id: 'opp', contact_id: 'synthetic-contact', pipeline_id: 'pipe', stage_id: 'stage',
    title: 'Synthetic Torah question', status: 'assigned', synthetic: true, draft_note_id: null, draft_sha256: null,
  };
  const repository = {
    getQuestion: async () => row,
    saveDraftRef: async (questionRef, saved) => Object.assign(row, { status: 'draft_saved', draft_note_id: saved.noteId, draft_sha256: saved.draftSha256, audit_id: saved.auditId }),
    recordAudit: async (event) => event,
  };
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, method: options.method || 'GET', body: options.body || '' });
    if (String(url).endsWith('/notes') && options.method === 'POST') return jsonResponse({ note: { id: 'note-1' } }, 201);
    if (String(url).endsWith('/notes/note-1')) return jsonResponse({ note: { id: 'note-1' } });
    throw new Error('unexpected request');
  };
  const adapter = createOneTimeRabbiProviderAdapter({ repository, env, fetchImpl });
  const first = await adapter.saveDraft('TQ-safe', { text: 'Synthetic rabbi-authored draft.' });
  const second = await adapter.saveDraft('TQ-safe', { text: 'Synthetic rabbi-authored draft.' });
  assert.equal(first.status, 'saved_readback');
  assert.equal(second.status, 'idempotent_readback');
  assert.equal(first.customer_message_sent, false);
  assert.equal(first.local_customer_transcript_created, false);
  assert.equal(calls.filter((call) => call.method === 'POST').length, 1);
  assert.equal(calls.filter((call) => call.method === 'GET').length, 2);
});

test('Telegram webhook enforces signature, private chat, consumer lease and update dedupe', async () => {
  const claimed = new Set();
  const audits = [];
  const sent = [];
  const repository = {
    claimConsumer: async () => true,
    claimUpdate: async ({ updateId }) => claimed.has(updateId) ? false : (claimed.add(updateId), true),
    recordAudit: async (event) => (audits.push(event), event),
  };
  const adapter = {
    listAssignedQuestions: async () => [{ question_ref: 'TQ-safe', status: 'assigned' }],
    sendOperatorMessage: async (text) => sent.push(text),
  };
  const update = { update_id: 501, message: { message_id: 9, date: 2000, text: '/questions', chat: { id: 'private-chat', type: 'private' } } };
  await assert.rejects(
    handleTelegramWebhook({ update, headers: {}, repository, adapter, env, nowMs: 2000 * 1000 }),
    /telegram_webhook_signature_invalid/
  );
  const first = await handleTelegramWebhook({ update, headers: { 'x-telegram-bot-api-secret-token': 'signed-secret' }, repository, adapter, env, nowMs: 2000 * 1000 });
  const duplicate = await handleTelegramWebhook({ update, headers: { 'x-telegram-bot-api-secret-token': 'signed-secret' }, repository, adapter, env, nowMs: 2000 * 1000 });
  assert.equal(first.outcome, 'listed');
  assert.equal(duplicate.outcome, 'duplicate_replay_rejected');
  assert.equal(sent.length, 1);
  assert.equal(audits.length, 1);
  assert.equal(first.customer_messages_sent, 0);
});

test('Telegram webhook rejects stale updates and non-private/non-allowlisted chats', async () => {
  const repository = { claimConsumer: async () => true, claimUpdate: async () => true };
  const adapter = {};
  const headers = { 'x-telegram-bot-api-secret-token': 'signed-secret' };
  await assert.rejects(handleTelegramWebhook({
    update: { update_id: 1, message: { message_id: 1, date: 1, text: '/questions', chat: { id: 'private-chat', type: 'private' } } },
    headers, repository, adapter, env, nowMs: 10 * 60 * 1000,
  }), /telegram_update_replay_window_rejected/);
  await assert.rejects(handleTelegramWebhook({
    update: { update_id: 2, message: { message_id: 2, date: 600, text: '/questions', chat: { id: 'other', type: 'group' } } },
    headers, repository, adapter, env, nowMs: 600 * 1000,
  }), /telegram_private_chat_not_allowed/);
});
