-- Run this in Railway
-- Go to railway.app → your project → Postgres → Query

-- Check current tables
\dt

-- If old signups table exists with parent1_name, migrate data:
INSERT INTO signups (
  parent_name, parent_email, parent_phone,
  student_name, student_age,
  payment_method, payment_status, tags
)
SELECT 
  parent1_name, parent1_email, parent1_phone,
  child_name, child_age,
  'green_invoice', 'pending', ARRAY['parent', 'student']
FROM signups_old;

-- Or just create new tables if fresh start:
DROP TABLE IF EXISTS signups CASCADE;
DROP TABLE IF EXISTS bna_tasks CASCADE;
DROP TABLE IF EXISTS bna_payment_log CASCADE;

CREATE TABLE signups (
  id SERIAL PRIMARY KEY,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT,
  student_name TEXT NOT NULL,
  student_age INTEGER,
  student_grade TEXT,
  previous_school TEXT,
  reason_applying TEXT,
  special_needs TEXT,
  payment_method TEXT DEFAULT 'green_invoice',
  payment_status TEXT DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  payment_currency TEXT DEFAULT 'ILS',
  green_invoice_id TEXT,
  cash_receipt_photo_url TEXT,
  cash_received_at TIMESTAMP,
  cash_notes TEXT,
  ghl_parent_contact_id TEXT,
  ghl_student_contact_id TEXT,
  ghl_synced_at TIMESTAMP,
  ghl_sync_error TEXT,
  status TEXT DEFAULT 'new',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bna_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  stage TEXT DEFAULT 'inbox' CHECK (stage IN ('inbox', 'clarify', 'plan', 'execute', 'review', 'complete', 'archive')),
  category TEXT DEFAULT 'operations' CHECK (category IN ('admin', 'marketing', 'parent_coaching', 'student_operations', 'finance', 'legal', 'communications', 'operations')),
  urgency TEXT DEFAULT 'this_week' CHECK (urgency IN ('urgent', 'today', 'this_week', 'low')),
  energy_required TEXT CHECK (energy_required IN ('high', 'medium', 'low')),
  estimated_minutes INTEGER,
  due_date DATE,
  planned_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  archived_at TIMESTAMP,
  source TEXT DEFAULT 'manual',
  source_context TEXT,
  ai_parsed JSONB,
  parent_task_id INTEGER REFERENCES bna_tasks(id),
  related_contact_email TEXT,
  related_signup_id INTEGER,
  created_by TEXT DEFAULT 'system',
  assigned_to TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bna_payment_log (
  id SERIAL PRIMARY KEY,
  signup_id INTEGER REFERENCES signups(id),
  payment_type TEXT DEFAULT 'registration',
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  method TEXT,
  green_invoice_id TEXT,
  green_invoice_url TEXT,
  receipt_photo_url TEXT,
  received_by TEXT,
  received_at TIMESTAMP,
  notes TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cli_bridge_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  message_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT FALSE,
  processed_by TEXT,
  processed_at TIMESTAMP,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Done
SELECT 'Tables created!' as result;
