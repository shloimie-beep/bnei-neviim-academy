#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ONE_TIME_PROJECT_KEY = 'one_time_mishnah_class';
const ONE_TIME_WORKSPACE_KEY = 'rabbi_sheller_provider';

function parseArgs(argv = process.argv.slice(2)) {
  const readValue = (name, fallback = '') => {
    const exact = argv.find((arg) => arg.startsWith(`${name}=`));
    if (exact) return exact.slice(name.length + 1);
    const index = argv.indexOf(name);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };
  return {
    apply: argv.includes('--apply'),
    file: path.resolve(readValue('--file', path.join(os.homedir(), 'Downloads', 'subscribers.csv'))),
    batch: readValue('--batch', 'one-time-subscribers-2026-06-16'),
    report: path.resolve(readValue('--report', path.join(repoRoot, 'ops', 'imports', '2026-06-16-one-time-subscribers-import.md'))),
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
  const filePath = path.join(repoRoot, '.secrets', name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
}

function usableDatabaseUrl(value) {
  const text = String(value || '').trim();
  if (!text || text.includes('[YOUR-PASSWORD]')) return '';
  return text;
}

function databaseUrl() {
  const env = {
    ...parseEnvFile(path.join(repoRoot, '.env.example')),
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
    ...process.env,
  };
  return (
    usableDatabaseUrl(process.env.DATABASE_URL) ||
    usableDatabaseUrl(readSecret('railway-database-url.txt')) ||
    usableDatabaseUrl(env.DATABASE_URL)
  );
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers = [], ...body] = rows.filter((item) => item.some((value) => String(value || '').trim()));
  const normalizedHeaders = headers.map((header) => String(header || '').trim());
  return body.map((values, rowIndex) => Object.fromEntries(
    normalizedHeaders.map((header, columnIndex) => [header, String(values[columnIndex] || '').trim()])
  )).map((record, rowIndex) => ({ ...record, __row_number: rowIndex + 2 }));
}

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : '';
}

function normalizeToken(value) {
  return String(value || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function displayNameFromRow(row, email) {
  const explicit = String(row.name || '').trim();
  if (explicit) return explicit;
  const localPart = String(email || '').split('@')[0] || '';
  const cleaned = localPart.replace(/[._+-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'One Time subscriber';
  return cleaned.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function tagSet(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function statusMapping(sourceStatus) {
  const status = normalizeToken(sourceStatus);
  if (status === 'active') return { leadStatus: 'interested', interestLevel: 'warm' };
  if (status === 'trial') return { leadStatus: 'follow_up', interestLevel: 'warm' };
  if (status === 'cancelled' || status === 'canceled') return { leadStatus: 'not_now', interestLevel: 'cool' };
  return { leadStatus: 'lead_candidate', interestLevel: 'unknown' };
}

function tagsForRow(row, batch) {
  const status = normalizeToken(row.status);
  const plan = normalizeToken(row.plan);
  const tags = [
    'one-time-source:subscribers-csv',
    'one-time-list:rabbi-email-contacts',
    'one-time-campaign-staging',
    'one-time-no-send-until-approved',
    `one-time-import:${batch}`,
    `one-time-status:${status}`,
    `one-time-plan:${plan}`,
  ];
  if (status === 'active') tags.push('one-time-current-subscriber');
  else if (status === 'trial') tags.push('one-time-trial-subscriber', 'one-time-follow-up-candidate');
  else if (status === 'cancelled' || status === 'canceled') tags.push('one-time-reactivation-candidate', 'one-time-manual-review');
  else tags.push('one-time-manual-review');
  return tagSet(tags);
}

function normalizeRows(records, batch) {
  const rows = [];
  const skipped = [];
  const seen = new Set();
  const duplicateEmails = [];
  for (const record of records) {
    const email = normalizeEmail(record.email);
    if (!email) {
      skipped.push({ row_number: record.__row_number, reason: 'missing_or_invalid_email' });
      continue;
    }
    if (seen.has(email)) {
      duplicateEmails.push({ row_number: record.__row_number, reason: 'duplicate_email_in_file' });
      continue;
    }
    seen.add(email);
    const mapped = statusMapping(record.status);
    rows.push({
      row_number: record.__row_number,
      email,
      parent_name: displayNameFromRow(record, email),
      source_status: String(record.status || '').trim() || 'unknown',
      source_plan: String(record.plan || '').trim() || 'unknown',
      source_joined: /^\d{4}-\d{2}-\d{2}$/.test(String(record.joined || '').trim()) ? String(record.joined).trim() : null,
      lead_status: mapped.leadStatus,
      interest_level: mapped.interestLevel,
      tags: tagsForRow(record, batch),
    });
  }
  return { rows, skipped, duplicateEmails };
}

function countBy(values, key) {
  return values.reduce((acc, value) => {
    const bucket = String(value[key] || 'unknown').trim() || 'unknown';
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
}

function importNote(batch) {
  return [
    `Imported from subscribers.csv batch ${batch} for One Time/Rabbi contact staging.`,
    'No campaign, email, SMS, WhatsApp, Telegram, Buffer, payment, or external CRM action was sent or triggered.',
  ].join(' ');
}

async function loadProject(client) {
  const result = await client.query('SELECT id, project_key, name FROM bna_projects WHERE project_key = $1 LIMIT 1', [ONE_TIME_PROJECT_KEY]);
  if (!result.rows[0]) throw new Error(`Project ${ONE_TIME_PROJECT_KEY} not found`);
  return result.rows[0];
}

async function upsertLead(client, project, row, batch) {
  const metadata = {
    import_batch_id: batch,
    import_source_file: 'subscribers.csv',
    source_row_number: row.row_number,
    source_status: row.source_status,
    source_plan: row.source_plan,
    source_joined: row.source_joined,
    project_key: ONE_TIME_PROJECT_KEY,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    no_send: true,
    campaign_send_status: 'not_sent',
    external_write_performed: false,
    approval_required_before_send: true,
  };
  const existing = (await client.query(
    `SELECT id, tags, status, interest_level
     FROM bna_parent_leads
     WHERE project_id = $1
       AND lower(COALESCE(parent_email, '')) = lower($2)
       AND COALESCE(status, 'interested') <> 'archived'
     ORDER BY updated_at DESC NULLS LAST, created_at DESC
     LIMIT 1`,
    [project.id, row.email]
  )).rows[0];

  if (existing) {
    const result = await client.query(
      `UPDATE bna_parent_leads
       SET parent_name = COALESCE(NULLIF($3, ''), parent_name),
           parent_email = COALESCE(NULLIF(parent_email, ''), $2),
           lead_type = 'content_interest',
           status = CASE
             WHEN COALESCE(status, 'interested') IN ('visit_scheduled', 'application_sent', 'accepted_not_paid') THEN status
             ELSE $4
           END,
           interest_level = CASE
             WHEN COALESCE(interest_level, 'unknown') = 'hot' AND $5 <> 'hot' THEN interest_level
             ELSE $5
           END,
           source = CASE
             WHEN COALESCE(source, '') IN ('', 'manual', 'other') THEN 'community_import'
             ELSE source
           END,
           source_detail = COALESCE(source_detail, $6),
           owner = COALESCE(NULLIF(owner, ''), 'Rabbi Elie Scheller'),
           tags = ARRAY(
             SELECT DISTINCT tag_value
             FROM unnest(COALESCE(tags, '{}'::text[]) || $7::text[]) AS tag_values(tag_value)
             WHERE trim(tag_value) <> ''
             ORDER BY tag_value
           ),
           notes = CASE
             WHEN COALESCE(notes, '') ILIKE '%' || $8 || '%' THEN notes
             ELSE trim(both E'\n' FROM concat_ws(E'\n\n', NULLIF(notes, ''), $9))
           END,
           metadata = COALESCE(metadata, '{}'::jsonb) || $10::jsonb,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        existing.id,
        row.email,
        row.parent_name,
        row.lead_status,
        row.interest_level,
        `One Time subscribers CSV import ${batch}`,
        row.tags,
        batch,
        importNote(batch),
        JSON.stringify(metadata),
      ]
    );
    return { action: 'updated', lead: result.rows[0], metadata };
  }

  const result = await client.query(
    `INSERT INTO bna_parent_leads (
       project_id, parent_name, parent_email, lead_type, status, interest_level,
       source, source_detail, owner, tags, notes, metadata
     ) VALUES (
       $1, $2, $3, 'content_interest', $4, $5,
       'community_import', $6, 'Rabbi Elie Scheller', $7::text[], $8, $9::jsonb
     )
     RETURNING *`,
    [
      project.id,
      row.parent_name,
      row.email,
      row.lead_status,
      row.interest_level,
      `One Time subscribers CSV import ${batch}`,
      row.tags,
      importNote(batch),
      JSON.stringify(metadata),
    ]
  );
  return { action: 'inserted', lead: result.rows[0], metadata };
}

async function ensureImportCommunication(client, project, lead, metadata, batch) {
  const existing = (await client.query(
    `SELECT id
     FROM bna_contact_communications
     WHERE lead_id = $1
       AND metadata->>'import_batch_id' = $2
     LIMIT 1`,
    [lead.id, batch]
  )).rows[0];
  if (existing) return { action: 'existing', id: existing.id };
  const result = await client.query(
    `INSERT INTO bna_contact_communications (
       project_id, contact_type, lead_id, channel, direction, summary, body,
       follow_up_required, created_by, source, source_context, metadata
     ) VALUES (
       $1, 'lead', $2, 'internal_note', 'internal_note', $3, $4,
       FALSE, 'Codex', 'community_import', $5::jsonb, $6::jsonb
     )
     RETURNING id`,
    [
      project.id,
      lead.id,
      'One Time subscriber imported for campaign staging',
      importNote(batch),
      JSON.stringify({
        import_batch_id: batch,
        import_source_file: 'subscribers.csv',
        project_key: ONE_TIME_PROJECT_KEY,
        workspace_key: ONE_TIME_WORKSPACE_KEY,
        no_send: true,
      }),
      JSON.stringify(metadata),
    ]
  );
  return { action: 'inserted', id: result.rows[0].id };
}

function renderReport({ args, dryRun, project, normalized, result, startedAt, completedAt }) {
  const lines = [
    '# One Time Subscribers Import - 2026-06-16',
    '',
    `- Mode: ${dryRun ? 'dry-run' : 'applied'}`,
    `- Batch: \`${args.batch}\``,
    `- Source file: \`${path.basename(args.file)}\``,
    `- Target project: \`${ONE_TIME_PROJECT_KEY}\``,
    `- Target workspace: \`${ONE_TIME_WORKSPACE_KEY}\``,
    `- Project id: ${project?.id || '(dry-run not connected)'}`,
    `- Started: ${startedAt}`,
    `- Completed: ${completedAt}`,
    '',
    '## Counts',
    '',
    `- Source rows: ${result.source_rows}`,
    `- Valid unique email contacts: ${normalized.rows.length}`,
    `- Skipped invalid rows: ${normalized.skipped.length}`,
    `- Duplicate rows skipped: ${normalized.duplicateEmails.length}`,
    `- Inserted leads: ${result.inserted_leads}`,
    `- Updated leads: ${result.updated_leads}`,
    `- Import communications inserted: ${result.inserted_communications}`,
    `- Existing import communications reused: ${result.existing_communications}`,
    '',
    '## Source Status Counts',
    '',
    ...Object.entries(countBy(normalized.rows, 'source_status')).sort().map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## Source Plan Counts',
    '',
    ...Object.entries(countBy(normalized.rows, 'source_plan')).sort().map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## Safety',
    '',
    '- Imported only into first-party One Time `bna_parent_leads` rows plus internal `bna_contact_communications` notes.',
    '- No campaign, email, SMS, WhatsApp, Telegram, Buffer, payment, or external CRM action was sent or triggered.',
    '- Every imported row carries no-send/campaign-approval metadata and the `one-time-no-send-until-approved` tag.',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs();
  const startedAt = new Date().toISOString();
  const text = fs.readFileSync(args.file, 'utf8');
  const records = parseCsv(text);
  const normalized = normalizeRows(records, args.batch);
  const result = {
    source_rows: records.length,
    inserted_leads: 0,
    updated_leads: 0,
    inserted_communications: 0,
    existing_communications: 0,
  };
  let project = null;

  if (args.apply) {
    const url = databaseUrl();
    if (!url) throw new Error('DATABASE_URL or .secrets/railway-database-url.txt is required');
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      project = await loadProject(client);
      for (const row of normalized.rows) {
        const upserted = await upsertLead(client, project, row, args.batch);
        if (upserted.action === 'inserted') result.inserted_leads += 1;
        else result.updated_leads += 1;
        const communication = await ensureImportCommunication(client, project, upserted.lead, upserted.metadata, args.batch);
        if (communication.action === 'inserted') result.inserted_communications += 1;
        else result.existing_communications += 1;
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  } else {
    project = { id: '(dry-run)', project_key: ONE_TIME_PROJECT_KEY, name: 'One Time Mishnah Class' };
  }

  const completedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(args.report), { recursive: true });
  fs.writeFileSync(args.report, renderReport({ args, dryRun: !args.apply, project, normalized, result, startedAt, completedAt }));
  console.log(JSON.stringify({
    success: true,
    applied: args.apply,
    report: args.report,
    source_rows: records.length,
    valid_unique_email_contacts: normalized.rows.length,
    skipped_invalid_rows: normalized.skipped.length,
    duplicate_rows_skipped: normalized.duplicateEmails.length,
    inserted_leads: result.inserted_leads,
    updated_leads: result.updated_leads,
    inserted_communications: result.inserted_communications,
    existing_communications: result.existing_communications,
    no_send: true,
    external_write_performed: false,
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exitCode = 1;
});
