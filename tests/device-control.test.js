const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DEVICE_ACCESS_STATES,
  createDeviceControlProvider,
  deviceAccessStateLabel,
  normalizeDeviceAccessState,
  normalizeDurationMinutes,
} = require('../src/lib/bna/device-control');

test('device access states normalize to the five app-side states', () => {
  assert.equal(normalizeDeviceAccessState('Locked'), DEVICE_ACCESS_STATES.LOCKED);
  assert.equal(normalizeDeviceAccessState('accountability only'), DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY);
  assert.equal(normalizeDeviceAccessState('Approved Access'), DEVICE_ACCESS_STATES.APPROVED_ACCESS);
  assert.equal(normalizeDeviceAccessState('manual-override'), DEVICE_ACCESS_STATES.MANUAL_OVERRIDE);
  assert.equal(normalizeDeviceAccessState('unknown'), DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY);
  assert.equal(deviceAccessStateLabel('expired'), 'Expired');
});

test('mock provider records actions without real device calls', async () => {
  const provider = createDeviceControlProvider('mock');
  const result = await provider.unlockDevice(42, 75, 'Wake Up On Time approved');

  assert.equal(result.ok, true);
  assert.equal(result.provider, 'mock');
  assert.equal(result.real_device_call, false);
  assert.equal(result.action, 'unlockDevice');
  assert.equal(result.resulting_status, DEVICE_ACCESS_STATES.APPROVED_ACCESS);
  assert.equal(result.duration_minutes, 75);
  assert.match(result.message, /No real tablet/);
});

test('real providers are blocked until hardware and credentials are confirmed', () => {
  assert.throws(
    () => createDeviceControlProvider('headwind'),
    /Only the mock provider may run/
  );
});

test('duration is bounded to a one-day maximum', () => {
  assert.equal(normalizeDurationMinutes(''), 60);
  assert.equal(normalizeDurationMinutes(0), 60);
  assert.equal(normalizeDurationMinutes(20.4), 20);
  assert.equal(normalizeDurationMinutes(99999), 1440);
});
