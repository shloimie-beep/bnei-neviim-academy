-- BNA Stripe sandbox billing lifecycle schema proposal.
-- Lane: codex/closeout-stripe-sandbox-20260624
-- Scope: schema only; do not apply to production without final integration review.
-- Secrets are intentionally absent. Store only Stripe object IDs, statuses, and redacted metadata.

CREATE TABLE IF NOT EXISTS bna_stripe_billing_customers (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL,
  member_id BIGINT,
  provider_id TEXT NOT NULL DEFAULT 'rabbi_scheller',
  stripe_customer_id TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  mode TEXT NOT NULL DEFAULT 'test',
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (mode IN ('test', 'live')),
  CHECK (status IN ('active', 'archived', 'deleted'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_stripe_billing_customers_unique
  ON bna_stripe_billing_customers (workspace_key, project_key, provider_id, mode, stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_bna_stripe_billing_customers_member
  ON bna_stripe_billing_customers (workspace_key, project_key, member_id);

CREATE TABLE IF NOT EXISTS bna_stripe_billing_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL,
  provider_id TEXT NOT NULL DEFAULT 'rabbi_scheller',
  member_id BIGINT,
  checkout_record_id BIGINT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT,
  offer_key TEXT,
  mode TEXT NOT NULL DEFAULT 'test',
  subscription_status TEXT NOT NULL DEFAULT 'incomplete',
  entitlement_status TEXT NOT NULL DEFAULT 'pending',
  trial_start_at TIMESTAMPTZ,
  trial_end_at TIMESTAMPTZ,
  current_period_start_at TIMESTAMPTZ,
  current_period_end_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  grace_until TIMESTAMPTZ,
  retry_state TEXT NOT NULL DEFAULT 'none',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (mode IN ('test', 'live')),
  CHECK (subscription_status IN ('incomplete', 'trialing', 'active', 'past_due', 'unpaid', 'paused', 'canceled', 'incomplete_expired')),
  CHECK (entitlement_status IN ('pending', 'trial', 'active', 'grace_period', 'payment_failed', 'scheduled_cancellation', 'revoked', 'manual_review')),
  CHECK (retry_state IN ('none', 'scheduled', 'needs_recovery', 'recovered', 'failed'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_stripe_billing_subscriptions_unique
  ON bna_stripe_billing_subscriptions (workspace_key, project_key, provider_id, mode, stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_bna_stripe_billing_subscriptions_member
  ON bna_stripe_billing_subscriptions (workspace_key, project_key, member_id, subscription_status);

CREATE TABLE IF NOT EXISTS bna_stripe_billing_invoices (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL,
  provider_id TEXT NOT NULL DEFAULT 'rabbi_scheller',
  member_id BIGINT,
  stripe_invoice_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  mode TEXT NOT NULL DEFAULT 'test',
  invoice_status TEXT NOT NULL DEFAULT 'draft',
  billing_reason TEXT,
  amount_due_cents INTEGER NOT NULL DEFAULT 0,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  amount_remaining_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,
  receipt_url TEXT,
  paid_at TIMESTAMPTZ,
  next_payment_attempt_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (mode IN ('test', 'live')),
  CHECK (invoice_status IN ('draft', 'open', 'paid', 'void', 'uncollectible', 'payment_failed', 'renewal_pending'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_stripe_billing_invoices_unique
  ON bna_stripe_billing_invoices (workspace_key, project_key, provider_id, mode, stripe_invoice_id);

CREATE TABLE IF NOT EXISTS bna_stripe_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL,
  provider_id TEXT NOT NULL DEFAULT 'rabbi_scheller',
  mode TEXT NOT NULL DEFAULT 'test',
  stripe_account_id TEXT,
  stripe_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  object_id TEXT,
  idempotency_key TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'queued',
  duplicate_count INTEGER NOT NULL DEFAULT 0,
  signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
  payload_redacted JSONB NOT NULL DEFAULT '{}',
  error_redacted TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  CHECK (mode IN ('test', 'live')),
  CHECK (processing_status IN ('queued', 'processed', 'duplicate', 'ignored', 'failed'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_stripe_webhook_events_idempotent
  ON bna_stripe_webhook_events (workspace_key, project_key, provider_id, mode, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_bna_stripe_webhook_events_type
  ON bna_stripe_webhook_events (event_type, received_at DESC);

CREATE TABLE IF NOT EXISTS bna_stripe_provider_revenue_snapshots (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL,
  provider_id TEXT NOT NULL DEFAULT 'rabbi_scheller',
  mode TEXT NOT NULL DEFAULT 'test',
  currency TEXT NOT NULL DEFAULT 'USD',
  gross_collected_cents INTEGER NOT NULL DEFAULT 0,
  failed_cents INTEGER NOT NULL DEFAULT 0,
  refunded_cents INTEGER NOT NULL DEFAULT 0,
  pending_cents INTEGER NOT NULL DEFAULT 0,
  net_collected_cents INTEGER NOT NULL DEFAULT 0,
  invoice_count INTEGER NOT NULL DEFAULT 0,
  successful_renewal_count INTEGER NOT NULL DEFAULT 0,
  policy_version TEXT,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}',
  CHECK (mode IN ('test', 'live'))
);
CREATE INDEX IF NOT EXISTS idx_bna_stripe_provider_revenue_scope
  ON bna_stripe_provider_revenue_snapshots (workspace_key, project_key, provider_id, mode, snapshot_at DESC);

CREATE TABLE IF NOT EXISTS bna_stripe_billing_audit_events (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL,
  provider_id TEXT NOT NULL DEFAULT 'rabbi_scheller',
  actor TEXT NOT NULL DEFAULT 'system',
  mode TEXT NOT NULL DEFAULT 'test',
  action TEXT NOT NULL,
  outcome TEXT NOT NULL,
  stripe_event_id TEXT,
  object_id TEXT,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  summary JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (mode IN ('test', 'live')),
  CHECK (outcome IN ('preview', 'processed', 'blocked', 'failed', 'ignored', 'duplicate'))
);
CREATE INDEX IF NOT EXISTS idx_bna_stripe_billing_audit_scope
  ON bna_stripe_billing_audit_events (workspace_key, project_key, provider_id, mode, created_at DESC);
