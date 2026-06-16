const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createBufferDraftPost,
  scheduleBufferPost,
  testBufferConnection,
} = require('../src/lib/integrations/buffer-client');

function mockResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

test('missing Buffer key returns a safe setup blocker', async () => {
  const readiness = await testBufferConnection({
    config: { apiKey: '', apiBase: 'https://api.buffer.com', organizationId: '' },
    fetchImpl: async () => {
      throw new Error('fetch should not run');
    },
  });
  assert.equal(readiness.configured, false);
  assert.equal(readiness.connected, false);
  assert.match(readiness.blocker, /BUFFER_API_KEY is not configured/);
});

test('invalid Buffer API response does not leak the key', async () => {
  const readiness = await testBufferConnection({
    config: { apiKey: 'super-secret-buffer-key', apiBase: 'https://api.buffer.test', organizationId: 'org1' },
    fetchImpl: async () => mockResponse(401, { errors: [{ message: 'bad key super-secret-buffer-key' }] }),
  });
  assert.equal(readiness.configured, true);
  assert.equal(readiness.connected, false);
  assert.doesNotMatch(readiness.blocker, /super-secret-buffer-key/);
});

test('createBufferDraftPost uses draft mode and does not schedule or publish', async () => {
  const calls = [];
  const result = await createBufferDraftPost({
    channelIds: ['channel1'],
    text: 'Draft copy',
  }, {
    config: { apiKey: 'buffer-key', apiBase: 'https://api.buffer.test', organizationId: 'org1' },
    fetchImpl: async (url, options) => {
      calls.push(JSON.parse(options.body));
      return mockResponse(200, {
        data: {
          createPost: {
            post: {
              id: 'post1',
              status: 'draft',
              text: 'Draft copy',
              channel: { id: 'channel1', service: 'facebook', displayName: 'BNA' },
            },
          },
        },
      });
    },
  });
  assert.equal(result.draft, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].variables.input.saveToDraft, true);
  assert.equal(calls[0].variables.input.mode, 'addToQueue');
  assert.equal(calls[0].variables.input.dueAt, undefined);
});

test('scheduleBufferPost requires explicit confirmation and uses customScheduled payload when confirmed', async () => {
  await assert.rejects(
    () => scheduleBufferPost({
      channelIds: ['channel1'],
      text: 'Scheduled copy',
      scheduledAt: '2026-06-16T10:00:00.000Z',
    }, {
      config: { apiKey: 'buffer-key', apiBase: 'https://api.buffer.test', organizationId: 'org1' },
      fetchImpl: async () => mockResponse(200, {}),
    }),
    /Explicit confirmation/
  );

  const calls = [];
  const result = await scheduleBufferPost({
    channelIds: ['channel1'],
    text: 'Scheduled copy',
    scheduledAt: '2026-06-16T10:00:00.000Z',
    confirmation: { confirmed: true },
  }, {
    config: { apiKey: 'buffer-key', apiBase: 'https://api.buffer.test', organizationId: 'org1' },
    fetchImpl: async (url, options) => {
      calls.push(JSON.parse(options.body));
      return mockResponse(200, { data: { createPost: { post: { id: 'post2', status: 'buffer' } } } });
    },
  });
  assert.equal(result.scheduled, true);
  assert.equal(calls[0].variables.input.saveToDraft, false);
  assert.equal(calls[0].variables.input.mode, 'customScheduled');
  assert.equal(calls[0].variables.input.dueAt, '2026-06-16T10:00:00.000Z');
});
