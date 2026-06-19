const crypto = require('node:crypto');

function cleanString(value = '', fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizeKey(value = '') {
  return cleanString(value)
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeEmail(value = '') {
  const text = cleanString(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text : '';
}

function normalizePhone(value = '') {
  const digits = cleanString(value).replace(/\D/g, '');
  return digits.length >= 7 ? digits : '';
}

function normalizeArray(value = []) {
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null);
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function stableId(prefix, parts = []) {
  const body = normalizeArray(parts)
    .map((part) => (typeof part === 'object' ? JSON.stringify(part) : String(part ?? '')))
    .join('|');
  const hash = crypto.createHash('sha256').update(body).digest('hex').slice(0, 16);
  return `${normalizeKey(prefix || 'id').toUpperCase()}-${hash}`;
}

function parseJsonObject(value, fallback = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function nowIso(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
}

module.exports = {
  cleanString,
  normalizeArray,
  normalizeEmail,
  normalizeKey,
  normalizePhone,
  nowIso,
  parseJsonObject,
  stableId,
};
