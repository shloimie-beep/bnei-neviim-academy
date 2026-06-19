const CONFIRMATION_SIDE_EFFECT_LEVELS = new Set([
  'external_write',
  'financial',
  'access_grant',
  'destructive',
]);

const SENSITIVE_TOOL_PATTERNS = [
  /\bsend\b/i,
  /\bpublish\b/i,
  /\bschedule.*buffer\b/i,
  /\bstripe\b/i,
  /\bcheckout\b/i,
  /\bpayment\b/i,
  /\bdns\b/i,
  /\bzoom\b/i,
  /\bvimeo.*upload\b/i,
  /\bapi_key\b/i,
  /\bsecret\b/i,
  /\baccess.*grant\b/i,
  /\bdelete\b/i,
  /\barchive\b/i,
  /\brevoke\b/i,
];

function normalizeSideEffectLevel(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (['read_only', 'draft_only', 'internal_write', 'external_write', 'financial', 'access_grant', 'destructive'].includes(normalized)) {
    return normalized;
  }
  return 'internal_write';
}

function inferSideEffectLevel(definition = {}) {
  if (definition.sideEffectLevel) return normalizeSideEffectLevel(definition.sideEffectLevel);
  const name = String(definition.name || definition.action_id || '').replace(/[_-]+/g, ' ');
  const category = String(definition.category || '').toLowerCase();
  if (/^(show|audit|list|view|find|test|preview|open)(\s|$)/i.test(name)) return 'read_only';
  if (/^(draft|prepare|generate|refine)(\s|$)/i.test(name) || /^create\s+.*\s+draft/i.test(name) || /^preview(\s|$)/i.test(name) || category === 'newsletter') return 'draft_only';
  if (/\b(send|publish|schedule|telegram_report|whatsapp)\b/i.test(name)) return 'external_write';
  if (/\b(stripe|checkout|payment)\b/i.test(name)) return 'financial';
  if (/\b(access|api\s*key|secret|token)\b/i.test(name)) return 'access_grant';
  if (/\b(delete|archive|revoke|rollback)\b/i.test(name)) return 'destructive';
  return 'internal_write';
}

function confirmationPolicyForTool(tool = {}) {
  const sideEffectLevel = inferSideEffectLevel(tool);
  const searchableName = String(tool.name || tool.action_id || '').replace(/[_-]+/g, ' ');
  const sensitiveName = SENSITIVE_TOOL_PATTERNS.some((pattern) => pattern.test(searchableName));
  const risk = String(tool.risk || '').toLowerCase();
  const requiresConfirmation = Boolean(tool.requiresConfirmation)
    || Boolean(tool.approval_required)
    || CONFIRMATION_SIDE_EFFECT_LEVELS.has(sideEffectLevel)
    || ['medium', 'high', 'destructive'].includes(risk)
    || sensitiveName;
  return {
    sideEffectLevel,
    requiresConfirmation,
    policy: requiresConfirmation ? 'explicit_confirmation_required' : 'safe_without_confirmation',
  };
}

function requiresHelperConfirmation(tool = {}) {
  return confirmationPolicyForTool(tool).requiresConfirmation;
}

module.exports = {
  CONFIRMATION_SIDE_EFFECT_LEVELS,
  confirmationPolicyForTool,
  inferSideEffectLevel,
  normalizeSideEffectLevel,
  requiresHelperConfirmation,
};
