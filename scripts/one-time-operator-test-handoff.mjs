#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handoff from '../src/lib/bna/one-time-operator-test-handoff.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return '';
  return String(process.argv[index + 1] || '').trim();
}

function readJson(inputPath) {
  const absolute = path.isAbsolute(inputPath) ? inputPath : path.join(repoRoot, inputPath);
  if (!fs.existsSync(absolute)) return null;
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

const proofPath = argValue('--proof-json');
const snapshot = proofPath
  ? readJson(proofPath)
  : readJson('ops/production-readiness/latest-production-readiness-snapshot.json');
const checks = proofPath ? snapshot : handoff.deriveChecksFromReadinessSnapshot(snapshot || {});
const report = handoff.buildOneTimeOperatorTestHandoff(checks, {
  contactIdPlaceholder: argValue('--contact-id-placeholder') || '<operator_test_contact_id>',
});

if (args.has('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else if (report.ready) {
  console.log(report.ready_message);
  console.log('');
  console.log('Guarded reminder test command:');
  console.log(report.reminder_test_command);
} else {
  console.log('One Time operator test handoff: BLOCKED');
  console.log('The ready message is suppressed until every required check passes.');
  for (const item of report.missing_checks) {
    console.log(`- ${item.key}: ${item.label}`);
  }
}

process.exit(report.ready ? 0 : 1);
