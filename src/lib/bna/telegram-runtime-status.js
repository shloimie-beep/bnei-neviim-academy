const LOCAL_TELEGRAM_LOCK_STALE_MINUTES = 60;

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
  runtimeAgentKey = 'telegram-academy-bridge',
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

  if (!tokenConfigured) blockers.push('Telegram bot token is not configured for the active academy bridge.');
  if (!allowedChatIdsConfigured) blockers.push('Allowed Telegram chat IDs are not configured.');

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
  buildTelegramRuntimeReadiness,
  isHostedRuntimeFresh,
  isLocalLockStale,
};
