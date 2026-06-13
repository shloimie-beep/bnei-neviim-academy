-- Migration 002 — parent notes, ad-hoc tasks, kid-chosen consequences
-- Idempotent: safe to run multiple times. Run AFTER supabase-schema.sql.

-- ============================================================
-- PARENT NOTES — shared family wall
-- ============================================================
create table if not exists parent_notes (
  id              uuid primary key default uuid_generate_v4(),
  author_user_id  uuid references users(id),
  author_name     text not null,
  body            text not null check (char_length(body) between 1 and 1000),
  visible_to_kids boolean not null default true,
  visible_from    timestamptz not null default now(),
  visible_until   timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_parent_notes_recent
  on parent_notes(visible_to_kids, created_at desc);

alter table parent_notes enable row level security;

-- ============================================================
-- GOALS — extend for ad-hoc parent-dropped tasks
-- ============================================================
alter table goals add column if not exists source text
  not null default 'meeting' check (source in ('meeting', 'ad_hoc'));
alter table goals add column if not exists expires_at timestamptz;

-- ============================================================
-- GOAL CONSEQUENCES — kid proposes, parent approves, parent can override
-- ============================================================
create table if not exists goal_consequences (
  id                    uuid primary key default uuid_generate_v4(),
  goal_id               uuid not null references goals(id) on delete cascade,
  body                  text not null check (char_length(body) between 1 and 500),
  proposed_by_kid       boolean not null default true,
  approved_by_parent    boolean not null default false,
  approved_at           timestamptz,
  approved_by_user_id   uuid references users(id),
  overridden            boolean not null default false,
  overridden_at         timestamptz,
  overridden_by_user_id uuid references users(id),
  override_reason       text,
  created_at            timestamptz not null default now()
);

create index if not exists idx_consequences_goal
  on goal_consequences(goal_id);
create index if not exists idx_consequences_pending
  on goal_consequences(approved_by_parent) where approved_by_parent = false;

alter table goal_consequences enable row level security;
