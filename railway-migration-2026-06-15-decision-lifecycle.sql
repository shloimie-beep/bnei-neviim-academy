-- WS02 decision lifecycle and comment reprocessing.
-- Non-destructive and repeatable for Railway/Postgres.

ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_status TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_route TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_outcome TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_reprocess_requested_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_reprocessed_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_last_activity_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_hidden_at TIMESTAMP;

UPDATE bna_tasks
SET decision_status = CASE
      WHEN COALESCE(decision_hidden_at, archived_at) IS NOT NULL OR stage = 'archive' THEN COALESCE(decision_status, 'done')
      WHEN completed_at IS NOT NULL OR verified_at IS NOT NULL OR stage = 'done' THEN COALESCE(decision_status, 'done')
      WHEN decision_status IN ('created', 'needs_research', 'researching', 'ready_for_decision', 'comment_added', 'reprocess_requested', 'sent_to_codex', 'converted_to_task', 'waiting_on_external_input', 'decided', 'done', 'blocked', 'stale') THEN decision_status
      WHEN COALESCE(item_type, 'task') = 'decision' OR COALESCE(decision_required, FALSE) OR stage = 'needs_decision' OR task_kind = 'decision' THEN 'created'
      ELSE decision_status
    END,
    decision_route = CASE
      WHEN decision_route IN ('none', 'research', 'codex', 'my_task', 'external_input', 'done', 'hidden') THEN decision_route
      WHEN COALESCE(decision_hidden_at, archived_at) IS NOT NULL OR stage = 'archive' THEN 'hidden'
      WHEN completed_at IS NOT NULL OR verified_at IS NOT NULL OR stage = 'done' THEN 'done'
      WHEN COALESCE(item_type, 'task') = 'decision' OR COALESCE(decision_required, FALSE) OR stage = 'needs_decision' OR task_kind = 'decision' THEN 'none'
      ELSE decision_route
    END,
    decision_last_activity_at = CASE
      WHEN COALESCE(item_type, 'task') = 'decision' OR COALESCE(decision_required, FALSE) OR stage = 'needs_decision' OR task_kind = 'decision'
        THEN COALESCE(decision_last_activity_at, last_activity_at, updated_at, created_at)
      ELSE decision_last_activity_at
    END
WHERE COALESCE(item_type, 'task') = 'decision'
   OR COALESCE(decision_required, FALSE)
   OR stage IN ('needs_decision', 'done', 'archive')
   OR task_kind = 'decision'
   OR decision_status IS NOT NULL
   OR decision_route IS NOT NULL;

ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_decision_status_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_decision_status_check
  CHECK (decision_status IS NULL OR decision_status IN ('created', 'needs_research', 'researching', 'ready_for_decision', 'comment_added', 'reprocess_requested', 'sent_to_codex', 'converted_to_task', 'waiting_on_external_input', 'decided', 'done', 'blocked', 'stale'));

ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_decision_route_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_decision_route_check
  CHECK (decision_route IS NULL OR decision_route IN ('none', 'research', 'codex', 'my_task', 'external_input', 'done', 'hidden'));

CREATE TABLE IF NOT EXISTS bna_decision_reprocess_queue (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES bna_tasks(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  requested_by TEXT,
  source_comment_id INTEGER REFERENCES bna_task_comments(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

ALTER TABLE bna_decision_reprocess_queue DROP CONSTRAINT IF EXISTS bna_decision_reprocess_queue_status_check;
ALTER TABLE bna_decision_reprocess_queue
  ADD CONSTRAINT bna_decision_reprocess_queue_status_check
  CHECK (status IN ('queued', 'processing', 'processed', 'cancelled', 'failed'));

CREATE INDEX IF NOT EXISTS idx_bna_tasks_decision_status ON bna_tasks (decision_status);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_decision_route ON bna_tasks (decision_route);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_decision_last_activity ON bna_tasks (decision_last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_decision_reprocess_queue_task ON bna_decision_reprocess_queue (task_id);
CREATE INDEX IF NOT EXISTS idx_bna_decision_reprocess_queue_status ON bna_decision_reprocess_queue (status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS bna_decision_reprocess_queue_one_active
  ON bna_decision_reprocess_queue(task_id)
  WHERE status IN ('queued', 'processing');
