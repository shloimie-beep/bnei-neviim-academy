-- RUN THIS IN SUPABASE SQL EDITOR
-- Step 1: Go to supabase.com → your project → SQL Editor
-- Step 2: Paste this entire file
-- Step 3: Click "Run"

-- Drop old table (careful - this deletes existing data!)
-- If you want to keep existing signups, DON'T run this line:
-- DROP TABLE IF EXISTS signups;

-- Create new BNA signups table
CREATE TABLE IF NOT EXISTS signups (
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

-- Create tasks table
CREATE TABLE IF NOT EXISTS bna_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  stage TEXT DEFAULT 'inbox',
  category TEXT DEFAULT 'operations',
  urgency TEXT DEFAULT 'this_week',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment log
CREATE TABLE IF NOT EXISTS bna_payment_log (
  id SERIAL PRIMARY KEY,
  signup_id INTEGER REFERENCES signups(id),
  amount DECIMAL(10,2),
  method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Done!' as status;
