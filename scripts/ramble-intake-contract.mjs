import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const {
  createIntakeSourceRecord,
  validateIntakeSourceRecord,
} = require('../src/platform/ingestion/intake-source');
const {
  parsePlatformIntake,
} = require('../src/platform/ingestion/canonical-parser');

function readInput(argv = process.argv.slice(2)) {
  const fileArg = argv.find((arg) => arg.startsWith('--file='));
  if (fileArg) return fs.readFileSync(fileArg.slice('--file='.length), 'utf8');
  const textArg = argv.find((arg) => arg.startsWith('--text='));
  if (textArg) return textArg.slice('--text='.length);
  return fs.readFileSync(0, 'utf8') || 'Demo ramble intake item: create a Codex task to verify the parent prompt queue contract and record evidence.';
}

const rawText = readInput();
const source = createIntakeSourceRecord({
  source_provider: 'manual',
  source_kind: 'text',
  raw_text: rawText,
  actor: 'local_contract_script',
  parser_version: 'w3-platform-parser-v1',
});
const validation = validateIntakeSourceRecord(source);
const parsed = parsePlatformIntake({
  raw_text: rawText,
  source_id: source.stable_key,
  raw_id: source.stable_key,
  source_provider: source.source_provider,
});

process.stdout.write(`${JSON.stringify({ source, validation, parsed }, null, 2)}\n`);
