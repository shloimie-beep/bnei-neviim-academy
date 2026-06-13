#!/usr/bin/env node
// Apply supabase-schema.sql + supabase-migration-002.sql to the Supabase
// project at DATABASE_URL. Idempotent — safe to re-run.
//
// Usage:
//   node scripts/apply-schema.mjs
//
// Requires DATABASE_URL in .env.local with the real DB password substituted
// (not the [YOUR-PASSWORD] placeholder Supabase shows on the connection page).
// Get the password from:
//   https://supabase.com/dashboard/project/amipeuneopdbzuhlnimt/settings/database

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

// Load .env.local manually (no dotenv dependency in this dev script)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.includes('[YOUR-PASSWORD]')) {
  console.error('✗ DATABASE_URL is missing or still has [YOUR-PASSWORD] placeholder.');
  console.error('  Edit .env.local — replace [YOUR-PASSWORD] with the real DB password.');
  console.error('  Get it from: https://supabase.com/dashboard/project/amipeuneopdbzuhlnimt/settings/database');
  process.exit(1);
}

const repoRoot = path.join(__dirname, '..');
const schemaFiles = [
  'supabase-schema.sql',
  'supabase-migration-002.sql',
];

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log('→ Connecting to Supabase Postgres...');
  await client.connect();
  console.log('✓ Connected.\n');

  for (const file of schemaFiles) {
    const full = path.join(repoRoot, file);
    if (!fs.existsSync(full)) {
      console.log(`⚠  ${file} not found — skipping`);
      continue;
    }
    const sql = fs.readFileSync(full, 'utf8');
    console.log(`→ Applying ${file} (${sql.length} chars)...`);
    await client.query(sql);
    console.log(`✓ ${file} applied.\n`);
  }

  const { rows: tables } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log('Tables now in public schema:');
  for (const r of tables) console.log(`  • ${r.table_name}`);

  const { rows: users } = await client.query(`SELECT name, role FROM users ORDER BY role, name`);
  console.log('\nSeeded users:');
  for (const u of users) console.log(`  • ${u.name} (${u.role})`);

  console.log('\n✓ Schema apply complete. Don\'t forget:');
  console.log('  1. Create the `proofs` storage bucket (private) in the Supabase dashboard');
  console.log('  2. Rotate the JWT keys (anon + service_role) since they were pasted in chat');
  console.log('     → https://supabase.com/dashboard/project/amipeuneopdbzuhlnimt/settings/api');
} catch (err) {
  console.error('\n✗ Failed:', err.message);
  if (err.message.includes('password')) {
    console.error('  → DATABASE_URL password is wrong. Reset it at:');
    console.error('    https://supabase.com/dashboard/project/amipeuneopdbzuhlnimt/settings/database');
  }
  process.exit(1);
} finally {
  await client.end();
}
