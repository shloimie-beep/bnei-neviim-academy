BEGIN;

ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS task_kind TEXT DEFAULT 'task';
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS display_title TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS why_exists TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS waiting_on TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS raw_message TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS cleaned_summary TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS bot_created BOOLEAN DEFAULT FALSE;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS bna_task_activity (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES bna_tasks(id) ON DELETE CASCADE,
  actor TEXT NOT NULL DEFAULT 'system',
  activity_type TEXT NOT NULL,
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_task_activity_task_id ON bna_task_activity (task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_task_activity_type ON bna_task_activity (activity_type);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_task_kind ON bna_tasks (task_kind);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_bot_created ON bna_tasks (bot_created);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_last_activity_at ON bna_tasks (last_activity_at DESC);

CREATE TABLE IF NOT EXISTS bna_agent_jobs (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  ticket_id INTEGER,
  task_id INTEGER REFERENCES bna_tasks(id) ON DELETE CASCADE,
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
END
WHERE status IN ('created_ticket', 'queued_for_codex', 'in_progress', 'done', 'complete', 'archived', 'cancelled', 'canceled', 'blocked', 'needs_decision', 'needs_human_decision');
ALTER TABLE bna_agent_jobs
  ADD CONSTRAINT bna_agent_jobs_status_check
  CHECK (status IN ('queued', 'running', 'completed', 'failed', 'blocked_needs_human_decision'));

ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_task_kind_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_task_kind_check
  CHECK (task_kind IN ('decision', 'pending_access', 'task', 'agent_job', 'history'));

ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_waiting_on_dialogue_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_waiting_on_dialogue_check
  CHECK (
    project_key IS DISTINCT FROM 'one_time_mishnah_class'
    OR waiting_on IS NULL
    OR waiting_on IN ('rabbi', 'shloimie', 'external', 'agent', 'none')
    OR LOWER(waiting_on) ~ '(rabbi|elie|scheller|sheller|shloimie|shlomo|operator|external|processor|stripe|vimeo|zoom|resend|domain|dns|godaddy|drive|asset|agent|codex|system)'
  ) NOT VALID;

UPDATE bna_tasks t
SET project_key = COALESCE(t.project_key, p.project_key)
FROM bna_projects p
WHERE t.project_id = p.id
  AND (t.project_key IS NULL OR trim(t.project_key) = '');

UPDATE bna_tasks
SET waiting_on = CASE
      WHEN waiting_on IS NULL OR trim(waiting_on) = '' THEN NULL
      WHEN lower(waiting_on) ~ '(rabbi|elie|scheller|sheller)' THEN 'rabbi'
      WHEN lower(waiting_on) ~ '(shloimie|shlomo|operator|manager|myself)' THEN 'shloimie'
      WHEN lower(waiting_on) ~ '(codex|kimi|agent|system|automation)' THEN NULL
      ELSE 'external'
    END
WHERE project_key = 'one_time_mishnah_class';

UPDATE bna_tasks
SET task_kind = CASE
      WHEN completed_at IS NOT NULL OR verified_at IS NOT NULL OR stage IN ('done', 'archive') THEN 'history'
      WHEN COALESCE(item_type, 'task') = 'decision' OR COALESCE(decision_required, FALSE) OR stage = 'needs_decision' THEN 'decision'
      WHEN project_key = 'one_time_mishnah_class' AND COALESCE(waiting_on, '') IN ('rabbi', 'shloimie', 'external') THEN 'pending_access'
      WHEN lower(COALESCE(assigned_to, '')) ~ '(codex|kimi|agent|system|automation)' OR COALESCE(agent_status, 'none') IN ('queued', 'running', 'failed', 'blocked_needs_human_decision') THEN 'agent_job'
      ELSE 'task'
    END,
    display_title = COALESCE(NULLIF(display_title, ''), NULLIF(ai_parsed->>'display_title', ''), title),
    raw_message = COALESCE(NULLIF(raw_message, ''), NULLIF(original_raw_message, ''), NULLIF(ai_parsed->>'original_text', '')),
    cleaned_summary = COALESCE(NULLIF(cleaned_summary, ''), NULLIF(summary, ''), NULLIF(notes, '')),
    why_exists = COALESCE(NULLIF(why_exists, ''), CASE
      WHEN COALESCE(item_type, 'task') = 'decision' OR COALESCE(decision_required, FALSE) OR stage = 'needs_decision' THEN 'A human choice is needed before this can move.'
      WHEN project_key = 'one_time_mishnah_class' AND COALESCE(waiting_on, '') IN ('rabbi', 'shloimie', 'external') THEN 'Missing access, assets, or outside input is blocking progress.'
      WHEN lower(COALESCE(assigned_to, '')) ~ '(codex|kimi|agent|system|automation)' THEN 'Machine work is tracked as an observable agent job.'
      WHEN completed_at IS NOT NULL OR verified_at IS NOT NULL OR stage IN ('done', 'archive') THEN 'Completed work is kept for project history.'
      ELSE 'Actionable work for the One Time workspace.'
    END),
    next_action = COALESCE(NULLIF(next_action, ''), NULLIF(next_action_label, ''), CASE
      WHEN COALESCE(item_type, 'task') = 'decision' OR COALESCE(decision_required, FALSE) OR stage = 'needs_decision' THEN 'Choose a path or ask for more information'
      WHEN project_key = 'one_time_mishnah_class' AND COALESCE(waiting_on, '') IN ('rabbi', 'shloimie', 'external') THEN 'Request the missing access or material'
      WHEN lower(COALESCE(assigned_to, '')) ~ '(codex|kimi|agent|system|automation)' THEN 'Watch agent job status'
      WHEN completed_at IS NOT NULL OR verified_at IS NOT NULL OR stage IN ('done', 'archive') THEN 'Review completed result'
      ELSE 'Start the next task step'
    END),
    bot_created = COALESCE(bot_created, FALSE)
      OR source IN ('telegram', 'ramble', 'web', 'content_job', 'import', 'google_drive')
      OR lower(COALESCE(created_by, '')) ~ '(bot|telegram|agent|codex|kimi|system)',
    last_activity_at = COALESCE(last_activity_at, updated_at, created_at)
WHERE project_key = 'one_time_mishnah_class'
   OR task_kind IS NULL
   OR task_kind NOT IN ('decision', 'pending_access', 'task', 'agent_job', 'history');

WITH one_time AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
),
seed_cards(seed_key, pattern, title, summary, notes, category, next_action) AS (
  VALUES
    ('stripe-pending-access', 'stripe|payment processor|checkout', 'Get Stripe or payment-processor access', 'Payment setup cannot be audited or configured until Shloimie has the active processor/login path.', 'Manual placeholder only. Do not create payment products, checkout links, or live billing writes until access, processor choice, and approval are confirmed.', 'accounting', 'Ask Rabbi for processor/login access or confirm the alternate processor'),
    ('vimeo-pending-access', 'vimeo|video library', 'Get Vimeo or video-library access', 'Existing video assets and embeds need a manual audit before any member-library migration plan.', 'Manual placeholder only. Do not upload to Vimeo, change privacy, or publish member-library assets from this card.', 'content', 'Ask Rabbi for Vimeo/library access or an export list'),
    ('website-assets-pending-access', 'website assets|site assets|landing page assets|current website|homepage assets', 'Get website and landing-page assets', 'The One Time launch page needs existing copy, images, brand assets, testimonials, and source URLs gathered before implementation.', 'Manual placeholder only. This does not publish the website or push assets to external hosts.', 'marketing', 'Ask Rabbi for current website assets and approved launch copy'),
    ('zoom-pending-access', 'zoom|live class link|meeting link', 'Get Zoom/manual live-class meeting details', 'Live class operations need the manual Zoom link, host rules, reminder times, and recording handoff plan.', 'Manual placeholder only. Do not schedule Zoom meetings or call the Zoom API from this task.', 'technology', 'Ask Rabbi for the Zoom/manual meeting link and host process'),
    ('resend-pending-access', 'resend|sender domain|email sender', 'Get Resend sender access or domain status', 'Warm launch email cannot move until sender ownership, domain authentication, and account access are clear.', 'Manual placeholder only. Do not send emails or import lists from this card.', 'communications', 'Ask Rabbi for Resend access or sender-domain status')
)
INSERT INTO bna_tasks (
  project_id, project_key, title, display_title, summary, notes, stage, category, urgency,
  assigned_to, waiting_on, item_type, task_kind, source, source_channel, created_by, author,
  decision_required, why_exists, next_action, next_action_label, cleaned_summary, raw_message,
  bot_created, ai_parsed, last_activity_at
)
SELECT
  one_time.id,
  'one_time_mishnah_class',
  seed_cards.title,
  seed_cards.title,
  seed_cards.summary,
  seed_cards.notes,
  'assigned',
  seed_cards.category,
  CASE WHEN seed_cards.seed_key = 'zoom-pending-access' THEN 'today' ELSE 'this_week' END,
  'Rabbi Elie Scheller',
  'rabbi',
  'task',
  'pending_access',
  'manual',
  'seed',
  'system',
  'system',
  FALSE,
  'Missing access, assets, or outside input is blocking progress.',
  seed_cards.next_action,
  seed_cards.next_action,
  seed_cards.summary,
  seed_cards.summary,
  TRUE,
  jsonb_build_object(
    'parser', 'rabbi-task-dialogue-pending-access-seed',
    'seed_key', seed_cards.seed_key,
    'task_kind', 'pending_access',
    'display_title', seed_cards.title,
    'manual_placeholder_only', TRUE,
    'no_external_write', TRUE
  ),
  NOW()
FROM seed_cards
CROSS JOIN one_time
WHERE NOT EXISTS (
  SELECT 1
  FROM bna_tasks existing
  WHERE existing.project_id = one_time.id
    AND COALESCE(existing.stage, '') NOT IN ('done', 'archive')
    AND lower(COALESCE(existing.title, '') || ' ' || COALESCE(existing.notes, '') || ' ' || COALESCE(existing.summary, '')) ~ seed_cards.pattern
);

INSERT INTO bna_task_activity (task_id, actor, activity_type, summary, metadata)
SELECT t.id, 'system', 'rabbi_dialogue_backfilled', 'Task prepared for the Rabbi/One Time dialogue board.', jsonb_build_object('migration', '2026-06-15-rabbi-task-dialogue')
FROM bna_tasks t
WHERE t.project_key = 'one_time_mishnah_class'
  AND NOT EXISTS (
    SELECT 1 FROM bna_task_activity a
    WHERE a.task_id = t.id
      AND a.activity_type = 'rabbi_dialogue_backfilled'
  );

COMMIT;
