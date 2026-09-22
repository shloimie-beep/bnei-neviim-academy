const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const RISKY_WORDS = [
  'send',
  'publish',
  'post',
  'approve',
  'reject',
  'delete',
  'archive',
  'remove',
  'save',
  'submit',
  'create',
  'add',
  'invite',
  'charge',
  'refund',
  'payment',
  'pay',
  'run automation',
  'sync',
  'reprocess',
  'deploy',
  'confirm',
  'reset',
  'live test',
  'whatsapp',
  'email',
  'sms',
  'call',
  'notify',
  'upload',
  'edit',
  'update',
  'merge',
  'impersonate',
  'switch user',
];

const SAFE_WORDS = [
  'view',
  'open',
  'details',
  'filter',
  'sort',
  'search',
  'tab',
  'next',
  'previous',
  'back',
  'close',
  'expand',
  'collapse',
  'menu',
  'workspace',
  'role',
  'context',
];

function textForAction(action = {}) {
  return [
    action.label,
    action.text,
    action.name,
    action.title,
    action.ariaLabel,
    action.href,
    action.selector,
    action.type,
    action.role,
    action.formText,
    action.dataset,
  ].filter(Boolean).join(' ').toLowerCase();
}

function classifyAction(action = {}) {
  const text = textForAction(action);
  if (!text.trim()) {
    return { safe: false, skipped: true, reason: 'empty action label/context' };
  }
  if (action.disabled) {
    return { safe: false, skipped: true, reason: 'disabled control' };
  }
  if (/submit|reset/i.test(action.type || '')) {
    return { safe: false, skipped: true, reason: 'form submit/reset control' };
  }
  if (action.inForm && !/search|filter|sort|select|workspace|context|role/i.test(text)) {
    return { safe: false, skipped: true, reason: 'inside a form without read-only search/filter context' };
  }
  const risky = RISKY_WORDS.find((word) => text.includes(word));
  if (risky) {
    return { safe: false, skipped: true, reason: `risky action concept: ${risky}` };
  }
  if (/javascript:void\(0\)|^#$|href="#"|placeholder/i.test(text)) {
    return { safe: false, skipped: true, reason: 'placeholder or empty link' };
  }
  const safeHint = SAFE_WORDS.find((word) => text.includes(word));
  return { safe: true, skipped: false, reason: safeHint ? `safe navigation/view hint: ${safeHint}` : 'no risky concept detected' };
}

function shouldBlockRequest(request, baseUrl) {
  const method = String(request.method ? request.method() : request.method || 'GET').toUpperCase();
  if (!MUTATING_METHODS.has(method)) return { block: false, reason: 'read-only method' };
  const url = request.url ? request.url() : String(request.url || '');
  let sameOrigin = true;
  try {
    sameOrigin = new URL(url).origin === new URL(baseUrl).origin;
  } catch {
    sameOrigin = true;
  }
  if (!sameOrigin) {
    return { block: true, reason: `external mutating request ${method}` };
  }
  return { block: true, reason: `blocked mutating request ${method}` };
}

function isOperationsSafeHref(href, baseUrl) {
  if (!href) return false;
  try {
    const url = new URL(href, baseUrl);
    const base = new URL(baseUrl);
    return url.origin === base.origin && (url.pathname === '/operations' || url.pathname === '/operations.html');
  } catch {
    return false;
  }
}

module.exports = {
  MUTATING_METHODS,
  RISKY_WORDS,
  SAFE_WORDS,
  classifyAction,
  isOperationsSafeHref,
  shouldBlockRequest,
  textForAction,
};
