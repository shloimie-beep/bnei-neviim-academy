const LOCAL_TELEGRAM_LOCK_STALE_MINUTES = 60;

const TELEGRAM_SIDEKICK_RUNTIME_KEYS = Object.freeze({
  shloimie: 'telegram-shloimie-bridge',
  rabbi: 'telegram-rabbi-onetime-bridge',
  legacyAcademy: 'telegram-academy-bridge',
});

const TELEGRAM_SIDEKICK_PROFILES = Object.freeze({
  bna: Object.freeze({
    key: 'telegram_shloimie_super_admin',
    label: 'Shloimie Telegram super-admin',
    role: 'super_admin',
    scope: Object.freeze({ type: 'all', workspace_key: 'platform', project_key: null }),
    runtimeAgentKey: TELEGRAM_SIDEKICK_RUNTIME_KEYS.shloimie,
  }),
  'rabbi-elie-scheller': Object.freeze({
    key: 'telegram_rabbi_scheller_provider',
    label: 'Rabbi Elie Scheller Telegram provider admin',
    role: 'provider_admin',
    scope: Object.freeze({
      type: 'project',
      workspace_key: 'rabbi_sheller_provider',
      project_key: 'one_time_mishnah_class',
    }),
    runtimeAgentKey: TELEGRAM_SIDEKICK_RUNTIME_KEYS.rabbi,
  }),
});

function normalizeTelegramBridgeProfile(value = '') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
  return ['rabbi-elie', 'rabbi-elie-scheller', 'elie-scheller', 'one-time-rabbi'].includes(normalized)
    ? 'rabbi-elie-scheller'
    : 'bna';
}

function telegramSidekickProfileForBridge(value = '') {
  return TELEGRAM_SIDEKICK_PROFILES[normalizeTelegramBridgeProfile(value)] || TELEGRAM_SIDEKICK_PROFILES.bna;
}

function normalizeTelegramChatIdList(values = []) {
  return values
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);
}

function verifyExpectedTelegramBotIdentity(botIdentity = {}, config = {}) {
  const expectedId = String(config.expectedBotId || '').trim();
  const expectedUsername = String(config.expectedBotUsername || '').trim().replace(/^@/, '').toLowerCase();
  const actualId = String(botIdentity.id || '').trim();
  const actualUsername = String(botIdentity.username || '').trim().replace(/^@/, '').toLowerCase();
  const mismatches = [];

  if (expectedId && actualId && expectedId !== actualId) {
    mismatches.push('expected_bot_id_mismatch');
  }
  if (expectedUsername && actualUsername && expectedUsername !== actualUsername) {
    mismatches.push('expected_bot_username_mismatch');
  }
  if (expectedId && !actualId) mismatches.push('expected_bot_id_unverified');
  if (expectedUsername && !actualUsername) mismatches.push('expected_bot_username_unverified');

  return {
    ok: mismatches.length === 0,
    mismatches,
    expected: {
      bot_id_configured: Boolean(expectedId),
      bot_username_configured: Boolean(expectedUsername),
    },
  };
}

function buildTelegramPrivateIdentityProfile(config = {}, botIdentity = {}) {
  const profile = telegramSidekickProfileForBridge(config.bridgeProfile);
  const allowedChatIds = normalizeTelegramChatIdList(config.allowedChatIds || []);
  const botCheck = verifyExpectedTelegramBotIdentity(botIdentity, config);
  return {
    profile_key: profile.key,
    profile_label: profile.label,
    role: profile.role,
    scope: profile.scope,
    runtime_agent_key: profile.runtimeAgentKey,
    allowed_chat_ids_count: allowedChatIds.length,
    private_chat_allowlist_required: true,
    private_chat_allowlist_configured: allowedChatIds.length > 0,
    expected_bot_identity: botCheck,
  };
}

function assertTelegramBridgeStartupPolicy(config = {}, botIdentity = {}) {
  const profile = buildTelegramPrivateIdentityProfile(config, botIdentity);
  const blockers = [];

  if (!config.botToken) blockers.push('telegram_bot_token_missing');
  if (!profile.private_chat_allowlist_configured) blockers.push('telegram_private_chat_allowlist_missing');
  if (!profile.expected_bot_identity.ok) blockers.push(...profile.expected_bot_identity.mismatches);
  if (profile.profile_key === 'telegram_rabbi_scheller_provider' && (!config.opsUsername || !config.opsPassword)) {
    blockers.push('rabbi_scoped_operations_credentials_missing');
  }

  if (blockers.length) {
    const error = new Error(`Telegram sidekick startup refused: ${blockers.join(', ')}`);
    error.code = 'TELEGRAM_SIDEKICK_STARTUP_REFUSED';
    error.blockers = blockers;
    error.profile = profile;
    throw error;
  }

  return profile;
}

function isLocalLockStale(lock = {}) {
  return Boolean(lock.present && lock.age_minutes !== null && lock.age_minutes > LOCAL_TELEGRAM_LOCK_STALE_MINUTES);
}

function isHostedRuntimeFresh(runtime = null) {
  if (!runtime) return false;
  return String(runtime.status || '').toLowerCase() === 'running' && !runtime.stale;
}

function normalizeHostedRuntime(runtime = null) {
  if (!runtime) return null;
  return {
    agent_key: runtime.agent_key || null,
    status: runtime.status || 'unknown',
    stale: Boolean(runtime.stale),
    last_seen_at: runtime.last_seen_at || null,
    started_at: runtime.started_at || null,
    host: runtime.host || null,
    pid: runtime.pid === null || runtime.pid === undefined ? null : Number(runtime.pid),
    mode: runtime.mode || null,
    stale_after_ms: runtime.stale_after_ms === null || runtime.stale_after_ms === undefined
      ? null
      : Number(runtime.stale_after_ms),
    details: runtime.details || {},
  };
}

function buildTelegramRuntimeReadiness({
  tokenConfigured = false,
  allowedChatIdsConfigured = false,
  localLock = { present: false, updated_at: null, age_minutes: null },
  localLog = { present: false, updated_at: null, age_minutes: null },
  hostedRuntime = null,
  runtimeAgentKey = TELEGRAM_SIDEKICK_RUNTIME_KEYS.shloimie,
  activeSource = 'scripts/telegram-kimi-bridge.mjs',
  legacyWebhookRoute = '/api/bna/telegram',
} = {}) {
  const hosted = normalizeHostedRuntime(hostedRuntime);
  const localStaleLock = isLocalLockStale(localLock);
  const configured = Boolean(tokenConfigured && allowedChatIdsConfigured);
  const runtimeSource = hosted
    ? 'agent_runtime_status'
    : (localLock.present || localLog.present ? 'local_runtime_files' : 'none');
  const runtimeHealthy = hosted ? isHostedRuntimeFresh(hosted) : Boolean(localLock.present && !localStaleLock);
  const blockers = [];

  if (!tokenConfigured) blockers.push('Telegram bot token is not configured for the active private sidekick bridge.');
  if (!allowedChatIdsConfigured) blockers.push('Allowed Telegram private chat IDs are not configured.');

  if (configured) {
    if (hosted) {
      if (!isHostedRuntimeFresh(hosted)) {
        if (String(hosted.status || '').toLowerCase() === 'error') {
          blockers.push('Hosted academy Telegram worker reported an error state.');
        } else if (hosted.stale) {
          blockers.push('Hosted academy Telegram worker heartbeat is stale; restart or redeploy the worker.');
        } else {
          blockers.push('Hosted academy Telegram worker is not currently running.');
        }
      }
    } else if (localLock.present && localStaleLock) {
      blockers.push('Local academy Telegram bridge lock appears stale; restart/status check is needed.');
    } else if (!localLock.present) {
      blockers.push('Academy Telegram bridge is configured but no hosted heartbeat or local bridge lock is present.');
    }
  }

  let status = configured ? 'configured' : 'not_configured';
  if (configured && !runtimeHealthy) {
    status = hosted || localLock.present ? 'blocked_runtime_stale' : 'needs_runtime';
  }

  return {
    configured,
    status,
    blockers,
    details: {
      bot_token_configured: Boolean(tokenConfigured),
      allowed_chat_ids_configured: Boolean(allowedChatIdsConfigured),
      runtime_agent_key: runtimeAgentKey,
      runtime_source: runtimeSource,
      bridge_runtime_healthy: runtimeHealthy,
      bridge_runtime_status: hosted ? hosted.status : (localLock.present ? 'running_local' : 'not_running'),
      bridge_runtime_stale: hosted ? Boolean(hosted.stale) : localStaleLock,
      bridge_runtime_last_seen_at: hosted?.last_seen_at || localLock.updated_at || localLog.updated_at || null,
      bridge_runtime_started_at: hosted?.started_at || null,
      bridge_runtime_host: hosted?.host || null,
      bridge_runtime_pid: hosted?.pid ?? null,
      bridge_runtime_mode: hosted?.mode || null,
      bridge_runtime_details: hosted?.details || {},
      bridge_lock_present: Boolean(localLock.present),
      bridge_lock_stale: localStaleLock,
      bridge_log_present: Boolean(localLog.present),
      bridge_log_age_minutes: localLog.age_minutes,
      active_source: activeSource,
      legacy_webhook_route: legacyWebhookRoute,
    },
  };
}

module.exports = {
  LOCAL_TELEGRAM_LOCK_STALE_MINUTES,
  TELEGRAM_SIDEKICK_PROFILES,
  TELEGRAM_SIDEKICK_RUNTIME_KEYS,
  assertTelegramBridgeStartupPolicy,
  buildTelegramPrivateIdentityProfile,
  buildTelegramRuntimeReadiness,
  isHostedRuntimeFresh,
  isLocalLockStale,
  normalizeTelegramChatIdList,
  telegramSidekickProfileForBridge,
  verifyExpectedTelegramBotIdentity,
};
