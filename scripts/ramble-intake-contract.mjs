import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { validateIntakeSourceRecord } = require('../src/platform/ingestion/intake-source');
const { buildCanonicalIntakePacket } = require('../src/platform/ingestion/intake-service');
const {
  applyCanonicalIntakePacketToMemory,
  createMemoryIntakePersistenceStore,
} = require('../src/platform/ingestion/intake-persistence');

function readInput(argv = process.argv.slice(2)) {
  const fileArg = argv.find((arg) => arg.startsWith('--file='));
  if (fileArg) return fs.readFileSync(fileArg.slice('--file='.length), 'utf8');
  const textArg = argv.find((arg) => arg.startsWith('--text='));
  if (textArg) return textArg.slice('--text='.length);
  return fs.readFileSync(0, 'utf8') || 'Demo ramble intake item: create a Codex task to verify the parent prompt queue contract and record evidence.';
}

function hasFlag(argv = process.argv.slice(2), flag) {
  return argv.includes(flag);
}

const argv = process.argv.slice(2);
const rawText = readInput(argv);
const packet = buildCanonicalIntakePacket({
  source_provider: 'manual',
  source_kind: 'text',
  raw_text: rawText,
  actor: 'local_contract_script',
  parser_version: 'w3-platform-parser-v1',
});
const source = packet.source_record;
const validation = validateIntakeSourceRecord(source);
const parsed = packet.parsed;
const memoryReadback = hasFlag(argv, '--apply-memory') || hasFlag(argv, '--memory-readback')
  ? applyCanonicalIntakePacketToMemory(packet, {
      store: createMemoryIntakePersistenceStore(),
      applied_at: packet.generated_at,
    })
  : null;

process.stdout.write(`${JSON.stringify({
  source,
  validation,
  parsed,
  parent_prompt: packet.parent_prompt,
  persistence: packet.persistence,
  memory_readback: memoryReadback,
}, null, 2)}\n`);
