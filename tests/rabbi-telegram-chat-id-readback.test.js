const assert = require('node:assert/strict');
const test = require('node:test');

const {
  extractTelegramChatCandidates,
  maskIdentifier,
  redactChatIdCandidates,
  summarizeChatIdReadback,
} = require('../src/lib/bna/telegram-chat-id-readback');

test('maskIdentifier keeps only enough chat id detail for operator matching', () => {
  assert.equal(maskIdentifier('8202155026'), '******5026');
  assert.equal(maskIdentifier('-1001234567890'), '-*********7890');
  assert.equal(maskIdentifier('123'), '***');
});

test('extractTelegramChatCandidates reads Telegram updates without raw text by default', () => {
  const candidates = extractTelegramChatCandidates([
    {
      update_id: 101,
      message: {
        message_id: 7,
        date: 1760000000,
        text: '/start token=secret',
        chat: {
          id: 8202155026,
          type: 'private',
          username: 'operator',
          first_name: 'Shloimie',
        },
      },
    },
    {
      update_id: 102,
      callback_query: {
        message: {
          message_id: 8,
          chat: {
            id: -1001234567890,
            type: 'supergroup',
            title: 'One Time Team',
          },
        },
      },
    },
  ]);

  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].chat_id, '8202155026');
  assert.equal(candidates[0].chat_id_masked, '******5026');
  assert.equal(candidates[0].text_kind, 'start_command');
  assert.equal(candidates[0].text_preview, undefined);
  assert.equal(candidates[1].chat_id_masked, '-*********7890');
  assert.equal(candidates[1].source, 'callback_query.message');
});

test('redactChatIdCandidates removes full chat ids from console-safe output', () => {
  const candidates = extractTelegramChatCandidates([
    {
      update_id: 201,
      message: {
        message_id: 9,
        text: 'hello',
        chat: { id: 777777777, type: 'private' },
      },
    },
  ]);
  const redacted = redactChatIdCandidates(candidates);
  assert.equal(redacted[0].chat_id, undefined);
  assert.equal(redacted[0].chat_id_masked, '*****7777');
});

test('summarizeChatIdReadback reports candidate and start command counts', () => {
  const candidates = extractTelegramChatCandidates([
    { update_id: 1, message: { text: '/start', chat: { id: 1 } } },
    { update_id: 2, message: { text: 'hello', chat: { id: 1 } } },
    { update_id: 3, message: { text: '/start', chat: { id: 2 } } },
  ]);
  assert.deepEqual(summarizeChatIdReadback(candidates), {
    candidate_count: 3,
    unique_chat_count: 2,
    start_command_count: 2,
    has_candidates: true,
  });
});
