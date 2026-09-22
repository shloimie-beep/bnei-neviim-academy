const crypto = require('crypto');
const {
  redactSecrets,
  redactSecretText,
} = require('./secret-loader');

const DEFAULT_CONFIRM_PHRASES = {
  'buffer:schedule': 'SCHEDULE BUFFER POST',
  'buffer:publish': 'APPROVE_BUFFER_PUBLISH',
  'resend:send': 'SEND_RESEND_EMAIL',
  'gmail:payment_reminder_sweep': 'SEND_REMINDERS',
  'gmail:scheduled_payment_reminder_sweep': 'ENABLE_SCHEDULED_PAYMENT_REMINDERS',
  'stripe:checkout_create': 'CREATE_STRIPE_CHECKOUT',
  'stripe:live_billing': 'APPROVE_STRIPE_LIVE_BILLING',
  'zoom:meeting_create': 'CREATE_ZOOM_MEETING',
  'vimeo:upload': 'UPLOAD_VIDEO',
  'video_hosting:upload': 'UPLOAD_VIDEO',
  'google:write': 'APPROVE_GOOGLE_WRITE',
  'ghl:publish': 'APPROVE_GHL_PUBLISH',
};

function normalizedKey(provider, action) {
  return `${String(provider || '').trim().toLowerCase()}:${String(action || '').trim().toLowerCase()}`;
}

function requiredConfirmFor(provider, action, fallback = '') {
  return fallback || DEFAULT_CONFIRM_PHRASES[normalizedKey(provider, action)] || 'APPROVE_EXTERNAL_ACTION';
}

function safeSummary(value = {}, secrets = []) {
  return redactSecrets(value, secrets);
}

function externalActionAuditId(provider, action, input = {}) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({
      provider: String(provider || '').toLowerCase(),
      action: String(action || '').toLowerCase(),
      input,
      at: new Date().toISOString().slice(0, 13),
    }))
    .digest('hex')
    .slice(0, 32);
}

function requireExternalApproval({
  provider,
  action,
  riskLevel = 'high',
  previewOnly = false,
  confirm,
  requiredConfirm,
  accountOwner = 'unknown',
  mode = 'unknown',
  secrets = [],
} = {}) {
  const phrase = requiredConfirmFor(provider, action, requiredConfirm);
  const confirmed = String(confirm || '').trim() === phrase;
  const blocked = Boolean(!previewOnly && !confirmed);
  const result = {
    provider: String(provider || 'unknown').toLowerCase(),
    action: String(action || 'unknown').toLowerCase(),
    risk_level: riskLevel,
    preview_only: Boolean(previewOnly),
    approved: !blocked,
    required_confirm: phrase,
    account_owner: String(accountOwner || 'unknown'),
    mode: String(mode || 'unknown'),
    external_write_performed: false,
    blocker: blocked ? `External ${provider || 'provider'} ${action || 'action'} requires exact confirmation phrase.` : null,
  };
  if (blocked) {
    const error = new Error(result.blocker);
    error.status = 409;
    error.approval = redactSecrets(result, secrets);
    throw error;
  }
  return redactSecrets(result, secrets);
}

async function recordExternalActionAudit(db, {
  provider,
  action,
  riskLevel = 'high',
  previewOnly = true,
  approvalPhrase = '',
  accountOwner = 'unknown',
  mode = 'unknown',
  resultSummary = {},
  errorSummary = {},
  secrets = [],
} = {}) {
  if (!db || typeof db.query !== 'function') return null;
  const idempotencyKey = externalActionAuditId(provider, action, {
    previewOnly,
    accountOwner,
    mode,
    resultSummary,
    errorSummary,
  });
  const safeResult = safeSummary(resultSummary, secrets);
  const safeError = safeSummary(errorSummary, secrets);
  const row = (await db.query(
    `INSERT INTO bna_external_action_audit (
       provider, action, risk_level, preview_only, idempotency_key,
       approval_phrase, account_owner, mode, result_summary, error_summary,
       executed_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, CASE WHEN $4 = false THEN NOW() ELSE NULL END)
     ON CONFLICT (idempotency_key) DO UPDATE SET
       result_summary = EXCLUDED.result_summary,
       error_summary = EXCLUDED.error_summary
     RETURNING *`,
    [
      String(provider || 'unknown').toLowerCase(),
      String(action || 'unknown').toLowerCase(),
      String(riskLevel || 'high'),
      Boolean(previewOnly),
      idempotencyKey,
      approvalPhrase ? '[provided]' : '',
      String(accountOwner || 'unknown'),
      String(mode || 'unknown'),
      JSON.stringify(safeResult),
      JSON.stringify(safeError),
    ]
  )).rows[0] || null;
  return row;
}

function redactedExternalError(error, secrets = []) {
  return {
    message: redactSecretText(error?.message || String(error || 'External action failed'), secrets),
    status: error?.status || error?.statusCode || null,
    approval: error?.approval ? redactSecrets(error.approval, secrets) : null,
  };
}

module.exports = {
  DEFAULT_CONFIRM_PHRASES,
  externalActionAuditId,
  recordExternalActionAudit,
  redactedExternalError,
  requireExternalApproval,
  requiredConfirmFor,
};
