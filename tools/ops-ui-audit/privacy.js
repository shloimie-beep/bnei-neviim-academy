const REDACTION_PATTERNS = [
  { name: 'email', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[email]' },
  { name: 'token', regex: /\b(?:sk|pk|rk|whsec|tok|key|secret|token)[_-]?[A-Za-z0-9_-]{10,}\b/gi, replacement: '[token]' },
  { name: 'phone', regex: /(?:\+?\d[\s().-]*){7,}\d/g, replacement: '[phone]' },
  { name: 'uuid', regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, replacement: '[id]' },
  { name: 'long-id', regex: /\b\d{6,}\b/g, replacement: '[id]' },
];

const PRIVATE_SELECTORS = [
  'input',
  'textarea',
  '[data-private]',
  '[data-sensitive]',
  '[data-redact]',
  '[data-student]',
  '[data-parent]',
  '[data-family]',
  '[data-provider-contact]',
  '[data-message]',
  '[data-payment]',
  '[data-transcript]',
  '.student-detail',
  '.parent-detail',
  '.family-detail',
  '.provider-contact',
  '.message-body',
  '.payment-detail',
  '.transcript-detail',
  '.access-code',
  '.secret',
  '.token',
];

function redactSensitiveText(value) {
  let output = String(value || '');
  for (const pattern of REDACTION_PATTERNS) {
    output = output.replace(pattern.regex, pattern.replacement);
  }
  return output;
}

async function applyPrivacyRedactions(page, mode = 'redact') {
  if (mode === 'off') return { selectors: [], patterns: [] };
  const selectors = PRIVATE_SELECTORS;
  const patterns = REDACTION_PATTERNS.map((pattern) => pattern.name);
  await page.addStyleTag({
    content: `
      *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; caret-color: transparent !important; }
      ${selectors.join(', ')} {
        color: transparent !important;
        text-shadow: none !important;
        background-image: repeating-linear-gradient(135deg, rgba(15,23,42,.12) 0 8px, rgba(15,23,42,.2) 8px 16px) !important;
      }
      input::placeholder, textarea::placeholder { color: transparent !important; }
    `,
  }).catch(() => {});
  await page.evaluate(({ selectors, patternSources }) => {
    const compiled = patternSources.map((item) => ({ name: item.name, regex: new RegExp(item.source, item.flags), replacement: item.replacement }));
    const maskText = (text) => compiled.reduce((value, pattern) => value.replace(pattern.regex, pattern.replacement), text);
    document.querySelectorAll('input, textarea').forEach((el) => {
      if ('value' in el && el.value) el.value = 'REDACTED';
      el.setAttribute('value', '');
    });
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
        el.setAttribute('data-ops-audit-redacted', 'true');
      }
    });
    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const next = maskText(node.nodeValue || '');
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }, {
    selectors,
    patternSources: REDACTION_PATTERNS.map((pattern) => ({
      name: pattern.name,
      source: pattern.regex.source,
      flags: pattern.regex.flags,
      replacement: pattern.replacement,
    })),
  }).catch(() => {});
  return { selectors, patterns };
}

module.exports = {
  PRIVATE_SELECTORS,
  REDACTION_PATTERNS,
  applyPrivacyRedactions,
  redactSensitiveText,
};
