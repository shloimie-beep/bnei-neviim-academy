const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ALLOWED_EXTENSIONS = new Set(['.md', '.json', '.html', '.png']);
const EXCLUDED_PATTERNS = [
  /storage-state/i,
  /auth/i,
  /cookie/i,
  /token/i,
  /secret/i,
  /\.env/i,
  /source-map/i,
  /\.map$/i,
  /raw/i,
];

function shouldIncludePackageFile(filePath, runDir) {
  const rel = path.relative(runDir, filePath).replace(/\\/g, '/');
  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) return false;
  if (rel === 'agent-review-package.zip') return false;
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(rel))) return false;
  if (rel.startsWith('screenshots/') || rel.startsWith('contact-sheets/')) return ext === '.png';
  return true;
}

function collectPackageFiles(runDir) {
  const out = [];
  walk(runDir, (file) => {
    if (shouldIncludePackageFile(file, runDir)) {
      out.push({
        absolutePath: file,
        archivePath: path.relative(runDir, file).replace(/\\/g, '/'),
      });
    }
  });
  return out.sort((a, b) => a.archivePath.localeCompare(b.archivePath));
}

function walk(dir, visit) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else visit(full);
  }
}

function createReviewPackage(runDir, outputPath = path.join(runDir, 'agent-review-package.zip')) {
  const files = collectPackageFiles(runDir);
  writeZip(outputPath, files);
  return { outputPath, files };
}

function writeZip(outputPath, files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const data = fs.readFileSync(file.absolutePath);
    const compressed = zlib.deflateRawSync(data, { level: 9 });
    const name = Buffer.from(file.archivePath.replace(/\\/g, '/'));
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, compressed);
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    central.push(centralHeader, name);
    offset += local.length + name.length + compressed.length;
  }
  const centralSize = central.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.concat([...chunks, ...central, end]));
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  return table;
})();

module.exports = {
  collectPackageFiles,
  createReviewPackage,
  shouldIncludePackageFile,
};
