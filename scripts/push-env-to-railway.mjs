#!/usr/bin/env node
// Push every variable from .env.local to the linked Railway project.
// Run AFTER `railway init` has linked this folder to a Railway project.
//
// Usage: node scripts/push-env-to-railway.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');

const vars = [];
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  const [, key, rawValue] = m;
  const value = rawValue.replace(/^["']|["']$/g, '');
  if (!value) continue; // skip empties
  vars.push({ key, value });
}

console.log(`→ Pushing ${vars.length} variables to Railway...`);
console.log(`  (DATABASE_URL skipped — Railway auto-injects it if you add Postgres plugin; otherwise it stays Supabase's)\n`);

let pushed = 0;
let skipped = 0;
for (const { key, value } of vars) {
  try {
    execSync(`railway variables --set "${key}=${value}"`, { stdio: 'pipe' });
    console.log(`  ✓ ${key}`);
    pushed++;
  } catch (err) {
    console.error(`  ✗ ${key}: ${err.message.split('\n')[0]}`);
    skipped++;
  }
}

console.log(`\n✓ Pushed ${pushed} vars, ${skipped} failed.`);
console.log('  Next: railway up');
