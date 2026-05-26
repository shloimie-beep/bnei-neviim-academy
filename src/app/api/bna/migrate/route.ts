import { NextRequest, NextResponse } from 'next/server';

const MIGRATION_SQL = `-- BNA Task Pipeline System Migration
-- Run this in Supabase SQL Editor

-- BNA TASKS (Pipeline-based task management)
create table if not exists bna_tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  notes text,
  stage text not null default 'inbox' check (stage in ('inbox', 'clarify', 'plan', 'execute', 'review', 'complete', 'archive')),
  category text not null default 'operations' check (category in ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations')),
  urgency text not null default 'this_week' check (urgency in ('urgent', 'today', 'this_week', 'low')),
  energy_required text check (energy_required in ('high', 'medium', 'low')),
  estimated_minutes int,
  due_date date,
  planned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  parent_goal_id uuid,
  source text not null default 'manual' check (source in ('manual', 'ramble', 'telegram', 'ghl_webhook', 'green_invoice')),
  source_context text,
  ai_parsed jsonb,
  parent_task_id uuid references bna_tasks(id) on delete set null,
  related_contact_email text,
  related_signup_id uuid,
  created_by text not null default 'system',
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bna_tasks_stage on bna_tasks(stage);
create index idx_bna_tasks_category on bna_tasks(category);
create index idx_bna_tasks_urgency on bna_tasks(urgency);
create index idx_bna_tasks_due_date on bna_tasks(due_date);

-- BNA GOALS
create table if not exists bna_goals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  timeframe text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- BNA RAMBLE RAW
create table if not exists bna_ramble_raw (
  id uuid primary key default uuid_generate_v4(),
  raw_text text not null,
  source text not null,
  transcribed_at timestamptz not null default now(),
  parsed_task_ids uuid[] default '{}'
);

-- BNA PROTOCOLS
create table if not exists bna_protocols (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  version int not null default 1,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- BNA SIGNUPS (Enhanced)
create table if not exists bna_signups (
  id uuid primary key default uuid_generate_v4(),
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  student_name text not null,
  student_age int,
  student_grade text,
  previous_school text,
  reason_applying text,
  special_needs text,
  payment_method text check (payment_method in ('green_invoice', 'cash')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'partial', 'paid', 'refunded')),
  payment_amount decimal(10,2),
  payment_currency text default 'ILS',
  green_invoice_id text,
  cash_receipt_photo_url text,
  cash_received_at timestamptz,
  cash_notes text,
  ghl_parent_contact_id text,
  ghl_student_contact_id text,
  ghl_synced_at timestamptz,
  ghl_sync_error text,
  status text not null default 'new' check (status in ('new', 'contacted', 'interview_scheduled', 'accepted', 'enrolled', 'waitlisted', 'declined')),
  tags text[] default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bna_signups_email on bna_signups(parent_email);
create index idx_bna_signups_status on bna_signups(status);
create index idx_bna_signups_payment on bna_signups(payment_status);

-- BNA PAYMENT LOG
create table if not exists bna_payment_log (
  id uuid primary key default uuid_generate_v4(),
  signup_id uuid not null references bna_signups(id) on delete cascade,
  payment_type text not null check (payment_type in ('registration', 'tuition', 'materials', 'other')),
  amount decimal(10,2) not null,
  currency text default 'ILS',
  method text not null check (method in ('green_invoice', 'cash', 'bank_transfer', 'check')),
  green_invoice_id text,
  green_invoice_url text,
  receipt_photo_url text,
  received_by text,
  received_at timestamptz,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create index idx_bna_payment_log_signup on bna_payment_log(signup_id);

-- Insert default protocols
insert into bna_protocols (name, content) values
('parent_onboarding', '{"steps": ["Initial contact", "Zoom meeting", "Parent handbook", "Student assessment", "Enrollment decision"]}'::jsonb),
('cash_payment', '{"steps": ["Receive cash", "Take photo receipt", "Log in system", "Update signup status"]}'::jsonb)
on conflict (name) do nothing;
`;

export async function GET(req: NextRequest) {
  return new NextResponse(MIGRATION_SQL, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
