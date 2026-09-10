const { ReplayStore } = require('../security/replay');

class MemoryControlPlaneStorage {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.replay = new ReplayStore();
    this.productKeys = new Map();
    this.eventInbox = new Map();
    this.cases = new Map();
    this.caseProjectionEvents = [];
    this.commandOutbox = new Map();
    this.commandResults = new Map();
    this.auditEvents = [];
    this.telegramAlertOutbox = [];
  }

  addProductKey({ keyId, publicKey, product, direction = 'product_event', origin, status = 'active' }) {
    this.productKeys.set(keyId, { keyId, publicKey, product, direction, origin, status });
  }

  resolveVerificationKey(keyId, direction = 'product_event') {
    const record = this.productKeys.get(keyId);
    if (!record || record.status !== 'active' || record.direction !== direction) return null;
    return record.publicKey;
  }

  acceptEvent({ eventId, fingerprint, eventType, product, keyId, occurredAt }) {
    const existing = this.eventInbox.get(eventId);
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        this.audit('event_collision', { event_id: eventId, event_type: eventType, product });
        return { status: 'collision', existing };
      }
      return { status: 'duplicate', existing };
    }
    const record = {
      event_id: eventId,
      fingerprint,
      event_type: eventType,
      product,
      key_id: keyId,
      accepted_at: new Date(this.now()).toISOString(),
      occurred_at: occurredAt,
    };
    this.eventInbox.set(eventId, record);
    return { status: 'accepted', record };
  }

  upsertCase(caseRecord) {
    this.cases.set(caseRecord.case_ref, { ...caseRecord });
    return this.cases.get(caseRecord.case_ref);
  }

  getCase(caseRef) {
    return this.cases.get(caseRef) || null;
  }

  findCaseByProductId(product, productCaseId) {
    for (const record of this.cases.values()) {
      if (record.product === product && record.product_case_id === productCaseId) return record;
    }
    return null;
  }

  deleteCase(caseRef) {
    this.cases.delete(caseRef);
  }

  appendCaseProjection(event) {
    this.caseProjectionEvents.push({ ...event, recorded_at: new Date(this.now()).toISOString() });
  }

  enqueueTelegramAlert(alert) {
    this.telegramAlertOutbox.push({ ...alert, status: 'queued', created_at: new Date(this.now()).toISOString() });
  }

  insertCommand(commandRecord) {
    const existing = this.commandOutbox.get(commandRecord.command_id);
    if (existing) return { status: 'duplicate', record: existing };
    const record = {
      ...commandRecord,
      status: commandRecord.status || 'queued',
      attempts: commandRecord.attempts || 0,
      next_attempt_at: commandRecord.next_attempt_at || new Date(this.now()).toISOString(),
      created_at: new Date(this.now()).toISOString(),
    };
    this.commandOutbox.set(record.command_id, record);
    return { status: 'accepted', record };
  }

  leaseDueCommands({ now = this.now(), limit = 10, leaseMs = 60 * 1000, workerId = 'test-worker' } = {}) {
    const due = [];
    const nowMs = typeof now === 'number' ? now : new Date(now).getTime();
    for (const record of this.commandOutbox.values()) {
      if (due.length >= limit) break;
      if (!['queued', 'retry'].includes(record.status)) continue;
      if (new Date(record.next_attempt_at).getTime() > nowMs) continue;
      record.status = 'leased';
      record.leased_by = workerId;
      record.lease_expires_at = new Date(nowMs + leaseMs).toISOString();
      due.push({ ...record });
    }
    return due;
  }

  markCommandFailure(commandId, { retryable = true, error_code = 'temporary_failure', now = this.now() } = {}) {
    const record = this.commandOutbox.get(commandId);
    if (!record) throw new Error(`unknown command ${commandId}`);
    const nowMs = typeof now === 'number' ? now : new Date(now).getTime();
    record.attempts += 1;
    record.last_error_code = error_code;
    if (!retryable || record.attempts >= 12) {
      record.status = 'dead_letter';
      record.dead_lettered_at = new Date(nowMs).toISOString();
      return record;
    }
    const delaySeconds = Math.min(30 * (2 ** Math.max(0, record.attempts - 1)), 30 * 60);
    record.status = 'retry';
    record.next_attempt_at = new Date(nowMs + delaySeconds * 1000).toISOString();
    return record;
  }

  recordCommandResult(result) {
    this.commandResults.set(result.command_id, { ...result, recorded_at: new Date(this.now()).toISOString() });
    const command = this.commandOutbox.get(result.command_id);
    if (command) {
      command.status = ['accepted'].includes(result.result) ? 'accepted_by_product' : result.result;
      command.result_code = result.result_code;
      command.product_version = result.product_version;
    }
  }

  audit(action, details = {}) {
    this.auditEvents.push({
      event_id: `audit_${String(this.auditEvents.length + 1).padStart(6, '0')}`,
      occurred_at: new Date(this.now()).toISOString(),
      action,
      ...details,
    });
  }
}

module.exports = {
  MemoryControlPlaneStorage,
};
