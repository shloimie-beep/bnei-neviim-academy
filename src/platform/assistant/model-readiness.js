'use strict';

const MODEL_CREDENTIAL_STATES = Object.freeze([
  'missing',
  'configured',
  'invalid',
  'test_only',
  'live',
  'rate_limited',
  'quota_exhausted',
  'external_outage',
]);

function normalizeKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function hasUsableCredential(value) {
  const text = String(value || '').trim();
  return Boolean(text && !/^(todo|changeme|placeholder|\[redacted\]|redacted|test_only|none)$/i.test(text));
}

function classifyModelCredentialState(input = {}) {
  const provider = normalizeKey(input.provider || input.provider_key || input.model_provider_key || 'unknown') || 'unknown';
  const errorText = String(input.error || input.last_error || input.reason || '').toLowerCase();
  const statusCode = Number(input.status_code || input.statusCode || input.http_status || input.httpStatus || 0);
  const configured = input.configured === undefined
    ? hasUsableCredential(input.api_key || input.apiKey || input.key_fingerprint || input.keyFingerprint)
    : Boolean(input.configured);
  const explicitState = normalizeKey(input.state || input.credential_state || input.credentialState);
  if (MODEL_CREDENTIAL_STATES.includes(explicitState)) {
    return modelState({
      provider,
      state: explicitState,
      model: input.model,
      detail: reasonForState(explicitState, input),
      live_call_allowed: explicitState === 'live',
    });
  }
  if (!configured) {
    return modelState({
      provider,
      state: 'missing',
      model: input.model,
      detail: 'No configured model credential is available for this environment.',
      live_call_allowed: false,
    });
  }
  if (input.test_only || input.testOnly || /test[_ -]?only/.test(errorText)) {
    return modelState({
      provider,
      state: 'test_only',
      model: input.model,
      detail: 'Only a test credential or dry-run provider is configured.',
      live_call_allowed: false,
    });
  }
  if ([401, 403].includes(statusCode) || /\b(invalid|unauthorized|forbidden|auth|authentication)\b/.test(errorText)) {
    return modelState({
      provider,
      state: 'invalid',
      model: input.model,
      detail: 'Configured credential failed authentication.',
      live_call_allowed: false,
    });
  }
  if (statusCode === 429 || /\brate[_ -]?limit|too many requests\b/.test(errorText)) {
    const quota = /\bquota|insufficient[_ -]?quota|billing|credit\b/.test(errorText);
    return modelState({
      provider,
      state: quota ? 'quota_exhausted' : 'rate_limited',
      model: input.model,
      detail: quota
        ? 'Configured credential is out of quota or billing capacity.'
        : 'Configured provider is rate-limited.',
      live_call_allowed: false,
    });
  }
  if (statusCode >= 500 || /\b(outage|timeout|econn|network|dns|temporarily unavailable|service unavailable)\b/.test(errorText)) {
    return modelState({
      provider,
      state: 'external_outage',
      model: input.model,
      detail: 'Configured provider or network path is temporarily unavailable.',
      live_call_allowed: false,
    });
  }
  if (input.live || input.live_validated_at || input.liveValidatedAt || input.last_success_at || input.lastSuccessAt) {
    return modelState({
      provider,
      state: 'live',
      model: input.model,
      detail: 'A live model call has succeeded for this provider.',
      live_call_allowed: true,
    });
  }
  return modelState({
    provider,
    state: 'configured',
    model: input.model,
    detail: 'Credential is present but no live model call has been proven in this audit.',
    live_call_allowed: false,
  });
}

function modelState({ provider, state, model = null, detail, live_call_allowed = false } = {}) {
  return {
    provider,
    model: model ? String(model).trim() : null,
    state,
    configured: state !== 'missing',
    live_call_allowed,
    disabled_reason: live_call_allowed ? null : disabledReasonForModelState(state, detail),
    diagnostic_detail: detail,
    secret_visible: false,
  };
}

function reasonForState(state, input = {}) {
  return String(input.detail || input.disabled_reason || input.reason || '').trim()
    || disabledReasonForModelState(state);
}

function disabledReasonForModelState(state, detail = '') {
  const suffix = detail ? ` ${String(detail).trim()}` : '';
  switch (state) {
    case 'missing':
      return `missing_model_credential.${suffix}`.trim();
    case 'configured':
      return `configured_but_live_call_not_proven.${suffix}`.trim();
    case 'invalid':
      return `invalid_model_credential.${suffix}`.trim();
    case 'test_only':
      return `test_only_model_credential.${suffix}`.trim();
    case 'rate_limited':
      return `model_provider_rate_limited.${suffix}`.trim();
    case 'quota_exhausted':
      return `model_provider_quota_exhausted.${suffix}`.trim();
    case 'external_outage':
      return `model_provider_external_outage.${suffix}`.trim();
    default:
      return suffix.trim() || 'model_runtime_not_live';
  }
}

function buildModelReadinessMatrix(providers = [], options = {}) {
  const primaryProvider = normalizeKey(options.primary_provider || options.primaryProvider || '');
  const rows = (providers || []).map(classifyModelCredentialState);
  return {
    matrix_version: 'assistant-model-readiness-v1',
    primary_provider: primaryProvider || rows[0]?.provider || null,
    rows,
    live_provider_count: rows.filter((row) => row.state === 'live').length,
    configured_provider_count: rows.filter((row) => row.configured).length,
    model_call_allowed: rows.some((row) => row.live_call_allowed),
    exact_disabled_reasons: rows
      .filter((row) => row.disabled_reason)
      .map((row) => ({ provider: row.provider, state: row.state, reason: row.disabled_reason })),
    user_safe_unavailable_message:
      'The hosted assistant is temporarily unavailable. I can still create a task or support ticket if you tell me what needs to happen.',
  };
}

module.exports = {
  MODEL_CREDENTIAL_STATES,
  buildModelReadinessMatrix,
  classifyModelCredentialState,
  disabledReasonForModelState,
  hasUsableCredential,
};
