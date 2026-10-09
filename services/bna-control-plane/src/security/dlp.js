const PRODUCT_ORIGINS = Object.freeze({
  one_time: 'https://join.onetimeonetime.com',
  bna_school: 'https://school.bneineviimacademy.org',
});

const FORBIDDEN_FIELD_NAMES = Object.freeze([
  'actor',
  'account',
  'entitlement',
  'contact',
  'attachment',
  'message',
  'reproduction',
  'diagnostic',
  'payment',
  'student',
  'guardian',
  'parent',
  'child',
  'email',
  'phone',
  'whatsapp',
  'telegram',
  'address',
  'username',
  'password',
  'token',
  'secret',
  'cookie',
  'session',
  'invoice',
  'subscription',
  'card',
]);

function dlpError(message, path = '') {
  const error = new Error(path ? `${path}: ${message}` : message);
  error.code = 'data_minimization_failed';
  throw error;
}

function assertRedactedSummary(value, path = 'redacted_summary') {
  if (typeof value !== 'string') dlpError('expected string', path);
  const text = value.trim();
  if (!text) dlpError('summary must not be empty', path);
  if (text.length > 160) dlpError('summary exceeds 160 characters', path);
  if (/[\r\n]/.test(value)) dlpError('summary must be single-line', path);
  if (/["'`]/.test(value)) dlpError('summary must not quote customer text', path);
  if (/[A-Z][a-z]+ [A-Z][a-z]+/.test(value)) dlpError('summary contains likely personal name', path);
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) dlpError('summary contains email-like text', path);
  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(value)) dlpError('summary contains phone-like text', path);
  if (/https?:\/\//i.test(value) || /[?&][a-z0-9_]+=/.test(value)) dlpError('summary contains URL or query string', path);
  if (/\b(?:secret|token|password|cookie|session)\s*[:=]\s*\S+/i.test(value)) dlpError('summary contains secret-like value', path);
  if (/\b(?:visa|mastercard|amex|stripe|invoice|card)\b/i.test(value)) dlpError('summary contains payment-like text', path);
  return text;
}

function assertProductCaseUrl({ product, productCaseId, url, path = 'product_case_url', origins = PRODUCT_ORIGINS } = {}) {
  if (typeof url !== 'string' || !url.trim()) dlpError('expected HTTPS URL', path);
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    dlpError('invalid URL', path);
  }
  const origin = origins[product];
  if (!origin) dlpError(`unknown product origin for ${product}`, path);
  if (parsed.protocol !== 'https:') dlpError('URL must use HTTPS', path);
  if (parsed.origin !== origin) dlpError(`URL origin must be ${origin}`, path);
  if (parsed.search || parsed.hash) dlpError('URL must not include query string or fragment', path);
  if (!parsed.pathname.includes(productCaseId)) dlpError('URL must include the opaque product case id in the path', path);
  if (/token|session|magic|reset|key|secret/i.test(parsed.pathname)) dlpError('URL path contains token-like word', path);
  return parsed.toString();
}

function assertNoForbiddenKeys(value, path = 'object') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (FORBIDDEN_FIELD_NAMES.some((forbidden) => normalized === forbidden || normalized.includes(`_${forbidden}_`) || normalized.endsWith(`_${forbidden}`))) {
      dlpError(`forbidden field ${key}`, path);
    }
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function inspectForbiddenText(value, path = 'value') {
  const text = String(value ?? '');
  if (!text) return;
  assertRedactedSummary(text.length > 160 ? text.slice(0, 161) : text, path);
}

module.exports = {
  FORBIDDEN_FIELD_NAMES,
  PRODUCT_ORIGINS,
  assertNoForbiddenKeys,
  assertProductCaseUrl,
  assertRedactedSummary,
  inspectForbiddenText,
};
