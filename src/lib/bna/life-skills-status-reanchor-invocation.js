const { authorizedReanchor, reanchorRequestKey } = require('./life-skills-status-publisher');

const INVOCATION_KIND = 'LIFE_SKILLS_STATUS_REANCHOR_INVOCATION_V1';
const APPROVAL_SCOPE = 'schedule-one-held-successor';
const MAX_AUTHORIZATION_LIFETIME_MS = 15 * 60 * 1000;
const TARGET = Object.freeze({
  serviceId: '4079db35-5f4a-44ef-a767-3406c74f6005',
  environmentId: '3ce30933-49c7-4b90-8c36-a5afd67df329',
  spreadsheetId: '1UbbkY6h74L3_sG_m2hcBZ_rmBRLJDO7pYgghrXGdARI',
});
const ENVELOPE_KEYS = ['approvalScope', 'authorization', 'authorizationId', 'expiresAt', 'issuedAt', 'kind', 'mode', 'requestKey', 'target'];
const TARGET_KEYS = ['environmentId', 'serviceId', 'spreadsheetId'];
const AUTHORIZATION_KEYS = ['assetId', 'driveFileId', 'height', 'language', 'ownerAuthorized', 'predecessorReceiptId', 'revision', 'scheduledAt', 'sha256', 'surface', 'width'];

function plainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new Error(`${label}_OBJECT_REQUIRED`);
  }
  return value;
}
function exactKeys(value, expected, label) {
  const keys = Object.keys(plainObject(value, label)).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...expected].sort())) throw new Error(`${label}_KEYS_INVALID`);
}
function exactIso(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error(`${label}_INVALID`);
  return Date.parse(value);
}
function requiredText(value, label, pattern = /^.{1,200}$/) {
  if (typeof value !== 'string' || !pattern.test(value)) throw new Error(`${label}_INVALID`);
  return value;
}
function requireRuntimeBinding(env) {
  if (env.RAILWAY_SERVICE_ID !== TARGET.serviceId || env.RAILWAY_ENVIRONMENT_ID !== TARGET.environmentId)
    throw new Error('STATUS_REANCHOR_RUNTIME_TARGET_MISMATCH');
  for (const key of ['DATABASE_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'GOOGLE_REFRESH_TOKEN']) {
    if (!String(env[key] || '').trim()) throw new Error(`STATUS_REANCHOR_RUNTIME_${key}_MISSING`);
  }
}
function validateAuthorizedReanchorInvocation(input, { env = process.env, now = Date.now() } = {}) {
  exactKeys(input, ENVELOPE_KEYS, 'STATUS_REANCHOR_ENVELOPE');
  if (input.kind !== INVOCATION_KIND || input.mode !== 'apply' || input.approvalScope !== APPROVAL_SCOPE)
    throw new Error('STATUS_REANCHOR_INVOCATION_MODE_INVALID');
  requiredText(input.authorizationId, 'STATUS_REANCHOR_AUTHORIZATION_ID', /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);
  const issuedAt = exactIso(input.issuedAt, 'STATUS_REANCHOR_ISSUED_AT');
  const expiresAt = exactIso(input.expiresAt, 'STATUS_REANCHOR_EXPIRES_AT');
  if (issuedAt > now || expiresAt <= now || expiresAt <= issuedAt || expiresAt - issuedAt > MAX_AUTHORIZATION_LIFETIME_MS)
    throw new Error('STATUS_REANCHOR_AUTHORIZATION_EXPIRED_OR_WINDOW_INVALID');
  exactKeys(input.target, TARGET_KEYS, 'STATUS_REANCHOR_TARGET');
  if (TARGET_KEYS.some(key => input.target[key] !== TARGET[key])) throw new Error('STATUS_REANCHOR_TARGET_MISMATCH');
  requireRuntimeBinding(env);
  exactKeys(input.authorization, AUTHORIZATION_KEYS, 'STATUS_REANCHOR_AUTHORIZATION');
  const authorization = { ...input.authorization };
  if (authorization.ownerAuthorized !== true) throw new Error('STATUS_REANCHOR_OWNER_AUTHORIZATION_REQUIRED');
  requiredText(authorization.predecessorReceiptId, 'STATUS_REANCHOR_PREDECESSOR_RECEIPT');
  requiredText(authorization.assetId, 'STATUS_REANCHOR_ASSET_ID');
  requiredText(authorization.revision, 'STATUS_REANCHOR_REVISION', /^(?:NUMERIC-)?[rv]?\d+(?:-derived)?(?:\/(?:BOLD|APPB))?$/i);
  requiredText(authorization.sha256, 'STATUS_REANCHOR_SHA256', /^[a-f0-9]{64}$/);
  requiredText(authorization.driveFileId, 'STATUS_REANCHOR_DRIVE_FILE_ID', /^[A-Za-z0-9_-]{8,200}$/);
  if (!['HE', 'EN'].includes(authorization.language) || authorization.surface !== 'VERTICAL' ||
      authorization.width !== 1080 || authorization.height !== 1920) throw new Error('STATUS_REANCHOR_ASSET_IDENTITY_INVALID');
  if (exactIso(authorization.scheduledAt, 'STATUS_REANCHOR_SCHEDULED_AT') <= now)
    throw new Error('STATUS_REANCHOR_SCHEDULE_NOT_FUTURE');
  const requestKey = reanchorRequestKey(authorization);
  if (!requestKey || input.requestKey !== requestKey) throw new Error('STATUS_REANCHOR_REQUEST_KEY_MISMATCH');
  return { ...input, authorization, requestKey };
}
function sanitizeResult(result) {
  const safe = { state: String(result?.state || ''), reason: result?.reason ? String(result.reason) : undefined,
    assetId: result?.assetId ? String(result.assetId) : undefined,
    language: result?.language ? String(result.language) : undefined,
    scheduledAt: result?.scheduledAt ? String(result.scheduledAt) : undefined,
    predecessorReceiptId: result?.predecessorReceiptId ? String(result.predecessorReceiptId) : undefined,
    reanchorRequestKey: result?.reanchorRequestKey ? String(result.reanchorRequestKey) : undefined,
    schedulerReadback: result?.schedulerReadback === true, replay: result?.replay === true };
  return Object.fromEntries(Object.entries(safe).filter(([, value]) => value !== undefined));
}
async function runAuthorizedReanchorInvocation(input, { env = process.env, clock = Date.now, execute = authorizedReanchor } = {}) {
  const invocation = validateAuthorizedReanchorInvocation(input, { env, now: clock() });
  const result = sanitizeResult(await execute({ authorization: invocation.authorization,
    authorizationExpiresAt: invocation.expiresAt, env, clock }));
  if (!['SCHEDULED', 'HELD', 'UNKNOWN'].includes(result.state)) throw new Error('STATUS_REANCHOR_RESULT_STATE_INVALID');
  if (result.state === 'SCHEDULED' && (!result.schedulerReadback || result.assetId !== invocation.authorization.assetId ||
      result.scheduledAt !== invocation.authorization.scheduledAt ||
      result.predecessorReceiptId !== invocation.authorization.predecessorReceiptId ||
      result.reanchorRequestKey !== invocation.requestKey)) throw new Error('STATUS_REANCHOR_CANONICAL_READBACK_REQUIRED');
  return { kind: INVOCATION_KIND, authorizationId: invocation.authorizationId, target: TARGET,
    requestKey: invocation.requestKey, result };
}
function parseInvocationArgs(argv) {
  if (!Array.isArray(argv) || argv.length !== 3 || argv[0] !== '--apply' || argv[1] !== '--authorization-file' || !argv[2])
    throw new Error('Usage: npm run life-skills:status:reanchor -- --apply --authorization-file <short-lived-json>');
  return { authorizationFile: argv[2] };
}

module.exports = { INVOCATION_KIND, APPROVAL_SCOPE, TARGET, MAX_AUTHORIZATION_LIFETIME_MS,
  validateAuthorizedReanchorInvocation, runAuthorizedReanchorInvocation, parseInvocationArgs };
