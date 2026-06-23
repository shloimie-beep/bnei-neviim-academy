#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const secretsDir = path.join(repoRoot, '.secrets');

function parseArgs(argv = process.argv.slice(2)) {
  return {
    apply: argv.includes('--apply'),
    json: argv.includes('--json'),
    limit: Number(argv.find((arg) => /^--limit=/.test(arg))?.split('=')[1] || 50) || 50,
  };
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function readSecret(name) {
  const filePath = path.join(secretsDir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function usableDatabaseUrl(value) {
  const text = String(value || '').trim();
  if (!text || text.includes('[YOUR-PASSWORD]')) return '';
  return text;
}

function loadConfig() {
  const envFiles = {
    ...parseEnvFile(path.join(repoRoot, '.env.example')),
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
  };
  return {
    databaseUrl:
      usableDatabaseUrl(process.env.DATABASE_URL) ||
      usableDatabaseUrl(readSecret('railway-database-url.txt')) ||
      usableDatabaseUrl(envFiles.DATABASE_URL),
  };
}

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

async function tableExists(db, tableName) {
  const result = await db.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tableName]
  );
  return Boolean(result.rows[0]?.exists);
}

async function columnExists(db, tableName, columnName) {
  const result = await db.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     ) AS exists`,
    [tableName, columnName]
  );
  return Boolean(result.rows[0]?.exists);
}

function quoteIdent(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function legacyCrmSelectExpr(db, tableName, currentColumn, previousColumn, fallback = 'NULL') {
  if (await columnExists(db, tableName, currentColumn)) return quoteIdent(currentColumn);
  if (await columnExists(db, tableName, previousColumn)) return quoteIdent(previousColumn);
  return fallback;
}

async function queryIfTable(db, tableName, sql, params = []) {
  if (!(await tableExists(db, tableName))) return [];
  return (await db.query(sql, params)).rows;
}

async function findStudentRoleIssues(db, limit) {
  const legacyContactExpr = await legacyCrmSelectExpr(db, 'bna_students', 'legacy_crm_contact_id', 'g' + 'hl_contact_id');
  return queryIfTable(db, 'bna_students', `
    SELECT id, name, parent_name, parent_email, parent_phone, tags, status,
           ${legacyContactExpr} AS legacy_crm_contact_id
    FROM bna_students
    WHERE COALESCE(status, 'active') NOT IN ('inactive', 'archived')
      AND (
        NOT EXISTS (
          SELECT 1 FROM unnest(COALESCE(tags, '{}'::text[])) AS tag(value)
          WHERE lower(trim(tag.value)) IN ('student', 'bna student', 'bna_student')
        )
        OR EXISTS (
          SELECT 1 FROM unnest(COALESCE(tags, '{}'::text[])) AS tag(value)
          WHERE lower(trim(tag.value)) IN ('parent', 'bna parent', 'bna_parent')
        )
      )
    ORDER BY updated_at DESC NULLS LAST, id DESC
    LIMIT $1`,
    [limit]
  );
}

async function findKnownStudents(db) {
  const legacyContactExpr = await legacyCrmSelectExpr(db, 'bna_students', 'legacy_crm_contact_id', 'g' + 'hl_contact_id');
  return queryIfTable(db, 'bna_students', `
    SELECT id, name, parent_name, parent_email, parent_phone, tags, status,
           ${legacyContactExpr} AS legacy_crm_contact_id
    FROM bna_students
    WHERE lower(name) LIKE '%hillel%'
       OR lower(name) LIKE '%menachem%'
    ORDER BY lower(name), id`);
}

async function findSignupLegacyCrmCollisions(db, limit) {
  const parentColumn = await legacyCrmSelectExpr(db, 'signups', 'legacy_crm_parent_contact_id', 'g' + 'hl_parent_contact_id', '');
  const studentColumn = await legacyCrmSelectExpr(db, 'signups', 'legacy_crm_student_contact_id', 'g' + 'hl_student_contact_id', '');
  if (!parentColumn || !studentColumn) return [];
  const errorExpr = await legacyCrmSelectExpr(db, 'signups', 'legacy_crm_sync_error', 'g' + 'hl_sync_error');
  return queryIfTable(db, 'signups', `
    SELECT id, parent_name, student_name, parent_email, parent_phone,
           ${parentColumn} AS legacy_parent_contact_id,
           ${studentColumn} AS legacy_student_contact_id,
           ${errorExpr} AS legacy_sync_error
    FROM signups
    WHERE COALESCE(${parentColumn}, '') <> ''
      AND ${parentColumn} = ${studentColumn}
    ORDER BY updated_at DESC NULLS LAST, id DESC
    LIMIT $1`,
    [limit]
  );
}

async function findPhoneOnlyWapiContacts(db, limit) {
  return queryIfTable(db, 'bna_wapi_contacts', `
    SELECT id, provider_contact_id, phone, display_name, push_name, saved, last_synced_at
    FROM bna_wapi_contacts
    WHERE COALESCE(NULLIF(trim(display_name), ''), NULLIF(trim(push_name), '')) IS NULL
      AND COALESCE(NULLIF(trim(phone), ''), '') <> ''
    ORDER BY last_synced_at DESC NULLS LAST, id DESC
    LIMIT $1`,
    [limit]
  );
}

async function findUnresolvedWapiCommunications(db, limit) {
  return queryIfTable(db, 'bna_contact_communications', `
    SELECT id, contact_type, summary, source_context->>'chat_id' AS chat_id,
           metadata->>'matched_name' AS matched_name, occurred_at
    FROM bna_contact_communications
    WHERE source = 'wapi'
      AND COALESCE(metadata->>'matched_name', '') = ''
      AND (
        summary ~ '\\+[0-9]'
        OR lower(summary) LIKE '%unknown%'
        OR COALESCE(source_context->>'chat_id', '') ~ '[0-9]{7,}'
      )
    ORDER BY occurred_at DESC NULLS LAST, id DESC
    LIMIT $1`,
    [limit]
  );
}

async function findResolvablePhoneOnlyContacts(db, phoneOnlyRows) {
  if (!phoneOnlyRows.length) return [];
  const canQuery =
    (await tableExists(db, 'bna_parent_leads')) ||
    (await tableExists(db, 'signups')) ||
    (await tableExists(db, 'bna_students'));
  if (!canQuery) return [];

  const results = [];
  for (const row of phoneOnlyRows) {
    const clean = digits(row.phone);
    const suffix = clean.length >= 7 ? clean.slice(-9) : '';
    if (!clean && !suffix) continue;
    const params = [clean, suffix];
    const matches = [];
    if (await tableExists(db, 'bna_parent_leads')) {
      const lead = (await db.query(
        `SELECT 'lead' AS kind, id, parent_name AS name, parent_phone AS phone
         FROM bna_parent_leads
         WHERE (($1 <> '' AND regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g') = $1)
            OR ($2 <> '' AND right(regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g'), 9) = $2))
           AND COALESCE(status, 'interested') <> 'archived'
         ORDER BY updated_at DESC NULLS LAST, created_at DESC
         LIMIT 1`,
        params
      )).rows[0];
      if (lead) matches.push(lead);
    }
    if (await tableExists(db, 'signups')) {
      const signup = (await db.query(
        `SELECT 'signup' AS kind, id, COALESCE(parent_name, student_name) AS name, parent_phone AS phone
         FROM signups
         WHERE (($1 <> '' AND regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g') = $1)
            OR ($2 <> '' AND right(regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g'), 9) = $2))
           AND COALESCE(status, 'new') <> 'archived'
         ORDER BY updated_at DESC NULLS LAST, created_at DESC
         LIMIT 1`,
        params
      )).rows[0];
      if (signup) matches.push(signup);
    }
    if (await tableExists(db, 'bna_students')) {
      const student = (await db.query(
        `SELECT 'student' AS kind, id, COALESCE(parent_name, name) AS name, parent_phone AS phone
         FROM bna_students
         WHERE (($1 <> '' AND regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g') = $1)
            OR ($2 <> '' AND right(regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g'), 9) = $2))
           AND COALESCE(status, 'active') NOT IN ('inactive', 'archived')
         ORDER BY updated_at DESC NULLS LAST, created_at DESC
         LIMIT 1`,
        params
      )).rows[0];
      if (student) matches.push(student);
    }
    if (matches.length) results.push({ wapi_contact: row, matches });
  }
  return results;
}

async function applyInternalStudentTagRepair(db) {
  if (!(await tableExists(db, 'bna_students'))) return [];
  return (await db.query(`
    WITH cleaned AS (
      SELECT id,
             ARRAY(
               SELECT DISTINCT tag.value
               FROM unnest(COALESCE(tags, '{}'::text[])) AS tag(value)
               WHERE lower(trim(tag.value)) NOT IN ('parent', 'bna parent', 'bna_parent')
             ) AS kept_tags
      FROM bna_students
      WHERE COALESCE(status, 'active') NOT IN ('inactive', 'archived')
    )
    UPDATE bna_students s
    SET tags = (
          SELECT ARRAY(
            SELECT DISTINCT value
            FROM unnest(cleaned.kept_tags || ARRAY['BNA Student']::text[]) AS tag(value)
            WHERE COALESCE(trim(value), '') <> ''
          )
        ),
        updated_at = NOW()
    FROM cleaned
    WHERE s.id = cleaned.id
    RETURNING s.id, s.name, s.tags`)).rows;
}

function printReport(report) {
  console.log('BNA contact role repair report');
  console.log(`Mode: ${report.apply ? 'apply' : 'dry-run'}`);
  console.log(`Known Hillel/Menachem rows: ${report.known_students.length}`);
  for (const row of report.known_students) {
    console.log(`- #${row.id} ${row.name} status=${row.status || ''} tags=${(row.tags || []).join(', ') || '(none)'}`);
  }
  console.log(`Student role issues: ${report.student_role_issues.length}`);
  console.log(`Legacy CRM parent/student collisions: ${report.signup_legacy_crm_collisions.length}`);
  console.log(`Phone-only Whapi contacts: ${report.phone_only_wapi_contacts.length}`);
  console.log(`Resolvable phone-only contacts: ${report.resolvable_phone_only_contacts.length}`);
  console.log(`Unresolved WAPI communications: ${report.unresolved_wapi_communications.length}`);
  if (!report.apply) console.log('Dry-run only. Re-run with --apply to repair internal student tags.');
  if (report.apply && report.applied_internal_student_tags?.length) {
    console.log(`Applied internal student tag repair to ${report.applied_internal_student_tags.length} active student row(s).`);
  }
}

async function main() {
  const args = parseArgs();
  const cfg = loadConfig();
  if (!cfg.databaseUrl) throw new Error('DATABASE_URL or .secrets/railway-database-url.txt is required');
  const db = new Pool({ connectionString: cfg.databaseUrl, ssl: { rejectUnauthorized: false } });
  try {
    const knownStudents = await findKnownStudents(db);
    const studentRoleIssues = await findStudentRoleIssues(db, args.limit);
    const signupLegacyCrmCollisions = await findSignupLegacyCrmCollisions(db, args.limit);
    const phoneOnlyWapiContacts = await findPhoneOnlyWapiContacts(db, args.limit);
    const unresolvedWapiCommunications = await findUnresolvedWapiCommunications(db, args.limit);
    const resolvablePhoneOnlyContacts = await findResolvablePhoneOnlyContacts(db, phoneOnlyWapiContacts);
    const report = {
      success: true,
      dry_run: !args.apply,
      apply: args.apply,
      generated_at: new Date().toISOString(),
      known_students: knownStudents,
      student_role_issues: studentRoleIssues,
      signup_legacy_crm_collisions: signupLegacyCrmCollisions,
      phone_only_wapi_contacts: phoneOnlyWapiContacts,
      resolvable_phone_only_contacts: resolvablePhoneOnlyContacts,
      unresolved_wapi_communications: unresolvedWapiCommunications,
      applied_internal_student_tags: [],
    };
    if (args.apply) {
      report.applied_internal_student_tags = await applyInternalStudentTagRepair(db);
    }
    if (args.json) console.log(JSON.stringify(report, null, 2));
    else printReport(report);
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exitCode = 1;
});
