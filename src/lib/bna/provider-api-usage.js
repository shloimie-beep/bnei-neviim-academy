'use strict';

const crypto = require('node:crypto');

const PROVIDER_BOT_FUTURE_REQUIREMENT = Object.freeze({
  id: 'MEM-20260623-007',
  title: 'Provider Workspace Bot',
  scope: 'future',
  status: 'planned_not_implemented',
  requirement:
    'Provider Workspace Bot is a future workspace-scoped assistant, similar to the existing BNA assistant, adapted for provider permissions and provider data. API usage must be tracked by workspace, user, feature or agent, bot identifier, provider/model, request counts, tokens, cost, latency, success/failure, period, environment, and correlation ID. It must never use or expose cross-provider data.',
});

const PROVIDER_API_USAGE_TABLE = 'bna_provider_api_usage_events';

const SECRET_FIELD_PATTERN = /(api[-_]?key|authorization|bearer|credential|full[-_]?prompt|messages?|prompt|response|secret|token|password|private)/i;

function safeString(value, max = 160) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.length > max ? text.slice(0, max) : text;
}

function normalizeWorkspaceKey(value) {
  return safeString(value, 120);
}

function nonNegativeInteger(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return fallback;
  return Math.floor(number);
}

function nonNegativeNumberOrNull(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return number;
}

function normalizeTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date(0).toISOString();
  return date.toISOString();
}

function sha256(value = '') {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function billingPeriodFor(timestamp, explicitPeriod) {
  const explicit = safeString(explicitPeriod, 24);
  if (explicit && /^\d{4}-\d{2}$/.test(explicit)) return explicit;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '1970-01';
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function scrubMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !SECRET_FIELD_PATTERN.test(key))
      .map(([key, value]) => [safeString(key, 80), safeString(value, 240)])
      .filter(([key, value]) => key && value != null)
  );
}

function normalizeProviderApiUsageEvent(input = {}) {
  const workspaceKey = normalizeWorkspaceKey(
    input.workspace_key || input.workspaceKey || input.workspace || input.tenant_key || input.tenantKey
  );
  if (!workspaceKey) {
    throw new Error('workspace_key is required for provider API usage events');
  }

  const timestamp = normalizeTimestamp(input.timestamp || input.created_at || input.createdAt);
  const providerKey = safeString(
    input.provider_key
      || input.providerKey
      || input.provider
      || input.ai_provider
      || input.aiProvider
      || input.model_provider
      || input.modelProvider,
    80
  );
  const modelProviderKey = safeString(
    input.model_provider_key
      || input.modelProviderKey
      || input.model_provider
      || input.modelProvider
      || input.ai_provider
      || input.aiProvider
      || providerKey,
    80
  );
  const requestCount = nonNegativeInteger(input.request_count ?? input.requestCount ?? 1, 1);
  const inputTokens = nonNegativeInteger(input.input_tokens ?? input.inputTokens ?? input.prompt_tokens ?? input.promptTokens);
  const outputTokens = nonNegativeInteger(input.output_tokens ?? input.outputTokens ?? input.completion_tokens ?? input.completionTokens);
  const cachedTokens = nonNegativeInteger(input.cached_tokens ?? input.cachedTokens ?? input.cache_read_tokens ?? input.cacheReadTokens);
  const latencyMs = nonNegativeInteger(input.latency_ms ?? input.latencyMs ?? input.duration_ms ?? input.durationMs);
  const success =
    input.success == null
      ? !/^(failed|failure|error)$/i.test(String(input.status || 'success'))
      : Boolean(input.success);

  const event = {
    workspace_key: workspaceKey,
    user_id: safeString(input.user_id || input.userId || input.actor_id || input.actorId, 120),
    user_label: safeString(input.user_label || input.userLabel || input.actor_label || input.actorLabel, 160),
    provider_key: providerKey,
    model_provider_key: modelProviderKey,
    model: safeString(input.model || input.model_name || input.modelName, 120),
    feature_key: safeString(input.feature_key || input.featureKey || input.feature || input.agent_key || input.agentKey, 120),
    bot_identifier: safeString(input.bot_identifier || input.botIdentifier || input.bot_id || input.botId, 120),
    request_count: requestCount,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cached_tokens: cachedTokens,
    estimated_cost_usd: nonNegativeNumberOrNull(input.estimated_cost_usd ?? input.estimatedCostUsd ?? input.estimated_cost),
    actual_cost_usd: nonNegativeNumberOrNull(input.actual_cost_usd ?? input.actualCostUsd ?? input.actual_cost),
    latency_ms: latencyMs,
    success,
    error_category: success ? null : safeString(input.error_category || input.errorCategory || input.error_type || input.errorType, 120),
    timestamp,
    billing_period: billingPeriodFor(timestamp, input.billing_period || input.billingPeriod),
    quota_key: safeString(input.quota_key || input.quotaKey || input.quota || input.limit_key || input.limitKey, 120),
    environment: safeString(input.environment || input.env || process.env.NODE_ENV || 'development', 40),
    request_correlation_id: safeString(
      input.request_correlation_id || input.requestCorrelationId || input.correlation_id || input.correlationId,
      160
    ),
    metadata: scrubMetadata(input.metadata),
  };
  return {
    idempotency_key: providerApiUsageIdempotencyKey(input, event),
    ...event,
  };
}

function roleList(identity = {}) {
  return []
    .concat(identity.roles || [])
    .concat(identity.role || [])
    .concat(identity.platformRole || [])
    .concat(identity.workspaceRole || [])
    .map((role) => String(role).trim().toLowerCase())
    .filter(Boolean);
}

function workspaceList(identity = {}) {
  const workspaces = []
    .concat(identity.allowedWorkspaces || [])
    .concat(identity.workspaceKeys || [])
    .concat(identity.workspaces || [])
    .concat(identity.workspaceKey || [])
    .concat(identity.workspace_key || []);
  return workspaces
    .map((workspace) => {
      if (typeof workspace === 'string') return workspace;
      return workspace?.workspace_key || workspace?.workspaceKey || workspace?.key || workspace?.id;
    })
    .map(normalizeWorkspaceKey)
    .filter(Boolean);
}

function permissionList(identity = {}) {
  return []
    .concat(identity.permissions || [])
    .concat(identity.allowedPermissions || [])
    .map((permission) => String(permission).trim().toLowerCase())
    .filter(Boolean);
}

function isPlatformScope(identity = {}) {
  const roles = roleList(identity);
  return Boolean(
    identity.isSuperAdmin ||
      identity.scope === 'all' ||
      identity.scope === 'platform' ||
      roles.includes('super_admin') ||
      roles.includes('platform_super_admin') ||
      roles.includes('bna_platform_admin')
  );
}

function canReadProviderApiUsage(identity = {}, workspaceKey) {
  if (isPlatformScope(identity)) return true;
  const normalizedWorkspace = normalizeWorkspaceKey(workspaceKey);
  if (!normalizedWorkspace || !workspaceList(identity).includes(normalizedWorkspace)) return false;

  const roles = roleList(identity);
  const permissions = permissionList(identity);
  return (
    permissions.includes('api_usage:read') ||
    permissions.includes('usage:read') ||
    permissions.includes('workspace:usage:read') ||
    roles.includes('provider_workspace_owner') ||
    roles.includes('provider_workspace_admin') ||
    roles.includes('workspace_owner') ||
    roles.includes('workspace_admin')
  );
}

function filterProviderApiUsageForIdentity(events, identity = {}) {
  return (events || [])
    .map(normalizeProviderApiUsageEvent)
    .filter((event) => canReadProviderApiUsage(identity, event.workspace_key));
}

function aggregateProviderApiUsage(events, options = {}) {
  const identity = options.identity || {};
  const workspaceKey = normalizeWorkspaceKey(options.workspaceKey || options.workspace_key);
  const normalizedEvents = (events || []).map(normalizeProviderApiUsageEvent);
  const scopedEvents = normalizedEvents.filter((event) => {
    if (workspaceKey && event.workspace_key !== workspaceKey) return false;
    return canReadProviderApiUsage(identity, event.workspace_key);
  });

  const totals = {
    workspace_key: workspaceKey || null,
    request_count: 0,
    input_tokens: 0,
    output_tokens: 0,
    cached_tokens: 0,
    estimated_cost_usd: 0,
    actual_cost_usd: 0,
    actual_cost_available: false,
    success_count: 0,
    failure_count: 0,
    average_latency_ms: 0,
  };
  const byFeature = new Map();
  const byBot = new Map();
  const byModelProvider = new Map();
  let latencyCount = 0;

  for (const event of scopedEvents) {
    totals.request_count += event.request_count;
    totals.input_tokens += event.input_tokens;
    totals.output_tokens += event.output_tokens;
    totals.cached_tokens += event.cached_tokens;
    totals.estimated_cost_usd += event.estimated_cost_usd || 0;
    if (event.actual_cost_usd != null) {
      totals.actual_cost_available = true;
      totals.actual_cost_usd += event.actual_cost_usd;
    }
    if (event.success) totals.success_count += 1;
    else totals.failure_count += 1;
    if (event.latency_ms > 0) {
      latencyCount += 1;
      totals.average_latency_ms += event.latency_ms;
    }
    increment(byFeature, event.feature_key || 'unclassified', event.request_count);
    increment(byBot, event.bot_identifier || 'none', event.request_count);
    increment(byModelProvider, [event.model_provider_key || event.provider_key || 'unknown', event.model || 'unknown'].join(':'), event.request_count);
  }

  totals.estimated_cost_usd = roundMoney(totals.estimated_cost_usd);
  totals.actual_cost_usd = totals.actual_cost_available ? roundMoney(totals.actual_cost_usd) : null;
  totals.average_latency_ms = latencyCount ? Math.round(totals.average_latency_ms / latencyCount) : 0;

  return {
    totals,
    event_count: scopedEvents.length,
    events: scopedEvents,
    by_feature: Object.fromEntries(byFeature),
    by_bot: Object.fromEntries(byBot),
    by_model_provider: Object.fromEntries(byModelProvider),
  };
}

function providerApiUsageIdempotencyKey(input = {}, event = null) {
  const explicit = safeString(
    input.idempotency_key || input.idempotencyKey || input.event_id || input.eventId,
    180
  );
  if (explicit) return explicit;
  const normalized = event || {};
  const parts = [
    normalized.workspace_key,
    normalized.request_correlation_id,
    normalized.timestamp,
    normalized.feature_key,
    normalized.bot_identifier,
    normalized.provider_key,
    normalized.model_provider_key,
    normalized.model,
    normalized.request_count,
    normalized.input_tokens,
    normalized.output_tokens,
    normalized.cached_tokens,
    normalized.success,
    normalized.error_category,
  ];
  return `usage_${sha256(parts.map((part) => part ?? '').join('|')).slice(0, 32)}`;
}

function assertUsageDb(db) {
  if (!db || typeof db.query !== 'function') {
    throw new Error('provider API usage persistence requires a db client with query(sql, params)');
  }
}

function assertSafeUsageTable(tableName = PROVIDER_API_USAGE_TABLE) {
  if (!/^[a-z][a-z0-9_]*$/i.test(tableName)) {
    throw new Error('unsafe provider API usage table name');
  }
  return tableName;
}

function usageEventFromRow(row = {}) {
  return normalizeProviderApiUsageEvent({
    idempotency_key: row.idempotency_key,
    workspace_key: row.workspace_key,
    user_id: row.user_id,
    user_label: row.user_label,
    provider_key: row.provider_key,
    model_provider_key: row.model_provider_key,
    model: row.model,
    feature_key: row.feature_key,
    bot_identifier: row.bot_identifier,
    request_count: row.request_count,
    input_tokens: row.input_tokens,
    output_tokens: row.output_tokens,
    cached_tokens: row.cached_tokens,
    estimated_cost_usd: row.estimated_cost_usd,
    actual_cost_usd: row.actual_cost_usd,
    latency_ms: row.latency_ms,
    success: row.success,
    error_category: row.error_category,
    timestamp: row.occurred_at || row.timestamp || row.created_at,
    billing_period: row.billing_period,
    quota_key: row.quota_key,
    environment: row.environment,
    request_correlation_id: row.request_correlation_id,
    metadata: row.metadata,
  });
}

function normalizeLimit(value, fallback = 50, max = 500) {
  const number = nonNegativeInteger(value, fallback);
  return Math.max(1, Math.min(max, number || fallback));
}

function normalizeOffset(value) {
  return nonNegativeInteger(value, 0);
}

function visibleWorkspaceKeysForIdentity(identity = {}) {
  if (isPlatformScope(identity)) return null;
  return workspaceList(identity)
    .filter((workspaceKey) => canReadProviderApiUsage(identity, workspaceKey));
}

function buildProviderApiUsageListQuery(options = {}) {
  const tableName = assertSafeUsageTable(options.tableName || PROVIDER_API_USAGE_TABLE);
  const values = [];
  const where = [];
  const identity = options.identity || {};
  const workspaceKey = normalizeWorkspaceKey(options.workspaceKey || options.workspace_key);
  if (workspaceKey) {
    if (!canReadProviderApiUsage(identity, workspaceKey)) {
      const error = new Error('provider API usage access denied for workspace');
      error.statusCode = 403;
      throw error;
    }
    values.push(workspaceKey);
    where.push(`workspace_key = $${values.length}`);
  } else {
    const visibleWorkspaceKeys = visibleWorkspaceKeysForIdentity(identity);
    if (visibleWorkspaceKeys && !visibleWorkspaceKeys.length) {
      const error = new Error('provider API usage access denied');
      error.statusCode = 403;
      throw error;
    }
    if (visibleWorkspaceKeys) {
      values.push(visibleWorkspaceKeys);
      where.push(`workspace_key = ANY($${values.length})`);
    }
  }

  for (const [inputKey, column, maxLength] of [
    ['providerKey', 'provider_key', 80],
    ['provider_key', 'provider_key', 80],
    ['modelProviderKey', 'model_provider_key', 80],
    ['model_provider_key', 'model_provider_key', 80],
    ['featureKey', 'feature_key', 120],
    ['feature_key', 'feature_key', 120],
    ['botIdentifier', 'bot_identifier', 120],
    ['bot_identifier', 'bot_identifier', 120],
    ['environment', 'environment', 40],
    ['billingPeriod', 'billing_period', 24],
    ['billing_period', 'billing_period', 24],
  ]) {
    const value = safeString(options[inputKey], maxLength);
    if (!value) continue;
    values.push(value);
    where.push(`${column} = $${values.length}`);
  }

  const dateFrom = safeString(options.dateFrom || options.date_from, 40);
  if (dateFrom) {
    values.push(normalizeTimestamp(dateFrom));
    where.push(`occurred_at >= $${values.length}`);
  }
  const dateTo = safeString(options.dateTo || options.date_to, 40);
  if (dateTo) {
    values.push(normalizeTimestamp(dateTo));
    where.push(`occurred_at < $${values.length}`);
  }
  if (options.success !== undefined && options.success !== null && options.success !== '') {
    values.push(Boolean(options.success));
    where.push(`success = $${values.length}`);
  }

  values.push(normalizeLimit(options.limit, 50, 500));
  const limitIndex = values.length;
  values.push(normalizeOffset(options.offset));
  const offsetIndex = values.length;
  const sql = [
    `SELECT idempotency_key, workspace_key, user_id, user_label, provider_key, model_provider_key, model,`,
    `       feature_key, bot_identifier, request_count, input_tokens, output_tokens, cached_tokens,`,
    `       estimated_cost_usd, actual_cost_usd, latency_ms, success, error_category, occurred_at,`,
    `       billing_period, quota_key, environment, request_correlation_id, metadata, created_at`,
    `FROM ${tableName}`,
    where.length ? `WHERE ${where.join(' AND ')}` : '',
    `ORDER BY occurred_at DESC, created_at DESC`,
    `LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
  ].filter(Boolean).join('\n');
  return { sql, values };
}

async function recordProviderApiUsageEvent({ db, event, tableName = PROVIDER_API_USAGE_TABLE } = {}) {
  assertUsageDb(db);
  const normalized = normalizeProviderApiUsageEvent(event);
  const table = assertSafeUsageTable(tableName);
  const values = [
    normalized.idempotency_key,
    normalized.workspace_key,
    normalized.user_id,
    normalized.user_label,
    normalized.provider_key,
    normalized.model_provider_key,
    normalized.model,
    normalized.feature_key,
    normalized.bot_identifier,
    normalized.request_count,
    normalized.input_tokens,
    normalized.output_tokens,
    normalized.cached_tokens,
    normalized.estimated_cost_usd,
    normalized.actual_cost_usd,
    normalized.latency_ms,
    normalized.success,
    normalized.error_category,
    normalized.timestamp,
    normalized.billing_period,
    normalized.quota_key,
    normalized.environment,
    normalized.request_correlation_id,
    JSON.stringify(normalized.metadata || {}),
  ];
  const insertSql = `
INSERT INTO ${table} (
  idempotency_key, workspace_key, user_id, user_label, provider_key, model_provider_key, model,
  feature_key, bot_identifier, request_count, input_tokens, output_tokens, cached_tokens,
  estimated_cost_usd, actual_cost_usd, latency_ms, success, error_category, occurred_at,
  billing_period, quota_key, environment, request_correlation_id, metadata
) VALUES (
  $1, $2, $3, $4, $5, $6, $7,
  $8, $9, $10, $11, $12, $13,
  $14, $15, $16, $17, $18, $19,
  $20, $21, $22, $23, $24::jsonb
)
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING *`;
  const inserted = await db.query(insertSql, values);
  if (inserted.rows?.[0]) {
    return {
      recorded: true,
      duplicate: false,
      event: usageEventFromRow(inserted.rows[0]),
      row: inserted.rows[0],
    };
  }
  const existing = await db.query(`SELECT * FROM ${table} WHERE idempotency_key = $1 LIMIT 1`, [normalized.idempotency_key]);
  return {
    recorded: false,
    duplicate: true,
    reason: 'duplicate_idempotency_key',
    event: usageEventFromRow(existing.rows?.[0] || normalized),
    row: existing.rows?.[0] || null,
  };
}

async function listProviderApiUsageEvents({ db, tableName = PROVIDER_API_USAGE_TABLE, ...options } = {}) {
  assertUsageDb(db);
  const { sql, values } = buildProviderApiUsageListQuery({ ...options, tableName });
  const result = await db.query(sql, values);
  return {
    events: (result.rows || []).map(usageEventFromRow),
    limit: values[values.length - 2],
    offset: values[values.length - 1],
  };
}

async function aggregateProviderApiUsageFromStore({ db, tableName = PROVIDER_API_USAGE_TABLE, ...options } = {}) {
  const { events } = await listProviderApiUsageEvents({
    db,
    tableName,
    ...options,
    limit: options.limit || 500,
    offset: options.offset || 0,
  });
  return aggregateProviderApiUsage(events, {
    workspaceKey: options.workspaceKey || options.workspace_key,
    identity: options.identity,
  });
}

function createProviderApiUsageStore({ db, tableName = PROVIDER_API_USAGE_TABLE } = {}) {
  assertUsageDb(db);
  return {
    table_name: assertSafeUsageTable(tableName),
    async record(event = {}) {
      return recordProviderApiUsageEvent({ db, tableName, event });
    },
    async list(options = {}) {
      return listProviderApiUsageEvents({ db, tableName, ...options });
    },
    async aggregate(options = {}) {
      return aggregateProviderApiUsageFromStore({ db, tableName, ...options });
    },
  };
}

function createProviderApiUsageRecorder(options = {}) {
  const writeEvent = typeof options.writeEvent === 'function' ? options.writeEvent : null;
  const usageStore = options.usageStore || (options.db ? createProviderApiUsageStore({ db: options.db }) : null);
  const defaultEnvironment = safeString(options.environment || process.env.NODE_ENV || 'development', 40);
  const now = typeof options.now === 'function' ? options.now : () => new Date();

  return {
    async record(input = {}) {
      const event = normalizeProviderApiUsageEvent({
        ...input,
        timestamp: input.timestamp || input.created_at || input.createdAt || now().toISOString(),
        environment: input.environment || input.env || defaultEnvironment,
      });

      if (usageStore) {
        return usageStore.record(event);
      }

      if (!writeEvent) {
        return {
          recorded: false,
          reason: 'no_usage_event_sink_configured',
          event,
        };
      }

      await writeEvent(event);
      return {
        recorded: true,
        event,
      };
    },
  };
}

function increment(map, key, amount) {
  map.set(key, (map.get(key) || 0) + amount);
}

function roundMoney(value) {
  return Math.round(value * 1000000) / 1000000;
}

function providerApiUsageEmptyState(workspaceKey) {
  return {
    workspace_key: normalizeWorkspaceKey(workspaceKey),
    instrumented: false,
    title: 'API usage is not instrumented yet',
    message:
      'This workspace has no recorded API usage. Future provider bot and AI features must call the workspace-scoped usage recorder before usage, tokens, latency, quota, or estimated cost can be shown.',
    displays_fabricated_usage: false,
    requires_feature_flag: true,
  };
}

module.exports = {
  PROVIDER_BOT_FUTURE_REQUIREMENT,
  PROVIDER_API_USAGE_TABLE,
  aggregateProviderApiUsage,
  aggregateProviderApiUsageFromStore,
  buildProviderApiUsageListQuery,
  canReadProviderApiUsage,
  createProviderApiUsageRecorder,
  createProviderApiUsageStore,
  filterProviderApiUsageForIdentity,
  listProviderApiUsageEvents,
  normalizeProviderApiUsageEvent,
  providerApiUsageIdempotencyKey,
  providerApiUsageEmptyState,
  recordProviderApiUsageEvent,
};
