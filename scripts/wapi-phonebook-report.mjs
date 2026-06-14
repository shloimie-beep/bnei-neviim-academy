#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { Pool } from 'pg';

const require = createRequire(import.meta.url);
const { buildWapiPhonebookReport } = require('../src/lib/bna/wapi-phonebook-report');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const secretsDir = path.join(repoRoot, '.secrets');

function parseArgs(argv = process.argv.slice(2)) {
  return {
    json: argv.includes('--json'),
    limit: Math.max(1, Math.min(Number(argv.find((arg) => /^--limit=/.test(arg))?.split('=')[1] || 100), 500)),
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

function printReport(report) {
  console.log('BNA WAPI phonebook grouping report');
  console.log(`Mode: dry-run / read-only`);
  console.log(`Generated: ${report.generated_at}`);
  console.log(`Phonebook groups: ${report.summary.phonebook_groups}`);
  console.log(`Manual correction candidates: ${report.summary.manual_correction_candidates}`);
  console.log(`No send: ${report.no_send ? 'yes' : 'no'}`);
  console.log('Recommended types:');
  for (const [type, count] of Object.entries(report.summary.recommended_types || {}).sort()) {
    console.log(`- ${type}: ${count}`);
  }
  console.log('Top review candidates:');
  for (const group of (report.manual_correction_candidates || []).slice(0, 12)) {
    const flags = group.review_flags.length ? ` flags=${group.review_flags.join(',')}` : '';
    const latest = group.latest_at ? ` latest=${group.latest_at}` : '';
    console.log(`- ${group.display_name} -> ${group.recommended_type} (${group.confidence_label})${flags}${latest}`);
  }
  console.log('Dry-run only. This report does not send WhatsApp messages or update contact tags/stages.');
}

async function main() {
  const args = parseArgs();
  const url = databaseUrl();
  if (!url) throw new Error('DATABASE_URL or .secrets/railway-database-url.txt is required');
  const db = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    const report = await buildWapiPhonebookReport({ db, limit: args.limit });
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
