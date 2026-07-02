const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  buildChatGptRamblePacket,
  validateChatGptRamblePacket,
} = require('../src/lib/bna/ramble-agent-dropoff/packet');
const {
  claimNextPacket,
  listPackets,
  writeDropoffPacket,
} = require('../src/lib/bna/ramble-agent-dropoff/filesystem-queue');

test('ChatGPT ramble packet validates and writes repo-visible queue files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-ramble-dropoff-'));
  const packet = buildChatGptRamblePacket({
    rawText: 'Build the helper control plane and wire it to Codex.',
    title: 'Helper control plane',
    sequence: '901',
    createdAt: '2026-06-26T12:00:00.000Z',
    goalMode: true,
  });

  assert.equal(validateChatGptRamblePacket(packet).ok, true);

  const written = writeDropoffPacket({
    root: dir,
    packet,
    rawText: 'Build the helper control plane and wire it to Codex.',
  });

  assert.equal(fs.existsSync(path.join(written.packet_dir, 'packet.json')), true);
  assert.equal(fs.existsSync(path.join(written.packet_dir, 'RAW.md')), true);
  assert.equal(fs.existsSync(path.join(written.packet_dir, 'CODEX_PROMPT.md')), true);
  assert.equal(fs.existsSync(path.join(written.packet_dir, 'status.json')), true);

  const packets = listPackets(dir);
  assert.equal(packets.length, 1);
  assert.equal(packets[0].status.status, 'queued');

  const claimed = claimNextPacket({ root: dir, agentId: 'test-agent' });
  assert.equal(claimed.packet.packet_id, packet.packet_id);
  assert.equal(claimed.status.status, 'claimed');
});
