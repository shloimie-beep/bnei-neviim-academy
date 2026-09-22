-- WS03: Pending/access dedupe, Received/Done workflow, and Done artifact links.
-- Safe to apply before duplicate cleanup: additive columns and non-unique indexes only.

ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS workflow_status TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS status_detail TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS requested_by TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS received_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS received_by TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS received_notes TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS converted_task_id INTEGER REFERENCES bna_tasks(id) ON DELETE SET NULL;

ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS dedupe_key TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS dedupe_key_raw TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS canonical_task_id INTEGER REFERENCES bna_tasks(id) ON DELETE SET NULL;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS duplicate_of_task_id INTEGER REFERENCES bna_tasks(id) ON DELETE SET NULL;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS duplicate_archived_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS duplicate_reason TEXT;

ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS artifact_links JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS proof_links_json JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS done_link_status TEXT NOT NULL DEFAULT 'not_checked';
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS proof_status TEXT NOT NULL DEFAULT 'unchecked';
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS done_link_checked_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS proof_checked_at TIMESTAMP;

UPDATE bna_tasks
SET task_kind = 'pending_access',
    workflow_status = COALESCE(workflow_status, status_detail, 'pending_access'),
    status_detail = COALESCE(status_detail, workflow_status, 'pending_access')
WHERE COALESCE(stage, '') NOT IN ('archive', 'done')
  AND (
    lower(COALESCE(task_kind, '')) = 'pending_access'
    OR lower(COALESCE(waiting_on, '')) NOT IN ('', 'codex', 'kimi', 'system', 'agent', 'automation')
    OR lower(COALESCE(title, '') || ' ' || COALESCE(notes, '') || ' ' || COALESCE(summary, '')) ~
       '(access|missing input|assets|landing[- ]?page assets|landing page assets|source sheet|sefaria|vimeo|zoom|resend|domain|dns)'
  );

UPDATE bna_tasks
SET workflow_status = COALESCE(workflow_status, status_detail),
    status_detail = COALESCE(status_detail, workflow_status)
WHERE workflow_status IS NULL OR status_detail IS NULL;

UPDATE bna_tasks
SET done_link_status = CASE
      WHEN jsonb_array_length(COALESCE(artifact_links, '[]'::jsonb)) > 0
        OR jsonb_array_length(COALESCE(proof_links_json, '[]'::jsonb)) > 0
        THEN 'done_with_report'
      WHEN COALESCE(stage, '') = 'done' OR completed_at IS NOT NULL OR verified_at IS NOT NULL
        THEN 'done_missing_link'
      ELSE COALESCE(done_link_status, 'not_checked')
    END,
    proof_status = CASE
      WHEN jsonb_array_length(COALESCE(artifact_links, '[]'::jsonb)) > 0
        OR jsonb_array_length(COALESCE(proof_links_json, '[]'::jsonb)) > 0
        THEN 'valid'
      WHEN COALESCE(stage, '') = 'done' OR completed_at IS NOT NULL OR verified_at IS NOT NULL
        THEN 'missing'
      ELSE COALESCE(proof_status, 'unchecked')
    END,
    done_link_checked_at = CASE
      WHEN COALESCE(stage, '') = 'done' OR completed_at IS NOT NULL OR verified_at IS NOT NULL
        THEN COALESCE(done_link_checked_at, NOW())
      ELSE done_link_checked_at
    END,
    proof_checked_at = CASE
      WHEN COALESCE(stage, '') = 'done' OR completed_at IS NOT NULL OR verified_at IS NOT NULL
        THEN COALESCE(proof_checked_at, NOW())
      ELSE proof_checked_at
    END
WHERE COALESCE(stage, '') = 'done'
   OR completed_at IS NOT NULL
   OR verified_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bna_tasks_workflow_status ON bna_tasks (workflow_status);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_status_detail ON bna_tasks (status_detail);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_task_kind ON bna_tasks (task_kind);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_dedupe_key ON bna_tasks (dedupe_key);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_canonical_task_id ON bna_tasks (canonical_task_id);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_duplicate_of_task_id ON bna_tasks (duplicate_of_task_id);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_done_link_status ON bna_tasks (done_link_status);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_proof_status ON bna_tasks (proof_status);

-- Add only after duplicate cleanup has archived conflicting active rows:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_tasks_active_pending_access_dedupe
--   ON bna_tasks (dedupe_key)
--   WHERE dedupe_key IS NOT NULL
--     AND dedupe_key <> ''
--     AND COALESCE(task_kind, '') = 'pending_access'
--     AND duplicate_archived_at IS NULL
--     AND canonical_task_id IS NULL
--     AND duplicate_of_task_id IS NULL
--     AND COALESCE(stage, '') NOT IN ('archive', 'done');
