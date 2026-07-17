const test = require('node:test');
const assert = require('node:assert/strict');
const { renderTelegramAlert } = require('../src/telegram/alert-renderer');
const { FakeTelegramTransport } = require('../src/telegram/fake-transport');

const alert = {
  notification_type: 'control.case.alert.v1',
  case_ref: 'cp_1234567890abcdef1234567890',
  product: 'one_time',
  severity: 'sev2',
  queue: 'support_ops',
  status: 'new',
  opened_at: '2026-07-17T08:00:00Z',
  control_plane_url: 'https://control.bnei-neviim.com/cases/cp_1234567890abcdef1234567890',
};

test('Telegram renderer emits alert text and one control-plane link only', () => {
  const rendered = renderTelegramAlert(alert);
  assert.match(rendered.text, /Control Plane case alert/);
  assert.doesNotMatch(rendered.text, /assign|close|resolve|decision/i);
  assert.deepEqual(rendered.reply_markup.inline_keyboard, [[{
    text: 'Open case',
    url: alert.control_plane_url,
  }]]);
});

test('Telegram renderer rejects decision payloads and product links', () => {
  assert.throws(() => renderTelegramAlert({ ...alert, action: 'assign_queue' }), /unexpected Telegram alert field action/);
  assert.throws(() => renderTelegramAlert({
    ...alert,
    control_plane_url: 'https://join.onetimeonetime.com/support/cases/case_01JCONTROLPLANEOT000001',
  }), /origin/);
});

test('Telegram transport is disabled by default', async () => {
  const transport = new FakeTelegramTransport();
  const result = await transport.send(renderTelegramAlert(alert));
  assert.equal(result.sent, false);
  assert.equal(result.reason, 'telegram_delivery_disabled');
});
