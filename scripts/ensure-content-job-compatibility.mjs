#!/usr/bin/env node
import pg from 'pg';

const databaseUrl = String(process.env.DATABASE_URL || '').trim();
if (!databaseUrl) {
  console.error('DATABASE_URL is required for the Railway web database compatibility preflight.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(`
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_file_id TEXT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_stage TEXT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS source_fingerprint TEXT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_generation TEXT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_md5_checksum TEXT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_size_bytes BIGINT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS drive_file_modified_at TIMESTAMP;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS processing_state TEXT DEFAULT 'queued';
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS lease_owner TEXT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMP;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS last_error TEXT;
    ALTER TABLE bna_content_jobs ADD COLUMN IF NOT EXISTS source_provenance JSONB DEFAULT '{}';
  `);
  console.log('Database compatibility preflight complete.');
} finally {
  await pool.end();
}
