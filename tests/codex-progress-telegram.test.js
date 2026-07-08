const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

async function loadModule() {
  return import(pathToFileURL(path.join(__dirname, '..', 'scripts', 'send-codex-progress-telegram.mjs')).href);
}

test('Codex Telegram progress formatter uses brief bullet structure', async () => {
  const { formatCodexProgressMessage, parseProgressArgs } = await loadModule();
  const args = parseProgressArgs([
    '--fixed',
    'Registered the notification repair path.',
    '--verified=Tests pass.',
    '--blocked',
    'WAPI credentials are missing.',
    '--next',
    'Run the One Time visual audit.',
    '--packet',
    'PKT-20260707-032',
  ]);
  const message = formatCodexProgressMessage(args);

  assert.match(message, /^Codex update\n- Done: Registered the notification repair path\./);
  assert.match(message, /\n- Verified: Tests pass\./);
  assert.match(message, /\n- Blocked: WAPI credentials are missing\./);
  assert.match(message, /\n- Next: Run the One Time visual audit\./);
  assert.match(message, /\n- Packet: PKT-20260707-032/);
  assert.equal(args.dryRun, true);
  assert.equal(args.send, false);
});

test('Codex Telegram progress rejects secret-shaped content', async () => {
  const { assertSafeTelegramProgressText, formatCodexProgressMessage } = await loadModule();
  assert.throws(
    () => assertSafeTelegramProgressText('token=ghp_aaaaaaaaaaaaaaaaaaaaaaaa'),
    /Refusing to send Telegram progress update/,
  );
  assert.throws(
    () => formatCodexProgressMessage({ fixed: 'ok', verified: 'ok', next: '' }),
    /requires --fixed, --verified, and --next/,
  );
});

test('Codex Telegram progress send path does not expose chat target in result', async () => {
  const { sendTelegramProgress } = await loadModule();
  const calls = [];
  const result = await sendTelegramProgress(
    { token: 'test-token-for-fetch-only', chatId: '123456789' },
    'Codex update\n- Done: one\n- Verified: two\n- Next: three',
    {
      fetchImpl: async (url, options) => {
        calls.push({ url, options });
        return {
          ok: true,
          status: 200,
          async json() {
            return { ok: true, result: { message_id: 42 } };
          },
        };
      },
    },
  );

  assert.deepEqual(result, { ok: true, message_id: 42 });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /sendMessage$/);
  assert.doesNotMatch(JSON.stringify(result), /123456789/);
});
