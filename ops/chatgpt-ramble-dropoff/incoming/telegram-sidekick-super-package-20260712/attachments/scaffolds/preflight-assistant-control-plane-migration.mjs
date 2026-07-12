#!/usr/bin/env node

// Read-only preflight starter. Run against each target database before applying
// the V2 migration. It never prints DATABASE_URL or row contents.

import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required for read-only assistant migration preflight.');
  process.exit(2);
}

const pool = new Pool({ connectionString, max: 1, statement_timeout: 15000 });

async function scalar(client, sql, params = []) {
  const result = await client.query(sql, params);
  return result.rows[0] || null;
}

async function duplicateCheck(client, table, column, predicate = 'TRUE') {
  const exists = await scalar(client, 'SELECT to_regclass($1) AS name', [`public.${table}`]);
  if (!exists?.name) return { table, column, exists: false, duplicate_groups: 0 };
  const result = await scalar(client, `
    SELECT COUNT(*)::integer AS duplicate_groups
    FROM (
      SELECT ${column}
      FROM ${table}
      WHERE ${predicate}
      GROUP BY ${column}
      HAVING COUNT(*) > 1
    ) duplicates
  `);
  return { table, column, exists: true, duplicate_groups: Number(result?.duplicate_groups || 0) };
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    const checks = [];
    checks.push(await duplicateCheck(client, 'assistant_messages', 'source_envelope_id', "source_envelope_id IS NOT NULL AND BTRIM(source_envelope_id) <> ''"));
    checks.push(await duplicateCheck(client, 'assistant_action_runs', 'idempotency_key', "idempotency_key IS NOT NULL AND BTRIM(idempotency_key) <> ''"));
    checks.push(await duplicateCheck(client, 'assistant_delivery_outbox', 'idempotency_key', "idempotency_key IS NOT NULL AND BTRIM(idempotency_key) <> ''"));

    const tables = [
      'assistant_channels', 'assistant_identities', 'assistant_conversations',
      'assistant_messages', 'assistant_action_plans', 'assistant_action_runs',
      'assistant_previews', 'assistant_approvals', 'assistant_delivery_outbox',
      'assistant_dead_letters', 'bna_projects', 'bna_students',
      'bna_class_sessions', 'bna_courses'
    ];
    const tableState = {};
    for (const table of tables) {
      const result = await scalar(client, 'SELECT to_regclass($1) AS name', [`public.${table}`]);
      tableState[table] = Boolean(result?.name);
    }

    const controlCenterColumns = await client.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('assistant_conversations','assistant_approvals','assistant_drafts')
      ORDER BY table_name, ordinal_position
    `);
    const blockers = [
      ...checks.filter((row) => row.duplicate_groups > 0).map((row) => `${row.table}.${row.column}:duplicate_groups=${row.duplicate_groups}`),
      ...Object.entries(tableState).filter(([, exists]) => !exists).map(([table]) => `${table}:missing`),
    ];
    const report = {
      schema_version: 'bna.assistant_migration_preflight.v1',
      checked_at: new Date().toISOString(),
      database_identity_redacted: true,
      checks,
      table_state: tableState,
      control_center_columns: controlCenterColumns.rows,
      blockers,
      ok: blockers.length === 0,
    };
    await client.query('ROLLBACK');
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (!report.ok) process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(async (error) => {
  console.error(JSON.stringify({ ok: false, error_code: 'preflight_failed', error: String(error.message || error).slice(0, 500) }));
  await pool.end().catch(() => null);
  process.exit(1);
});
