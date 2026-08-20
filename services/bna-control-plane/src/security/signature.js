const crypto = require('node:crypto');

const FIVE_MINUTES_SECONDS = 300;

function normalizeHeaders(headers = {}) {
  const normalized = {};
  for (const [key, value] of Object.entries(headers)) normalized[key.toLowerCase()] = String(value);
  return normalized;
}

function toBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(String(value ?? ''), 'utf8');
}

function base64url(buffer) {
  return Buffer.from(buffer).toString('base64url');
}

function sha256Hex(bytes) {
  return crypto.createHash('sha256').update(toBuffer(bytes)).digest('hex');
}

function randomNonce() {
  return base64url(crypto.randomBytes(24));
}

function canonicalSigningString({ method, path, contractVersion, timestamp, nonce, bodySha256 }) {
  return [
    String(method || '').toUpperCase(),
    path,
    contractVersion,
    String(timestamp),
    nonce,
    bodySha256,
  ].join('\n');
}

function signRequest({ privateKey, method = 'POST', path, contractVersion = '1.0.0', timestamp = Math.floor(Date.now() / 1000), nonce = randomNonce(), body }) {
  const bodySha256 = sha256Hex(body);
  const signingString = canonicalSigningString({ method, path, contractVersion, timestamp, nonce, bodySha256 });
  const signature = crypto.sign(null, Buffer.from(signingString), privateKey);
  return {
    'x-bna-contract-version': contractVersion,
    'x-bna-timestamp': String(timestamp),
    'x-bna-nonce': nonce,
    'x-bna-content-sha256': bodySha256,
    'x-bna-signature': `v1=${base64url(signature)}`,
  };
}

function assertHeader(headers, name) {
  const value = headers[name.toLowerCase()];
  if (!value) {
    const error = new Error(`missing header ${name}`);
    error.code = 'signature_header_missing';
    throw error;
  }
  return value;
}

function decodeNonce(nonce) {
  if (!/^[A-Za-z0-9_-]+$/.test(nonce)) throw new Error('nonce is not base64url');
  const decoded = Buffer.from(nonce, 'base64url');
  if (decoded.length !== 24) throw new Error('nonce must decode to 24 bytes');
  return decoded;
}

function verifySignedRequest({
  method = 'POST',
  path,
  protocol = 'https:',
  headers = {},
  body,
  keyResolver,
  now = Date.now(),
  requireHttps = false,
} = {}) {
  if (String(method).toUpperCase() !== 'POST') throw Object.assign(new Error('method must be POST'), { code: 'bad_method' });
  if (!path || !path.startsWith('/internal/v1/')) throw Object.assign(new Error('path is outside internal API'), { code: 'bad_path' });
  if (requireHttps && protocol !== 'https:') throw Object.assign(new Error('HTTPS required'), { code: 'https_required' });
  const normalized = normalizeHeaders(headers);
  const contractVersion = assertHeader(normalized, 'x-bna-contract-version');
  const keyId = assertHeader(normalized, 'x-bna-key-id');
  const timestampText = assertHeader(normalized, 'x-bna-timestamp');
  const nonce = assertHeader(normalized, 'x-bna-nonce');
  const contentSha = assertHeader(normalized, 'x-bna-content-sha256');
  const signatureHeader = assertHeader(normalized, 'x-bna-signature');
  if (contractVersion !== '1.0.0') throw Object.assign(new Error('unsupported contract version'), { code: 'bad_contract_version' });
  const timestamp = Number(timestampText);
  if (!Number.isInteger(timestamp)) throw Object.assign(new Error('timestamp must be integer seconds'), { code: 'bad_timestamp' });
  const skew = Math.abs(Math.floor(now / 1000) - timestamp);
  if (skew > FIVE_MINUTES_SECONDS) throw Object.assign(new Error('timestamp outside allowed skew'), { code: 'timestamp_skew' });
  decodeNonce(nonce);
  const actualSha = sha256Hex(body);
  if (actualSha !== contentSha) throw Object.assign(new Error('content digest mismatch'), { code: 'digest_mismatch' });
  if (!signatureHeader.startsWith('v1=')) throw Object.assign(new Error('unsupported signature version'), { code: 'bad_signature_version' });
  const publicKey = keyResolver ? keyResolver(keyId) : null;
  if (!publicKey) throw Object.assign(new Error('unknown key id'), { code: 'unknown_key_id' });
  const signature = Buffer.from(signatureHeader.slice(3), 'base64url');
  const signingString = canonicalSigningString({ method, path, contractVersion, timestamp, nonce, bodySha256: contentSha });
  const ok = crypto.verify(null, Buffer.from(signingString), publicKey, signature);
  if (!ok) throw Object.assign(new Error('signature verification failed'), { code: 'bad_signature' });
  return { keyId, timestamp, nonce, bodySha256: contentSha, signingString };
}

module.exports = {
  canonicalSigningString,
  randomNonce,
  sha256Hex,
  signRequest,
  verifySignedRequest,
};
