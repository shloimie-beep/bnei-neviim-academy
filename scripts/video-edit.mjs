#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(repoRoot, '.env.local');
const kimiSecretPath = path.join(repoRoot, '.secrets', 'kimi-api-key.txt');
const generatedDir = path.join(repoRoot, 'src', 'remotion', 'generated');
const rendersDir = path.join(repoRoot, 'renders');

const ALLOWED_COMPOSITIONS = new Set(['BnaIntroPortrait', 'BnaIntroWide']);
const ALLOWED_TONES = new Set(['calm', 'forest', 'bold', 'warm', 'night']);

const DEFAULT_PROPS = {
  eyebrow: "Bnei Nevi'im Academy",
  headline: 'Torah learning built around responsibility',
  subheadline: 'A calm, relationship-based morning program for boys in Ramat Beit Shemesh.',
  callToAction: 'Book a visit',
  durationSeconds: 7,
  footerText: 'Ramat Beit Shemesh',
  showLogo: true,
  tone: 'calm',
};

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

function parseArgs(argv) {
  const options = {
    composition: '',
    outputPath: '',
    propsPath: '',
    render: true,
    json: false,
  };
  const promptParts = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--wide') {
      options.composition = 'BnaIntroWide';
    } else if (arg === '--portrait') {
      options.composition = 'BnaIntroPortrait';
    } else if (arg === '--no-render' || arg === '--dry-run') {
      options.render = false;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--composition') {
      options.composition = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--composition=')) {
      options.composition = arg.slice('--composition='.length);
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
    } else {
      promptParts.push(arg);
    }
  }

  return {
    options,
    prompt: promptParts.join(' ').trim(),
  };
}

function usage() {
  return [
    'Natural-language Remotion video editor',
    '',
    'Usage:',
    '  npm run video:edit -- "Make a warm 8 second vertical ad about forest learning"',
    '  npm run video:edit -- --wide "Make a YouTube intro about boys taking ownership"',
    '  npm run video:edit:dry -- "Change the CTA to Sign up today"',
    '',
    'Flags:',
    '  --portrait           Force BnaIntroPortrait',
    '  --wide               Force BnaIntroWide',
    '  --composition <id>   BnaIntroPortrait or BnaIntroWide',
    '  --out <path>         Render output path',
    '  --props <path>       Props JSON output path',
    '  --no-render          Write props only',
  ].join('\n');
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

async function callProvider(provider, prompt, forcedComposition) {
  const system = [
    'You convert natural-language video editing requests into safe Remotion render JSON.',
    'Return ONLY valid JSON. No markdown.',
    'Schema:',
    '{"composition":"BnaIntroPortrait|BnaIntroWide","props":{"eyebrow":"string","headline":"string","subheadline":"string","callToAction":"string","durationSeconds":number,"footerText":"string","showLogo":boolean,"tone":"calm|forest|bold|warm|night"},"notes":["string"]}',
    'Keep copy concise. Preserve Bnei Neviim Academy positioning as an alternative Torah learning environment, not an accredited school or clinical program.',
    'Use portrait for Reels, Shorts, WhatsApp status, Instagram, TikTok, vertical, or social ads.',
    'Use wide for YouTube, website headers, presentations, landscape, or horizontal.',
    'Duration must be between 3 and 30 seconds.',
    'If the user asks for forest/outdoor/nature, use tone forest.',
    'If the user asks for energetic/urgent/punchy, use tone bold.',
    'If the user asks for premium/calm/gentle, use tone calm or warm.',
    'If the user asks for dark/night, use tone night.',
  ].join(' ');

  const user = [
    `Current default props: ${JSON.stringify(DEFAULT_PROPS)}`,
    forcedComposition ? `Forced composition: ${forcedComposition}` : '',
    `User request: ${prompt}`,
  ].filter(Boolean).join('\n');

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: 900,
      ...(provider.name === 'kimi' ? { thinking: { type: 'disabled' } } : {}),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${provider.name} ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = extractText(data?.choices?.[0]?.message?.content);
  if (!text) throw new Error(`${provider.name} returned no content`);
  return parseJsonFromText(text);
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

async function getAiEdit(prompt, forcedComposition) {
  const providers = getProviders();
  const errors = [];

  for (const provider of providers) {
    try {
      const edit = await callProvider(provider, prompt, forcedComposition);
      return { edit, provider: provider.name, errors };
    } catch (error) {
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    edit: fallbackEdit(prompt, forcedComposition),
    provider: 'fallback',
    errors,
  };
}

function findLabeledValue(prompt, label) {
  const pattern = new RegExp(`(?:${label})\\s*:\\s*["']?([^"';\\n]+)`, 'i');
  const match = prompt.match(pattern);
  return match ? match[1].trim() : '';
}

function fallbackEdit(prompt, forcedComposition) {
  const lower = prompt.toLowerCase();
  const composition = forcedComposition ||
    (/\b(wide|youtube|horizontal|landscape|presentation|header)\b/.test(lower)
      ? 'BnaIntroWide'
      : 'BnaIntroPortrait');

  let tone = 'calm';
  if (/\b(forest|outdoor|nature|trees|green)\b/.test(lower)) tone = 'forest';
  if (/\b(bold|punchy|urgent|energetic|strong)\b/.test(lower)) tone = 'bold';
  if (/\b(warm|soft|gentle|cozy)\b/.test(lower)) tone = 'warm';
  if (/\b(night|dark|navy)\b/.test(lower)) tone = 'night';

  const secondsMatch = lower.match(/\b(\d{1,2})\s*(seconds?|secs?|s)\b/);
  const durationSeconds = secondsMatch ? Number(secondsMatch[1]) : DEFAULT_PROPS.durationSeconds;

  const props = {
    ...DEFAULT_PROPS,
    tone,
    durationSeconds,
    showLogo: !/\b(no logo|hide logo|without logo)\b/.test(lower),
  };

  const headline = findLabeledValue(prompt, 'headline');
  const subheadline = findLabeledValue(prompt, 'subheadline');
  const cta = findLabeledValue(prompt, 'cta|call to action');
  const eyebrow = findLabeledValue(prompt, 'eyebrow');

  if (headline) props.headline = headline;
  if (subheadline) props.subheadline = subheadline;
  if (cta) props.callToAction = cta;
  if (eyebrow) props.eyebrow = eyebrow;

  if (/\b(sign up|signup|register)\b/.test(lower)) props.callToAction = 'Sign up today';
  if (/\b(visit|tour)\b/.test(lower)) props.callToAction = 'Book a visit';
  if (/\b(adhd|attention|learn differently)\b/.test(lower)) {
    props.headline = 'A calmer Torah space for boys who learn differently';
    props.subheadline = 'Movement, relationship, and responsibility instead of pressure and shame.';
  }
  if (/\b(forest|outdoor|nature)\b/.test(lower)) {
    props.headline = 'Torah learning with fresh air and real life';
    props.subheadline = 'Forest mornings help the boys learn with movement, curiosity, and ownership.';
  }

  return {
    composition,
    props,
    notes: ['Used deterministic fallback parser. Add headline:, subheadline:, or cta: for precise edits.'],
  };
}

function sanitizeText(value, fallback, maxLength) {
  const text = String(value || fallback || '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
}

function sanitizeEdit(edit, options) {
  const requestedComposition = options.composition || edit?.composition || 'BnaIntroPortrait';
  const composition = ALLOWED_COMPOSITIONS.has(requestedComposition)
    ? requestedComposition
    : 'BnaIntroPortrait';

  const inputProps = edit?.props && typeof edit.props === 'object' ? edit.props : {};
  const tone = ALLOWED_TONES.has(inputProps.tone) ? inputProps.tone : DEFAULT_PROPS.tone;
  const rawDuration = Number(inputProps.durationSeconds || DEFAULT_PROPS.durationSeconds);

  return {
    composition,
    props: {
      eyebrow: sanitizeText(inputProps.eyebrow, DEFAULT_PROPS.eyebrow, 44),
      headline: sanitizeText(inputProps.headline, DEFAULT_PROPS.headline, 92),
      subheadline: sanitizeText(inputProps.subheadline, DEFAULT_PROPS.subheadline, 150),
      callToAction: sanitizeText(inputProps.callToAction, DEFAULT_PROPS.callToAction, 34),
      durationSeconds: Math.max(3, Math.min(30, Number.isFinite(rawDuration) ? rawDuration : 7)),
      footerText: sanitizeText(inputProps.footerText, DEFAULT_PROPS.footerText, 42),
      showLogo: inputProps.showLogo !== false,
      tone,
    },
    notes: Array.isArray(edit?.notes) ? edit.notes.map(String).slice(0, 6) : [],
  };
}

function timestampSlug() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
}

function relativeOrAbsolute(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
}

function renderVideo(composition, propsPath, outputPath) {
  const remotionCliPath = path.join(repoRoot, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  const relativePropsPath = path.relative(repoRoot, propsPath).replace(/\\/g, '/');
  const relativeOutputPath = path.relative(repoRoot, outputPath).replace(/\\/g, '/');
  const result = spawnSync(
    process.execPath,
    [
      remotionCliPath,
      'render',
      'src/remotion/index.ts',
      composition,
      relativeOutputPath,
      `--props=${relativePropsPath}`,
    ],
    {
      cwd: repoRoot,
      stdio: 'inherit',
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Remotion render failed with exit code ${result.status}`);
  }
}

loadEnvFile(envLocalPath);
loadLocalSecrets();

const { options, prompt } = parseArgs(process.argv.slice(2));
if (!prompt) {
  console.log(usage());
  process.exit(1);
}

fs.mkdirSync(generatedDir, { recursive: true });
fs.mkdirSync(rendersDir, { recursive: true });

const { edit, provider, errors } = await getAiEdit(prompt, options.composition);
const sanitized = sanitizeEdit(edit, options);
const slug = `${timestampSlug()}-${sanitized.composition === 'BnaIntroWide' ? 'wide' : 'portrait'}`;
const propsPath = relativeOrAbsolute(options.propsPath || path.join('src', 'remotion', 'generated', `${slug}.json`));
const outputPath = relativeOrAbsolute(options.outputPath || path.join('renders', `${slug}.mp4`));

fs.mkdirSync(path.dirname(propsPath), { recursive: true });
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(propsPath, `${JSON.stringify(sanitized.props, null, 2)}\n`);

const summary = {
  provider,
  composition: sanitized.composition,
  propsPath: path.relative(repoRoot, propsPath),
  outputPath: path.relative(repoRoot, outputPath),
  render: options.render,
  props: sanitized.props,
  notes: sanitized.notes,
  providerErrors: errors,
};

if (options.json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`Video edit provider: ${provider}`);
  console.log(`Composition: ${summary.composition}`);
  console.log(`Props: ${summary.propsPath}`);
  console.log(`Output: ${summary.outputPath}`);
  if (summary.notes.length) {
    console.log(`Notes: ${summary.notes.join(' ')}`);
  }
  if (errors.length) {
    console.log('AI provider fallback notes:');
    for (const error of errors) console.log(`- ${error}`);
  }
}

if (options.render) {
  renderVideo(sanitized.composition, propsPath, outputPath);
  if (!options.json) console.log(`Rendered video: ${summary.outputPath}`);
}
