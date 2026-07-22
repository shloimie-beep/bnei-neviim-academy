const SENSITIVE_RESULT_KEY = /(?:token|secret|password|authorization|cookie|api[_-]?key|customer|contact|email|phone|message[_-]?body|transcript|location[_-]?id)/i;

function truthy(value) {
  return /^(?:1|true|yes|on)$/i.test(String(value || '').trim());
}

function isDeployedRuntime(env = process.env) {
  return Boolean(
    String(env.RAILWAY_ENVIRONMENT_ID || '').trim()
    || String(env.RAILWAY_SERVICE_ID || '').trim()
    || String(env.RAILWAY_PUBLIC_DOMAIN || '').trim()
  );
}

function allowsAgentActionMemoryStorage(env = process.env) {
  if (isDeployedRuntime(env)) return false;
  return env.NODE_ENV === 'test'
    || truthy(env.PLATFORM_PREVIEW_NO_DB)
    || String(env.AGENT_ACTION_STORAGE_MODE || '').trim().toLowerCase() === 'memory';
}

function agentActionStorageMode({ env = process.env, databaseUrl = '' } = {}) {
  if (String(databaseUrl || '').trim()) return 'postgres';
  return allowsAgentActionMemoryStorage(env) ? 'memory_local_test_only' : 'unavailable';
}

function agentActionDatabaseError(cause = null) {
  const error = new Error('Agent Action PostgreSQL storage is unavailable. The deployed preview fails closed and did not use memory storage.');
  error.code = 'agent_action_database_unavailable';
  error.statusCode = 503;
  if (cause) error.cause = cause;
  return error;
}

function redactSensitiveText(value = '', max = 6000) {
  return String(value || '')
    .replace(/(api[_-]?key|token|secret|password|authorization|cookie)\s*[:=]\s*[^\s,}\]]+/gi, '$1=[redacted]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email-redacted]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone-redacted]')
    .slice(0, max);
}

function sanitizeAgentActionResultInput(body = {}, normalizeList = (value) => Array.isArray(value) ? value : []) {
  const ignoredSensitiveFields = Object.keys(body || {}).filter((key) => SENSITIVE_RESULT_KEY.test(key));
  const sanitizeList = (value) => normalizeList(value).map((entry) => redactSensitiveText(entry, 700));
  return {
    summary: redactSensitiveText(body.summary || body.result_summary || body.resultSummary || body.report_text || body.reportText || '', 6000),
    evidence: sanitizeList(body.evidence || body.evidence_notes || body.evidenceNotes),
    completion_checklist: sanitizeList(body.completion_checklist || body.completionChecklist || body.checklist),
    expected_asset_ids: sanitizeList(body.expected_asset_ids || body.expectedAssetIds || body.asset_ids || body.assetIds),
    ignored_sensitive_fields: ignoredSensitiveFields,
    result_only: true,
    secrets_included: false,
    customer_content_included: false,
  };
}

module.exports = {
  SENSITIVE_RESULT_KEY,
  allowsAgentActionMemoryStorage,
  agentActionDatabaseError,
  agentActionStorageMode,
  isDeployedRuntime,
  redactSensitiveText,
  sanitizeAgentActionResultInput,
};
