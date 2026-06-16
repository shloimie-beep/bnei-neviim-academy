-- WS07 Automation Center registry.
-- Safe to run repeatedly. Creates a first-party metadata registry for existing
-- automation-like workflows without changing execution behavior.

BEGIN;

CREATE TABLE IF NOT EXISTS bna_automations (
  id SERIAL PRIMARY KEY,
  automation_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  package_key TEXT,
  package_name TEXT,
  service_key TEXT,
  service_name TEXT,
  scope_type TEXT NOT NULL DEFAULT 'project',
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  owner TEXT,
  responsible_person TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  automation_type TEXT NOT NULL DEFAULT 'workflow',
  trigger_type TEXT,
  trigger_label TEXT,
  channel TEXT,
  audience TEXT,
  permissions JSONB DEFAULT '{}',
  setup_blockers JSONB DEFAULT '[]',
  related_task_ids JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  created_by TEXT DEFAULT 'system',
  updated_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS automation_key TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS package_key TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS package_name TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS service_key TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS scope_type TEXT DEFAULT 'project';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS responsible_person TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS automation_type TEXT DEFAULT 'workflow';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS trigger_type TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS trigger_label TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS audience TEXT;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS setup_blockers JSONB DEFAULT '[]';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS related_task_ids JSONB DEFAULT '[]';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMP;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMP;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'system';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT 'system';
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bna_automations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE bna_automations
SET
  scope_type = COALESCE(NULLIF(scope_type, ''), 'project'),
  status = COALESCE(NULLIF(status, ''), 'draft'),
  automation_type = COALESCE(NULLIF(automation_type, ''), 'workflow'),
  package_key = COALESCE(NULLIF(package_key, ''), lower(regexp_replace(COALESCE(package_name, 'operations'), '[^a-zA-Z0-9]+', '_', 'g'))),
  service_key = COALESCE(NULLIF(service_key, ''), lower(regexp_replace(COALESCE(service_name, name, automation_key, 'automation'), '[^a-zA-Z0-9]+', '_', 'g'))),
  permissions = COALESCE(permissions, '{}'::jsonb),
  setup_blockers = CASE WHEN jsonb_typeof(COALESCE(setup_blockers, '[]'::jsonb)) = 'array' THEN COALESCE(setup_blockers, '[]'::jsonb) ELSE '[]'::jsonb END,
  related_task_ids = CASE WHEN jsonb_typeof(COALESCE(related_task_ids, '[]'::jsonb)) = 'array' THEN COALESCE(related_task_ids, '[]'::jsonb) ELSE '[]'::jsonb END,
  config = COALESCE(config, '{}'::jsonb),
  metadata = COALESCE(metadata, '{}'::jsonb),
  updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
WHERE TRUE;

ALTER TABLE bna_automations DROP CONSTRAINT IF EXISTS bna_automations_scope_type_check;
ALTER TABLE bna_automations
  ADD CONSTRAINT bna_automations_scope_type_check
  CHECK (scope_type IN ('global', 'workspace', 'project', 'system'));
ALTER TABLE bna_automations DROP CONSTRAINT IF EXISTS bna_automations_status_check;
ALTER TABLE bna_automations
  ADD CONSTRAINT bna_automations_status_check
  CHECK (status IN ('active', 'guarded', 'draft', 'blocked', 'paused', 'archived'));
ALTER TABLE bna_automations DROP CONSTRAINT IF EXISTS bna_automations_type_check;
ALTER TABLE bna_automations
  ADD CONSTRAINT bna_automations_type_check
  CHECK (automation_type IN ('workflow', 'integration', 'bot', 'scheduler', 'content', 'accounting', 'student', 'system'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_automations_key ON bna_automations(automation_key);
CREATE INDEX IF NOT EXISTS idx_bna_automations_project ON bna_automations(project_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_automations_package_service ON bna_automations(package_key, service_key);
CREATE INDEX IF NOT EXISTS idx_bna_automations_owner ON bna_automations(lower(owner));
CREATE INDEX IF NOT EXISTS idx_bna_automations_status ON bna_automations(status);
CREATE INDEX IF NOT EXISTS idx_bna_automations_channel_type ON bna_automations(channel, automation_type);

CREATE TABLE IF NOT EXISTS bna_automation_runs (
  id SERIAL PRIMARY KEY,
  automation_id INTEGER NOT NULL REFERENCES bna_automations(id) ON DELETE CASCADE,
  run_key TEXT,
  status TEXT NOT NULL DEFAULT 'unknown',
  source TEXT,
  summary TEXT,
  log_url TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS automation_id INTEGER REFERENCES bna_automations(id) ON DELETE CASCADE;
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS run_key TEXT;
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unknown';
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS log_url TEXT;
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE bna_automation_runs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
UPDATE bna_automation_runs
SET
  status = COALESCE(NULLIF(status, ''), 'unknown'),
  metadata = COALESCE(metadata, '{}'::jsonb)
WHERE TRUE;
ALTER TABLE bna_automation_runs DROP CONSTRAINT IF EXISTS bna_automation_runs_status_check;
ALTER TABLE bna_automation_runs
  ADD CONSTRAINT bna_automation_runs_status_check
  CHECK (status IN ('queued', 'running', 'success', 'failed', 'blocked', 'skipped', 'unknown'));

CREATE INDEX IF NOT EXISTS idx_bna_automation_runs_automation ON bna_automation_runs(automation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_automation_runs_status ON bna_automation_runs(status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_automation_runs_run_key
  ON bna_automation_runs(automation_id, run_key)
  WHERE run_key IS NOT NULL AND trim(run_key) <> '';

WITH seeds(
  automation_key, name, summary, description, package_key, package_name,
  service_key, service_name, project_key, owner, responsible_person, status,
  automation_type, trigger_type, trigger_label, channel, audience,
  permissions, setup_blockers, metadata
) AS (
  VALUES
    (
      'codex_agent_queue',
      'Codex Agent Queue',
      'Routes concrete repo, dashboard, deploy, and test work into visible Codex-owned task and agent-job records.',
      'The Operations task queue, Telegram capture path, and agent fleet status records form the canonical visible machine-work loop for BNA. This registry entry describes the workflow only; execution remains in the existing task and agent-job endpoints.',
      'operations', 'Operations', 'codex_agent_fleet', 'Codex Agent Fleet', 'bna', 'Codex', 'Shloimie', 'active',
      'system', 'task_queue', 'Operations queue / Telegram routed repo request', 'dashboard_telegram', 'BNA operator and internal agent fleet',
      '{"execution_surface":"existing task and agent-job endpoints","registry_edits_only":true}'::jsonb,
      '[]'::jsonb,
      '{"seed":"ws07","source":"implicit_codex_queue"}'::jsonb
    ),
    (
      'telegram_sidekick_router',
      'Telegram Sidekick Router',
      'Routes Telegram conversation, captures, media intake, and clear build requests into the right Assistant or Codex path.',
      'Telegram is the active operator bridge for ordinary Assistant replies, Codex routing, task capture, and Buffer text draft handoff. This registry records visibility metadata and does not change bot behavior.',
      'communications', 'Communications', 'telegram_bridge', 'Telegram Bridge', 'bna', 'Shloimie', 'Shloimie', 'active',
      'bot', 'telegram_message', 'Telegram message / media intake', 'telegram', 'BNA operators and approved Telegram users',
      '{"execution_surface":"scripts/telegram-kimi-bridge.mjs","registry_edits_only":true}'::jsonb,
      '[]'::jsonb,
      '{"seed":"ws07","source":"telegram_ops_reality"}'::jsonb
    ),
    (
      'content_prompt_studio',
      'Content Prompt Studio',
      'Generates WhatsApp, Facebook, newsletter, blog, and other platform drafts using tracked prompts and approved examples.',
      'Content jobs, outputs, prompts, prompt versions, examples, and bundles drive first-party draft generation from approved source material. External send and publish behavior stays permission-gated by existing content actions.',
      'content', 'Content', 'prompt_studio', 'Prompt Studio', 'bna', 'Shloimie', 'Shloimie', 'active',
      'content', 'operations_action', 'Operations Content action', 'dashboard', 'BNA content operators',
      '{"registry_edits_only":true,"external_send_requires_separate_approval":true}'::jsonb,
      '[]'::jsonb,
      '{"seed":"ws07","source":"bna_content_prompts"}'::jsonb
    ),
    (
      'drive_media_intake',
      'Drive Media Intake',
      'Organizes BNA Drive upload folders and describes the raw-media intake lanes used before content review.',
      'The Drive pipeline creates and syncs upload, processing, approved asset, failed-review, and archive folders. The watcher/classifier lane is still guarded until hosted media URL and approval behavior is finished.',
      'content', 'Content', 'google_drive_intake', 'Google Drive Intake', 'bna', 'Shloimie', 'Shloimie', 'guarded',
      'integration', 'drive_upload', 'Drive upload / manual organizer', 'google_drive', 'BNA content operators',
      '{"registry_edits_only":true,"live_drive_writes_require_existing_drive_setup":true}'::jsonb,
      '["Drive watcher/classifier for image-only Raw Intake uploads is not complete.","Hosted media URL support is needed before local photos/videos can attach to Buffer posts."]'::jsonb,
      '{"seed":"ws07","source":"ensureBnaDrivePipeline"}'::jsonb
    ),
    (
      'payment_reminders',
      'Payment Reminders',
      'Finds upcoming tuition payments and can preview, dry-run, or send parent reminder emails.',
      'The accounting surface can load upcoming payment reminders and use the existing guarded payment reminder endpoints. This registry records owner, scope, and channel metadata only.',
      'accounting', 'Accounting', 'payment_reminders', 'Payment Reminders', 'bna', 'Shloimie', 'Shloimie', 'active',
      'accounting', 'scheduler', 'Scheduler / Operations manual run', 'email', 'Parents with upcoming payment due dates',
      '{"registry_edits_only":true,"send_requires_existing_payment_reminder_guard":true}'::jsonb,
      '[]'::jsonb,
      '{"seed":"ws07","source":"payment_reminders"}'::jsonb
    ),
    (
      'green_invoice_webhook_reconciliation',
      'Green Invoice Webhook Reconciliation',
      'Logs Green Invoice payment events, matches them to signups where possible, and creates payment-intake records when unmatched.',
      'Green Invoice webhook events feed first-party payment logs and payment-intake records. This registry does not change webhook processing or accounting behavior.',
      'accounting', 'Accounting', 'green_invoice', 'Green Invoice', 'bna', 'Shloimie', 'Shloimie', 'active',
      'integration', 'webhook', 'Green Invoice webhook', 'webhook', 'BNA accounting operators',
      '{"registry_edits_only":true,"webhook_runtime_unchanged":true}'::jsonb,
      '[]'::jsonb,
      '{"seed":"ws07","source":"green_invoice_webhook_log"}'::jsonb
    ),
    (
      'website_blog_publish',
      'Website Blog Publish',
      'Publishes approved website blog drafts from content outputs into the first-party public website blog JSON feed.',
      'Approved website blog outputs can publish into the first-party public website JSON feed. Metadata editing here does not approve, publish, archive, or unpublish blog content.',
      'website', 'Website', 'first_party_blog', 'First-party Blog', 'bna', 'Shloimie', 'Shloimie', 'active',
      'content', 'operations_approval', 'Operations Content approval', 'website', 'Public website visitors after staff approval',
      '{"registry_edits_only":true,"publish_requires_existing_content_action":true}'::jsonb,
      '[]'::jsonb,
      '{"seed":"ws07","source":"website_blog_outputs"}'::jsonb
    ),
    (
      'student_torah_progress_parser',
      'Student Torah Progress Parser',
      'Extracts student accountability and Torah daily-progress updates from spoken reports while keeping private details out of the public site.',
      'Mixed recording parsing can update private student/accountability and Torah progress records. Public content generation must continue excluding private operational and student details.',
      'students', 'Students', 'mixed_recording_parser', 'Mixed Recording Parser', 'bna', 'Shloimie', 'Shloimie', 'active',
      'student', 'recording_parse', 'Telegram/Content recording parse', 'telegram_content', 'BNA staff and private student operations',
      '{"registry_edits_only":true,"private_student_data_stays_internal":true}'::jsonb,
      '[]'::jsonb,
      '{"seed":"ws07","source":"mixed_recording_parse"}'::jsonb
    ),
    (
      'one_time_member_library_package_review',
      'One Time Member Library Package Review',
      'Previews One Time class media packages, blockers, and member-library visibility without publishing until approval exists.',
      'One Time content packages can be previewed and internally approved before member-library publishing. This registry keeps the provider workspace automation visible without granting live app writes.',
      'one_time', 'One Time', 'member_library', 'Member Library', 'one_time_mishnah_class', 'Shloimie', 'Rabbi Elie Scheller', 'guarded',
      'content', 'operations_preview', 'Operations One Time Library review', 'dashboard', 'One Time provider workspace operators',
      '{"registry_edits_only":true,"publish_requires_approval_phrase":"APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING"}'::jsonb,
      '["Owner-approved member-library publishing access and rollback policy are still required for live publishing."]'::jsonb,
      '{"seed":"ws07","source":"one_time_library"}'::jsonb
    ),
    (
      'one_time_question_private_digest',
      'One Time Private Question Digest',
      'Builds a private Rabbi-facing review digest for One Time student questions without public answers, notifications, or rewards.',
      'The private question moderation digest is read-only until public/member question surfaces, answers, notifications, rewards, and identity policies are approved.',
      'one_time', 'One Time', 'question_moderation', 'Question Moderation', 'one_time_mishnah_class', 'Shloimie', 'Rabbi Elie Scheller', 'active',
      'workflow', 'operations_review', 'Operations private question moderation', 'dashboard', 'Rabbi and BNA private reviewers',
      '{"registry_edits_only":true,"public_question_surface_requires_approval_phrase":"APPROVE_ONE_TIME_QUESTION_PUBLIC_SURFACE"}'::jsonb,
      '[]'::jsonb,
      '{"seed":"ws07","source":"one_time_question_moderation"}'::jsonb
    )
)
INSERT INTO bna_automations (
  automation_key, name, summary, description, package_key, package_name,
  service_key, service_name, scope_type, project_id, owner, responsible_person,
  status, automation_type, trigger_type, trigger_label, channel, audience,
  permissions, setup_blockers, related_task_ids, config, metadata, created_by, updated_by
)
SELECT
  seeds.automation_key,
  seeds.name,
  seeds.summary,
  seeds.description,
  seeds.package_key,
  seeds.package_name,
  seeds.service_key,
  seeds.service_name,
  'project',
  projects.id,
  seeds.owner,
  seeds.responsible_person,
  seeds.status,
  seeds.automation_type,
  seeds.trigger_type,
  seeds.trigger_label,
  seeds.channel,
  seeds.audience,
  seeds.permissions,
  seeds.setup_blockers,
  '[]'::jsonb,
  '{}'::jsonb,
  seeds.metadata,
  'system',
  'system'
FROM seeds
JOIN bna_projects projects ON projects.project_key = seeds.project_key
ON CONFLICT (automation_key) DO UPDATE SET
  name = COALESCE(NULLIF(bna_automations.name, ''), EXCLUDED.name),
  summary = COALESCE(NULLIF(bna_automations.summary, ''), EXCLUDED.summary),
  description = COALESCE(NULLIF(bna_automations.description, ''), EXCLUDED.description),
  package_key = COALESCE(NULLIF(bna_automations.package_key, ''), EXCLUDED.package_key),
  package_name = COALESCE(NULLIF(bna_automations.package_name, ''), EXCLUDED.package_name),
  service_key = COALESCE(NULLIF(bna_automations.service_key, ''), EXCLUDED.service_key),
  service_name = COALESCE(NULLIF(bna_automations.service_name, ''), EXCLUDED.service_name),
  scope_type = COALESCE(NULLIF(bna_automations.scope_type, ''), EXCLUDED.scope_type),
  project_id = COALESCE(bna_automations.project_id, EXCLUDED.project_id),
  owner = COALESCE(NULLIF(bna_automations.owner, ''), EXCLUDED.owner),
  responsible_person = COALESCE(NULLIF(bna_automations.responsible_person, ''), EXCLUDED.responsible_person),
  status = COALESCE(NULLIF(bna_automations.status, ''), EXCLUDED.status),
  automation_type = COALESCE(NULLIF(bna_automations.automation_type, ''), EXCLUDED.automation_type),
  trigger_type = COALESCE(NULLIF(bna_automations.trigger_type, ''), EXCLUDED.trigger_type),
  trigger_label = COALESCE(NULLIF(bna_automations.trigger_label, ''), EXCLUDED.trigger_label),
  channel = COALESCE(NULLIF(bna_automations.channel, ''), EXCLUDED.channel),
  audience = COALESCE(NULLIF(bna_automations.audience, ''), EXCLUDED.audience),
  permissions = COALESCE(bna_automations.permissions, '{}'::jsonb) || EXCLUDED.permissions,
  setup_blockers = CASE
    WHEN jsonb_array_length(COALESCE(bna_automations.setup_blockers, '[]'::jsonb)) = 0 THEN EXCLUDED.setup_blockers
    ELSE bna_automations.setup_blockers
  END,
  metadata = COALESCE(bna_automations.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = bna_automations.updated_at;

COMMIT;
