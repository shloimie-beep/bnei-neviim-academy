import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  claimNextPacket,
  listPackets,
  markPacketStatus,
  readJson,
} = require('../src/lib/bna/ramble-agent-dropoff/filesystem-queue');

const ROOT = 'ops/chatgpt-ramble-dropoff/incoming';

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function appendLine(file, value) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${value}\n`);
}

function slug(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'chatgpt-ramble';
}

function materializePacket(packetItem, { dryRun = false } = {}) {
  const packet = packetItem.packet || readJson(path.join(packetItem.packet_dir, 'packet.json'), {});
  const raw = fs.existsSync(path.join(packetItem.packet_dir, 'RAW.md'))
    ? fs.readFileSync(path.join(packetItem.packet_dir, 'RAW.md'), 'utf8')
    : '';
  const codexPrompt = fs.existsSync(path.join(packetItem.packet_dir, 'CODEX_PROMPT.md'))
    ? fs.readFileSync(path.join(packetItem.packet_dir, 'CODEX_PROMPT.md'), 'utf8')
    : '';

  const titleSlug = slug(packet.title || packet.packet_id);
  const rawPath = packet.raw_text_path || `raw-input/${packet.raw_id}-${titleSlug}.md`;
  const taskPath = packet.primary_task_path || `tasks-pending/${new Date().toISOString().slice(0, 10)}-${titleSlug}.md`;
  const ledgerRecord = {
    event: 'chatgpt_ramble_packet_claimed',
    packet_id: packet.packet_id,
    raw_id: packet.raw_id,
    task_path: taskPath,
    raw_path: rawPath,
    claimed_at: new Date().toISOString(),
    status: dryRun ? 'dry_run' : 'claimed',
  };

  if (!dryRun) {
    ensureDir(path.dirname(rawPath));
    if (!fs.existsSync(rawPath)) {
      fs.writeFileSync(rawPath, [
        `# ${packet.raw_id} - ${packet.title || 'ChatGPT ramble'}`,
        '',
        `Packet: \`${packet.packet_id}\``,
        `Source: ChatGPT`,
        `Captured: ${packet.created_at || new Date().toISOString()}`,
        '',
        '## Raw',
        '',
        raw,
      ].join('\n'));
    }

    ensureDir(path.dirname(taskPath));
    if (!fs.existsSync(taskPath)) {
      fs.writeFileSync(taskPath, [
        `# ${packet.title || packet.packet_id}`,
        '',
        `Source packet: \`${packet.packet_id}\``,
        `Raw ID: \`${packet.raw_id}\``,
        '',
        '## Codex prompt',
        '',
        codexPrompt,
      ].join('\n'));
    }

    appendLine('ops/agent-task-ledger.jsonl', JSON.stringify(ledgerRecord));
    markPacketStatus(ROOT, packet.packet_id, 'picked_up', {
      picked_up_at: new Date().toISOString(),
      raw_path: rawPath,
      task_path: taskPath,
    });
  }

  return {
    ok: true,
    dry_run: dryRun,
    packet_id: packet.packet_id,
    raw_path: rawPath,
    task_path: taskPath,
    ledger_record: ledgerRecord,
  };
}

if (hasFlag('status')) {
  process.stdout.write(`${JSON.stringify({
    root: ROOT,
    packets: listPackets(ROOT).map((item) => ({
      packet_id: item.packet_id,
      status: item.status?.status || 'unknown',
    })),
  }, null, 2)}\n`);
  process.exit(0);
}

const dryRun = hasFlag('dry-run');
const claimed = claimNextPacket({
  root: ROOT,
  agentId: process.env.BNA_AGENT_ID || 'agent-fleet',
  dryRun,
});

if (!claimed) {
  process.stdout.write(`${JSON.stringify({ ok: true, picked_up: false, reason: 'no_queued_packets' }, null, 2)}\n`);
  process.exit(0);
}

process.stdout.write(`${JSON.stringify(materializePacket(claimed, { dryRun }), null, 2)}\n`);
