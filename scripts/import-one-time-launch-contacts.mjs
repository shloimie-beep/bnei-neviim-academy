#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const require = createRequire(import.meta.url);
const {
  ONE_TIME_LAUNCH_BATCH,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_REQUIRED_CONTACT_TAGS,
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeContactImportPlan,
} = require('../src/lib/bna/one-time-launch-readiness');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function hasArg(name) {
  return process.argv.includes(name);
}

function argValue(name, fallback = '') {
  const exact = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (exact) return exact.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function evidencePath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
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
    usableDatabaseUrl(process.env.DATABASE_URL)
    || usableDatabaseUrl(readSecret('railway-database-url.txt'))
    || usableDatabaseUrl(env.DATABASE_URL)
  );
}

function countBy(values = [], key) {
  return values.reduce((acc, value) => {
    const bucket = String(value[key] || 'unknown').trim() || 'unknown';
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
}

function tagPreview(plan) {
  const tags = new Set();
  for (const tag of plan.required_contact_tags || ONE_TIME_REQUIRED_CONTACT_TAGS) tags.add(tag);
  for (const contact of plan.contacts || []) {
    for (const tag of contact.tags || []) tags.add(tag);
  }
  return [...tags].filter((tag) =>
    /^(active_old_app|warm_uncontacted|imported_needs_review|no_send|campaign_candidate_30_day_free|one_time_mishnah_class|rabbi_sheller_provider|one-time-)/.test(tag)
  ).sort();
}

function redactedPlanSummary(plan, result = {}) {
  return {
    generated_at: plan.generated_at,
    batch_id: plan.batch_id,
    workspace_key: plan.workspace_key,
    project_key: plan.project_key,
    preview_only: plan.preview_only,
    apply_requested: plan.apply_requested,
    force_rabbi_onetime: plan.force_rabbi_onetime === true,
    no_send: plan.no_send,
    external_write_performed: false,
    private_contact_values_in_report: false,
    source_files: plan.source_files,
    counts: plan.counts,
    required_contact_tags: plan.required_contact_tags || ONE_TIME_REQUIRED_CONTACT_TAGS,
    source_status_counts: countBy(plan.contacts, 'source_status'),
    lead_status_counts: countBy(plan.contacts, 'lead_status'),
    required_tags_present: {
      active_old_app: tagPreview(plan).includes('active_old_app'),
      warm_uncontacted: tagPreview(plan).includes('warm_uncontacted'),
      imported_needs_review: tagPreview(plan).includes('imported_needs_review'),
      no_send: tagPreview(plan).includes('no_send'),
      campaign_candidate_30_day_free: tagPreview(plan).includes('campaign_candidate_30_day_free'),
      one_time_mishnah_class: tagPreview(plan).includes('one_time_mishnah_class'),
      rabbi_sheller_provider: tagPreview(plan).includes('rabbi_sheller_provider'),
    },
    ui_tags_present: tagPreview(plan).filter((tag) => tag.startsWith('one-time-')).slice(0, 24),
    duplicate_key_hashes: plan.duplicate_key_hashes,
    skipped_count: plan.skipped.length,
    safety: plan.safety,
    apply_result: result,
  };
}

function markdownReport(summary) {
  const lines = [
    '# One Time Launch Contacts Import',
    '',
    `- Generated: ${summary.generated_at}`,
    `- Mode: ${summary.preview_only ? 'redacted dry run' : 'applied first-party DB import'}`,
    `- Batch: \`${summary.batch_id}\``,
    `- Workspace: \`${summary.workspace_key}\``,
    `- Project: \`${summary.project_key}\``,
    `- No-send: ${summary.no_send ? 'true' : 'false'}`,
    `- External write performed: ${summary.external_write_performed ? 'true' : 'false'}`,
    `- Private contact values in report: ${summary.private_contact_values_in_report ? 'true' : 'false'}`,
    '',
    '## Counts',
    '',
    ...Object.entries(summary.counts || {}).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Source Files',
    '',
    ...summary.source_files.map((file) => `- \`${file.file_name}\`: ${file.row_count} rows, ${file.import_lane}, ${file.classification}, hash ${String(file.sha256 || '').slice(0, 16)}`),
    '',
    '## Required Tags',
    '',
    ...Object.entries(summary.required_tags_present || {}).map(([key, value]) => `- ${key}: ${value ? 'present' : 'missing'}`),
    '',
    'Configured required tags are listed even when this batch has zero contacts in that status bucket.',
    '',
    '## Safety',
    '',
    ...summary.safety.map((item) => `- ${item}`),
  ];
  return `${lines.join('\n')}\n`;
}

async function loadProject(client) {
  const result = await client.query('SELECT id, project_key, name FROM bna_projects WHERE project_key = $1 LIMIT 1', [ONE_TIME_PROJECT_KEY]);
  if (!result.rows[0]) throw new Error(`Project ${ONE_TIME_PROJECT_KEY} not found`);
  return result.rows[0];
}

async function upsertContact(client, project, contact, plan) {
  const source = contact.sources?.[0] || contact.source || {};
  const batchId = plan.batch_id || ONE_TIME_LAUNCH_BATCH;
  const metadata = {
    import_batch_id: batchId,
    import_source_files: (contact.sources || [source]).map((item) => ({
      file_name: item.file_name,
      file_sha256: item.file_sha256,
      row_number: item.row_number,
    })),
    source_status: contact.source_status,
    source_plan: contact.source_plan,
    project_key: ONE_TIME_PROJECT_KEY,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    no_send: true,
    campaign_candidate_30_day_free: contact.campaign_candidate_30_day_free,
    external_write_performed: false,
    approval_required_before_send: true,
  };
  const existing = (await client.query(
    `SELECT id, tags
       FROM bna_parent_leads
      WHERE project_id = $1
        AND COALESCE(status, 'interested') <> 'archived'
        AND (
          ($2 <> '' AND lower(COALESCE(parent_email, '')) = lower($2))
          OR ($3 <> '' AND regexp_replace(COALESCE(parent_phone, ''), '\\D', '', 'g') = $3)
        )
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
      LIMIT 1`,
    [project.id, contact.email || '', contact.phone || '']
  )).rows[0];

  if (existing) {
    const result = await client.query(
      `UPDATE bna_parent_leads
          SET parent_name = COALESCE(NULLIF($3, ''), parent_name),
              parent_email = COALESCE(NULLIF($2, ''), parent_email),
              parent_phone = COALESCE(NULLIF($4, ''), parent_phone),
              lead_type = 'content_interest',
              status = CASE
                WHEN COALESCE(status, 'interested') IN ('visit_scheduled', 'application_sent', 'accepted_not_paid') THEN status
                ELSE $5
              END,
              interest_level = $6,
              source = CASE
                WHEN COALESCE(source, '') IN ('', 'manual', 'other') THEN 'community_import'
                ELSE source
              END,
              source_detail = COALESCE(source_detail, $7),
              owner = COALESCE(NULLIF(owner, ''), 'Rabbi Elie Scheller'),
              tags = ARRAY(
                SELECT DISTINCT tag_value
                  FROM unnest(COALESCE(tags, '{}'::text[]) || $8::text[]) AS tag_values(tag_value)
                 WHERE trim(tag_value) <> ''
                 ORDER BY tag_value
              ),
              metadata = COALESCE(metadata, '{}'::jsonb) || $9::jsonb,
              updated_at = NOW()
        WHERE id = $1
        RETURNING id`,
      [
        existing.id,
        contact.email || '',
        contact.parent_name || 'One Time contact',
        contact.phone || '',
        contact.lead_status,
        contact.interest_level,
        `One Time launch import ${batchId}`,
        contact.tags,
        JSON.stringify(metadata),
      ]
    );
    return { action: 'updated', lead_id: result.rows[0].id, metadata };
  }

  const result = await client.query(
    `INSERT INTO bna_parent_leads (
       project_id, parent_name, parent_email, parent_phone, lead_type, status, interest_level,
       source, source_detail, owner, tags, metadata
     ) VALUES (
       $1, $2, $3, $4, 'content_interest', $5, $6,
       'community_import', $7, 'Rabbi Elie Scheller', $8::text[], $9::jsonb
     )
     RETURNING id`,
    [
      project.id,
      contact.parent_name || 'One Time contact',
      contact.email || null,
      contact.phone || null,
      contact.lead_status,
      contact.interest_level,
      `One Time launch import ${batchId}`,
      contact.tags,
      JSON.stringify(metadata),
    ]
  );
  return { action: 'inserted', lead_id: result.rows[0].id, metadata };
}

async function applyPlan(plan) {
  if (!hasArg('--confirm-one-time-import')) {
    throw new Error('Apply mode requires --confirm-one-time-import. Dry-run smoke never writes contacts.');
  }
  const url = databaseUrl();
  if (!url) throw new Error('DATABASE_URL or .secrets/railway-database-url.txt is required for apply mode');
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  const result = {
    inserted_leads: 0,
    updated_leads: 0,
    external_write_performed: false,
    first_party_db_write_performed: true,
  };
  try {
    await client.query('BEGIN');
    const project = await loadProject(client);
    for (const contact of plan.contacts) {
      const write = await upsertContact(client, project, contact, plan);
      if (write.action === 'inserted') result.inserted_leads += 1;
      else result.updated_leads += 1;
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
  return result;
}

const apply = hasArg('--apply');
const smoke = hasArg('--smoke');
const forceRabbiOneTime = hasArg('--force-rabbi-onetime') || hasArg('--operator-approved-one-time-contacts');
const batchId = argValue('--batch-id', ONE_TIME_LAUNCH_BATCH);
const downloadsDir = path.resolve(argValue('--downloads-dir', path.join(os.homedir(), 'Downloads')));
const reportPath = path.resolve(argValue(
  '--report',
  path.join(repoRoot, 'ops', 'imports', '2026-06-28-one-time-launch-contacts-import.md')
));

const plan = buildOneTimeContactImportPlan({ downloadsDir, apply, forceRabbiOneTime, batchId });
if (smoke) {
  assert.ok(plan.source_files.length >= 1, 'expected at least one One Time contact/suppression spreadsheet import candidate');
  assert.ok(plan.counts.contacts_after_dedupe >= 1, 'expected at least one deduped One Time contact candidate');
  assert.equal(plan.no_send, true);
  assert.equal(plan.external_write_performed, false);
  assert.equal(plan.private_contact_values_in_report, false);
  assert.equal(plan.contacts.every((contact) => contact.no_send === true), true);
  assert.equal(plan.contacts.every((contact) => contact.tags.includes(ONE_TIME_WORKSPACE_KEY)), true);
  assert.equal(plan.contacts.every((contact) => contact.tags.includes(ONE_TIME_PROJECT_KEY)), true);
}

const applyResult = apply ? await applyPlan(plan) : {
  inserted_leads: 0,
  updated_leads: 0,
  first_party_db_write_performed: false,
  external_write_performed: false,
};
const summary = redactedPlanSummary(plan, applyResult);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, markdownReport(summary));

console.log(JSON.stringify({
  success: true,
  smoke,
  applied: apply,
  report: evidencePath(reportPath),
  batch_id: summary.batch_id,
  workspace_key: summary.workspace_key,
  project_key: summary.project_key,
  private_contact_values_in_report: summary.private_contact_values_in_report,
  counts: summary.counts,
  required_tags_present: summary.required_tags_present,
  apply_result: summary.apply_result,
}, null, 2));
