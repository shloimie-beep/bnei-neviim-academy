#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const publicAssetsRoot = path.join(repoRoot, 'public', 'organic-clip-assets');
const generatedDir = path.join(repoRoot, 'src', 'remotion', 'generated');
const rendersDir = path.join(repoRoot, 'renders');
const handoffRoot = path.join(rendersDir, 'capcut-handoffs');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg']);

function usage() {
  return [
    'BNA organic social clip factory',
    '',
    'Usage:',
    '  npm run video:clip-factory -- --source media-drop/organic-set --prompt "22s Torah learning reel with captions"',
    '  npm run video:clip-factory:dry -- --source media-drop/organic-set --capcut-pack --caption-file transcript.txt',
    '',
    'Flags:',
    '  --source <path>          Source file or folder of images/videos/audio',
    '  --prompt <text>          Clip direction/storyboard note',
    '  --duration <sec>         Total duration, default 22',
    '  --chunk-duration <sec>   Default still-image/media chunk duration, default 2',
    '  --final-duration <sec>   Final card duration, default 2',
    '  --title <text>           Opening/final title',
    '  --subtitle <text>        Final subtitle',
    '  --cta <text>             Final call to action',
    '  --caption <text>         Short caption/subtitle text',
    '  --caption-file <path>    Text file to split into timed captions',
    '  --music <path>           Background music/audio asset',
    '  --final-card-image <path> Optional final card/flyer image',
    '  --out <path>             Render output path',
    '  --props <path>           Props JSON output path',
    '  --capcut-pack            Write a CapCut handoff folder',
    '  --force                  Allow overwriting explicit --out/--props paths',
    '  --no-render              Write props/summary only',
    '  --json                   Print machine-readable summary',
  ].join('\n');
}

function parseArgs(argv) {
  const options = {
    sourcePath: '',
    prompt: '',
    durationSeconds: 22,
    chunkDurationSeconds: 2,
    finalDurationSeconds: 2,
    title: '',
    subtitle: '',
    cta: '',
    caption: '',
    captionFile: '',
    musicPath: '',
    finalCardImagePath: '',
    outputPath: '',
    propsPath: '',
    capcutPack: false,
    force: false,
    render: true,
    json: false,
  };
  const promptParts = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') {
      options.sourcePath = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--source=')) {
      options.sourcePath = arg.slice('--source='.length);
    } else if (arg === '--prompt') {
      options.prompt = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--prompt=')) {
      options.prompt = arg.slice('--prompt='.length);
    } else if (arg === '--duration') {
      options.durationSeconds = Number(argv[index + 1] || options.durationSeconds);
      index += 1;
    } else if (arg.startsWith('--duration=')) {
      options.durationSeconds = Number(arg.slice('--duration='.length));
    } else if (arg === '--chunk-duration') {
      options.chunkDurationSeconds = Number(argv[index + 1] || options.chunkDurationSeconds);
      index += 1;
    } else if (arg.startsWith('--chunk-duration=')) {
      options.chunkDurationSeconds = Number(arg.slice('--chunk-duration='.length));
    } else if (arg === '--final-duration') {
      options.finalDurationSeconds = Number(argv[index + 1] || options.finalDurationSeconds);
      index += 1;
    } else if (arg.startsWith('--final-duration=')) {
      options.finalDurationSeconds = Number(arg.slice('--final-duration='.length));
    } else if (arg === '--title') {
      options.title = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--title=')) {
      options.title = arg.slice('--title='.length);
    } else if (arg === '--subtitle') {
      options.subtitle = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--subtitle=')) {
      options.subtitle = arg.slice('--subtitle='.length);
    } else if (arg === '--cta') {
      options.cta = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--cta=')) {
      options.cta = arg.slice('--cta='.length);
    } else if (arg === '--caption') {
      options.caption = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--caption=')) {
      options.caption = arg.slice('--caption='.length);
    } else if (arg === '--caption-file') {
      options.captionFile = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--caption-file=')) {
      options.captionFile = arg.slice('--caption-file='.length);
    } else if (arg === '--music') {
      options.musicPath = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--music=')) {
      options.musicPath = arg.slice('--music='.length);
    } else if (arg === '--final-card-image') {
      options.finalCardImagePath = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--final-card-image=')) {
      options.finalCardImagePath = arg.slice('--final-card-image='.length);
    } else if (arg === '--out') {
      options.outputPath = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--out=')) {
      options.outputPath = arg.slice('--out='.length);
    } else if (arg === '--props') {
      options.propsPath = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--props=')) {
      options.propsPath = arg.slice('--props='.length);
    } else if (arg === '--capcut-pack') {
      options.capcutPack = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--no-render' || arg === '--dry-run') {
      options.render = false;
    } else if (arg === '--json') {
      options.json = true;
    } else {
      promptParts.push(arg);
    }
  }

  options.prompt = [options.prompt, promptParts.join(' ').trim()].filter(Boolean).join(' ').trim();
  return options;
}

function relativeOrAbsolute(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
}

function timestampSlug() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
}

function sanitizeFileName(value) {
  return String(value || 'asset')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90) || 'asset';
}

function clamp(value, min, max, fallback = min) {
  const number = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(number) ? number : fallback));
}

function isMediaFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext) || AUDIO_EXTENSIONS.has(ext);
}

function collectFiles(sourcePath) {
  const resolved = relativeOrAbsolute(sourcePath);
  if (!fs.existsSync(resolved)) throw new Error(`Source not found: ${sourcePath}`);
  const stat = fs.statSync(resolved);
  if (stat.isFile()) return [resolved].filter(isMediaFile);

  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const next = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(next);
      } else if (entry.isFile() && isMediaFile(next)) {
        files.push(next);
      }
    }
  };
  walk(resolved);
  return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

function mediaKind(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (AUDIO_EXTENSIONS.has(ext)) return 'audio';
  return 'other';
}

function copyAssetToPublic(sourcePath, assetDir, targetBase) {
  const extension = path.extname(sourcePath) || '.asset';
  const filename = `${sanitizeFileName(targetBase)}${extension}`;
  const targetPath = path.join(assetDir, filename);
  fs.copyFileSync(sourcePath, targetPath);
  return {
    publicPath: path.relative(path.join(repoRoot, 'public'), targetPath).replace(/\\/g, '/'),
    targetPath,
  };
}

function probeVideo(filePath) {
  if (!ffmpegPath) return { durationSeconds: 4, width: 1080, height: 1920 };
  const result = spawnSync(ffmpegPath, ['-hide_banner', '-i', filePath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const durationMatch = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const dimensionMatch = output.match(/,\s*(\d{2,5})x(\d{2,5})(?:[,\s]|$)/);
  const durationSeconds = durationMatch
    ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3])
    : 4;
  return {
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 4,
    width: dimensionMatch ? Number(dimensionMatch[1]) : 1080,
    height: dimensionMatch ? Number(dimensionMatch[2]) : 1920,
  };
}

function cleanText(value, maxLength = 160) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
}

function optionOrPromptValue(options, key, fallback) {
  if (options[key]) return cleanText(options[key], key === 'title' ? 80 : 140);
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = options.prompt.match(new RegExp(`\\b${escaped}\\s*:\\s*["']?([^"';\\n]+)`, 'i'));
  if (match) return cleanText(match[1], key === 'title' ? 80 : 140);
  return fallback;
}

function splitCaptionText(text, maxItems) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => cleanText(part, 118))
    .filter(Boolean)
    .slice(0, maxItems);
}

function loadCaptionText(options) {
  const parts = [];
  if (options.caption) parts.push(options.caption);
  if (options.captionFile) {
    const resolved = relativeOrAbsolute(options.captionFile);
    if (!fs.existsSync(resolved)) throw new Error(`Caption file not found: ${options.captionFile}`);
    parts.push(fs.readFileSync(resolved, 'utf8'));
  }
  return parts.join('\n').trim();
}

function buildCaptionOverlays(text, visualEndSec) {
  const chunks = splitCaptionText(text, 8);
  if (!chunks.length) return [];
  const start = 1.2;
  const usableDuration = Math.max(2, visualEndSec - start - 0.3);
  const slot = Math.max(1.6, Math.min(3.4, usableDuration / chunks.length));
  return chunks.map((chunk, index) => {
    const startSec = start + index * slot;
    return {
      startSec,
      endSec: Math.min(visualEndSec - 0.2, startSec + slot * 0.88),
      text: chunk,
      position: 'bottom',
      fontSize: 38,
    };
  }).filter((item) => item.endSec > item.startSec);
}

function buildStoryboard({ visualAssets, musicAsset, finalImageAsset, options }) {
  const durationSeconds = clamp(options.durationSeconds, 4, 180, 22);
  const finalDurationSeconds = clamp(options.finalDurationSeconds, 0.5, Math.min(8, durationSeconds / 2), 2);
  const visualEndSec = Math.max(0.5, durationSeconds - finalDurationSeconds);
  const chunkDurationSeconds = clamp(options.chunkDurationSeconds, 0.5, 12, 2);
  const title = optionOrPromptValue(options, 'title', "Bnei Nevi'im Academy");
  const subtitle = optionOrPromptValue(options, 'subtitle', 'Torah learning built around responsibility');
  const cta = optionOrPromptValue(options, 'cta', 'Message us to learn more');
  const mediaItems = [];
  let cursor = 0;

  if (!visualAssets.length) throw new Error('No image or video assets found in source.');

  for (let index = 0; cursor < visualEndSec; index += 1) {
    const asset = visualAssets[index % visualAssets.length];
    const remaining = visualEndSec - cursor;
    const itemDuration = Math.min(chunkDurationSeconds, remaining);
    if (itemDuration <= 0.05) break;

    const item = {
      type: asset.kind,
      src: asset.publicPath,
      startSec: Number(cursor.toFixed(3)),
      endSec: Number((cursor + itemDuration).toFixed(3)),
      fit: 'cover',
      label: asset.label,
      transition: index === 0 ? 'cut' : 'fade',
      zoom: asset.kind === 'image' ? 1.04 + (index % 3) * 0.015 : 1.02,
      focusXPercent: 50,
      focusYPercent: 50,
    };

    if (asset.kind === 'video') {
      const sourceStartSec = 0;
      const sourceEndSec = Math.min(asset.durationSeconds || itemDuration, itemDuration);
      item.sourceStartSec = Number(sourceStartSec.toFixed(3));
      item.sourceEndSec = Number(sourceEndSec.toFixed(3));
    }

    mediaItems.push(item);
    cursor += itemDuration;
  }

  const captions = buildCaptionOverlays(loadCaptionText(options), visualEndSec);
  const textOverlays = [
    {
      startSec: 0.25,
      endSec: Math.min(3.4, visualEndSec),
      text: title,
      position: 'top',
      fontSize: 54,
    },
  ];

  if (!captions.length && options.prompt) {
    textOverlays.push({
      startSec: Math.min(3.8, visualEndSec - 0.5),
      endSec: Math.min(6.6, visualEndSec),
      text: cleanText(options.prompt, 96),
      position: 'bottom',
      fontSize: 38,
      background: 'rgba(12,18,28,0.70)',
    });
  }

  return {
    durationSeconds,
    width: 1080,
    height: 1920,
    background: '#05070c',
    mediaItems,
    textOverlays: textOverlays.filter((item) => item.endSec > item.startSec),
    captions,
    audioTrack: musicAsset
      ? {
          src: musicAsset.publicPath,
          startSec: 0,
          endSec: durationSeconds,
          volume: 0.24,
        }
      : null,
    finalCard: {
      startSec: Number(visualEndSec.toFixed(3)),
      durationSeconds: finalDurationSeconds,
      title,
      subtitle,
      cta,
      imageSrc: finalImageAsset?.publicPath || undefined,
      background: '#111827',
    },
  };
}

function renderVideo(propsPath, outputPath, { quiet = false } = {}) {
  const remotionCliPath = path.join(repoRoot, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  const relativePropsPath = path.relative(repoRoot, propsPath).replace(/\\/g, '/');
  const relativeOutputPath = path.relative(repoRoot, outputPath).replace(/\\/g, '/');
  const result = spawnSync(
    process.execPath,
    [
      remotionCliPath,
      'render',
      'src/remotion/index.ts',
      'OrganicClipFactory',
      relativeOutputPath,
      `--props=${relativePropsPath}`,
    ],
    {
      cwd: repoRoot,
      stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      encoding: quiet ? 'utf8' : undefined,
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = quiet ? `: ${String(result.stderr || result.stdout || '').slice(0, 1200)}` : '';
    throw new Error(`Remotion render failed with exit code ${result.status}${detail}`);
  }
}

function writeCapCutHandoff({ handoffDir, sourceFiles, props, summary, prompt }) {
  const assetDir = path.join(handoffDir, 'assets');
  fs.mkdirSync(assetDir, { recursive: true });
  const assetRows = [];

  for (const filePath of sourceFiles) {
    const targetName = sanitizeFileName(path.basename(filePath));
    const targetPath = path.join(assetDir, targetName);
    fs.copyFileSync(filePath, targetPath);
    assetRows.push(`- ${path.relative(handoffDir, targetPath).replace(/\\/g, '/')}`);
  }

  const capcutPrompt = [
    'Create a 22-second vertical social clip for Bnei Neviim Academy using the assets in order.',
    'Use quick clean transitions, keep the Torah-learning/classroom energy natural, add readable captions near the bottom, and end with the final card copy.',
    props.audioTrack ? 'Use the included music lightly under the original feeling of the clip.' : 'Use an upbeat licensed rock-style background track if available.',
    `Opening/final title: ${props.finalCard?.title || "Bnei Nevi'im Academy"}`,
    `Final subtitle: ${props.finalCard?.subtitle || ''}`,
    `Final CTA: ${props.finalCard?.cta || ''}`,
    prompt ? `Operator direction: ${prompt}` : '',
  ].filter(Boolean).join('\n');

  const storyboardLines = [
    '# CapCut Handoff',
    '',
    `Render target: ${summary.outputPath}`,
    `Duration: ${props.durationSeconds}s`,
    '',
    '## Paste Prompt',
    '',
    capcutPrompt,
    '',
    '## Assets',
    '',
    ...assetRows,
    '',
    '## Timeline',
    '',
    ...props.mediaItems.map((item, index) => (
      `- ${index + 1}. ${item.startSec}s-${item.endSec}s: ${item.type} ${item.label || item.src}`
    )),
    '',
    '## Captions',
    '',
    ...(props.captions?.length ? props.captions.map((item) => `- ${item.startSec}s-${item.endSec}s: ${item.text}`) : ['- None supplied']),
    '',
    '## Final Card',
    '',
    `- Title: ${props.finalCard?.title || ''}`,
    `- Subtitle: ${props.finalCard?.subtitle || ''}`,
    `- CTA: ${props.finalCard?.cta || ''}`,
    '',
  ];

  fs.writeFileSync(path.join(handoffDir, 'storyboard.md'), `${storyboardLines.join('\n')}\n`);
  fs.writeFileSync(path.join(handoffDir, 'storyboard.json'), `${JSON.stringify({ props, summary, capcutPrompt }, null, 2)}\n`);
  fs.writeFileSync(path.join(handoffDir, 'prompt.txt'), `${capcutPrompt}\n`);
}

const options = parseArgs(process.argv.slice(2));
if (!options.sourcePath) {
  console.log(usage());
  process.exit(1);
}

const sourceFiles = collectFiles(options.sourcePath);
if (!sourceFiles.length) throw new Error(`No supported media files found under ${options.sourcePath}`);

fs.mkdirSync(publicAssetsRoot, { recursive: true });
fs.mkdirSync(generatedDir, { recursive: true });
fs.mkdirSync(rendersDir, { recursive: true });

const sourceBaseName = fs.statSync(relativeOrAbsolute(options.sourcePath)).isDirectory()
  ? path.basename(relativeOrAbsolute(options.sourcePath))
  : path.basename(relativeOrAbsolute(options.sourcePath), path.extname(relativeOrAbsolute(options.sourcePath)));
const slug = `${timestampSlug()}-${sanitizeFileName(sourceBaseName || 'organic-clip')}`;
const assetDir = path.join(publicAssetsRoot, slug);
fs.mkdirSync(assetDir, { recursive: true });

const copiedAssets = [];
for (const filePath of sourceFiles) {
  const kind = mediaKind(filePath);
  const base = `${String(copiedAssets.length + 1).padStart(2, '0')}-${path.basename(filePath, path.extname(filePath))}`;
  const copied = copyAssetToPublic(filePath, assetDir, base);
  const metadata = kind === 'video' ? probeVideo(filePath) : {};
  copiedAssets.push({
    kind,
    sourcePath: filePath,
    publicPath: copied.publicPath,
    targetPath: copied.targetPath,
    label: path.basename(filePath),
    ...metadata,
  });
}

let musicAsset = null;
if (options.musicPath) {
  const resolvedMusic = relativeOrAbsolute(options.musicPath);
  if (!fs.existsSync(resolvedMusic)) throw new Error(`Music file not found: ${options.musicPath}`);
  const copied = copyAssetToPublic(resolvedMusic, assetDir, 'background-music');
  musicAsset = { kind: 'audio', sourcePath: resolvedMusic, publicPath: copied.publicPath, targetPath: copied.targetPath, label: path.basename(resolvedMusic) };
} else {
  musicAsset = copiedAssets.find((asset) => asset.kind === 'audio') || null;
}

let finalImageAsset = null;
if (options.finalCardImagePath) {
  const resolvedImage = relativeOrAbsolute(options.finalCardImagePath);
  if (!fs.existsSync(resolvedImage)) throw new Error(`Final card image not found: ${options.finalCardImagePath}`);
  const copied = copyAssetToPublic(resolvedImage, assetDir, 'final-card-image');
  finalImageAsset = { kind: 'image', sourcePath: resolvedImage, publicPath: copied.publicPath, targetPath: copied.targetPath, label: path.basename(resolvedImage) };
}

const visualAssets = copiedAssets.filter((asset) => asset.kind === 'image' || asset.kind === 'video');
const props = buildStoryboard({ visualAssets, musicAsset, finalImageAsset, options });
const propsPath = relativeOrAbsolute(options.propsPath || path.join('src', 'remotion', 'generated', `${slug}.organic-clip.json`));
const outputPath = relativeOrAbsolute(options.outputPath || path.join('renders', `${slug}.mp4`));
const summaryPath = path.join(path.dirname(propsPath), `${path.basename(propsPath, path.extname(propsPath))}.summary.json`);

for (const explicitPath of [options.propsPath ? propsPath : '', options.outputPath ? outputPath : ''].filter(Boolean)) {
  if (fs.existsSync(explicitPath) && !options.force) {
    throw new Error(`Refusing to overwrite existing file without --force: ${path.relative(repoRoot, explicitPath)}`);
  }
}

fs.mkdirSync(path.dirname(propsPath), { recursive: true });
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(propsPath, `${JSON.stringify(props, null, 2)}\n`);

const summary = {
  composition: 'OrganicClipFactory',
  sourcePath: path.relative(repoRoot, relativeOrAbsolute(options.sourcePath)).replace(/\\/g, '/'),
  assetCount: copiedAssets.length,
  visualAssetCount: visualAssets.length,
  hasMusic: Boolean(musicAsset),
  capcutPack: options.capcutPack,
  prompt: options.prompt,
  propsPath: path.relative(repoRoot, propsPath).replace(/\\/g, '/'),
  summaryPath: path.relative(repoRoot, summaryPath).replace(/\\/g, '/'),
  outputPath: path.relative(repoRoot, outputPath).replace(/\\/g, '/'),
  render: options.render,
  durationSeconds: props.durationSeconds,
  mediaItems: props.mediaItems.length,
  captions: props.captions.length,
};
fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

let handoffDir = '';
if (options.capcutPack) {
  handoffDir = path.join(handoffRoot, slug);
  writeCapCutHandoff({ handoffDir, sourceFiles, props, summary, prompt: options.prompt });
  summary.capcutHandoffPath = path.relative(repoRoot, handoffDir).replace(/\\/g, '/');
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
}

if (!options.json) {
  console.log('Organic clip factory');
  console.log(`Source: ${summary.sourcePath}`);
  console.log(`Assets: ${summary.visualAssetCount} visual, ${summary.hasMusic ? 'music included' : 'no music'}`);
  console.log(`Props: ${summary.propsPath}`);
  console.log(`Output: ${summary.outputPath}`);
  console.log(`Duration: ${summary.durationSeconds}s`);
  if (summary.capcutHandoffPath) console.log(`CapCut handoff: ${summary.capcutHandoffPath}`);
}

if (options.render) {
  renderVideo(propsPath, outputPath, { quiet: options.json });
  if (!options.json) console.log(`Rendered video: ${summary.outputPath}`);
}

if (options.json) {
  console.log(JSON.stringify(summary, null, 2));
}
