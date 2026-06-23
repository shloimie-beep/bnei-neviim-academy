const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const bridgePath = path.join(__dirname, '..', 'scripts', 'telegram-kimi-bridge.mjs');

function bridgeSource() {
  return fs.readFileSync(bridgePath, 'utf8');
}

test('Telegram bridge does not create per-task quick-action buttons', () => {
  const source = bridgeSource();

  assert.doesNotMatch(source, /callback_data:\s*`task:(mine|codex|kimi|urgent|done):/);
  assert.doesNotMatch(source, /callback_data:\s*['"]task:(mine|codex|kimi|urgent|done):/);
});

test('stale per-task quick-action callbacks cannot mutate tasks', () => {
  const source = bridgeSource();
  const start = source.indexOf("if (/^task:(mine|codex|kimi|urgent|done):\\d+$/.test(data))");
  const end = source.indexOf("const studentMatch", start);
  const retiredBlock = source.slice(start, end);

  assert.ok(start > 0, 'retired task quick-action callback block should exist');
  assert.ok(end > start, 'student match callback should follow retired task callback block');
  assert.match(retiredBlock, /Task quick actions were retired/);
  assert.doesNotMatch(retiredBlock, /\/api\/bna\/tasks/);
  assert.doesNotMatch(retiredBlock, /appendAgentTaskLedger/);
  assert.doesNotMatch(retiredBlock, /appendAgentChangelog/);
});
