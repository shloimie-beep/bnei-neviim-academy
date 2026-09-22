const assert = require('node:assert/strict');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

const scriptUrl = pathToFileURL(
  path.join(__dirname, '..', 'scripts', 'run-one-time-delivery-outbox-cron.mjs'),
).href;

async function loadRunner() {
  return import(scriptUrl);
}

function recorder() {
  const chunks = [];
  return {
    stream: {
      write(chunk) {
        chunks.push(String(chunk));
        return true;
      },
    },
    text() {
      return chunks.join('');
    },
    json() {
      return JSON.parse(this.text());
    },
  };
}

test('missing CRON_SECRET fails before fetch', async () => {
  const { runOneTimeDeliveryOutboxCron } = await loadRunner();
  let called = false;
  const stderr = recorder();
  const result = await runOneTimeDeliveryOutboxCron({
    env: {},
    fetchImpl: async () => {
      called = true;
      throw new Error('should not fetch');
    },
    stderr: stderr.stream,
    stdout: recorder().stream,
  });

  assert.equal(result.exitCode, 1);
  assert.equal(called, false);
  assert.equal(stderr.json().status, 'configuration_error');
});

test('posts exact URL, method, header, and body', async () => {
  const { runOneTimeDeliveryOutboxCron } = await loadRunner();
  const stdout = recorder();
  const calls = [];
  const result = await runOneTimeDeliveryOutboxCron({
    env: {
      CRON_SECRET: 'fixture-secret',
      ONE_TIME_DELIVERY_OUTBOX_URL: 'https://join.onetimeonetime.com/api/cron/one-time/delivery-outbox',
    },
    stdout: stdout.stream,
    stderr: recorder().stream,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            status: 'ok',
            success: true,
            processed_count: 2,
            sent_count: 1,
            failed_count: 0,
            dead_lettered_count: 0,
            due_count: 0,
            external_send_performed: true,
            recipient: 'family@example.invalid',
            message_body: 'secret body',
            class_url: 'https://zoom.us/j/secret',
          };
        },
      };
    },
  });

  assert.equal(result.exitCode, 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://join.onetimeonetime.com/api/cron/one-time/delivery-outbox');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers['x-cron-secret'], 'fixture-secret');
  assert.equal(calls[0].options.headers['content-type'], 'application/json');
  assert.equal(calls[0].options.body, '{"dry_run":false,"limit":25}');
  assert.doesNotMatch(calls[0].url, /class-reminders/);

  const text = stdout.text();
  assert.match(text, /"status": "ok"/);
  assert.match(text, /"external_send_performed": true/);
  assert.doesNotMatch(text, /family@example|secret body|zoom\.us|fixture-secret/i);
});

test('timeout aborts and exits nonzero', async () => {
  const { runOneTimeDeliveryOutboxCron } = await loadRunner();
  const stderr = recorder();
  const result = await runOneTimeDeliveryOutboxCron({
    env: { CRON_SECRET: 'fixture-secret' },
    timeoutMs: 5,
    stdout: recorder().stream,
    stderr: stderr.stream,
    fetchImpl: async (_url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        }, { once: true });
      }),
  });

  assert.equal(result.exitCode, 1);
  assert.equal(stderr.json().status, 'timeout');
});

test('non-2xx response fails redacted', async () => {
  const { runOneTimeDeliveryOutboxCron } = await loadRunner();
  const stderr = recorder();
  const result = await runOneTimeDeliveryOutboxCron({
    env: { CRON_SECRET: 'fixture-secret' },
    stdout: recorder().stream,
    stderr: stderr.stream,
    fetchImpl: async () => ({ ok: false, status: 503 }),
  });

  assert.equal(result.exitCode, 1);
  assert.equal(stderr.json().status, 'http_503');
});

test('invalid JSON fails redacted', async () => {
  const { runOneTimeDeliveryOutboxCron } = await loadRunner();
  const stderr = recorder();
  const result = await runOneTimeDeliveryOutboxCron({
    env: { CRON_SECRET: 'fixture-secret' },
    stdout: recorder().stream,
    stderr: stderr.stream,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() {
        throw new Error('bad json with family@example.invalid');
      },
    }),
  });

  assert.equal(result.exitCode, 1);
  assert.equal(stderr.json().status, 'invalid_json');
  assert.doesNotMatch(stderr.text(), /family@example/i);
});

test('application success false fails', async () => {
  const { runOneTimeDeliveryOutboxCron } = await loadRunner();
  const stdout = recorder();
  const result = await runOneTimeDeliveryOutboxCron({
    env: { CRON_SECRET: 'fixture-secret' },
    stdout: stdout.stream,
    stderr: recorder().stream,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() {
        return {
          status: 'ok',
          success: false,
          processed_count: 0,
          sent_count: 0,
          failed_count: 1,
          dead_lettered_count: 0,
          due_count: 1,
          external_send_performed: false,
        };
      },
    }),
  });

  assert.equal(result.exitCode, 1);
  assert.equal(stdout.json().success, false);
});
