-- Family Accountability App — Supabase schema
-- Run this in Supabase SQL Editor on a fresh project.

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============================================================
-- USERS  (kids and parents both, but kids use PIN auth)
-- ============================================================
create table if not exists users (
  id              uuid primary key default uuid_generate_v4(),
  role            text not null check (role in ('kid', 'parent')),
  name            text not null,
  email           text unique,                  -- parents only
  pin_hash        text,                         -- kids only, bcrypt
  language        text not null default 'he' check (language in ('he', 'en')),
  frozen          boolean not null default false,
  created_at      timestamptz not null default now()
);

insert into users (role, name, language) values
  ('kid', 'Menachem', 'he'),
  ('kid', 'Esther',   'he')
on conflict do nothing;

-- Parent users are created by Supabase Auth magic link flow; this table
-- mirrors them by email after first login.

-- ============================================================
-- MEETINGS
-- ============================================================
create table if not exists meetings (
  id              uuid primary key default uuid_generate_v4(),
  kid_id          uuid not null references users(id) on delete cascade,
  date            date not null default current_date,
  recording_url   text,
  notes           text,
  is_active       boolean not null default true,    -- only one active per kid
  created_by      uuid references users(id),
  created_at      timestamptz not null default now()
);

create index if not exists idx_meetings_kid_active
  on meetings(kid_id) where is_active = true;

-- When a new meeting becomes active, deactivate the previous one for that kid
create or replace function deactivate_previous_meetings()
returns trigger language plpgsql as $$
begin
  if new.is_active then
    update meetings set is_active = false
      where kid_id = new.kid_id and id <> new.id and is_active = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_deactivate_previous on meetings;
create trigger trg_deactivate_previous
  before insert or update on meetings
  for each row execute function deactivate_previous_meetings();

-- ============================================================
-- GOALS  (belong to a meeting and a kid)
-- ============================================================
create table if not exists goals (
  id              uuid primary key default uuid_generate_v4(),
  meeting_id      uuid not null references meetings(id) on delete cascade,
  kid_id          uuid not null references users(id) on delete cascade,
  title           text not null,
  description     text,
  frequency       text not null default 'daily' check (frequency in ('daily')),
  display_order   int not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_goals_meeting on goals(meeting_id);
create index if not exists idx_goals_kid     on goals(kid_id);

-- ============================================================
-- CHECKINS  (one per goal per day max)
-- ============================================================
create table if not exists checkins (
  id              uuid primary key default uuid_generate_v4(),
  goal_id         uuid not null references goals(id) on delete cascade,
  kid_id          uuid not null references users(id) on delete cascade,
  date            date not null default current_date,
  completed       boolean not null default true,
  proof_note      text,
  proof_photo_path text,                          -- path in `proofs` Storage bucket
  approved        boolean,                        -- null = pending, true/false = parent decision
  rejection_reason text,
  approved_by     uuid references users(id),
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  unique (goal_id, date)
);

create index if not exists idx_checkins_kid_date on checkins(kid_id, date);
create index if not exists idx_checkins_pending on checkins(approved) where approved is null;

-- ============================================================
-- NOTIFICATIONS  (audit log for Telegram + email)
-- ============================================================
create table if not exists notifications (
  id              uuid primary key default uuid_generate_v4(),
  channel         text not null check (channel in ('telegram', 'email')),
  recipient       text not null,
  subject         text,
  body            text,
  delivered       boolean not null default false,
  error           text,
  related_kid_id  uuid references users(id),
  created_at      timestamptz not null default now()
);

create index if not exists idx_notifications_created on notifications(created_at desc);

-- ============================================================
-- USER PREFERENCES  (lightweight, per-user settings)
-- ============================================================
create table if not exists user_preferences (
  user_id         uuid primary key references users(id) on delete cascade,
  language        text not null default 'he',
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- STORAGE  (proof photos)
-- ============================================================
-- Run in dashboard, not SQL:
--   Storage → New bucket → name: `proofs`, public: false
-- Then add the policy below.

-- Bucket policy: only authenticated kids can upload to their own folder
-- Path convention: proofs/{kid_id}/{checkin_id}.jpg

-- ============================================================
-- ROW LEVEL SECURITY  (V1: simple — service role does most writes from server)
-- ============================================================
-- In V1, all server-side writes use the service_role key, which bypasses RLS.
-- Client-side reads for the kid dashboard use a server route that authenticates
-- the kid by signed cookie and queries with service role, never exposing
-- service role to the client.
-- We still enable RLS as a safety net so accidental client queries fail closed.

alter table users               enable row level security;
alter table meetings            enable row level security;
alter table goals               enable row level security;
alter table checkins            enable row level security;
alter table notifications       enable row level security;
alter table user_preferences    enable row level security;

-- Deny-all by default. The Next.js API routes use the service role key.
-- No policies = no client access. This is intentional for V1.

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Today's progress per kid
create or replace view v_today_progress as
select
  u.id          as kid_id,
  u.name        as kid_name,
  count(g.id)   as total_goals,
  count(c.id) filter (where c.completed = true) as completed_goals
from users u
left join meetings m
       on m.kid_id = u.id and m.is_active = true
left join goals g
       on g.meeting_id = m.id
left join checkins c
       on c.goal_id = g.id and c.date = current_date
where u.role = 'kid'
group by u.id, u.name;

-- Current streak per kid (consecutive days where all goals were completed)
-- Computed at query time; expect <1000 days per kid so fine in V1.
create or replace function get_streak(p_kid_id uuid)
returns int language plpgsql as $$
declare
  v_streak int := 0;
  v_date date := current_date;
  v_complete boolean;
begin
  loop
    select
      count(g.id) > 0
      and count(g.id) = count(c.id) filter (where c.completed = true)
    into v_complete
    from meetings m
    join goals g on g.meeting_id = m.id
    left join checkins c on c.goal_id = g.id and c.date = v_date
    where m.kid_id = p_kid_id and v_date between m.date and current_date;

    exit when not v_complete;
    v_streak := v_streak + 1;
    v_date := v_date - 1;
  end loop;
  return v_streak;
end;
$$;
