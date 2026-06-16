const {
  loadConfigValue,
  loadSecret,
  redactError,
} = require('./secret-loader');
const {
  requireExternalApproval,
} = require('./external-actions');

const MINIMUM_MEETING_SCOPE_CANDIDATES = [
  'meeting:write:admin',
  'meeting:read:admin',
  'user:read:admin',
];

function parseList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '').split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
}

function getZoomConfig(options = {}) {
  const repoRoot = options.repoRoot || process.cwd();
  const accountId = options.accountId !== undefined ? String(options.accountId || '').trim() : loadSecret({
    envName: 'ZOOM_ACCOUNT_ID',
    names: ['zoom-account-id', 'zoom'],
    fileNames: ['zoom-account-id.txt', 'ZOOM_ACCOUNT_ID.txt', 'zoom.txt'],
    repoRoot,
  }).value;
  const clientId = options.clientId !== undefined ? String(options.clientId || '').trim() : loadSecret({
    envName: 'ZOOM_CLIENT_ID',
    names: ['zoom-client-id', 'zoom'],
    fileNames: ['zoom-client-id.txt', 'ZOOM_CLIENT_ID.txt', 'zoom.txt'],
    repoRoot,
  }).value;
  const clientSecret = options.clientSecret !== undefined ? String(options.clientSecret || '').trim() : loadSecret({
    envName: 'ZOOM_CLIENT_SECRET',
    names: ['zoom-client-secret', 'zoom'],
    fileNames: ['zoom-client-secret.txt', 'ZOOM_CLIENT_SECRET.txt', 'zoom.txt'],
    repoRoot,
  }).value;
  return {
    accountId,
    clientId,
    clientSecret,
    accountOwner: String(options.accountOwner || loadConfigValue({
      envName: 'ZOOM_ACCOUNT_OWNER',
      names: ['zoom-account-owner', 'zoom'],
      fileNames: ['zoom-account-owner.txt', 'ZOOM_ACCOUNT_OWNER.txt', 'zoom.txt'],
      repoRoot,
    }) || 'unknown').trim() || 'unknown',
    hostUser: String(options.hostUser || loadConfigValue({
      envName: 'ZOOM_HOST_USER',
      names: ['zoom-host-user', 'zoom'],
      fileNames: ['zoom-host-user.txt', 'ZOOM_HOST_USER.txt', 'zoom.txt'],
      repoRoot,
    }) || 'me').trim() || 'me',
    configuredScopes: parseList(options.scopes || loadConfigValue({
      envName: 'ZOOM_SCOPES',
      names: ['zoom-scopes', 'zoom'],
      fileNames: ['zoom-scopes.txt', 'ZOOM_SCOPES.txt', 'zoom.txt'],
      repoRoot,
    })),
  };
}

function getZoomReadiness(options = {}) {
  const config = options.config || getZoomConfig(options);
  const missing = [
    config.accountId ? null : 'ZOOM_ACCOUNT_ID',
    config.clientId ? null : 'ZOOM_CLIENT_ID',
    config.clientSecret ? null : 'ZOOM_CLIENT_SECRET',
  ].filter(Boolean);
  const blockers = [];
  if (missing.length) blockers.push(`${missing.join(', ')} must be installed server-side through env/keyholder/.secrets.`);
  if (config.accountOwner === 'unknown') blockers.push('Zoom account owner/admin must be documented before meeting creation.');
  const scopeSet = new Set(config.configuredScopes);
  const missingScopeCandidates = MINIMUM_MEETING_SCOPE_CANDIDATES.filter((scope) => !scopeSet.has(scope));
  if (missingScopeCandidates.length) {
    blockers.push('Zoom Server-to-Server OAuth meeting scopes must be confirmed in the Zoom dashboard before write endpoints are enabled.');
  }
  return {
    provider: 'zoom',
    label: 'Zoom',
    configured: !missing.length,
    status: missing.length ? 'not_configured' : (missingScopeCandidates.length ? 'configured_but_insufficient_scope' : 'configured'),
    mode: 'server_to_server_oauth',
    accountOwner: config.accountOwner,
    hostUserConfigured: Boolean(config.hostUser),
    configuredScopesPresent: config.configuredScopes.length,
    safeActions: ['setup_checklist', 'meeting_preview'],
    blockedActions: ['meeting_create', 'account_grant', 'role_change', 'user_management'],
    blockers,
    lastCheckedAt: new Date().toISOString(),
  };
}

function buildZoomMeetingPreview(payload = {}, options = {}) {
  return {
    provider: 'zoom',
    preview_only: true,
    external_write_performed: false,
    readiness: getZoomReadiness(options),
    meeting: {
      topic: String(payload.topic || payload.title || 'BNA class meeting').slice(0, 180),
      start_time: payload.start_time || payload.startTime || null,
      duration_minutes: Number.isFinite(Number(payload.duration_minutes || payload.durationMinutes))
        ? Number(payload.duration_minutes || payload.durationMinutes)
        : 60,
      timezone: String(payload.timezone || 'Asia/Jerusalem'),
      agenda: String(payload.agenda || '').slice(0, 2000),
      host_user_configured: Boolean((options.config || getZoomConfig(options)).hostUser),
    },
  };
}

function assertZoomMeetingCreateApproved(payload = {}, options = {}) {
  const config = options.config || getZoomConfig(options);
  const readiness = getZoomReadiness({ ...options, config });
  requireExternalApproval({
    provider: 'zoom',
    action: 'meeting_create',
    riskLevel: 'high',
    previewOnly: false,
    confirm: payload.confirm || payload.confirmation_phrase || '',
    accountOwner: readiness.accountOwner,
    mode: readiness.mode,
    secrets: [config.clientSecret],
  });
  const error = new Error('Zoom meeting creation is intentionally not enabled in INT-05; use meeting preview until credentials, scopes, host, and approval are finalized.');
  error.status = 409;
  throw error;
}

function safeZoomError(error, config = {}) {
  return redactError(error, [config.clientSecret]);
}

module.exports = {
  MINIMUM_MEETING_SCOPE_CANDIDATES,
  assertZoomMeetingCreateApproved,
  buildZoomMeetingPreview,
  getZoomConfig,
  getZoomReadiness,
  safeZoomError,
};
