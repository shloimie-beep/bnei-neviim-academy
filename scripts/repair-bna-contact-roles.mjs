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
    applyGhl: argv.includes('--apply-ghl'),
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

function parseEnvBlock(rawValue = '') {
  const env = {};
  for (const rawLine of String(rawValue || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    env[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return env;
}

function loadConfig() {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.example')),
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...process.env,
  };
  const inlineGhl = parseEnvBlock(env.GHL_PIT_TOKEN || '');
  return {
    databaseUrl: env.DATABASE_URL || readSecret('railway-database-url.txt'),
    ghlToken:
      (env.GHL_PIT_TOKEN && !env.GHL_PIT_TOKEN.includes('\n') && !env.GHL_PIT_TOKEN.startsWith('GHL_PIT_TOKEN=')
        ? env.GHL_PIT_TOKEN.trim()
        : inlineGhl.GHL_PIT_TOKEN) || readSecret('ghl-pit-token.txt'),
    ghlLocationId: env.GHL_LOCATION_ID || inlineGhl.GHL_LOCATION_ID || 'IIofSrquLHvNxc8zrpka',
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

async function queryIfTable(db, tableName, sql, params = []) {
  if (!(await tableExists(db, tableName))) return [];
  return (await db.query(sql, params)).rows;
}

async function findStudentRoleIssues(db, limit) {
  return queryIfTable(db, 'bna_students', `
    SELECT id, name, parent_name, parent_email, parent_phone, tags, status, ghl_contact_id
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
  return queryIfTable(db, 'bna_students', `
    SELECT id, name, parent_name, parent_email, parent_phone, tags, status, ghl_contact_id
    FROM bna_students
    WHERE lower(name) LIKE '%hillel%'
       OR lower(name) LIKE '%menachem%'
    ORDER BY lower(name), id`);
}

async function findSignupGhlCollisions(db, limit) {
  return queryIfTable(db, 'signups', `
    SELECT id, parent_name, student_name, parent_email, parent_phone,
           ghl_parent_contact_id, ghl_student_contact_id, ghl_sync_error
    FROM signups
    WHERE COALESCE(ghl_parent_contact_id, '') <> ''
      AND ghl_parent_contact_id = ghl_student_contact_id
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

async function removeGhlTag({ token, locationId }, contactId, tag) {
  const response = await fetch(`https://services.leadconnectorhq.com/contacts/${encodeURIComponent(contactId)}/tags`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    body: JSON.stringify({ tags: [tag], locationId }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`GHL tag cleanup failed ${response.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function applyGhlCollisionCleanup(db, cfg, collisions) {
  if (!cfg.ghlToken) throw new Error('GHL_PIT_TOKEN is required for --apply-ghl');
  const cleaned = [];
  for (const collision of collisions) {
    await removeGhlTag({ token: cfg.ghlToken, locationId: cfg.ghlLocationId }, collision.ghl_parent_contact_id, 'BNA Student');
    await db.query(
      `UPDATE signups
       SET ghl_student_contact_id = NULL,
           ghl_sync_error = 'Cleared collided student GHL id; rerun signup sync to create a distinct synthetic student contact.',
           updated_at = NOW()
       WHERE id = $1`,
      [collision.id]
    );
    if (await tableExists(db, 'bna_students')) {
      await db.query(
        `UPDATE bna_students
         SET ghl_contact_id = NULL,
             updated_at = NOW()
         WHERE signup_id = $1
           AND ghl_contact_id = $2`,
        [collision.id, collision.ghl_parent_contact_id]
      );
    }
    cleaned.push({ signup_id: collision.id, parent_contact_id: collision.ghl_parent_contact_id, removed_tag: 'BNA Student' });
  }
  return cleaned;
}

function printReport(report) {
  console.log('BNA contact role repair report');
  console.log(`Mode: ${report.apply ? 'apply' : 'dry-run'}${report.apply_ghl ? ' + apply-ghl' : ''}`);
  console.log(`Known Hillel/Menachem rows: ${report.known_students.length}`);
  for (const row of report.known_students) {
    console.log(`- #${row.id} ${row.name} status=${row.status || ''} tags=${(row.tags || []).join(', ') || '(none)'}`);
  }
  console.log(`Student role issues: ${report.student_role_issues.length}`);
  console.log(`Signup GHL parent/student collisions: ${report.signup_ghl_collisions.length}`);
  console.log(`Phone-only Whapi contacts: ${report.phone_only_wapi_contacts.length}`);
  console.log(`Resolvable phone-only contacts: ${report.resolvable_phone_only_contacts.length}`);
  console.log(`Unresolved WAPI communications: ${report.unresolved_wapi_communications.length}`);
  if (!report.apply) console.log('Dry-run only. Re-run with --apply to repair internal student tags.');
  if (report.apply && report.applied_internal_student_tags?.length) {
    console.log(`Applied internal student tag repair to ${report.applied_internal_student_tags.length} active student row(s).`);
  }
  if (report.apply_ghl && report.applied_ghl_collision_cleanup?.length) {
    console.log(`Applied GHL collision cleanup to ${report.applied_ghl_collision_cleanup.length} signup collision(s).`);
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
    const signupGhlCollisions = await findSignupGhlCollisions(db, args.limit);
    const phoneOnlyWapiContacts = await findPhoneOnlyWapiContacts(db, args.limit);
    const unresolvedWapiCommunications = await findUnresolvedWapiCommunications(db, args.limit);
    const resolvablePhoneOnlyContacts = await findResolvablePhoneOnlyContacts(db, phoneOnlyWapiContacts);
    const report = {
      success: true,
      dry_run: !args.apply,
      apply: args.apply,
      apply_ghl: args.applyGhl,
      generated_at: new Date().toISOString(),
      known_students: knownStudents,
      student_role_issues: studentRoleIssues,
      signup_ghl_collisions: signupGhlCollisions,
      phone_only_wapi_contacts: phoneOnlyWapiContacts,
      resolvable_phone_only_contacts: resolvablePhoneOnlyContacts,
      unresolved_wapi_communications: unresolvedWapiCommunications,
      applied_internal_student_tags: [],
      applied_ghl_collision_cleanup: [],
    };
    if (args.apply) {
      report.applied_internal_student_tags = await applyInternalStudentTagRepair(db);
    }
    if (args.applyGhl) {
      report.applied_ghl_collision_cleanup = await applyGhlCollisionCleanup(db, cfg, signupGhlCollisions);
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
