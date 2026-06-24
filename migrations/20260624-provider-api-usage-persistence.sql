-- Provider / assistant API usage persistence proposal.
-- Scope: additive, idempotent schema for the assistant-ramble-usage lane.
-- Do not apply to production in this lane. Final integration/deployment needs
-- operator approval and release-wide validation before this migration runs.

BEGIN;

CREATE TABLE IF NOT EXISTS bna_provider_api_usage_events (
  id BIGSERIAL PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  workspace_key TEXT NOT NULL,
  user_id TEXT,
  user_label TEXT,
  provider_key TEXT,
  model_provider_key TEXT,
  model TEXT,
  feature_key TEXT,
  bot_identifier TEXT,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count >= 0),
  input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  cached_tokens INTEGER NOT NULL DEFAULT 0 CHECK (cached_tokens >= 0),
  estimated_cost_usd NUMERIC(14, 8) CHECK (estimated_cost_usd IS NULL OR estimated_cost_usd >= 0),
  actual_cost_usd NUMERIC(14, 8) CHECK (actual_cost_usd IS NULL OR actual_cost_usd >= 0),
  latency_ms INTEGER NOT NULL DEFAULT 0 CHECK (latency_ms >= 0),
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_category TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  billing_period TEXT NOT NULL,
  quota_key TEXT,
  environment TEXT NOT NULL DEFAULT 'development',
  request_correlation_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bna_provider_api_usage_no_private_metadata CHECK (
    NOT (metadata ? 'prompt')
    AND NOT (metadata ? 'messages')
    AND NOT (metadata ? 'response')
    AND NOT (metadata ? 'api_key')
    AND NOT (metadata ? 'authorization')
    AND NOT (metadata ? 'secret')
    AND NOT (metadata ? 'token')
    AND NOT (metadata ? 'password')
  )
);

CREATE INDEX IF NOT EXISTS idx_bna_provider_api_usage_workspace_time
  ON bna_provider_api_usage_events(workspace_key, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_bna_provider_api_usage_workspace_period
  ON bna_provider_api_usage_events(workspace_key, billing_period, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_bna_provider_api_usage_feature_bot
  ON bna_provider_api_usage_events(workspace_key, feature_key, bot_identifier, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_bna_provider_api_usage_model_provider
  ON bna_provider_api_usage_events(workspace_key, model_provider_key, model, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_bna_provider_api_usage_environment
  ON bna_provider_api_usage_events(environment, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_bna_provider_api_usage_failures
  ON bna_provider_api_usage_events(workspace_key, success, error_category, occurred_at DESC);

CREATE OR REPLACE VIEW bna_provider_api_usage_daily_rollups AS
SELECT
  workspace_key,
  billing_period,
  date_trunc('day', occurred_at)::date AS usage_date,
  provider_key,
  model_provider_key,
  model,
  feature_key,
  bot_identifier,
  environment,
  COUNT(*) AS event_count,
  SUM(request_count) AS request_count,
  SUM(input_tokens) AS input_tokens,
  SUM(output_tokens) AS output_tokens,
  SUM(cached_tokens) AS cached_tokens,
  SUM(COALESCE(estimated_cost_usd, 0)) AS estimated_cost_usd,
  CASE
    WHEN COUNT(*) FILTER (WHERE actual_cost_usd IS NOT NULL) = 0 THEN NULL
    ELSE SUM(COALESCE(actual_cost_usd, 0))
  END AS actual_cost_usd,
  COUNT(*) FILTER (WHERE success) AS success_count,
  COUNT(*) FILTER (WHERE NOT success) AS failure_count,
  AVG(NULLIF(latency_ms, 0)) AS average_latency_ms
FROM bna_provider_api_usage_events
GROUP BY
  workspace_key,
  billing_period,
  date_trunc('day', occurred_at)::date,
  provider_key,
  model_provider_key,
  model,
  feature_key,
  bot_identifier,
  environment;

COMMIT;
