import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildChatGptRamblePacket } = require('../src/lib/bna/ramble-agent-dropoff/packet');
const { writeDropoffPacket } = require('../src/lib/bna/ramble-agent-dropoff/filesystem-queue');

function argValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function readText() {
  const file = argValue('file');
  if (file) return fs.readFileSync(file, 'utf8');
  const text = argValue('text');
  if (text) return text;
  return fs.readFileSync(0, 'utf8');
}

const rawText = readText();
const attachments = process.argv
  .slice(2)
  .filter((arg) => arg.startsWith('--attach='))
  .map((arg) => arg.slice('--attach='.length));

const packet = buildChatGptRamblePacket({
  rawText,
  title: argValue('title', 'ChatGPT ramble packet'),
  actor: argValue('actor', 'Shloimie'),
  workspaceKey: argValue('workspace', 'bna'),
  projectKey: argValue('project', 'bna'),
  sequence: argValue('sequence', '001'),
  goalMode: hasFlag('goal-mode'),
  acceptanceCriteria: [
    'Packet is repo-visible.',
    'Agent can claim packet.',
    'Raw input and task handoff are created.',
    'Tests/evidence are recorded.',
  ],
});

const result = writeDropoffPacket({
  root: argValue('root', undefined) || undefined,
  packet,
  rawText,
  attachments,
});

process.stdout.write(`${JSON.stringify({
  ok: true,
  packet_id: result.packet.packet_id,
  packet_dir: result.packet_dir,
}, null, 2)}\n`);
