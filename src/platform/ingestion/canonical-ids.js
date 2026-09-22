const crypto = require('node:crypto');

const DEFAULT_DISPLAY_TIME_ZONE = 'Asia/Jerusalem';

function stableHash(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function normalizePrefix(value = 'ITEM') {
  return String(value || 'ITEM')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'ITEM';
}

function dateStamp(value = null, { timeZone = DEFAULT_DISPLAY_TIME_ZONE } = {}) {
  const text = String(value || '').trim();
  const explicit = text.match(/^(20\d{2})-?(\d{2})-?(\d{2})$/);
  if (explicit) return `${explicit[1]}${explicit[2]}${explicit[3]}`;

  const date = value ? new Date(value) : new Date();
  const validDate = Number.isFinite(date.getTime()) ? date : new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(validDate);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}${byType.month}${byType.day}`;
}

function canonicalDisplayId({
  prefix = 'ITEM',
  dateValue = null,
  index = 1,
  disambiguator = '',
  hashLength = 8,
  timeZone = DEFAULT_DISPLAY_TIME_ZONE,
} = {}) {
  const number = Math.max(1, Number(index || 1));
  const base = `${normalizePrefix(prefix)}-${dateStamp(dateValue, { timeZone })}-${String(number).padStart(3, '0')}`;
  if (disambiguator === undefined || disambiguator === null || disambiguator === '') return base;
  const hash = stableHash(JSON.stringify(disambiguator)).slice(0, Math.max(6, Number(hashLength || 8))).toUpperCase();
  return `${base}-${hash}`;
}

module.exports = {
  DEFAULT_DISPLAY_TIME_ZONE,
  canonicalDisplayId,
  dateStamp,
  stableHash,
};
