const assert = require('node:assert/strict');
const test = require('node:test');

const {
  PROVIDER_BOT_FUTURE_REQUIREMENT,
  aggregateProviderApiUsage,
  canReadProviderApiUsage,
  createProviderApiUsageRecorder,
  filterProviderApiUsageForIdentity,
  normalizeProviderApiUsageEvent,
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
  assert.equal(normalized.request_count, 2);
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

test('future provider bot requirement is durable and explicitly not implemented now', () => {
  assert.equal(PROVIDER_BOT_FUTURE_REQUIREMENT.status, 'planned_not_implemented');
  assert.match(PROVIDER_BOT_FUTURE_REQUIREMENT.requirement, /workspace-scoped assistant/i);
  assert.match(PROVIDER_BOT_FUTURE_REQUIREMENT.requirement, /never use or expose cross-provider data/i);
});
