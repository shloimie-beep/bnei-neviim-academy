const crypto = require('crypto');

const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bya29\.[0-9A-Za-z._-]{20,}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/gi,
  /\b(refresh_token|access_token|api_key|apikey|password|secret|authorization)\b\s*[:=]\s*['"]?[^'"\s,}]+/gi,
];

const STUDENT_ACCESS_PATTERNS = [
  /\b(student_access_code|access_code|portal_link|magic_link)\b\s*[:=]\s*['"]?[^'"\s,}]+/gi,
  /\/student\.html\?code=[A-Za-z0-9._~-]+/gi,
  /\/parent-login\.html\?token=[A-Za-z0-9._~-]+/gi,
];

function stableHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function redactText(value = '') {
  let text = String(value || '');
  for (const pattern of SECRET_PATTERNS) text = text.replace(pattern, '[redacted-secret]');
  for (const pattern of STUDENT_ACCESS_PATTERNS) text = text.replace(pattern, '[redacted-access]');
  return text;
}

function redactValue(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (depth > 5) return '[redacted-depth]';
  if (typeof value === 'string') return redactText(value).slice(0, 4000);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => redactValue(item, depth + 1));
  if (typeof value !== 'object') return String(value);

  const output = {};
  for (const [key, raw] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (/(secret|token|password|authorization|api[_-]?key|key[_-]?input|refresh[_-]?token|access[_-]?token)/i.test(normalized)) {
      output[key] = '[redacted-secret]';
      continue;
    }
    if (/(student_access_code|access_code|portal_link|magic_link)/i.test(normalized)) {
      output[key] = '[redacted-access]';
      continue;
    }
    output[key] = redactValue(raw, depth + 1);
  }
  return output;
}

function previewMessage(message = '', maxLength = 280) {
  return redactText(String(message || '').replace(/\s+/g, ' ').trim()).slice(0, maxLength);
}

module.exports = {
  previewMessage,
  redactText,
  redactValue,
  stableHash,
};
