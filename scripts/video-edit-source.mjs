#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const kimiSecretPath = path.join(repoRoot, '.secrets', 'kimi-api-key.txt');
const publicAssetsRoot = path.join(repoRoot, 'public', 'video-edit-assets');
const generatedDir = path.join(repoRoot, 'src', 'remotion', 'generated');
const rendersDir = path.join(repoRoot, 'renders');

const DEFAULT_MAX_DURATION_SECONDS = 180;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const separator = line.indexOf('=');
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadLocalSecrets() {
  if (!process.env.KIMI_API_KEY && fs.existsSync(kimiSecretPath)) {
    process.env.KIMI_API_KEY = fs.readFileSync(kimiSecretPath, 'utf8').trim();
  }
}

function usage() {
  return [
    'Natural-language source-video editor for Remotion',
    '',
    'Usage:',
    '  npm run video:edit:source -- --source media-inbox/clip.mp4 "From 3s to 8s speed up 2x, brighten it, add subtitle: Forest learning"',
    '  node scripts/video-edit-source.mjs --source path/to/video.mp4 --asset logo=path/to/logo.png "Put logo top right from 2s to 6s"',
    '',
    'Flags:',
    '  --source <path>       Source video to edit',
    '  --asset key=path      Optional image/audio asset reference, repeatable',
    '  --orientation <mode>  portrait, wide, square, or source',
    '  --out <path>          Render output path',
    '  --props <path>        Props JSON output path',
    '  --max-duration <sec>  Safety cap for generated render duration',
    '  --no-render           Write props only',
    '  --json                Print machine-readable summary',
  ].join('\n');
}

function parseArgs(argv) {
  const options = {
    sourcePath: '',
    outputPath: '',
    propsPath: '',
    summaryPath: '',
    render: true,
    json: false,
    maxDurationSeconds: DEFAULT_MAX_DURATION_SECONDS,
    orientation: '',
    assets: [],
  };
  const promptParts = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') {
      options.sourcePath = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--source=')) {
      options.sourcePath = arg.slice('--source='.length);
    } else if (arg === '--asset') {
      options.assets.push(argv[index + 1] || '');
      index += 1;
    } else if (arg.startsWith('--asset=')) {
      options.assets.push(arg.slice('--asset='.length));
    } else if (arg === '--orientation') {
      options.orientation = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--orientation=')) {
      options.orientation = arg.slice('--orientation='.length);
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
    } else if (arg === '--summary') {
      options.summaryPath = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--summary=')) {
      options.summaryPath = arg.slice('--summary='.length);
    } else if (arg === '--max-duration') {
      options.maxDurationSeconds = Number(argv[index + 1] || DEFAULT_MAX_DURATION_SECONDS);
      index += 1;
    } else if (arg.startsWith('--max-duration=')) {
      options.maxDurationSeconds = Number(arg.slice('--max-duration='.length));
    } else if (arg === '--no-render' || arg === '--dry-run') {
      options.render = false;
    } else if (arg === '--json') {
      options.json = true;
    } else {
      promptParts.push(arg);
    }
  }

  return {
    options,
    prompt: promptParts.join(' ').trim(),
  };
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function getProviders() {
  const providers = [];
  if (process.env.KIMI_API_KEY) {
    providers.push({
      name: 'kimi',
      apiKey: process.env.KIMI_API_KEY,
      baseUrl: trimTrailingSlash(process.env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1'),
      model: process.env.KIMI_MODEL || 'kimi-k2.7-code-highspeed',
    });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: trimTrailingSlash(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'),
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    });
  }
  return providers;
}

function extractText(content) {
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('').trim();
  }
  return '';
}

function parseJsonFromText(text) {
  const clean = String(text || '').trim();
  try {
    return JSON.parse(clean);
  } catch {}

  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in AI response');
  return JSON.parse(match[0]);
}

async function callProvider(provider, prompt, context) {
  const system = [
    'You convert natural-language video editing requests into a safe Remotion timeline JSON plan.',
    'Return ONLY valid JSON. No markdown.',
    'The user can ask for speed changes, cuts, zoom/focus, brightness/contrast, text overlays, subtitles, image overlays, audio overlays, and simple fade transitions.',
    'Use seconds for all times. If the user says "over here" or "this part" without exact times, infer a reasonable short segment but add a note saying timing needs review.',
    'Keep all text overlays short and in English unless the user explicitly asks otherwise.',
    'Allowed schema:',
    JSON.stringify({
      props: {
        orientation: 'portrait|wide|square|source',
        fit: 'cover|contain',
        sourceVolume: 1,
        globalZoom: 1,
        globalBrightness: 1,
        globalContrast: 1,
        segments: [
          {
            sourceStartSec: 0,
            sourceEndSec: 5,
            playbackRate: 1,
            zoom: 1,
            focusXPercent: 50,
            focusYPercent: 50,
            brightness: 1,
            contrast: 1,
            transition: 'cut|fade',
          },
        ],
        textOverlays: [{ startSec: 0, endSec: 3, text: 'short title', position: 'top|center|bottom' }],
        subtitles: [{ startSec: 1, endSec: 4, text: 'subtitle text', position: 'bottom' }],
        imageOverlays: [{ startSec: 2, endSec: 6, src: 'asset key or URL', xPercent: 80, yPercent: 20, widthPercent: 22, opacity: 1 }],
        audioOverlays: [{ startSec: 0, endSec: 10, src: 'asset key or URL', volume: 0.25 }],
      },
      notes: ['short note'],
    }),
  ].join(' ');

  const user = [
    `Source video metadata: ${JSON.stringify(context.sourceMetadata)}`,
    `Available asset keys: ${Object.keys(context.assetMap).join(', ') || 'none'}`,
    `Default orientation: ${context.defaultOrientation}`,
    `Max render duration seconds: ${context.maxDurationSeconds}`,
    '',
    `User edit request: ${prompt}`,
  ].join('\n');

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 1400,
      ...(provider.name === 'kimi' ? { thinking: { type: 'disabled' } } : {}),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${provider.name} ${response.status}: ${body.slice(0, 400)}`);
  }

  const data = await response.json();
  const text = extractText(data?.choices?.[0]?.message?.content);
  if (!text) throw new Error(`${provider.name} returned no content`);
  return parseJsonFromText(text);
}

async function getAiTimelineEdit(prompt, context) {
  const providers = getProviders();
  const errors = [];
  for (const provider of providers) {
    try {
      return {
        edit: await callProvider(provider, prompt, context),
        provider: provider.name,
        errors,
      };
    } catch (error) {
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return {
    edit: fallbackTimelineEdit(prompt, context),
    provider: 'fallback',
    errors,
  };
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

function relativeOrAbsolute(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
}

function probeVideo(filePath) {
  const result = spawnSync(ffmpegPath, ['-hide_banner', '-i', filePath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const durationMatch = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const dimensionMatch = output.match(/,\s*(\d{2,5})x(\d{2,5})(?:[,\s]|$)/);
  const durationSeconds = durationMatch
    ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3])
    : 15;
  return {
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 15,
    width: dimensionMatch ? Number(dimensionMatch[1]) : 1080,
    height: dimensionMatch ? Number(dimensionMatch[2]) : 1920,
  };
}

function copyAssetToPublic(sourcePath, assetDir, targetName) {
  const resolved = relativeOrAbsolute(sourcePath);
  if (!fs.existsSync(resolved)) throw new Error(`Asset not found: ${sourcePath}`);
  const extension = path.extname(resolved) || '.asset';
  const filename = `${sanitizeFileName(targetName)}${extension}`;
  const targetPath = path.join(assetDir, filename);
  fs.copyFileSync(resolved, targetPath);
  return path.relative(path.join(repoRoot, 'public'), targetPath).replace(/\\/g, '/');
}

function parseAssetArgs(assetArgs, assetDir) {
  const assetMap = {};
  let unnamedIndex = 1;
  for (const raw of assetArgs) {
    const text = String(raw || '').trim();
    if (!text) continue;
    const separator = text.indexOf('=');
    const key = separator > 0 ? sanitizeFileName(text.slice(0, separator)) : `asset${unnamedIndex++}`;
    const filePath = separator > 0 ? text.slice(separator + 1) : text;
    assetMap[key] = copyAssetToPublic(filePath, assetDir, key);
  }
  return assetMap;
}

function parseTime(value) {
  const text = String(value || '').trim();
  const colon = text.match(/^(\d+):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?$/);
  if (colon) {
    return colon[3]
      ? Number(colon[1]) * 3600 + Number(colon[2]) * 60 + Number(colon[3])
      : Number(colon[1]) * 60 + Number(colon[2]);
  }
  const numeric = text.match(/\d+(?:\.\d+)?/);
  return numeric ? Number(numeric[0]) : null;
}

function findRange(prompt, sourceDurationSeconds) {
  const text = String(prompt || '');
  const rangeMatch = text.match(/\b(?:from|between)\s+(\d+(?::\d{1,2})?(?::\d{1,2})?(?:\.\d+)?)\s*(?:s|sec|secs|seconds)?\s+(?:to|and|-)\s+(\d+(?::\d{1,2})?(?::\d{1,2})?(?:\.\d+)?)\s*(?:s|sec|secs|seconds)?/i);
  if (!rangeMatch) return null;
  const start = parseTime(rangeMatch[1]);
  const end = parseTime(rangeMatch[2]);
  if (start === null || end === null || end <= start) return null;
  return {
    startSec: Math.max(0, Math.min(start, sourceDurationSeconds)),
    endSec: Math.max(0.1, Math.min(end, sourceDurationSeconds)),
  };
}

function fallbackTimelineEdit(prompt, context) {
  const lower = prompt.toLowerCase();
  const sourceDuration = context.sourceMetadata.durationSeconds || 15;
  const range = findRange(prompt, sourceDuration);
  const speedMatch = lower.match(/\b(?:speed up|faster)\b[^\d]*(\d+(?:\.\d+)?)\s*x?|\b(\d+(?:\.\d+)?)\s*x\s*(?:speed|faster)/i);
  const speedRate = speedMatch ? Number(speedMatch[1] || speedMatch[2]) : 1;
  const wantsFade = /\b(fade|transition)\b/.test(lower);
  const wantsZoom = /\b(zoom|focus|crop)\b/.test(lower);
  const wantsBright = /\b(brighten|lighter|lighten|brighter)\b/.test(lower);
  const wantsDark = /\b(darker|darken)\b/.test(lower);
  const subtitleMatch = prompt.match(/\b(?:subtitle|caption|text)\s*:\s*["']?([^"'\n]+)/i);
  const titleMatch = prompt.match(/\b(?:title|overlay)\s*:\s*["']?([^"'\n]+)/i);

  const base = {
    playbackRate: 1,
    zoom: wantsZoom ? 1.12 : 1,
    focusXPercent: 50,
    focusYPercent: 50,
    brightness: wantsBright ? 1.14 : wantsDark ? 0.9 : 1,
    contrast: 1,
    transition: wantsFade ? 'fade' : 'cut',
  };

  const segments = [];
  if (range && speedRate > 0.25 && speedRate !== 1) {
    if (range.startSec > 0) {
      segments.push({ ...base, sourceStartSec: 0, sourceEndSec: range.startSec, transition: 'cut' });
    }
    segments.push({
      ...base,
      sourceStartSec: range.startSec,
      sourceEndSec: range.endSec,
      playbackRate: speedRate,
      transition: wantsFade ? 'fade' : 'cut',
    });
    if (range.endSec < sourceDuration) {
      segments.push({ ...base, sourceStartSec: range.endSec, sourceEndSec: sourceDuration, transition: 'cut' });
    }
  } else {
    segments.push({ ...base, sourceStartSec: 0, sourceEndSec: Math.min(sourceDuration, context.maxDurationSeconds) });
  }

  const subtitles = subtitleMatch
    ? [{ startSec: range?.startSec || 0, endSec: Math.min(range?.endSec || 5, sourceDuration), text: subtitleMatch[1].trim(), position: 'bottom' }]
    : [];
  const textOverlays = titleMatch
    ? [{ startSec: 0, endSec: Math.min(4, sourceDuration), text: titleMatch[1].trim(), position: 'center' }]
    : [];

  return {
    props: {
      orientation: context.defaultOrientation,
      fit: 'cover',
      sourceVolume: /\b(mute|silent|no original audio)\b/.test(lower) ? 0 : 1,
      globalZoom: 1,
      globalBrightness: 1,
      globalContrast: 1,
      segments,
      textOverlays,
      subtitles,
      imageOverlays: [],
      audioOverlays: [],
    },
    notes: ['Used deterministic fallback parser. Use exact times like "from 3s to 8s" for more precise edits.'],
  };
}

function clamp(value, min, max, fallback = min) {
  const number = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(number) ? number : fallback));
}

function orientationDimensions(orientation, metadata) {
  const normalized = String(orientation || '').toLowerCase();
  if (normalized === 'wide' || normalized === 'landscape') return { width: 1920, height: 1080, orientation: 'wide' };
  if (normalized === 'square') return { width: 1080, height: 1080, orientation: 'square' };
  if (normalized === 'source') {
    return {
      width: Math.max(320, Math.min(3840, metadata.width || 1080)),
      height: Math.max(320, Math.min(3840, metadata.height || 1920)),
      orientation: 'source',
    };
  }
  return { width: 1080, height: 1920, orientation: 'portrait' };
}

function inferOrientation(prompt, requested, metadata) {
  if (requested) return requested;
  const lower = prompt.toLowerCase();
  if (/\b(wide|landscape|horizontal|youtube|website header)\b/.test(lower)) return 'wide';
  if (/\b(square|instagram post)\b/.test(lower)) return 'square';
  if (/\b(source|same size|same dimensions)\b/.test(lower)) return 'source';
  if (metadata.width > metadata.height && !/\b(vertical|portrait|reel|short|story|status)\b/.test(lower)) return 'wide';
  return 'portrait';
}

function resolveAssetRef(src, assetMap) {
  const text = String(src || '').trim();
  if (!text) return '';
  if (assetMap[text]) return assetMap[text];
  if (/^https?:\/\//i.test(text)) return text;
  if (text.startsWith('video-edit-assets/')) return text;
  return '';
}

function sanitizeText(value, maxLength = 120) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
}

function sanitizeOverlayList(items, durationSeconds, mapper) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => mapper(item || {}, durationSeconds))
    .filter(Boolean)
    .slice(0, 20);
}

function sanitizeTimelineEdit(edit, context) {
  const rawProps = edit?.props && typeof edit.props === 'object' ? edit.props : {};
  const dimensions = orientationDimensions(rawProps.orientation || context.defaultOrientation, context.sourceMetadata);
  const sourceDuration = clamp(context.sourceMetadata.durationSeconds, 0.5, 3600, 15);
  const rawSegments = Array.isArray(rawProps.segments) && rawProps.segments.length
    ? rawProps.segments
    : [{ sourceStartSec: 0, sourceEndSec: sourceDuration, playbackRate: 1 }];

  const segments = rawSegments.map((segment) => {
    const sourceStartSec = clamp(segment.sourceStartSec ?? 0, 0, sourceDuration, 0);
    const sourceEndSec = clamp(segment.sourceEndSec ?? sourceDuration, sourceStartSec + 0.1, sourceDuration, sourceDuration);
    return {
      sourceStartSec,
      sourceEndSec,
      playbackRate: clamp(segment.playbackRate ?? 1, 0.25, 4, 1),
      zoom: clamp(segment.zoom ?? 1, 0.5, 3, 1),
      focusXPercent: clamp(segment.focusXPercent ?? 50, 0, 100, 50),
      focusYPercent: clamp(segment.focusYPercent ?? 50, 0, 100, 50),
      brightness: clamp(segment.brightness ?? 1, 0.2, 2, 1),
      contrast: clamp(segment.contrast ?? 1, 0.2, 2, 1),
      transition: segment.transition === 'fade' ? 'fade' : 'cut',
    };
  }).filter((segment) => segment.sourceEndSec > segment.sourceStartSec);

  const timelineDuration = segments.reduce((sum, segment) => {
    return sum + ((segment.sourceEndSec - segment.sourceStartSec) / segment.playbackRate);
  }, 0);
  const durationSeconds = clamp(
    rawProps.durationSeconds || timelineDuration || sourceDuration,
    0.5,
    context.maxDurationSeconds,
    Math.min(sourceDuration, context.maxDurationSeconds),
  );

  const textOverlays = sanitizeOverlayList(rawProps.textOverlays, durationSeconds, (item) => {
    const text = sanitizeText(item.text, 120);
    if (!text) return null;
    const startSec = clamp(item.startSec ?? 0, 0, durationSeconds, 0);
    const endSec = clamp(item.endSec ?? Math.min(durationSeconds, startSec + 3), startSec + 0.1, durationSeconds, Math.min(durationSeconds, startSec + 3));
    return {
      startSec,
      endSec,
      text,
      position: ['top', 'center', 'bottom'].includes(item.position) ? item.position : 'center',
      fontSize: item.fontSize ? clamp(item.fontSize, 18, 120, 58) : undefined,
      color: item.color || undefined,
      background: item.background || undefined,
    };
  });

  const subtitles = sanitizeOverlayList(rawProps.subtitles, durationSeconds, (item) => {
    const text = sanitizeText(item.text, 150);
    if (!text) return null;
    const startSec = clamp(item.startSec ?? 0, 0, durationSeconds, 0);
    const endSec = clamp(item.endSec ?? Math.min(durationSeconds, startSec + 3), startSec + 0.1, durationSeconds, Math.min(durationSeconds, startSec + 3));
    return {
      startSec,
      endSec,
      text,
      position: 'bottom',
      fontSize: item.fontSize ? clamp(item.fontSize, 18, 90, 42) : undefined,
    };
  });

  const imageOverlays = sanitizeOverlayList(rawProps.imageOverlays, durationSeconds, (item) => {
    const src = resolveAssetRef(item.src, context.assetMap);
    if (!src) return null;
    const startSec = clamp(item.startSec ?? 0, 0, durationSeconds, 0);
    const endSec = clamp(item.endSec ?? Math.min(durationSeconds, startSec + 3), startSec + 0.1, durationSeconds, Math.min(durationSeconds, startSec + 3));
    return {
      startSec,
      endSec,
      src,
      xPercent: clamp(item.xPercent ?? 50, 0, 100, 50),
      yPercent: clamp(item.yPercent ?? 50, 0, 100, 50),
      widthPercent: clamp(item.widthPercent ?? 28, 4, 100, 28),
      opacity: clamp(item.opacity ?? 1, 0, 1, 1),
    };
  });

  const audioOverlays = sanitizeOverlayList(rawProps.audioOverlays, durationSeconds, (item) => {
    const src = resolveAssetRef(item.src, context.assetMap);
    if (!src) return null;
    const startSec = clamp(item.startSec ?? 0, 0, durationSeconds, 0);
    const endSec = item.endSec === undefined ? undefined : clamp(item.endSec, startSec + 0.1, durationSeconds, durationSeconds);
    return {
      startSec,
      endSec,
      src,
      volume: clamp(item.volume ?? 0.35, 0, 2, 0.35),
    };
  });

  return {
    sourceVideo: context.sourceVideoPublicPath,
    sourceDurationSeconds: sourceDuration,
    durationSeconds,
    width: dimensions.width,
    height: dimensions.height,
    fit: rawProps.fit === 'contain' ? 'contain' : 'cover',
    background: rawProps.background || '#000000',
    sourceVolume: clamp(rawProps.sourceVolume ?? 1, 0, 2, 1),
    globalZoom: clamp(rawProps.globalZoom ?? 1, 0.5, 3, 1),
    globalBrightness: clamp(rawProps.globalBrightness ?? 1, 0.2, 2, 1),
    globalContrast: clamp(rawProps.globalContrast ?? 1, 0.2, 2, 1),
    segments,
    textOverlays,
    imageOverlays,
    audioOverlays,
    subtitles,
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
      'NaturalVideoEdit',
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

loadEnvFile(envLocalPath);
loadLocalSecrets();

const { options, prompt } = parseArgs(process.argv.slice(2));
if (!options.sourcePath || !prompt) {
  console.log(usage());
  process.exit(1);
}

const sourcePath = relativeOrAbsolute(options.sourcePath);
if (!fs.existsSync(sourcePath)) {
  throw new Error(`Source video not found: ${options.sourcePath}`);
}

fs.mkdirSync(publicAssetsRoot, { recursive: true });
fs.mkdirSync(generatedDir, { recursive: true });
fs.mkdirSync(rendersDir, { recursive: true });

const slug = `${timestampSlug()}-${sanitizeFileName(path.basename(sourcePath, path.extname(sourcePath)))}`;
const assetDir = path.join(publicAssetsRoot, slug);
fs.mkdirSync(assetDir, { recursive: true });

const sourceExtension = path.extname(sourcePath) || '.mp4';
const sourceVideoPublicPath = copyAssetToPublic(sourcePath, assetDir, `source${sourceExtension ? '' : '.mp4'}`);
const sourceMetadata = probeVideo(sourcePath);
const maxDurationSeconds = clamp(options.maxDurationSeconds, 1, 3600, DEFAULT_MAX_DURATION_SECONDS);
const defaultOrientation = inferOrientation(prompt, options.orientation, sourceMetadata);
const assetMap = parseAssetArgs(options.assets, assetDir);

const context = {
  sourceMetadata,
  sourceVideoPublicPath,
  assetMap,
  defaultOrientation,
  maxDurationSeconds,
};

const { edit, provider, errors } = await getAiTimelineEdit(prompt, context);
const props = sanitizeTimelineEdit(edit, context);

const propsPath = relativeOrAbsolute(options.propsPath || path.join('src', 'remotion', 'generated', `${slug}.source-edit.json`));
const outputPath = relativeOrAbsolute(options.outputPath || path.join('renders', `${slug}.mp4`));
const summaryPath = relativeOrAbsolute(options.summaryPath || path.join(path.dirname(propsPath), `${path.basename(propsPath, path.extname(propsPath))}.summary.json`));

fs.mkdirSync(path.dirname(propsPath), { recursive: true });
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(propsPath, `${JSON.stringify(props, null, 2)}\n`);

const summary = {
  provider,
  composition: 'NaturalVideoEdit',
  sourcePath: path.relative(repoRoot, sourcePath).replace(/\\/g, '/'),
  sourceVideoPublicPath,
  propsPath: path.relative(repoRoot, propsPath).replace(/\\/g, '/'),
  summaryPath: path.relative(repoRoot, summaryPath).replace(/\\/g, '/'),
  outputPath: path.relative(repoRoot, outputPath).replace(/\\/g, '/'),
  render: options.render,
  sourceMetadata,
  props,
  notes: Array.isArray(edit?.notes) ? edit.notes.map(String).slice(0, 8) : [],
  providerErrors: errors,
};
fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

if (!options.json) {
  console.log(`Video edit provider: ${provider}`);
  console.log(`Composition: ${summary.composition}`);
  console.log(`Source: ${summary.sourcePath}`);
  console.log(`Props: ${summary.propsPath}`);
  console.log(`Output: ${summary.outputPath}`);
  console.log(`Duration: ${summary.props.durationSeconds}s`);
  if (summary.notes.length) console.log(`Notes: ${summary.notes.join(' ')}`);
  if (errors.length) {
    console.log('AI provider fallback notes:');
    for (const error of errors) console.log(`- ${error}`);
  }
}

if (options.render) {
  renderVideo(propsPath, outputPath, { quiet: options.json });
  if (!options.json) console.log(`Rendered video: ${summary.outputPath}`);
}

if (options.json) {
  console.log(JSON.stringify(summary, null, 2));
}
