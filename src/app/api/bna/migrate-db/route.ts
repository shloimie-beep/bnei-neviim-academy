import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const MIGRATION_SQL = `
-- BNA Database Migration
DROP TABLE IF EXISTS bna_payment_log CASCADE;
DROP TABLE IF EXISTS bna_tasks CASCADE;
DROP TABLE IF EXISTS signups CASCADE;

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
  stage TEXT DEFAULT 'inbox',
  category TEXT DEFAULT 'operations',
  urgency TEXT DEFAULT 'this_week',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bna_payment_log (
  id SERIAL PRIMARY KEY,
  signup_id INTEGER REFERENCES signups(id),
  amount DECIMAL(10,2),
  method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO bna_tasks (title, stage, category, urgency) 
VALUES ('Welcome to BNA Holy Flow!', 'inbox', 'operations', 'this_week');
`;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const creds = Buffer.from(authHeader.slice(6), 'base64').toString().toLowerCase();
  if (creds !== 'shloimie:bna613!') {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await pool.query(MIGRATION_SQL);
    await pool.end();
    
    return NextResponse.json({ success: true, message: 'Database migrated!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
