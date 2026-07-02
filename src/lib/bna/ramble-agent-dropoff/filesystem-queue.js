'use strict';

const fs = require('fs');
const path = require('path');

const {
  DEFAULT_DROPOFF_ROOT,
  packetToCodexPrompt,
  validateChatGptRamblePacket,
} = require('./packet');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeJoin(root, ...parts) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, ...parts);
  const relative = path.relative(resolvedRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    const error = new Error('unsafe path outside queue root');
    error.code = 'unsafe_path';
    throw error;
  }
  return resolved;
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function copyAttachment(sourcePath, targetDir) {
  if (!sourcePath) return null;
  const source = path.resolve(sourcePath);
  if (!fs.existsSync(source)) {
    const error = new Error(`attachment not found: ${sourcePath}`);
    error.code = 'attachment_not_found';
    throw error;
  }
  ensureDir(targetDir);
  const basename = path.basename(source);
  const target = path.join(targetDir, basename);
  fs.copyFileSync(source, target);
  return {
    filename: basename,
    relative_path: path.join('attachments', basename).replace(/\\/g, '/'),
  };
}

function writeDropoffPacket({
  root = DEFAULT_DROPOFF_ROOT,
  packet,
  rawText = '',
  attachments = [],
} = {}) {
  const validation = validateChatGptRamblePacket(packet);
  if (!validation.ok) {
    const error = new Error(validation.errors.join('; '));
    error.code = 'invalid_packet';
    error.validation = validation;
    throw error;
  }

  const packetDir = safeJoin(root, packet.packet_id);
  const attachmentDir = path.join(packetDir, 'attachments');
  ensureDir(packetDir);

  const copiedAttachments = attachments.map((item) => copyAttachment(item, attachmentDir)).filter(Boolean);
  const finalPacket = {
    ...packet,
    attachments: [
      ...(packet.attachments || []),
      ...copiedAttachments,
    ],
  };

  fs.writeFileSync(path.join(packetDir, 'RAW.md'), `${rawText}\n`);
  fs.writeFileSync(path.join(packetDir, 'CODEX_PROMPT.md'), `${packetToCodexPrompt(finalPacket, rawText)}\n`);
  writeJson(path.join(packetDir, 'packet.json'), finalPacket);
  writeJson(path.join(packetDir, 'status.json'), {
    packet_id: finalPacket.packet_id,
    status: 'queued',
    created_at: finalPacket.created_at,
    claimed_at: null,
    claimed_by: null,
  });
  writeJson(path.join(packetDir, 'MANIFEST.json'), {
    packet_id: finalPacket.packet_id,
    files: ['packet.json', 'RAW.md', 'CODEX_PROMPT.md', 'status.json', 'MANIFEST.json', 'attachments/'],
  });
  return {
    packet_dir: packetDir,
    packet: finalPacket,
  };
}

function listPackets(root = DEFAULT_DROPOFF_ROOT) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const packetDir = path.join(root, entry.name);
      return {
        packet_id: entry.name,
        packet_dir: packetDir,
        packet: readJson(path.join(packetDir, 'packet.json'), {}),
        status: readJson(path.join(packetDir, 'status.json'), { status: 'unknown' }),
      };
    });
}

function pendingPackets(root = DEFAULT_DROPOFF_ROOT) {
  return listPackets(root).filter((item) => String(item.status?.status || item.packet?.status || '') === 'queued');
}

function markPacketStatus(root, packetId, status, extra = {}) {
  const packetDir = safeJoin(root, packetId);
  const current = readJson(path.join(packetDir, 'status.json'), {});
  const next = {
    ...current,
    ...extra,
    packet_id: packetId,
    status,
    updated_at: new Date().toISOString(),
  };
  writeJson(path.join(packetDir, 'status.json'), next);
  return next;
}

function claimNextPacket({
  root = DEFAULT_DROPOFF_ROOT,
  agentId = 'agent-fleet',
  dryRun = false,
} = {}) {
  const next = pendingPackets(root)[0] || null;
  if (!next) return null;
  if (dryRun) {
    return {
      ...next,
      dry_run: true,
    };
  }
  const claimed = markPacketStatus(root, next.packet_id, 'claimed', {
    claimed_at: new Date().toISOString(),
    claimed_by: agentId,
  });
  return {
    ...next,
    status: claimed,
  };
}

module.exports = {
  claimNextPacket,
  copyAttachment,
  ensureDir,
  listPackets,
  markPacketStatus,
  pendingPackets,
  readJson,
  safeJoin,
  writeDropoffPacket,
  writeJson,
};
