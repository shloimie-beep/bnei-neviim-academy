#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const {
  inventoryDownloadsSpreadsheets,
} = require('../src/lib/bna/one-time-launch-readiness');

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function argValue(name, fallback = '') {
  const exact = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (exact) return exact.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function evidencePath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

const downloadsDir = path.resolve(argValue('--downloads-dir', path.join(os.homedir(), 'Downloads')));
const sinceDays = Number(argValue('--since-days', '10'));
const reportPath = path.resolve(argValue(
  '--report',
  path.join(repoRoot, 'ops', 'imports', '2026-06-28-downloads-spreadsheet-inventory.json')
));

const inventory = inventoryDownloadsSpreadsheets({ downloadsDir, sinceDays });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(inventory, null, 2)}\n`);

console.log(JSON.stringify({
  success: true,
  report: evidencePath(reportPath),
  generated_at: inventory.generated_at,
  downloads_dir: downloadsDir,
  privacy: inventory.privacy,
  summary: inventory.summary,
  import_candidate_files: inventory.files
    .filter((file) => /import_candidate/.test(file.import_lane))
    .map((file) => ({
      file_name: file.file_name,
      modified_at: file.modified_at,
      row_count: file.row_count,
      import_lane: file.import_lane,
      classification: file.classification,
      sha256_prefix: String(file.sha256 || '').slice(0, 16),
    })),
}, null, 2));
