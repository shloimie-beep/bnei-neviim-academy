-- CLI Bridge Table - Routes Telegram messages to terminal session
-- Run this in Supabase SQL Editor

create table if not exists cli_bridge_messages (
  id uuid primary key default uuid_generate_v4(),
  source text not null, -- 'telegram', 'web'
  message_type text not null, -- 'text', 'voice', 'photo', 'document'
  content text not null,
  metadata jsonb default '{}',
  processed boolean not null default false,
  processed_by text,
  processed_at timestamptz,
  response text,
  created_at timestamptz not null default now()
);

create index idx_cli_bridge_unprocessed on cli_bridge_messages(processed, created_at) where processed = false;

-- Add to existing migration if tables don't exist
-- (This is safe to run multiple times)

-- Ensure bna_tasks has all needed columns
alter table bna_tasks add column if not exists energy_required text check (energy_required in ('high', 'medium', 'low'));
alter table bna_tasks add column if not exists estimated_minutes int;
alter table bna_tasks add column if not exists parent_goal_id uuid;
alter table bna_tasks add column if not exists planned_at timestamptz;
alter table bna_tasks add column if not exists started_at timestamptz;
alter table bna_tasks add column if not exists completed_at timestamptz;
alter table bna_tasks add column if not exists archived_at timestamptz;

-- Update stage check constraint if needed
-- Note: This might fail if data exists with old stages, handle manually if needed
-- alter table bna_tasks drop constraint if exists bna_tasks_stage_check;
-- alter table bna_tasks add constraint bna_tasks_stage_check check (stage in ('inbox', 'clarify', 'plan', 'execute', 'review', 'complete', 'archive'));
