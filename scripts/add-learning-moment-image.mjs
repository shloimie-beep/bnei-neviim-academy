import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicImageDir = path.join(repoRoot, 'public', 'images', 'learning-moments');
const feedPath = path.join(repoRoot, 'public', 'data', 'learning-moments.json');

function usage() {
  console.log([
    'Usage:',
    '  node scripts/add-learning-moment-image.mjs --source path/to/photo.jpg --title "Forest learning" --description "Short caption"',
    '',
    'Options:',
    '  --source       Required image path',
    '  --title        Card title',
    '  --description  Card description',
    '  --date         Display date, defaults to today',
    '  --alt          Image alt text, defaults to title',
  ].join('\n'));
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function sanitizeFileName(value) {
  return String(value || 'learning-moment')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'learning-moment';
}

function readFeed() {
  try {
    const parsed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

function writeFeed(feed) {
  fs.mkdirSync(path.dirname(feedPath), { recursive: true });
  fs.writeFileSync(feedPath, `${JSON.stringify(feed, null, 2)}\n`);
}

function optimizeImage(sourcePath, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  if (!ffmpegPath) {
    fs.copyFileSync(sourcePath, targetPath);
    return false;
  }
  const result = spawnSync(ffmpegPath, [
    '-y',
    '-i',
    sourcePath,
    '-vf',
    "scale='min(1600,iw)':-2",
    '-q:v',
    '4',
    targetPath,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (result.status === 0 && fs.existsSync(targetPath)) return true;
  fs.copyFileSync(sourcePath, targetPath);
  return false;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.source) {
  usage();
  process.exit(args.help ? 0 : 1);
}

const sourcePath = path.resolve(repoRoot, args.source);
if (!fs.existsSync(sourcePath)) {
  throw new Error(`Source image not found: ${sourcePath}`);
}

const title = String(args.title || path.basename(sourcePath, path.extname(sourcePath))).trim();
const date = String(args.date || new Date().toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})).trim();
const slug = sanitizeFileName(`${new Date().toISOString().slice(0, 10)}-${title}`);
const targetName = `${slug}-web.jpg`;
const targetPath = path.join(publicImageDir, targetName);
const optimized = optimizeImage(sourcePath, targetPath);
const publicSrc = `/images/learning-moments/${targetName}`;
const feed = readFeed();
const nextItem = {
  type: 'image',
  src: publicSrc,
  title,
  description: String(args.description || 'A Bnei Neviim Academy learning moment.').trim(),
  timestamp: date,
  alt: String(args.alt || title).trim(),
  addedAt: new Date().toISOString(),
};

feed.items = [
  nextItem,
  ...feed.items.filter((item) => item.src !== publicSrc),
].slice(0, 24);
writeFeed(feed);

console.log(JSON.stringify({
  success: true,
  optimized,
  image: publicSrc,
  feed: path.relative(repoRoot, feedPath).replace(/\\/g, '/'),
  item: nextItem,
}, null, 2));
