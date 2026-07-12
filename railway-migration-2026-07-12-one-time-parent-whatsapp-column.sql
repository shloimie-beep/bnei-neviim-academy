-- One Time direct signup reminders read parent_whatsapp from CRM leads.
-- Additive and idempotent: no rows are changed by this migration.

ALTER TABLE bna_parent_leads
  ADD COLUMN IF NOT EXISTS parent_whatsapp TEXT;
