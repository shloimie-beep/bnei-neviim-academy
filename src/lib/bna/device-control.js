const DEVICE_ACCESS_STATES = {
  LOCKED: 'locked',
  ACCOUNTABILITY_ONLY: 'accountability_only',
  APPROVED_ACCESS: 'approved_access',
  EXPIRED: 'expired',
  MANUAL_OVERRIDE: 'manual_override',
};

const DEVICE_ACCESS_STATE_VALUES = new Set(Object.values(DEVICE_ACCESS_STATES));

const DEVICE_ACCESS_STATE_LABELS = {
  [DEVICE_ACCESS_STATES.LOCKED]: 'Locked',
  [DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY]: 'Accountability Only',
  [DEVICE_ACCESS_STATES.APPROVED_ACCESS]: 'Approved Access',
  [DEVICE_ACCESS_STATES.EXPIRED]: 'Expired',
  [DEVICE_ACCESS_STATES.MANUAL_OVERRIDE]: 'Manual Override',
};

function normalizeDeviceAccessState(value, fallback = DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (DEVICE_ACCESS_STATE_VALUES.has(normalized)) return normalized;
  if (normalized === 'unlock' || normalized === 'unlocked' || normalized === 'approved') {
    return DEVICE_ACCESS_STATES.APPROVED_ACCESS;
  }
  if (normalized === 'accountability' || normalized === 'accountability_mode') {
    return DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY;
  }
  return DEVICE_ACCESS_STATE_VALUES.has(fallback) ? fallback : DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY;
}

function deviceAccessStateLabel(value) {
  const state = normalizeDeviceAccessState(value);
  return DEVICE_ACCESS_STATE_LABELS[state] || DEVICE_ACCESS_STATE_LABELS[DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY];
}

function normalizeDurationMinutes(value, fallback = 60) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.max(1, Math.min(24 * 60, Math.round(number)));
}

function mockProviderResult({ action, deviceId, resultingStatus, reason, durationMinutes = null }) {
  return {
    ok: true,
    provider: 'mock',
    action,
    device_id: String(deviceId || ''),
    resulting_status: normalizeDeviceAccessState(resultingStatus),
    duration_minutes: durationMinutes === null ? null : normalizeDurationMinutes(durationMinutes),
    reason: String(reason || '').trim(),
    real_device_call: false,
    message: 'Mock provider recorded the requested device-control state. No real tablet, MDM, kiosk, QStudio, or Qustodio call was made.',
    recorded_at: new Date().toISOString(),
  };
}

class MockDeviceControlProvider {
  constructor(options = {}) {
    this.providerKey = 'mock';
    this.options = options;
  }

  async lockDevice(deviceId, reason = '') {
    return mockProviderResult({
      action: 'lockDevice',
      deviceId,
      resultingStatus: DEVICE_ACCESS_STATES.LOCKED,
      reason,
    });
  }

  async unlockDevice(deviceId, durationMinutes = 60, reason = '') {
    return mockProviderResult({
      action: 'unlockDevice',
      deviceId,
      resultingStatus: DEVICE_ACCESS_STATES.APPROVED_ACCESS,
      durationMinutes,
      reason,
    });
  }

  async setAccountabilityOnly(deviceId, reason = '') {
    return mockProviderResult({
      action: 'setAccountabilityOnly',
      deviceId,
      resultingStatus: DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY,
      reason,
    });
  }

  async setManualOverride(deviceId, durationMinutes = 60, reason = '') {
    return mockProviderResult({
      action: 'setManualOverride',
      deviceId,
      resultingStatus: DEVICE_ACCESS_STATES.MANUAL_OVERRIDE,
      durationMinutes,
      reason,
    });
  }

  async markExpired(deviceId, reason = '') {
    return mockProviderResult({
      action: 'markExpired',
      deviceId,
      resultingStatus: DEVICE_ACCESS_STATES.EXPIRED,
      reason,
    });
  }

  async getDeviceStatus(deviceId, currentStatus = DEVICE_ACCESS_STATES.ACCOUNTABILITY_ONLY) {
    return mockProviderResult({
      action: 'getDeviceStatus',
      deviceId,
      resultingStatus: normalizeDeviceAccessState(currentStatus),
      reason: 'Mock status read',
    });
  }
}

function createDeviceControlProvider(provider = 'mock', options = {}) {
  const normalized = String(provider || 'mock').trim().toLowerCase();
  if (normalized !== 'mock') {
    throw new Error(`Device provider "${provider}" is not enabled. Only the mock provider may run until real hardware/admin credentials are confirmed.`);
  }
  return new MockDeviceControlProvider(options);
}

module.exports = {
  DEVICE_ACCESS_STATES,
  DEVICE_ACCESS_STATE_LABELS,
  DEVICE_ACCESS_STATE_VALUES,
  MockDeviceControlProvider,
  createDeviceControlProvider,
  deviceAccessStateLabel,
  mockProviderResult,
  normalizeDeviceAccessState,
  normalizeDurationMinutes,
};
