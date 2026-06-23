-- Observable Telegram -> ticket -> task -> Codex job lifecycle.
-- Safe to run repeatedly. It upgrades the old support-ticket compatibility view
-- into a first-party ticket table and maps old agent job statuses forward.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'bna_tickets'
      AND n.nspname = 'public'
      AND c.relkind IN ('v', 'm')
  ) THEN
    DROP VIEW bna_tickets;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS bna_tickets (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  project_id INTEGER,
  support_ticket_id INTEGER,
  reporter_account_id INTEGER,
  assigned_to TEXT,
  owner TEXT,
  title TEXT NOT NULL DEFAULT 'Captured BNA ticket',
  summary TEXT,
  detailed_summary TEXT,
  original_raw_message TEXT,
  status TEXT NOT NULL DEFAULT 'created_ticket',
  severity TEXT DEFAULT 'normal',
  category TEXT DEFAULT 'operations',
  related_task_id INTEGER,
  task_id INTEGER,
  agent_job_id INTEGER,
  source_channel TEXT,
  source_chat_id TEXT,
  source_message_id TEXT,
  source_bridge_message_id INTEGER,
  source_message_type TEXT,
  source_message_created_at TIMESTAMP,
  classification TEXT,
  classification_confidence NUMERIC,
  reply_hint TEXT,
  current_blocker TEXT,
  ledger_ref TEXT,
  changelog_ref TEXT,
  report_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

ALTER TABLE bna_tickets DROP CONSTRAINT IF EXISTS bna_tickets_status_check;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS workspace_id INTEGER;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS project_id INTEGER;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS support_ticket_id INTEGER;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Captured BNA ticket';
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS detailed_summary TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS original_raw_message TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'created_ticket';
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'normal';
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'operations';
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS related_task_id INTEGER;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS task_id INTEGER;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS agent_job_id INTEGER;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS source_channel TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS source_chat_id TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS source_message_id TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS source_bridge_message_id INTEGER;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS source_message_type TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS source_message_created_at TIMESTAMP;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS classification TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS classification_confidence NUMERIC;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS reply_hint TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS current_blocker TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS ledger_ref TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS changelog_ref TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS report_path TEXT;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bna_tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;
UPDATE bna_tickets
SET status = CASE status
  WHEN 'open' THEN 'created_ticket'
  WHEN 'triage' THEN 'classified'
  WHEN 'resolved' THEN 'done'
  WHEN 'closed' THEN 'done'
  ELSE COALESCE(status, 'created_ticket')
END
WHERE status IS NULL OR status IN ('open', 'triage', 'resolved', 'closed');
UPDATE bna_tickets
SET status = 'created_ticket'
WHERE status IS NULL
   OR status NOT IN ('created_ticket', 'classified', 'queued_for_codex', 'in_progress', 'done', 'blocked', 'needs_decision', 'failed', 'archived');
ALTER TABLE bna_tickets
  ADD CONSTRAINT bna_tickets_status_check
  CHECK (status IN ('created_ticket', 'classified', 'queued_for_codex', 'in_progress', 'done', 'blocked', 'needs_decision', 'failed', 'archived'));

ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS ticket_id INTEGER;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS agent_job_id INTEGER;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS source_channel TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS source_chat_id TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS source_message_id TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS original_raw_message TEXT;

CREATE TABLE IF NOT EXISTS bna_agent_jobs (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  ticket_id INTEGER,
  task_id INTEGER,
  job_uid TEXT UNIQUE,
  agent_name TEXT NOT NULL DEFAULT 'Codex',
  agent_type TEXT NOT NULL DEFAULT 'codex',
  owner TEXT NOT NULL DEFAULT 'Codex',
  job_type TEXT NOT NULL DEFAULT 'implementation',
  title TEXT,
  detailed_summary TEXT,
  original_raw_message TEXT,
  source_channel TEXT,
  source_chat_id TEXT,
  source_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  priority TEXT NOT NULL DEFAULT 'normal',
  input_summary TEXT,
  input_payload JSONB DEFAULT '{}',
  result_summary TEXT,
  result_payload JSONB DEFAULT '{}',
  current_blocker TEXT,
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 2,
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  claimed_at TIMESTAMP,
  heartbeat_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  blocked_at TIMESTAMP,
  failed_at TIMESTAMP,
  stale_after_at TIMESTAMP,
  report_path TEXT,
  ledger_ref TEXT,
  changelog_ref TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_agent_jobs DROP CONSTRAINT IF EXISTS bna_agent_jobs_status_check;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS ticket_id INTEGER;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS job_uid TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT 'codex';
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS owner TEXT DEFAULT 'Codex';
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS detailed_summary TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS original_raw_message TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS source_channel TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS source_chat_id TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS source_message_id TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'queued';
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS current_blocker TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 2;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS stale_after_at TIMESTAMP;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS report_path TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS ledger_ref TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS changelog_ref TEXT;
ALTER TABLE bna_agent_jobs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
UPDATE bna_agent_jobs
SET status = CASE status
  WHEN 'created_ticket' THEN 'queued'
  WHEN 'queued_for_codex' THEN 'queued'
  WHEN 'in_progress' THEN 'running'
  WHEN 'done' THEN 'completed'
  WHEN 'complete' THEN 'completed'
  WHEN 'archived' THEN 'completed'
  WHEN 'cancelled' THEN 'completed'
  WHEN 'canceled' THEN 'completed'
  WHEN 'blocked' THEN 'blocked_needs_human_decision'
  WHEN 'needs_decision' THEN 'blocked_needs_human_decision'
  WHEN 'needs_human_decision' THEN 'blocked_needs_human_decision'
  ELSE status
END;
UPDATE bna_agent_jobs
SET status = 'queued'
WHERE status IS NULL
   OR status NOT IN ('queued', 'running', 'completed', 'failed', 'blocked_needs_human_decision');
UPDATE bna_agent_jobs
SET job_uid = COALESCE(job_uid, 'job-' || id::text),
    queued_at = COALESCE(queued_at, created_at, CURRENT_TIMESTAMP),
    metadata = COALESCE(metadata, '{}'::jsonb);
ALTER TABLE bna_agent_jobs ALTER COLUMN status SET DEFAULT 'queued';
ALTER TABLE bna_agent_jobs
  ADD CONSTRAINT bna_agent_jobs_status_check
  CHECK (status IN ('queued', 'running', 'completed', 'failed', 'blocked_needs_human_decision'));

CREATE TABLE IF NOT EXISTS bna_agent_job_events (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES bna_agent_jobs(id) ON DELETE CASCADE,
  ticket_id INTEGER,
  task_id INTEGER,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  status TEXT,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cli_bridge_messages (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  metadata JSONB,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS source_channel TEXT;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS source_chat_id TEXT;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS source_message_id TEXT;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS source_message_type TEXT;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS source_message_created_at TIMESTAMP;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS ticket_id INTEGER;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS task_id INTEGER;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS agent_job_id INTEGER;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'captured';
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS current_blocker TEXT;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS classification TEXT;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS classification_confidence NUMERIC;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS reply_hint TEXT;
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS raw_update JSONB DEFAULT '{}';
ALTER TABLE cli_bridge_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

INSERT INTO bna_tickets (
  project_id, workspace_id, task_id, related_task_id, agent_job_id, assigned_to, owner,
  title, summary, detailed_summary, original_raw_message, status, severity, category,
  source_channel, source_chat_id, source_message_id, metadata, created_at, updated_at
)
SELECT
  t.project_id,
  t.workspace_id,
  t.id,
  t.id,
  t.agent_job_id,
  t.assigned_to,
  COALESCE(t.assigned_to, 'Assistant'),
  t.title,
  COALESCE(t.summary, t.notes),
  COALESCE(t.notes, t.summary),
  t.original_raw_message,
  CASE
    WHEN t.agent_status = 'queued' THEN 'queued_for_codex'
    WHEN t.agent_status = 'running' THEN 'in_progress'
    WHEN t.agent_status = 'completed' THEN 'done'
    WHEN t.agent_status = 'failed' THEN 'failed'
    WHEN t.agent_status = 'blocked_needs_human_decision' THEN 'needs_decision'
    WHEN t.stage = 'needs_decision' OR COALESCE(t.decision_required, FALSE) THEN 'needs_decision'
    ELSE 'classified'
  END,
  CASE WHEN t.urgency = 'urgent' THEN 'high' ELSE 'normal' END,
  t.category,
  t.source_channel,
  t.source_chat_id,
  t.source_message_id,
  jsonb_build_object('backfill_source', 'bna_tasks', 'task_id', t.id),
  t.created_at,
  t.updated_at
FROM bna_tasks t
WHERE t.ticket_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM bna_tickets bt WHERE bt.task_id = t.id OR bt.related_task_id = t.id);

UPDATE bna_tasks t
SET ticket_id = bt.id
FROM bna_tickets bt
WHERE t.ticket_id IS NULL
  AND (bt.task_id = t.id OR bt.related_task_id = t.id);

UPDATE bna_agent_jobs j
SET ticket_id = COALESCE(j.ticket_id, t.ticket_id),
    title = COALESCE(j.title, t.title),
    detailed_summary = COALESCE(j.detailed_summary, t.notes, t.summary),
    original_raw_message = COALESCE(j.original_raw_message, t.original_raw_message),
    source_channel = COALESCE(j.source_channel, t.source_channel),
    source_chat_id = COALESCE(j.source_chat_id, t.source_chat_id),
    source_message_id = COALESCE(j.source_message_id, t.source_message_id),
    updated_at = NOW()
FROM bna_tasks t
WHERE j.task_id = t.id;

CREATE INDEX IF NOT EXISTS idx_bna_tickets_source_message ON bna_tickets(source_channel, source_chat_id, source_message_id);
CREATE INDEX IF NOT EXISTS idx_bna_tickets_status ON bna_tickets(status);
CREATE INDEX IF NOT EXISTS idx_bna_tickets_task_id ON bna_tickets(task_id);
CREATE INDEX IF NOT EXISTS idx_bna_agent_jobs_status ON bna_agent_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bna_agent_jobs_ticket_id ON bna_agent_jobs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_bna_agent_jobs_source_message ON bna_agent_jobs(source_channel, source_chat_id, source_message_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_agent_jobs_job_uid_unique ON bna_agent_jobs(job_uid) WHERE job_uid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bna_agent_job_events_job_id ON bna_agent_job_events(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cli_bridge_messages_source_message ON cli_bridge_messages(source_channel, source_chat_id, source_message_id);
