-- BNA Task Pipeline System Migration
-- Adds Holy Flow-inspired task management for BNA Operations

-- ============================================================
-- BNA TASKS (Pipeline-based task management)
-- ============================================================
create table if not exists bna_tasks (
  id                uuid primary key default uuid_generate_v4(),
  
  -- Core fields
  title             text not null,
  notes             text,
  
  -- Pipeline stage
  stage             text not null default 'inbox' 
                    check (stage in ('inbox', 'triage', 'planned', 'in_progress', 'waiting', 'review', 'done')),
  
  -- Classification
  category          text not null default 'operations'
                    check (category in (
                      'accounting', 'marketing', 'communications', 'operations',
                      'parent_onboarding', 'student_coaching', 'ghl_crm', 'billing',
                      'legal_compliance', 'facilities', 'staffing'
                    )),
  urgency           text not null default 'low'
                    check (urgency in ('urgent', 'today', 'this_week', 'low')),
  
  -- Scheduling
  due_date          date,
  
  -- Source tracking
  source            text not null default 'manual'
                    check (source in ('manual', 'ramble', 'telegram', 'ghl_webhook', 'green_invoice')),
  source_context    text,  -- Original ramble text or message
  
  -- AI parsing metadata (stored as JSONB for flexibility)
  ai_parsed         jsonb,
  
  -- Relations
  parent_task_id    uuid references bna_tasks(id) on delete set null,
  related_contact_id text,  -- GHL contact ID
  related_signup_id uuid,   -- BNA signup ID (if applicable)
  
  -- Assignment
  created_by        text not null default 'system',
  assigned_to       text,
  
  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  completed_at      timestamptz
);

-- Indexes for common queries
create index if not exists idx_bna_tasks_stage on bna_tasks(stage);
create index if not exists idx_bna_tasks_category on bna_tasks(category);
create index if not exists idx_bna_tasks_urgency on bna_tasks(urgency);
create index if not exists idx_bna_tasks_due_date on bna_tasks(due_date);
create index if not exists idx_bna_tasks_created_at on bna_tasks(created_at desc);
create index if not exists idx_bna_tasks_assigned on bna_tasks(assigned_to) where assigned_to is not null;

-- ============================================================
-- BNA TASK STEPS (Sub-tasks / checklists)
-- ============================================================
create table if not exists bna_task_steps (
  id                uuid primary key default uuid_generate_v4(),
  task_id           uuid not null references bna_tasks(id) on delete cascade,
  description       text not null,
  completed         boolean not null default false,
  "order"           int not null default 0,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);

create index if not exists idx_bna_task_steps_task on bna_task_steps(task_id);
create index if not exists idx_bna_task_steps_completed on bna_task_steps(completed);

-- ============================================================
-- BNA SIGNUPS (School registration tracking)
-- ============================================================
create table if not exists bna_signups (
  id                uuid primary key default uuid_generate_v4(),
  
  -- Parent info
  parent_name       text not null,
  parent_email      text not null,
  parent_phone      text,
  
  -- Student info
  student_name      text not null,
  student_age       int,
  student_grade     text,
  
  -- Registration details
  previous_school   text,
  reason_applying   text,
  special_needs     text,
  
  -- Payment tracking
  payment_method    text check (payment_method in ('green_invoice', 'cash')),
  payment_status    text not null default 'pending' 
                    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_id        text,  -- Green Invoice payment ID
  payment_amount    decimal(10,2),
  paid_at           timestamptz,
  
  -- GHL sync
  ghl_contact_id    text,  -- Parent contact ID in GHL
  ghl_student_id    text,  -- Student contact ID in GHL
  ghl_synced_at     timestamptz,
  ghl_sync_error    text,
  
  -- Pipeline stage
  signup_stage      text not null default 'new'
                    check (signup_stage in (
                      'new', 'contacted', 'zoom_scheduled', 'zoom_completed',
                      'application_sent', 'application_received', 'accepted', 'enrolled', 'waitlisted', 'declined'
                    )),
  
  -- Metadata
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_bna_signups_email on bna_signups(parent_email);
create index if not exists idx_bna_signups_status on bna_signups(payment_status);
create index if not exists idx_bna_signups_stage on bna_signups(signup_stage);
create index if not exists idx_bna_signups_ghl on bna_signups(ghl_contact_id);

-- ============================================================
-- BNA PROTOCOLS (Parent onboarding, coaching, etc.)
-- ============================================================
create table if not exists bna_protocols (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  description       text,
  category          text not null
                    check (category in (
                      'parent_onboarding', 'student_coaching', 'billing', 
                      'emergency', 'communications', 'operations'
                    )),
  version           int not null default 1,
  
  -- Protocol content (markdown)
  content           text not null,
  
  -- Steps/checklist
  steps             jsonb,  -- Array of {order, title, description, required}
  
  -- Related tasks template
  task_templates    jsonb,  -- Array of task templates to auto-create
  
  -- Active status
  is_active         boolean not null default true,
  
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Seed initial protocols
create or replace function seed_bna_protocols()
returns void language plpgsql as $$
begin
  -- Parent Onboarding Protocol v1
  insert into bna_protocols (name, description, category, content, steps, task_templates)
  values (
    'Parent Onboarding',
    'Complete onboarding process for new families joining BNA',
    'parent_onboarding',
    E'# Parent Onboarding Protocol v1

## Phase 1: Initial Contact
- Welcome call within 24 hours
- Send parent handbook
- Schedule Zoom intake

## Phase 2: Intake & Assessment
- Complete family questionnaire
- Student assessment session
- Parent coaching session

## Phase 3: Enrollment
- Sign participation agreement
- Submit payment
- Schedule start date',
    '[
      {"order": 1, "title": "Welcome call", "description": "Call parent within 24h of signup", "required": true},
      {"order": 2, "title": "Send handbook", "description": "Email parent handbook and resources", "required": true},
      {"order": 3, "title": "Schedule intake", "description": "Book Zoom intake session", "required": true},
      {"order": 4, "title": "Complete questionnaire", "description": "Family fills out intake form", "required": true},
      {"order": 5, "title": "Student assessment", "description": "Meet with student 1:1", "required": true},
      {"order": 6, "title": "Parent coaching", "description": "Coaching session with parents", "required": true},
      {"order": 7, "title": "Sign agreement", "description": "Safety & participation agreement", "required": true},
      {"order": 8, "title": "Process payment", "description": "Collect first month tuition", "required": true}
    ]'::jsonb,
    '[
      {"title": "Call new parent - {parent_name}", "category": "parent_onboarding", "urgency": "today"},
      {"title": "Send handbook to {parent_email}", "category": "parent_onboarding", "urgency": "today"},
      {"title": "Schedule intake for {student_name}", "category": "parent_onboarding", "urgency": "this_week"}
    ]'::jsonb
  )
  on conflict do nothing;
  
  -- Billing Protocol
  insert into bna_protocols (name, description, category, content, steps, task_templates)
  values (
    'Monthly Billing',
    'Process monthly tuition billing for all active families',
    'billing',
    E'# Monthly Billing Protocol

## Pre-Billing (1st of month)
- Review active student list
- Check for payment method updates
- Note any adjustments

## Billing Day (5th of month)
- Generate Green Invoice for all families
- Send payment links via WhatsApp
- Update GHL payment status

## Follow-up (10th, 15th, 20th)
- Check unpaid invoices
- Send reminders
- Handle payment issues',
    '[
      {"order": 1, "title": "Review active list", "description": "Confirm all active students", "required": true},
      {"order": 2, "title": "Generate invoices", "description": "Create Green Invoice for each family", "required": true},
      {"order": 3, "title": "Send payment links", "description": "WhatsApp payment links to parents", "required": true},
      {"order": 4, "title": "Update GHL", "description": "Mark billing status in GHL", "required": true},
      {"order": 5, "title": "Follow up unpaid", "description": "Remind unpaid families", "required": false}
    ]'::jsonb,
    '[]'::jsonb
  )
  on conflict do nothing;
end;
$$;

select seed_bna_protocols();

-- ============================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bna_tasks_updated on bna_tasks;
create trigger trg_bna_tasks_updated
  before update on bna_tasks
  for each row execute function update_updated_at_column();

drop trigger if exists trg_bna_signups_updated on bna_signups;
create trigger trg_bna_signups_updated
  before update on bna_signups
  for each row execute function update_updated_at_column();

drop trigger if exists trg_bna_protocols_updated on bna_protocols;
create trigger trg_bna_protocols_updated
  before update on bna_protocols
  for each row execute function update_updated_at_column();

-- ============================================================
-- VIEWS: Pipeline stats and summaries
-- ============================================================

-- Task pipeline stats
create or replace view v_bna_pipeline_stats as
select 
  count(*) filter (where stage = 'inbox') as inbox,
  count(*) filter (where stage = 'triage') as triage,
  count(*) filter (where stage = 'planned') as planned,
  count(*) filter (where stage = 'in_progress') as in_progress,
  count(*) filter (where stage = 'waiting') as waiting,
  count(*) filter (where stage = 'review') as review,
  count(*) filter (where stage = 'done') as done,
  count(*) as total
from bna_tasks
where completed_at is null or completed_at > current_date - interval '7 days';

-- Today's urgent tasks
create or replace view v_bna_today_tasks as
select 
  t.*,
  (select jsonb_agg(
    jsonb_build_object('id', s.id, 'description', s.description, 'completed', s.completed, 'order', s.order)
    order by s.order
  ) from bna_task_steps s where s.task_id = t.id) as steps_json
from bna_tasks t
where t.stage not in ('done', 'review')
  and (t.urgency = 'urgent' 
       or t.urgency = 'today' 
       or t.due_date = current_date)
order by 
  case t.urgency 
    when 'urgent' then 1 
    when 'today' then 2 
    else 3 
  end,
  t.created_at;

-- Signup funnel stats
create or replace view v_bna_signup_funnel as
select 
  signup_stage,
  count(*) as count,
  count(*) filter (where payment_status = 'paid') as paid_count,
  sum(payment_amount) filter (where payment_status = 'paid') as total_collected
from bna_signups
group by signup_stage
order by 
  case signup_stage
    when 'new' then 1
    when 'contacted' then 2
    when 'zoom_scheduled' then 3
    when 'zoom_completed' then 4
    when 'application_sent' then 5
    when 'application_received' then 6
    when 'accepted' then 7
    when 'enrolled' then 8
    when 'waitlisted' then 9
    when 'declined' then 10
  end;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table bna_tasks enable row level security;
alter table bna_task_steps enable row level security;
alter table bna_signups enable row level security;
alter table bna_protocols enable row level security;

-- Allow all access for now (service role will be used)
-- In production, add proper policies
