const { parseJsonStrict, stableFingerprint, validateSupportCaseEvent } = require('../contracts');
const { verifySignedRequest } = require('../security/signature');
const { projectEvent } = require('../cases/projector');

const MAX_BODY_BYTES = 32 * 1024;

function header(headers, name) {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers || {})) {
    if (key.toLowerCase() === lower) return String(value);
  }
  return '';
}

function response(statusCode, code, extra = {}) {
  return { statusCode, body: { code, ...extra } };
}

function handleEventRequest({ method = 'POST', path = '/internal/v1/events', protocol = 'https:', headers = {}, body, storage, now = Date.now(), requireHttps = false } = {}) {
  try {
    if (method !== 'POST') return response(405, 'method_not_allowed');
    if (path !== '/internal/v1/events') return response(404, 'not_found');
    if (!/^application\/json\b/i.test(header(headers, 'content-type'))) return response(415, 'unsupported_media_type');
    const raw = Buffer.isBuffer(body) ? body : Buffer.from(String(body ?? ''), 'utf8');
    if (raw.length > MAX_BODY_BYTES) return response(413, 'body_too_large');
    const signed = verifySignedRequest({
      method,
      path,
      protocol,
      headers,
      body: raw,
      requireHttps,
      now,
      keyResolver: (keyId) => storage.resolveVerificationKey(keyId, 'product_event'),
    });
    storage.replay.assertFresh({ keyId: signed.keyId, nonce: signed.nonce, now });
    const parsed = parseJsonStrict(raw);
    const event = validateSupportCaseEvent(parsed);
    const fingerprint = stableFingerprint(event);
    const accepted = storage.acceptEvent({
      eventId: event.event_id,
      fingerprint,
      eventType: event.event_type,
      product: event.producer.product,
      keyId: signed.keyId,
      occurredAt: event.occurred_at,
    });
    if (accepted.status === 'collision') return response(409, 'id_fingerprint_collision', { event_id: event.event_id });
    if (accepted.status === 'accepted') projectEvent(event, storage);
    return response(202, accepted.status, { event_id: event.event_id });
  } catch (error) {
    const code = error.code || 'bad_request';
    if (['unknown_key_id', 'bad_signature', 'digest_mismatch', 'timestamp_skew', 'signature_header_missing'].includes(code)) {
      return response(401, code);
    }
    if (code === 'nonce_replay') return response(401, code);
    return response(400, code, { reason: error.message });
  }
}

module.exports = {
  MAX_BODY_BYTES,
  handleEventRequest,
};
