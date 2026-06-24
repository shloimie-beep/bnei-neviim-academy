const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  PROVIDER_BOT_FUTURE_REQUIREMENT,
  PROVIDER_API_USAGE_TABLE,
  aggregateProviderApiUsage,
  buildProviderApiUsageListQuery,
  canReadProviderApiUsage,
  createProviderApiUsageRecorder,
  createProviderApiUsageStore,
  filterProviderApiUsageForIdentity,
  normalizeProviderApiUsageEvent,
  providerApiUsageIdempotencyKey,
  providerApiUsageEmptyState,
} = require('../src/lib/bna/provider-api-usage');

const rabbiAdmin = {
  roles: ['provider_workspace_admin'],
  workspaceKeys: ['rabbi_sheller_provider'],
  permissions: ['api_usage:read'],
};

const otherProviderAdmin = {
  roles: ['provider_workspace_admin'],
  workspaceKeys: ['other_provider_workspace'],
  permissions: ['api_usage:read'],
};

const workspaceMember = {
  roles: ['provider_staff'],
  workspaceKeys: ['rabbi_sheller_provider'],
  permissions: [],
};

const platformAdmin = {
  roles: ['platform_super_admin'],
  scope: 'all',
};

const usageEvents = [
  {
    workspace_key: 'rabbi_sheller_provider',
    user_id: 'rabbi-admin-1',
    feature_key: 'future_provider_bot',
    bot_identifier: 'provider_bot',
    provider_key: 'openai',
    model: 'gpt-test',
    request_count: 2,
    input_tokens: 100,
    output_tokens: 40,
    cached_tokens: 15,
    estimated_cost_usd: 0.00425,
    latency_ms: 800,
    success: true,
    timestamp: '2026-06-23T09:10:11.000Z',
    request_correlation_id: 'req-rabbi-1',
    prompt: 'must not persist full private prompt',
    metadata: {
      safe_label: 'draft answer',
      apiKey: 'must-not-leak',
      full_prompt: 'must-not-leak',
    },
  },
  {
    workspace_key: 'rabbi_sheller_provider',
    feature_key: 'future_provider_bot',
    bot_identifier: 'provider_bot',
    provider_key: 'openai',
    model: 'gpt-test',
    request_count: 1,
    input_tokens: 30,
    output_tokens: 0,
    estimated_cost_usd: 0.0005,
    latency_ms: 1200,
    success: false,
    error_category: 'rate_limit',
    timestamp: '2026-06-23T09:20:11.000Z',
  },
  {
    workspace_key: 'other_provider_workspace',
    feature_key: 'future_provider_bot',
    bot_identifier: 'provider_bot',
    provider_key: 'openai',
    model: 'gpt-test',
    request_count: 9,
    input_tokens: 900,
    output_tokens: 400,
    estimated_cost_usd: 0.05,
    timestamp: '2026-06-23T09:30:11.000Z',
  },
];

test('provider API usage events require workspace scope and strip prompt/secret fields', () => {
  assert.throws(() => normalizeProviderApiUsageEvent({ feature_key: 'bot' }), /workspace_key is required/);

  const normalized = normalizeProviderApiUsageEvent(usageEvents[0]);
  assert.equal(normalized.workspace_key, 'rabbi_sheller_provider');
  assert.equal(normalized.idempotency_key, providerApiUsageIdempotencyKey(usageEvents[0], normalized));
  assert.equal(normalized.request_count, 2);
  assert.equal(normalized.model_provider_key, 'openai');
  assert.equal(normalized.billing_period, '2026-06');
  assert.equal(normalized.metadata.safe_label, 'draft answer');
  assert.equal(Object.hasOwn(normalized, 'prompt'), false);
  assert.equal(Object.hasOwn(normalized, 'messages'), false);
  assert.equal(Object.hasOwn(normalized.metadata, 'apiKey'), false);
  assert.equal(Object.hasOwn(normalized.metadata, 'full_prompt'), false);
});

test('provider API usage permissions do not grant cross-workspace reads', () => {
  assert.equal(canReadProviderApiUsage(rabbiAdmin, 'rabbi_sheller_provider'), true);
  assert.equal(canReadProviderApiUsage(rabbiAdmin, 'other_provider_workspace'), false);
  assert.equal(canReadProviderApiUsage(otherProviderAdmin, 'rabbi_sheller_provider'), false);
  assert.equal(canReadProviderApiUsage(workspaceMember, 'rabbi_sheller_provider'), false);
  assert.equal(canReadProviderApiUsage(platformAdmin, 'other_provider_workspace'), true);
});

test('Rabbi Scheller workspace usage filters and aggregates only his workspace', () => {
  const visible = filterProviderApiUsageForIdentity(usageEvents, rabbiAdmin);
  assert.equal(visible.length, 2);
  assert.deepEqual([...new Set(visible.map((event) => event.workspace_key))], ['rabbi_sheller_provider']);

  const rollup = aggregateProviderApiUsage(usageEvents, {
    workspaceKey: 'rabbi_sheller_provider',
    identity: rabbiAdmin,
  });
  assert.equal(rollup.event_count, 2);
  assert.equal(rollup.totals.request_count, 3);
  assert.equal(rollup.totals.input_tokens, 130);
  assert.equal(rollup.totals.output_tokens, 40);
  assert.equal(rollup.totals.cached_tokens, 15);
  assert.equal(rollup.totals.success_count, 1);
  assert.equal(rollup.totals.failure_count, 1);
  assert.equal(rollup.totals.estimated_cost_usd, 0.00475);
  assert.equal(rollup.totals.actual_cost_usd, null);
  assert.equal(rollup.by_feature.future_provider_bot, 3);
  assert.equal(rollup.by_bot.provider_bot, 3);
});

test('platform admin can aggregate platform-wide usage but provider admin cannot', () => {
  const platformRollup = aggregateProviderApiUsage(usageEvents, { identity: platformAdmin });
  assert.equal(platformRollup.event_count, 3);
  assert.equal(platformRollup.totals.request_count, 12);

  const providerRollup = aggregateProviderApiUsage(usageEvents, { identity: rabbiAdmin });
  assert.equal(providerRollup.event_count, 2);
  assert.equal(providerRollup.totals.request_count, 3);
});

test('API usage empty state is honest until real instrumentation exists', () => {
  const empty = providerApiUsageEmptyState('rabbi_sheller_provider');
  assert.equal(empty.workspace_key, 'rabbi_sheller_provider');
  assert.equal(empty.instrumented, false);
  assert.equal(empty.displays_fabricated_usage, false);
  assert.equal(empty.requires_feature_flag, true);
  assert.match(empty.message, /Future provider bot and AI features must call/i);
});

test('future bot code can call a workspace-scoped usage recorder without storing prompts or secrets', async () => {
  const written = [];
  const recorder = createProviderApiUsageRecorder({
    environment: 'test',
    now: () => new Date('2026-06-23T10:00:00.000Z'),
    writeEvent: async (event) => written.push(event),
  });

  const result = await recorder.record({
    workspace_key: 'rabbi_sheller_provider',
    user_id: 'rabbi-admin-1',
    feature_key: 'future_provider_bot',
    bot_identifier: 'provider_bot',
    provider_key: 'openai',
    model: 'gpt-test',
    request_count: 1,
    input_tokens: 12,
    output_tokens: 8,
    prompt: 'private prompt must not be persisted',
    metadata: {
      safe_label: 'class question',
      authorization: 'must-not-leak',
    },
  });

  assert.equal(result.recorded, true);
  assert.equal(written.length, 1);
  assert.equal(written[0].workspace_key, 'rabbi_sheller_provider');
  assert.equal(written[0].timestamp, '2026-06-23T10:00:00.000Z');
  assert.equal(written[0].environment, 'test');
  assert.equal(Object.hasOwn(written[0], 'prompt'), false);
  assert.equal(written[0].metadata.safe_label, 'class question');
  assert.equal(Object.hasOwn(written[0].metadata, 'authorization'), false);
});

test('usage recorder can persist through the canonical idempotent DB store', async () => {
  const queries = [];
  const db = {
    async query(sql, params = []) {
      queries.push({ sql, params });
      assert.doesNotMatch(sql, /prompt|messages|api[_-]?key|authorization|secret|password/i);
      if (/INSERT INTO bna_provider_api_usage_events/.test(sql)) {
        return {
          rows: [{
            id: 1,
            idempotency_key: params[0],
            workspace_key: params[1],
            user_id: params[2],
            user_label: params[3],
            provider_key: params[4],
            model_provider_key: params[5],
            model: params[6],
            feature_key: params[7],
            bot_identifier: params[8],
            request_count: params[9],
            input_tokens: params[10],
            output_tokens: params[11],
            cached_tokens: params[12],
            estimated_cost_usd: params[13],
            actual_cost_usd: params[14],
            latency_ms: params[15],
            success: params[16],
            error_category: params[17],
            occurred_at: params[18],
            billing_period: params[19],
            quota_key: params[20],
            environment: params[21],
            request_correlation_id: params[22],
            metadata: JSON.parse(params[23]),
            created_at: params[18],
          }],
        };
      }
      return { rows: [] };
    },
  };
  const recorder = createProviderApiUsageRecorder({
    db,
    environment: 'test',
    now: () => new Date('2026-06-24T09:00:00.000Z'),
  });

  const result = await recorder.record({
    workspace_key: 'rabbi_sheller_provider',
    user_id: 'provider-owner-1',
    provider_key: 'rabbi_sheller_provider',
    model_provider_key: 'openai',
    model: 'gpt-test',
    feature_key: 'provider_portal_assistant',
    bot_identifier: 'provider_bot',
    request_count: 1,
    input_tokens: 100,
    output_tokens: 50,
    cached_tokens: 10,
    estimated_cost_usd: 0.004,
    latency_ms: 700,
    request_correlation_id: 'corr-usage-1',
    prompt: 'do not persist',
    metadata: {
      route: '/provider',
      authorization: 'do not persist',
    },
  });

  assert.equal(result.recorded, true);
  assert.equal(result.event.workspace_key, 'rabbi_sheller_provider');
  assert.equal(result.event.model_provider_key, 'openai');
  assert.equal(result.event.metadata.route, '/provider');
  assert.equal(Object.hasOwn(result.event.metadata, 'authorization'), false);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /ON CONFLICT \(idempotency_key\) DO NOTHING/);
});

test('usage store detects duplicate idempotency keys without double-counting requests', async () => {
  const db = {
    async query(sql, params = []) {
      if (/INSERT INTO bna_provider_api_usage_events/.test(sql)) return { rows: [] };
      if (/SELECT \* FROM bna_provider_api_usage_events WHERE idempotency_key/.test(sql)) {
        return {
          rows: [{
            idempotency_key: params[0],
            workspace_key: 'rabbi_sheller_provider',
            provider_key: 'rabbi_sheller_provider',
            model_provider_key: 'openai',
            model: 'gpt-test',
            feature_key: 'provider_portal_assistant',
            bot_identifier: 'provider_bot',
            request_count: 1,
            input_tokens: 10,
            output_tokens: 5,
            cached_tokens: 0,
            success: true,
            occurred_at: '2026-06-24T09:00:00.000Z',
            billing_period: '2026-06',
            environment: 'test',
            metadata: {},
          }],
        };
      }
      return { rows: [] };
    },
  };
  const store = createProviderApiUsageStore({ db });
  const result = await store.record({
    workspace_key: 'rabbi_sheller_provider',
    idempotency_key: 'usage-existing',
    feature_key: 'provider_portal_assistant',
  });

  assert.equal(result.recorded, false);
  assert.equal(result.duplicate, true);
  assert.equal(result.reason, 'duplicate_idempotency_key');
  assert.equal(result.event.idempotency_key, 'usage-existing');
});

test('usage listing applies tenant isolation, filters, date range, and pagination', async () => {
  const { sql, values } = buildProviderApiUsageListQuery({
    identity: rabbiAdmin,
    workspaceKey: 'rabbi_sheller_provider',
    featureKey: 'provider_portal_assistant',
    modelProviderKey: 'openai',
    dateFrom: '2026-06-01T00:00:00.000Z',
    dateTo: '2026-07-01T00:00:00.000Z',
    limit: 25,
    offset: 50,
  });

  assert.match(sql, new RegExp(`FROM ${PROVIDER_API_USAGE_TABLE}`));
  assert.match(sql, /workspace_key = \$1/);
  assert.match(sql, /feature_key =/);
  assert.match(sql, /model_provider_key =/);
  assert.match(sql, /occurred_at >=/);
  assert.match(sql, /occurred_at </);
  assert.match(sql, /LIMIT \$\d+ OFFSET \$\d+/);
  assert.deepEqual(values.slice(0, 3), ['rabbi_sheller_provider', 'openai', 'provider_portal_assistant']);
  assert.equal(values.at(-2), 25);
  assert.equal(values.at(-1), 50);

  assert.throws(() => buildProviderApiUsageListQuery({
    identity: rabbiAdmin,
    workspaceKey: 'other_provider_workspace',
  }), /access denied/);
});

test('usage store reads visible workspace rows and aggregates without leaking another tenant', async () => {
  const queries = [];
  const db = {
    async query(sql, params = []) {
      queries.push({ sql, params });
      assert.match(sql, /workspace_key = \$1/);
      return {
        rows: usageEvents
          .filter((event) => event.workspace_key === params[0])
          .map((event) => ({
            ...normalizeProviderApiUsageEvent(event),
            occurred_at: event.timestamp,
          })),
      };
    },
  };
  const store = createProviderApiUsageStore({ db });
  const listed = await store.list({ identity: rabbiAdmin, workspaceKey: 'rabbi_sheller_provider' });
  assert.equal(listed.events.length, 2);
  assert.deepEqual([...new Set(listed.events.map((event) => event.workspace_key))], ['rabbi_sheller_provider']);

  const rollup = await store.aggregate({ identity: rabbiAdmin, workspaceKey: 'rabbi_sheller_provider' });
  assert.equal(rollup.totals.request_count, 3);
  assert.equal(rollup.event_count, 2);
});

test('usage recorder returns an honest not-recorded result until persistence is configured', async () => {
  const recorder = createProviderApiUsageRecorder({
    environment: 'test',
    now: () => new Date('2026-06-23T11:00:00.000Z'),
  });

  const result = await recorder.record({
    workspace_key: 'rabbi_sheller_provider',
    feature_key: 'future_provider_bot',
  });

  assert.equal(result.recorded, false);
  assert.equal(result.reason, 'no_usage_event_sink_configured');
  assert.equal(result.event.workspace_key, 'rabbi_sheller_provider');
  assert.equal(result.event.timestamp, '2026-06-23T11:00:00.000Z');
});

test('provider API usage migration declares no-prompt persistence, idempotency, indexes, and rollup view', () => {
  const migration = fs.readFileSync('migrations/20260624-provider-api-usage-persistence.sql', 'utf8');
  assert.match(migration, /CREATE TABLE IF NOT EXISTS bna_provider_api_usage_events/);
  assert.match(migration, /idempotency_key TEXT NOT NULL UNIQUE/);
  assert.match(migration, /workspace_key TEXT NOT NULL/);
  assert.match(migration, /model_provider_key TEXT/);
  assert.match(migration, /billing_period TEXT NOT NULL/);
  assert.match(migration, /request_correlation_id TEXT/);
  assert.match(migration, /metadata JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(migration, /bna_provider_api_usage_no_private_metadata/);
  assert.match(migration, /idx_bna_provider_api_usage_workspace_time/);
  assert.match(migration, /idx_bna_provider_api_usage_feature_bot/);
  assert.match(migration, /CREATE OR REPLACE VIEW bna_provider_api_usage_daily_rollups/);
  assert.doesNotMatch(migration, /full_prompt_body|raw_prompt|raw_response|api_key_value/i);
});

test('future provider bot requirement is durable and explicitly not implemented now', () => {
  assert.equal(PROVIDER_BOT_FUTURE_REQUIREMENT.status, 'planned_not_implemented');
  assert.match(PROVIDER_BOT_FUTURE_REQUIREMENT.requirement, /workspace-scoped assistant/i);
  assert.match(PROVIDER_BOT_FUTURE_REQUIREMENT.requirement, /never use or expose cross-provider data/i);
});
